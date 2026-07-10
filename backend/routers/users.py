"""
routers/users.py — User progress endpoint.

GET /users/{user_id}/progress
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models import User
from schemas import UserProgressResponse

router = APIRouter(prefix="/users", tags=["users"])


# ---------------------------------------------------------------------------
# Controller
# ---------------------------------------------------------------------------

async def fetch_user_progress(
    db: AsyncSession,
    user_id: int,
) -> UserProgressResponse:
    """Load a user's headline stats."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id={user_id} not found.",
        )
    return UserProgressResponse(
        xp=user.xp,
        streak=user.streak,
        hearts=user.hearts,
        last_active=user.last_active,
    )


# ---------------------------------------------------------------------------
# Route
# ---------------------------------------------------------------------------

@router.get(
    "/{user_id}/progress",
    response_model=UserProgressResponse,
    summary="Get a user's progress stats",
    responses={404: {"description": "User not found"}},
)
async def get_user_progress(
    user_id: int,
    db: AsyncSession = Depends(get_db),
) -> UserProgressResponse:
    return await fetch_user_progress(db, user_id)
