"""Subscription, plan, and usage repositories."""
from __future__ import annotations
from datetime import datetime, timezone
from google.cloud.firestore_v1.base_query import FieldFilter
from app.repositories.firestore_base import FirestoreRepository, now_utc

class PlansRepository(FirestoreRepository):
    collection_name = "plans"
    
    async def list_active_plans(self) -> list[dict]:
        query = (
            self._col
            .where(filter=FieldFilter("active", "==", True))
            .order_by("display_order")
        )
        docs = [d async for d in query.stream()]
        return [{"id": d.id, **d.to_dict()} for d in docs]

class SubscriptionsRepository(FirestoreRepository):
    collection_name = "subscriptions"
    
    async def get_active_subscription(self, uid: str = None, 
                                       organisation_id: str = None) -> dict | None:
        query = self._col.where(filter=FieldFilter("status", "in", ["active", "trial", "demo"]))
        if uid:
            query = query.where(filter=FieldFilter("uid", "==", uid))
        if organisation_id:
            query = query.where(filter=FieldFilter("organisation_id", "==", organisation_id))
        query = query.limit(1)
        docs = [d async for d in query.stream()]
        if not docs:
            return None
        d = docs[0]
        return {"id": d.id, **d.to_dict()}

class UsageRecordsRepository(FirestoreRepository):
    collection_name = "usage_records"
    
    async def get_period_usage(self, uid: str = None, 
                                organisation_id: str = None,
                                period: str = None) -> list[dict]:
        query = self._col
        if uid:
            query = query.where(filter=FieldFilter("uid", "==", uid))
        if organisation_id:
            query = query.where(filter=FieldFilter("organisation_id", "==", organisation_id))
        if period:
            query = query.where(filter=FieldFilter("period", "==", period))
        docs = [d async for d in query.stream()]
        return [{"id": d.id, **d.to_dict()} for d in docs]
    
    async def increment_usage(self, uid: str | None, organisation_id: str | None,
                               metric: str, quantity: int, 
                               period: str, source: str) -> dict:
        data = {
            "uid": uid,
            "organisation_id": organisation_id,
            "metric": metric,
            "quantity": quantity,
            "period": period,
            "source": source,
        }
        return await self.create(data)
