"""
STREETAIR AI Engine — Chat Orchestrator
=========================================
Coordinates intent routing, context building, RAG retrieval,
Tavily search, and LLM generation for the /internal/v1/chat endpoint.

Evidence classes (always preserved in response):
  1. Internal STREETAIR measurements (from backend-supplied context)
  2. RAG knowledge-base documents
  3. Tavily external web-search results
  4. Model-generated interpretation / recommendation
"""

from __future__ import annotations

import uuid
from datetime import UTC, datetime
from typing import Any

from app.core.config import get_settings
from app.core.errors import InsufficientDataError, ProviderError
from app.core.logging import get_logger
from app.providers.provider_manager import get_provider_manager
from app.schemas.chat import (
    ChatRequest,
    ChatResponse,
    EvidenceItem,
)
from app.schemas.common import (
    DataSourceType,
    DataTimeRange,
    EvidenceType,
    ProviderMetadata,
    ResponseMetadata,
    WarningFlags,
)

logger = get_logger(__name__)

# ---------------------------------------------------------------------------
# System prompt — STREETAIR assistant identity and rules
# ---------------------------------------------------------------------------
_SYSTEM_PROMPT = """You are the STREETAIR AI assistant, an environmental monitoring \
and air-quality intelligence system operating in India.

RULES YOU MUST FOLLOW:
1. Only use data explicitly provided in the context. Never invent measurements, \
   station readings, AQI values, or geographic facts.
2. MQ-135 raw ADC values are NOT pollutant concentrations. Never interpret or \
   present them as such.
3. Always identify whether data is from simulated or hardware sources.
4. Forecasts are model estimates, not observations. Always label them as such.
5. An anomaly or correlation is not proof of a pollution source or cause.
6. Never diagnose medical conditions or give personal medical advice.
7. Never claim a specific factory, person, or institution caused pollution \
   unless provided as independently verified fact.
8. If you cannot answer from the provided evidence, clearly say what is missing.
9. Keep answers factual, clear, and appropriately qualified.
10. This platform is primarily demonstrated in India. Use CPCB AQI standards \
    when discussing air quality indices.

Distinguish clearly between:
- Internal STREETAIR data (provided in context)
- Retrieved knowledge-base documents (RAG)
- External web sources (Tavily — clearly labeled)
- Your own interpretation or recommendations
"""


class ChatOrchestrator:
    """Orchestrates the full chat pipeline for a single request."""

    def __init__(self) -> None:
        self._settings = get_settings()
        self._provider_manager = get_provider_manager()

    async def process(self, request: ChatRequest) -> ChatResponse:
        """Process a chat request end-to-end."""
        request_id = request.request_id or str(uuid.uuid4())
        logger.info(
            "chat_request_start",
            request_id=request_id,
            org_id=request.org_id,
            enable_web_search=request.enable_web_search,
            enable_rag=request.enable_rag,
        )

        warnings = WarningFlags()
        evidence_items: list[EvidenceItem] = []
        web_citations = []
        rag_citations = []
        context_parts: list[str] = []

        # 1. Build internal data context
        station_ids: list[str] = []
        data_source_types: list[DataSourceType] = []
        data_time_range: DataTimeRange | None = None

        if request.station_context:
            ctx = request.station_context
            station_ids.append(ctx.station_id)
            data_source_types.append(ctx.data_source)

            if ctx.data_source == DataSourceType.SIMULATED:
                warnings.contains_simulated_data = True
            elif ctx.data_source == DataSourceType.HARDWARE:
                warnings.contains_hardware_data = True

            if ctx.readings:
                timestamps = [r.timestamp for r in ctx.readings if r.timestamp]
                if timestamps:
                    data_time_range = DataTimeRange(
                        start=min(timestamps),
                        end=max(timestamps),
                    )

                context_parts.append(self._format_station_context(ctx))
                evidence_items.append(
                    EvidenceItem(
                        evidence_type=EvidenceType.MEASUREMENT,
                        summary=f"{len(ctx.readings)} readings from station {ctx.station_id}",
                        source_label=f"STREETAIR Station {ctx.station_id}",
                        data_source=ctx.data_source,
                        timestamp=data_time_range.end if data_time_range else None,
                    )
                )

                # MQ-135 warning
                if any(r.mq135_raw is not None for r in ctx.readings):
                    warnings.mq135_raw_not_calibrated = True

        # 2. RAG retrieval
        if request.enable_rag:
            rag_context, retrieved_cits = await self._retrieve_rag(
                query=request.messages[-1].content,
            )
            if rag_context:
                context_parts.append(f"\n--- Knowledge Base ---\n{rag_context}")
                rag_citations.extend(retrieved_cits)

        # 3. Tavily web search
        if request.enable_web_search and self._settings.tavily_configured:
            web_context, citations = await self._web_search(
                query=request.messages[-1].content,
                org_id=request.org_id,
            )
            if web_context:
                context_parts.append(f"\n--- External Web Sources ---\n{web_context}")
                web_citations.extend(citations)
                warnings.external_web_sources_included = True
                evidence_items.append(
                    EvidenceItem(
                        evidence_type=EvidenceType.EXTERNAL_SOURCE,
                        summary=f"{len(citations)} web sources retrieved via Tavily",
                        source_label="Tavily Web Search",
                    )
                )

        # 4. Build messages for LLM
        combined_context = "\n".join(context_parts)
        messages = self._build_messages(request, combined_context)

        # 5. Generate LLM response
        try:
            provider_response = await self._provider_manager.generate(
                messages=messages,
                system_prompt=_SYSTEM_PROMPT,
                provider_preference=request.provider_preference,
            )
        except ProviderError as exc:
            logger.error("chat_provider_error", request_id=request_id, error=str(exc))
            raise

        provider_meta = ProviderMetadata(
            provider=provider_response.provider,  # type: ignore[arg-type]
            model=provider_response.model,
            latency_ms=provider_response.latency_ms,
            fallback_used=provider_response.fallback_used,
            tokens_used=provider_response.tokens_used,
        )

        logger.info(
            "chat_request_complete",
            request_id=request_id,
            provider=provider_response.provider,
            latency_ms=provider_response.latency_ms,
        )

        return ChatResponse(
            metadata=ResponseMetadata(
                request_id=request_id,
                generated_at=datetime.now(UTC),
                service_version=self._settings.ai_service_version,
            ),
            answer=provider_response.content,
            concise_summary=None,  # Could be extracted by a second LLM pass if needed
            evidence_items=evidence_items,
            web_citations=web_citations,
            rag_citations=rag_citations,
            data_time_range=data_time_range,
            station_ids=station_ids,
            data_source_types=list(set(data_source_types)),
            warnings=warnings,
            provider=provider_meta,
            follow_up_suggestions=[],
        )

    def _format_station_context(self, ctx: Any) -> str:
        """Format station context for injection into LLM prompt."""
        lines = [
            f"=== STREETAIR Data Context ===",
            f"Station: {ctx.station_id}",
            f"Data source: {ctx.data_source.value.upper()} "
            f"{'(NOT verified real-world measurements)' if ctx.data_source.value == 'simulated' else '(hardware sensor)'}",
        ]
        if ctx.station_name:
            lines.append(f"Station name: {ctx.station_name}")
        if ctx.location_name:
            lines.append(f"Location: {ctx.location_name}")

        if ctx.readings:
            latest = max(ctx.readings, key=lambda r: r.timestamp)
            lines.append(f"\nLatest reading ({latest.timestamp.isoformat()}):")
            if latest.pm25 is not None:
                lines.append(f"  PM2.5: {latest.pm25} µg/m³")
            if latest.pm10 is not None:
                lines.append(f"  PM10: {latest.pm10} µg/m³")
            if latest.pm1 is not None:
                lines.append(f"  PM1: {latest.pm1} µg/m³")
            if latest.temperature is not None:
                lines.append(f"  Temperature: {latest.temperature} °C")
            if latest.humidity is not None:
                lines.append(f"  Humidity: {latest.humidity} %RH")
            if latest.mq135_raw is not None:
                lines.append(
                    f"  MQ-135 raw: {latest.mq135_raw} (raw ADC — uncalibrated sensor value, NOT a pollutant concentration)"
                )
            lines.append(f"\nTotal readings in context: {len(ctx.readings)}")

        return "\n".join(lines)

    def _build_messages(
        self, request: ChatRequest, context: str
    ) -> list[dict[str, str]]:
        """Build the message list for the LLM, injecting context into the last user message."""
        messages = []
        for msg in request.messages[:-1]:
            messages.append({"role": msg.role.value, "content": msg.content})

        # Inject context into the final user message
        last_content = request.messages[-1].content
        if context:
            augmented = f"{context}\n\n---\nUser question: {last_content}"
        else:
            augmented = last_content

        messages.append({"role": "user", "content": augmented})
        return messages

    async def _retrieve_rag(
        self, query: str
    ) -> tuple[str, list[Any]]:
        """Retrieve relevant RAG chunks for the query."""
        try:
            from app.rag.retriever import retrieve_chunks
            chunks, citations = await retrieve_chunks(query=query, top_k=4)
            if not chunks:
                return "", []
            context = "\n\n".join(
                f"[Document: {c.document_title}]\n{chunk}"
                for c, chunk in zip(citations, chunks)
            )
            return context, citations
        except ImportError:
            logger.debug("rag_not_configured")
            return "", []
        except Exception as exc:
            logger.warning("rag_retrieval_failed", error=str(exc))
            return "", []

    async def _web_search(
        self, query: str, org_id: str
    ) -> tuple[str, list[Any]]:
        """Perform Tavily web search and return formatted context + citations."""
        try:
            from app.search.tavily_client import TavilySearchClient
            client = TavilySearchClient()
            citations = await client.search(query=query)
            if not citations:
                return "", []
            context = "\n\n".join(
                f"[{c.title} — {c.source_domain}]\n{c.snippet}"
                for c in citations
            )
            return context, citations
        except Exception as exc:
            logger.warning("web_search_failed", error=str(exc))
            return "", []

