import time
import threading
from collections import defaultdict

from fastapi import HTTPException, Request, status


class RateLimiter:
    """Simple in-memory sliding window rate limiter."""

    def __init__(self) -> None:
        self._requests: dict[str, list[float]] = defaultdict(list)
        self._lock = threading.Lock()

    def _cleanup(self, key: str, window_seconds: int) -> None:
        """Remove expired timestamps for a given key."""
        now = time.time()
        cutoff = now - window_seconds
        self._requests[key] = [t for t in self._requests[key] if t > cutoff]

    def check(self, key: str, max_requests: int, window_seconds: int) -> None:
        """Check rate limit. Raises HTTPException(429) if exceeded."""
        with self._lock:
            self._cleanup(key, window_seconds)
            if len(self._requests[key]) >= max_requests:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Too many requests",
                    headers={"Retry-After": str(window_seconds)},
                )
            self._requests[key].append(time.time())


# Global singleton
_limiter = RateLimiter()


def rate_limit(max_requests: int, window_seconds: int):
    """FastAPI dependency that enforces rate limiting per client IP."""

    async def _rate_limit_dep(request: Request) -> None:
        client_ip = request.client.host if request.client else "unknown"
        key = f"{client_ip}:{request.url.path}"
        _limiter.check(key, max_requests, window_seconds)

    return _rate_limit_dep


def get_limiter() -> RateLimiter:
    """Access global limiter for testing purposes."""
    return _limiter


def reset_limiter() -> None:
    """Reset all rate limit state (for testing)."""
    global _limiter
    _limiter = RateLimiter()
