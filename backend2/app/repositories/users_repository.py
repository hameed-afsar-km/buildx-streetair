"""User profile repository."""
from __future__ import annotations
from datetime import datetime, timezone
from app.repositories.firestore_base import FirestoreRepository, now_utc

class UsersRepository(FirestoreRepository):
    collection_name = "users"
    
    async def get_by_uid(self, uid: str) -> dict | None:
        return await self.get_by_id(uid)
    
    async def upsert_from_token(self, uid: str, email: str | None, 
                                 display_name: str | None) -> dict:
        """Create or update user profile from Firebase token claims."""
        existing = await self.get_by_uid(uid)
        now = now_utc()
        if existing:
            update_data = {
                "last_login_at": now,
                "updated_at": now,
            }
            if display_name and existing.get("display_name") != display_name:
                update_data["display_name"] = display_name
            return await self.update(uid, update_data)
        else:
            data = {
                "uid": uid,
                "email": email,
                "display_name": display_name,
                "account_status": "active",
                "global_role": "registered",
                "created_at": now,
                "updated_at": now,
                "last_login_at": now,
                "preferences": {},
            }
            return await self.create(data, doc_id=uid)
    
    async def set_role(self, uid: str, role: str) -> dict | None:
        return await self.update(uid, {"global_role": role})
    
    async def set_status(self, uid: str, status: str) -> dict | None:
        return await self.update(uid, {"account_status": status})
    
    async def list_users(self, limit: int = 20, cursor: str | None = None) -> tuple[list[dict], str | None]:
        return await self.list_all(limit=limit, cursor=cursor)
