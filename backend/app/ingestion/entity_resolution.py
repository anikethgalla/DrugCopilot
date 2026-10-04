import logging
import re
from typing import Any, Dict, List, Optional, Tuple, Set
from app.clients.opentargets import opentargets_client
from app.clients.chembl import chembl_client
from app.clients.uniprot import uniprot_client
from app.graph.driver import Neo4jConnectionManager
from app.graph.in_memory_graph import in_memory_graph

logger = logging.getLogger(__name__)

# Pre-seeded canonical disease mappings for instant resolution
CANONICAL_DISEASE_MAPPINGS: Dict[str, Dict[str, str]] = {
    "alzheimer": {
        "canonical_id": "MONDO_0004975",
        "name": "Alzheimer's disease",
        "efo_id": "EFO_0000249",
        "mondo_id": "MONDO_0004975",
        "mesh_id": "D000544"
    },
    "alzheimer's disease": {
        "canonical_id": "MONDO_0004975",
        "name": "Alzheimer's disease",
        "efo_id": "EFO_0000249",
        "mondo_id": "MONDO_0004975",
        "mesh_id": "D000544"
    },
    "parkinson": {
        "canonical_id": "MONDO_0005180",
        "name": "Parkinson's disease",
        "efo_id": "EFO_0002507",
        "mondo_id": "MONDO_0005180",
        "mesh_id": "D010300"
    },
    "parkinson's disease": {
        "canonical_id": "MONDO_0005180",
        "name": "Parkinson's disease",
        "efo_id": "EFO_0002507",
        "mondo_id": "MONDO_0005180",
        "mesh_id": "D010300"
    },
    "amyotrophic lateral sclerosis": {
        "canonical_id": "MONDO_0004976",
        "name": "Amyotrophic lateral sclerosis",
        "efo_id": "EFO_0000253",
        "mondo_id": "MONDO_0004976",
        "mesh_id": "D000690"
    },
    "als": {
        "canonical_id": "MONDO_0004976",
        "name": "Amyotrophic lateral sclerosis",
        "efo_id": "EFO_0000253",
        "mondo_id": "MONDO_0004976",
        "mesh_id": "D000690"
    },
    "type 2 diabetes": {
        "canonical_id": "MONDO_0005148",
        "name": "type II diabetes mellitus",
        "efo_id": "EFO_0001360",
        "mondo_id": "MONDO_0005148",
        "mesh_id": "D003924"
    },
    "huntington's disease": {
        "canonical_id": "MONDO_0007739",
        "name": "Huntington's disease",
        "efo_id": "EFO_0000534",
        "mondo_id": "MONDO_0007739",
        "mesh_id": "D006816"
    }
}


class EntityResolver:
    """
    Canonical Entity Resolution Service.
    Resolves names, synonyms, and external database IDs into canonical graph identifiers
    to guarantee zero duplicate nodes across multiple ingestions.
    """

    @classmethod
    async def resolve_disease(cls, query: str) -> Optional[Dict[str, str]]:
        """Resolves disease name or ID to canonical metadata."""
        query_clean = query.strip().lower()

        # 1. Direct ID matching (EFO or MONDO)
        if query_clean.startswith("efo_") or query_clean.startswith("efo:") or query_clean.startswith("mondo_") or query_clean.startswith("mondo:"):
            canon_id = query_clean.upper().replace(":", "_")
            return {
                "canonical_id": canon_id,
                "name": query.strip(),
                "efo_id": canon_id if "EFO" in canon_id else None,
                "mondo_id": canon_id if "MONDO" in canon_id else None
            }

        # 2. Local canonical lookup
        for key, val in CANONICAL_DISEASE_MAPPINGS.items():
            if key in query_clean or query_clean in key:
                return val

        # 3. Check Neo4j / InMemory graph
        existing = in_memory_graph.search_nodes(query_clean, label="Disease")
        if existing:
            props = existing[0]["properties"]
            return {
                "canonical_id": props.get("canonical_id", props.get("efo_id")),
                "name": props.get("name", query),
                "efo_id": props.get("efo_id"),
                "mondo_id": props.get("mondo_id")
            }

        # 4. Live query to Open Targets API
        try:
            hits = await opentargets_client.search_diseases(query, limit=1)
            if hits:
                top = hits[0]
                return {
                    "canonical_id": top["id"],
                    "name": top["name"],
                    "efo_id": top["id"] if "EFO" in top["id"] else None,
                    "mondo_id": top["id"] if "MONDO" in top["id"] else None
                }
        except Exception as e:
            logger.warning("Live disease resolution error for '%s': %s", query, e)

        # Fallback to normalized name
        norm_id = f"DISEASE_{re.sub(r'[^a-zA-Z0-9]', '_', query_clean).upper()}"
        return {
            "canonical_id": norm_id,
            "name": query.strip()
        }

    @classmethod
    async def resolve_drug(cls, query: str) -> Optional[Dict[str, Any]]:
        """Resolves drug name or ChEMBL ID to canonical drug entity."""
        query_clean = query.strip()

        # Check if already a ChEMBL ID
        if query_clean.upper().startswith("CHEMBL"):
            chembl_id = query_clean.upper()
            mol = await chembl_client.get_molecule(chembl_id)
            if mol:
                pref_name = mol.get("pref_name") or chembl_id
                return {
                    "canonical_id": chembl_id,
                    "name": pref_name,
                    "chembl_id": chembl_id,
                    "max_clinical_phase": mol.get("max_phase"),
                    "is_approved": mol.get("max_phase") == 4
                }

        # Search ChEMBL
        molecules = await chembl_client.search_molecules(query_clean, limit=1)
        if molecules:
            top = molecules[0]
            chembl_id = top.get("molecule_chembl_id")
            return {
                "canonical_id": chembl_id,
                "name": top.get("pref_name") or query_clean,
                "chembl_id": chembl_id,
                "max_clinical_phase": top.get("max_phase"),
                "is_approved": top.get("max_phase") == 4
            }

        return {
            "canonical_id": f"DRUG_{re.sub(r'[^a-zA-Z0-9]', '_', query_clean.upper())}",
            "name": query_clean,
            "is_approved": False
        }

    @classmethod
    async def resolve_protein(cls, query: str) -> Optional[Dict[str, Any]]:
        """Resolves gene symbol or UniProt ID to canonical protein metadata."""
        query_clean = query.strip().upper()

        if re.match(r"^[OPQ][0-9][A-Z0-9]{3}[0-9]|[A-NR-Z][0-9]([A-Z][A-Z0-9]{2}[0-9]){1,2}$", query_clean):
            # Valid UniProt Accession
            uniprot_data = await uniprot_client.get_protein_by_accession(query_clean)
            if uniprot_data:
                return uniprot_client.extract_protein_summary(uniprot_data)

        # Search by gene symbol
        results = await uniprot_client.search_protein_by_gene(query_clean)
        if results:
            return uniprot_client.extract_protein_summary(results[0])

        return None
