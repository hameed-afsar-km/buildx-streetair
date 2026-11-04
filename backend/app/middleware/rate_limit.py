"""
In-memory sliding window rate limiter middleware.
"""
from __future__ import annotations
import time
import logging
from collections import defaultdict, deque
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

from app.core.config import settings

logger = logging.getLogger(__name__)


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, requests_per_minute: int = 60):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.window_seconds = 60
        self._request_log: dict[str, deque] = defaultdict(deque)
    
    async def dispatch(self, request: Request, call_next) -> Response:
        client_ip = self._get_client_ip(request)
        path = request.url.path
        
        limit = settings.RATE_LIMIT_INGEST_PER_MINUTE if "/ingest" in path else self.requests_per_minute
        
        now = time.monotonic()
        window_start = now - self.window_seconds
        
        requests = self._request_log[client_ip]
        while requests and requests[0] < window_start:
            requests.popleft()
        
        if len(requests) >= limit:
            logger.warning("Rate limit exceeded for IP %s on path %s", client_ip, path)
            return JSONResponse(
                status_code=429,
                content={
                    "error_code": "RATE_LIMIT_EXCEEDED",
                    "message": "Too many requests. Please slow down.",
                    "request_id": getattr(request.state, "request_id", None),
                },
                headers={"Retry-After": "60"},
            )
        
        requests.append(now)
        response = await call_next(request)
        return response
    
    def _get_client_ip(self, request: Request) -> str:
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        if request.client:
            return request.client.host
        return "unknown"

