"""
routers/users.py — User progress endpoint.

GET /users/progress
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import update, delete, select, func, or_, and_

from models import User, UserProgress
from security import get_current_user
from database import get_db
from schemas import UserProgressResponse

router = APIRouter(prefix="/users", tags=["users"])


# ---------------------------------------------------------------------------
# Controller
# ---------------------------------------------------------------------------

async def fetch_user_progress(db: AsyncSession, current_user: User) -> UserProgressResponse:
    """Load a user's headline stats and their leaderboard rank."""
    import datetime
    
    # Heart regeneration logic
    now = datetime.datetime.utcnow()
    updated_at = datetime.datetime.fromisoformat(current_user.hearts_updated_at) if current_user.hearts_updated_at else now

    if current_user.hearts < 5:
        delta_seconds = (now - updated_at).total_seconds()
        seconds_per_heart = 5 * 3600
        
        if delta_seconds >= seconds_per_heart:
            hearts_to_add = int(delta_seconds // seconds_per_heart)
            current_user.hearts = min(current_user.hearts + hearts_to_add, 5)
            if current_user.hearts >= 5:
                current_user.hearts_updated_at = now.isoformat()
            else:
                new_updated = updated_at + datetime.timedelta(seconds=hearts_to_add * seconds_per_heart)
                current_user.hearts_updated_at = new_updated.isoformat()
            await db.commit()

    next_heart_in_seconds = None
    if current_user.hearts < 5:
        updated_at = datetime.datetime.fromisoformat(current_user.hearts_updated_at) if current_user.hearts_updated_at else now
        elapsed = (datetime.datetime.utcnow() - updated_at).total_seconds()
        next_heart_in_seconds = int((5 * 3600) - elapsed)

    rank = None
    if current_user.xp > 0:
        result = await db.execute(
            select(func.count(User.id))
            .where(User.xp > 0)
            .where(
                or_(
                    User.xp > current_user.xp,
                    and_(User.xp == current_user.xp, User.id < current_user.id)
                )
            )
        )
        rank = result.scalar() + 1
        
    return UserProgressResponse(
        xp=current_user.xp,
        streak=current_user.streak,
        hearts=current_user.hearts,
        last_active=current_user.last_active,
        rank=rank,
        next_heart_in_seconds=next_heart_in_seconds,
        hearts_updated_at=current_user.hearts_updated_at,
    )


async def reset_user_progress(db: AsyncSession, current_user: User) -> None:
    current_user.xp = 0
    current_user.streak = 0
    current_user.hearts = 5
    
    # Delete all progress records to essentially reset lessons back to uncompleted
    await db.execute(
        delete(UserProgress).where(UserProgress.user_id == current_user.id)
    )
    await db.commit()


# ---------------------------------------------------------------------------
# Route
# ---------------------------------------------------------------------------

@router.get(
    "/progress",
    response_model=UserProgressResponse,
    summary="Get a user's progress stats",
)
async def get_user_progress(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UserProgressResponse:
    return await fetch_user_progress(db, current_user)


@router.post(
    "/reset",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Reset all progress for the current user",
)
async def reset_progress(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await reset_user_progress(db, current_user)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

