from fastapi import APIRouter, HTTPException, Query
from typing import Any, Dict, List, Optional
from app.clients.clinicaltrials import clinicaltrials_client
from app.graph.in_memory_graph import in_memory_graph

router = APIRouter(prefix="/clinical-trials", tags=["Clinical Trials"])


@router.get("")
async def search_trials(
    condition: Optional[str] = None,
    drug: Optional[str] = None,
    limit: int = 10
) -> List[Dict[str, Any]]:
    """Search live ClinicalTrials.gov studies or local knowledge graph."""
    if condition or drug:
        return await clinicaltrials_client.search_trials(condition=condition, intervention=drug, page_size=limit)
    nodes = in_memory_graph.find_nodes_by_label("ClinicalTrial")
    return [n["properties"] for n in nodes[:limit]]


@router.get("/{id}")
async def get_trial_by_id(id: str) -> Dict[str, Any]:
    """Retrieve full trial record by NCT ID."""
    node = in_memory_graph.get_node(id)
    if node:
        return node["properties"]
    
    trial = await clinicaltrials_client.get_trial_by_nct_id(id)
    if not trial:
        raise HTTPException(status_code=404, detail=f"Clinical trial '{id}' not found.")
    return trial
