"""
Unit Tests — What-If Scenario Simulator
"""

import pytest
from app.core.errors import UnsupportedScenarioError
from app.ml.scenario_models.engine import simulate_scenario
from app.schemas.scenario import ScenarioRequest


def test_traffic_reduction_reproducibility():
    req = ScenarioRequest(
        org_id="test_org",
        scenario_type="traffic_reduction",
        parameters={"reduction_percent": 25.0},
        baseline_values={"pm25": 100.0, "pm10": 200.0},
    )
    res1 = simulate_scenario(req)
    res2 = simulate_scenario(req)

    # Determinism: exact match
    assert res1.results == res2.results
    assert res1.results["estimated_pm25_reduction"] == 7.0  # 100 * 0.28 * 0.25 = 7.0
    assert res1.results["projected_pm25"] == 93.0
    assert res1.is_illustrative_estimate is True
    assert len(res1.limitations) > 0


def test_unsupported_scenario_rejected():
    req = ScenarioRequest(
        org_id="test_org",
        scenario_type="magic_wand_clean_air",
        parameters={},
        baseline_values={},
    )
    with pytest.raises(UnsupportedScenarioError):
        simulate_scenario(req)

