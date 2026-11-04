"""Device and monitoring station repository with resilient in-memory fallback."""
from __future__ import annotations
import logging
from datetime import datetime, timezone
from google.cloud.firestore_v1.base_query import FieldFilter
from app.repositories.firestore_base import FirestoreRepository, now_utc, new_id

logger = logging.getLogger(__name__)

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
        await self.update(station_id, {
            "last_seen_at": now_utc(),
            "status": "active",
        })
    
    async def set_status(self, station_id: str, status: str) -> None:
        await self.update(station_id, {"status": status})
    
    async def get_by_device_id(self, device_id: str) -> dict | None:
        try:
            query = self._col.where(filter=FieldFilter("device_id", "==", device_id)).limit(1)
            docs = [d async for d in query.stream()]
            if docs:
                return {"id": docs[0].id, **docs[0].to_dict()}
        except Exception as e:
            logger.debug("StationsRepository get_by_device_id fallback: %s", e)
            
        for st in self._mem().values():
            if st.get("device_id") == device_id:
                return st
        return None


class DevicesRepository(FirestoreRepository):
    collection_name = "devices"
    
    async def get_by_device_id(self, device_id: str) -> dict | None:
        return await self.get_by_id(device_id)
    
    async def get_active_by_station(self, station_id: str) -> dict | None:
        try:
            query = self._col.where(
                filter=FieldFilter("station_id", "==", station_id)
            ).where(
                filter=FieldFilter("device_status", "==", "active")
            ).limit(1)
            docs = [d async for d in query.stream()]
            if docs:
                return {"id": docs[0].id, **docs[0].to_dict()}
        except Exception as e:
            logger.debug("DevicesRepository get_active_by_station fallback: %s", e)
            
        for d in self._mem().values():
            if d.get("station_id") == station_id and d.get("device_status") == "active":
                return d
        return None
    
    async def update_last_seen(self, device_id: str) -> None:
        await self.update(device_id, {"last_seen_at": now_utc()})
    
    async def revoke(self, device_id: str) -> None:
        await self.update(device_id, {"device_status": "revoked"})
    
    async def list_by_organisation(self, organisation_id: str, 
                                    limit: int = 20) -> list[dict]:
        try:
            query = self._col.where(
                filter=FieldFilter("organisation_id", "==", organisation_id)
            ).limit(limit)
            docs = [d async for d in query.stream()]
            return [{"id": d.id, **d.to_dict()} for d in docs]
        except Exception as e:
            logger.debug("DevicesRepository list_by_organisation fallback: %s", e)
            return [
                d for d in self._mem().values()
                if d.get("organisation_id") == organisation_id
            ][:limit]
