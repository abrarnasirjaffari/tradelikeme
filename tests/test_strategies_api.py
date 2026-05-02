"""
FA12 — Test GET /strategies returns correct data.

Tests:
  1. GET /strategies — empty DB returns []
  2. GET /strategies — seeded DB returns all rows with correct fields
  3. GET /strategies/{id} — returns the matching strategy
  4. GET /strategies/{id} — unknown ID returns 404

Uses an in-memory SQLite database via FastAPI dependency override so no
real Supabase / Postgres connection is required.

Run from Platform/ root:
    python tests/test_strategies_api.py
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
from backend.models.strategy import Strategy
from backend.main import app

# ── in-memory SQLite engine for tests ────────────────────────────────────────
# StaticPool forces all connections to share one underlying connection so
# create_all() and the test sessions see the same in-memory database.

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


app.dependency_overrides[get_db] = _override_get_db
Base.metadata.create_all(bind=_engine)

client = TestClient(app)


# ── helpers ───────────────────────────────────────────────────────────────────

def _seed(*strategies: dict) -> list[str]:
    """Insert rows into the test DB and return their IDs."""
    db = _TestingSession()
    ids = []
    try:
        for s in strategies:
            row = Strategy(**s)
            db.add(row)
        db.commit()
        for s in strategies:
            db.refresh(
                db.query(Strategy).filter(Strategy.name == s["name"]).first()
            )
        ids = [
            str(db.query(Strategy).filter(Strategy.name == s["name"]).first().id)
            for s in strategies
        ]
    finally:
        db.close()
    return ids


def _clear():
    db = _TestingSession()
    try:
        db.query(Strategy).delete()
        db.commit()
    finally:
        db.close()


def _assert(condition: bool, msg: str) -> None:
    if not condition:
        print(f"FAIL: {msg}")
        sys.exit(1)
    print(f"PASS: {msg}")


# ── tests ─────────────────────────────────────────────────────────────────────

def test_list_empty():
    print("--- Test 1: GET /strategies — empty DB returns [] ---")
    _clear()
    resp = client.get("/strategies")
    _assert(resp.status_code == 200, f"status 200 (got {resp.status_code})")
    _assert(resp.json() == [], "empty list returned when no strategies")


def test_list_returns_all():
    print("--- Test 2: GET /strategies — returns all seeded rows ---")
    _clear()
    _seed(
        {"name": "S/D Zone Strategy", "tier": "S", "win_rate": 0.89, "monthly_return": 0.08, "status": "active"},
        {"name": "Momentum Strategy", "tier": "B", "win_rate": 0.68, "monthly_return": 0.05, "status": "paused"},
    )
    resp = client.get("/strategies")
    _assert(resp.status_code == 200, f"status 200 (got {resp.status_code})")
    data = resp.json()
    _assert(len(data) == 2, f"2 strategies returned (got {len(data)})")

    names = {s["name"] for s in data}
    _assert("S/D Zone Strategy" in names, "S/D Zone Strategy present")
    _assert("Momentum Strategy" in names, "Momentum Strategy present")

    sd = next(s for s in data if s["name"] == "S/D Zone Strategy")
    _assert(sd["tier"] == "S",                    f"tier=S (got {sd['tier']})")
    _assert(abs(sd["win_rate"] - 0.89) < 0.001,   f"win_rate=0.89 (got {sd['win_rate']})")
    _assert(abs(sd["monthly_return"] - 0.08) < 0.001, f"monthly_return=0.08 (got {sd['monthly_return']})")
    _assert(sd["status"] == "active",             f"status=active (got {sd['status']})")
    _assert("id" in sd,                           "id field present")


def test_get_by_id():
    print("--- Test 3: GET /strategies/{id} — returns correct strategy ---")
    _clear()
    (sid,) = _seed(
        {"name": "Zone Strategy", "tier": "A", "win_rate": 0.75, "monthly_return": 0.06, "status": "active"},
    )
    resp = client.get(f"/strategies/{sid}")
    _assert(resp.status_code == 200, f"status 200 (got {resp.status_code})")
    data = resp.json()
    _assert(data["id"] == sid,                  f"id matches (got {data['id']})")
    _assert(data["name"] == "Zone Strategy",    f"name matches (got {data['name']})")
    _assert(data["tier"] == "A",                f"tier=A (got {data['tier']})")
    _assert(data["status"] == "active",         f"status=active (got {data['status']})")


def test_get_by_id_not_found():
    print("--- Test 4: GET /strategies/{id} — unknown ID returns 404 ---")
    _clear()
    missing_id = str(uuid.uuid4())
    resp = client.get(f"/strategies/{missing_id}")
    _assert(resp.status_code == 404, f"status 404 (got {resp.status_code})")
    _assert("not found" in resp.json().get("detail", "").lower(), "detail mentions 'not found'")


# ── main ──────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    test_list_empty()
    test_list_returns_all()
    test_get_by_id()
    test_get_by_id_not_found()

    print()
    print("=" * 55)
    print("ALL STRATEGIES API TESTS PASSED — FA12 done")
    print("=" * 55)
