"""Ingestion endpoints for simulator and ESP32 hardware."""
from __future__ import annotations
from fastapi import APIRouter, Depends, Request, status
from app.core.dependencies import require_device_auth
from app.schemas.readings import IngestPayload, ReadingResponse
from app.integrations.firebase import get_firestore
from app.integrations.ai_engine.client import ai_engine_client
from app.repositories.devices_repository import StationsRepository, DevicesRepository
from app.repositories.readings_repository import ReadingsRepository
from app.repositories.alerts_repository import AlertsRepository
from app.services.alert_service import AlertService
from app.services.ingestion_service import IngestionService
from app.websocket.manager import ws_manager

router = APIRouter(tags=["Ingestion"])


def get_ingestion_service() -> IngestionService:
    db = get_firestore()
    stations_repo = StationsRepository(db)
    devices_repo = DevicesRepository(db)
    readings_repo = ReadingsRepository(db)
    alerts_repo = AlertsRepository(db)
    alert_service = AlertService(alerts_repo=alerts_repo, ws_manager=ws_manager)
    return IngestionService(
        devices_repo=devices_repo,
        stations_repo=stations_repo,
        readings_repo=readings_repo,
        alert_service=alert_service,
        ws_manager=ws_manager,
        ai_client=ai_engine_client,
    )


@router.post(
    "/ingest",
    response_model=ReadingResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Ingest simulated or hardware sensor readings",
)
async def ingest_reading(
    payload: IngestPayload,
    request: Request,
    device_id: str = Depends(require_device_auth),
):
    """
    Primary ingestion endpoint for ESP32 and software simulator.
    Authenticates via HMAC-SHA256 headers:
    - X-Device-ID
    - X-Device-Token
    """
    request_id = getattr(request.state, "request_id", "req-unknown")
    service = get_ingestion_service()
    data = payload.model_dump()
    result = await service.process(data, device_id=device_id, request_id=request_id)
    return result

