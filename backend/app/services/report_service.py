"""Community pollution report service."""
from __future__ import annotations
import logging
from typing import TYPE_CHECKING
from app.repositories.firestore_base import new_id
from app.core.exceptions import NotFoundError

if TYPE_CHECKING:
    from app.repositories.reports_repository import ReportsRepository
    from app.repositories.audit_repository import AuditRepository
    from app.integrations.ai_engine.client import AIEngineClient

logger = logging.getLogger(__name__)


class ReportService:
    def __init__(
        self,
        reports_repo: "ReportsRepository",
        audit_repo: "AuditRepository | None" = None,
        ai_client: "AIEngineClient | None" = None,
    ):
        self.reports_repo = reports_repo
        self.audit_repo = audit_repo
        self.ai_client = ai_client

    async def submit_report(
        self,
        submitted_by: str,
        category: str,
        description: str,
        latitude: float,
        longitude: float,
        image_url: str | None = None,
        request_id: str | None = None,
    ) -> dict:
        report_id = new_id()
        data = {
            "report_id": report_id,
            "submitted_by": submitted_by,
            "category": category,
            "description": description,
            "latitude": latitude,
            "longitude": longitude,
            "image_url": image_url,
            "status": "submitted",
            "ai_classification": None,
            "duplicate_of": None,
            "review_note": None,
        }
        res = await self.reports_repo.create(data, doc_id=report_id)

        # Asynchronously classify report via AI if available
        if self.ai_client:
            import asyncio
            asyncio.create_task(self._classify_async(report_id, description, category, request_id or ""))

        return res

    async def _classify_async(self, report_id: str, description: str, category: str, request_id: str) -> None:
        try:
            res = await self.ai_client.classify_report(description, category, request_id)
            if res and not res.get("skipped"):
                await self.reports_repo.set_ai_classification(report_id, res)
        except Exception:
            logger.warning("Report AI classification failed", exc_info=True)

    async def get_report(self, report_id: str) -> dict:
        report = await self.reports_repo.get_by_id(report_id)
        if not report:
            raise NotFoundError(f"Report '{report_id}' not found.")
        return report

    async def list_user_reports(self, uid: str, limit: int = 20, cursor: str | None = None) -> tuple[list[dict], str | None]:
        return await self.reports_repo.list_by_user(uid, limit=limit, cursor=cursor)

    async def list_all_reports(self, status: str | None = None, limit: int = 20, cursor: str | None = None) -> tuple[list[dict], str | None]:
        return await self.reports_repo.list_all_reports(status=status, limit=limit, cursor=cursor)

    async def update_report_status(
        self,
        report_id: str,
        status: str,
        reviewer_uid: str,
        review_note: str | None = None,
    ) -> dict:
        await self.get_report(report_id)
        res = await self.reports_repo.update_status(report_id, status, reviewer_uid, review_note)
        if self.audit_repo:
            await self.audit_repo.log(
                actor_uid=reviewer_uid,
                organisation_id=None,
                action="review_report",
                resource_type="pollution_report",
                resource_id=report_id,
                request_id=None,
                metadata={"status": status, "review_note": review_note},
            )
        return res

