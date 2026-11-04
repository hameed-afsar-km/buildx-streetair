"""Request/response logging middleware."""
from __future__ import annotations
import time
import logging
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

logger = logging.getLogger(__name__)

SKIP_PATHS = {"/health", "/ready", "/favicon.ico"}


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        if request.url.path in SKIP_PATHS:
            return await call_next(request)
        
        start = time.monotonic()
        request_id = getattr(request.state, "request_id", "")
        
        try:
            response = await call_next(request)
            duration_ms = (time.monotonic() - start) * 1000
            logger.info(
                f"{request.method} {request.url.path} status={response.status_code} "
                f"duration={round(duration_ms, 2)}ms request_id={request_id}"
            )
            return response
        except Exception as e:
            duration_ms = (time.monotonic() - start) * 1000
            logger.error(
                f"{request.method} {request.url.path} error={str(e)} "
                f"duration={round(duration_ms, 2)}ms request_id={request_id}",
                exc_info=True,
            )
            raise

