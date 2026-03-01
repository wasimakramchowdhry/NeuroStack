import asyncio
import os
import sys

# Add the backend folder to the python path and chdir so .env is found
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
backend_dir = os.path.join(project_root, "backend")
sys.path.append(backend_dir)
os.chdir(backend_dir)

# When running outside Docker, override postgres host to localhost
if os.environ.get("POSTGRES_SERVER") is None:
    os.environ.setdefault("POSTGRES_SERVER", "localhost")

from app.database import AsyncSessionLocal
from app.modules.auth.models import User
from app.core.security import get_password_hash
from sqlalchemy import select

async def create_admin():
    async with AsyncSessionLocal() as session:
        # Check if admin already exists
        result = await session.execute(select(User).where(User.email == "admin@neurostack.com"))
        existing_admin = result.scalar_one_or_none()

        if existing_admin:
            print("Admin user already exists! Email: admin@neurostack.com")
            return

        # Create admin
        admin = User(
            email="admin@neurostack.com",
            full_name="System Admin",
            password_hash=get_password_hash("Admin123!"),
            role="admin"
        )
        session.add(admin)
        await session.commit()
        print("Successfully created admin user!")
        print("Email: admin@neurostack.com")
        print("Password: Admin123!")

if __name__ == "__main__":
    asyncio.run(create_admin())
