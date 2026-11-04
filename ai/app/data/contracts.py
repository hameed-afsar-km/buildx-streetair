"""
STREETAIR AI Engine — Data Contracts and Provenance
=====================================================
Canonical data contracts and provenance tracking.
The backend is the authoritative owner of ingestion and persistence.
The AI service only consumes pre-validated, scoped data from the backend.
"""

from __future__ import annotations

from datetime import UTC, datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field

from app.schemas.common import DataSourceType


class ProvenanceRecord(BaseModel):
    """
    Tracks the provenance of data used in an AI operation.
    Every analytical output must reference its provenance.
    """
    station_id: str
    device_id: str | None = None
    data_source: DataSourceType
    reading_count: int
    earliest_timestamp: datetime
    latest_timestamp: datetime
    received_from_backend_at: datetime = Field(default_factory=lambda: datetime.now(UTC))
    has_simulated: bool = False
    has_hardware: bool = False
    excluded_count: int = 0
    exclusion_reasons: list[str] = Field(default_factory=list)

    @property
    def is_mixed(self) -> bool:
        return self.has_simulated and self.has_hardware

    def provenance_label(self) -> str:
        if self.is_mixed:
            return f"Mixed sources (simulated + hardware) — {self.reading_count} readings"
        elif self.has_simulated:
            return f"SIMULATED data — {self.reading_count} readings (not verified real-world measurements)"
        elif self.has_hardware:
            return f"Hardware sensor data — {self.reading_count} readings"
        return f"Unknown source — {self.reading_count} readings"


class DataContract(BaseModel):
    """
    Canonical reading schema that the backend must supply to the AI service.
    This is the agreed interface. Backend must not send additional fields
    that the AI service might silently trust for authorization.
    """
    # Allowed fields from backend:
    device_id: str
    station_id: str
    timestamp: datetime
    data_source: DataSourceType
    scenario_id: str | None = None
    # Sensor measurements
    pm1: float | None = None          # µg/m³
    pm25: float | None = None         # µg/m³
    pm10: float | None = None         # µg/m³
    mq135_raw: float | None = None    # Raw ADC — NOT a calibrated concentration
    temperature: float | None = None   # °C
    humidity: float | None = None      # %RH
    pressure: float | None = None      # hPa
    # Location
    latitude: float | None = None
    longitude: float | None = None


def build_provenance(readings: list[Any]) -> ProvenanceRecord | None:
    """Build a ProvenanceRecord from a list of SensorReading objects."""
    if not readings:
        return None

    timestamps = [r.timestamp for r in readings if r.timestamp]
    sources = [r.data_source for r in readings if r.data_source]

    has_simulated = DataSourceType.SIMULATED in sources
    has_hardware = DataSourceType.HARDWARE in sources

    return ProvenanceRecord(
        station_id=readings[0].station_id,
        device_id=getattr(readings[0], "device_id", None),
        data_source=DataSourceType.MIXED if (has_simulated and has_hardware) else (
            DataSourceType.SIMULATED if has_simulated else DataSourceType.HARDWARE
        ),
        reading_count=len(readings),
        earliest_timestamp=min(timestamps) if timestamps else datetime.now(UTC),
        latest_timestamp=max(timestamps) if timestamps else datetime.now(UTC),
        has_simulated=has_simulated,
        has_hardware=has_hardware,
    )

