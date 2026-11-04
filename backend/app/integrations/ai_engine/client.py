"""
AI Engine integration client.
The backend calls this internal service; the frontend never calls it directly.
Provider keys (Groq, Ollama, Tavily) stay in the AI service environment.
"""
from __future__ import annotations
import logging
from datetime import datetime, timezone
from typing import Any

import httpx

from app.core.config import settings
from app.core.exceptions import AIEngineError, ServiceUnavailableError

logger = logging.getLogger(__name__)

ALLOWED_PROVIDERS = {"groq", "ollama"}
TIMEOUT_SECONDS = 60.0
FORECAST_TIMEOUT = 120.0


class AIEngineClient:
    """HTTP client for the internal AI engine service."""

    def __init__(self):
        self.base_url = settings.AI_ENGINE_URL
        self.token = settings.AI_ENGINE_SERVICE_TOKEN
        self._headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json",
            "X-Service": "streetair-backend",
        }

    def _client(self, timeout: float = TIMEOUT_SECONDS) -> httpx.AsyncClient:
        return httpx.AsyncClient(
            base_url=self.base_url,
            headers=self._headers,
            timeout=timeout,
        )

    def _validate_provider(self, provider: str) -> str:
        if provider not in ALLOWED_PROVIDERS:
            raise AIEngineError(
                f"Provider '{provider}' is not allowed. Allowed: {ALLOWED_PROVIDERS}"
            )
        return provider

    async def chat(
        self,
        message: str,
        provider: str,
        conversation_id: str | None,
        history: list[dict],
        station_context: dict | None,
        request_id: str,
    ) -> dict:
        """POST /internal/v1/chat"""
        self._validate_provider(provider)
        
        # Build messages payload for AI Engine schema
        messages_list = []
        for h in history:
            role = h.get("role", "user")
            content = h.get("content", "")
            if content:
                messages_list.append({"role": role, "content": content})
        messages_list.append({"role": "user", "content": message})

        st_ctx = None
        if station_context and station_context.get("station_id"):
            st_ctx = {
                "station_id": station_context.get("station_id"),
                "station_name": station_context.get("station_name"),
                "readings": station_context.get("readings", []),
                "data_source": station_context.get("data_source", "simulated"),
            }

        payload = {
            "request_id": request_id,
            "correlation_id": conversation_id,
            "org_id": "streetair_org",
            "user_id": "streetair_user",
            "provider_preference": provider,
            "messages": messages_list,
            "station_context": st_ctx,
            "enable_web_search": False,
            "enable_rag": True,
        }
        try:
            async with self._client() as client:
                response = await client.post("/internal/v1/chat", json=payload)
                response.raise_for_status()
                raw = response.json()
                
                # Transform AI engine response schema to backend expectation
                citations = []
                for rc in raw.get("rag_citations", []):
                    citations.append({
                        "title": rc.get("document_title") or rc.get("title") or "RAG Reference",
                        "url": rc.get("url") or "#",
                        "date": None,
                        "source_type": "rag",
                    })
                for wc in raw.get("web_citations", []):
                    citations.append({
                        "title": wc.get("title") or "Web Search",
                        "url": wc.get("url") or "#",
                        "date": wc.get("published_date"),
                        "source_type": "tavily",
                    })

                return {
                    "content": raw.get("answer", ""),
                    "provider": raw.get("provider", {}).get("name", provider) if isinstance(raw.get("provider"), dict) else provider,
                    "model": raw.get("provider", {}).get("model") if isinstance(raw.get("provider"), dict) else None,
                    "citations": citations,
                    "message_id": raw.get("metadata", {}).get("request_id", request_id) if isinstance(raw.get("metadata"), dict) else request_id,
                }
        except httpx.TimeoutException:
            logger.error("AI engine chat timeout", extra={"request_id": request_id})
            raise ServiceUnavailableError("AI service timed out. Please try again.")
        except httpx.HTTPStatusError as e:
            logger.error("AI engine chat error", extra={"status": e.response.status_code})
            raise AIEngineError(f"AI service returned error: {e.response.status_code}")
        except httpx.RequestError as e:
            logger.error("AI engine connection error", exc_info=True)
            raise ServiceUnavailableError("AI service is unavailable.")

    async def forecast(
        self,
        station_id: str,
        pollutant: str,
        readings_window: list[dict],
        horizon_hours: int,
        request_id: str,
    ) -> dict:
        """POST /internal/v1/forecast"""
        payload = {
            "station_id": station_id,
            "pollutant": pollutant,
            "readings_window": readings_window,
            "horizon_hours": horizon_hours,
            "request_id": request_id,
        }
        try:
            async with self._client(timeout=FORECAST_TIMEOUT) as client:
                response = await client.post("/internal/v1/forecast", json=payload)
                response.raise_for_status()
                return response.json()
        except httpx.TimeoutException:
            raise ServiceUnavailableError("Forecast service timed out.")
        except (httpx.HTTPStatusError, httpx.RequestError) as e:
            raise AIEngineError(f"Forecast service error: {e}")

    async def detect_anomaly(
        self,
        station_id: str,
        readings: list[dict],
        request_id: str,
    ) -> dict:
        """POST /internal/v1/anomaly-detection"""
        payload = {
            "station_id": station_id,
            "readings": readings,
            "request_id": request_id,
        }
        try:
            async with self._client() as client:
                response = await client.post("/internal/v1/anomaly-detection", json=payload)
                response.raise_for_status()
                return response.json()
        except (httpx.TimeoutException, httpx.HTTPStatusError, httpx.RequestError) as e:
            logger.warning("Anomaly detection unavailable", exc_info=True)
            return {"anomaly_detected": False, "error": "Service unavailable", "skipped": True}

    async def classify_report(
        self,
        description: str,
        category: str,
        request_id: str,
    ) -> dict:
        """POST /internal/v1/report-classification"""
        payload = {
            "description": description,
            "category": category,
            "request_id": request_id,
        }
        try:
            async with self._client() as client:
                response = await client.post("/internal/v1/report-classification", json=payload)
                response.raise_for_status()
                return response.json()
        except Exception:
            logger.warning("Report classification unavailable", exc_info=True)
            return {"classification": None, "skipped": True}

    async def get_scenarios(self) -> dict:
        """GET /internal/v1/scenarios — get nine demonstration scenario definitions."""
        try:
            async with self._client() as client:
                response = await client.get("/internal/v1/scenarios")
                response.raise_for_status()
                return response.json()
        except Exception:
            logger.warning("Scenarios endpoint unavailable, using local definitions")
            return {"scenarios": [], "skipped": True}

    async def health_check(self) -> dict:
        """Check AI engine health."""
        try:
            async with self._client(timeout=5.0) as client:
                response = await client.get("/health")
                return {"status": "healthy", "code": response.status_code}
        except Exception:
            return {"status": "unavailable"}


# Singleton instance
ai_engine_client = AIEngineClient()
