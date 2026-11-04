"""Community pollution reporting endpoints."""
from __future__ import annotations
from fastapi import APIRouter, Depends, Query, status
from app.core.dependencies import require_authenticated_user
from app.schemas.auth import UserContext
from app.schemas.reports import ReportCreate, ReportResponse, ReportStatusUpdate
from app.schemas.common import PaginatedResponse
from app.integrations.firebase import get_firestore
from app.integrations.ai_engine.client import ai_engine_client
from app.integrations.storage.firebase_storage import generate_upload_url, build_report_image_path
from app.repositories.reports_repository import ReportsRepository
from app.repositories.audit_repository import AuditRepository
from app.services.report_service import ReportService

router = APIRouter(prefix="/reports", tags=["Community Reports"])


def get_report_service() -> ReportService:
    db = get_firestore()
    return ReportService(ReportsRepository(db), AuditRepository(db), ai_engine_client)


@router.post("", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
async def submit_report(
    payload: ReportCreate,
    user: UserContext = Depends(require_authenticated_user),
):
    """Submit a citizen pollution report."""
    service = get_report_service()
    return await service.submit_report(
        submitted_by=user.uid,
        category=payload.category.value if hasattr(payload.category, "value") else str(payload.category),
        description=payload.description,
        latitude=payload.latitude,
        longitude=payload.longitude,
    )


@router.get("", response_model=PaginatedResponse[ReportResponse])
async def list_reports(
    user_only: bool = Query(True, description="Filter to caller's reports"),
    status: str | None = Query(None),
    limit: int = Query(20, ge=1, le=100),
    cursor: str | None = Query(None),
    user: UserContext = Depends(require_authenticated_user),
):
    """List pollution reports."""
    service = get_report_service()
    if user_only:
        items, next_cursor = await service.list_user_reports(user.uid, limit=limit, cursor=cursor)
    else:
        items, next_cursor = await service.list_all_reports(status=status, limit=limit, cursor=cursor)

    return PaginatedResponse(
        items=items,
        next_cursor=next_cursor,
        has_more=bool(next_cursor),
        limit=limit,
    )


@router.get("/{report_id}", response_model=ReportResponse)
async def get_report(
    report_id: str,
    user: UserContext = Depends(require_authenticated_user),
):
    """Get report by ID."""
    service = get_report_service()
    return await service.get_report(report_id)


@router.post("/{report_id}/upload-url")
async def get_image_upload_url(
    report_id: str,
    filename: str = Query(...),
    content_type: str = Query("image/jpeg"),
    user: UserContext = Depends(require_authenticated_user),
):
    """Generate a signed upload URL to attach an image to a report."""
    path = build_report_image_path(report_id, filename)
    url = generate_upload_url(path, content_type)
    return {"upload_url": url, "path": path}

