"""Alerts and incidents repository with resilient in-memory fallback."""
from __future__ import annotations
import logging
from datetime import datetime, timezone, timedelta
from google.cloud.firestore_v1.base_query import FieldFilter
from app.repositories.firestore_base import FirestoreRepository, now_utc

logger = logging.getLogger(__name__)

class AlertsRepository(FirestoreRepository):
    collection_name = "alerts"
    
    async def get_active_alerts(self, organisation_id: str | None = None,
                                 station_id: str | None = None,
                                 limit: int = 50) -> list[dict]:
        try:
            query = self._col.where(filter=FieldFilter("status", "==", "active"))
            if organisation_id:
                query = query.where(filter=FieldFilter("organisation_id", "==", organisation_id))
            if station_id:
                query = query.where(filter=FieldFilter("station_id", "==", station_id))
            query = query.order_by("triggered_at", direction="DESCENDING").limit(limit)
            docs = [d async for d in query.stream()]
            return [{"id": d.id, **d.to_dict()} for d in docs]
        except Exception as e:
            logger.debug("AlertsRepository get_active_alerts fallback: %s", e)
            return [
                a for a in self._mem().values()
                if a.get("status") == "active"
                and (not station_id or a.get("station_id") == station_id)
            ][:limit]
    
    async def check_cooldown(self, station_id: str, alert_type: str, 
                              cooldown_seconds: int) -> bool:
        """Returns True if in cooldown (should suppress new alert)."""
        cutoff = now_utc() - timedelta(seconds=cooldown_seconds)
        try:
            query = (
                self._col
                .where(filter=FieldFilter("station_id", "==", station_id))
                .where(filter=FieldFilter("alert_type", "==", alert_type))
                .where(filter=FieldFilter("triggered_at", ">=", cutoff))
                .limit(1)
            )
            docs = [d async for d in query.stream()]
            return len(docs) > 0
        except Exception:
            for a in self._mem().values():
                if a.get("station_id") == station_id and a.get("alert_type") == alert_type:
                    trig = a.get("triggered_at")
                    if isinstance(trig, datetime) and trig >= cutoff:
                        return True
            return False
    
    async def acknowledge(self, alert_id: str, uid: str, note: str | None) -> dict | None:
        return await self.update(alert_id, {
            "status": "acknowledged",
            "acknowledged_by": uid,
            "acknowledged_at": now_utc(),
            "acknowledge_note": note,
        })
    
    async def resolve(self, alert_id: str, uid: str) -> dict | None:
        return await self.update(alert_id, {
            "status": "resolved",
            "resolved_by": uid,
            "resolved_at": now_utc(),
        })

class IncidentsRepository(FirestoreRepository):
    collection_name = "incidents"
    
    async def list_incidents(self, organisation_id: str | None = None,
                              status: str | None = None,
                              limit: int = 20,
                              cursor: str | None = None) -> tuple[list[dict], str | None]:
        filters = []
        if organisation_id:
            filters.append(("organisation_id", "==", organisation_id))
        return await self.list_all(limit=limit, cursor=cursor, filters=filters if filters else None)
