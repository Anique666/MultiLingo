"""Seed helpers for resetting local development data.

Creates a realistic 15-user leaderboard pool for the demo app.
"""

from __future__ import annotations

import asyncio
import random

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from database import AsyncSessionLocal, Base, engine

import models

PRIMARY_USER = {"username": "test_learner", "xp": 150}
DUMMY_USERNAMES = [
    "polyglot_pete",
    "sarah_studies",
    "language_lover99",
    "bilingual_ben",
    "daily_duo_dana",
    "maria_motiva",
    "quizmaster_quinn",
    "study_streak_sam",
    "lingo_lucy",
    "fluent_felix",
    "vocab_victor",
    "grammar_gina",
    "duo_diego",
    "phrasebook_paul",
]


def build_leaderboard_users() -> list[models.User]:
    users = [
        models.User(
            username=PRIMARY_USER["username"],
            xp=PRIMARY_USER["xp"],
            streak=0,
            hearts=5,
            last_active=None,
        )
    ]
    for username in DUMMY_USERNAMES:
        users.append(
            models.User(
                username=username,
                xp=random.randint(50, 2000),
                streak=random.randint(0, 42),
                hearts=5,
                last_active=None,
            )
        )
    return users


async def seed_leaderboard_users(session: AsyncSession) -> None:
    existing_count = await session.scalar(select(func.count()).select_from(models.User))
    if existing_count:
        return

    session.add_all(build_leaderboard_users())


async def reset_and_seed_database() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)



    async with AsyncSessionLocal() as session:
        await seed_leaderboard_users(session)
        await session.commit()


if __name__ == "__main__":
    asyncio.run(reset_and_seed_database())