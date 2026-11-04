"""Reading query service."""
from __future__ import annotations
import logging
from datetime import datetime
from typing import TYPE_CHECKING
from app.core.exceptions import NotFoundError

if TYPE_CHECKING:
    from app.repositories.readings_repository import ReadingsRepository
    from app.repositories.devices_repository import StationsRepository

logger = logging.getLogger(__name__)


class ReadingService:
    def __init__(self, readings_repo: "ReadingsRepository", stations_repo: "StationsRepository"):
        self.readings_repo = readings_repo
        self.stations_repo = stations_repo

    async def get_latest_reading(self, station_id: str) -> dict:
        station = await self.stations_repo.get_by_station_id(station_id)
        if not station:
            raise NotFoundError(f"Station '{station_id}' not found.")

        reading = await self.readings_repo.get_latest_for_station(station_id)
        return {
            "station_id": station_id,
            "station_name": station.get("name", station_id),
            "reading": reading,
            "station_status": station.get("status", "unknown"),
            "last_seen_at": station.get("last_seen_at"),
        }

    async def get_history(
        self,
        station_id: str,
        start_time: datetime,
        end_time: datetime,
        limit: int = 100,
        cursor: str | None = None,
    ) -> tuple[list[dict], str | None]:
        station = await self.stations_repo.get_by_station_id(station_id)
        if not station:
            raise NotFoundError(f"Station '{station_id}' not found.")

        return await self.readings_repo.get_history(
            station_id=station_id,
            start_time=start_time,
            end_time=end_time,
            limit=limit,
            cursor=cursor,
        )

