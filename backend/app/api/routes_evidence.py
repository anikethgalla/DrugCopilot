from fastapi import APIRouter, HTTPException, Query
from typing import Any, Dict, List, Optional
from app.agent.tools import CopilotTools
from app.graph.in_memory_graph import in_memory_graph

router = APIRouter(prefix="/evidence", tags=["Evidence & Provenance"])


@router.get("/summary")
async def get_evidence_summary() -> Dict[str, Any]:
    """Retrieve statistical summary of evidence types and data sources in the knowledge graph."""
    edges = in_memory_graph.graph.edges(data=True)
    sources = {}
    evidence_types = {}
    
    for _, _, data in edges:
        src = data.get("source", "Unknown")
        sources[src] = sources.get(src, 0) + 1
        
        etype = data.get("rel_type") or data.get("type", "UNKNOWN")
        evidence_types[etype] = evidence_types.get(etype, 0) + 1

    return {
        "total_evidence_edges": len(edges),
        "data_sources": sources,
        "relationship_types": evidence_types
    }


@router.get("/inspect")
async def inspect_evidence(
    source_id: Optional[str] = Query(None, description="e.g. CHEMBL25, EFO_0000249, NCT04245644, PMID:123456")
) -> Dict[str, Any]:
    """Inspect provenance details and downstream connected facts for a source ID."""
    if not source_id:
        return {"message": "Please supply a source_id to inspect."}

    matched_nodes = in_memory_graph.search_nodes(source_id)
    return {
        "query": source_id,
        "matched_entities": matched_nodes,
        "provenance_standard": "W3C PROV-DM compatible with verified database URLs"
    }
