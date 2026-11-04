"""
STREETAIR AI Engine — Core Configuration
=========================================
Loads all settings from environment variables via Pydantic Settings.
No secrets are hard-coded here.
"""

from __future__ import annotations

from enum import Enum
from functools import lru_cache

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class ProviderName(str, Enum):
    GROQ = "groq"
    OLLAMA = "ollama"


class EmbeddingProvider(str, Enum):
    LOCAL = "local"
    OPENAI = "openai"


class VectorStoreProvider(str, Enum):
    CHROMADB = "chromadb"
    QDRANT = "qdrant"


class AQIStandard(str, Enum):
    CPCB_INDIA = "CPCB_INDIA"


class Environment(str, Enum):
    DEVELOPMENT = "development"
    STAGING = "staging"
    PRODUCTION = "production"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ---- Service ----
    ai_service_host: str = "0.0.0.0"
    ai_service_port: int = 8001
    ai_service_env: Environment = Environment.DEVELOPMENT
    ai_service_version: str = "1.0.0"
    ai_log_level: str = "INFO"

    # ---- Internal Security ----
    ai_internal_api_key: str = Field(..., description="Shared s2s bearer token (required)")

    # ---- Provider ----
    ai_default_provider: ProviderName = ProviderName.GROQ
    ai_enable_provider_fallback: bool = False
    ai_request_timeout_seconds: int = 45

    # ---- Groq ----
    groq_api_key: str = Field(default="", description="Groq Cloud API key")
    groq_model: str = "llama-3.3-70b-versatile"
    groq_max_tokens: int = 4096
    groq_temperature: float = 0.2

    # ---- Ollama ----
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "llama3.2:3b"
    ollama_timeout_seconds: int = 120

    # ---- Tavily ----
    tavily_api_key: str = Field(default="", description="Tavily API key")
    tavily_search_depth: str = "basic"
    tavily_max_results: int = 5
    tavily_timeout_seconds: int = 15

    # ---- Vector Store ----
    vector_store_provider: VectorStoreProvider = VectorStoreProvider.CHROMADB
    vector_store_path: str = "./data/vectorstore"
    qdrant_url: str = "http://localhost:6333"
    qdrant_api_key: str = ""

    # ---- Embeddings ----
    embedding_provider: EmbeddingProvider = EmbeddingProvider.LOCAL
    embedding_model: str = "all-MiniLM-L6-v2"

    # ---- CORS ----
    ai_cors_allowed_origins: str = ""

    # ---- Rate Limiting ----
    ai_rate_limit_requests_per_minute: int = 60

    # ---- AQI ----
    aqi_standard: AQIStandard = AQIStandard.CPCB_INDIA

    @field_validator("groq_temperature")
    @classmethod
    def _validate_temperature(cls, v: float) -> float:
        if not 0.0 <= v <= 2.0:
            raise ValueError("groq_temperature must be between 0.0 and 2.0")
        return v

    @property
    def cors_origins(self) -> list[str]:
        """Parse comma-separated CORS origins."""
        if not self.ai_cors_allowed_origins:
            return []
        return [o.strip() for o in self.ai_cors_allowed_origins.split(",") if o.strip()]

    @property
    def is_production(self) -> bool:
        return self.ai_service_env == Environment.PRODUCTION

    @property
    def groq_configured(self) -> bool:
        return bool(self.groq_api_key and self.groq_api_key != "REPLACE_WITH_GROQ_API_KEY")

    @property
    def ollama_configured(self) -> bool:
        return bool(self.ollama_base_url)

    @property
    def tavily_configured(self) -> bool:
        return bool(self.tavily_api_key and self.tavily_api_key != "REPLACE_WITH_TAVILY_API_KEY")


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return cached settings singleton. Call once at startup."""
    return Settings()  # type: ignore[call-arg]

