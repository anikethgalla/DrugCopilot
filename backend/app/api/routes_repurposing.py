from fastapi import APIRouter, HTTPException
from app.models.repurposing import RepurposingRequest, RepurposingResponse
from app.repurposing.engine import repurposing_engine

router = APIRouter(prefix="/repurposing", tags=["Repurposing"])


@router.post("/search", response_model=RepurposingResponse)
async def search_repurposing_candidates(request: RepurposingRequest) -> RepurposingResponse:
    """
    Generate explainable drug repurposing candidates for a disease.
    Traverses Neo4j biomedical networks, calculates multi-modal evidence scores,
    and returns transparent biological reasoning paths with full provenance.
    """
    try:
        return await repurposing_engine.find_candidates(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
