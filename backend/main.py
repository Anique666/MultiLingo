"""
main.py — Application entry point.

Lifespan handler creates all tables on startup (idempotent via
create_all). Routers are registered here.
"""

import os
from contextlib import asynccontextmanager
from typing import AsyncIterator
import sys
import asyncio

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware



from database import engine, Base, AsyncSessionLocal
# Import models so their table definitions are registered on Base
import models  # noqa: F401

from routers import auth, skills, exercises, lessons, users, leaderboard, chests, practice
from scripts.seed_data import seed_leaderboard_users


async def seed_dev_data() -> None:
    """Ensure the local demo DB can serve the first three lessons end-to-end."""
    async with AsyncSessionLocal() as session:
        async def ensure_skill(
            skill_id: int,
            unit_id: int,
            title: str,
            icon: str,
            order: int,
        ) -> None:
            skill = await session.get(models.Skill, skill_id)
            if skill is None:
                session.add(
                    models.Skill(
                        id=skill_id,
                        unit_id=unit_id,
                        title=title,
                        icon=icon,
                        order=order,
                    )
                )
                return

            skill.unit_id = unit_id
            skill.title = title
            skill.icon = icon
            skill.order = order

        async def ensure_lesson(lesson_id: int, skill_id: int, order: int) -> None:
            lesson = await session.get(models.Lesson, lesson_id)
            if lesson is None:
                session.add(models.Lesson(id=lesson_id, skill_id=skill_id, order=order))
                return

            lesson.skill_id = skill_id
            lesson.order = order

        async def ensure_exercise(
            exercise_id: int,
            lesson_id: int,
            exercise_type: str,
            question: str,
            options: list[str],
            correct_answer: str,
        ) -> None:
            if await session.get(models.Exercise, exercise_id) is None:
                session.add(
                    models.Exercise(
                        id=exercise_id,
                        lesson_id=lesson_id,
                        type=exercise_type,
                        question=question,
                        options=options,
                        correct_answer=correct_answer,
                    )
                )

        await seed_leaderboard_users(session)


        from scripts.seed_questions import UNITS_SEED, SKILLS_SEED, LESSONS_SEED, EXERCISES_SEED

        for unit in UNITS_SEED:
            if await session.get(models.Unit, unit["id"]) is None:
                session.add(
                    models.Unit(
                        id=unit["id"],
                        title=unit["title"],
                        order=unit["order"],
                    )
                )
        
        for skill in SKILLS_SEED:
            await ensure_skill(skill["id"], skill["unit_id"], skill["title"], skill["icon"], skill["order"])

        for lesson in LESSONS_SEED:
            await ensure_lesson(lesson["id"], lesson["skill_id"], lesson["order"])

        exercise_specs = EXERCISES_SEED

        for spec in exercise_specs:
            await ensure_exercise(
                exercise_id=spec["id"],
                lesson_id=spec["lesson_id"],
                exercise_type=spec["type"],
                question=spec["question"],
                options=spec["options"],
                correct_answer=spec["correct_answer"],
            )

        await session.commit()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Create DB tables on startup; nothing special needed on shutdown."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Only auto-seed in development — production should use reseed.py manually
    if os.getenv("ENV") != "production":
        await seed_dev_data()
    yield


app = FastAPI(
    title="MultiLingo API",
    description="Async FastAPI backend for the MultiLingo language-learning app.",
    version="0.1.0",
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# CORS — allow the deployed frontend + localhost for dev
# ---------------------------------------------------------------------------
_frontend_url = os.getenv("FRONTEND_URL", "")
_allowed_origins = ["http://localhost:3000", "http://127.0.0.1:3000"]
if _frontend_url:
    _allowed_origins.append(_frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(auth.router)
app.include_router(skills.router)
app.include_router(exercises.router)
app.include_router(lessons.router)
app.include_router(users.router)
app.include_router(leaderboard.router)
app.include_router(chests.router)
app.include_router(practice.router)
