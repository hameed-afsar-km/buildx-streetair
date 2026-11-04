"""Environmental analytics and hotspot endpoints."""
from __future__ import annotations
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, Query
from app.core.dependencies import get_optional_user
from app.schemas.auth import UserContext
from app.schemas.analytics import OverviewResponse, TrendResponse, HotspotResponse
from app.integrations.firebase import get_firestore
from app.repositories.readings_repository import ReadingsRepository
from app.repositories.devices_repository import StationsRepository
from app.repositories.alerts_repository import AlertsRepository
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["Analytics"])


def get_analytics_service() -> AnalyticsService:
    db = get_firestore()
    return AnalyticsService(ReadingsRepository(db), StationsRepository(db), AlertsRepository(db))


@router.get("/overview", response_model=OverviewResponse)
async def get_overview(
    organisation_id: str | None = Query(None),
    user: UserContext | None = Depends(get_optional_user),
):
    """Environmental monitoring summary overview."""
    service = get_analytics_service()
    return await service.get_overview(organisation_id=organisation_id)


@router.get("/trends", response_model=TrendResponse)
async def get_trends(
    station_id: str = Query(...),
    pollutant: str = Query("pm25", pattern="^(pm1|pm25|pm10|temperature|humidity|pressure|mq135_raw)$"),
    interval: str = Query("1h"),
    start_time: datetime | None = Query(None),
    end_time: datetime | None = Query(None),
    user: UserContext | None = Depends(get_optional_user),
):
    """Pollutant trends for a station over time."""
    now = datetime.now(timezone.utc)
    if not end_time:
        end_time = now
    if not start_time:
        start_time = end_time - timedelta(days=7)

    service = get_analytics_service()
    return await service.get_trends(
        station_id=station_id,
        pollutant=pollutant,
        start_time=start_time,
        end_time=end_time,
        interval=interval,
    )


@router.get("/hotspots", response_model=HotspotResponse)
async def get_hotspots(
    organisation_id: str | None = Query(None),
    hours: int = Query(24, ge=1, le=168),
    user: UserContext | None = Depends(get_optional_user),
):
    """
    Environmental hotspots across registered stations.
    Note: Coverage is limited to registered stations and does not represent
    a continuous spatial field.
    """
    service = get_analytics_service()
    return await service.get_hotspots(organisation_id=organisation_id, hours=hours)

