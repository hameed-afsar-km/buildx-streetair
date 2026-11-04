"""
STREETAIR AI Engine — Provider Base Interface
==============================================
All LLM providers must implement this interface.
Application code must only depend on this base; never on provider-specific SDKs.
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any


@dataclass
class ProviderResponse:
    """Structured response from any LLM provider."""

    content: str
    provider: str
    model: str
    latency_ms: float
    tokens_used: int | None = None
    finish_reason: str | None = None
    fallback_used: bool = False
    raw_metadata: dict[str, Any] | None = None


@dataclass
class ProviderHealth:
    """Health/availability status of a provider."""

    provider: str
    available: bool
    model: str | None = None
    latency_ms: float | None = None
    error: str | None = None


class BaseProvider(ABC):
    """Abstract base class for LLM provider implementations."""

    @property
    @abstractmethod
    def name(self) -> str:
        """Canonical provider name: 'groq' | 'ollama'."""
        ...

    @property
    @abstractmethod
    def model(self) -> str:
        """Currently configured model identifier."""
        ...

    @abstractmethod
    async def generate(
        self,
        messages: list[dict[str, str]],
        system_prompt: str | None = None,
        max_tokens: int | None = None,
        temperature: float | None = None,
    ) -> ProviderResponse:
        """
        Generate a response from the provider.

        Args:
            messages: List of {"role": ..., "content": ...} dicts.
            system_prompt: Optional system instruction.
            max_tokens: Override max output tokens.
            temperature: Override sampling temperature.

        Returns:
            ProviderResponse with content and metadata.

        Raises:
            ProviderUnavailableError: If the provider is not reachable.
            ProviderError: For other provider-side failures.
        """
        ...

    @abstractmethod
    async def health_check(self) -> ProviderHealth:
        """
        Check provider availability without exposing credentials.

        Returns:
            ProviderHealth indicating availability and latency.
        """
        ...

