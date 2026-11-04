"""Request ID middleware — attaches a unique request_id to every request."""
from __future__ import annotations
import uuid
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

REQUEST_ID_HEADER = "X-Request-ID"


class RequestIDMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        request_id = request.headers.get(REQUEST_ID_HEADER) or str(uuid.uuid4())
        request.state.request_id = request_id
        
        try:
            import structlog
            structlog.contextvars.clear_contextvars()
            structlog.contextvars.bind_contextvars(request_id=request_id)
        except Exception:
            pass
        
        response = await call_next(request)
        response.headers[REQUEST_ID_HEADER] = request_id
        return response

