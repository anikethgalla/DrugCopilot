import asyncio
import logging
from typing import Any, Dict, List, Optional
from app.clients.clinicaltrials import clinicaltrials_client
from app.graph.driver import Neo4jConnectionManager
from app.graph.in_memory_graph import in_memory_graph
from app.ingestion.provenance import ProvenanceFactory

logger = logging.getLogger(__name__)


class ClinicalTrialsIngestor:
    """Ingestion pipeline for ClinicalTrials.gov studies, conditions, and interventions."""

    @classmethod
    async def ingest_trials_for_drug_and_condition(
        cls,
        drug_name: str,
        condition: Optional[str] = None,
        drug_canonical_id: Optional[str] = None,
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        """Searches ClinicalTrials.gov and creates ClinicalTrial nodes and INVESTIGATED_IN edges."""
        trials = await clinicaltrials_client.search_trials(
            condition=condition,
            intervention=drug_name,
            page_size=limit
        )

        ingested = []
        for t in trials:
            nct_id = t["nct_id"]
            if not nct_id:
                continue

            prov = ProvenanceFactory.clinical_trials(nct_id)
            trial_props = {
                "canonical_id": nct_id,
                "nct_id": nct_id,
                "title": t["title"],
                "phase": t["phase"],
                "status": t["status"],
                "conditions": t["conditions"],
                "interventions": t["interventions"],
                "sponsors": t["sponsors"],
                "start_date": t.get("start_date"),
                "completion_date": t.get("completion_date"),
                "url": t.get("url"),
                "source": prov.source,
                "source_id": prov.source_id,
                "source_url": prov.source_url,
                "confidence": prov.confidence
            }

            # Store node
            cypher = """
            MERGE (c:ClinicalTrial {nct_id: $nct_id})
            SET c += $props
            RETURN c
            """
            await Neo4jConnectionManager.execute_write(cypher, {"nct_id": nct_id, "props": trial_props})
            in_memory_graph.merge_node("ClinicalTrial", nct_id, trial_props)

            # Link Drug -[:INVESTIGATED_IN]-> ClinicalTrial
            if drug_canonical_id:
                edge_props = {
                    "phase": t["phase"],
                    "status": t["status"],
                    "source": prov.source,
                    "source_id": nct_id,
                    "confidence": 1.0
                }
                cypher_edge = """
                MERGE (d:Drug {canonical_id: $drug_id})
                MERGE (c:ClinicalTrial {nct_id: $nct_id})
                MERGE (d)-[r:INVESTIGATED_IN]->(c)
                SET r += $props
                """
                await Neo4jConnectionManager.execute_write(
                    cypher_edge,
                    {"drug_id": drug_canonical_id, "nct_id": nct_id, "props": edge_props}
                )
                in_memory_graph.merge_edge(drug_canonical_id, nct_id, "INVESTIGATED_IN", edge_props)

            ingested.append(trial_props)

        return ingested


if __name__ == "__main__":
    asyncio.run(ClinicalTrialsIngestor.ingest_trials_for_drug_and_condition("Donepezil", "Alzheimer's Disease", "CHEMBL502"))
