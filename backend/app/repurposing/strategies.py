import logging
from typing import Any, Dict, List, Set, Union
from app.graph.driver import Neo4jConnectionManager
from app.graph.in_memory_graph import in_memory_graph

logger = logging.getLogger(__name__)


def _normalize_disease_ids(disease_id: Union[str, List[str]]) -> List[str]:
    if isinstance(disease_id, list):
        return [d for d in disease_id if d]
    return [disease_id] if disease_id else []


class DirectTargetStrategy:
    """Strategy 1: Direct Target Overlap (Disease <- Associated - Gene - Encodes -> Protein <- Targets - Drug)."""
    @classmethod
    async def execute(cls, disease_id: Union[str, List[str]], disease_name: str, approved_only: bool = False, limit: int = 25) -> List[Dict[str, Any]]:
        candidates = []
        d_ids = _normalize_disease_ids(disease_id)

        for did in d_ids:
            disease_node = in_memory_graph.get_node(did)
            if not disease_node:
                continue

            for assoc in in_memory_graph.get_neighbors(did, rel_type="ASSOCIATED_WITH", direction="in"):
                gene_node = assoc["node"]
                gene_id = gene_node["id"]
                assoc_score = assoc["edge"].get("score", 0.7)
                genetic_score = assoc["edge"].get("genetic_score", 0.0)

                for enc in in_memory_graph.get_neighbors(gene_id, rel_type="ENCODES", direction="out"):
                    protein_node = enc["node"]
                    protein_id = protein_node["id"]

                    for tgt in in_memory_graph.get_neighbors(protein_id, rel_type="TARGETS", direction="in"):
                        drug_node = tgt["node"]
                        drug_props = drug_node["properties"]
                        if approved_only and not drug_props.get("is_approved"):
                            continue

                        candidates.append({
                            "strategy": "Direct Target Overlap",
                            "drug": drug_props,
                            "protein": protein_node["properties"],
                            "gene": gene_node["properties"],
                            "disease": disease_node["properties"],
                            "target_disease_score": assoc_score,
                            "genetic_score": genetic_score,
                            "target_relation": tgt["edge"]
                        })
        return candidates


class PathwayOverlapStrategy:
    """Strategy 2: Pathway Co-occurrence (Disease - Involves -> Pathway <- ParticipatesIn - Protein <- Targets - Drug)."""
    @classmethod
    async def execute(cls, disease_id: Union[str, List[str]], disease_name: str, approved_only: bool = False, limit: int = 25) -> List[Dict[str, Any]]:
        candidates = []
        d_ids = _normalize_disease_ids(disease_id)

        for did in d_ids:
            disease_node = in_memory_graph.get_node(did)
            if not disease_node:
                continue

            for inv in in_memory_graph.get_neighbors(did, rel_type="INVOLVES", direction="out"):
                pathway_node = inv["node"]
                pw_id = pathway_node["id"]

                for part in in_memory_graph.get_neighbors(pw_id, rel_type="PARTICIPATES_IN", direction="in"):
                    protein_node = part["node"]
                    protein_id = protein_node["id"]

                    for tgt in in_memory_graph.get_neighbors(protein_id, rel_type="TARGETS", direction="in"):
                        drug_node = tgt["node"]
                        drug_props = drug_node["properties"]
                        if approved_only and not drug_props.get("is_approved"):
                            continue

                        candidates.append({
                            "strategy": "Pathway Co-occurrence",
                            "drug": drug_props,
                            "protein": protein_node["properties"],
                            "pathway": pathway_node["properties"],
                            "disease": disease_node["properties"],
                            "pathway_overlap_score": 0.75,
                            "target_relation": tgt["edge"]
                        })
        return candidates


class PPINetworkStrategy:
    """Strategy 3: Protein-Protein Interaction 2-Hop Network Proximity."""
    @classmethod
    async def execute(cls, disease_id: Union[str, List[str]], disease_name: str, approved_only: bool = False, limit: int = 20) -> List[Dict[str, Any]]:
        candidates = []
        d_ids = _normalize_disease_ids(disease_id)

        for did in d_ids:
            disease_node = in_memory_graph.get_node(did)
            if not disease_node:
                continue

            for assoc in in_memory_graph.get_neighbors(did, rel_type="ASSOCIATED_WITH", direction="in"):
                gene_node = assoc["node"]
                gene_id = gene_node["id"]
                for enc in in_memory_graph.get_neighbors(gene_id, rel_type="ENCODES", direction="out"):
                    p1 = enc["node"]
                    p1_id = p1["id"]

                    for ppi in in_memory_graph.get_neighbors(p1_id, rel_type="INTERACTS_WITH", direction="both"):
                        p2 = ppi["node"]
                        p2_id = p2["id"]
                        if p2_id == p1_id:
                            continue

                        for tgt in in_memory_graph.get_neighbors(p2_id, rel_type="TARGETS", direction="in"):
                            drug_node = tgt["node"]
                            drug_props = drug_node["properties"]
                            if approved_only and not drug_props.get("is_approved"):
                                continue

                            candidates.append({
                                "strategy": "PPI Network Proximity",
                                "drug": drug_props,
                                "disease_protein": p1["properties"],
                                "target_protein": p2["properties"],
                                "network_score": 0.65,
                                "target_relation": tgt["edge"]
                            })
        return candidates


class IndicationPivotStrategy:
    """Strategy 4: Indication Pivot (Disease <- Treats - KnownDrug - Targets -> Protein <- Targets - CandidateDrug)."""
    @classmethod
    async def execute(cls, disease_id: Union[str, List[str]], disease_name: str, approved_only: bool = False, limit: int = 20) -> List[Dict[str, Any]]:
        candidates = []
        d_ids = _normalize_disease_ids(disease_id)

        for did in d_ids:
            disease_node = in_memory_graph.get_node(did)
            if not disease_node:
                continue

            for treats in in_memory_graph.get_neighbors(did, rel_type="TREATS", direction="in"):
                known_drug = treats["node"]
                kd_id = known_drug["id"]

                for tgt1 in in_memory_graph.get_neighbors(kd_id, rel_type="TARGETS", direction="out"):
                    shared_prot = tgt1["node"]
                    sp_id = shared_prot["id"]

                    for tgt2 in in_memory_graph.get_neighbors(sp_id, rel_type="TARGETS", direction="in"):
                        cand_drug = tgt2["node"]
                        if cand_drug["id"] == kd_id:
                            continue

                        cand_props = cand_drug["properties"]
                        if approved_only and not cand_props.get("is_approved"):
                            continue

                        candidates.append({
                            "strategy": "Indication Pivot",
                            "drug": cand_props,
                            "known_drug": known_drug["properties"],
                            "shared_protein": shared_prot["properties"],
                            "disease": disease_node["properties"],
                            "indication_score": 0.70,
                            "target_relation": tgt2["edge"]
                        })
        return candidates
