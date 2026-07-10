"""
database.py — Async SQLAlchemy engine, session factory, and FastAPI dependency.

Driver: aiosqlite (non-blocking SQLite via asyncio)
"""

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    AsyncEngine,
    create_async_engine,
    async_sessionmaker,
)
from sqlalchemy.orm import declarative_base

# ---------------------------------------------------------------------------
# Database URL
# ---------------------------------------------------------------------------
DATABASE_URL = "sqlite+aiosqlite:///./multilingo.db"

# ---------------------------------------------------------------------------
# Engine
# connect_args: check_same_thread=False is required for SQLite
# echo=True emits SQL to stdout — flip to False in production
# ---------------------------------------------------------------------------
engine: AsyncEngine = create_async_engine(
    DATABASE_URL,
    echo=True,
    connect_args={"check_same_thread": False},
)

# ---------------------------------------------------------------------------
# Session factory
# expire_on_commit=False keeps ORM objects usable after the session commits,
# which is critical for async usage where the session closes immediately.
# ---------------------------------------------------------------------------
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# ---------------------------------------------------------------------------
# Declarative base (imported by models.py)
# ---------------------------------------------------------------------------
Base = declarative_base()


# ---------------------------------------------------------------------------
# FastAPI dependency — yields an AsyncSession per request
# ---------------------------------------------------------------------------
async def get_db() -> AsyncSession:  # type: ignore[return]
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
