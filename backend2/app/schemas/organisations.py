from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class OrganisationCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    name: str = Field(min_length=2, max_length=100)
    organisation_type: str  # "industry","construction","education","municipality","smartcity","consultant","other"
    description: str | None = None


class OrganisationResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    organisation_id: str
    name: str
    organisation_type: str
    status: str = "active"  # "active","suspended","pending"
    plan_id: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None
    configuration: dict = Field(default_factory=dict)


class MemberInvite(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    email: str
    role: str = "member"  # "member" | "admin"


class MemberResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    membership_id: str
    organisation_id: str
    uid: str
    display_name: str | None = None
    email: str | None = None
    role: str = "member"
    status: str = "active"
    joined_at: datetime | None = None
