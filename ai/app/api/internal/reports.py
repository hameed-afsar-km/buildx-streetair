"""
STREETAIR AI Engine — Internal Report Classification Endpoint
===============================================================
POST /internal/v1/report-classification
Categorizes community pollution complaints and flags duplicates.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends

from app.core.security import verify_internal_token
from app.ml.report_classification.classifier import classify_reports
from app.schemas.report import ReportClassificationRequest, ReportClassificationResponse

router = APIRouter(prefix="/internal/v1", tags=["Reports"])


@router.post("/report-classification", response_model=ReportClassificationResponse, dependencies=[Depends(verify_internal_token)])
async def report_classification_endpoint(request: ReportClassificationRequest) -> ReportClassificationResponse:
    """
    Classify citizen reports into standard environmental categories.
    """
    # existing_reports can be provided as metadata dicts
    existing = [{"report_id": rid} for rid in request.existing_report_ids]
    return classify_reports(
        reports=request.reports,
        existing_reports=existing,
    )

