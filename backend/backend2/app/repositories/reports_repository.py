"""Community pollution reports repository."""
from __future__ import annotations
from google.cloud.firestore_v1.base_query import FieldFilter
from app.repositories.firestore_base import FirestoreRepository, now_utc

class ReportsRepository(FirestoreRepository):
    collection_name = "pollution_reports"
    
    async def list_by_user(self, uid: str, limit: int = 20,
                            cursor: str | None = None) -> tuple[list[dict], str | None]:
        filters = [("submitted_by", "==", uid)]
        return await self.list_all(limit=limit, cursor=cursor, filters=filters)
    
    async def list_all_reports(self, status: str | None = None,
                                limit: int = 20,
                                cursor: str | None = None) -> tuple[list[dict], str | None]:
        filters = []
        if status:
            filters.append(("status", "==", status))
        return await self.list_all(limit=limit, cursor=cursor, filters=filters if filters else None)
    
    async def update_status(self, report_id: str, status: str, 
                             reviewer_uid: str, note: str | None) -> dict | None:
        return await self.update(report_id, {
            "status": status,
            "reviewed_by": reviewer_uid,
            "reviewed_at": now_utc(),
            "review_note": note,
        })
    
    async def set_ai_classification(self, report_id: str, 
                                     classification: dict) -> dict | None:
        return await self.update(report_id, {"ai_classification": classification})
