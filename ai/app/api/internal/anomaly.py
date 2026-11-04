"""
STREETAIR AI Engine — Internal Anomaly Detection Endpoint
===========================================================
POST /internal/v1/anomaly-detection
Detects spikes, flatlines, and deviations from baseline.
"""

from __future__ import annotations

from datetime import UTC, datetime
from fastapi import APIRouter, Depends

from app.core.security import verify_internal_token
from app.ml.anomaly_detection.detector import detect_anomalies
from app.schemas.anomaly import AnomalyDetectionRequest, AnomalyDetectionResponse
from app.schemas.common import DataTimeRange, ResponseMetadata, WarningFlags

router = APIRouter(prefix="/internal/v1", tags=["Anomaly Detection"])


@router.post("/anomaly-detection", response_model=AnomalyDetectionResponse, dependencies=[Depends(verify_internal_token)])
async def anomaly_endpoint(request: AnomalyDetectionRequest) -> AnomalyDetectionResponse:
    """
    Detect statistical and rule-based anomalies across station readings.
    """
    anomalies = detect_anomalies(
        readings=request.readings,
        station_id=request.station_id,
        target_variables=request.target_variables,
    )

    timestamps = [r.timestamp for r in request.readings if r.timestamp]
    time_range = DataTimeRange(
        start=min(timestamps) if timestamps else datetime.now(UTC),
        end=max(timestamps) if timestamps else datetime.now(UTC),
    )

    warnings = WarningFlags(
        contains_simulated_data=any(r.data_source == "simulated" for r in request.readings),
        contains_hardware_data=any(r.data_source == "hardware" for r in request.readings),
    )

    return AnomalyDetectionResponse(
        metadata=ResponseMetadata(),
        station_id=request.station_id,
        data_time_range=time_range,
        anomalies=anomalies,
        total_readings_analyzed=len(request.readings),
        total_anomalies_detected=len(anomalies),
        warnings=warnings,
    )

