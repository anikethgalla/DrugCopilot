import asyncio
import logging
from typing import Any, Dict, List, Optional
from app.clients.chembl import chembl_client
from app.graph.driver import Neo4jConnectionManager
from app.graph.in_memory_graph import in_memory_graph
from app.ingestion.provenance import ProvenanceFactory

logger = logging.getLogger(__name__)


class ChEMBLIngestor:
    """Ingestion pipeline for ChEMBL molecules, mechanisms, and drug-target relationships."""

    @classmethod
    async def ingest_drug_by_chembl_id(cls, chembl_id: str) -> Optional[Dict[str, Any]]:
        """Ingests a single drug and its target mechanisms and indications."""
        mol = await chembl_client.get_molecule(chembl_id)
        if not mol:
            return None

        pref_name = mol.get("pref_name") or chembl_id
        max_phase = mol.get("max_phase")
        mol_struct = mol.get("molecule_structures") or {}
        mol_props = mol.get("molecule_properties") or {}

        drug_props = {
            "canonical_id": chembl_id,
            "chembl_id": chembl_id,
            "name": pref_name,
            "max_clinical_phase": max_phase,
            "is_approved": max_phase == 4,
            "smiles": mol_struct.get("canonical_smiles"),
            "molecular_formula": mol_props.get("full_mwt_freebase"),
            "molecular_weight": float(mol_props.get("full_mwt", 0.0)) if mol_props.get("full_mwt") else None,
            "synonyms": [s.get("molecule_synonym") for s in mol.get("molecule_synonyms", []) if s.get("molecule_synonym")]
        }

        # 1. Store Drug node in Neo4j and InMemory graph
        cypher = """
        MERGE (d:Drug {canonical_id: $canonical_id})
        SET d += $props
        RETURN d
        """
        await Neo4jConnectionManager.execute_write(cypher, {"canonical_id": chembl_id, "props": drug_props})
        in_memory_graph.merge_node("Drug", chembl_id, drug_props)

        # 2. Fetch and ingest drug mechanisms & targets
        mechanisms = await chembl_client.get_drug_mechanisms(chembl_id)
        for m in mechanisms:
            target_chembl_id = m.get("target_chembl_id")
            action_type = m.get("action_type", "TARGETS")
            mech_description = m.get("mechanism_of_action")

            if target_chembl_id:
                target_data = await chembl_client.get_target(target_chembl_id)
                if target_data:
                    target_name = target_data.get("pref_name") or target_chembl_id
                    target_props = {
                        "target_id": target_chembl_id,
                        "canonical_id": target_chembl_id,
                        "pref_name": target_name,
                        "organism": target_data.get("organism", "Homo sapiens")
                    }
                    in_memory_graph.merge_node("Target", target_chembl_id, target_props)

                    # Inspect target components for UniProt accession
                    for comp in target_data.get("target_components", []):
                        accession = comp.get("accession")
                        if accession:
                            prot_props = {
                                "uniprot_id": accession,
                                "canonical_id": accession,
                                "name": comp.get("component_name") or target_name,
                                "gene_symbol": comp.get("component_synonym")
                            }
                            in_memory_graph.merge_node("Protein", accession, prot_props)

                            # Drug -[:TARGETS]-> Protein
                            prov = ProvenanceFactory.chembl(
                                source_id=chembl_id,
                                evidence_type="DIRECT_TARGET_MECHANISM",
                                confidence=1.0,
                                extra={"action_type": action_type, "mechanism": mech_description}
                            )
                            rel_props = {
                                "action_type": action_type,
                                "mechanism": mech_description,
                                "source": prov.source,
                                "source_id": prov.source_id,
                                "source_url": prov.source_url,
                                "confidence": prov.confidence
                            }
                            cypher_rel = """
                            MERGE (d:Drug {canonical_id: $drug_id})
                            MERGE (p:Protein {uniprot_id: $prot_id})
                            MERGE (d)-[r:TARGETS]->(p)
                            SET r += $props
                            """
                            await Neo4jConnectionManager.execute_write(
                                cypher_rel,
                                {"drug_id": chembl_id, "prot_id": accession, "props": rel_props}
                            )
                            in_memory_graph.merge_edge(chembl_id, accession, "TARGETS", rel_props)

        # 3. Fetch indications
        indications = await chembl_client.get_drug_indications(chembl_id)
        for ind in indications:
            mesh_id = ind.get("mesh_id")
            mesh_heading = ind.get("mesh_heading")
            efo_id = ind.get("efo_id")
            ind_phase = ind.get("max_phase_for_ind")

            dis_id = efo_id or mesh_id or f"DISEASE_{mesh_heading}"
            if mesh_heading:
                dis_props = {
                    "canonical_id": dis_id,
                    "name": mesh_heading,
                    "mesh_id": mesh_id,
                    "efo_id": efo_id
                }
                in_memory_graph.merge_node("Disease", dis_id, dis_props)

                prov = ProvenanceFactory.chembl(
                    source_id=chembl_id,
                    evidence_type="APPROVED_INDICATION" if ind_phase == 4 else "CLINICAL_INDICATION",
                    confidence=1.0 if ind_phase == 4 else 0.8
                )
                rel_props = {
                    "phase": ind_phase,
                    "source": prov.source,
                    "source_id": prov.source_id,
                    "source_url": prov.source_url,
                    "confidence": prov.confidence
                }
                cypher_treats = """
                MERGE (d:Drug {canonical_id: $drug_id})
                MERGE (dis:Disease {canonical_id: $dis_id})
                MERGE (d)-[r:TREATS]->(dis)
                SET r += $props
                """
                await Neo4jConnectionManager.execute_write(
                    cypher_treats,
                    {"drug_id": chembl_id, "dis_id": dis_id, "props": rel_props}
                )
                in_memory_graph.merge_edge(chembl_id, dis_id, "TREATS", rel_props)

        return drug_props


if __name__ == "__main__":
    asyncio.run(ChEMBLIngestor.ingest_drug_by_chembl_id("CHEMBL25"))  # Aspirin
