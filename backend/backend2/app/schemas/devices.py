from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class StationCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    name: str = Field(min_length=2, max_length=100)
    description: str | None = None
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    organisation_id: str | None = None
    station_type: str = "fixed"  # "fixed","mobile","virtual"
    source_mode: str = "simulated"  # "simulated","hardware"


class StationResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    station_id: str
    name: str
    description: str | None = None
    latitude: float
    longitude: float
    organisation_id: str | None = None
    station_type: str = "fixed"
    source_mode: str = "simulated"
    status: str = "active"  # "active","inactive","offline"
    device_id: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None
    last_seen_at: datetime | None = None
    metadata: dict = Field(default_factory=dict)


class DeviceCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    station_id: str
    organisation_id: str | None = None
    firmware_version: str | None = None


class DeviceResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    device_id: str
    station_id: str
    organisation_id: str | None = None
    device_status: str = "active"  # "active","inactive","revoked"
    last_seen_at: datetime | None = None
    firmware_version: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None


class DeviceProvisionResponse(BaseModel):
    """Returned once at provisioning — API key shown only once."""

    model_config = ConfigDict(populate_by_name=True)

    device_id: str
    station_id: str
    api_key: str  # plaintext, shown once
    message: str = "Store this API key securely. It will not be shown again."
