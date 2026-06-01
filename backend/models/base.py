import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def init_db():
    from backend.models import user, strategy, subscription, notification_config, vault_transaction  # noqa: F401
    Base.metadata.create_all(bind=engine)


def get_db() -> Session:  # type: ignore[misc]
    """
    Yield a synchronous SQLAlchemy session.

    Routes that use this dependency MUST be declared as `def` (not `async def`)
    so FastAPI runs them in a threadpool — avoiding blocking the event loop.
    The only exception is routes that also perform async I/O (e.g. vault
    deposit/withdraw), which use `run_in_executor` or call async code separately.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
