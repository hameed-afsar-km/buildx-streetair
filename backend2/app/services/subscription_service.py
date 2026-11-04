"""Subscription, plan and usage management service."""
from __future__ import annotations
import logging
from datetime import datetime, timezone, timedelta
from typing import TYPE_CHECKING

from app.core.exceptions import SubscriptionError, NotFoundError
from app.repositories.firestore_base import new_id, now_utc

if TYPE_CHECKING:
    from app.repositories.subscriptions_repository import (
        PlansRepository, SubscriptionsRepository, UsageRecordsRepository
    )

logger = logging.getLogger(__name__)


class SubscriptionService:
    def __init__(
        self,
        plans_repo: "PlansRepository",
        subs_repo: "SubscriptionsRepository",
        usage_repo: "UsageRecordsRepository",
    ):
        self.plans_repo = plans_repo
        self.subs_repo = subs_repo
        self.usage_repo = usage_repo
    
    async def get_active_plans(self) -> list[dict]:
        return await self.plans_repo.list_active_plans()
    
    async def get_current_subscription(self, uid: str = None, 
                                        organisation_id: str = None) -> dict | None:
        return await self.subs_repo.get_active_subscription(
            uid=uid, organisation_id=organisation_id
        )
    
    async def check_entitlement(self, uid: str = None, 
                                 organisation_id: str = None,
                                 feature_key: str = "") -> bool:
        """Check if the user/org has access to a specific feature."""
        sub = await self.get_current_subscription(uid=uid, organisation_id=organisation_id)
        if not sub:
            return False
        plan_id = sub.get("plan_id")
        if not plan_id:
            return False
        plan = await self.plans_repo.get_by_id(plan_id)
        if not plan:
            return False
        entitlements = plan.get("feature_entitlements", {})
        return bool(entitlements.get(feature_key, False))
    
    async def record_usage(self, uid: str | None, organisation_id: str | None,
                            metric: str, quantity: int = 1, 
                            source: str = "api") -> None:
        """Record a usage event for metering."""
        from datetime import date
        period = date.today().strftime("%Y-%m")
        await self.usage_repo.increment_usage(
            uid=uid,
            organisation_id=organisation_id,
            metric=metric,
            quantity=quantity,
            period=period,
            source=source,
        )
    
    async def get_usage_summary(self, uid: str = None, 
                                 organisation_id: str = None) -> dict:
        """Get current period usage summary with limits."""
        from datetime import date
        period = date.today().strftime("%Y-%m")
        records = await self.usage_repo.get_period_usage(
            uid=uid, organisation_id=organisation_id, period=period
        )
        
        aggregated: dict[str, int] = {}
        for record in records:
            metric = record.get("metric", "unknown")
            aggregated[metric] = aggregated.get(metric, 0) + record.get("quantity", 0)
        
        sub = await self.get_current_subscription(uid=uid, organisation_id=organisation_id)
        limits = {}
        if sub:
            plan = await self.plans_repo.get_by_id(sub.get("plan_id", ""))
            if plan:
                limits = plan.get("usage_limits", {})
        
        metrics = {}
        all_metrics = set(list(aggregated.keys()) + list(limits.keys()))
        for metric in all_metrics:
            metrics[metric] = {
                "used": aggregated.get(metric, 0),
                "limit": limits.get(metric),
                "unit": "count",
            }
        
        return {
            "organisation_id": organisation_id,
            "uid": uid,
            "period": period,
            "metrics": metrics,
            "generated_at": now_utc().isoformat(),
        }
    
    async def request_subscription(self, uid: str, organisation_id: str | None,
                                    plan_id: str) -> dict:
        """Initiate a subscription request (demo state)."""
        from app.integrations.payments.interface import active_payment_provider
        plan = await self.plans_repo.get_by_id(plan_id)
        if not plan:
            raise NotFoundError(f"Plan '{plan_id}' not found.")
        
        payment_ref = await active_payment_provider.create_subscription_request(
            organisation_id=organisation_id or uid,
            plan_id=plan_id,
            price=plan.get("price", 0),
            currency=plan.get("currency", "INR"),
        )
        
        sub_id = new_id()
        now = now_utc()
        sub_data = {
            "subscription_id": sub_id,
            "organisation_id": organisation_id,
            "uid": uid,
            "plan_id": plan_id,
            "plan_name": plan.get("name", plan_id),
            "status": "demo",
            "billing_period": plan.get("billing_period", "monthly"),
            "start_at": now,
            "current_period_start": now,
            "current_period_end": now + timedelta(days=30),
            "provider_reference": payment_ref,
        }
        return await self.subs_repo.create(sub_data, doc_id=sub_id)

