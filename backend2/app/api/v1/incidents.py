"""Pollution incident investigation endpoints."""
from __future__ import annotations
from fastapi import APIRouter, Depends, Query, status
from app.core.dependencies import require_authenticated_user, get_optional_user
from app.schemas.auth import UserContext
from app.schemas.alerts import IncidentCreate, IncidentResponse
from app.schemas.common import PaginatedResponse
from app.integrations.firebase import get_firestore
from app.repositories.alerts_repository import IncidentsRepository
from app.repositories.audit_repository import AuditRepository
from app.services.incident_service import IncidentService

router = APIRouter(prefix="/incidents", tags=["Incidents"])


def get_incident_service() -> IncidentService:
    db = get_firestore()
    return IncidentService(IncidentsRepository(db), AuditRepository(db))


@router.get("", response_model=PaginatedResponse[IncidentResponse])
async def list_incidents(
    organisation_id: str | None = Query(None),
    status: str | None = Query(None),
    limit: int = Query(20, ge=1, le=100),
    cursor: str | None = Query(None),
    user: UserContext | None = Depends(get_optional_user),
):
    """List investigated pollution incidents."""
    service = get_incident_service()
    items, next_cursor = await service.list_incidents(
        organisation_id=organisation_id, status=status, limit=limit, cursor=cursor
    )
    return PaginatedResponse(
        items=items,
        next_cursor=next_cursor,
        has_more=bool(next_cursor),
        limit=limit,
    )


@router.get("/{incident_id}", response_model=IncidentResponse)
async def get_incident(
    incident_id: str,
    user: UserContext | None = Depends(get_optional_user),
):
    """Get single incident details."""
    service = get_incident_service()
    return await service.get_incident(incident_id)


@router.post("", response_model=IncidentResponse, status_code=status.HTTP_201_CREATED)
async def create_incident(
    payload: IncidentCreate,
    user: UserContext = Depends(require_authenticated_user),
):
    """Create a new pollution incident for investigation."""
    service = get_incident_service()
    return await service.create_incident(
        category=payload.category,
        severity=payload.severity,
        description=payload.description,
        organisation_id=payload.organisation_id,
        station_ids=payload.station_ids,
        location=payload.location.model_dump() if payload.location else None,
        creator_uid=user.uid,
    )

