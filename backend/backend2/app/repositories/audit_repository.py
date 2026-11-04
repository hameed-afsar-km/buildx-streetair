"""Audit log repository."""
from __future__ import annotations
from app.repositories.firestore_base import FirestoreRepository

class AuditRepository(FirestoreRepository):
    collection_name = "audit_logs"
    
    async def log(self, actor_uid: str | None, organisation_id: str | None,
                  action: str, resource_type: str, resource_id: str,
                  request_id: str | None, metadata: dict | None = None) -> dict:
        data = {
            "actor_uid": actor_uid,
            "organisation_id": organisation_id,
            "action": action,
            "resource_type": resource_type,
            "resource_id": resource_id,
            "request_id": request_id,
            "metadata": metadata or {},
        }
        return await self.create(data)
