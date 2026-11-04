from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class SensorValues(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    pm1: float | None = Field(None, ge=0)
    pm25: float | None = Field(None, ge=0)
    pm10: float | None = Field(None, ge=0)
    mq135_raw: int | None = Field(None, ge=0)
    temperature: float | None = None
    humidity: float | None = Field(None, ge=0, le=100)
    pressure: float | None = None


class LocationSnapshot(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)


class IngestPayload(BaseModel):
    """Canonical ingestion payload from ESP32 or software simulator."""

    model_config = ConfigDict(populate_by_name=True)

    device_id: str
    station_id: str
    timestamp: datetime  # ISO8601 UTC from device
    data_source: Literal["simulated", "hardware"]
    scenario_id: str | None = None
    readings: SensorValues
    location: LocationSnapshot | None = None
    firmware_version: str | None = None


class AQIResult(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    value: float | None = None
    category: str | None = None  # "Good","Satisfactory","Moderate","Poor","Very Poor","Severe"
    dominant_pollutant: str | None = None
    standard: str = "CPCB_INDIA_2014"
    is_simulated: bool = True
    calculable: bool = True
    limitation_note: str | None = None


class ReadingResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    reading_id: str
    station_id: str
    device_id: str
    timestamp: datetime
    received_at: datetime
    data_source: str
    scenario_id: str | None = None
    readings: SensorValues
    aqi: AQIResult | None = None
    quality_flags: list[str] = Field(default_factory=list)
    location: LocationSnapshot | None = None


class LatestReadingResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    station_id: str
    station_name: str
    reading: ReadingResponse | None = None
    station_status: str
    last_seen_at: datetime | None = None
