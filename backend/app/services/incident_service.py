"""Incident management service."""
from __future__ import annotations
import logging
from typing import TYPE_CHECKING
from app.repositories.firestore_base import new_id, now_utc
from app.core.exceptions import NotFoundError

if TYPE_CHECKING:
    from app.repositories.alerts_repository import IncidentsRepository
    from app.repositories.audit_repository import AuditRepository

logger = logging.getLogger(__name__)


class IncidentService:
    def __init__(self, incidents_repo: "IncidentsRepository", audit_repo: "AuditRepository | None" = None):
        self.incidents_repo = incidents_repo
        self.audit_repo = audit_repo

    async def list_incidents(
        self,
        organisation_id: str | None = None,
        status: str | None = None,
        limit: int = 20,
        cursor: str | None = None,
    ) -> tuple[list[dict], str | None]:
        return await self.incidents_repo.list_incidents(
            organisation_id=organisation_id, status=status, limit=limit, cursor=cursor
        )

    async def get_incident(self, incident_id: str) -> dict:
        incident = await self.incidents_repo.get_by_id(incident_id)
        if not incident:
            raise NotFoundError(f"Incident '{incident_id}' not found.")
        return incident

    async def create_incident(
        self,
        category: str,
        severity: str,
        description: str,
        organisation_id: str | None = None,
        station_ids: list[str] | None = None,
        location: dict | None = None,
        evidence: dict | None = None,
        creator_uid: str | None = None,
    ) -> dict:
        incident_id = new_id()
        data = {
            "incident_id": incident_id,
            "organisation_id": organisation_id,
            "station_ids": station_ids or [],
            "location": location,
            "category": category,
            "severity": severity,
            "description": description,
            "evidence": evidence or {},
            "investigation_status": "open",
            "verification_status": "unverified",
            "assigned_to": None,
            "resolved_at": None,
        }
        res = await self.incidents_repo.create(data, doc_id=incident_id)
        if self.audit_repo:
            await self.audit_repo.log(
                actor_uid=creator_uid,
                organisation_id=organisation_id,
                action="create_incident",
                resource_type="incident",
                resource_id=incident_id,
                request_id=None,
            )
        return res

    async def update_status(
        self,
        incident_id: str,
        investigation_status: str | None = None,
        verification_status: str | None = None,
        assigned_to: str | None = None,
        actor_uid: str | None = None,
    ) -> dict:
        incident = await self.get_incident(incident_id)
        updates = {}
        if investigation_status:
            updates["investigation_status"] = investigation_status
            if investigation_status in ("resolved", "closed"):
                updates["resolved_at"] = now_utc()
        if verification_status:
            updates["verification_status"] = verification_status
        if assigned_to is not None:
            updates["assigned_to"] = assigned_to

        res = await self.incidents_repo.update(incident_id, updates)
        if self.audit_repo:
            await self.audit_repo.log(
                actor_uid=actor_uid,
                organisation_id=incident.get("organisation_id"),
                action="update_incident",
                resource_type="incident",
                resource_id=incident_id,
                request_id=None,
                metadata=updates,
            )
        return res

