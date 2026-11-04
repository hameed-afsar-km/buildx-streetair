"""Administrative endpoints."""
from __future__ import annotations
from fastapi import APIRouter, Depends, Query, status
from app.core.dependencies import require_platform_admin
from app.schemas.auth import UserContext
from app.schemas.reports import ReportResponse, ReportStatusUpdate
from app.integrations.firebase import get_firestore
from app.repositories.reports_repository import ReportsRepository
from app.repositories.audit_repository import AuditRepository
from app.repositories.users_repository import UsersRepository
from app.services.report_service import ReportService

router = APIRouter(prefix="/admin", tags=["Admin"])


def get_repos():
    db = get_firestore()
    return ReportsRepository(db), AuditRepository(db), UsersRepository(db)


@router.patch("/reports/{report_id}", response_model=ReportResponse)
async def moderate_report(
    report_id: str,
    payload: ReportStatusUpdate,
    user: UserContext = Depends(require_platform_admin),
):
    """Admin moderation for community pollution reports."""
    reports_repo, audit_repo, _ = get_repos()
    service = ReportService(reports_repo, audit_repo)
    return await service.update_report_status(
        report_id=report_id,
        status=payload.status,
        reviewer_uid=user.uid,
        review_note=payload.review_note,
    )


@router.get("/users")
async def list_users(
    limit: int = Query(20, ge=1, le=100),
    cursor: str | None = Query(None),
    user: UserContext = Depends(require_platform_admin),
):
    """List system users (platform admin only)."""
    _, _, users_repo = get_repos()
    users, next_cursor = await users_repo.list_users(limit=limit, cursor=cursor)
    return {
        "items": users,
        "next_cursor": next_cursor,
        "has_more": bool(next_cursor),
        "limit": limit,
    }

