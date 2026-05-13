import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from backend.limiter import limiter
from backend.models.base import init_db
from backend.routes import strategies, subscriptions, vaults, trades, notifications, users, admin, agent, ws

load_dotenv()

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="TradeLikeMe API",
    version="1.0.0",
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(strategies.router)
app.include_router(subscriptions.router)
app.include_router(vaults.router)
app.include_router(trades.router)
app.include_router(notifications.router)
app.include_router(users.router)
app.include_router(admin.router)
app.include_router(agent.router)
app.include_router(ws.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
