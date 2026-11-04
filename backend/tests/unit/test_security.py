"""Tests for security utilities."""
import pytest
from app.core.security import (
    generate_device_token, verify_device_token,
    generate_device_api_key, hash_api_key, verify_api_key,
    generate_request_id
)


def test_device_token_generation_and_verification():
    device_id = "DEV-ESP32-001"
    secret = "test-secret-key-12345"
    token = generate_device_token(device_id, secret)
    
    assert isinstance(token, str)
    assert len(token) == 64  # SHA256 hex
    
    # Valid token verification
    assert verify_device_token(token, device_id, secret) is True
    
    # Wrong secret
    assert verify_device_token(token, device_id, "wrong-secret") is False
    
    # Wrong device_id
    assert verify_device_token(token, "DEV-OTHER", secret) is False


def test_api_key_hashing_and_verification():
    key = generate_device_api_key()
    assert len(key) >= 32
    
    hashed = hash_api_key(key)
    assert verify_api_key(key, hashed) is True
    assert verify_api_key("wrong-key", hashed) is False


def test_request_id_format():
    rid = generate_request_id()
    assert isinstance(rid, str)
    assert len(rid) == 36  # UUID4

