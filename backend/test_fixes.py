import asyncio
import json
import uuid

from main import app
from httpx import AsyncClient, ASGITransport
from database import AsyncSessionLocal, engine, Base
import models
from scripts.seed_data import PRIMARY_USER, DUMMY_USERNAMES

import security

async def setup_test_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        # Create users with dummy password since we bypass /auth/login
        user = models.User(id=1, username="test_learner", email="test@example.com", xp=0, streak=0, hashed_password="pw")
        session.add(user)
        zero_xp_user = models.User(id=2, username="zero_xp", email="zero@example.com", xp=0, streak=0, hashed_password="pw")
        session.add(zero_xp_user)
        
        # Create unit, skill, lesson, exercise
        unit = models.Unit(title="Unit 1", order=1)
        skill1 = models.Skill(title="Skill 1", order=1, unit=unit, icon="star")
        skill2 = models.Skill(title="Skill 2", order=2, unit=unit, icon="star")
        session.add_all([unit, skill1, skill2])
        await session.flush()

        lesson1 = models.Lesson(skill_id=skill1.id, order=1)
        session.add(lesson1)
        await session.commit()

import security

async def run_tests():
    await setup_test_db()

    # Manually craft a token for user_id=1
    token = security.create_access_token(1)
    cookies = {security.ACCESS_TOKEN_COOKIE_NAME: token}

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test", cookies=cookies) as client:

        # 1. First completion
        print("=== Test 1: First Completion ===")
        req = {"correct_count": 10, "total_exercises": 10}
        resp = await client.post("/lessons/1/complete", json=req)
        print("First completion response:", resp.status_code, resp.json())
        assert resp.json()["xp_awarded"] == 100, "Should award 100 XP"
        assert resp.json()["skill_progress"]["is_completed"] == True, "Skill should be marked completed"
        
        # Check skill tree unlock
        tree_resp = await client.get("/skills/tree")
        tree = tree_resp.json()
        skill2 = tree[0]["skills"][1]
        print("Skill 2 locked status after Skill 1 completion:", skill2["is_locked"])
        assert skill2["is_locked"] == False, "Skill 2 should be unlocked"

        # 2. First replay (Half XP)
        print("\n=== Test 2: First Replay ===")
        req = {"correct_count": 10, "total_exercises": 10}
        resp = await client.post("/lessons/1/complete", json=req)
        print("First replay response:", resp.status_code, resp.json())
        assert resp.json()["xp_awarded"] == 50, "Should award 50 XP (Half of 100)"
        
        # 3. Subsequent replay (0 XP)
        print("\n=== Test 3: Subsequent Replay ===")
        req = {"correct_count": 8, "total_exercises": 10}
        resp = await client.post("/lessons/1/complete", json=req)
        print("Second replay response:", resp.status_code, resp.json())
        assert resp.json()["xp_awarded"] == 0, "Should award 0 XP"

        # 4. Leaderboard inclusion
        print("\n=== Test 4: Leaderboard Inclusion ===")
        resp = await client.get("/leaderboard")
        leaderboard = resp.json()
        print(f"Leaderboard users: {[u['username'] for u in leaderboard]}")
        assert "zero_xp" not in [u["username"] for u in leaderboard], "zero_xp user should NOT be in leaderboard"
        assert "test_learner" in [u["username"] for u in leaderboard], "test_learner should be in leaderboard"

        print("\nAll tests passed successfully!")

if __name__ == "__main__":
    asyncio.run(run_tests())
