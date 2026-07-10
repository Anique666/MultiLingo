"""
routers/users.py — User progress endpoint.

GET /users/progress
"""

from __future__ import annotations

from fastapi import APIRouter, Depends

from models import User
from security import get_current_user
from schemas import UserProgressResponse

router = APIRouter(prefix="/users", tags=["users"])


# ---------------------------------------------------------------------------
# Controller
# ---------------------------------------------------------------------------

async def fetch_user_progress(current_user: User) -> UserProgressResponse:
    """Load a user's headline stats."""
    return UserProgressResponse(
        xp=current_user.xp,
        streak=current_user.streak,
        hearts=current_user.hearts,
        last_active=current_user.last_active,
    )


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
) -> UserProgressResponse:
    return await fetch_user_progress(current_user)
