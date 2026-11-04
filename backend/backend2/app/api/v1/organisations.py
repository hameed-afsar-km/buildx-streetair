"""Organisation and membership endpoints."""
from __future__ import annotations
from fastapi import APIRouter, Depends, status
from app.core.dependencies import require_authenticated_user
from app.schemas.auth import UserContext
from app.schemas.organisations import (
    OrganisationCreate, OrganisationResponse, MemberInvite, MemberResponse
)
from app.integrations.firebase import get_firestore
from app.repositories.organisations_repository import OrganisationsRepository, OrganisationMembersRepository
from app.services.organisation_service import OrganisationService

router = APIRouter(prefix="/organisations", tags=["Organisations"])


def get_org_service() -> OrganisationService:
    db = get_firestore()
    return OrganisationService(OrganisationsRepository(db), OrganisationMembersRepository(db))


@router.post("", response_model=OrganisationResponse, status_code=status.HTTP_201_CREATED)
async def create_organisation(
    payload: OrganisationCreate,
    user: UserContext = Depends(require_authenticated_user),
):
    """Create a new tenant organisation."""
    service = get_org_service()
    return await service.create_organisation(
        name=payload.name,
        org_type=payload.organisation_type,
        creator_uid=user.uid,
    )


@router.get("/{organisation_id}", response_model=OrganisationResponse)
async def get_organisation(
    organisation_id: str,
    user: UserContext = Depends(require_authenticated_user),
):
    """Get organisation details (member only)."""
    service = get_org_service()
    is_admin = user.global_role == "platform_admin"
    return await service.get_organisation(organisation_id, requester_uid=user.uid, is_platform_admin=is_admin)


@router.get("/{organisation_id}/members", response_model=list[MemberResponse])
async def list_members(
    organisation_id: str,
    user: UserContext = Depends(require_authenticated_user),
):
    """List members of an organisation."""
    service = get_org_service()
    await service.require_org_member(organisation_id, user.uid)
    return await service.list_members(organisation_id)


@router.post("/{organisation_id}/members", response_model=MemberResponse, status_code=status.HTTP_201_CREATED)
async def add_member(
    organisation_id: str,
    payload: MemberInvite,
    user: UserContext = Depends(require_authenticated_user),
):
    """Add member to an organisation (org admin only)."""
    service = get_org_service()
    await service.require_org_admin(organisation_id, user.uid)
    return await service.add_member(organisation_id, uid=payload.email, role=payload.role)

