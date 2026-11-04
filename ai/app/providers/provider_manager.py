"""
STREETAIR AI Engine — Provider Manager
========================================
Selects, initializes, and manages LLM providers.
Enforces transparent fallback policy and accurate provider attribution.
"""

from __future__ import annotations

from app.core.config import ProviderName, get_settings
from app.core.errors import ProviderError, ProviderUnavailableError
from app.core.logging import get_logger
from app.providers.base import BaseProvider, ProviderHealth, ProviderResponse

logger = get_logger(__name__)


class ProviderManager:
    """
    Manages provider selection and optional fallback.

    Fallback policy (when AI_ENABLE_PROVIDER_FALLBACK=true):
      - Primary = groq  → fallback = ollama
      - Primary = ollama → fallback = groq
    Provider identity is always accurately reported in responses.
    """

    def __init__(self) -> None:
        self._settings = get_settings()
        self._providers: dict[str, BaseProvider] = {}
        self._initialize_providers()

    def _initialize_providers(self) -> None:
        """Lazily import and initialize available providers."""
        # Import here to avoid importing provider SDKs when not configured
        if self._settings.groq_configured:
            try:
                from app.providers.groq_provider import GroqProvider
                self._providers[ProviderName.GROQ] = GroqProvider()
                logger.info("provider_initialized", provider="groq", model=self._settings.groq_model)
            except Exception as exc:
                logger.warning("provider_init_failed", provider="groq", error=str(exc))

        try:
            from app.providers.ollama_provider import OllamaProvider
            self._providers[ProviderName.OLLAMA] = OllamaProvider()
            logger.info("provider_initialized", provider="ollama", model=self._settings.ollama_model)
        except Exception as exc:
            logger.warning("provider_init_failed", provider="ollama", error=str(exc))

    def get_provider(self, name: ProviderName | str | None = None) -> BaseProvider:
        """
        Return the requested provider, or the configured default.

        Raises ProviderUnavailableError if the provider is not configured.
        """
        effective_name = ProviderName(name) if name else self._settings.ai_default_provider
        if effective_name not in self._providers:
            raise ProviderUnavailableError(
                provider=str(effective_name),
                message=(
                    f"Provider '{effective_name}' is not available. "
                    "Check configuration and ensure the service is running."
                ),
            )
        return self._providers[effective_name]

    async def generate(
        self,
        messages: list[dict[str, str]],
        system_prompt: str | None = None,
        provider_preference: str | None = None,
        max_tokens: int | None = None,
        temperature: float | None = None,
    ) -> ProviderResponse:
        """
        Generate a response using the requested or default provider.
        If fallback is enabled and primary fails, tries secondary.
        Always records which provider was actually used.
        """
        primary_name = (
            ProviderName(provider_preference)
            if provider_preference
            else self._settings.ai_default_provider
        )

        try:
            primary = self.get_provider(primary_name)
            return await primary.generate(messages, system_prompt, max_tokens, temperature)
        except (ProviderError, ProviderUnavailableError) as primary_exc:
            if not self._settings.ai_enable_provider_fallback:
                raise

            # Determine fallback
            fallback_name = (
                ProviderName.OLLAMA
                if primary_name == ProviderName.GROQ
                else ProviderName.GROQ
            )
            logger.warning(
                "provider_fallback_triggered",
                primary=primary_name,
                fallback=fallback_name,
                reason=str(primary_exc),
            )

            try:
                fallback = self.get_provider(fallback_name)
                response = await fallback.generate(messages, system_prompt, max_tokens, temperature)
                response.fallback_used = True
                return response
            except (ProviderError, ProviderUnavailableError) as fallback_exc:
                logger.error(
                    "provider_fallback_also_failed",
                    primary=primary_name,
                    fallback=fallback_name,
                    fallback_error=str(fallback_exc),
                )
                raise primary_exc  # Re-raise original error

    async def health_check_all(self) -> list[ProviderHealth]:
        """Return health status for all initialized providers."""
        results = []
        for provider in self._providers.values():
            results.append(await provider.health_check())
        return results


# Module-level singleton — initialized once at startup
_manager: ProviderManager | None = None


def get_provider_manager() -> ProviderManager:
    """Return the module-level ProviderManager singleton."""
    global _manager
    if _manager is None:
        _manager = ProviderManager()
    return _manager

