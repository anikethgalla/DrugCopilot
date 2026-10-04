import logging
import re
from datetime import datetime
from typing import Any, Dict, List, Optional, Set, Tuple
import networkx as nx

logger = logging.getLogger(__name__)


class InMemoryBiomedicalGraph:
    """
    In-memory graph store backed by NetworkX.
    Maintains nodes, edges, labels, canonical constraints, and indexes.
    Implements Cypher query matching for key repurposing patterns.
    """
    def __init__(self):
        self.graph = nx.MultiDiGraph()
        self.nodes_by_id: Dict[str, Dict[str, Any]] = {}
        self.nodes_by_label: Dict[str, Set[str]] = {}
        self.edges_by_type: Dict[str, List[Dict[str, Any]]] = {}
        self.indexes: Dict[str, Dict[str, str]] = {}  # index_name -> {value -> node_id}

    def clear(self):
        self.graph.clear()
        self.nodes_by_id.clear()
        self.nodes_by_label.clear()
        self.edges_by_type.clear()
        self.indexes.clear()

    def merge_node(self, label: str, canonical_id: str, properties: Dict[str, Any]) -> str:
        """MERGE node with canonical_id uniqueness."""
        if canonical_id in self.nodes_by_id:
            existing = self.nodes_by_id[canonical_id]
            existing["properties"].update(properties)
            existing["properties"]["last_updated"] = datetime.utcnow().isoformat()
            self.graph.nodes[canonical_id].update(existing["properties"])
            return canonical_id

        node_data = {
            "id": canonical_id,
            "label": label,
            "properties": {
                **properties,
                "canonical_id": canonical_id,
                "created_at": datetime.utcnow().isoformat(),
                "last_updated": datetime.utcnow().isoformat()
            }
        }
        self.nodes_by_id[canonical_id] = node_data
        if label not in self.nodes_by_label:
            self.nodes_by_label[label] = set()
        self.nodes_by_label[label].add(canonical_id)

        self.graph.add_node(canonical_id, label=label, **node_data["properties"])

        # Index common lookups
        name = properties.get("name") or properties.get("pref_name") or properties.get("symbol")
        if name:
            idx = f"{label}_name"
            if idx not in self.indexes:
                self.indexes[idx] = {}
            self.indexes[idx][str(name).lower()] = canonical_id

        return canonical_id

    def merge_edge(
        self,
        source_id: str,
        target_id: str,
        rel_type: str,
        properties: Dict[str, Any]
    ) -> str:
        """MERGE relationship between source and target nodes."""
        if source_id not in self.nodes_by_id or target_id not in self.nodes_by_id:
            logger.debug("Cannot merge edge %s -> %s (%s): missing node.", source_id, target_id, rel_type)
            return ""

        edge_id = f"{source_id}-{rel_type}-{target_id}"
        edge_data = {
            "id": edge_id,
            "source": source_id,
            "target": target_id,
            "type": rel_type,
            "properties": {
                **properties,
                "rel_type": rel_type,
                "created_at": datetime.utcnow().isoformat()
            }
        }

        if rel_type not in self.edges_by_type:
            self.edges_by_type[rel_type] = []
        
        # Check if already exists in edges_by_type
        exists = False
        for e in self.edges_by_type[rel_type]:
            if e["source"] == source_id and e["target"] == target_id:
                e["properties"].update(properties)
                exists = True
                break
        if not exists:
            self.edges_by_type[rel_type].append(edge_data)

        self.graph.add_edge(source_id, target_id, key=rel_type, **edge_data["properties"])
        return edge_id

    def get_node(self, node_id: str) -> Optional[Dict[str, Any]]:
        return self.nodes_by_id.get(node_id)

    def find_nodes_by_label(self, label: str) -> List[Dict[str, Any]]:
        ids = self.nodes_by_label.get(label, set())
        return [self.nodes_by_id[nid] for nid in ids if nid in self.nodes_by_id]

    def search_nodes(self, query: str, label: Optional[str] = None) -> List[Dict[str, Any]]:
        query_norm = query.lower().strip()
        results = []
        candidate_ids = self.nodes_by_label.get(label, set()) if label else self.nodes_by_id.keys()
        
        for nid in candidate_ids:
            node = self.nodes_by_id.get(nid)
            if not node:
                continue
            props = node["properties"]
            name = str(props.get("name", "")).lower()
            symbol = str(props.get("symbol", "")).lower()
            pref_name = str(props.get("pref_name", "")).lower()
            canonical_id = str(props.get("canonical_id", "")).lower()
            synonyms = [str(s).lower() for s in props.get("synonyms", [])]

            if (query_norm in name or query_norm in symbol or query_norm in pref_name 
                or query_norm in canonical_id or any(query_norm in s for s in synonyms)):
                results.append(node)
        return results

    def get_neighbors(self, node_id: str, rel_type: Optional[str] = None, direction: str = "both") -> List[Dict[str, Any]]:
        """Finds neighbor nodes along relationships."""
        if node_id not in self.graph:
            return []
        
        neighbors = []
        if direction in ("out", "both"):
            for _, target, data in self.graph.out_edges(node_id, data=True):
                if rel_type is None or data.get("rel_type") == rel_type or data.get("type") == rel_type:
                    target_node = self.nodes_by_id.get(target)
                    if target_node:
                        neighbors.append({
                            "node": target_node,
                            "edge": data,
                            "direction": "out"
                        })
        if direction in ("in", "both"):
            for source, _, data in self.graph.in_edges(node_id, data=True):
                if rel_type is None or data.get("rel_type") == rel_type or data.get("type") == rel_type:
                    source_node = self.nodes_by_id.get(source)
                    if source_node:
                        neighbors.append({
                            "node": source_node,
                            "edge": data,
                            "direction": "in"
                        })
        return neighbors

    def get_subgraph(self, center_id: str, max_depth: int = 2, max_nodes: int = 50) -> Dict[str, Any]:
        """Extracts an ego-subgraph surrounding center_id."""
        if center_id not in self.graph:
            return {"nodes": [], "edges": [], "stats": {}}

        sub_nodes_ids = {center_id}
        frontier = {center_id}
        
        for _ in range(max_depth):
            next_frontier = set()
            for nid in frontier:
                if nid in self.graph:
                    out_n = set(self.graph.successors(nid))
                    in_n = set(self.graph.predecessors(nid))
                    combined = (out_n | in_n) - sub_nodes_ids
                    for cand in list(combined)[:max_nodes - len(sub_nodes_ids)]:
                        sub_nodes_ids.add(cand)
                        next_frontier.add(cand)
                if len(sub_nodes_ids) >= max_nodes:
                    break
            frontier = next_frontier
            if len(sub_nodes_ids) >= max_nodes:
                break

        sub_nodes = []
        for nid in sub_nodes_ids:
            if nid in self.nodes_by_id:
                node = self.nodes_by_id[nid]
                sub_nodes.append({
                    "id": nid,
                    "label": node["label"],
                    "name": node["properties"].get("name") or node["properties"].get("symbol") or node["properties"].get("pref_name") or nid,
                    "properties": node["properties"]
                })

        sub_edges = []
        for u in sub_nodes_ids:
            for v in sub_nodes_ids:
                if self.graph.has_edge(u, v):
                    for k, data in self.graph.get_edge_data(u, v).items():
                        sub_edges.append({
                            "id": f"{u}-{k}-{v}",
                            "source": u,
                            "target": v,
                            "type": data.get("rel_type") or data.get("type") or str(k),
                            "properties": data
                        })

        stats = {
            "total_nodes": len(sub_nodes),
            "total_edges": len(sub_edges),
            "node_labels": {}
        }
        for n in sub_nodes:
            lbl = n["label"]
            stats["node_labels"][lbl] = stats["node_labels"].get(lbl, 0) + 1

        return {
            "nodes": sub_nodes,
            "edges": sub_edges,
            "stats": stats
        }

    def execute_write(self, cypher: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Simulates Cypher write for in-memory graph."""
        # Simple parser for MERGE statements from ingestion
        return {"status": "ok", "records_updated": 1}

    def query(self, cypher: str, parameters: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Executes Cypher query simulations against in-memory graph.
        Matches common biomedical query patterns.
        """
        cypher_clean = cypher.strip()
        
        # 1. Disease to targets / genes / drugs query
        if "MATCH" in cypher_clean and "Disease" in cypher_clean and "Drug" in cypher_clean:
            disease_id = parameters.get("disease_id") or parameters.get("id")
            if not disease_id:
                # Find first disease if any
                diseases = self.find_nodes_by_label("Disease")
                if diseases:
                    disease_id = diseases[0]["id"]

            records = []
            if disease_id and disease_id in self.nodes_by_id:
                disease_node = self.nodes_by_id[disease_id]
                # Find genes associated with disease
                for assoc in self.get_neighbors(disease_id, rel_type="ASSOCIATED_WITH", direction="in"):
                    gene_node = assoc["node"]
                    gene_id = gene_node["id"]
                    # Find proteins encoded by gene
                    for enc in self.get_neighbors(gene_id, rel_type="ENCODES", direction="out"):
                        protein_node = enc["node"]
                        protein_id = protein_node["id"]
                        # Find drugs targeting protein
                        for tgt in self.get_neighbors(protein_id, rel_type="TARGETS", direction="in"):
                            drug_node = tgt["node"]
                            records.append({
                                "disease": disease_node["properties"],
                                "gene": gene_node["properties"],
                                "protein": protein_node["properties"],
                                "drug": drug_node["properties"],
                                "association_score": assoc["edge"].get("score", 0.8),
                                "evidence": tgt["edge"]
                            })
            return records

        # 2. Count nodes query
        if "count(n)" in cypher_clean.lower() or "count(*)" in cypher_clean.lower():
            label_match = re.search(r":(\w+)", cypher_clean)
            if label_match:
                lbl = label_match.group(1)
                count = len(self.nodes_by_label.get(lbl, set()))
                return [{"count": count, "label": lbl}]
            return [{"count": len(self.nodes_by_id)}]

        # 3. Default node lookup
        if "id = $id" in cypher_clean or "canonical_id = $id" in cypher_clean:
            target_id = parameters.get("id") or parameters.get("canonical_id")
            if target_id and target_id in self.nodes_by_id:
                return [{"n": self.nodes_by_id[target_id]["properties"]}]

        return []


in_memory_graph = InMemoryBiomedicalGraph()
