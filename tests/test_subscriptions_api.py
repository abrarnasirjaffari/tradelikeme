"""
FA13 — Test POST /subscriptions creates vault record.

Tests:
  1. POST /subscriptions — happy path, vault_address set — row created, status=active
  2. POST /subscriptions — vault_address omitted (nullable) — row created
  3. POST /subscriptions — user not found --404
  4. POST /subscriptions — strategy not found --404
  5. POST /subscriptions — duplicate active subscription --409
  6. DELETE /subscriptions/{id} — cancels active subscription --204
  7. DELETE /subscriptions/{id} — unknown ID --404
  8. DELETE /subscriptions/{id} — already cancelled --409

Uses in-memory SQLite + StaticPool. Auth dependency overridden (no BetterAuth needed).

Run from Platform/ root:
    python tests/test_subscriptions_api.py
"""
import os
import sys
import uuid

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

from backend.models.base import Base, get_db
from backend.models.user import User
from backend.models.strategy import Strategy
from backend.models.subscription import Subscription
from backend.auth import require_auth, CurrentUser
from backend.main import app

# ── in-memory SQLite ──────────────────────────────────────────────────────────

_engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
_TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=_engine)


def _override_get_db():
    db = _TestingSession()
    try:
        yield db
    finally:
        db.close()


# Auth user ID is set dynamically by _seed_user so ownership checks pass.
# Falls back to a random UUID if no user has been seeded yet.
_current_auth_user_id: str = str(uuid.uuid4())


def _override_require_auth():
    return CurrentUser(id=_current_auth_user_id, email="test@test.com", role="user")


app.dependency_overrides[get_db] = _override_get_db
app.dependency_overrides[require_auth] = _override_require_auth

Base.metadata.create_all(bind=_engine)

client = TestClient(app)


# ── seed helpers ──────────────────────────────────────────────────────────────

def _seed_user(email: str = "alice@test.com") -> str:
    """
    Seed a user with an auto-generated UUID, update the auth mock so
    ownership checks pass, and return the user's ID string.
    """
    global _current_auth_user_id
    db = _TestingSession()
    try:
        row = User(email=email)
        db.add(row)
        db.commit()
        db.refresh(row)
        uid = str(row.id)
        _current_auth_user_id = uid  # keep auth mock in sync
        return uid
    finally:
        db.close()


def _seed_strategy(name: str = "S/D Zone Strategy") -> str:
    db = _TestingSession()
    try:
        row = Strategy(name=name, tier="S", win_rate=0.89, monthly_return=0.08, status="active")
        db.add(row)
        db.commit()
        db.refresh(row)
        return str(row.id)
    finally:
        db.close()


def _clear():
    db = _TestingSession()
    try:
        db.query(Subscription).delete()
        db.query(Strategy).delete()
        db.query(User).delete()
        db.commit()
    finally:
        db.close()


def _assert(condition: bool, msg: str) -> None:
    if not condition:
        print(f"FAIL: {msg}")
        sys.exit(1)
    print(f"PASS: {msg}")


# ── tests ─────────────────────────────────────────────────────────────────────

def test_create_with_vault_address():
    print("--- Test 1: POST /subscriptions — creates row with vault_address ---")
    _clear()
    uid = _seed_user()
    sid = _seed_strategy()
    vault = "So11111111111111111111111111111111111111112"

    resp = client.post("/subscriptions", json={
        "user_id": uid,
        "strategy_id": sid,
        "vault_address": vault,
    })
    _assert(resp.status_code == 201, f"status 201 (got {resp.status_code})")
    data = resp.json()
    _assert(data["user_id"] == uid,           f"user_id matches (got {data['user_id']})")
    _assert(data["strategy_id"] == sid,       f"strategy_id matches (got {data['strategy_id']})")
    _assert(data["vault_address"] == vault,   f"vault_address stored (got {data['vault_address']})")
    _assert(data["status"] == "active",       f"status=active (got {data['status']})")
    _assert("id" in data,                     "id field present")


def test_create_without_vault_address():
    print("--- Test 2: POST /subscriptions — vault_address omitted (nullable) ---")
    _clear()
    uid = _seed_user()
    sid = _seed_strategy()

    resp = client.post("/subscriptions", json={
        "user_id": uid,
        "strategy_id": sid,
    })
    _assert(resp.status_code == 201, f"status 201 (got {resp.status_code})")
    data = resp.json()
    _assert(data["vault_address"] is None, f"vault_address=None (got {data['vault_address']})")
    _assert(data["status"] == "active",    f"status=active (got {data['status']})")


def test_create_user_not_found():
    print("--- Test 3: POST /subscriptions — user not found --404 ---")
    _clear()
    sid = _seed_strategy()
    # Use the current auth user's ID (passes ownership check) but don't seed
    # the user row so the DB lookup returns 404.
    resp = client.post("/subscriptions", json={
        "user_id": _current_auth_user_id,
        "strategy_id": sid,
    })
    _assert(resp.status_code == 404, f"status 404 (got {resp.status_code})")
    _assert("user" in resp.json()["detail"].lower(), "detail mentions user")


def test_create_strategy_not_found():
    print("--- Test 4: POST /subscriptions — strategy not found --404 ---")
    _clear()
    uid = _seed_user()
    resp = client.post("/subscriptions", json={
        "user_id": uid,
        "strategy_id": str(uuid.uuid4()),
    })
    _assert(resp.status_code == 404, f"status 404 (got {resp.status_code})")
    _assert("strategy" in resp.json()["detail"].lower(), "detail mentions strategy")


def test_create_duplicate_409():
    print("--- Test 5: POST /subscriptions — duplicate active subscription --409 ---")
    _clear()
    uid = _seed_user()
    sid = _seed_strategy()
    payload = {"user_id": uid, "strategy_id": sid}

    first = client.post("/subscriptions", json=payload)
    _assert(first.status_code == 201, "first subscription created")

    second = client.post("/subscriptions", json=payload)
    _assert(second.status_code == 409, f"status 409 on duplicate (got {second.status_code})")
    _assert("already" in second.json()["detail"].lower(), "detail mentions 'already'")


def test_cancel_subscription():
    print("--- Test 6: DELETE /subscriptions/{id} — cancels active subscription ---")
    _clear()
    uid = _seed_user()
    sid = _seed_strategy()
    created = client.post("/subscriptions", json={"user_id": uid, "strategy_id": sid})
    _assert(created.status_code == 201, "subscription created for delete test")
    sub_id = created.json()["id"]

    resp = client.delete(f"/subscriptions/{sub_id}")
    _assert(resp.status_code == 204, f"status 204 on cancel (got {resp.status_code})")

    # Verify cancel took effect: a second DELETE should return 409 "already cancelled"
    resp2 = client.delete(f"/subscriptions/{sub_id}")
    _assert(resp2.status_code == 409, f"second cancel returns 409 (got {resp2.status_code})")
    _assert("already" in resp2.json()["detail"].lower(), "detail confirms already cancelled")


def test_cancel_not_found():
    print("--- Test 7: DELETE /subscriptions/{id} — unknown ID --404 ---")
    _clear()
    resp = client.delete(f"/subscriptions/{uuid.uuid4()}")
    _assert(resp.status_code == 404, f"status 404 (got {resp.status_code})")


def test_cancel_already_cancelled():
    print("--- Test 8: DELETE /subscriptions/{id} — already cancelled --409 ---")
    _clear()
    uid = _seed_user()
    sid = _seed_strategy()
    created = client.post("/subscriptions", json={"user_id": uid, "strategy_id": sid})
    sub_id = created.json()["id"]

    client.delete(f"/subscriptions/{sub_id}")  # first cancel
    resp = client.delete(f"/subscriptions/{sub_id}")  # second cancel
    _assert(resp.status_code == 409, f"status 409 on double cancel (got {resp.status_code})")
    _assert("already" in resp.json()["detail"].lower(), "detail mentions 'already'")


# ── main ──────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    test_create_with_vault_address()
    test_create_without_vault_address()
    test_create_user_not_found()
    test_create_strategy_not_found()
    test_create_duplicate_409()
    test_cancel_subscription()
    test_cancel_not_found()
    test_cancel_already_cancelled()

    print()
    print("=" * 55)
    print("ALL SUBSCRIPTIONS API TESTS PASSED — FA13 done")
    print("=" * 55)
