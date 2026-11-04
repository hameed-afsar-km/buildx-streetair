"""
STREETAIR AI Engine — Response Validator
==========================================
Audits LLM responses for rule compliance:
- Ensures simulated data is never presented as verified empirical measurement.
- Catches uncalibrated MQ-135 inferences.
- Ensures medical diagnoses are absent.
"""

from __future__ import annotations

import re


def validate_response_compliance(
    response_text: str,
    contains_simulated_data: bool = False,
) -> tuple[bool, list[str]]:
    """
    Scans generated text for safety/compliance rule violations.
    """
    violations: list[str] = []
    lower = response_text.lower()

    if "diagnose" in lower or "you should take prescription" in lower or "medical diagnosis" in lower:
        violations.append("Response appears to offer medical advice/diagnosis.")

    if "mq-135 ppm" in lower or "mq135 concentration is" in lower:
        violations.append("Response improperly treats raw MQ-135 sensor ADC readings as gas concentrations.")

    if contains_simulated_data and "verified real-world measurement" in lower:
        violations.append("Simulated data mischaracterized as verified empirical observation.")

    is_compliant = len(violations) == 0
    return is_compliant, violations

