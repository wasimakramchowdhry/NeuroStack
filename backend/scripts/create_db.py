import asyncio
import asyncpg
from app.config import settings

async def create_db():
    try:
        conn = await asyncpg.connect(
            user=settings.POSTGRES_USER,
            password=settings.POSTGRES_PASSWORD,
            host=settings.POSTGRES_SERVER,
            port=settings.POSTGRES_PORT,
            database="postgres"
        )
        print("Connected to default postgres database.")
        # Check if neurostack database exists
        exists = await conn.fetchval(
            "SELECT 1 FROM pg_database WHERE datname=$1",
            settings.POSTGRES_DB
        )
        if not exists:
            print(f"Creating database {settings.POSTGRES_DB}...")
            await conn.execute(f'CREATE DATABASE "{settings.POSTGRES_DB}"')
            print(f"Database {settings.POSTGRES_DB} created successfully.")
        else:
            print(f"Database {settings.POSTGRES_DB} already exists.")
        await conn.close()
    except Exception as e:
        print(f"Error checking/creating database: {e}")

if __name__ == "__main__":
    asyncio.run(create_db())
