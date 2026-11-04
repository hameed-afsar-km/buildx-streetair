"""
Firebase Storage integration for image uploads (community reports).
Implements signed URL generation for secure client-side uploads.
"""
from __future__ import annotations
import logging
from datetime import timedelta

logger = logging.getLogger(__name__)

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_IMAGE_SIZE_MB = 10


def get_storage_bucket():
    """Get the Firebase Storage bucket client."""
    try:
        import firebase_admin.storage as fb_storage
        return fb_storage.bucket()
    except Exception as e:
        logger.error("Firebase Storage not configured", exc_info=True)
        return None


def generate_upload_url(
    blob_path: str,
    content_type: str,
    expiry_minutes: int = 15,
) -> str | None:
    """
    Generate a signed URL for client-side upload.
    Returns None if storage is not configured.
    """
    if content_type not in ALLOWED_CONTENT_TYPES:
        raise ValueError(f"Content type {content_type} not allowed")

    bucket = get_storage_bucket()
    if bucket is None:
        return None

    blob = bucket.blob(blob_path)
    url = blob.generate_signed_url(
        expiration=timedelta(minutes=expiry_minutes),
        method="PUT",
        content_type=content_type,
    )
    return url


def get_public_url(blob_path: str) -> str | None:
    """Get public read URL for a blob."""
    bucket = get_storage_bucket()
    if bucket is None:
        return None
    blob = bucket.blob(blob_path)
    return blob.public_url


def build_report_image_path(report_id: str, filename: str) -> str:
    """Build the storage path for a report image."""
    return f"reports/{report_id}/{filename}"
