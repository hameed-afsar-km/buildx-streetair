"""
STREETAIR AI Engine — Internal Forecast Endpoint
==================================================
POST /internal/v1/forecast
Computes time-series pollutant forecast and baseline evaluation metrics.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends

from app.core.security import verify_internal_token
from app.ml.forecasting.baseline import generate_forecast
from app.schemas.forecast import ForecastRequest, ForecastResponse

router = APIRouter(prefix="/internal/v1", tags=["Forecasting"])


@router.post("/forecast", response_model=ForecastResponse, dependencies=[Depends(verify_internal_token)])
async def forecast_endpoint(request: ForecastRequest) -> ForecastResponse:
    """
    Generate statistical pollutant forecast for an authorized station.
    """
    return generate_forecast(
        readings=request.readings,
        station_id=request.station_id,
        target_variable=request.target_variable,
        horizon_hours=request.horizon_hours,
    )

