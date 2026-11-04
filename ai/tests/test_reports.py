"""
Unit Tests — Community Report Classifier
"""

from datetime import UTC, datetime
from app.ml.report_classification.classifier import classify_single_report, sanitize_text
from app.schemas.common import ReportCategory
from app.schemas.report import CommunityReport


def test_sanitize_text():
    raw = "<script>alert('pwned')</script> Heavy black smoke"
    clean = sanitize_text(raw)
    assert "<script>" not in clean
    assert "Heavy black smoke" in clean


def test_classify_smoke_report():
    report = CommunityReport(
        report_id="R-1",
        submitted_at=datetime.now(UTC),
        text_description="Active biomass bonfire and thick smoke burning across the open field.",
        location_name="Sector 4",
    )
    result = classify_single_report(report)
    assert result.category == ReportCategory.SMOKE_OPEN_BURNING
    assert result.confidence >= 0.7
    assert result.priority_suggestion in ["medium", "high"]


def test_classify_industrial_report():
    report = CommunityReport(
        report_id="R-2",
        submitted_at=datetime.now(UTC),
        text_description="Pungent chemical odor and industrial chimney fumes causing eye burning.",
        location_name="SIPCOT Industrial Park",
    )
    result = classify_single_report(report)
    assert result.category == ReportCategory.INDUSTRIAL_EMISSIONS
    assert result.priority_suggestion == "high"


def test_duplicate_candidate_detection():
    report = CommunityReport(
        report_id="R-NEW",
        submitted_at=datetime.now(UTC),
        text_description="Toxic chemical fumes from chimney near Guindy industrial zone.",
        location_name="Guindy",
    )
    existing = [
        {"report_id": "R-EXISTING", "category": "industrial_emissions", "location_name": "Guindy Industrial Area"}
    ]
    result = classify_single_report(report, existing_reports=existing)
    assert "R-EXISTING" in result.duplicate_candidate_ids

