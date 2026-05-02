"""
Agent control routes — start, stop, and status per strategy.

Each strategy runs as an isolated asyncio task inside the FastAPI process.
State is kept in _agent_registry (module-level) keyed by strategy_id string.
This is sufficient for a single-server demo; in production each strategy
runs in its own Docker container managed by Dokploy.
"""
import asyncio
import logging
from datetime import datetime, timezone
from typing import Literal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.auth import CurrentUser, require_admin
from backend.models.base import get_db
from backend.models.strategy import Strategy

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/agent", tags=["agent"])

AgentStatus = Literal["running", "stopped", "error"]


class _AgentState:
    def __init__(self) -> None:
        self.status: AgentStatus = "stopped"
        self.task: asyncio.Task | None = None
        self.started_at: datetime | None = None
        self.stopped_at: datetime | None = None
        self.error: str | None = None


# module-level registry — keyed by strategy_id (str)
_agent_registry: dict[str, _AgentState] = {}


def _get_or_create(strategy_id: str) -> _AgentState:
    if strategy_id not in _agent_registry:
        _agent_registry[strategy_id] = _AgentState()
    return _agent_registry[strategy_id]


async def _run_agent(strategy_id: str) -> None:
    """
    Placeholder agent coroutine.
    In production this constructs the real LoopOrchestrator for the strategy
    and calls startup() / shutdown(). Swapped in once exchange clients are wired.
    """
    state = _get_or_create(strategy_id)
    logger.info("Agent started for strategy %s", strategy_id)
    try:
        while True:
            await asyncio.sleep(60)
    except asyncio.CancelledError:
        logger.info("Agent task cancelled for strategy %s", strategy_id)
        raise
    except Exception as exc:
        state.status = "error"
        state.error = str(exc)
        logger.exception("Agent error for strategy %s", strategy_id)


# ── response schema ──────────────────────────────────────────────────────────

class AgentStatusOut(BaseModel):
    strategy_id: UUID
    status: AgentStatus
    started_at: datetime | None
    stopped_at: datetime | None
    error: str | None


# ── routes ───────────────────────────────────────────────────────────────────

@router.post("/{strategy_id}/start", response_model=AgentStatusOut)
async def start_agent(strategy_id: UUID, db: Session = Depends(get_db), _: CurrentUser = Depends(require_admin)):
    strategy = db.query(Strategy).filter(Strategy.id == strategy_id).first()
    if not strategy:
        raise HTTPException(status_code=404, detail="Strategy not found")

    sid = str(strategy_id)
    state = _get_or_create(sid)

    if state.status == "running" and state.task and not state.task.done():
        raise HTTPException(status_code=409, detail="Agent already running for this strategy")

    state.error = None
    state.started_at = datetime.now(timezone.utc)
    state.stopped_at = None
    state.status = "running"
    state.task = asyncio.create_task(_run_agent(sid), name=f"agent-{sid}")

    def _on_done(task: asyncio.Task) -> None:
        if not task.cancelled() and task.exception():
            state.status = "error"
            state.error = str(task.exception())
        elif state.status == "running":
            state.status = "stopped"
        state.stopped_at = datetime.now(timezone.utc)

    state.task.add_done_callback(_on_done)

    logger.info("Agent started: strategy=%s", sid)
    return AgentStatusOut(
        strategy_id=strategy_id,
        status=state.status,
        started_at=state.started_at,
        stopped_at=state.stopped_at,
        error=state.error,
    )


@router.post("/{strategy_id}/stop", response_model=AgentStatusOut)
async def stop_agent(strategy_id: UUID, db: Session = Depends(get_db), _: CurrentUser = Depends(require_admin)):
    strategy = db.query(Strategy).filter(Strategy.id == strategy_id).first()
    if not strategy:
        raise HTTPException(status_code=404, detail="Strategy not found")

    sid = str(strategy_id)
    state = _get_or_create(sid)

    if state.status != "running" or not state.task or state.task.done():
        raise HTTPException(status_code=409, detail="Agent is not running for this strategy")

    state.task.cancel()
    try:
        await asyncio.wait_for(asyncio.shield(state.task), timeout=10.0)
    except (asyncio.CancelledError, asyncio.TimeoutError):
        pass

    state.status = "stopped"
    state.stopped_at = datetime.now(timezone.utc)
    logger.info("Agent stopped: strategy=%s", sid)

    return AgentStatusOut(
        strategy_id=strategy_id,
        status=state.status,
        started_at=state.started_at,
        stopped_at=state.stopped_at,
        error=state.error,
    )


@router.get("/{strategy_id}/status", response_model=AgentStatusOut)
def get_agent_status(strategy_id: UUID, db: Session = Depends(get_db), _: CurrentUser = Depends(require_admin)):
    strategy = db.query(Strategy).filter(Strategy.id == strategy_id).first()
    if not strategy:
        raise HTTPException(status_code=404, detail="Strategy not found")

    sid = str(strategy_id)
    state = _get_or_create(sid)

    # Sync the in-memory status with the actual task state
    if state.task and state.task.done() and state.status == "running":
        state.status = "stopped"
        state.stopped_at = datetime.now(timezone.utc)

    return AgentStatusOut(
        strategy_id=strategy_id,
        status=state.status,
        started_at=state.started_at,
        stopped_at=state.stopped_at,
        error=state.error,
    )
