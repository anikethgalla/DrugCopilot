import asyncio
import logging
from typing import Any, Dict, List, Optional
from app.clients.pubmed import pubmed_client
from app.graph.driver import Neo4jConnectionManager
from app.graph.in_memory_graph import in_memory_graph
from app.ingestion.provenance import ProvenanceFactory

logger = logging.getLogger(__name__)


class PubMedIngestor:
    """Ingestion pipeline for PubMed / NCBI publications and co-mention citations."""

    @classmethod
    async def ingest_literature_for_drug_and_disease(
        cls,
        drug_name: str,
        disease_name: str,
        drug_canonical_id: Optional[str] = None,
        disease_canonical_id: Optional[str] = None,
        limit: int = 3
    ) -> List[Dict[str, Any]]:
        """Searches PubMed for co-mentions and creates Publication nodes and MENTIONED_IN edges."""
        pubs = await pubmed_client.search_and_get_details(drug_name, disease_name, limit=limit)
        ingested = []

        for p in pubs:
            pmid = p["pmid"]
            if not pmid:
                continue

            prov = ProvenanceFactory.pubmed(pmid)
            pub_props = {
                "canonical_id": f"PMID:{pmid}",
                "pmid": pmid,
                "title": p["title"],
                "journal": p.get("journal"),
                "publication_year": p.get("publication_year"),
                "authors": p.get("authors", []),
                "doi": p.get("doi"),
                "url": p.get("url"),
                "source": prov.source,
                "source_id": prov.source_id,
                "source_url": prov.source_url,
                "confidence": prov.confidence
            }

            # Store Publication Node
            cypher = """
            MERGE (p:Publication {pmid: $pmid})
            SET p += $props
            RETURN p
            """
            await Neo4jConnectionManager.execute_write(cypher, {"pmid": pmid, "props": pub_props})
            in_memory_graph.merge_node("Publication", f"PMID:{pmid}", pub_props)

            # Link Drug -[:MENTIONED_IN]-> Publication
            if drug_canonical_id:
                in_memory_graph.merge_edge(
                    drug_canonical_id,
                    f"PMID:{pmid}",
                    "MENTIONED_IN",
                    {"source": "PubMed E-utilities", "confidence": 0.9}
                )

            # Link Disease -[:MENTIONED_IN]-> Publication
            if disease_canonical_id:
                in_memory_graph.merge_edge(
                    disease_canonical_id,
                    f"PMID:{pmid}",
                    "MENTIONED_IN",
                    {"source": "PubMed E-utilities", "confidence": 0.9}
                )

            ingested.append(pub_props)

        return ingested


if __name__ == "__main__":
    asyncio.run(PubMedIngestor.ingest_literature_for_drug_and_disease(
        "Donepezil", "Alzheimer", "CHEMBL502", "EFO_0000249"
    ))
