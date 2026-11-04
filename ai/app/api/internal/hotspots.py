"""
STREETAIR AI Engine — Internal Hotspots Endpoint
==================================================
POST /internal/v1/hotspots
Groups elevated spatial readings into geographic clusters with coverage transparency.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends

from app.core.security import verify_internal_token
from app.ml.hotspot_detection.spatial import detect_hotspots
from app.schemas.hotspot import HotspotRequest, HotspotResponse

router = APIRouter(prefix="/internal/v1", tags=["Hotspots"])


@router.post("/hotspots", response_model=HotspotResponse, dependencies=[Depends(verify_internal_token)])
async def hotspots_endpoint(request: HotspotRequest) -> HotspotResponse:
    """
    Compute geographic pollution hotspot clusters for authorized station readings.
    """
    return detect_hotspots(
        readings=request.readings,
        target_variable=request.target_variable,
        percentile_threshold=request.percentile_threshold,
    )

