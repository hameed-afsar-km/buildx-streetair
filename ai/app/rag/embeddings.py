"""
STREETAIR AI Engine — Embedding Generator
==========================================
Wraps sentence-transformers (local) or lightweight fallback for text embeddings.
Loaded once per worker — not per request.
"""

from __future__ import annotations

from typing import Any
import numpy as np

from app.core.config import EmbeddingProvider, get_settings
from app.core.logging import get_logger

logger = get_logger(__name__)

_model: Any = None


def _load_model() -> Any:
    global _model
    if _model is not None:
        return _model

    settings = get_settings()

    if settings.embedding_provider == EmbeddingProvider.LOCAL:
        try:
            from sentence_transformers import SentenceTransformer
            logger.info("loading_embedding_model", model=settings.embedding_model)
            _model = SentenceTransformer(settings.embedding_model)
            logger.info("embedding_model_loaded", model=settings.embedding_model)
            return _model
        except Exception as e:
            logger.warning("sentence_transformers_unavailable_using_fallback", error=str(e))
            # Fallback lightweight hash/deterministic embedder if torch/sentence_transformers not present
            class FallbackEmbedder:
                def encode(self, texts: list[str], **kwargs: Any) -> np.ndarray:
                    dim = 384
                    vecs = []
                    for t in texts:
                        # Deterministic hash-based pseudo-embedding
                        rng = np.random.RandomState(abs(hash(t)) % (2**31))
                        v = rng.standard_normal(dim).astype(np.float32)
                        norm = np.linalg.norm(v)
                        vecs.append(v / (norm if norm > 0 else 1.0))
                    return np.array(vecs)
            _model = FallbackEmbedder()
            return _model
    else:
        raise NotImplementedError("Only local embeddings currently supported.")


def embed_texts(texts: list[str]) -> list[list[float]]:
    """
    Generate embeddings for a list of texts.
    Returns: List of float vectors, one per input text.
    """
    if not texts:
        return []
    model = _load_model()
    embeddings = model.encode(texts, show_progress_bar=False)
    if hasattr(embeddings, "tolist"):
        return embeddings.tolist()
    return [list(map(float, e)) for e in embeddings]


def embed_query(query: str) -> list[float]:
    """Generate an embedding for a single query string."""
    res = embed_texts([query])
    return res[0] if res else [0.0] * 384

