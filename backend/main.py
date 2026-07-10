"""
main.py — Application entry point.

Lifespan handler creates all tables on startup (idempotent via
create_all). Routers are registered here.
"""

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

from routers import auth, skills, exercises, lessons, users, leaderboard
from scripts.seed_data import seed_leaderboard_users


async def seed_dev_data() -> None:
    """Ensure the local demo DB can serve the first three lessons end-to-end."""
    async with AsyncSessionLocal() as session:
        async def ensure_skill(
            skill_id: int,
            title: str,
            icon: str,
            order: int,
        ) -> None:
            skill = await session.get(models.Skill, skill_id)
            if skill is None:
                session.add(
                    models.Skill(
                        id=skill_id,
                        unit_id=1,
                        title=title,
                        icon=icon,
                        order=order,
                    )
                )
                return

            skill.unit_id = 1
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

        if await session.get(models.Unit, 1) is None:
            session.add(
                models.Unit(
                    id=1,
                    title="Unit 1: Basics",
                    order=1,
                )
            )

        skill_specs = [
            (1, "Basics", "star", 1),
            (2, "Food & Drinks", "cup-soda", 2),
            (3, "Family & Home", "home", 3),
        ]
        for skill_id, title, icon, order in skill_specs:
            await ensure_skill(skill_id, title, icon, order)

        await ensure_lesson(1, 1, 1)
        await ensure_lesson(2, 2, 2)
        await ensure_lesson(3, 3, 3)

        exercise_specs = [
            # Lesson 1 — Greetings & Basics
            {
                "id": 1,
                "lesson_id": 1,
                "type": "multiple_choice",
                "question": "Which one means 'hello'?",
                "options": ["hola", "adios", "gracias", "agua"],
                "correct_answer": "hola",
            },
            {
                "id": 2,
                "lesson_id": 1,
                "type": "translate",
                "question": "I drink water",
                "options": ["yo", "bebo", "agua"],
                "correct_answer": "yo bebo agua",
            },
            {
                "id": 3,
                "lesson_id": 1,
                "type": "fill_blank",
                "question": "___ means 'goodbye'",
                "options": ["adios", "hola", "gracias"],
                "correct_answer": "adios",
            },
            {
                "id": 4,
                "lesson_id": 1,
                "type": "match",
                "question": "Match the greetings",
                "options": [
                    '{"left":"Hello","right":"hola"}',
                    '{"left":"Goodbye","right":"adios"}',
                    '{"left":"Please","right":"por favor"}',
                ],
                "correct_answer": "Goodbye:adios,Hello:hola,Please:por favor",
            },
            {
                "id": 5,
                "lesson_id": 1,
                "type": "arrange_sentence",
                "question": "Arrange the Spanish sentence for 'Good night'",
                "options": ["noches", "buenas"],
                "correct_answer": "buenas noches",
            },
            # Lesson 2 — Food & Drinks
            {
                "id": 6,
                "lesson_id": 2,
                "type": "multiple_choice",
                "question": "Which one means 'water'?",
                "options": ["agua", "pan", "leche", "cafe"],
                "correct_answer": "agua",
            },
            {
                "id": 7,
                "lesson_id": 2,
                "type": "translate",
                "question": "I eat bread",
                "options": ["yo", "como", "pan"],
                "correct_answer": "yo como pan",
            },
            {
                "id": 8,
                "lesson_id": 2,
                "type": "fill_blank",
                "question": "I drink ___",
                "options": ["agua", "leche", "cafe"],
                "correct_answer": "agua",
            },
            {
                "id": 9,
                "lesson_id": 2,
                "type": "match",
                "question": "Match the food words",
                "options": [
                    '{"left":"Water","right":"agua"}',
                    '{"left":"Bread","right":"pan"}',
                    '{"left":"Milk","right":"leche"}',
                ],
                "correct_answer": "Bread:pan,Milk:leche,Water:agua",
            },
            {
                "id": 10,
                "lesson_id": 2,
                "type": "arrange_sentence",
                "question": "Arrange the Spanish sentence for 'I want coffee'",
                "options": ["cafe", "quiero", "yo"],
                "correct_answer": "yo quiero cafe",
            },
            # Lesson 3 — Family & Home
            {
                "id": 11,
                "lesson_id": 3,
                "type": "multiple_choice",
                "question": "Which one means 'mother'?",
                "options": ["madre", "padre", "hermano", "casa"],
                "correct_answer": "madre",
            },
            {
                "id": 12,
                "lesson_id": 3,
                "type": "translate",
                "question": "My family is big",
                "options": ["mi", "familia", "es", "grande"],
                "correct_answer": "mi familia es grande",
            },
            {
                "id": 13,
                "lesson_id": 3,
                "type": "fill_blank",
                "question": "Brother = ___",
                "options": ["hermano", "hermana", "padre"],
                "correct_answer": "hermano",
            },
            {
                "id": 14,
                "lesson_id": 3,
                "type": "match",
                "question": "Match the family words",
                "options": [
                    '{"left":"Mother","right":"madre"}',
                    '{"left":"Father","right":"padre"}',
                    '{"left":"Sister","right":"hermana"}',
                    '{"left":"Family","right":"familia"}',
                ],
                "correct_answer": "Family:familia,Father:padre,Mother:madre,Sister:hermana",
            },
            {
                "id": 15,
                "lesson_id": 3,
                "type": "arrange_sentence",
                "question": "Arrange the Spanish sentence for 'The family is at home'",
                "options": ["familia", "esta", "en", "casa", "la"],
                "correct_answer": "la familia esta en casa",
            },
        ]

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

    await seed_dev_data()
    yield


app = FastAPI(
    title="MultiLingo API",
    description="Async FastAPI backend for the MultiLingo language-learning app.",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
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

