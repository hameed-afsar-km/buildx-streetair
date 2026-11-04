"""
STREETAIR AI Engine — RAG Vector Store
========================================
Wraps ChromaDB for local development and Qdrant for production.
Tenant isolation is enforced via metadata filters before retrieval.
"""

from __future__ import annotations

import os
from typing import Any

from app.core.config import VectorStoreProvider, get_settings
from app.core.logging import get_logger

logger = get_logger(__name__)


class VectorStoreClient:
    """
    Thin adapter around the configured vector store.
    Supports ChromaDB (local) and Qdrant (production).
    """

    def __init__(self) -> None:
        self._settings = get_settings()
        self._client: Any = None
        self._collection: Any = None
        self._initialize()

    def _initialize(self) -> None:
        provider = self._settings.vector_store_provider

        if provider == VectorStoreProvider.CHROMADB:
            self._init_chromadb()
        elif provider == VectorStoreProvider.QDRANT:
            self._init_qdrant()
        else:
            raise ValueError(f"Unsupported vector store provider: {provider}")

    def _init_chromadb(self) -> None:
        try:
            import chromadb
            path = self._settings.vector_store_path
            os.makedirs(path, exist_ok=True)
            self._client = chromadb.PersistentClient(path=path)
            self._collection = self._client.get_or_create_collection(
                name="streetair_knowledge",
                metadata={"hnsw:space": "cosine"},
            )
            logger.info("chromadb_initialized", path=path)
        except ImportError:
            logger.error("chromadb_not_installed")
            raise

    def _init_qdrant(self) -> None:
        try:
            from qdrant_client import QdrantClient
            self._client = QdrantClient(
                url=self._settings.qdrant_url,
                api_key=self._settings.qdrant_api_key or None,
            )
            logger.info("qdrant_initialized", url=self._settings.qdrant_url)
        except ImportError:
            logger.error("qdrant_client_not_installed")
            raise

    def add_documents(
        self,
        ids: list[str],
        embeddings: list[list[float]],
        documents: list[str],
        metadatas: list[dict[str, Any]],
    ) -> None:
        """Add document chunks to the vector store."""
        if self._settings.vector_store_provider == VectorStoreProvider.CHROMADB:
            self._collection.add(
                ids=ids,
                embeddings=embeddings,
                documents=documents,
                metadatas=metadatas,
            )
        else:
            raise NotImplementedError("Qdrant add_documents not yet implemented")

    def query(
        self,
        query_embedding: list[float],
        top_k: int = 5,
        where: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Query the vector store with optional metadata filters (tenant isolation)."""
        if self._settings.vector_store_provider == VectorStoreProvider.CHROMADB:
            results = self._collection.query(
                query_embeddings=[query_embedding],
                n_results=min(top_k, self._collection.count() or 1),
                where=where,
                include=["documents", "metadatas", "distances"],
            )
            return results
        else:
            raise NotImplementedError("Qdrant query not yet implemented")

    def delete_document(self, document_id: str) -> None:
        """Remove all chunks belonging to a document (for re-indexing/obsolete docs)."""
        if self._settings.vector_store_provider == VectorStoreProvider.CHROMADB:
            self._collection.delete(where={"document_id": document_id})
            logger.info("document_deleted", document_id=document_id)
        else:
            raise NotImplementedError("Qdrant delete not yet implemented")

    @property
    def count(self) -> int:
        if self._settings.vector_store_provider == VectorStoreProvider.CHROMADB:
            return self._collection.count()
        return -1


# Module-level singleton
_store: VectorStoreClient | None = None


def get_vector_store() -> VectorStoreClient:
    global _store
    if _store is None:
        _store = VectorStoreClient()
    return _store

