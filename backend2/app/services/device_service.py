"""Device and station management service."""
from __future__ import annotations
import logging
from typing import TYPE_CHECKING
from app.repositories.firestore_base import new_id, now_utc
from app.core.exceptions import NotFoundError, ConflictError
from app.core.security import generate_device_api_key, hash_api_key

if TYPE_CHECKING:
    from app.repositories.devices_repository import StationsRepository, DevicesRepository

logger = logging.getLogger(__name__)


class DeviceService:
    def __init__(self, stations_repo: "StationsRepository", devices_repo: "DevicesRepository"):
        self.stations_repo = stations_repo
        self.devices_repo = devices_repo

    async def list_stations(
        self, organisation_id: str | None = None, limit: int = 20, cursor: str | None = None
    ) -> tuple[list[dict], str | None]:
        return await self.stations_repo.list_stations(organisation_id=organisation_id, limit=limit, cursor=cursor)

    async def get_station(self, station_id: str) -> dict:
        station = await self.stations_repo.get_by_station_id(station_id)
        if not station:
            raise NotFoundError(f"Station '{station_id}' not found.")
        return station

    async def register_station(
        self,
        name: str,
        latitude: float,
        longitude: float,
        description: str | None = None,
        organisation_id: str | None = None,
        station_type: str = "fixed",
        source_mode: str = "simulated",
    ) -> dict:
        station_id = new_id()
        data = {
            "station_id": station_id,
            "name": name,
            "description": description,
            "latitude": latitude,
            "longitude": longitude,
            "organisation_id": organisation_id,
            "station_type": station_type,
            "source_mode": source_mode,
            "status": "active",
            "device_id": None,
            "last_seen_at": None,
            "metadata": {},
        }
        return await self.stations_repo.create(data, doc_id=station_id)

    async def update_station(self, station_id: str, updates: dict) -> dict:
        station = await self.get_station(station_id)
        return await self.stations_repo.update(station_id, updates)

    async def provision_device(
        self,
        station_id: str,
        organisation_id: str | None = None,
        firmware_version: str | None = None,
    ) -> dict:
        station = await self.get_station(station_id)
        raw_key = generate_device_api_key()
        hashed_key = hash_api_key(raw_key)

        device_id = f"DEV-{new_id()}"
        data = {
            "device_id": device_id,
            "station_id": station_id,
            "organisation_id": organisation_id or station.get("organisation_id"),
            "device_status": "active",
            "api_key_hash": hashed_key,
            "last_seen_at": None,
            "firmware_version": firmware_version,
        }
        created = await self.devices_repo.create(data, doc_id=device_id)

        # Update station with this device_id
        await self.stations_repo.update(station_id, {"device_id": device_id})

        return {
            "device_id": device_id,
            "station_id": station_id,
            "api_key": raw_key,
            "message": "Store this API key securely. It will not be shown again.",
        }

    async def get_device(self, device_id: str) -> dict:
        dev = await self.devices_repo.get_by_device_id(device_id)
        if not dev:
            raise NotFoundError(f"Device '{device_id}' not found.")
        return dev

    async def revoke_device(self, device_id: str) -> None:
        await self.get_device(device_id)
        await self.devices_repo.revoke(device_id)

