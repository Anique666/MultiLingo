"""routers/leaderboard.py — Leaderboard endpoint.

GET /leaderboard
"""

from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models import User
from schemas import LeaderboardUserRead

router = APIRouter(tags=["leaderboard"])


async def fetch_leaderboard(db: AsyncSession) -> List[LeaderboardUserRead]:
    """Return the top 10 users ordered by XP."""
    result = await db.execute(
        select(User)
        .where(User.xp > 0)
        .order_by(User.xp.desc(), User.id.asc())
        .limit(20)
    )
    users = result.scalars().all()
    return [LeaderboardUserRead.model_validate(user) for user in users]


@router.get(
    "/leaderboard",
    response_model=List[LeaderboardUserRead],
    summary="Get the top 10 users by XP",
)
async def get_leaderboard(
    db: AsyncSession = Depends(get_db),
) -> List[LeaderboardUserRead]:
    return await fetch_leaderboard(db)