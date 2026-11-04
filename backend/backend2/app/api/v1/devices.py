"""Monitoring stations and devices endpoints."""
from __future__ import annotations
from fastapi import APIRouter, Depends, Query, status
from app.core.dependencies import require_authenticated_user, require_platform_admin, get_optional_user
from app.schemas.auth import UserContext
from app.schemas.devices import (
    StationCreate, StationResponse, DeviceCreate, DeviceResponse, DeviceProvisionResponse
)
from app.schemas.common import PaginatedResponse
from app.integrations.firebase import get_firestore
from app.repositories.devices_repository import StationsRepository, DevicesRepository
from app.services.device_service import DeviceService

router = APIRouter(prefix="/devices", tags=["Devices & Stations"])


def get_device_service() -> DeviceService:
    db = get_firestore()
    return DeviceService(StationsRepository(db), DevicesRepository(db))


@router.get("", response_model=PaginatedResponse[StationResponse])
async def list_stations(
    organisation_id: str | None = Query(None),
    limit: int = Query(20, ge=1, le=100),
    cursor: str | None = Query(None),
    user: UserContext | None = Depends(get_optional_user),
):
    """List monitoring stations with cursor pagination."""
    service = get_device_service()
    stations, next_cursor = await service.list_stations(
        organisation_id=organisation_id, limit=limit, cursor=cursor
    )
    return PaginatedResponse(
        items=stations,
        next_cursor=next_cursor,
        has_more=bool(next_cursor),
        limit=limit,
    )


@router.get("/{station_id}", response_model=StationResponse)
async def get_station(
    station_id: str,
    user: UserContext | None = Depends(get_optional_user),
):
    """Get details for a single monitoring station."""
    service = get_device_service()
    return await service.get_station(station_id)


@router.post("/stations", response_model=StationResponse, status_code=status.HTTP_201_CREATED)
async def create_station(
    payload: StationCreate,
    user: UserContext = Depends(require_authenticated_user),
):
    """Register a new monitoring station."""
    service = get_device_service()
    return await service.register_station(
        name=payload.name,
        latitude=payload.latitude,
        longitude=payload.longitude,
        description=payload.description,
        organisation_id=payload.organisation_id,
        station_type=payload.station_type,
        source_mode=payload.source_mode,
    )


@router.post("/provision", response_model=DeviceProvisionResponse, status_code=status.HTTP_201_CREATED)
async def provision_device(
    payload: DeviceCreate,
    user: UserContext = Depends(require_platform_admin),
):
    """Provision a new hardware/virtual device for a station (admin only)."""
    service = get_device_service()
    return await service.provision_device(
        station_id=payload.station_id,
        organisation_id=payload.organisation_id,
        firmware_version=payload.firmware_version,
    )


@router.delete("/{device_id}", status_code=status.HTTP_204_NO_CONTENT)
async def revoke_device(
    device_id: str,
    user: UserContext = Depends(require_platform_admin),
):
    """Revoke credentials for a device."""
    service = get_device_service()
    await service.revoke_device(device_id)

