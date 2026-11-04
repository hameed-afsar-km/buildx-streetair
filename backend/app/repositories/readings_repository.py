"""Sensor readings repository with time-based queries and resilient in-memory fallback."""
from __future__ import annotations
import logging
from datetime import datetime, timezone, timedelta
from google.cloud.firestore_v1.base_query import FieldFilter
from app.repositories.firestore_base import FirestoreRepository, now_utc, _IN_MEMORY_STORE

logger = logging.getLogger(__name__)

class ReadingsRepository(FirestoreRepository):
    collection_name = "sensor_readings"
    
    async def get_latest_for_station(self, station_id: str) -> dict | None:
        try:
            query = self._col.where(
                filter=FieldFilter("station_id", "==", station_id)
            ).order_by("timestamp", direction="DESCENDING").limit(1)
            docs = [d async for d in query.stream()]
            if docs:
                return {"id": docs[0].id, **docs[0].to_dict()}
        except Exception as e:
            logger.debug("Firestore get_latest_for_station fallback: %s", e)
            
        # In-memory fallback
        matching = [
            r for r in self._mem().values()
            if r.get("station_id") == station_id
        ]
        if matching:
            matching.sort(key=lambda x: str(x.get("timestamp", "")), reverse=True)
            return matching[0]
        return None
    
    async def get_history(self, station_id: str, start_time: datetime, 
                          end_time: datetime, limit: int = 100,
                          cursor: str | None = None) -> tuple[list[dict], str | None]:
        try:
            query = (
                self._col
                .where(filter=FieldFilter("station_id", "==", station_id))
                .where(filter=FieldFilter("timestamp", ">=", start_time))
                .where(filter=FieldFilter("timestamp", "<=", end_time))
                .order_by("timestamp", direction="DESCENDING")
                .limit(limit + 1)
            )
            if cursor:
                cursor_doc = await self._col.document(cursor).get()
                if cursor_doc.exists:
                    query = query.start_after(cursor_doc)
            docs = [d async for d in query.stream()]
            has_more = len(docs) > limit
            if has_more:
                docs = docs[:limit]
            next_cursor = docs[-1].id if has_more and docs else None
            return [{"id": d.id, **d.to_dict()} for d in docs], next_cursor
        except Exception as e:
            logger.debug("Firestore get_history fallback: %s", e)
            
        # In-memory fallback
        matching = [
            r for r in self._mem().values()
            if r.get("station_id") == station_id
        ]
        matching.sort(key=lambda x: str(x.get("timestamp", "")), reverse=True)
        return matching[:limit], None
    
    async def count_today(self, station_id: str | None = None) -> int:
        try:
            from datetime import date
            today_start = datetime.combine(date.today(), datetime.min.time()).replace(tzinfo=timezone.utc)
            query = self._col.where(filter=FieldFilter("timestamp", ">=", today_start))
            if station_id:
                query = query.where(filter=FieldFilter("station_id", "==", station_id))
            count = 0
            async for _ in query.stream():
                count += 1
            return count
        except Exception:
            # In-memory count
            return len([
                r for r in self._mem().values()
                if not station_id or r.get("station_id") == station_id
            ])
    
    async def check_duplicate(self, device_id: str, timestamp: datetime) -> bool:
        """Check if a reading with same device_id + timestamp already exists."""
        try:
            query = (
                self._col
                .where(filter=FieldFilter("device_id", "==", device_id))
                .where(filter=FieldFilter("timestamp", "==", timestamp))
                .limit(1)
            )
            docs = [d async for d in query.stream()]
            if docs:
                return True
        except Exception:
            pass
            
        # In-memory duplicate check
        ts_str = str(timestamp)
        for r in self._mem().values():
            if r.get("device_id") == device_id and str(r.get("timestamp")) == ts_str:
                return True
        return False
