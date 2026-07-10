"""
routers/exercises.py — Exercise answer-checking endpoint.

POST /exercises/{exercise_id}/check

Pattern: controller function + thin route handler.
Hearts mutation and response are wrapped in a single commit.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models import Exercise, User
from schemas import CheckAnswerRequest, CheckAnswerResponse
from security import get_current_user

router = APIRouter(prefix="/exercises", tags=["exercises"])


# ---------------------------------------------------------------------------
# Controller
# ---------------------------------------------------------------------------

async def check_exercise_answer(
    db: AsyncSession,
    exercise_id: int,
    current_user: User,
    answer: str,
) -> CheckAnswerResponse:
    """
    Compare the submitted answer against the exercise's correct_answer.
    On incorrect: decrement user.hearts (floor 0) and persist in the
    same transaction as the response read.
    """

    # --- Fetch exercise ---------------------------------------------------
    ex_result = await db.execute(
        select(Exercise).where(Exercise.id == exercise_id)
    )
    exercise = ex_result.scalar_one_or_none()
    if exercise is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Exercise with id={exercise_id} not found.",
        )

    # --- Compare (case-insensitive, whitespace-stripped) -------------------
    is_correct = (
        answer.strip().lower() == exercise.correct_answer.strip().lower()
    )

    # --- Mutate hearts on incorrect answer --------------------------------
    if not is_correct:
        current_user.hearts = max(0, current_user.hearts - 1)
        db.add(current_user)
        await db.flush()  # stage the write; commit handled by get_db

    hearts_remaining = current_user.hearts
    lesson_failed = hearts_remaining == 0

    return CheckAnswerResponse(
        correct=is_correct,
        correct_answer=exercise.correct_answer,
        hearts_remaining=hearts_remaining,
        lesson_failed=lesson_failed,
    )


# ---------------------------------------------------------------------------
# Route
# ---------------------------------------------------------------------------

@router.post(
    "/{exercise_id}/check",
    response_model=CheckAnswerResponse,
    summary="Check a user's answer for an exercise",
    responses={404: {"description": "Exercise or User not found"}},
)
async def check_answer(
    exercise_id: int,
    body: CheckAnswerRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CheckAnswerResponse:
    return await check_exercise_answer(
        db=db,
        exercise_id=exercise_id,
        current_user=current_user,
        answer=body.answer,
    )
