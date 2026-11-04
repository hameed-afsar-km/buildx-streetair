"""
STREETAIR AI Engine — Tool Registry & Orchestration Support
=============================================================
Allowlisted, constrained deterministic tools for the conversational agent.
Prevents arbitrary execution or SQL injection.
"""

from __future__ import annotations

from typing import Any, Callable
from pydantic import BaseModel


class ToolDefinition(BaseModel):
    name: str
    description: str
    parameters_schema: dict[str, Any]


# Strictly allowlisted tools
ALLOWLISTED_TOOLS = {
    "calculate_aqi": "Compute authoritative CPCB AQI from 24h averaged PM2.5 and PM10.",
    "detect_anomalies": "Run statistical anomaly detector on station readings.",
    "simulate_scenario": "Execute deterministic What-If scenario (traffic, burning, dust).",
    "search_knowledge_base": "Search verified environmental guidelines and CPCB standards.",
    "search_web_news": "Search Tavily for current real-time environmental news.",
}


class ToolRegistry:
    def __init__(self) -> None:
        self._tools: dict[str, Callable[..., Any]] = {}

    def register(self, name: str, func: Callable[..., Any]) -> None:
        if name not in ALLOWLISTED_TOOLS:
            raise ValueError(f"Tool '{name}' is not in the approved allowlist.")
        self._tools[name] = func

    def get_tool(self, name: str) -> Callable[..., Any] | None:
        return self._tools.get(name)

    def list_tools(self) -> list[ToolDefinition]:
        return [
            ToolDefinition(name=k, description=v, parameters_schema={})
            for k, v in ALLOWLISTED_TOOLS.items()
        ]

