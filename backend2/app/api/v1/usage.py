"""Usage metering endpoints."""
from __future__ import annotations
from fastapi import APIRouter, Depends
from app.core.dependencies import require_authenticated_user
from app.schemas.auth import UserContext
from app.schemas.subscriptions import UsageResponse
from app.integrations.firebase import get_firestore
from app.repositories.subscriptions_repository import (
    PlansRepository, SubscriptionsRepository, UsageRecordsRepository
)
from app.services.subscription_service import SubscriptionService

router = APIRouter(prefix="/usage", tags=["Plans & Subscriptions"])


def get_sub_service() -> SubscriptionService:
    db = get_firestore()
    return SubscriptionService(PlansRepository(db), SubscriptionsRepository(db), UsageRecordsRepository(db))


@router.get("", response_model=UsageResponse)
async def get_current_usage(
    user: UserContext = Depends(require_authenticated_user),
):
    """Get current billing period usage metrics and limits."""
    service = get_sub_service()
    return await service.get_usage_summary(
        uid=user.uid, organisation_id=user.organisation_id
    )

