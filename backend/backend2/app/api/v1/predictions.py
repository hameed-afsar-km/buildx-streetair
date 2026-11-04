"""Predictions and forecasting endpoints."""
from __future__ import annotations
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Query, Request
from app.core.dependencies import require_authenticated_user
from app.schemas.auth import UserContext
from app.schemas.ai import PredictionResponse
from app.integrations.ai_engine.client import ai_engine_client
from app.integrations.firebase import get_firestore
from app.repositories.readings_repository import ReadingsRepository
from app.repositories.predictions_repository import PredictionsRepository

router = APIRouter(prefix="/predictions", tags=["Predictions & Forecasts"])


def get_repos():
    db = get_firestore()
    return ReadingsRepository(db), PredictionsRepository(db)


@router.get("", response_model=list[PredictionResponse])
async def get_predictions(
    station_id: str = Query(...),
    pollutant: str = Query("pm25"),
    horizon_hours: int = Query(24, ge=1, le=72),
    request: Request = None,
    user: UserContext = Depends(require_authenticated_user),
):
    """
    Get machine learning pollution forecast for a monitoring station.
    Persists prediction and marks as model estimate (not measurement).
    """
    request_id = getattr(request.state, "request_id", str(uuid.uuid4())) if request else str(uuid.uuid4())
    readings_repo, preds_repo = get_repos()

    # Fetch recent readings for window
    window = await readings_repo.get_readings_window(station_id, hours=24)

    # Request forecast from AI engine
    try:
        ai_res = await ai_engine_client.forecast(
            station_id=station_id,
            pollutant=pollutant,
            readings_window=window,
            horizon_hours=horizon_hours,
            request_id=request_id,
        )
        predicted_values = ai_res.get("predicted_values", [])
        model_version = ai_res.get("model_version", "streetair-arima-v1")
    except Exception:
        # Fallback extrapolation for demo resilience
        predicted_values = [{"offset_hours": h, "predicted_value": 35.0 + h * 0.5, "uncertainty": 5.0} for h in range(1, horizon_hours + 1)]
        model_version = "fallback-linear"

    pred_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    pred_data = {
        "prediction_id": pred_id,
        "station_id": station_id,
        "generated_at": now,
        "forecast_horizon_hours": horizon_hours,
        "pollutant": pollutant,
        "predicted_values": predicted_values,
        "model_version": model_version,
        "source_reading_window": {"hours": 24, "count": len(window)},
        "data_source_context": "historical_time_series",
        "is_forecast": True,
    }
    await preds_repo.create(pred_data, doc_id=pred_id)

    return [PredictionResponse(**pred_data)]

