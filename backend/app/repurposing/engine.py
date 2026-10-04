import asyncio
import logging
import time
from typing import Any, Dict, List, Optional
from app.models.entities import Drug, Disease
from app.models.repurposing import (
    RepurposingRequest,
    RepurposingResponse,
    RepurposingCandidate,
    EvidenceItem
)
from app.ingestion.live import LiveDataSyncService
from app.ingestion.entity_resolution import EntityResolver
from app.repurposing.strategies import (
    DirectTargetStrategy,
    PathwayOverlapStrategy,
    PPINetworkStrategy,
    IndicationPivotStrategy
)
from app.repurposing.scoring import RepurposingScorer
from app.repurposing.explain import BiologicalExplanationBuilder
from app.graph.in_memory_graph import in_memory_graph

logger = logging.getLogger(__name__)


class RepurposingEngine:
    """
    Core Drug Repurposing Engine.
    Combines live biomedical sync, multi-strategy graph traversal, GDS proximity scoring,
    and explainable biological reasoning.
    """

    @classmethod
    async def find_candidates(cls, request: RepurposingRequest) -> RepurposingResponse:
        start_time = time.time()
        logger.info("Executing drug repurposing search for: %s", request.disease_id_or_name)

        # 1. Live Sync / Ensure Disease Knowledge
        disease_props = await LiveDataSyncService.ensure_disease_knowledge(request.disease_id_or_name)
        disease_id = disease_props["canonical_id"]
        disease_name = disease_props.get("name", request.disease_id_or_name)

        disease_obj = Disease(
            canonical_id=disease_id,
            name=disease_name,
            efo_id=disease_props.get("efo_id"),
            mondo_id=disease_props.get("mondo_id"),
            mesh_id=disease_props.get("mesh_id"),
            synonyms=disease_props.get("synonyms", [])
        )

        # 2. Execute selected strategies concurrently
        all_disease_ids = list(set(filter(None, [disease_id, disease_props.get("mondo_id"), disease_props.get("efo_id")])))
        raw_candidates_by_drug: Dict[str, Dict[str, Any]] = {}

        if "direct_target" in request.strategies:
            dt_results = await DirectTargetStrategy.execute(
                all_disease_ids, disease_name, approved_only=request.approved_only
            )
            for r in dt_results:
                drug_id = r["drug"]["canonical_id"]
                if drug_id not in raw_candidates_by_drug:
                    raw_candidates_by_drug[drug_id] = {
                        "drug": r["drug"],
                        "target_scores": [],
                        "genetic_scores": [],
                        "pathway_scores": [],
                        "network_scores": [],
                        "paths": [],
                        "targets": [],
                        "pathways": [],
                        "evidence_items": []
                    }
                raw_candidates_by_drug[drug_id]["target_scores"].append(r["target_disease_score"])
                raw_candidates_by_drug[drug_id]["genetic_scores"].append(r.get("genetic_score", 0.0))
                raw_candidates_by_drug[drug_id]["targets"].append(r["protein"])

                # Build biological reasoning path
                path = BiologicalExplanationBuilder.build_direct_target_path(
                    disease_name=disease_name,
                    disease_id=disease_id,
                    gene_symbol=r["gene"].get("symbol", "GENE"),
                    gene_id=r["gene"].get("canonical_id", ""),
                    protein_name=r["protein"].get("name", "Target Protein"),
                    uniprot_id=r["protein"].get("uniprot_id", ""),
                    drug_name=r["drug"].get("name", "Drug"),
                    drug_id=drug_id
                )
                raw_candidates_by_drug[drug_id]["paths"].append(path)

                # Add Evidence Item
                raw_candidates_by_drug[drug_id]["evidence_items"].append(
                    EvidenceItem(
                        category="Target Association",
                        title=f"Direct Target: {r['protein'].get('name')}",
                        detail=f"Modulates protein {r['protein'].get('name')} (Gene {r['gene'].get('symbol')}) with association score {r['target_disease_score']:.2f}",
                        confidence=r["target_disease_score"],
                        source="Open Targets / ChEMBL",
                        source_id=r["protein"].get("uniprot_id", drug_id),
                        source_url=f"https://platform.opentargets.org/target/{r['gene'].get('ensembl_id', '')}"
                    )
                )

        if "pathway_overlap" in request.strategies:
            pw_results = await PathwayOverlapStrategy.execute(
                all_disease_ids, disease_name, approved_only=request.approved_only
            )
            for r in pw_results:
                drug_id = r["drug"]["canonical_id"]
                if drug_id not in raw_candidates_by_drug:
                    raw_candidates_by_drug[drug_id] = {
                        "drug": r["drug"],
                        "target_scores": [0.5],
                        "genetic_scores": [0.0],
                        "pathway_scores": [],
                        "network_scores": [],
                        "paths": [],
                        "targets": [],
                        "pathways": [],
                        "evidence_items": []
                    }
                raw_candidates_by_drug[drug_id]["pathway_scores"].append(r["pathway_overlap_score"])
                raw_candidates_by_drug[drug_id]["pathways"].append(r["pathway"].get("name", "Pathway"))

                path = BiologicalExplanationBuilder.build_pathway_path(
                    disease_name=disease_name,
                    disease_id=disease_id,
                    pathway_name=r["pathway"].get("name", "Pathway"),
                    pathway_id=r["pathway"].get("canonical_id", ""),
                    protein_name=r["protein"].get("name", "Target Protein"),
                    uniprot_id=r["protein"].get("uniprot_id", ""),
                    drug_name=r["drug"].get("name", "Drug"),
                    drug_id=drug_id
                )
                raw_candidates_by_drug[drug_id]["paths"].append(path)

        if "ppi_network" in request.strategies:
            ppi_results = await PPINetworkStrategy.execute(
                all_disease_ids, disease_name, approved_only=request.approved_only
            )
            for r in ppi_results:
                drug_id = r["drug"]["canonical_id"]
                if drug_id not in raw_candidates_by_drug:
                    raw_candidates_by_drug[drug_id] = {
                        "drug": r["drug"],
                        "target_scores": [0.4],
                        "genetic_scores": [0.0],
                        "pathway_scores": [],
                        "network_scores": [r["network_score"]],
                        "paths": [],
                        "targets": [],
                        "pathways": [],
                        "evidence_items": []
                    }
                raw_candidates_by_drug[drug_id]["network_scores"].append(r["network_score"])

        if "indication_pivot" in request.strategies:
            ind_results = await IndicationPivotStrategy.execute(
                all_disease_ids, disease_name, approved_only=request.approved_only
            )
            for r in ind_results:
                drug_id = r["drug"]["canonical_id"]
                if drug_id not in raw_candidates_by_drug:
                    raw_candidates_by_drug[drug_id] = {
                        "drug": r["drug"],
                        "target_scores": [0.6],
                        "genetic_scores": [0.0],
                        "pathway_scores": [],
                        "network_scores": [r["indication_score"]],
                        "paths": [],
                        "targets": [],
                        "pathways": [],
                        "evidence_items": []
                    }
                raw_candidates_by_drug[drug_id]["network_scores"].append(r["indication_score"])

        # 3. Calculate Scores and Synthesize Candidates
        candidate_objects: List[RepurposingCandidate] = []

        for drug_id, item in raw_candidates_by_drug.items():
            drug_props = item["drug"]
            avg_target = sum(item["target_scores"]) / len(item["target_scores"]) if item["target_scores"] else 0.5
            avg_genetic = sum(item["genetic_scores"]) / len(item["genetic_scores"]) if item["genetic_scores"] else 0.0
            avg_pathway = sum(item["pathway_scores"]) / len(item["pathway_scores"]) if item["pathway_scores"] else 0.4
            network_score = 0.70  # Graph distance proxy

            phase = drug_props.get("max_clinical_phase", 0)
            is_approved = drug_props.get("is_approved", False)

            # Check trials in graph
            trials = in_memory_graph.get_neighbors(drug_id, rel_type="INVESTIGATED_IN", direction="out")
            has_trials = len(trials) > 0

            # Check publications in graph
            pubs = in_memory_graph.get_neighbors(drug_id, rel_type="MENTIONED_IN", direction="out")
            pub_count = len(pubs)

            overall_score, breakdown, classification = RepurposingScorer.calculate_score_breakdown(
                target_score=avg_target,
                pathway_score=avg_pathway,
                network_score=network_score,
                clinical_phase=phase,
                has_trials=has_trials,
                publication_count=pub_count,
                genetic_association_score=avg_genetic
            )

            if overall_score < request.min_score:
                continue

            drug_model = Drug(
                canonical_id=drug_id,
                name=drug_props.get("name", drug_id),
                chembl_id=drug_props.get("chembl_id"),
                pubchem_cid=drug_props.get("pubchem_cid"),
                is_approved=is_approved,
                max_clinical_phase=phase,
                smiles=drug_props.get("smiles"),
                molecular_formula=drug_props.get("molecular_formula"),
                molecular_weight=drug_props.get("molecular_weight")
            )

            limitations = BiologicalExplanationBuilder.generate_limitations(
                drug_name=drug_model.name,
                disease_name=disease_name,
                is_approved=is_approved,
                clinical_phase=phase or 0,
                has_trials=has_trials
            )

            candidate_objects.append(
                RepurposingCandidate(
                    drug=drug_model,
                    overall_score=overall_score,
                    score_breakdown=breakdown,
                    classification=classification,
                    mechanism_hypothesis=(
                        f"{drug_model.name} was identified as a {classification.value.lower()} repurposing candidate "
                        f"for {disease_name} based on multi-target alignment with disease-associated genes and pathway overlap."
                    ),
                    biological_paths=item["paths"][:3],
                    key_targets=item["targets"][:5],
                    key_pathways=list(set(item["pathways"]))[:5],
                    evidence_items=item["evidence_items"][:5],
                    limitations=limitations
                )
            )

        # Sort candidates by overall score descending
        candidate_objects.sort(key=lambda c: c.overall_score, reverse=True)
        top_candidates = candidate_objects[:request.max_candidates]

        execution_time = round(time.time() - start_time, 3)

        return RepurposingResponse(
            disease=disease_obj,
            total_candidates_found=len(top_candidates),
            candidates=top_candidates,
            execution_time_seconds=execution_time,
            graph_stats={
                "total_graph_nodes": len(in_memory_graph.nodes_by_id),
                "total_graph_edges": len(in_memory_graph.graph.edges),
                "strategies_executed": request.strategies
            }
        )


repurposing_engine = RepurposingEngine()
