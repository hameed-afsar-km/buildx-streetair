"""
STREETAIR structured logging configuration.

Usage:
    from app.core.logging import configure_logging, get_logger

    configure_logging(settings.LOG_LEVEL, settings.is_production)
    logger = get_logger(__name__)
    logger.info("started", port=8000)
"""

from __future__ import annotations

import logging
import sys
from typing import Any

import structlog
from structlog.types import EventDict, WrappedLogger


# ---------------------------------------------------------------------------
# Custom processors
# ---------------------------------------------------------------------------

def _add_log_level_number(
    logger: WrappedLogger, method: str, event_dict: EventDict
) -> EventDict:
    """Add the numeric log level alongside the level name for log-aggregators."""
    level_name: str = event_dict.get("level", method).upper()
    event_dict["level_number"] = logging.getLevelName(level_name)
    return event_dict


def _drop_color_message_key(
    logger: WrappedLogger, method: str, event_dict: EventDict
) -> EventDict:
    """Remove the internal 'color_message' key added by uvicorn before JSON export."""
    event_dict.pop("color_message", None)
    return event_dict


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def configure_logging(log_level: str, is_production: bool) -> None:
    """
    Configure both stdlib ``logging`` and ``structlog``.

    Parameters
    ----------
    log_level:
        A Python log-level name such as ``"INFO"`` or ``"DEBUG"``.
    is_production:
        When *True* the JSON renderer is used (machine-readable).
        When *False* the coloured console renderer is used (human-readable).
    """
    level: int = logging.getLevelName(log_level.upper())

    # ------------------------------------------------------------------
    # 1. Shared pre-chain processors (run before the final renderer)
    # ------------------------------------------------------------------
    shared_processors: list[Any] = [
        structlog.contextvars.merge_contextvars,          # merge bound context vars
        structlog.stdlib.add_logger_name,                 # add "logger" key
        structlog.stdlib.add_log_level,                   # add "level" key
        _add_log_level_number,                            # add numeric level
        structlog.stdlib.PositionalArgumentsFormatter(),  # %s-style formatting
        structlog.processors.TimeStamper(fmt="iso", utc=True),  # UTC ISO timestamp
        _drop_color_message_key,                          # clean uvicorn artefacts
        structlog.processors.StackInfoRenderer(),         # render stack_info
        structlog.processors.format_exc_info,             # render exc_info
        structlog.processors.UnicodeDecoder(),            # decode bytes values
    ]

    # ------------------------------------------------------------------
    # 2. Final renderer
    # ------------------------------------------------------------------
    if is_production:
        final_renderer: Any = structlog.processors.JSONRenderer()
    else:
        final_renderer = structlog.dev.ConsoleRenderer(colors=True)

    # ------------------------------------------------------------------
    # 3. Configure structlog
    # ------------------------------------------------------------------
    structlog.configure(
        processors=shared_processors
        + [
            # Bridge structlog → stdlib for the final handler step
            structlog.stdlib.ProcessorFormatter.wrap_for_formatter,
        ],
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )

    # ------------------------------------------------------------------
    # 4. Configure stdlib root logger with structlog's ProcessorFormatter
    # ------------------------------------------------------------------
    formatter = structlog.stdlib.ProcessorFormatter(
        # Processors applied only to stdlib log records (not structlog ones)
        foreign_pre_chain=shared_processors,
        processors=[
            structlog.stdlib.ProcessorFormatter.remove_processors_meta,
            final_renderer,
        ],
    )

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)

    root_logger = logging.getLogger()
    root_logger.handlers.clear()
    root_logger.addHandler(handler)
    root_logger.setLevel(level)

    # Suppress noisy third-party loggers in production
    for noisy in ("uvicorn.access", "httpx", "httpcore"):
        logging.getLogger(noisy).setLevel(logging.WARNING)


def get_logger(name: str) -> structlog.stdlib.BoundLogger:
    """
    Return a structlog bound-logger for *name*.

    The returned logger automatically inherits any context variables bound
    with ``structlog.contextvars.bind_contextvars(request_id=...)``.

    Parameters
    ----------
    name:
        Typically ``__name__`` of the calling module.

    Returns
    -------
    structlog.stdlib.BoundLogger
    """
    return structlog.get_logger(name)
