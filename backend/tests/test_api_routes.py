import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_health_check_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "Drug Repurposing Copilot" in data["service"]
    assert "disclaimer" in data


@pytest.mark.asyncio
async def test_repurposing_search_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        payload = {
            "disease_id_or_name": "Alzheimer's disease",
            "max_candidates": 3,
            "approved_only": False
        }
        response = await ac.post("/repurposing/search", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "disease" in data
    assert "candidates" in data
    assert "medical_disclaimer" in data
    assert len(data["medical_disclaimer"]) > 0


@pytest.mark.asyncio
async def test_copilot_chat_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        payload = {
            "message": "Find potential drug repurposing candidates for Alzheimer's disease."
        }
        response = await ac.post("/copilot/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert "conversation_id" in data
    assert "medical_disclaimer" in data
