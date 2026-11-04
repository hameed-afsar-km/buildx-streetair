"""
STREETAIR security utilities.

Provides:
- Device token generation/verification via HMAC-SHA256
- API-key generation and hashing
- Request-ID generation
"""

from __future__ import annotations

import hashlib
import hmac
import secrets
import uuid


# ---------------------------------------------------------------------------
# Device token (HMAC-SHA256)
# ---------------------------------------------------------------------------

def generate_device_token(device_id: str, secret: str) -> str:
    """
    Generate an HMAC-SHA256 hex token binding *device_id* to *secret*.

    The token is deterministic for a given (device_id, secret) pair, making
    it suitable for provisioning — the same token is returned on every call
    with the same inputs.

    Parameters
    ----------
    device_id:
        The unique identifier of the device (used as the HMAC message).
    secret:
        The shared secret (``settings.DEVICE_AUTH_SECRET``).

    Returns
    -------
    str
        A 64-character lowercase hexadecimal string (256-bit HMAC digest).
    """
    return hmac.new(
        key=secret.encode("utf-8"),
        msg=device_id.encode("utf-8"),
        digestmod=hashlib.sha256,
    ).hexdigest()


def verify_device_token(token: str, device_id: str, secret: str) -> bool:
    """
    Verify that *token* is the correct HMAC-SHA256 token for *device_id*.

    Uses :func:`hmac.compare_digest` to prevent timing-based side-channel
    attacks.

    Parameters
    ----------
    token:
        The token supplied by the device in the ``X-Device-Token`` header.
    device_id:
        The device identifier supplied in the ``X-Device-ID`` header.
    secret:
        The shared secret (``settings.DEVICE_AUTH_SECRET``).

    Returns
    -------
    bool
        ``True`` if the token is valid, ``False`` otherwise.
    """
    expected = generate_device_token(device_id, secret)
    return hmac.compare_digest(expected, token)


# ---------------------------------------------------------------------------
# API key (opaque, stored as SHA-256 hash)
# ---------------------------------------------------------------------------

def generate_device_api_key() -> str:
    """
    Generate a cryptographically random API key for device or user use.

    Returns
    -------
    str
        A URL-safe base64 string of 32 random bytes (~43 characters).
    """
    return secrets.token_urlsafe(32)


def hash_api_key(key: str) -> str:
    """
    Return the SHA-256 hex digest of *key*.

    Only the hash is stored in Firestore; the plain-text key is shown to
    the device exactly once at provisioning time.

    Parameters
    ----------
    key:
        The plain-text API key to hash.

    Returns
    -------
    str
        A 64-character lowercase hexadecimal SHA-256 digest.
    """
    return hashlib.sha256(key.encode("utf-8")).hexdigest()


def verify_api_key(plain: str, hashed: str) -> bool:
    """
    Verify that the SHA-256 hash of *plain* matches *hashed*.

    Uses :func:`hmac.compare_digest` to prevent timing attacks.

    Parameters
    ----------
    plain:
        The plain-text API key supplied by the caller.
    hashed:
        The stored SHA-256 hex digest retrieved from Firestore.

    Returns
    -------
    bool
        ``True`` if the key is valid, ``False`` otherwise.
    """
    return hmac.compare_digest(hash_api_key(plain), hashed)


# ---------------------------------------------------------------------------
# Request ID
# ---------------------------------------------------------------------------

def generate_request_id() -> str:
    """
    Generate a random UUID4 string for request correlation.

    Returns
    -------
    str
        A UUID4 string in canonical hyphenated form, e.g.
        ``"550e8400-e29b-41d4-a716-446655440000"``.
    """
    return str(uuid.uuid4())
