from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class UserContext(BaseModel):
    """Resolved user context from Firebase token + Firestore profile."""

    model_config = ConfigDict(populate_by_name=True)

    uid: str
    email: str | None
    display_name: str | None
    global_role: str  # "anonymous","registered","org_member","org_admin","platform_admin"
    account_status: str  # "active","disabled","deleted"
    organisation_id: str | None = None
    organisation_role: str | None = None  # "member","admin"


class UserProfile(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    uid: str
    display_name: str | None = None
    email: str | None = None  # only returned to self or admin
    account_status: str = "active"
    global_role: str = "registered"
    created_at: datetime | None = None
    updated_at: datetime | None = None
    last_login_at: datetime | None = None
    preferences: dict = Field(default_factory=dict)


class UserProfileUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    display_name: str | None = None
    preferences: dict | None = None
