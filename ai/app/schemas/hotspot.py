"""
STREETAIR AI Engine — Hotspot Detection Schemas
"""

from __future__ import annotations

from pydantic import BaseModel, Field

from app.schemas.common import (
    DataSourceType,
    DataTimeRange,
    ResponseMetadata,
    SensorReading,
    WarningFlags,
)


class HotspotRequest(BaseModel):
    request_id: str | None = None
    org_id: str
    target_variable: str    # e.g. "pm25"
    readings: list[SensorReading] = Field(..., min_length=1, max_length=50_000)
    percentile_threshold: float = Field(default=75.0, ge=50.0, le=99.0)


class HotspotCluster(BaseModel):
    cluster_id: str
    station_ids: list[str]
    centroid_latitude: float | None = None
    centroid_longitude: float | None = None
    mean_value: float
    max_value: float
    percentile_rank: float
    station_count: int
    data_source: DataSourceType
    coverage_note: str              # Transparency about station density / interpolation


class HotspotResponse(BaseModel):
    metadata: ResponseMetadata
    target_variable: str
    unit: str
    data_time_range: DataTimeRange
    hotspot_clusters: list[HotspotCluster]
    total_stations_analyzed: int
    method: str
    warnings: WarningFlags

