"""Alert management endpoints."""
from __future__ import annotations
from fastapi import APIRouter, Depends, Query, status
from app.core.dependencies import require_authenticated_user, get_optional_user
from app.schemas.auth import UserContext
from app.schemas.alerts import AlertResponse, AlertAcknowledge
from app.integrations.firebase import get_firestore
from app.repositories.alerts_repository import AlertsRepository
from app.services.alert_service import AlertService

router = APIRouter(prefix="/alerts", tags=["Alerts"])


def get_alert_service() -> AlertService:
    db = get_firestore()
    return AlertService(AlertsRepository(db))


@router.get("", response_model=list[AlertResponse])
async def list_active_alerts(
    organisation_id: str | None = Query(None),
    station_id: str | None = Query(None),
    limit: int = Query(50, ge=1, le=100),
    user: UserContext | None = Depends(get_optional_user),
):
    """List active environmental alerts."""
    service = get_alert_service()
    return await service.list_alerts(organisation_id=organisation_id, station_id=station_id, limit=limit)


@router.post("/{alert_id}/acknowledge", response_model=AlertResponse)
async def acknowledge_alert(
    alert_id: str,
    payload: AlertAcknowledge,
    user: UserContext = Depends(require_authenticated_user),
):
    """Acknowledge an active alert."""
    service = get_alert_service()
    updated = await service.acknowledge_alert(alert_id, uid=user.uid, note=payload.note)
    return updated


@router.post("/{alert_id}/resolve", response_model=AlertResponse)
async def resolve_alert(
    alert_id: str,
    user: UserContext = Depends(require_authenticated_user),
):
    """Resolve an alert."""
    service = get_alert_service()
    updated = await service.resolve_alert(alert_id, uid=user.uid)
    return updated

