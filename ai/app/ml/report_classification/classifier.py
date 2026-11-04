"""
STREETAIR AI Engine — Community Report Classification
========================================================
Classifies citizen pollution reports into standard categories, identifies duplicate
candidates, flags missing information, and provides objective moderation guidance.
"""

from __future__ import annotations

import re
from typing import Any

from app.schemas.common import ReportCategory, WarningFlags
from app.schemas.report import ClassificationResult, CommunityReport, ReportClassificationResponse, ResponseMetadata

# Keyword heuristics mapping
CATEGORY_KEYWORDS = {
    ReportCategory.SMOKE_OPEN_BURNING: [
        "smoke", "fire", "burning", "bonfire", "trash fire", "leaf burning", "biomass", "wood fire"
    ],
    ReportCategory.CONSTRUCTION_DUST: [
        "construction", "dust", "cement", "demolition", "excavation", "building site", "debris", "sand"
    ],
    ReportCategory.TRAFFIC_EMISSIONS: [
        "traffic", "vehicle", "exhaust", "diesel", "jam", "truck", "bus", "idling", "highway"
    ],
    ReportCategory.INDUSTRIAL_EMISSIONS: [
        "factory", "chimney", "chemical", "industrial", "solvent", "pungent", "stench", "acid smell", "plant", "boiler"
    ],
    ReportCategory.WASTE_BURNING: [
        "garbage", "plastic burning", "dump", "landfill", "refuse", "municipal waste", "tyre"
    ],
    ReportCategory.UNUSUAL_HAZE: [
        "haze", "smog", "visibility", "foggy", "blanket", "grey sky", "stagnant air"
    ],
}


def sanitize_text(text: str) -> str:
    """Strip dangerous characters or markup from untrusted citizen inputs."""
    # Remove HTML tags and control chars
    clean = re.sub(r"<[^>]+>", " ", text)
    clean = re.sub(r"[\x00-\x1f\x7f-\x9f]", "", clean)
    return clean.strip()


def classify_single_report(
    report: CommunityReport,
    existing_reports: list[dict[str, Any]] | None = None,
) -> ClassificationResult:
    """
    Classify a single community report using keyword matching and context evaluation.
    """
    clean_text = sanitize_text(report.text_description.lower())
    matched_categories: list[tuple[ReportCategory, int]] = []

    for cat, kws in CATEGORY_KEYWORDS.items():
        score = sum(1 for kw in kws if re.search(r"\b" + re.escape(kw) + r"\b", clean_text))
        if score > 0:
            matched_categories.append((cat, score))

    # Sort by match score
    matched_categories.sort(key=lambda x: x[1], reverse=True)

    missing_info = []
    if not report.location_name and (report.latitude is None or report.longitude is None):
        missing_info.append("Precise geographic coordinates or landmark reference.")
    if len(clean_text) < 30:
        missing_info.append("Detailed description of odor, color of plume, or duration.")

    # Determine Category & Confidence
    if not matched_categories:
        if len(clean_text) < 20:
            category = ReportCategory.INSUFFICIENT_INFO
            confidence = 0.4
            rationale = "Description is too brief to identify a specific pollution source."
            priority = "low"
        else:
            category = ReportCategory.OTHER
            confidence = 0.5
            rationale = "General complaint not matching standard pollution category keywords."
            priority = "low"
    else:
        top_cat, match_count = matched_categories[0]
        category = top_cat
        if match_count >= 3:
            confidence = 0.9
            rationale = f"Strong match with {match_count} distinct indicators of {top_cat.value.replace('_', ' ')}."
        elif match_count == 2:
            confidence = 0.75
            rationale = f"Moderate match with indicators of {top_cat.value.replace('_', ' ')}."
        else:
            confidence = 0.6
            rationale = f"Preliminary keyword match suggests {top_cat.value.replace('_', ' ')}."

        # Priority suggestion
        if category in [ReportCategory.INDUSTRIAL_EMISSIONS, ReportCategory.WASTE_BURNING]:
            priority = "high"
        elif category in [ReportCategory.SMOKE_OPEN_BURNING, ReportCategory.CONSTRUCTION_DUST]:
            priority = "medium"
        else:
            priority = "low"

    # Duplicate detection candidate check
    duplicate_candidates = []
    if existing_reports:
        for ex in existing_reports:
            ex_id = ex.get("report_id")
            if ex_id == report.report_id:
                continue
            ex_loc = ex.get("location_name", "").lower()
            ex_cat = ex.get("category", "")
            if ex_cat == category.value and report.location_name and ex_loc and (report.location_name.lower() in ex_loc or ex_loc in report.location_name.lower()):
                duplicate_candidates.append(ex_id)

    # Moderation recommendation
    if confidence >= 0.8 and not duplicate_candidates and not missing_info:
        moderation = "auto_triage_eligible"
    else:
        moderation = "human_review_required"

    return ClassificationResult(
        report_id=report.report_id,
        category=category,
        confidence=round(confidence, 2),
        confidence_note="Confidence reflects lexical heuristics; does not represent ground-truth physical verification.",
        priority_suggestion=priority,
        rationale=rationale,
        missing_information=missing_info,
        duplicate_candidate_ids=duplicate_candidates,
        moderation_recommendation=moderation,
        warnings=["Unverified citizen report. Requires independent sensor or field verification."],
    )


def classify_reports(
    reports: list[CommunityReport],
    existing_reports: list[dict[str, Any]] | None = None,
) -> ReportClassificationResponse:
    """Classify a batch of community reports."""
    results = [classify_single_report(r, existing_reports) for r in reports]
    return ReportClassificationResponse(
        metadata=ResponseMetadata(),
        classifications=results,
        warnings=WarningFlags(),
    )

