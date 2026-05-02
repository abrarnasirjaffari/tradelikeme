"""
FA14 - Test WS /ws/live delivers price update.

Two test layers:
  Endpoint tests (TestClient) -- auth, CONNECTED frame, ping/pong, disconnect cleanup
  Manager unit tests (asyncio) -- broadcast and send_to_user delivery via mock WebSockets

Run from Platform/ root:
    python tests/test_ws_live.py
"""
import asyncio
import json
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

from fastapi.testclient import TestClient
import backend.routes.ws as ws_mod
from backend.main import app

# ---- patch _validate_token so no BetterAuth call is made ------------------

_VALID_TOKEN = "good-token"
_USER_ID = "user-abc-123"


async def _mock_validate_token(token: str):
    return _USER_ID if token == _VALID_TOKEN else None


ws_mod._validate_token = _mock_validate_token

client = TestClient(app)


def _assert(condition: bool, msg: str) -> None:
    if not condition:
        print(f"FAIL: {msg}")
        sys.exit(1)
    print(f"PASS: {msg}")


# ---- mock WebSocket for unit-testing ConnectionManager --------------------

class MockWebSocket:
    """Minimal stand-in for starlette WebSocket used in ConnectionManager tests."""

    def __init__(self):
        self.sent: list[str] = []
        self._fail = False

    async def accept(self) -> None:
        pass

    async def send_text(self, text: str) -> None:
        if self._fail:
            raise RuntimeError("dead connection")
        self.sent.append(text)

    def last(self) -> dict:
        return json.loads(self.sent[-1])


# ---- endpoint tests --------------------------------------------------------

def test_connected_frame():
    print("--- Test 1: valid token -- CONNECTED frame received ---")
    with client.websocket_connect(f"/ws/live?token={_VALID_TOKEN}") as ws:
        frame = json.loads(ws.receive_text())
        _assert(frame["event"] == "CONNECTED",        f"event=CONNECTED (got {frame['event']})")
        _assert(frame["data"]["user_id"] == _USER_ID, f"user_id in data")
        _assert("ts" in frame,                        "ts field present")


def test_invalid_token_rejected():
    print("--- Test 2: invalid token -- connection closed ---")
    try:
        with client.websocket_connect("/ws/live?token=bad-token") as ws:
            ws.receive_text()
        _assert(False, "expected rejection was not raised")
    except Exception as exc:
        _assert(True, f"connection rejected ({type(exc).__name__})")


def test_ping_pong():
    print("--- Test 3: client sends ping -- server replies pong ---")
    with client.websocket_connect(f"/ws/live?token={_VALID_TOKEN}") as ws:
        ws.receive_text()  # consume CONNECTED
        ws.send_text("ping")
        frame = json.loads(ws.receive_text())
        _assert(frame["event"] == "pong", f"event=pong (got {frame['event']})")


def test_disconnect_cleans_registry():
    print("--- Test 4: disconnect removes user from registry ---")
    ws_mod.manager._connections.pop(_USER_ID, None)

    with client.websocket_connect(f"/ws/live?token={_VALID_TOKEN}") as ws:
        ws.receive_text()  # consume CONNECTED
        _assert(_USER_ID in ws_mod.manager._connections, "user in registry while connected")

    _assert(_USER_ID not in ws_mod.manager._connections, "user removed after disconnect")


# ---- manager unit tests (pure asyncio, no TestClient) ----------------------

async def _test_broadcast_delivers():
    print("--- Test 5: manager.broadcast delivers PRICE_UPDATE ---")
    mgr = ws_mod.ConnectionManager()
    ws1, ws2 = MockWebSocket(), MockWebSocket()

    await mgr.connect(ws1, "user-1")
    await mgr.connect(ws2, "user-2")

    await mgr.broadcast("PRICE_UPDATE", {"symbol": "SOLUSDT", "price": 152.5})

    for ws, uid in ((ws1, "user-1"), (ws2, "user-2")):
        frame = ws.last()
        _assert(frame["event"] == "PRICE_UPDATE",     f"{uid}: event=PRICE_UPDATE")
        _assert(frame["data"]["symbol"] == "SOLUSDT", f"{uid}: symbol=SOLUSDT")
        _assert(frame["data"]["price"] == 152.5,      f"{uid}: price=152.5")
        _assert("ts" in frame,                        f"{uid}: ts present")


async def _test_send_to_user_targeted():
    print("--- Test 6: manager.send_to_user delivers to correct user only ---")
    mgr = ws_mod.ConnectionManager()
    ws_a, ws_b = MockWebSocket(), MockWebSocket()

    await mgr.connect(ws_a, "alice")
    await mgr.connect(ws_b, "bob")

    await mgr.send_to_user("alice", "TP1_HIT", {"symbol": "SOLUSDT", "sl_moved_to": 150.0})

    _assert(len(ws_a.sent) == 1, "alice received exactly 1 message")
    _assert(len(ws_b.sent) == 0, "bob received nothing")

    frame = ws_a.last()
    _assert(frame["event"] == "TP1_HIT",               "event=TP1_HIT")
    _assert(frame["data"]["sl_moved_to"] == 150.0,     "sl_moved_to correct")


async def _test_dead_connection_pruned():
    print("--- Test 7: dead WebSocket pruned from registry on next broadcast ---")
    mgr = ws_mod.ConnectionManager()
    alive, dead = MockWebSocket(), MockWebSocket()
    dead._fail = True  # simulate dropped connection

    await mgr.connect(alive, "user-x")
    await mgr.connect(dead, "user-x")
    _assert(len(mgr._connections["user-x"]) == 2, "2 connections before broadcast")

    await mgr.broadcast("PRICE_UPDATE", {"symbol": "BTCUSDT", "price": 60000})

    _assert("user-x" in mgr._connections,              "user-x still in registry (alive conn)")
    _assert(len(mgr._connections["user-x"]) == 1,      "dead conn pruned, 1 remaining")
    _assert(alive in mgr._connections["user-x"],       "alive conn retained")


async def _test_send_to_unknown_user():
    print("--- Test 8: send_to_user on unknown user does not raise ---")
    mgr = ws_mod.ConnectionManager()
    await mgr.send_to_user("nonexistent-user", "SL_HIT", {"symbol": "SOLUSDT"})
    _assert(True, "no exception on unknown user")


def run_async_tests():
    asyncio.run(_test_broadcast_delivers())
    asyncio.run(_test_send_to_user_targeted())
    asyncio.run(_test_dead_connection_pruned())
    asyncio.run(_test_send_to_unknown_user())


# ---- main ------------------------------------------------------------------

if __name__ == "__main__":
    test_connected_frame()
    test_invalid_token_rejected()
    test_ping_pong()
    test_disconnect_cleans_registry()
    run_async_tests()

    print()
    print("=" * 55)
    print("ALL WS /ws/live TESTS PASSED -- FA14 done")
    print("=" * 55)
