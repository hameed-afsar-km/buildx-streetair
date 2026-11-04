"""
STREETAIR AI Engine — Anomaly Detection Schemas
"""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.common import (
    AnomalySeverity,
    DataSourceType,
    DataTimeRange,
    ProviderMetadata,
    ResponseMetadata,
    SensorReading,
    WarningFlags,
)


class AnomalyDetectionRequest(BaseModel):
    request_id: str | None = None
    org_id: str
    station_id: str
    readings: list[SensorReading] = Field(..., min_length=2, max_length=10_000)
    target_variables: list[str] | None = None   # None = detect on all available


class AnomalyRecord(BaseModel):
    anomaly_id: str
    station_id: str
    affected_variable: str
    detected_at: datetime
    time_range_start: datetime
    time_range_end: datetime
    observed_value: float | None
    expected_baseline: float | None
    expected_range_low: float | None
    expected_range_high: float | None
    severity: AnomalySeverity
    detection_method: str           # e.g. "zscore", "iqr", "flatline_rule"
    model_version: str = "1.0.0"
    is_data_quality_issue: bool     # True = sensor problem; False = possible pollution event
    explanation: str
    data_source: DataSourceType
    warnings: list[str] = Field(default_factory=list)


class AnomalyDetectionResponse(BaseModel):
    metadata: ResponseMetadata
    station_id: str
    data_time_range: DataTimeRange
    anomalies: list[AnomalyRecord]
    total_readings_analyzed: int
    total_anomalies_detected: int
    warnings: WarningFlags
    provider: ProviderMetadata | None = None

