import asyncio
from main import seed_dev_data, Base
from database import engine

async def init():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await seed_dev_data()

if __name__ == "__main__":
    asyncio.run(init())
