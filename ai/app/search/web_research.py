"""
STREETAIR AI Engine — Web Research Service
============================================
Orchestrates targeted web research for current external environmental facts,
regulations, and news via Tavily with authoritative domain preferences.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import UTC, datetime

from app.core.logging import get_logger
from app.schemas.common import Citation
from app.search.tavily_client import TavilySearchClient

logger = get_logger(__name__)

# Prefer authoritative governmental and international environmental domains
AUTHORITATIVE_DOMAINS = [
    "cpcb.nic.in",
    "moef.gov.in",
    "who.int",
    "epa.gov",
    "imd.gov.in",
    "delhi.gov.in",
    "hindustantimes.com",
    "thehindu.com",
    "indianexpress.com",
]


@dataclass
class WebResearchResult:
    query: str
    citations: list[Citation] = field(default_factory=list)
    retrieved_at: datetime = field(default_factory=lambda: datetime.now(UTC))
    summary_note: str = ""
    is_authoritative: bool = False


async def conduct_web_research(
    query: str,
    max_results: int = 4,
    prefer_authoritative: bool = True,
) -> WebResearchResult:
    """
    Search external web for environmental updates and return structured research results.
    """
    client = TavilySearchClient()
    if not client.is_configured:
        return WebResearchResult(
            query=query,
            summary_note="External web search is not configured or available.",
        )

    domains = AUTHORITATIVE_DOMAINS if prefer_authoritative else None
    try:
        citations = await client.search(
            query=query,
            max_results=max_results,
            include_domains=domains,
        )
        # If strict domains yielded no results, relax domain restrictions
        if not citations and prefer_authoritative:
            citations = await client.search(
                query=query,
                max_results=max_results,
            )

        note = f"Retrieved {len(citations)} external references via Tavily at {datetime.now(UTC).strftime('%Y-%m-%d %H:%M:%S UTC')}."
        return WebResearchResult(
            query=query,
            citations=citations,
            summary_note=note,
            is_authoritative=any(
                any(d in c.source_domain for d in AUTHORITATIVE_DOMAINS) for c in citations
            ),
        )
    except Exception as exc:
        logger.warning("web_research_failed", query=query, error=str(exc))
        return WebResearchResult(
            query=query,
            summary_note=f"External research failed or timed out: {exc}",
        )

