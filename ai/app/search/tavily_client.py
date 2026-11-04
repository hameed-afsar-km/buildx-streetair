"""
STREETAIR AI Engine — Tavily Search Client
===========================================
External server-side web research integration using Tavily API.
Preserves verifiable source titles, URLs, snippets, and domains.
Never fabricates citations.
"""

from __future__ import annotations

import urllib.parse
from datetime import UTC, datetime
from typing import Any

import httpx
from tenacity import retry, retry_if_exception_type, stop_after_attempt, wait_exponential

from app.core.config import get_settings
from app.core.logging import get_logger
from app.schemas.common import Citation

logger = get_logger(__name__)


class TavilySearchClient:
    """Async Tavily Search client using direct HTTP API or official SDK."""

    def __init__(self) -> None:
        self._settings = get_settings()
        self._api_key = self._settings.tavily_api_key
        self._timeout = self._settings.tavily_timeout_seconds
        self._base_url = "https://api.tavily.com/search"

    @property
    def is_configured(self) -> bool:
        return self._settings.tavily_configured

    @retry(
        retry=retry_if_exception_type((httpx.RequestError, httpx.HTTPStatusError)),
        stop=stop_after_attempt(2),
        wait=wait_exponential(multiplier=1, min=1, max=5),
        reraise=True,
    )
    async def search(
        self,
        query: str,
        max_results: int | None = None,
        search_depth: str | None = None,
        include_domains: list[str] | None = None,
        exclude_domains: list[str] | None = None,
    ) -> list[Citation]:
        """
        Execute an external web search. Returns real, un-fabricated Citation items.
        """
        if not self.is_configured:
            logger.info("tavily_search_skipped_not_configured")
            return []

        limit = max_results or self._settings.tavily_max_results
        depth = search_depth or self._settings.tavily_search_depth

        payload: dict[str, Any] = {
            "api_key": self._api_key,
            "query": query,
            "search_depth": depth,
            "max_results": limit,
            "include_answer": False,
            "include_raw_content": False,
        }
        if include_domains:
            payload["include_domains"] = include_domains
        if exclude_domains:
            payload["exclude_domains"] = exclude_domains

        logger.info("tavily_search_start", query=query, max_results=limit)
        async with httpx.AsyncClient(timeout=self._timeout) as client:
            resp = await client.post(self._base_url, json=payload)
            resp.raise_for_status()
            data = resp.json()

        raw_results = data.get("results", [])
        citations: list[Citation] = []
        now = datetime.now(UTC)

        for item in raw_results:
            url = item.get("url", "")
            domain = ""
            try:
                parsed = urllib.parse.urlparse(url)
                domain = parsed.netloc or ""
            except Exception:
                domain = "unknown"

            pub_date: datetime | None = None
            pub_raw = item.get("published_date")
            if pub_raw:
                try:
                    pub_date = datetime.fromisoformat(pub_raw.replace("Z", "+00:00"))
                except Exception:
                    pub_date = None

            citations.append(
                Citation(
                    title=item.get("title", "External Source"),
                    url=url,
                    published_at=pub_date,
                    retrieved_at=now,
                    source_domain=domain,
                    snippet=item.get("content", "")[:600],
                )
            )

        logger.info("tavily_search_complete", query=query, count=len(citations))
        return citations

