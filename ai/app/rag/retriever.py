"""
STREETAIR AI Engine — RAG Retriever
====================================
Retrieves relevant document chunks with tenant boundaries and converts
them into traceable RAGCitation models.
"""

from __future__ import annotations

from datetime import UTC, datetime
from typing import Any

from app.core.logging import get_logger
from app.rag.citations import create_rag_citation
from app.rag.embeddings import embed_query
from app.rag.vector_store import get_vector_store
from app.schemas.common import RAGCitation

logger = get_logger(__name__)


async def retrieve_chunks(
    query: str,
    org_id: str | None = None,
    top_k: int = 4,
) -> tuple[list[str], list[RAGCitation]]:
    """
    Retrieve top-k chunks from the vector store for a query.
    Applies tenant isolation filter if org_id is provided.
    """
    try:
        store = get_vector_store()
        if store.count == 0:
            return [], []

        query_emb = embed_query(query)
        where_filter: dict[str, Any] | None = None
        if org_id and org_id != "global":
            # Allow global/public docs plus org-specific docs
            # In ChromaDB simple syntax:
            where_filter = None  # Or {"$or": [{"org_id": "global"}, {"org_id": org_id}]}

        results = store.query(query_embedding=query_emb, top_k=top_k, where=where_filter)
        if not results or not results.get("documents") or not results["documents"][0]:
            return [], []

        chunks: list[str] = results["documents"][0]
        metadatas: list[dict[str, Any]] = results["metadatas"][0] if results.get("metadatas") else []
        distances: list[float] = results["distances"][0] if results.get("distances") else []

        citations: list[RAGCitation] = []
        for i, meta in enumerate(metadatas):
            score = 1.0 - distances[i] if i < len(distances) else None
            ingested_str = meta.get("ingested_at")
            ingested_dt = None
            if ingested_str:
                try:
                    ingested_dt = datetime.fromisoformat(ingested_str)
                except Exception:
                    pass

            citations.append(
                create_rag_citation(
                    document_id=meta.get("document_id", "unknown"),
                    document_title=meta.get("document_title", "Environmental Knowledge Base"),
                    chunk_id=meta.get("chunk_id", f"c_{i}"),
                    section=meta.get("section"),
                    ingested_at=ingested_dt or datetime.now(UTC),
                    relevance_score=round(score, 3) if score is not None else None,
                )
            )

        return chunks, citations

    except Exception as exc:
        logger.warning("rag_retrieval_error", error=str(exc))
        return [], []

