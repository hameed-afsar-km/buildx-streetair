"""
STREETAIR AI Engine — RAG Ingestion Pipeline
==============================================
Ingests approved environmental documents, extracts text and metadata,
chunks, embeds, and stores in the vector database with tenant boundaries.
"""

from __future__ import annotations

import uuid
from datetime import UTC, datetime
from typing import Any

from app.core.logging import get_logger
from app.rag.chunking import chunk_text
from app.rag.embeddings import embed_texts
from app.rag.vector_store import get_vector_store

logger = get_logger(__name__)


async def ingest_document(
    document_title: str,
    raw_text: str,
    org_id: str = "global",
    document_type: str = "standard",
    version: str = "1.0",
) -> dict[str, Any]:
    """
    Ingest a document into the RAG vector store with tenant scope.
    """
    doc_id = f"doc_{uuid.uuid4().hex[:12]}"
    ingested_at = datetime.now(UTC).isoformat()

    chunks = chunk_text(raw_text, chunk_size=600, chunk_overlap=100)
    if not chunks:
        logger.warning("rag_ingestion_empty_doc", title=document_title)
        return {"document_id": doc_id, "chunks_ingested": 0}

    chunk_texts = [c.text for c in chunks]
    chunk_ids = [f"{doc_id}_{c.chunk_id}" for c in chunks]
    metadatas = [
        {
            "document_id": doc_id,
            "document_title": document_title,
            "chunk_id": c.chunk_id,
            "org_id": org_id,
            "document_type": document_type,
            "version": version,
            "section": c.section_title or "General",
            "ingested_at": ingested_at,
        }
        for c in chunks
    ]

    embeddings = embed_texts(chunk_texts)
    vector_store = get_vector_store()
    vector_store.add_documents(
        ids=chunk_ids,
        embeddings=embeddings,
        documents=chunk_texts,
        metadatas=metadatas,
    )

    logger.info(
        "rag_document_ingested",
        doc_id=doc_id,
        title=document_title,
        chunks=len(chunks),
        org_id=org_id,
    )

    return {
        "document_id": doc_id,
        "document_title": document_title,
        "chunks_ingested": len(chunks),
        "ingested_at": ingested_at,
    }

