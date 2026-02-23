import httpx
import asyncio
import time

BASE_URL = "http://localhost:8000/api/v1"

async def run_tests():
    print("Starting Phase 1 Backend API Verification...")
    async with httpx.AsyncClient() as client:
        # Generate a unique test user
        unique_id = int(time.time())
        test_email = f"user_{unique_id}@example.com"
        password = "SecurePassword123!"
        
        # 1. Test Registration
        print(f"\n[1] Testing Registration for {test_email}...")
        resp = await client.post(f"{BASE_URL}/auth/register", json={
            "email": test_email,
            "full_name": "Test User",
            "password": password,
            "preferred_language": "en"
        })
        print(f"Status: {resp.status_code}")
        print(f"Response: {resp.text}")
        assert resp.status_code in (200, 201), "Registration failed"
        
        # 2. Test Duplicate Registration (Should Fail)
        print(f"\n[2] Testing Duplicate Registration...")
        resp_dup = await client.post(f"{BASE_URL}/auth/register", json={
            "email": test_email,
            "full_name": "Test User",
            "password": password,
            "preferred_language": "en"
        })
        print(f"Status: {resp_dup.status_code}")
        print(f"Response: {resp_dup.text}")
        assert resp_dup.status_code == 400, "Duplicate registration should return 400"
        
        # 3. Test Invalid Login
        print(f"\n[3] Testing Invalid Login...")
        resp_inv = await client.post(f"{BASE_URL}/auth/login", data={
            "username": test_email,
            "password": "WrongPassword!"
        })
        print(f"Status: {resp_inv.status_code}")
        print(f"Response: {resp_inv.text}")
        assert resp_inv.status_code == 400 or resp_inv.status_code == 401, "Invalid login should fail"
        
        # 4. Test Successful Login
        print(f"\n[4] Testing Successful Login...")
        resp_login = await client.post(f"{BASE_URL}/auth/login", data={
            "username": test_email,
            "password": password
        })
        print(f"Status: {resp_login.status_code}")
        print(f"Response: {resp_login.text}")
        assert resp_login.status_code == 200, "Login failed"
        
        token = resp_login.json().get("access_token")
        
        # 5. Test Fetching Profile (Protected Route)
        print(f"\n[5] Testing Protected Route (/users/me)...")
        resp_me = await client.get(f"{BASE_URL}/users/me", headers={
            "Authorization": f"Bearer {token}"
        })
        print(f"Status: {resp_me.status_code}")
        print(f"Response: {resp_me.text}")
        assert resp_me.status_code == 200, "Failed to fetch profile"
        assert resp_me.json()["email"] == test_email, "Email mismatch in profile"
        
        print("\nAll Backend Phase 1 Tests Passed Successfully!")

if __name__ == "__main__":
    asyncio.run(run_tests())
