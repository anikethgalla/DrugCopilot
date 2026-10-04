from fastapi import APIRouter, HTTPException
from app.models.copilot import ChatRequest, ChatResponse
from app.agent.copilot import copilot_agent

router = APIRouter(prefix="/copilot", tags=["AI Copilot"])


@router.post("/chat", response_model=ChatResponse)
async def chat_with_copilot(request: ChatRequest) -> ChatResponse:
    """
    AI Copilot Chat Endpoint.
    Uses controlled agent tools to query the Neo4j biomedical knowledge graph and
    verified public biomedical APIs (ChEMBL, Open Targets, UniProt, PubChem, ClinicalTrials.gov, PubMed)
    to answer drug repurposing questions with explainable evidence.
    """
    try:
        return await copilot_agent.chat(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
