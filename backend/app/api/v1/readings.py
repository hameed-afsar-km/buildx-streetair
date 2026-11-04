"""Sensor readings queries endpoints."""
from __future__ import annotations
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, Query, HTTPException, status
from app.core.dependencies import get_optional_user
from app.schemas.auth import UserContext
from app.schemas.readings import LatestReadingResponse, ReadingResponse
from app.schemas.common import PaginatedResponse
from app.integrations.firebase import get_firestore
from app.repositories.devices_repository import StationsRepository
from app.repositories.readings_repository import ReadingsRepository
from app.services.reading_service import ReadingService

router = APIRouter(prefix="/readings", tags=["Readings"])


def get_reading_service() -> ReadingService:
    db = get_firestore()
    return ReadingService(ReadingsRepository(db), StationsRepository(db))


@router.get("/latest", response_model=LatestReadingResponse)
async def get_latest_reading(
    station_id: str | None = Query(None, description="Target monitoring station ID"),
    device_id: str | None = Query(None, description="Alias for station ID"),
    user: UserContext | None = Depends(get_optional_user),
):
    """Get the latest sensor reading and freshness status for a station."""
    target_id = station_id or device_id
    if not target_id:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Either 'station_id' or 'device_id' query parameter is required.",
        )
    service = get_reading_service()
    return await service.get_latest_reading(target_id)


@router.get("/history", response_model=PaginatedResponse[ReadingResponse])
async def get_reading_history(
    station_id: str | None = Query(None, description="Target monitoring station ID"),
    device_id: str | None = Query(None, description="Alias for station ID"),
    start_time: datetime | None = Query(None, description="Start time ISO 8601 UTC"),
    end_time: datetime | None = Query(None, description="End time ISO 8601 UTC"),
    limit: int = Query(50, ge=1, le=100),
    cursor: str | None = Query(None),
    user: UserContext | None = Depends(get_optional_user),
):
    """Get historical readings for a station within a time range."""
    target_id = station_id or device_id
    if not target_id:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Either 'station_id' or 'device_id' query parameter is required.",
        )
    service = get_reading_service()
    now = datetime.now(timezone.utc)
    if not end_time:
        end_time = now
    if not start_time:
        start_time = end_time - timedelta(days=1)

    readings, next_cursor = await service.get_history(
        station_id=target_id,
        start_time=start_time,
        end_time=end_time,
        limit=limit,
        cursor=cursor,
    )
    return PaginatedResponse(
        items=readings,
        next_cursor=next_cursor,
        has_more=bool(next_cursor),
        limit=limit,
    )
