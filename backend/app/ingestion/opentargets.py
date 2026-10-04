import asyncio
import logging
from typing import Any, Dict, List, Optional
from app.clients.opentargets import opentargets_client
from app.graph.driver import Neo4jConnectionManager
from app.graph.in_memory_graph import in_memory_graph
from app.ingestion.provenance import ProvenanceFactory

logger = logging.getLogger(__name__)


class OpenTargetsIngestor:
    """Ingestion pipeline for Open Targets disease targets, genetic scores, and biological pathways."""

    @classmethod
    async def ingest_disease_targets(cls, disease_id: str, disease_name: Optional[str] = None, limit: int = 30) -> Dict[str, Any]:
        """
        Ingests disease-target associations, genes, proteins, pathways, and known drugs
        for a canonical disease ID (e.g. EFO_0000249 for Alzheimer's disease).
        """
        resolved_name = disease_name or disease_id
        logger.info("Ingesting Open Targets associations for disease: %s (%s)", resolved_name, disease_id)

        # 1. Fetch associated targets
        target_rows = await opentargets_client.get_associated_targets(disease_id, limit=limit)
        
        # Ingest Disease Node
        disease_props = {
            "canonical_id": disease_id,
            "efo_id": disease_id if "EFO" in disease_id else None,
            "name": resolved_name
        }
        in_memory_graph.merge_node("Disease", disease_id, disease_props)

        ingested_count = 0
        for row in target_rows:
            overall_score = float(row.get("score", 0.0))
            datatype_scores = {d.get("id"): d.get("score") for d in row.get("datatypeScores", [])}
            target_data = row.get("target", {})
            ensembl_id = target_data.get("id")
            symbol = target_data.get("approvedSymbol")
            approved_name = target_data.get("approvedName")

            if not ensembl_id or not symbol:
                continue

            # Ingest Gene
            gene_props = {
                "ensembl_id": ensembl_id,
                "canonical_id": ensembl_id,
                "symbol": symbol,
                "name": approved_name
            }
            in_memory_graph.merge_node("Gene", ensembl_id, gene_props)

            # Link Gene -[:ASSOCIATED_WITH]-> Disease
            prov = ProvenanceFactory.open_targets(
                source_id=disease_id,
                evidence_type="GENETIC_AND_OMICS_ASSOCIATION",
                confidence=overall_score,
                extra={"datatype_scores": datatype_scores}
            )
            rel_props = {
                "score": overall_score,
                "genetic_score": datatype_scores.get("genetic_association", 0.0),
                "literature_score": datatype_scores.get("literature", 0.0),
                "source": prov.source,
                "source_id": prov.source_id,
                "source_url": prov.source_url,
                "confidence": prov.confidence
            }
            cypher_assoc = """
            MERGE (g:Gene {ensembl_id: $ensembl_id})
            ON CREATE SET g.canonical_id = $ensembl_id, g.ensembl_id = $ensembl_id, g.symbol = $symbol, g.name = $approved_name
            ON MATCH SET g.canonical_id = coalesce(g.canonical_id, $ensembl_id), g.symbol = $symbol, g.name = coalesce(g.name, $approved_name)
            MERGE (d:Disease {canonical_id: $disease_id})
            ON CREATE SET d.name = $disease_name, d.canonical_id = $disease_id
            ON MATCH SET d.name = coalesce(d.name, $disease_name)
            MERGE (g)-[r:ASSOCIATED_WITH]->(d)
            SET r += $props
            """
            await Neo4jConnectionManager.execute_write(
                cypher_assoc,
                {
                    "ensembl_id": ensembl_id,
                    "disease_id": disease_id,
                    "disease_name": resolved_name,
                    "symbol": symbol,
                    "approved_name": approved_name or symbol,
                    "props": rel_props
                }
            )
            in_memory_graph.merge_edge(ensembl_id, disease_id, "ASSOCIATED_WITH", rel_props)

            # Ingest associated Protein (UniProt)
            protein_ids = target_data.get("proteinIds", [])
            uniprot_id = None
            for p in protein_ids:
                if p.get("source") == "uniprot_swissprot" or "uniprot" in p.get("source", "").lower():
                    uniprot_id = p.get("id")
                    break
            if not uniprot_id and protein_ids:
                uniprot_id = protein_ids[0].get("id")

            if uniprot_id:
                prot_props = {
                    "uniprot_id": uniprot_id,
                    "canonical_id": uniprot_id,
                    "name": approved_name or symbol,
                    "gene_symbol": symbol,
                    "ensembl_id": ensembl_id
                }
                in_memory_graph.merge_node("Protein", uniprot_id, prot_props)

                # Link Gene -[:ENCODES]-> Protein
                enc_props = {"source": "Open Targets / Ensembl", "confidence": 1.0}
                cypher_enc = """
                MERGE (g:Gene {ensembl_id: $ensembl_id})
                MERGE (p:Protein {uniprot_id: $uniprot_id})
                ON CREATE SET p.canonical_id = $uniprot_id, p.uniprot_id = $uniprot_id, p.name = $prot_name, p.gene_symbol = $symbol
                ON MATCH SET p.canonical_id = coalesce(p.canonical_id, $uniprot_id), p.name = coalesce(p.name, $prot_name), p.gene_symbol = $symbol
                MERGE (g)-[r:ENCODES]->(p)
                SET r += $props
                """
                await Neo4jConnectionManager.execute_write(
                    cypher_enc,
                    {"ensembl_id": ensembl_id, "uniprot_id": uniprot_id, "prot_name": approved_name or symbol, "symbol": symbol, "props": enc_props}
                )
                in_memory_graph.merge_edge(ensembl_id, uniprot_id, "ENCODES", enc_props)

            # Ingest Pathways
            for pw in target_data.get("pathways", []):
                pw_id = pw.get("pathwayId")
                pw_name = pw.get("pathway")
                if pw_id and pw_name:
                    pw_props = {
                        "pathway_id": pw_id,
                        "canonical_id": pw_id,
                        "name": pw_name,
                        "source_db": "Reactome"
                    }
                    in_memory_graph.merge_node("Pathway", pw_id, pw_props)

                    # Link Disease -[:INVOLVES]-> Pathway
                    inv_props = {"source": "Open Targets", "confidence": 0.8}
                    in_memory_graph.merge_edge(disease_id, pw_id, "INVOLVES", inv_props)

                    # Link Protein -[:PARTICIPATES_IN]-> Pathway
                    if uniprot_id:
                        part_props = {"source": "Reactome", "confidence": 1.0}
                        in_memory_graph.merge_edge(uniprot_id, pw_id, "PARTICIPATES_IN", part_props)

            ingested_count += 1

        # 2. Fetch known disease drugs
        known_drugs = await opentargets_client.get_disease_drugs(disease_id, limit=limit)
        for kd in known_drugs:
            drug_info = kd.get("drug", {})
            drug_chembl_id = drug_info.get("id")
            drug_name = drug_info.get("name")
            max_stage = kd.get("maxClinicalStage")
            
            phase = 4 if max_stage in (4, 4.0, "PHASE_4", "APPROVED") else 3 if max_stage in (3, 3.0, "PHASE_3") else 2
            is_approved = max_stage in (4, 4.0, "PHASE_4", "APPROVED")

            if drug_chembl_id:
                drug_props = {
                    "canonical_id": drug_chembl_id,
                    "chembl_id": drug_chembl_id,
                    "name": drug_name or drug_chembl_id,
                    "is_approved": is_approved,
                    "max_clinical_phase": phase
                }
                drug_cypher = """
                MERGE (d:Drug {canonical_id: $drug_id})
                ON CREATE SET d += $props
                ON MATCH SET d += $props
                WITH d
                MERGE (dis:Disease {canonical_id: $disease_id})
                MERGE (d)-[r:TREATS]->(dis)
                SET r += $treats_props
                """
                await Neo4jConnectionManager.execute_write(
                    drug_cypher,
                    {
                        "drug_id": drug_chembl_id,
                        "props": drug_props,
                        "disease_id": disease_id,
                        "treats_props": treats_props
                    }
                )

                # Fetch drug mechanisms to link (Drug)-[:TARGETS]->(Protein)
                try:
                    from app.clients.chembl import chembl_client
                    mechs = await chembl_client.get_drug_mechanisms(drug_chembl_id)
                    for m in mechs[:3]:
                        tgt_chembl = m.get("target_chembl_id")
                        if tgt_chembl:
                            tgt_data = await chembl_client.get_target(tgt_chembl)
                            if tgt_data:
                                for comp in tgt_data.get("target_components", []):
                                    acc = comp.get("accession")
                                    if acc:
                                        p_props = {
                                            "uniprot_id": acc,
                                            "canonical_id": acc,
                                            "name": comp.get("component_name") or tgt_data.get("pref_name") or acc,
                                            "gene_symbol": comp.get("component_synonym")
                                        }
                                        in_memory_graph.merge_node("Protein", acc, p_props)
                                        target_rel_props = {
                                            "mechanism": m.get("mechanism_of_action"),
                                            "action_type": m.get("action_type", "TARGETS"),
                                            "source": "ChEMBL",
                                            "confidence": 1.0
                                        }
                                        in_memory_graph.merge_edge(
                                            drug_chembl_id,
                                            acc,
                                            "TARGETS",
                                            target_rel_props
                                        )
                                        # Neo4j write for TARGETS
                                        tgt_cypher = """
                                        MERGE (d:Drug {canonical_id: $drug_id})
                                        MERGE (p:Protein {uniprot_id: $acc})
                                        ON CREATE SET p += $p_props, p.canonical_id = $acc
                                        ON MATCH SET p.canonical_id = coalesce(p.canonical_id, $acc), p.name = coalesce(p.name, $p_name), p.gene_symbol = coalesce(p.gene_symbol, $p_sym)
                                        MERGE (d)-[r:TARGETS]->(p)
                                        SET r += $rel_props
                                        """
                                        await Neo4jConnectionManager.execute_write(
                                            tgt_cypher,
                                            {
                                                "drug_id": drug_chembl_id,
                                                "acc": acc,
                                                "p_props": p_props,
                                                "p_name": p_props["name"],
                                                "p_sym": p_props["gene_symbol"],
                                                "rel_props": target_rel_props
                                            }
                                        )
                except Exception as ex:
                    logger.debug("Mechanisms fetch skipped for %s: %s", drug_chembl_id, ex)

        logger.info("Ingested %d target associations for disease %s", ingested_count, disease_id)
        return {"disease_id": disease_id, "targets_ingested": ingested_count}


if __name__ == "__main__":
    asyncio.run(OpenTargetsIngestor.ingest_disease_targets("EFO_0000249", limit=20))
