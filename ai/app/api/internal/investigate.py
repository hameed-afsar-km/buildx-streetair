"""
STREETAIR AI Engine — Internal Pollution Detective Investigation Endpoint
============================================================================
POST /internal/v1/investigate
Correlates station telemetry, anomalies, reference stations, and community reports.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends

from app.core.security import verify_internal_token
from app.ml.investigation import conduct_investigation
from app.schemas.investigation import InvestigationRequest, InvestigationResponse

router = APIRouter(prefix="/internal/v1", tags=["Investigation"])


@router.post("/investigate", response_model=InvestigationResponse, dependencies=[Depends(verify_internal_token)])
async def investigate_endpoint(request: InvestigationRequest) -> InvestigationResponse:
    """
    Execute evidence-grounded incident investigation across multi-modal evidence.
    """
    return await conduct_investigation(request)

