from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class PlanResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    plan_id: str
    name: str  # "STARTER","PROFESSIONAL","ENTERPRISE"
    billing_period: str  # "monthly","annual","custom"
    price: float
    currency: str = "INR"
    feature_entitlements: dict  # feature_key -> bool or limit
    usage_limits: dict  # metric -> limit
    active: bool
    display_order: int


class SubscriptionResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    subscription_id: str
    organisation_id: str | None = None
    uid: str | None = None
    plan_id: str
    plan_name: str | None = None
    status: str = "active"  # "active","cancelled","expired","trial","demo"
    billing_period: str = "monthly"
    start_at: datetime | None = None
    current_period_start: datetime | None = None
    current_period_end: datetime | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None


class UsageResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    organisation_id: str | None
    uid: str | None
    period: str  # "YYYY-MM"
    metrics: dict[str, dict]  # metric -> {used, limit, unit}
    generated_at: datetime
