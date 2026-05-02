"""
JWT / session validation for TradeLikeMe FastAPI backend.

BetterAuth issues opaque session tokens (not JWTs). To validate a token from
an external service, call BetterAuth's GET /api/auth/get-session endpoint with
the token in the Authorization header. BetterAuth returns the user + session
objects if valid, or a 401 if not.

Usage in routes:
    from backend.auth import require_auth, CurrentUser

    @router.get("/protected")
    def protected(user: CurrentUser = Depends(require_auth)):
        return {"user_id": user.id}

Public routes (no auth needed) simply omit the Depends(require_auth).
"""
import os
import logging
from typing import Annotated

import httpx
from fastapi import Depends, HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

logger = logging.getLogger(__name__)

BETTER_AUTH_URL = os.getenv("BETTER_AUTH_URL", "http://localhost:3000")
_bearer = HTTPBearer(auto_error=False)


class CurrentUser:
    def __init__(self, id: str, email: str, role: str = "user") -> None:
        self.id = id
        self.email = email
        self.role = role


async def require_auth(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Security(_bearer)],
) -> CurrentUser:
    """
    FastAPI dependency — validates the Bearer token against BetterAuth.

    Raises HTTP 401 if:
      - No Authorization header is present.
      - The token is rejected by BetterAuth.
      - BetterAuth is unreachable (to avoid open access on infra failure).

    Returns a CurrentUser populated from the BetterAuth session payload.
    """
    if not credentials:
        raise HTTPException(status_code=401, detail="Missing authorization token")

    token = credentials.credentials
    session_url = f"{BETTER_AUTH_URL}/api/auth/get-session"

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(
                session_url,
                headers={"Authorization": f"Bearer {token}"},
            )
    except httpx.RequestError as exc:
        logger.error("BetterAuth unreachable at %s: %s", session_url, exc)
        raise HTTPException(status_code=503, detail="Auth service unavailable")

    if resp.status_code == 401 or resp.status_code == 403:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    if not resp.is_success:
        logger.error("BetterAuth returned %s: %s", resp.status_code, resp.text)
        raise HTTPException(status_code=401, detail="Token validation failed")

    data = resp.json()
    user_data = data.get("user")
    if not user_data or not user_data.get("id"):
        raise HTTPException(status_code=401, detail="Invalid session payload")

    return CurrentUser(
        id=user_data["id"],
        email=user_data.get("email", ""),
        role=user_data.get("role", "user"),
    )


def require_admin(user: CurrentUser = Depends(require_auth)) -> CurrentUser:
    """Dependency that additionally enforces the 'admin' role."""
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user
