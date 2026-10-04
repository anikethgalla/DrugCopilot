import json
import logging
from typing import Any, Dict, List, Optional
from app.graph.driver import Neo4jConnectionManager
from app.graph.in_memory_graph import in_memory_graph
from app.repurposing.engine import repurposing_engine
from app.models.repurposing import RepurposingRequest
from app.ingestion.entity_resolution import EntityResolver
from app.ingestion.live import LiveDataSyncService
from app.clients.clinicaltrials import clinicaltrials_client
from app.clients.pubmed import pubmed_client
from app.agent.security import CypherSecurityEnforcer

logger = logging.getLogger(__name__)


class CopilotTools:
    """Implementation of controlled biomedical agent tools."""

    @staticmethod
    async def search_graph(query: str, label: Optional[str] = None) -> List[Dict[str, Any]]:
        """Search entities in the biomedical knowledge graph by name, symbol, or ID."""
        return in_memory_graph.search_nodes(query, label=label)[:10]

    @staticmethod
    async def get_drug(drug_id_or_name: str) -> Dict[str, Any]:
        """Fetch complete drug profile including mechanisms, targets, approved indications, and trials."""
        drug_meta = await LiveDataSyncService.ensure_drug_knowledge(drug_id_or_name)
        if not drug_meta:
            return {"error": f"Drug '{drug_id_or_name}' not found."}
        
        canonical_id = drug_meta["canonical_id"]
        targets = in_memory_graph.get_neighbors(canonical_id, rel_type="TARGETS", direction="out")
        indications = in_memory_graph.get_neighbors(canonical_id, rel_type="TREATS", direction="out")
        trials = in_memory_graph.get_neighbors(canonical_id, rel_type="INVESTIGATED_IN", direction="out")
        pubs = in_memory_graph.get_neighbors(canonical_id, rel_type="MENTIONED_IN", direction="out")

        return {
            "drug": drug_meta,
            "targets": [t["node"]["properties"] for t in targets],
            "indications": [i["node"]["properties"] for i in indications],
            "clinical_trials": [ct["node"]["properties"] for ct in trials],
            "publications": [p["node"]["properties"] for p in pubs]
        }

    @staticmethod
    async def get_disease(disease_id_or_name: str) -> Dict[str, Any]:
        """Fetch disease profile with associated genes, proteins, pathways, and known drugs."""
        disease_meta = await LiveDataSyncService.ensure_disease_knowledge(disease_id_or_name)
        canonical_id = disease_meta["canonical_id"]
        
        assoc_genes = in_memory_graph.get_neighbors(canonical_id, rel_type="ASSOCIATED_WITH", direction="in")
        pathways = in_memory_graph.get_neighbors(canonical_id, rel_type="INVOLVES", direction="out")
        known_drugs = in_memory_graph.get_neighbors(canonical_id, rel_type="TREATS", direction="in")

        return {
            "disease": disease_meta,
            "associated_genes": [g["node"]["properties"] for g in assoc_genes[:15]],
            "pathways": [pw["node"]["properties"] for pw in pathways[:10]],
            "known_drugs": [kd["node"]["properties"] for kd in known_drugs[:10]]
        }

    @staticmethod
    async def get_target(target_id_or_symbol: str) -> Dict[str, Any]:
        """Fetch target protein biology, functions, and targeting drugs."""
        prot_meta = await EntityResolver.resolve_protein(target_id_or_symbol)
        if not prot_meta:
            return {"error": f"Target protein '{target_id_or_symbol}' not found."}
        
        uniprot_id = prot_meta["uniprot_id"]
        targeting_drugs = in_memory_graph.get_neighbors(uniprot_id, rel_type="TARGETS", direction="in")
        
        return {
            "protein": prot_meta,
            "targeting_drugs": [td["node"]["properties"] for td in targeting_drugs]
        }

    @staticmethod
    async def find_candidate_drugs(
        disease_id_or_name: str,
        max_candidates: int = 5,
        approved_only: bool = False
    ) -> Dict[str, Any]:
        """Run graph repurposing engine to find candidate drugs for a disease."""
        req = RepurposingRequest(
            disease_id_or_name=disease_id_or_name,
            max_candidates=max_candidates,
            approved_only=approved_only
        )
        res = await repurposing_engine.find_candidates(req)
        return res.dict()

    @staticmethod
    async def find_pathways(disease_id_or_name: str) -> List[Dict[str, Any]]:
        """Get biological pathways implicated in a disease."""
        disease_meta = await LiveDataSyncService.ensure_disease_knowledge(disease_id_or_name)
        canonical_id = disease_meta["canonical_id"]
        pathways = in_memory_graph.get_neighbors(canonical_id, rel_type="INVOLVES", direction="out")
        return [p["node"]["properties"] for p in pathways]

    @staticmethod
    async def find_mechanism(drug_name: str, disease_name: str) -> Dict[str, Any]:
        """Trace biological mechanism path connecting a drug to a disease."""
        req = RepurposingRequest(disease_id_or_name=disease_name, max_candidates=50)
        res = await repurposing_engine.find_candidates(req)
        for cand in res.candidates:
            if cand.drug.name.lower() == drug_name.lower() or cand.drug.canonical_id.lower() == drug_name.lower():
                return cand.dict()
        return {"message": f"No direct high-confidence mechanism path found connecting {drug_name} and {disease_name} in current graph."}

    @staticmethod
    async def find_trials(drug_name: str, condition: Optional[str] = None) -> List[Dict[str, Any]]:
        """Query ClinicalTrials.gov for real clinical trials."""
        return await clinicaltrials_client.search_trials(condition=condition, intervention=drug_name, page_size=5)

    @staticmethod
    async def search_publications(drug_name: str, disease_name: str) -> List[Dict[str, Any]]:
        """Search PubMed for scientific papers co-mentioning drug and disease."""
        return await pubmed_client.search_and_get_details(drug_name, disease_name, limit=5)

    @staticmethod
    async def get_evidence(drug_id: str, disease_id: str) -> Dict[str, Any]:
        """Fetch all multi-modal evidence items for a drug-disease pair."""
        return await CopilotTools.find_mechanism(drug_id, disease_id)

    @staticmethod
    async def refresh_entity(entity_type: str, entity_id: str) -> Dict[str, Any]:
        """Force refresh entity from upstream biomedical APIs into Neo4j."""
        if entity_type.lower() == "disease":
            res = await LiveDataSyncService.ensure_disease_knowledge(entity_id, force_refresh=True)
            return {"status": "refreshed", "entity": res}
        elif entity_type.lower() == "drug":
            res = await LiveDataSyncService.ensure_drug_knowledge(entity_id, force_refresh=True)
            return {"status": "refreshed", "entity": res}
        return {"error": f"Unsupported entity type: {entity_type}"}

    @staticmethod
    async def run_readonly_cypher(cypher_query: str, parameters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Execute a secure, parameterized read-only Cypher query."""
        is_safe, msg = CypherSecurityEnforcer.validate_read_only(cypher_query)
        if not is_safe:
            return {"error": f"Security violation: {msg}"}
        
        try:
            records = await Neo4jConnectionManager.execute_query(cypher_query, parameters or {})
            return {"records": records, "count": len(records)}
        except Exception as e:
            return {"error": str(e)}


TOOL_DEFINITIONS = [
    {
        "type": "function",
        "function": {
            "name": "find_candidate_drugs",
            "description": "Find potential drug repurposing candidates for a given disease using graph traversal and multi-modal scoring.",
            "parameters": {
                "type": "object",
                "properties": {
                    "disease_id_or_name": {"type": "string", "description": "Disease name or canonical ID (e.g. Alzheimer's disease, Parkinson's disease)"},
                    "max_candidates": {"type": "integer", "description": "Maximum candidates to return (default 5)"},
                    "approved_only": {"type": "boolean", "description": "Only return FDA/EMA approved drugs"}
                },
                "required": ["disease_id_or_name"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_drug",
            "description": "Retrieve comprehensive drug profile, mechanisms of action, molecular structure, targets, and approved indications.",
            "parameters": {
                "type": "object",
                "properties": {
                    "drug_id_or_name": {"type": "string", "description": "Drug name or ChEMBL ID (e.g. Donepezil, CHEMBL502)"}
                },
                "required": ["drug_id_or_name"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_disease",
            "description": "Retrieve disease profile, associated target genes, biological pathways, and known therapies.",
            "parameters": {
                "type": "object",
                "properties": {
                    "disease_id_or_name": {"type": "string", "description": "Disease name or EFO ID"}
                },
                "required": ["disease_id_or_name"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "find_mechanism",
            "description": "Explain the biological mechanism connecting a specific drug and disease.",
            "parameters": {
                "type": "object",
                "properties": {
                    "drug_name": {"type": "string"},
                    "disease_name": {"type": "string"}
                },
                "required": ["drug_name", "disease_name"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "find_trials",
            "description": "Search ClinicalTrials.gov for clinical trials involving a drug and condition.",
            "parameters": {
                "type": "object",
                "properties": {
                    "drug_name": {"type": "string"},
                    "condition": {"type": "string"}
                },
                "required": ["drug_name"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "search_publications",
            "description": "Search PubMed for scientific papers co-mentioning a drug and disease.",
            "parameters": {
                "type": "object",
                "properties": {
                    "drug_name": {"type": "string"},
                    "disease_name": {"type": "string"}
                },
                "required": ["drug_name", "disease_name"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "run_readonly_cypher",
            "description": "Execute a custom read-only Cypher query against the biomedical knowledge graph.",
            "parameters": {
                "type": "object",
                "properties": {
                    "cypher_query": {"type": "string", "description": "Read-only parameterized Cypher query"}
                },
                "required": ["cypher_query"]
            }
        }
    }
]
