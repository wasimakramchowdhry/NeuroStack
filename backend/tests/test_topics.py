import pytest
import uuid
from httpx import AsyncClient, ASGITransport

from app.main import app
from app.modules.auth.dependencies import get_current_user, get_current_admin_user
from app.modules.auth.models import User

# Mock dependencies
def override_get_current_admin_user():
    return User(
        id=uuid.uuid4(),
        email="admin@test.com",
        full_name="Test Admin",
        role="admin",
    )

def override_get_current_user():
    return User(
        id=uuid.uuid4(),
        email="learner@test.com",
        full_name="Test Learner",
        role="learner",
    )

def override_fail_admin():
    from fastapi import HTTPException
    raise HTTPException(status_code=403, detail="Not enough permissions")

@pytest.mark.asyncio
async def test_all_topic_endpoints():
    unique_slug = f"test-topic-{uuid.uuid4().hex[:8]}"

    # --- Test 1: Create Topic as Admin ---
    app.dependency_overrides[get_current_admin_user] = override_get_current_admin_user
    app.dependency_overrides[get_current_user] = override_get_current_admin_user

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post(
            "/api/v1/topics/",
            json={
                "title": "Test Topic",
                "slug": unique_slug,
                "module": "Testing",
                "difficulty": "beginner",
                "order": 1,
                "is_published": False
            }
        )
        assert response.status_code in [200, 201]

    # --- Test 2: Create Topic as Learner ---
    app.dependency_overrides[get_current_user] = override_get_current_user
    app.dependency_overrides[get_current_admin_user] = override_fail_admin

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post(
            "/api/v1/topics/",
            json={
                "title": "Hack Topic",
                "slug": "hack-topic",
                "module": "Hacking",
                "difficulty": "advanced",
                "order": 1,
                "is_published": True
            }
        )
        assert response.status_code == 403

    # --- Test 3: Get Topics Pagination as Learner ---
    # Current user is still learner from overrides above
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/topics/?skip=0&limit=5")
        assert response.status_code == 200
        assert isinstance(response.json(), list)
        assert len(response.json()) <= 5

    app.dependency_overrides.clear()
