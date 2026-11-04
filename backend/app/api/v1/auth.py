"""Authentication and user profile endpoints."""
from __future__ import annotations
from fastapi import APIRouter, Depends
from app.core.dependencies import require_authenticated_user
from app.schemas.auth import UserContext, UserProfile, UserProfileUpdate
from app.integrations.firebase import get_firestore
from app.repositories.users_repository import UsersRepository
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Auth"])


def get_auth_service() -> AuthService:
    db = get_firestore()
    return AuthService(UsersRepository(db))


@router.get("/me", response_model=UserProfile)
async def get_current_user_profile(
    current_user: UserContext = Depends(require_authenticated_user),
):
    """Return the profile for the currently authenticated user."""
    auth_service = get_auth_service()
    profile = await auth_service.get_user_profile(current_user.uid)
    return profile


@router.patch("/me", response_model=UserProfile)
async def update_current_user_profile(
    updates: UserProfileUpdate,
    current_user: UserContext = Depends(require_authenticated_user),
):
    """Update profile preferences or display name."""
    auth_service = get_auth_service()
    data = updates.model_dump(exclude_unset=True)
    updated = await auth_service.update_profile(current_user.uid, data)
    return updated

