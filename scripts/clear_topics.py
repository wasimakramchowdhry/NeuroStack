import asyncio
import os
import sys

# Add the backend folder to the python path
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.join(project_root, "backend"))

from app.database import AsyncSessionLocal
from sqlalchemy import text

async def clear_topics():
    print("Clearing topics table...")
    async with AsyncSessionLocal() as session:
        await session.execute(text("TRUNCATE topics CASCADE"))
        await session.commit()
        print("Successfully cleared topics from the database!")

if __name__ == "__main__":
    asyncio.run(clear_topics())
