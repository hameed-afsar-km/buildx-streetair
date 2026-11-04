"""
STREETAIR AI Engine — RAG Citations
====================================
Formats and verifies RAG knowledge base citations.
"""

from __future__ import annotations

from datetime import UTC, datetime
from typing import Any
from app.schemas.common import RAGCitation


def create_rag_citation(
    document_id: str,
    document_title: str,
    chunk_id: str,
    section: str | None = None,
    page: int | None = None,
    ingested_at: datetime | None = None,
    relevance_score: float | None = None,
) -> RAGCitation:
    """Helper to instantiate a valid RAGCitation."""
    return RAGCitation(
        document_id=document_id,
        document_title=document_title,
        chunk_id=chunk_id,
        section=section,
        page=page,
        ingested_at=ingested_at or datetime.now(UTC),
        relevance_score=relevance_score,
    )

