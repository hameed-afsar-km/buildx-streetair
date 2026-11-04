"""
STREETAIR AI Engine — Intent Router
====================================
Routes user requests to internal data, RAG retrieval, Tavily search,
or deterministic calculations based on query classification.
"""

from __future__ import annotations

from enum import Enum


class IntentCategory(str, Enum):
    INTERNAL_DATA_QUERY = "internal_data_query"
    HISTORICAL_ANALYTICS = "historical_analytics"
    WHAT_IF_SCENARIO = "what_if_scenario"
    REGULATORY_STANDARDS = "regulatory_standards"
    CURRENT_EXTERNAL_NEWS = "current_external_news"
    GENERAL_EDUCATIONAL = "general_educational"


def route_intent(query: str, has_station_context: bool = False) -> IntentCategory:
    """
    Classify query intent to selectively trigger search, RAG, or internal data tools.
    """
    q = query.lower()

    if any(k in q for k in ["what if", "scenario", "traffic reduced", "cut emissions", "simulate"]):
        return IntentCategory.WHAT_IF_SCENARIO

    if any(k in q for k in ["news", "latest", "yesterday", "court", "today", "breaking", "delhi smog"]):
        return IntentCategory.CURRENT_EXTERNAL_NEWS

    if any(k in q for k in ["standard", "cpcb rule", "permissible limit", "safe level", "guideline", "law"]):
        return IntentCategory.REGULATORY_STANDARDS

    if has_station_context or any(k in q for k in ["station", "sensor", "reading", "current", "pm2.5", "temperature"]):
        return IntentCategory.INTERNAL_DATA_QUERY

    if any(k in q for k in ["trend", "average", "history", "compare", "uptime", "last week"]):
        return IntentCategory.HISTORICAL_ANALYTICS

    return IntentCategory.GENERAL_EDUCATIONAL

