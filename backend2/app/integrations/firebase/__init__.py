"""
Firebase Admin SDK integration.
Initializes the Firebase app and provides the Firestore async client.
"""
from __future__ import annotations
import logging
from datetime import datetime, timezone
from functools import lru_cache

import firebase_admin
from firebase_admin import auth, credentials, firestore_async
from google.cloud.firestore_v1 import AsyncClient

logger = logging.getLogger(__name__)

_firebase_app: firebase_admin.App | None = None
_firestore_client: AsyncClient | None = None


def initialize_firebase(credentials_path: str | None, project_id: str) -> None:
    """Initialize Firebase Admin SDK. Called once at application startup."""
    global _firebase_app, _firestore_client
    if _firebase_app is not None:
        return

    try:
        if credentials_path:
            cred = credentials.Certificate(credentials_path)
        else:
            # Use Application Default Credentials (production / Cloud Run)
            cred = credentials.ApplicationDefault()

        _firebase_app = firebase_admin.initialize_app(cred, {
            "projectId": project_id,
        })
        _firestore_client = firestore_async.client()
        logger.info("Firebase Admin SDK initialized", extra={"project_id": project_id})
    except Exception as e:
        logger.error("Failed to initialize Firebase Admin SDK", exc_info=True)
        raise


def get_firestore() -> AsyncClient:
    """Return the initialized Firestore async client."""
    if _firestore_client is None:
        raise RuntimeError("Firebase not initialized. Call initialize_firebase() first.")
    return _firestore_client


def verify_id_token(token: str) -> dict:
    """
    Verify a Firebase ID token and return decoded claims.
    """
    decoded = auth.verify_id_token(token, check_revoked=True)
    return decoded


async def get_firebase_user(uid: str) -> dict | None:
    """Get Firebase Auth user record by UID."""
    try:
        user = auth.get_user(uid)
        return {
            "uid": user.uid,
            "email": user.email,
            "display_name": user.display_name,
            "disabled": user.disabled,
        }
    except auth.UserNotFoundError:
        return None


async def get_or_create_user_profile(uid: str, email: str | None, firebase_claims: dict | None = None) -> dict:
    """Upsert and fetch user profile document in Firestore."""
    try:
        db = get_firestore()
        doc_ref = db.collection("users").document(uid)
        doc = await doc_ref.get()
        if doc.exists:
            return doc.to_dict() or {}
        
        now = datetime.now(timezone.utc)
        display_name = (firebase_claims or {}).get("name") or (firebase_claims or {}).get("display_name")
        new_profile = {
            "uid": uid,
            "email": email,
            "display_name": display_name,
            "account_status": "active",
            "global_role": "registered",
            "preferences": {},
            "organisation_id": None,
            "created_at": now,
            "updated_at": now,
            "last_login_at": now,
        }
        await doc_ref.set(new_profile)
        return new_profile
    except Exception as e:
        now = datetime.now(timezone.utc)
        logger.warning(f"Firestore user profile upsert fallback: {e}")
        return {
            "uid": uid,
            "email": email,
            "display_name": (firebase_claims or {}).get("name"),
            "account_status": "active",
            "global_role": "registered",
            "organisation_id": None,
            "created_at": now,
            "updated_at": now,
            "last_login_at": now,
        }


class FirebaseClient:
    def verify_id_token(self, token: str) -> dict:
        return verify_id_token(token)

    def get_firestore(self) -> AsyncClient:
        return get_firestore()

    async def get_firebase_user(self, uid: str) -> dict | None:
        return await get_firebase_user(uid)

    async def get_or_create_user_profile(self, uid: str, email: str | None, firebase_claims: dict | None = None) -> dict:
        return await get_or_create_user_profile(uid, email, firebase_claims)


firebase_client = FirebaseClient()
