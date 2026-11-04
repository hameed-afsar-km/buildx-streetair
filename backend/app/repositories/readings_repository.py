"""Sensor readings repository with time-based queries."""
from __future__ import annotations
from datetime import datetime, timezone, timedelta
from google.cloud.firestore_v1.base_query import FieldFilter
from app.repositories.firestore_base import FirestoreRepository, now_utc

class ReadingsRepository(FirestoreRepository):
    collection_name = "sensor_readings"
    
    async def get_latest_for_station(self, station_id: str) -> dict | None:
        query = self._col.where(
            filter=FieldFilter("station_id", "==", station_id)
        ).order_by("timestamp", direction="DESCENDING").limit(1)
        docs = [d async for d in query.stream()]
        if not docs:
            return None
        d = docs[0]
        return {"id": d.id, **d.to_dict()}
    
    async def get_history(self, station_id: str, start_time: datetime, 
                          end_time: datetime, limit: int = 100,
                          cursor: str | None = None) -> tuple[list[dict], str | None]:
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
    
    async def count_today(self, station_id: str | None = None) -> int:
        from datetime import date
        today_start = datetime.combine(date.today(), datetime.min.time()).replace(tzinfo=timezone.utc)
        query = self._col.where(filter=FieldFilter("timestamp", ">=", today_start))
        if station_id:
            query = query.where(filter=FieldFilter("station_id", "==", station_id))
        # Firestore doesn't support count natively in older SDK; use stream
        count = 0
        async for _ in query.stream():
            count += 1
        return count
    
    async def check_duplicate(self, device_id: str, timestamp: datetime) -> bool:
        """Check if a reading with same device_id + timestamp already exists."""
        query = (
            self._col
            .where(filter=FieldFilter("device_id", "==", device_id))
            .where(filter=FieldFilter("timestamp", "==", timestamp))
            .limit(1)
        )
        docs = [d async for d in query.stream()]
        return len(docs) > 0
    
    async def get_readings_window(self, station_id: str, hours: int = 24) -> list[dict]:
        cutoff = now_utc() - timedelta(hours=hours)
        query = (
            self._col
            .where(filter=FieldFilter("station_id", "==", station_id))
            .where(filter=FieldFilter("timestamp", ">=", cutoff))
            .order_by("timestamp")
        )
        docs = [d async for d in query.stream()]
        return [{"id": d.id, **d.to_dict()} for d in docs]
