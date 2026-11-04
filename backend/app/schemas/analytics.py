from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.readings import AQIResult


class OverviewResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    total_stations: int
    active_stations: int
    total_readings_today: int
    active_alerts: int
    latest_aqi: dict[str, AQIResult]  # station_id -> AQI
    generated_at: datetime


class TrendPoint(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    timestamp: datetime
    value: float | None
    station_id: str


class TrendResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    station_id: str
    pollutant: str
    unit: str
    start_time: datetime
    end_time: datetime
    interval: str  # "1h","6h","1d"
    data_points: list[TrendPoint]
    data_source: str


class HotspotPoint(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    station_id: str
    station_name: str
    latitude: float
    longitude: float
    aqi_value: float | None
    dominant_pollutant: str | None
    reading_count: int
    period_start: datetime
    period_end: datetime


class HotspotResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    hotspots: list[HotspotPoint]
    method: str = "station_average"
    limitation: str = (
        "Coverage limited to registered monitoring stations. "
        "Sparse coverage does not represent a continuous spatial field."
    )
    generated_at: datetime
