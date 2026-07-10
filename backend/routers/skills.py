"""
routers/skills.py — Skill tree endpoint.

Pattern: thin route handler + fat controller function.
The controller (fetch_skill_tree) owns all DB interaction and returns
plain Python objects; the route function only serialises to JSON.

GET /skills/tree/{user_id}  →  List[UnitTreeResponse]
"""

from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from database import get_db
from models import Unit, Skill, UserProgress
from schemas import SkillTreeNode, UnitTreeResponse

router = APIRouter(prefix="/skills", tags=["skills"])


# ---------------------------------------------------------------------------
# Controller — all DB logic lives here, decoupled from HTTP concerns
# ---------------------------------------------------------------------------

async def fetch_skill_tree(
    db: AsyncSession,
    user_id: int,
) -> List[UnitTreeResponse]:
    """
    Load every unit (with its skills) and the user's progress rows,
    then merge them into a list of UnitTreeResponse objects.

    Locking rule
    ─────────────
    • The very first skill of the first unit is always unlocked.
    • Every subsequent skill is locked unless the *preceding* skill
      in the same unit has is_completed=True.
    """

    # ------------------------------------------------------------------
    # 1. Load all units → skills (ordered, single round-trip via join)
    # ------------------------------------------------------------------
    units_result = await db.execute(
        select(Unit)
        .order_by(Unit.order)
        .options(
            selectinload(Unit.skills)
        )
    )
    units: list[Unit] = list(units_result.scalars().all())

    # ------------------------------------------------------------------
    # 2. Load user's progress rows and build a fast lookup dict
    # ------------------------------------------------------------------
    progress_result = await db.execute(
        select(UserProgress).where(UserProgress.user_id == user_id)
    )
    progress_rows: list[UserProgress] = list(progress_result.scalars().all())
    progress_map: dict[int, UserProgress] = {p.skill_id: p for p in progress_rows}

    # ------------------------------------------------------------------
    # 3. Build the composite response
    # ------------------------------------------------------------------
    unit_responses: List[UnitTreeResponse] = []
    previous_skill_completed: bool = True  # sentinel — first skill is open

    for unit in units:
        # Sort skills within each unit by their display order
        ordered_skills: list[Skill] = sorted(unit.skills, key=lambda s: s.order)

        skill_nodes: List[SkillTreeNode] = []
        for skill in ordered_skills:
            prog = progress_map.get(skill.id)
            crowns = prog.crowns if prog else 0
            is_completed = prog.is_completed if prog else False
            is_locked = not previous_skill_completed

            skill_nodes.append(
                SkillTreeNode(
                    id=skill.id,
                    title=skill.title,
                    icon=skill.icon,
                    order=skill.order,
                    crowns=crowns,
                    is_completed=is_completed,
                    is_locked=is_locked,
                )
            )
            # The next skill's lock state depends on *this* skill
            previous_skill_completed = is_completed

        unit_responses.append(
            UnitTreeResponse(
                id=unit.id,
                title=unit.title,
                order=unit.order,
                skills=skill_nodes,
            )
        )

    return unit_responses


# ---------------------------------------------------------------------------
# Route
# ---------------------------------------------------------------------------

@router.get(
    "/tree/{user_id}",
    response_model=List[UnitTreeResponse],
    summary="Get the full skill tree merged with a user's progress",
    responses={
        404: {"description": "User not found"},
    },
)
async def get_skill_tree(
    user_id: int,
    db: AsyncSession = Depends(get_db),
) -> List[UnitTreeResponse]:
    """
    Returns every unit and its skills, enriched with the requesting
    user's crown count, completion state, and computed lock state.
    """
    # Optional: verify the user exists first
    from models import User
    user_result = await db.execute(select(User).where(User.id == user_id))
    user = user_result.scalar_one_or_none()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id={user_id} not found.",
        )

    return await fetch_skill_tree(db, user_id)
