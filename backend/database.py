"""
database.py — Async SQLAlchemy engine, session factory, and FastAPI dependency.

Supports both SQLite (local dev) and PostgreSQL (production via DATABASE_URL).
"""

import os

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    AsyncEngine,
    create_async_engine,
    async_sessionmaker,
)
from sqlalchemy.orm import declarative_base
from sqlalchemy.pool import NullPool

# ---------------------------------------------------------------------------
# Database URL
# ---------------------------------------------------------------------------
# Render provides postgres:// but SQLAlchemy's async engine needs
# postgresql+asyncpg://. Rewrite the scheme automatically.
_raw_url = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./multilingo.db")

if _raw_url.startswith("postgres://"):
    _raw_url = _raw_url.replace("postgres://", "postgresql+asyncpg://", 1)
elif _raw_url.startswith("postgresql://"):
    _raw_url = _raw_url.replace("postgresql://", "postgresql+asyncpg://", 1)

DATABASE_URL = _raw_url
_is_sqlite = DATABASE_URL.startswith("sqlite")

# ---------------------------------------------------------------------------
# Engine
# ---------------------------------------------------------------------------
# SQLite needs NullPool and check_same_thread=False.
# Postgres uses the default QueuePool — no special connect_args needed.
_engine_kwargs: dict = {"echo": False}

if _is_sqlite:
    _engine_kwargs["connect_args"] = {"check_same_thread": False}
    _engine_kwargs["poolclass"] = NullPool

engine: AsyncEngine = create_async_engine(DATABASE_URL, **_engine_kwargs)

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
