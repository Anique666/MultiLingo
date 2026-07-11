"""
routers/chests.py — Chest reward endpoint.

GET /chests  → List[ChestResponse]
POST /chests/{chest_index}/claim → ChestClaimResponse
"""

from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models import User, UserProgress, ChestReward
from schemas import ChestResponse, ChestClaimResponse
from security import get_current_user

router = APIRouter(prefix="/chests", tags=["chests"])

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
XP_PER_CHEST = 30
TOTAL_CHESTS = 3


async def get_completed_skills_count(db: AsyncSession, user_id: int) -> int:
    """Helper to count distinct skills completed by the user."""
    result = await db.execute(
        select(func.count(UserProgress.id))
        .where(UserProgress.user_id == user_id, UserProgress.is_completed == True)
    )
    return result.scalar() or 0


@router.get(
    "",
    response_model=List[ChestResponse],
    summary="Get state of all chests",
)
async def get_chests(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> List[ChestResponse]:
    
    completed_skills_count = await get_completed_skills_count(db, current_user.id)
    
    claimed_result = await db.execute(
        select(ChestReward.chest_index)
        .where(ChestReward.user_id == current_user.id)
    )
    claimed_indices = {row[0] for row in claimed_result.all()}
    
    responses = []
    for i in range(1, TOTAL_CHESTS + 1):
        required_skills = (i - 1) * 4 + 2
        if i in claimed_indices:
            state = "claimed"
        elif completed_skills_count >= required_skills:
            state = "available"
        else:
            state = "locked"
            
        responses.append(ChestResponse(chest_index=i, state=state))
        
    return responses


@router.post(
    "/{chest_index}/claim",
    response_model=ChestClaimResponse,
    summary="Claim a chest reward",
)
async def claim_chest(
    chest_index: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ChestClaimResponse:
    if chest_index < 1 or chest_index > TOTAL_CHESTS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid chest index. Must be between 1 and {TOTAL_CHESTS}",
        )
        
    completed_skills_count = await get_completed_skills_count(db, current_user.id)
    required_skills = (chest_index - 1) * 4 + 2
    
    if completed_skills_count < required_skills:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Chest {chest_index} is not yet unlocked. Requires {required_skills} completed skills.",
        )
        
    existing_claim = await db.execute(
        select(ChestReward).where(
            ChestReward.user_id == current_user.id,
            ChestReward.chest_index == chest_index
        )
    )
    
    if existing_claim.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Chest {chest_index} has already been claimed.",
        )
        
    # Award XP
    current_user.xp += XP_PER_CHEST
    db.add(current_user)
    
    # Record claim
    new_claim = ChestReward(user_id=current_user.id, chest_index=chest_index)
    db.add(new_claim)
    
    await db.flush() # Commit is handled by get_db dependency
    
    return ChestClaimResponse(
        xp_awarded=XP_PER_CHEST,
        total_xp=current_user.xp
    )
