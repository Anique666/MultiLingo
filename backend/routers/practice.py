from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models import Exercise, User
from schemas import (
    ExercisePublicRead,
    PracticeCheckRequest,
    PracticeCheckResponse,
)
from security import get_current_user

router = APIRouter(prefix="/practice", tags=["practice"])


@router.get("/random", response_model=ExercisePublicRead, summary="Get a random exercise")
async def get_random_exercise(
    db: AsyncSession = Depends(get_db)
) -> ExercisePublicRead:
    # Fetch a random exercise
    result = await db.execute(select(Exercise).order_by(func.random()).limit(1))
    exercise = result.scalar_one_or_none()
    
    if exercise is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No exercises found in the database."
        )
        
    return exercise


@router.post("/check", response_model=PracticeCheckResponse, summary="Check answer and update practice streak")
async def check_practice_answer(
    body: PracticeCheckRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> PracticeCheckResponse:
    # Fetch exercise
    ex_result = await db.execute(
        select(Exercise).where(Exercise.id == body.exercise_id)
    )
    exercise = ex_result.scalar_one_or_none()
    
    if exercise is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Exercise with id={body.exercise_id} not found."
        )
        
    # Compare
    is_correct = body.answer.strip().lower() == exercise.correct_answer.strip().lower()
    
    heart_awarded = False
    if is_correct:
        current_user.practice_streak += 1
        if current_user.practice_streak > 0 and current_user.practice_streak % 5 == 0 and current_user.hearts < 5:
            current_user.hearts += 1
            heart_awarded = True
    else:
        current_user.practice_streak = 0
        
    db.add(current_user)
    
    # We do not flush here, the get_db context manager handles the commit for us, 
    # but the other exercises endpoint does db.flush(). It is ok to flush: 
    await db.flush()

    return PracticeCheckResponse(
        correct=is_correct,
        correct_answer=exercise.correct_answer,
        practice_streak=current_user.practice_streak,
        heart_awarded=heart_awarded,
        hearts_remaining=current_user.hearts,
    )
