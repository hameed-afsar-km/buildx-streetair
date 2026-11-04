"""Organisation and membership service."""
from __future__ import annotations
import logging
from typing import TYPE_CHECKING

from app.core.exceptions import ForbiddenError, NotFoundError, ConflictError
from app.repositories.firestore_base import new_id, now_utc

if TYPE_CHECKING:
    from app.repositories.organisations_repository import (
        OrganisationsRepository, OrganisationMembersRepository
    )
    from app.repositories.subscriptions_repository import SubscriptionsRepository

logger = logging.getLogger(__name__)


class OrganisationService:
    def __init__(
        self,
        orgs_repo: "OrganisationsRepository",
        members_repo: "OrganisationMembersRepository",
        subs_repo: "SubscriptionsRepository | None" = None,
    ):
        self.orgs_repo = orgs_repo
        self.members_repo = members_repo
        self.subs_repo = subs_repo
    
    async def create_organisation(self, name: str, org_type: str, 
                                   creator_uid: str) -> dict:
        org_id = new_id()
        org_data = {
            "organisation_id": org_id,
            "name": name,
            "organisation_type": org_type,
            "status": "active",
            "plan_id": None,
            "configuration": {},
        }
        org = await self.orgs_repo.create(org_data, doc_id=org_id)
        
        # Add creator as admin
        membership_id = new_id()
        membership = {
            "membership_id": membership_id,
            "organisation_id": org_id,
            "uid": creator_uid,
            "role": "admin",
            "status": "active",
            "joined_at": now_utc(),
        }
        await self.members_repo.create(membership, doc_id=membership_id)
        
        logger.info("Organisation created", extra={
            "org_id": org_id,
            "creator_uid": creator_uid,
        })
        return org
    
    async def get_organisation(self, organisation_id: str, 
                                requester_uid: str, 
                                is_platform_admin: bool = False) -> dict:
        org = await self.orgs_repo.get_by_org_id(organisation_id)
        if not org:
            raise NotFoundError(f"Organisation '{organisation_id}' not found.")
        
        if not is_platform_admin:
            membership = await self.members_repo.get_membership(organisation_id, requester_uid)
            if not membership:
                raise ForbiddenError("You are not a member of this organisation.")
        
        return org
    
    async def require_org_member(self, organisation_id: str, uid: str) -> dict:
        """Check membership and return it. Raises ForbiddenError if not member."""
        membership = await self.members_repo.get_membership(organisation_id, uid)
        if not membership:
            raise ForbiddenError("Not authorised: not a member of this organisation.")
        return membership
    
    async def require_org_admin(self, organisation_id: str, uid: str) -> dict:
        """Check admin membership. Raises ForbiddenError if not admin."""
        membership = await self.members_repo.get_membership(organisation_id, uid)
        if not membership or membership.get("role") != "admin":
            raise ForbiddenError("Not authorised: organisation admin required.")
        return membership
    
    async def add_member(self, organisation_id: str, uid: str, 
                          role: str = "member") -> dict:
        existing = await self.members_repo.get_membership(organisation_id, uid)
        if existing:
            raise ConflictError("User is already a member of this organisation.")
        
        membership_id = new_id()
        membership = {
            "membership_id": membership_id,
            "organisation_id": organisation_id,
            "uid": uid,
            "role": role,
            "status": "active",
            "joined_at": now_utc(),
        }
        return await self.members_repo.create(membership, doc_id=membership_id)
    
    async def list_members(self, organisation_id: str) -> list[dict]:
        return await self.members_repo.list_members(organisation_id)

