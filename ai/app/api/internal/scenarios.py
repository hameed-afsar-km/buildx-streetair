"""
STREETAIR AI Engine — Internal What-If Scenarios Endpoint
===========================================================
POST /internal/v1/scenarios
Executes deterministic scenario simulations for city pollution interventions.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends

from app.core.security import verify_internal_token
from app.ml.scenario_models.engine import simulate_scenario
from app.schemas.scenario import ScenarioRequest, ScenarioResponse

router = APIRouter(prefix="/internal/v1", tags=["Scenarios"])


@router.post("/scenarios", response_model=ScenarioResponse, dependencies=[Depends(verify_internal_token)])
async def scenarios_endpoint(request: ScenarioRequest) -> ScenarioResponse:
    """
    Simulate impact of environmental interventions using deterministic mathematical models.
    """
    return simulate_scenario(request)

