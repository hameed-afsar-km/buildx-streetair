"""Organisations and membership repository."""
from __future__ import annotations
from google.cloud.firestore_v1.base_query import FieldFilter
from app.repositories.firestore_base import FirestoreRepository, now_utc

class OrganisationsRepository(FirestoreRepository):
    collection_name = "organisations"
    
    async def get_by_org_id(self, organisation_id: str) -> dict | None:
        return await self.get_by_id(organisation_id)

class OrganisationMembersRepository(FirestoreRepository):
    collection_name = "organisation_members"
    
    async def get_membership(self, organisation_id: str, uid: str) -> dict | None:
        query = (
            self._col
            .where(filter=FieldFilter("organisation_id", "==", organisation_id))
            .where(filter=FieldFilter("uid", "==", uid))
            .where(filter=FieldFilter("status", "==", "active"))
            .limit(1)
        )
        docs = [d async for d in query.stream()]
        if not docs:
            return None
        d = docs[0]
        return {"id": d.id, **d.to_dict()}
    
    async def list_members(self, organisation_id: str) -> list[dict]:
        query = (
            self._col
            .where(filter=FieldFilter("organisation_id", "==", organisation_id))
            .where(filter=FieldFilter("status", "==", "active"))
        )
        docs = [d async for d in query.stream()]
        return [{"id": d.id, **d.to_dict()} for d in docs]
    
    async def get_user_organisations(self, uid: str) -> list[dict]:
        query = (
            self._col
            .where(filter=FieldFilter("uid", "==", uid))
            .where(filter=FieldFilter("status", "==", "active"))
        )
        docs = [d async for d in query.stream()]
        return [{"id": d.id, **d.to_dict()} for d in docs]
