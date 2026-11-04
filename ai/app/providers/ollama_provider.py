"""
STREETAIR AI Engine — Ollama Local Provider
============================================
Connects to a local Ollama instance using the OpenAI-compatible endpoint.
Model must be pre-pulled: `ollama pull <model_name>`
Never auto-downloads large models without explicit user action.
"""

from __future__ import annotations

import time

import httpx
from openai import AsyncOpenAI, APIConnectionError, APIStatusError
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


class OllamaProvider(BaseProvider):
    """Ollama local LLM provider using the OpenAI-compatible API."""

    def __init__(self) -> None:
        settings = get_settings()
        self._base_url = settings.ollama_base_url.rstrip("/")
        self._model = settings.ollama_model
        self._timeout = settings.ollama_timeout_seconds
        # Ollama exposes an OpenAI-compatible endpoint at /v1
        self._client = AsyncOpenAI(
            base_url=f"{self._base_url}/v1",
            api_key="ollama",   # Ollama requires a non-empty key; value is ignored
            timeout=self._timeout,
        )

    @property
    def name(self) -> str:
        return "ollama"

    @property
    def model(self) -> str:
        return self._model

    @retry(
        retry=retry_if_exception_type(APIConnectionError),
        stop=stop_after_attempt(2),
        wait=wait_exponential(multiplier=1, min=1, max=10),
        reraise=True,
    )
    async def generate(
        self,
        messages: list[dict[str, str]],
        system_prompt: str | None = None,
        max_tokens: int | None = None,
        temperature: float | None = None,
    ) -> ProviderResponse:
        """Generate a response via local Ollama."""
        full_messages: list[dict[str, str]] = []
        if system_prompt:
            full_messages.append({"role": "system", "content": system_prompt})
        full_messages.extend(messages)

        start = time.monotonic()
        try:
            response = await self._client.chat.completions.create(
                model=self._model,
                messages=full_messages,  # type: ignore[arg-type]
                max_tokens=max_tokens or 2048,
                temperature=temperature if temperature is not None else 0.2,
            )
        except APIConnectionError as exc:
            logger.error("ollama_connection_error", base_url=self._base_url, exc_info=True)
            raise ProviderUnavailableError(
                provider="ollama",
                message=(
                    f"Cannot connect to Ollama at {self._base_url}. "
                    "Ensure Ollama is running: `ollama serve`"
                ),
            ) from exc
        except APIStatusError as exc:
            if exc.status_code == 404:
                raise ProviderUnavailableError(
                    provider="ollama",
                    message=(
                        f"Model '{self._model}' not found in Ollama. "
                        f"Pull it first: `ollama pull {self._model}`"
                    ),
                ) from exc
            raise ProviderError(
                provider="ollama",
                message=f"Ollama API error {exc.status_code}: {exc.message}",
            ) from exc

        latency_ms = (time.monotonic() - start) * 1000
        choice = response.choices[0]
        content = choice.message.content or ""
        tokens = response.usage.total_tokens if response.usage else None

        logger.info(
            "ollama_generate_ok",
            model=self._model,
            latency_ms=round(latency_ms, 1),
            tokens=tokens,
        )

        return ProviderResponse(
            content=content,
            provider="ollama",
            model=self._model,
            latency_ms=round(latency_ms, 1),
            tokens_used=tokens,
            finish_reason=choice.finish_reason,
        )

    async def health_check(self) -> ProviderHealth:
        """Check Ollama availability by querying its /api/tags endpoint."""
        start = time.monotonic()
        try:
            async with httpx.AsyncClient(timeout=5) as client:
                r = await client.get(f"{self._base_url}/api/tags")
                r.raise_for_status()
                data = r.json()
            models = [m["name"] for m in data.get("models", [])]
            latency_ms = (time.monotonic() - start) * 1000

            if self._model not in models and not any(
                m.startswith(self._model.split(":")[0]) for m in models
            ):
                return ProviderHealth(
                    provider="ollama",
                    available=False,
                    model=self._model,
                    error=f"Model '{self._model}' not found. Available: {models}",
                )
            return ProviderHealth(
                provider="ollama",
                available=True,
                model=self._model,
                latency_ms=round(latency_ms, 1),
            )
        except Exception as exc:
            return ProviderHealth(
                provider="ollama",
                available=False,
                model=self._model,
                error=str(exc),
            )

