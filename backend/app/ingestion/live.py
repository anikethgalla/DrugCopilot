import logging
from datetime import datetime, timedelta
from typing import Any, Dict, Optional
from app.ingestion.entity_resolution import EntityResolver
from app.ingestion.opentargets import OpenTargetsIngestor
from app.ingestion.chembl import ChEMBLIngestor
from app.ingestion.uniprot import UniProtIngestor
from app.ingestion.pubchem import PubChemIngestor
from app.ingestion.clinicaltrials import ClinicalTrialsIngestor
from app.ingestion.pubmed import PubMedIngestor
from app.graph.in_memory_graph import in_memory_graph

logger = logging.getLogger(__name__)


class LiveDataSyncService:
    """
    Live Data Layer.
    When a user queries a disease or drug:
    1. Check if the entity is already in Neo4j/in-memory graph.
    2. Check if the data is stale (> 7 days).
    3. If missing or stale, query real live APIs, normalize, and update graph.
    """

    @classmethod
    async def ensure_disease_knowledge(cls, disease_id_or_name: str, force_refresh: bool = False) -> Dict[str, Any]:
        """Ensures complete live biomedical knowledge graph data exists for the given disease."""
        # 1. Resolve canonical ID
        disease_meta = await EntityResolver.resolve_disease(disease_id_or_name)
        if not disease_meta:
            raise ValueError(f"Could not resolve canonical disease for query: {disease_id_or_name}")

        canonical_id = disease_meta["canonical_id"]
        disease_name = disease_meta.get("name", disease_id_or_name)

        # 2. Check existing knowledge
        existing_node = in_memory_graph.get_node(canonical_id)
        assoc_targets = in_memory_graph.get_neighbors(canonical_id, rel_type="ASSOCIATED_WITH", direction="in")
        is_stale = False
        if existing_node:
            last_updated = existing_node["properties"].get("last_updated")
            if last_updated:
                try:
                    dt = datetime.fromisoformat(last_updated)
                    if datetime.utcnow() - dt > timedelta(days=7):
                        is_stale = True
                except Exception:
                    pass

        if not existing_node or is_stale or force_refresh or len(assoc_targets) < 2:
            logger.info("Syncing live biomedical data for disease: %s (%s)", disease_name, canonical_id)
            # Ingest disease node
            props = {
                "canonical_id": canonical_id,
                "name": disease_name,
                "efo_id": disease_meta.get("efo_id"),
                "mondo_id": disease_meta.get("mondo_id"),
                "mesh_id": disease_meta.get("mesh_id"),
                "last_updated": datetime.utcnow().isoformat(),
                "last_verified": datetime.utcnow().isoformat(),
                "source_version": "Live API Stream"
            }
            in_memory_graph.merge_node("Disease", canonical_id, props)
            if disease_meta.get("mondo_id") and disease_meta.get("mondo_id") != canonical_id:
                in_memory_graph.merge_node("Disease", disease_meta["mondo_id"], props)

            # Fetch associated targets and known drugs from Open Targets
            ot_query_id = disease_meta.get("mondo_id") or disease_meta.get("efo_id") or canonical_id
            await OpenTargetsIngestor.ingest_disease_targets(ot_query_id, limit=25)
            # Also ensure canonical_id is linked
            if ot_query_id != canonical_id:
                await OpenTargetsIngestor.ingest_disease_targets(canonical_id, limit=25)

        return in_memory_graph.get_node(canonical_id)["properties"]

    @classmethod
    async def ensure_drug_knowledge(cls, drug_name_or_id: str, force_refresh: bool = False) -> Optional[Dict[str, Any]]:
        """Ensures drug entity, targets, chemistry, and indications are populated from live APIs."""
        drug_meta = await EntityResolver.resolve_drug(drug_name_or_id)
        if not drug_meta:
            return None

        canonical_id = drug_meta["canonical_id"]
        drug_name = drug_meta.get("name", drug_name_or_id)

        existing_node = in_memory_graph.get_node(canonical_id)
        if not existing_node or force_refresh:
            logger.info("Syncing live biomedical data for drug: %s (%s)", drug_name, canonical_id)
            if canonical_id.startswith("CHEMBL"):
                await ChEMBLIngestor.ingest_drug_by_chembl_id(canonical_id)
            
            # Enrich chemical structure from PubChem
            await PubChemIngestor.ingest_compound_by_name(drug_name, drug_canonical_id=canonical_id)

        return in_memory_graph.get_node(canonical_id)["properties"] if in_memory_graph.get_node(canonical_id) else drug_meta
