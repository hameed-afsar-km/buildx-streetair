"""
Test fixtures and in-memory Firestore test double for STREETAIR backend.
"""
from __future__ import annotations
import asyncio
from datetime import datetime, timezone
from typing import Any, AsyncGenerator
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport

from app.main import app
from app.core.config import settings
from app.core.security import generate_device_token
import app.integrations.firebase as fb_module


class MockDocSnapshot:
    def __init__(self, doc_id: str, data: dict | None):
        self.id = doc_id
        self._data = data
        self.exists = data is not None

    def to_dict(self) -> dict | None:
        return dict(self._data) if self._data is not None else None


class MockDocumentRef:
    def __init__(self, collection_data: dict, doc_id: str):
        self.collection_data = collection_data
        self.id = doc_id

    async def get(self) -> MockDocSnapshot:
        data = self.collection_data.get(self.id)
        return MockDocSnapshot(self.id, data)

    async def set(self, data: dict, merge: bool = False):
        if merge and self.id in self.collection_data:
            self.collection_data[self.id].update(data)
        else:
            self.collection_data[self.id] = dict(data)

    async def update(self, data: dict):
        if self.id in self.collection_data:
            self.collection_data[self.id].update(data)
        else:
            self.collection_data[self.id] = dict(data)

    async def delete(self):
        self.collection_data.pop(self.id, None)


class MockQuery:
    def __init__(self, collection_data: dict, filters=None, order_by_field=None, order_direction="ASCENDING", limit_count=None):
        self.collection_data = collection_data
        self.filters = filters or []
        self.order_by_field = order_by_field
        self.order_direction = order_direction
        self.limit_count = limit_count
        self._cursor_after = None

    def where(self, filter=None, **kwargs):
        new_filters = list(self.filters)
        if filter is not None:
            # FieldFilter(field, op, val)
            field = getattr(filter, "field_path", None)
            op = getattr(filter, "op_string", "==")
            val = getattr(filter, "value", None)
            if field:
                new_filters.append((field, op, val))
        return MockQuery(self.collection_data, new_filters, self.order_by_field, self.order_direction, self.limit_count)

    def order_by(self, field: str, direction: str = "ASCENDING"):
        return MockQuery(self.collection_data, self.filters, field, direction, self.limit_count)

    def limit(self, count: int):
        return MockQuery(self.collection_data, self.filters, self.order_by_field, self.order_direction, count)

    def start_after(self, doc_snapshot):
        q = MockQuery(self.collection_data, self.filters, self.order_by_field, self.order_direction, self.limit_count)
        q._cursor_after = getattr(doc_snapshot, "id", None)
        return q

    async def stream(self) -> AsyncGenerator[MockDocSnapshot, None]:
        docs = []
        for doc_id, data in self.collection_data.items():
            match = True
            for field, op, val in self.filters:
                doc_val = data.get(field)
                if op == "==":
                    if doc_val != val:
                        match = False
                        break
                elif op == ">=":
                    if doc_val is None or doc_val < val:
                        match = False
                        break
                elif op == "<=":
                    if doc_val is None or doc_val > val:
                        match = False
                        break
                elif op == "in":
                    if doc_val not in val:
                        match = False
                        break
            if match:
                docs.append(MockDocSnapshot(doc_id, data))

        if self.order_by_field:
            reverse = self.order_direction.upper() == "DESCENDING"
            docs.sort(key=lambda d: (d.to_dict() or {}).get(self.order_by_field) or "", reverse=reverse)

        if self._cursor_after:
            idx = next((i for i, d in enumerate(docs) if d.id == self._cursor_after), -1)
            if idx != -1:
                docs = docs[idx + 1:]

        if self.limit_count is not None:
            docs = docs[:self.limit_count]

        for d in docs:
            yield d


class MockCollectionRef:
    def __init__(self, storage: dict, name: str):
        if name not in storage:
            storage[name] = {}
        self.name = name
        self.storage = storage

    @property
    def data(self) -> dict:
        return self.storage[self.name]

    def document(self, doc_id: str) -> MockDocumentRef:
        return MockDocumentRef(self.data, doc_id)

    def where(self, *args, **kwargs) -> MockQuery:
        return MockQuery(self.data).where(*args, **kwargs)

    def order_by(self, *args, **kwargs) -> MockQuery:
        return MockQuery(self.data).order_by(*args, **kwargs)

    def limit(self, count: int) -> MockQuery:
        return MockQuery(self.data).limit(count)

    async def stream(self):
        async for d in MockQuery(self.data).stream():
            yield d


class MockFirestoreClient:
    def __init__(self):
        self._storage: dict[str, dict] = {}

    def collection(self, name: str) -> MockCollectionRef:
        return MockCollectionRef(self._storage, name)

    def reset(self):
        self._storage.clear()


@pytest.fixture(autouse=True)
def mock_firestore(monkeypatch):
    """Installs an in-memory mock Firestore for all tests."""
    mock_db = MockFirestoreClient()
    monkeypatch.setattr(fb_module, "_firestore_client", mock_db)
    monkeypatch.setattr(fb_module, "get_firestore", lambda: mock_db)
    return mock_db


@pytest_asyncio.fixture
async def async_client() -> AsyncGenerator[AsyncClient, None]:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        yield client


@pytest.fixture
def auth_headers():
    def _make(token: str = "valid-token"):
        return {"Authorization": f"Bearer {token}"}
    return _make


@pytest.fixture
def device_headers():
    def _make(device_id: str = "DEV-ESP32-CRESCENT"):
        token = generate_device_token(device_id, settings.DEVICE_AUTH_SECRET)
        return {
            "X-Device-ID": device_id,
            "X-Device-Token": token,
        }
    return _make
