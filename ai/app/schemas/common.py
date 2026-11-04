"""
STREETAIR AI Engine — Common Pydantic Schemas
==============================================
Shared types used across all request/response schemas.
"""

from __future__ import annotations

from datetime import UTC, datetime
from enum import Enum
from typing import Any, Literal
from uuid import uuid4

from pydantic import BaseModel, Field, field_validator


# ---------------------------------------------------------------------------
# Enumerations
# ---------------------------------------------------------------------------


class DataSourceType(str, Enum):
    SIMULATED = "simulated"
    HARDWARE = "hardware"
    MIXED = "mixed"
    UNKNOWN = "unknown"


class ProviderName(str, Enum):
    GROQ = "groq"
    OLLAMA = "ollama"


class AnomalySeverity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class EvidenceType(str, Enum):
    MEASUREMENT = "measurement"
    ANOMALY = "anomaly"
    COMMUNITY_REPORT = "community_report"
    EXTERNAL_SOURCE = "external_source"
    RAG_DOCUMENT = "rag_document"
    AI_INTERPRETATION = "ai_interpretation"


class ReportCategory(str, Enum):
    SMOKE_OPEN_BURNING = "smoke_open_burning"
    CONSTRUCTION_DUST = "construction_dust"
    TRAFFIC_EMISSIONS = "traffic_emissions"
    INDUSTRIAL_EMISSIONS = "industrial_emissions"
    WASTE_BURNING = "waste_burning"
    UNUSUAL_HAZE = "unusual_haze"
    OTHER = "other"
    INSUFFICIENT_INFO = "insufficient_information"


# ---------------------------------------------------------------------------
# Shared sub-models
# ---------------------------------------------------------------------------


class ProviderMetadata(BaseModel):
    """Metadata about which AI provider generated a response."""

    provider: ProviderName
    model: str
    latency_ms: float | None = None
    fallback_used: bool = False
    tokens_used: int | None = None


class DataTimeRange(BaseModel):
    """Time range of data used in an analysis or response."""

    start: datetime
    end: datetime
    timezone: str = "UTC"


class Citation(BaseModel):
    """A citation for an external web source (Tavily result)."""

    title: str
    url: str
    published_at: datetime | None = None
    retrieved_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    source_domain: str
    snippet: str


class RAGCitation(BaseModel):
    """A citation for an internal RAG knowledge-base document."""

    document_id: str
    document_title: str
    chunk_id: str
    section: str | None = None
    page: int | None = None
    ingested_at: datetime
    relevance_score: float | None = None


class SensorReading(BaseModel):
    """
    A single validated sensor reading from a station.
    Raw MQ-135 values are retained as-is and are NOT treated as AQI inputs.
    """

    device_id: str
    station_id: str
    timestamp: datetime
    data_source: DataSourceType
    scenario_id: str | None = None
    pm1: float | None = None          # µg/m³
    pm25: float | None = None         # µg/m³
    pm10: float | None = None         # µg/m³
    mq135_raw: float | None = None    # Raw ADC value — NOT a concentration
    temperature: float | None = None   # °C
    humidity: float | None = None      # %RH
    pressure: float | None = None      # hPa
    latitude: float | None = None
    longitude: float | None = None

    @field_validator("pm25", "pm10", "pm1", mode="before")
    @classmethod
    def _non_negative(cls, v: Any) -> Any:
        if v is not None and v < 0:
            raise ValueError("Particulate matter values cannot be negative")
        return v

    @field_validator("humidity", mode="before")
    @classmethod
    def _humidity_range(cls, v: Any) -> Any:
        if v is not None and not 0 <= v <= 100:
            raise ValueError("Humidity must be 0–100 %RH")
        return v


class ResponseMetadata(BaseModel):
    """Standard metadata included in every AI service response."""

    request_id: str = Field(default_factory=lambda: str(uuid4()))
    generated_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    service_version: str = "1.0.0"
    warnings: list[str] = Field(default_factory=list)


class WarningFlags(BaseModel):
    """Data-quality and provenance warnings."""

    contains_simulated_data: bool = False
    contains_hardware_data: bool = False
    mixed_sources: bool = False
    mq135_raw_not_calibrated: bool = False
    forecast_not_observation: bool = False
    insufficient_data: bool = False
    external_web_sources_included: bool = False
    low_station_coverage: bool = False

