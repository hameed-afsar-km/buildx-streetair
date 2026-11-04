"""
STREETAIR AI Engine — Groq Cloud Provider
==========================================
Uses the official Groq SDK. API key is read from environment only.
Never logs or returns the API key.
"""

from __future__ import annotations

import time
from typing import Any

import groq
from tenacity import (
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
)

from app.core.config import get_settings
from app.core.errors import ProviderError, ProviderUnavailableError
from app.core.logging import get_logger
from app.providers.base import BaseProvider, ProviderHealth, ProviderResponse

logger = get_logger(__name__)


class GroqProvider(BaseProvider):
    """Groq Cloud LLM provider implementation."""

    def __init__(self) -> None:
        settings = get_settings()
        if not settings.groq_configured:
            raise ProviderUnavailableError(
                provider="groq",
                message="Groq API key is not configured. Set GROQ_API_KEY in environment.",
            )
        self._client = groq.AsyncGroq(api_key=settings.groq_api_key)
        self._model = settings.groq_model
        self._max_tokens = settings.groq_max_tokens
        self._temperature = settings.groq_temperature
        self._timeout = settings.ai_request_timeout_seconds

    @property
    def name(self) -> str:
        return "groq"

    @property
    def model(self) -> str:
        return self._model

    @retry(
        retry=retry_if_exception_type((groq.RateLimitError, groq.APIConnectionError)),
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=30),
        reraise=True,
    )
    async def generate(
        self,
        messages: list[dict[str, str]],
        system_prompt: str | None = None,
        max_tokens: int | None = None,
        temperature: float | None = None,
    ) -> ProviderResponse:
        """Generate a response via Groq Cloud API."""
        full_messages: list[dict[str, Any]] = []
        if system_prompt:
            full_messages.append({"role": "system", "content": system_prompt})
        full_messages.extend(messages)

        effective_max_tokens = max_tokens or self._max_tokens
        effective_temperature = temperature if temperature is not None else self._temperature

        start = time.monotonic()
        try:
            response = await self._client.chat.completions.create(
                model=self._model,
                messages=full_messages,  # type: ignore[arg-type]
                max_tokens=effective_max_tokens,
                temperature=effective_temperature,
                timeout=self._timeout,
            )
        except groq.RateLimitError as exc:
            logger.warning("groq_rate_limit", model=self._model)
            raise ProviderError(provider="groq", message=f"Groq rate limit exceeded: {exc}") from exc
        except groq.APIConnectionError as exc:
            logger.error("groq_connection_error", exc_info=True)
            raise ProviderUnavailableError(
                provider="groq", message=f"Groq connection failed: {exc}"
            ) from exc
        except groq.APIStatusError as exc:
            logger.error("groq_api_error", status_code=exc.status_code, exc_info=True)
            raise ProviderError(
                provider="groq", message=f"Groq API error {exc.status_code}: {exc.message}"
            ) from exc

        latency_ms = (time.monotonic() - start) * 1000
        choice = response.choices[0]
        content = choice.message.content or ""
        tokens = response.usage.total_tokens if response.usage else None

        logger.info(
            "groq_generate_ok",
            model=self._model,
            latency_ms=round(latency_ms, 1),
            tokens=tokens,
            finish_reason=choice.finish_reason,
        )

        return ProviderResponse(
            content=content,
            provider="groq",
            model=self._model,
            latency_ms=round(latency_ms, 1),
            tokens_used=tokens,
            finish_reason=choice.finish_reason,
        )

    async def health_check(self) -> ProviderHealth:
        """Ping Groq with a minimal request to verify availability."""
        start = time.monotonic()
        try:
            response = await self._client.chat.completions.create(
                model=self._model,
                messages=[{"role": "user", "content": "ping"}],
                max_tokens=1,
                timeout=10,
            )
            latency_ms = (time.monotonic() - start) * 1000
            return ProviderHealth(
                provider="groq",
                available=True,
                model=self._model,
                latency_ms=round(latency_ms, 1),
            )
        except Exception as exc:
            return ProviderHealth(
                provider="groq",
                available=False,
                model=self._model,
                error=str(exc),
            )

