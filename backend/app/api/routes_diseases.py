from fastapi import APIRouter, HTTPException
from typing import Any, Dict, List
from app.agent.tools import CopilotTools
from app.graph.in_memory_graph import in_memory_graph

router = APIRouter(prefix="/diseases", tags=["Diseases"])


@router.get("")
async def list_diseases(limit: int = 50) -> List[Dict[str, Any]]:
    """List diseases present in the biomedical knowledge graph."""
    nodes = in_memory_graph.find_nodes_by_label("Disease")
    return [n["properties"] for n in nodes[:limit]]


@router.get("/{id}")
async def get_disease_by_id(id: str) -> Dict[str, Any]:
    """Retrieve disease profile, associated target genes, pathways, and known therapies."""
    data = await CopilotTools.get_disease(id)
    if "error" in data:
        raise HTTPException(status_code=404, detail=data["error"])
    return data


@router.get("/{id}/associated-drugs")
async def get_disease_associated_drugs(id: str) -> List[Dict[str, Any]]:
    """Get known drugs indicated for or investigated in the disease."""
    data = await CopilotTools.get_disease(id)
    return data.get("known_drugs", [])


@router.get("/{id}/pathways")
async def get_disease_pathways(id: str) -> List[Dict[str, Any]]:
    """Get biological pathways involved in disease pathophysiology."""
    return await CopilotTools.find_pathways(id)
