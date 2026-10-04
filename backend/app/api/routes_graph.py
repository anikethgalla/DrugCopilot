from fastapi import APIRouter, HTTPException, Query
from typing import Any, Dict, Optional
from app.models.graph import SubgraphResponse, CypherQueryRequest, CypherQueryResponse
from app.graph.in_memory_graph import in_memory_graph
from app.agent.tools import CopilotTools
import time

router = APIRouter(prefix="/graph", tags=["Knowledge Graph"])


@router.get("/stats")
async def get_graph_stats() -> Dict[str, Any]:
    """Retrieve node counts, edge counts, and entity distributions."""
    node_labels = {}
    for nid, node in in_memory_graph.nodes_by_id.items():
        lbl = node["label"]
        node_labels[lbl] = node_labels.get(lbl, 0) + 1

    rel_types = {}
    for rel, edges in in_memory_graph.edges_by_type.items():
        rel_types[rel] = len(edges)

    return {
        "total_nodes": len(in_memory_graph.nodes_by_id),
        "total_edges": len(in_memory_graph.graph.edges),
        "node_counts": node_labels,
        "edge_counts": rel_types
    }


@router.get("/{entity_type}/{id}", response_model=SubgraphResponse)
async def get_entity_subgraph(
    entity_type: str,
    id: str,
    max_depth: int = Query(default=2, ge=1, le=4),
    max_nodes: int = Query(default=50, ge=5, le=150)
) -> SubgraphResponse:
    """Retrieve an interactive ego-subgraph surrounding an entity for Cytoscape visualization."""
    subgraph = in_memory_graph.get_subgraph(id, max_depth=max_depth, max_nodes=max_nodes)
    return SubgraphResponse(**subgraph)


@router.post("/query", response_model=CypherQueryResponse)
async def execute_readonly_cypher_query(request: CypherQueryRequest) -> CypherQueryResponse:
    """Execute a parameterized read-only Cypher query with AST security validation."""
    start_time = time.time()
    res = await CopilotTools.run_readonly_cypher(request.query, request.parameters)
    if "error" in res:
        raise HTTPException(status_code=400, detail=res["error"])
    
    records = res.get("records", [])
    columns = list(records[0].keys()) if records else []
    exec_time = round((time.time() - start_time) * 1000, 2)

    return CypherQueryResponse(
        columns=columns,
        rows=records,
        execution_time_ms=exec_time,
        read_only_verified=True
    )
