from fastapi import APIRouter, HTTPException, Query
from typing import Any, Dict, List, Optional
from app.agent.tools import CopilotTools
from app.graph.in_memory_graph import in_memory_graph

router = APIRouter(prefix="/drugs", tags=["Drugs"])


@router.get("")
async def list_drugs(limit: int = 50) -> List[Dict[str, Any]]:
    """List all drugs currently in the biomedical knowledge graph."""
    nodes = in_memory_graph.find_nodes_by_label("Drug")
    return [n["properties"] for n in nodes[:limit]]


@router.get("/{id}")
async def get_drug_by_id(id: str) -> Dict[str, Any]:
    """Retrieve detailed drug profile including targets, indications, trials, and publications."""
    data = await CopilotTools.get_drug(id)
    if "error" in data:
        raise HTTPException(status_code=404, detail=data["error"])
    return data


@router.get("/{id}/targets")
async def get_drug_targets(id: str) -> List[Dict[str, Any]]:
    """Get all proteins and biological targets modulated by the drug."""
    data = await CopilotTools.get_drug(id)
    if "error" in data:
        raise HTTPException(status_code=404, detail=data["error"])
    return data.get("targets", [])


@router.get("/{id}/evidence")
async def get_drug_evidence(id: str, disease_id: Optional[str] = None) -> Dict[str, Any]:
    """Get multi-modal provenance and evidence items for the drug."""
    if disease_id:
        return await CopilotTools.get_evidence(id, disease_id)
    return await CopilotTools.get_drug(id)
