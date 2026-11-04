"""Authentication and user management service."""
from __future__ import annotations
import logging
from typing import TYPE_CHECKING
from app.repositories.firestore_base import now_utc
from app.core.exceptions import NotFoundError, UnauthorizedError

if TYPE_CHECKING:
    from app.repositories.users_repository import UsersRepository

logger = logging.getLogger(__name__)


class AuthService:
    def __init__(self, users_repo: "UsersRepository"):
        self.users_repo = users_repo

    async def get_or_create_profile(self, uid: str, email: str | None, display_name: str | None) -> dict:
        return await self.users_repo.upsert_from_token(uid=uid, email=email, display_name=display_name)

    async def get_user_profile(self, uid: str) -> dict:
        profile = await self.users_repo.get_by_uid(uid)
        if not profile:
            raise NotFoundError(f"User profile for '{uid}' not found.")
        return profile

    async def update_profile(self, uid: str, updates: dict) -> dict:
        profile = await self.get_user_profile(uid)
        return await self.users_repo.update(uid, updates)

