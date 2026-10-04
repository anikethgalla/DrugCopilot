from fastapi import APIRouter, HTTPException
from typing import Any, Dict, List
from app.agent.tools import CopilotTools
from app.graph.in_memory_graph import in_memory_graph

router = APIRouter(prefix="/targets", tags=["Targets"])


@router.get("")
async def list_targets(limit: int = 50) -> List[Dict[str, Any]]:
    """List protein targets in the knowledge graph."""
    nodes = in_memory_graph.find_nodes_by_label("Protein")
    return [n["properties"] for n in nodes[:limit]]


@router.get("/{id}")
async def get_target_by_id(id: str) -> Dict[str, Any]:
    """Retrieve protein target biology, gene mapping, and targeting drugs."""
    data = await CopilotTools.get_target(id)
    if "error" in data:
        raise HTTPException(status_code=404, detail=data["error"])
    return data
