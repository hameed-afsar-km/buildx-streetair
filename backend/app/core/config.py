"""
STREETAIR backend configuration.

All settings are loaded from environment variables or a .env file.
Access the singleton via: from app.core.config import settings
"""

from __future__ import annotations

from functools import cached_property
from typing import Any

from pydantic import Field, field_validator, computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application-wide settings loaded from environment / .env file."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # -------------------------------------------------------------------------
    # Application
    # -------------------------------------------------------------------------
    APP_ENV: str = Field(default="development", description="Runtime environment")
    DEBUG: bool = Field(default=False, description="Enable debug mode")

    # -------------------------------------------------------------------------
    # API Server
    # -------------------------------------------------------------------------
    API_HOST: str = Field(default="0.0.0.0", description="Bind host")
    API_PORT: int = Field(default=8000, description="Bind port")
    API_BASE_URL: str = Field(
        default="http://localhost:8000", description="Public base URL"
    )

    # -------------------------------------------------------------------------
    # Logging
    # -------------------------------------------------------------------------
    LOG_LEVEL: str = Field(default="INFO", description="Python log level name")

    # -------------------------------------------------------------------------
    # CORS
    # -------------------------------------------------------------------------
    CORS_ORIGINS: list[str] = Field(
        default=["http://localhost:3000"],
        description="Allowed CORS origins (comma-separated string in env)",
    )

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def _parse_cors_origins(cls, v: Any) -> list[str]:
        """Accept either a list or a comma-separated string."""
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    # -------------------------------------------------------------------------
    # Firebase / Firestore
    # -------------------------------------------------------------------------
    FIREBASE_PROJECT_ID: str = Field(
        default="streetair-dev", description="Firebase GCP project ID"
    )
    FIREBASE_CREDENTIALS_PATH: str | None = Field(
        default=None,
        description="Path to Firebase service-account JSON (omit to use ADC)",
    )
    FIREBASE_STORAGE_BUCKET: str | None = Field(
        default=None, description="Firebase Storage bucket name"
    )

    # -------------------------------------------------------------------------
    # AI Engine micro-service
    # -------------------------------------------------------------------------
    AI_ENGINE_URL: str = Field(
        default="http://localhost:8001", description="Base URL of the AI Engine service"
    )
    AI_ENGINE_SERVICE_TOKEN: str = Field(
        default="change-me", description="Shared bearer token for AI Engine calls"
    )

    # -------------------------------------------------------------------------
    # Device authentication
    # -------------------------------------------------------------------------
    DEVICE_AUTH_SECRET: str = Field(
        default="change-me-32-bytes",
        description="HMAC secret for device token generation/verification",
    )
    DEVICE_API_KEY: str = Field(default='streetair_secret_dev_key_2026', description='ESP32 Dev Key')

    # -------------------------------------------------------------------------
    # Rate limiting
    # -------------------------------------------------------------------------
    RATE_LIMIT_REQUESTS_PER_MINUTE: int = Field(
        default=60, description="General API rate limit (requests / minute)"
    )
    RATE_LIMIT_INGEST_PER_MINUTE: int = Field(
        default=30, description="Ingest endpoint rate limit (requests / minute)"
    )

    # -------------------------------------------------------------------------
    # Pagination
    # -------------------------------------------------------------------------
    DEFAULT_PAGE_SIZE: int = Field(default=20, description="Default result page size")
    MAX_PAGE_SIZE: int = Field(default=100, description="Maximum result page size")

    # -------------------------------------------------------------------------
    # Sensor validation thresholds
    # -------------------------------------------------------------------------
    PM1_MAX: float = Field(default=1500.0, description="Max valid PM1 µg/m³")
    PM25_MAX: float = Field(default=1500.0, description="Max valid PM2.5 µg/m³")
    PM10_MAX: float = Field(default=2000.0, description="Max valid PM10 µg/m³")
    MQ135_RAW_MAX: int = Field(default=4095, description="Max raw MQ-135 ADC value")

    TEMPERATURE_MIN: float = Field(default=-20.0, description="Min valid temperature °C")
    TEMPERATURE_MAX: float = Field(default=60.0, description="Max valid temperature °C")

    HUMIDITY_MIN: float = Field(default=0.0, description="Min valid relative humidity %")
    HUMIDITY_MAX: float = Field(default=100.0, description="Max valid relative humidity %")

    PRESSURE_MIN: float = Field(default=800.0, description="Min valid pressure hPa")
    PRESSURE_MAX: float = Field(default=1100.0, description="Max valid pressure hPa")

    # -------------------------------------------------------------------------
    # Timestamp skew tolerance
    # -------------------------------------------------------------------------
    MAX_TIMESTAMP_FUTURE_SKEW: int = Field(
        default=300,
        description="Seconds a device timestamp may be ahead of server time",
    )
    MAX_TIMESTAMP_PAST_SKEW: int = Field(
        default=86400,
        description="Seconds a device timestamp may be behind server time",
    )

    # -------------------------------------------------------------------------
    # WebSocket
    # -------------------------------------------------------------------------
    WS_HEARTBEAT_INTERVAL: int = Field(
        default=30, description="WebSocket heartbeat ping interval in seconds"
    )
    WS_MAX_CONNECTIONS_PER_USER: int = Field(
        default=5, description="Maximum concurrent WS connections per user"
    )

    # -------------------------------------------------------------------------
    # Alerting
    # -------------------------------------------------------------------------
    ALERT_COOLDOWN_SECONDS: int = Field(
        default=300,
        description="Minimum seconds between repeated alerts for the same device",
    )

    # -------------------------------------------------------------------------
    # MQTT
    # -------------------------------------------------------------------------
    MQTT_BROKER_URL: str = Field(
        default="mqtt://localhost:1883", description="MQTT broker connection URL"
    )
    MQTT_USERNAME: str = Field(default="", description="MQTT broker username")
    MQTT_PASSWORD: str = Field(default="", description="MQTT broker password")
    MQTT_TOPIC_PREFIX: str = Field(
        default="streetair/readings", description="Root MQTT topic prefix"
    )

    # -------------------------------------------------------------------------
    # Computed fields
    # -------------------------------------------------------------------------
    @computed_field  # type: ignore[prop-decorator]
    @cached_property
    def is_production(self) -> bool:
        """True when APP_ENV is exactly 'production'."""
        return self.APP_ENV == "production"


# ---------------------------------------------------------------------------
# Module-level singleton — import and use everywhere:
#   from app.core.config import settings
# ---------------------------------------------------------------------------
settings = Settings()
