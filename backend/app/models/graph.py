from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class GraphNode(BaseModel):
    id: str
    label: str  # Drug, Disease, Target, Protein, Gene, Pathway, ClinicalTrial, Publication
    name: str
    properties: Dict[str, Any] = Field(default_factory=dict)


class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    type: str  # TARGETS, BINDS_TO, TREATS, ASSOCIATED_WITH, ENCODES, PARTICIPATES_IN, INVOLVES, INTERACTS_WITH, INVESTIGATED_IN, MENTIONED_IN
    properties: Dict[str, Any] = Field(default_factory=dict)


class SubgraphResponse(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]
    stats: Dict[str, Any] = Field(default_factory=dict)


class CypherQueryRequest(BaseModel):
    query: str = Field(..., description="Read-only Cypher query")
    parameters: Optional[Dict[str, Any]] = Field(default_factory=dict)


class CypherQueryResponse(BaseModel):
    columns: List[str]
    rows: List[Dict[str, Any]]
    execution_time_ms: float
    read_only_verified: bool = True
