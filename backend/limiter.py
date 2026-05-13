"""
Shared rate limiter instance.

Defined here (not in main.py) to break the circular import that would occur if
route files imported the limiter from main.py at decoration time.

Usage in routes:
    from backend.limiter import limiter

Usage in main.py:
    from backend.limiter import limiter
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
"""
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address, default_limits=["60/minute"])
