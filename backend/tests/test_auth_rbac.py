import base64
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.auth.security import create_access_token


@pytest.mark.asyncio
async def test_auth_login_admin_success():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/auth/login", json={
            "email": "admin@drugcopilot.org",
            "password": "Admin@2025!"
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["role"] == "admin"
        assert data["default_portal"] == "/admin"


@pytest.mark.asyncio
async def test_auth_login_user_success():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/auth/login", json={
            "email": "user@drugcopilot.org",
            "password": "User@2025!"
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["role"] == "user"
        assert data["default_portal"] == "/copilot"


@pytest.mark.asyncio
async def test_auth_login_invalid_credentials():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/auth/login", json={
            "email": "admin@drugcopilot.org",
            "password": "WrongPassword!"
        })
        assert response.status_code == 401


@pytest.mark.asyncio
async def test_auth_me_with_bearer_token():
    token = create_access_token({
        "sub": "usr_admin_001",
        "email": "admin@drugcopilot.org",
        "name": "Lead Administrator",
        "role": "admin"
    })
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/auth/me", headers={
            "Authorization": f"Bearer {token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "admin@drugcopilot.org"
        assert data["role"] == "admin"


@pytest.mark.asyncio
async def test_auth_me_with_basic_auth():
    credentials = base64.b64encode(b"user@drugcopilot.org:User@2025!").decode("utf-8")
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/auth/me", headers={
            "Authorization": f"Basic {credentials}"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "user@drugcopilot.org"
        assert data["role"] == "user"


@pytest.mark.asyncio
async def test_rbac_admin_ingestion_access_denied_for_user():
    user_token = create_access_token({
        "sub": "usr_user_001",
        "email": "user@drugcopilot.org",
        "name": "Biomedical Researcher",
        "role": "user"
    })
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Non-admin user attempting ingestion trigger
        response = await client.post("/ingestion/chembl", headers={
            "Authorization": f"Bearer {user_token}"
        }, json={"target_id": "CHEMBL25"})
        assert response.status_code == 403
        assert "Forbidden" in response.json()["detail"]


@pytest.mark.asyncio
async def test_rbac_admin_ingestion_status_allowed_for_admin():
    admin_token = create_access_token({
        "sub": "usr_admin_001",
        "email": "admin@drugcopilot.org",
        "name": "Lead Administrator",
        "role": "admin"
    })
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/ingestion/status", headers={
            "Authorization": f"Bearer {admin_token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "operational"
        assert len(data["sources"]) == 6
