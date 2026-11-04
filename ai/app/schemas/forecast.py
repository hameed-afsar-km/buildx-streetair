"""
STREETAIR AI Engine — Forecasting Schemas
"""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field

from app.schemas.common import (
    DataSourceType,
    DataTimeRange,
    ProviderMetadata,
    ResponseMetadata,
    SensorReading,
    WarningFlags,
)


class ForecastRequest(BaseModel):
    request_id: str | None = None
    org_id: str
    station_id: str
    target_variable: str           # e.g. "pm25", "pm10", "aqi"
    horizon_hours: int = Field(default=24, ge=1, le=168)
    readings: list[SensorReading] = Field(..., min_length=10, max_length=10_000)


class ForecastPoint(BaseModel):
    timestamp: datetime
    predicted_value: float
    lower_bound: float | None = None
    upper_bound: float | None = None
    confidence_level: float | None = None   # e.g. 0.95


class ForecastEvaluation(BaseModel):
    mae: float | None = None
    rmse: float | None = None
    mape: float | None = None
    baseline_mae: float | None = None
    baseline_rmse: float | None = None
    evaluation_note: str | None = None


class ForecastResponse(BaseModel):
    metadata: ResponseMetadata
    station_id: str
    target_variable: str
    unit: str
    horizon_hours: int
    forecast_points: list[ForecastPoint]
    model_name: str
    model_version: str
    training_data_range: DataTimeRange
    generated_at: datetime
    evaluation: ForecastEvaluation | None = None
    data_source: DataSourceType
    warnings: WarningFlags
    is_forecast: bool = True        # Always True — never an observation
    provider: ProviderMetadata | None = None

