"""
Base Firestore repository providing common CRUD operations.
All repositories inherit from this class, with automatic resilient in-memory fallback.
"""
from __future__ import annotations
import logging
from datetime import datetime, timezone
from typing import Any, Generic, TypeVar

from google.cloud.firestore_v1 import AsyncClient, AsyncCollectionReference
from google.cloud.firestore_v1.base_query import FieldFilter
import ulid

logger = logging.getLogger(__name__)

T = TypeVar("T")

def now_utc() -> datetime:
    return datetime.now(timezone.utc)

def new_id() -> str:
    """Generate a new ULID-based document ID."""
    return str(ulid.new())

# Shared in-memory data store with default seed for local dev / fallback
_IN_MEMORY_STORE: dict[str, dict[str, dict]] = {
    "devices": {
        "ST-001-DEVICE": {
            "id": "ST-001-DEVICE",
            "device_id": "ST-001-DEVICE",
            "station_id": "ST-001",
            "device_status": "active",
            "firmware_version": "1.0.0",
            "created_at": now_utc(),
            "updated_at": now_utc(),
        },
        "DEV-ESP32-CRESCENT": {
            "id": "DEV-ESP32-CRESCENT",
            "device_id": "DEV-ESP32-CRESCENT",
            "station_id": "crescent-vandalur-01",
            "device_status": "active",
            "firmware_version": "1.0.0",
            "created_at": now_utc(),
            "updated_at": now_utc(),
        },
    },
    "monitoring_stations": {
        "ST-001": {
            "id": "ST-001",
            "station_id": "ST-001",
            "name": "B.S. Abdur Rahman Crescent Institute Campus Beacon",
            "device_id": "ST-001-DEVICE",
            "organisation_id": "ORG-CRESCENT-CAMPUS",
            "status": "active",
            "location": {"latitude": 12.8797, "longitude": 80.0833},
            "location_name": "B.S. Abdur Rahman Crescent Institute of Science and Technology, GST Road, Vandalur",
            "city": "Chennai South / Vandalur",
            "state": "Tamil Nadu",
            "country": "India",
            "created_at": now_utc(),
            "updated_at": now_utc(),
        },
        "crescent-vandalur-01": {
            "id": "crescent-vandalur-01",
            "station_id": "crescent-vandalur-01",
            "name": "B.S. Abdur Rahman Crescent Institute Campus Beacon",
            "device_id": "ST-001-DEVICE",
            "organisation_id": "ORG-CRESCENT-CAMPUS",
            "status": "active",
            "location": {"latitude": 12.8797, "longitude": 80.0833},
            "location_name": "B.S. Abdur Rahman Crescent Institute of Science and Technology, GST Road, Vandalur",
            "city": "Chennai South / Vandalur",
            "state": "Tamil Nadu",
            "country": "India",
            "created_at": now_utc(),
            "updated_at": now_utc(),
        },
    },
    "sensor_readings": {},
    "alerts": {},
    "incidents": {},
}


class FirestoreRepository:
    """Base repository for Firestore collections with in-memory fallback."""
    
    collection_name: str
    
    def __init__(self, db: AsyncClient):
        self.db = db
        self._col: AsyncCollectionReference = db.collection(self.collection_name)
        if self.collection_name not in _IN_MEMORY_STORE:
            _IN_MEMORY_STORE[self.collection_name] = {}
    
    def _mem(self) -> dict[str, dict]:
        return _IN_MEMORY_STORE.setdefault(self.collection_name, {})

    async def get_by_id(self, doc_id: str) -> dict | None:
        try:
            doc = await self._col.document(doc_id).get()
            if doc.exists:
                data = {"id": doc.id, **(doc.to_dict() or {})}
                self._mem()[doc_id] = data
                return data
        except Exception as e:
            logger.debug("Firestore get_by_id fallback to memory for %s/%s: %s", self.collection_name, doc_id, e)
        
        return self._mem().get(doc_id)
    
    async def create(self, data: dict, doc_id: str | None = None) -> dict:
        if doc_id is None:
            doc_id = new_id()
        now = now_utc()
        stored_data = {**data, "id": doc_id, "created_at": now, "updated_at": now}
        self._mem()[doc_id] = stored_data
        
        try:
            await self._col.document(doc_id).set(stored_data)
        except Exception as e:
            logger.debug("Firestore create fallback to memory for %s/%s: %s", self.collection_name, doc_id, e)
            
        return stored_data
    
    async def update(self, doc_id: str, data: dict) -> dict | None:
        now = now_utc()
        current = self._mem().get(doc_id, {"id": doc_id})
        current.update(data)
        current["updated_at"] = now
        self._mem()[doc_id] = current
        
        try:
            ref = self._col.document(doc_id)
            await ref.update({**data, "updated_at": now})
            updated = await ref.get()
            if updated.exists:
                return {"id": updated.id, **(updated.to_dict() or {})}
        except Exception as e:
            logger.debug("Firestore update fallback to memory for %s/%s: %s", self.collection_name, doc_id, e)
            
        return current
    
    async def delete(self, doc_id: str) -> bool:
        self._mem().pop(doc_id, None)
        try:
            await self._col.document(doc_id).delete()
        except Exception as e:
            logger.debug("Firestore delete fallback for %s/%s: %s", self.collection_name, doc_id, e)
        return True
    
    async def list_all(self, limit: int = 20, cursor: str | None = None, 
                       filters: list[tuple] | None = None) -> tuple[list[dict], str | None]:
        try:
            query = self._col.order_by("created_at").limit(limit + 1)
            if cursor:
                cursor_doc = await self._col.document(cursor).get()
                if cursor_doc.exists:
                    query = query.start_after(cursor_doc)
            if filters:
                for field, op, value in filters:
                    query = query.where(filter=FieldFilter(field, op, value))
            docs = [d async for d in query.stream()]
            has_more = len(docs) > limit
            if has_more:
                docs = docs[:limit]
            next_cursor = docs[-1].id if has_more and docs else None
            return [{"id": d.id, **(d.to_dict() or {})} for d in docs], next_cursor
        except Exception as e:
            logger.debug("Firestore list_all fallback to memory for %s: %s", self.collection_name, e)
            items = list(self._mem().values())
            return items[:limit], None
    
    async def exists(self, doc_id: str) -> bool:
        try:
            doc = await self._col.document(doc_id).get()
            return doc.exists
        except Exception:
            return doc_id in self._mem()
