"""
routers/lessons.py — Lesson-completion endpoint.

POST /lessons/{lesson_id}/complete

Awards XP, updates streak, and optionally marks the parent skill as
completed. All mutations are flushed as a single unit of work; the
actual COMMIT is done by the get_db dependency on exit.
"""

from __future__ import annotations

from datetime import date, timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from database import get_db
from models import Lesson, User, UserProgress
from schemas import (
    LessonCompleteRequest,
    LessonCompleteResponse,
    LessonExerciseRead,
    LessonWithExercisesResponse,
    SkillProgressInfo,
)
from security import get_current_user

router = APIRouter(prefix="/lessons", tags=["lessons"])

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
XP_PER_CORRECT = 10  # flat rate


# ---------------------------------------------------------------------------
# Controller
# ---------------------------------------------------------------------------

async def get_lesson_with_exercises(
    db: AsyncSession,
    lesson_id: int,
) -> LessonWithExercisesResponse:
    """Load a lesson with public exercise data for the client lesson loop."""
    lesson_result = await db.execute(
        select(Lesson)
        .options(selectinload(Lesson.exercises))
        .where(Lesson.id == lesson_id)
    )
    lesson = lesson_result.scalar_one_or_none()
    if lesson is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lesson with id={lesson_id} not found.",
        )

    exercises = sorted(lesson.exercises, key=lambda exercise: exercise.id)

    return LessonWithExercisesResponse(
        id=lesson.id,
        exercises=[
            LessonExerciseRead(
                id=exercise.id,
                type=exercise.type,
                question=exercise.question,
                options=exercise.options,
            )
            for exercise in exercises
        ],
    )


async def complete_lesson(
    db: AsyncSession,
    lesson_id: int,
    current_user: User,
    correct_count: int,
    total_exercises: int,
) -> LessonCompleteResponse:
    """
    1. Compute & award XP.
    2. Update streak (increment / reset based on last_active gap).
    3. If perfect score, mark the lesson's skill as completed.
    4. Return aggregated stats.
    """

    # --- Fetch lesson (need skill_id) ------------------------------------
    lesson_result = await db.execute(
        select(Lesson).where(Lesson.id == lesson_id)
    )
    lesson = lesson_result.scalar_one_or_none()
    if lesson is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lesson with id={lesson_id} not found.",
        )

    # ------------------------------------------------------------------
    # 1. Skill progress & XP (Merged for replay logic)
    # ------------------------------------------------------------------
    skill_id = lesson.skill_id

    prog_result = await db.execute(
        select(UserProgress).where(
            UserProgress.user_id == current_user.id,
            UserProgress.skill_id == skill_id,
        )
    )
    progress = prog_result.scalar_one_or_none()

    if progress is None:
        progress = UserProgress(
            user_id=current_user.id,
            skill_id=skill_id,
            crowns=0,
            is_completed=False,
            completion_count=0,
        )
        db.add(progress)
        
    current_completions = progress.completion_count
    progress.completion_count += 1
    
    # Always unlock the skill upon completion, regardless of perfect score
    progress.is_completed = True

    # Award a crown only on a perfect lesson
    if correct_count == total_exercises:
        progress.crowns = min(progress.crowns + 1, 5)

    base_xp = XP_PER_CORRECT * correct_count
    if current_completions == 0:
        xp_awarded = base_xp
    elif current_completions == 1:
        xp_awarded = base_xp // 2
    else:
        xp_awarded = 0

    current_user.xp += xp_awarded

    # ------------------------------------------------------------------
    # 2. Streak
    # ------------------------------------------------------------------
    today_str = date.today().isoformat()  # "YYYY-MM-DD"

    if current_user.last_active is None or current_user.last_active != today_str:
        # Determine gap
        if current_user.last_active is not None:
            try:
                last_date = date.fromisoformat(current_user.last_active)
                gap = (date.today() - last_date).days
            except ValueError:
                gap = 999  # malformed → treat as broken streak
        else:
            gap = 999  # first activity ever

        if gap == 1:
            current_user.streak += 1  # consecutive day
        else:
            current_user.streak = 1  # reset (includes gap > 1 and first time)

        current_user.last_active = today_str

    db.add(current_user)
    db.add(progress)
    await db.flush()  # single flush — commit handled by get_db

    return LessonCompleteResponse(
        xp_awarded=xp_awarded,
        total_xp=current_user.xp,
        streak=current_user.streak,
        skill_progress=SkillProgressInfo(
            skill_id=skill_id,
            crowns=progress.crowns,
            is_completed=progress.is_completed,
        ),
        hearts_remaining=current_user.hearts,
    )


# ---------------------------------------------------------------------------
# Route
# ---------------------------------------------------------------------------

@router.get(
    "/{lesson_id}",
    response_model=LessonWithExercisesResponse,
    summary="Get a lesson with public exercise data",
    responses={404: {"description": "Lesson not found"}},
)
async def lesson_read(
    lesson_id: int,
    db: AsyncSession = Depends(get_db),
) -> LessonWithExercisesResponse:
    return await get_lesson_with_exercises(db=db, lesson_id=lesson_id)


@router.post(
    "/{lesson_id}/complete",
    response_model=LessonCompleteResponse,
    summary="Complete a lesson and award XP / update streak",
    responses={404: {"description": "Lesson or User not found"}},
)
async def lesson_complete(
    lesson_id: int,
    body: LessonCompleteRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> LessonCompleteResponse:
    return await complete_lesson(
        db=db,
        lesson_id=lesson_id,
        current_user=current_user,
        correct_count=body.correct_count,
        total_exercises=body.total_exercises,
    )
