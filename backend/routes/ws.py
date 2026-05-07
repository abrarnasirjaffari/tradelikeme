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

Auth: Client obtains a short-lived one-time-use ticket via POST /ws/ticket
      (authenticated), then connects WS with ?ticket=<value>. This avoids
      exposing session tokens in URL query strings (server/proxy logs).

Usage from agent/sentinel code:
    from backend.routes.ws import manager
    await manager.send_to_user(user_id, "TP1_HIT", {"symbol": "SOLUSDT", ...})
    await manager.broadcast("PRICE_UPDATE", {"symbol": "SOLUSDT", "price": 150.0})
"""

import asyncio
import json
import logging
import secrets
import time
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Depends, Query, WebSocket, WebSocketDisconnect
from pydantic import BaseModel

from backend.auth import CurrentUser, require_auth

logger = logging.getLogger(__name__)
router = APIRouter(tags=["websocket"])

# Maximum WebSocket connections per user
_MAX_CONNECTIONS_PER_USER = 5

# Ticket store: ticket -> (user_id, created_at)
# Tickets expire after 30 seconds and are single-use.
_TICKET_STORE: dict[str, tuple[str, float]] = {}
_TICKET_TTL_SECONDS = 30


class ConnectionManager:
    """Tracks all live WebSocket connections keyed by user_id."""

    def __init__(self) -> None:
        self._connections: dict[str, list[WebSocket]] = {}

    def connection_count(self, user_id: str) -> int:
        return len(self._connections.get(user_id, []))

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


def _cleanup_expired_tickets() -> None:
    """Remove expired tickets from the store."""
    now = time.time()
    expired = [k for k, (_, ts) in _TICKET_STORE.items() if now - ts > _TICKET_TTL_SECONDS]
    for k in expired:
        del _TICKET_STORE[k]


def _consume_ticket(ticket: str) -> str | None:
    """Validate and consume a one-time-use ticket. Returns user_id or None."""
    _cleanup_expired_tickets()
    entry = _TICKET_STORE.pop(ticket, None)
    if entry is None:
        return None
    user_id, created_at = entry
    if time.time() - created_at > _TICKET_TTL_SECONDS:
        return None
    return user_id


class TicketResponse(BaseModel):
    ticket: str


@router.post("/ws/ticket", response_model=TicketResponse)
async def create_ws_ticket(current_user: CurrentUser = Depends(require_auth)):
    """
    Issue a short-lived one-time-use ticket for WebSocket authentication.

    The client calls this authenticated endpoint, receives a ticket, then
    connects to /ws/live?ticket=<ticket>. The ticket expires in 30 seconds
    and can only be used once.
    """
    _cleanup_expired_tickets()
    ticket = secrets.token_urlsafe(32)
    _TICKET_STORE[ticket] = (current_user.id, time.time())
    return TicketResponse(ticket=ticket)


@router.websocket("/ws/live")
async def ws_live(websocket: WebSocket, ticket: str = Query(...)):
    """
    WebSocket endpoint for real-time dashboard updates.

    Connect: ws://api.tradelikeme.xyz/ws/live?ticket=<one-time-ticket>
    Obtain ticket via POST /ws/ticket (authenticated).
    """
    user_id = _consume_ticket(ticket)
    if not user_id:
        await websocket.close(code=4001, reason="Unauthorized")
        return

    # M10: Enforce max connections per user
    if manager.connection_count(user_id) >= _MAX_CONNECTIONS_PER_USER:
        await websocket.close(code=4008, reason="Too many connections")
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
