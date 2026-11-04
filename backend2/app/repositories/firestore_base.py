"""
Base Firestore repository providing common CRUD operations.
All repositories inherit from this class.
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


class FirestoreRepository:
    """Base repository for Firestore collections."""
    
    collection_name: str
    
    def __init__(self, db: AsyncClient):
        self.db = db
        self._col: AsyncCollectionReference = db.collection(self.collection_name)
    
    async def get_by_id(self, doc_id: str) -> dict | None:
        doc = await self._col.document(doc_id).get()
        if not doc.exists:
            return None
        return {"id": doc.id, **doc.to_dict()}
    
    async def create(self, data: dict, doc_id: str | None = None) -> dict:
        if doc_id is None:
            doc_id = new_id()
        now = now_utc()
        data = {**data, "created_at": now, "updated_at": now}
        await self._col.document(doc_id).set(data)
        return {"id": doc_id, **data}
    
    async def update(self, doc_id: str, data: dict) -> dict | None:
        data["updated_at"] = now_utc()
        ref = self._col.document(doc_id)
        await ref.update(data)
        updated = await ref.get()
        if not updated.exists:
            return None
        return {"id": updated.id, **updated.to_dict()}
    
    async def delete(self, doc_id: str) -> bool:
        await self._col.document(doc_id).delete()
        return True
    
    async def list_all(self, limit: int = 20, cursor: str | None = None, 
                       filters: list[tuple] | None = None) -> tuple[list[dict], str | None]:
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
        return [{"id": d.id, **d.to_dict()} for d in docs], next_cursor
    
    async def exists(self, doc_id: str) -> bool:
        doc = await self._col.document(doc_id).get()
        return doc.exists
