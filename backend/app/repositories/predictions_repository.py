"""Predictions repository."""
from __future__ import annotations
from google.cloud.firestore_v1.base_query import FieldFilter
from app.repositories.firestore_base import FirestoreRepository

class PredictionsRepository(FirestoreRepository):
    collection_name = "predictions"
    
    async def list_for_station(self, station_id: str, limit: int = 10) -> list[dict]:
        query = (
            self._col
            .where(filter=FieldFilter("station_id", "==", station_id))
            .order_by("generated_at", direction="DESCENDING")
            .limit(limit)
        )
        docs = [d async for d in query.stream()]
        return [{"id": d.id, **d.to_dict()} for d in docs]

class ConversationsRepository(FirestoreRepository):
    collection_name = "conversations"
    
    async def list_for_user(self, uid: str, limit: int = 20) -> list[dict]:
        from google.cloud.firestore_v1.base_query import FieldFilter
        query = (
            self._col
            .where(filter=FieldFilter("uid", "==", uid))
            .order_by("updated_at", direction="DESCENDING")
            .limit(limit)
        )
        docs = [d async for d in query.stream()]
        return [{"id": d.id, **d.to_dict()} for d in docs]

class ConversationMessagesRepository(FirestoreRepository):
    collection_name = "conversation_messages"
    
    async def list_for_conversation(self, conversation_id: str, 
                                     limit: int = 50) -> list[dict]:
        query = (
            self._col
            .where(filter=FieldFilter("conversation_id", "==", conversation_id))
            .order_by("created_at")
            .limit(limit)
        )
        docs = [d async for d in query.stream()]
        return [{"id": d.id, **d.to_dict()} for d in docs]
