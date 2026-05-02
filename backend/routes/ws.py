"""
WebSocket /ws/live — real-time push for the TradeLikeMe dashboard.

Events pushed:
  CONNECTED      — sent immediately on successful auth
  PRICE_UPDATE   — latest price for a symbol
  TRADE_ENTERED  — new trade opened
  TP1_HIT        — TP1 reached, SL moved to entry
  TP2_HIT        — TP2 reached, trade complete
  SL_HIT         — stop loss triggered
  AGENT_STATUS   — agent start/stop/error
  BALANCE_UPDATE — vault balance changed
  ping/pong      — keepalive

Auth: Bearer token passed as ?token=<value> query param (browsers cannot
      set custom Authorization headers on WebSocket upgrades).

Usage from agent/sentinel code:
    from backend.routes.ws import manager
    await manager.send_to_user(user_id, "TP1_HIT", {"symbol": "SOLUSDT", ...})
    await manager.broadcast("PRICE_UPDATE", {"symbol": "SOLUSDT", "price": 150.0})
"""

import asyncio
import json
import logging
from datetime import datetime, timezone
from typing import Any

import httpx
from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect

from backend.auth import BETTER_AUTH_URL

logger = logging.getLogger(__name__)
router = APIRouter(tags=["websocket"])


class ConnectionManager:
    """Tracks all live WebSocket connections keyed by user_id."""

    def __init__(self) -> None:
        self._connections: dict[str, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: str) -> None:
        await websocket.accept()
        self._connections.setdefault(user_id, []).append(websocket)
        logger.info("WS connected: user=%s total=%d", user_id, self._total())

    def disconnect(self, websocket: WebSocket, user_id: str) -> None:
        conns = self._connections.get(user_id, [])
        if websocket in conns:
            conns.remove(websocket)
        if not conns:
            self._connections.pop(user_id, None)
        logger.info("WS disconnected: user=%s total=%d", user_id, self._total())

    async def send_to_user(self, user_id: str, event: str, data: Any) -> None:
        """Push an event to all connections belonging to one user."""
        payload = _pack(event, data)
        dead: list[WebSocket] = []
        for ws in list(self._connections.get(user_id, [])):
            try:
                await ws.send_text(payload)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws, user_id)

    async def broadcast(self, event: str, data: Any) -> None:
        """Push an event to every connected user."""
        payload = _pack(event, data)
        dead: list[tuple[str, WebSocket]] = []
        for user_id, conns in list(self._connections.items()):
            for ws in list(conns):
                try:
                    await ws.send_text(payload)
                except Exception:
                    dead.append((user_id, ws))
        for user_id, ws in dead:
            self.disconnect(ws, user_id)

    def _total(self) -> int:
        return sum(len(v) for v in self._connections.values())


manager = ConnectionManager()

_PING_INTERVAL = 25  # seconds between server-side pings


def _pack(event: str, data: Any) -> str:
    return json.dumps({"event": event, "data": data, "ts": datetime.now(timezone.utc).isoformat()})


async def _validate_token(token: str) -> str | None:
    """Return user_id if the BetterAuth session token is valid, else None."""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(
                f"{BETTER_AUTH_URL}/api/auth/get-session",
                headers={"Authorization": f"Bearer {token}"},
            )
        if not resp.is_success:
            return None
        user_data = resp.json().get("user") or {}
        return user_data.get("id") or None
    except Exception as exc:
        logger.warning("WS token validation error: %s", exc)
        return None


@router.websocket("/ws/live")
async def ws_live(websocket: WebSocket, token: str = Query(...)):
    """
    WebSocket endpoint for real-time dashboard updates.

    Connect: ws://api.tradelikeme.xyz/ws/live?token=<bearer-token>
    """
    user_id = await _validate_token(token)
    if not user_id:
        await websocket.close(code=4001, reason="Unauthorized")
        return

    await manager.connect(websocket, user_id)
    try:
        await websocket.send_text(_pack("CONNECTED", {"user_id": user_id}))

        while True:
            try:
                msg = await asyncio.wait_for(websocket.receive_text(), timeout=_PING_INTERVAL)
                if msg == "ping":
                    await websocket.send_text(_pack("pong", {}))
            except asyncio.TimeoutError:
                # No message from client in _PING_INTERVAL seconds — probe it
                try:
                    await websocket.send_text(_pack("ping", {}))
                except Exception:
                    break  # dead connection
    except WebSocketDisconnect:
        pass
    finally:
        manager.disconnect(websocket, user_id)
