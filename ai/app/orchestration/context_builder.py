"""
STREETAIR AI Engine — Context Builder
=======================================
Sanitizes and bounds context before LLM injection to prevent prompt injection
and token overflow.
"""

from __future__ import annotations

import re
from typing import Any


def sanitize_input(text: str) -> str:
    """Removes control sequences and potential prompt injection instruction delimiters."""
    # Strip potential jailbreak formatting tags
    cleaned = re.sub(r"\[/?(SYSTEM|INSTRUCTION|CONTEXT|USER|ASSISTANT)\]", "", text, flags=re.IGNORECASE)
    return cleaned.strip()


def build_bounded_context(snippets: list[str], max_tokens_approx: int = 2000) -> str:
    """Combines text snippets keeping within a safe character budget."""
    char_budget = max_tokens_approx * 4
    accumulated: list[str] = []
    current_len = 0

    for s in snippets:
        s_sanitized = sanitize_input(s)
        if current_len + len(s_sanitized) > char_budget:
            # Truncate and stop
            remaining = char_budget - current_len
            if remaining > 100:
                accumulated.append(s_sanitized[:remaining] + "... [truncated]")
            break
        accumulated.append(s_sanitized)
        current_len += len(s_sanitized)

    return "\n\n".join(accumulated)

