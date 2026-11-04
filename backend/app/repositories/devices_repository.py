"""Device and monitoring station repository."""
from __future__ import annotations
from datetime import datetime, timezone
from google.cloud.firestore_v1.base_query import FieldFilter
from app.repositories.firestore_base import FirestoreRepository, now_utc, new_id

class StationsRepository(FirestoreRepository):
    collection_name = "monitoring_stations"
    
    async def get_by_station_id(self, station_id: str) -> dict | None:
        return await self.get_by_id(station_id)
    
    async def list_stations(self, organisation_id: str | None = None,
                             limit: int = 20, cursor: str | None = None) -> tuple[list[dict], str | None]:
        filters = []
        if organisation_id:
            filters.append(("organisation_id", "==", organisation_id))
        return await self.list_all(limit=limit, cursor=cursor, filters=filters if filters else None)
    
    async def update_last_seen(self, station_id: str, device_id: str) -> None:
        from datetime import datetime, timezone
        await self.update(station_id, {
            "last_seen_at": now_utc(),
            "status": "active",
        })
    
    async def set_status(self, station_id: str, status: str) -> None:
        await self.update(station_id, {"status": status})
    
    async def get_by_device_id(self, device_id: str) -> dict | None:
        query = self._col.where(filter=FieldFilter("device_id", "==", device_id)).limit(1)
        docs = [d async for d in query.stream()]
        if not docs:
            return None
        d = docs[0]
        return {"id": d.id, **d.to_dict()}


class DevicesRepository(FirestoreRepository):
    collection_name = "devices"
    
    async def get_by_device_id(self, device_id: str) -> dict | None:
        return await self.get_by_id(device_id)
    
    async def get_active_by_station(self, station_id: str) -> dict | None:
        query = self._col.where(
            filter=FieldFilter("station_id", "==", station_id)
        ).where(
            filter=FieldFilter("device_status", "==", "active")
        ).limit(1)
        docs = [d async for d in query.stream()]
        if not docs:
            return None
        d = docs[0]
        return {"id": d.id, **d.to_dict()}
    
    async def update_last_seen(self, device_id: str) -> None:
        await self.update(device_id, {"last_seen_at": now_utc()})
    
    async def revoke(self, device_id: str) -> None:
        await self.update(device_id, {"device_status": "revoked"})
    
    async def list_by_organisation(self, organisation_id: str, 
                                    limit: int = 20) -> list[dict]:
        query = self._col.where(
            filter=FieldFilter("organisation_id", "==", organisation_id)
        ).limit(limit)
        docs = [d async for d in query.stream()]
        return [{"id": d.id, **d.to_dict()} for d in docs]
