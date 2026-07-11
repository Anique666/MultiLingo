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
    "duo_diego",
    "phrasebook_paul",
    "grammar_greg",
    "fluent_fiona",
    "syntax_sally",
    "lingo_leo",
    "verb_vicky",
    "vocab_vincent",
    "idiom_iris",
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
    # Fetch existing usernames
    result = await session.execute(select(models.User.username))
    existing_usernames = set(result.scalars().all())

    to_add = []
    if PRIMARY_USER["username"] not in existing_usernames:
        to_add.append(
            models.User(
                username=PRIMARY_USER["username"],
                xp=PRIMARY_USER["xp"],
                streak=0,
                hearts=5,
                last_active=None,
            )
        )
    for username in DUMMY_USERNAMES:
        if username not in existing_usernames:
            to_add.append(
                models.User(
                    username=username,
                    xp=random.randint(50, 2000),
                    streak=random.randint(0, 42),
                    hearts=5,
                    last_active=None,
                )
            )
            
    if to_add:
        session.add_all(to_add)


async def reset_and_seed_database() -> None:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)



    async with AsyncSessionLocal() as session:
        await seed_leaderboard_users(session)
        await session.commit()


if __name__ == "__main__":
    asyncio.run(reset_and_seed_database())