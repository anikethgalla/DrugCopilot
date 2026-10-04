import logging
from typing import Any, Dict, List, Optional, Set
import networkx as nx
from app.graph.driver import Neo4jConnectionManager
from app.graph.in_memory_graph import in_memory_graph

logger = logging.getLogger(__name__)


class GraphDataScienceService:
    """
    Modular Graph Data Science routines:
    1. Personalized PageRank (PPR) seeded on disease targets.
    2. Jaccard similarity between drug target sets and disease target sets.
    3. Shortest path & network proximity calculation.
    """

    @classmethod
    async def compute_personalized_pagerank(
        cls,
        seed_node_ids: List[str],
        alpha: float = 0.85,
        max_iter: int = 100
    ) -> Dict[str, float]:
        """
        Computes Personalized PageRank with personalization vector concentrated on disease seed nodes.
        Returns a mapping of node_id -> score.
        """
        if not seed_node_ids:
            return {}

        # First check if we can compute on in-memory networkx graph
        G = in_memory_graph.graph.to_undirected()
        if len(G.nodes) > 0:
            valid_seeds = [nid for nid in seed_node_ids if nid in G]
            if not valid_seeds:
                return {}
            
            personalization = {n: 0.0 for n in G.nodes()}
            weight = 1.0 / len(valid_seeds)
            for s in valid_seeds:
                personalization[s] = weight

            try:
                ppr = nx.pagerank(G, alpha=alpha, personalization=personalization, max_iter=max_iter)
                return ppr
            except Exception as e:
                logger.warning("NetworkX PageRank computation error: %s", e)

        # Alternatively, if Neo4j GDS is enabled:
        try:
            cypher = """
            CALL gds.pageRank.stream('biomedicalGraph', {
                maxIterations: $max_iter,
                dampingFactor: $alpha,
                sourceNodes: $seed_ids
            })
            YIELD nodeId, score
            RETURN gds.util.asNode(nodeId).canonical_id AS id, score
            ORDER BY score DESC
            """
            records = await Neo4jConnectionManager.execute_query(
                cypher,
                {"max_iter": max_iter, "alpha": alpha, "seed_ids": seed_node_ids}
            )
            return {r["id"]: float(r["score"]) for r in records if r.get("id")}
        except Exception as e:
            logger.debug("Neo4j GDS PageRank unavailable (%s). Using algorithmic approximation.", e)
            return {}

    @classmethod
    def compute_jaccard_similarity(cls, set_a: Set[str], set_b: Set[str]) -> float:
        """Computes Jaccard index: |A ∩ B| / |A ∪ B|."""
        if not set_a or not set_b:
            return 0.0
        intersection = len(set_a.intersection(set_b))
        union = len(set_a.union(set_b))
        return intersection / union if union > 0 else 0.0

    @classmethod
    def compute_network_proximity(
        cls,
        drug_targets: List[str],
        disease_genes: List[str]
    ) -> float:
        """
        Computes network proximity between drug targets and disease genes
        based on shortest path distances in the protein interaction network.
        """
        if not drug_targets or not disease_genes:
            return 0.0

        G = in_memory_graph.graph.to_undirected()
        if len(G.nodes) == 0:
            # Direct overlap proxy
            overlap = set(drug_targets).intersection(set(disease_genes))
            return len(overlap) / max(len(drug_targets), 1)

        distances = []
        for dt in drug_targets:
            if dt not in G:
                continue
            for dg in disease_genes:
                if dg not in G:
                    continue
                try:
                    d = nx.shortest_path_length(G, source=dt, target=dg)
                    distances.append(d)
                except (nx.NetworkXNoPath, nx.NodeNotFound):
                    continue

        if not distances:
            return 0.1  # baseline unconnected default

        # Closer average distance -> higher proximity score: score = 1 / (1 + avg_distance)
        avg_dist = sum(distances) / len(distances)
        return round(1.0 / (1.0 + avg_dist), 4)
