import asyncio
import logging
from typing import Any, Dict, Optional
from app.clients.uniprot import uniprot_client
from app.graph.driver import Neo4jConnectionManager
from app.graph.in_memory_graph import in_memory_graph
from app.ingestion.provenance import ProvenanceFactory

logger = logging.getLogger(__name__)


class UniProtIngestor:
    """Ingestion pipeline for UniProtKB human proteins, functional domains, and pathways."""

    @classmethod
    async def ingest_protein(cls, accession_or_symbol: str) -> Optional[Dict[str, Any]]:
        """Ingests protein data by UniProt accession or gene symbol."""
        summary = None
        if len(accession_or_symbol) in (6, 10) and accession_or_symbol[0].isalpha():
            data = await uniprot_client.get_protein_by_accession(accession_or_symbol)
            if data:
                summary = uniprot_client.extract_protein_summary(data)

        if not summary:
            results = await uniprot_client.search_protein_by_gene(accession_or_symbol)
            if results:
                summary = uniprot_client.extract_protein_summary(results[0])

        if not summary:
            return None

        uniprot_id = summary["uniprot_id"]
        prov = ProvenanceFactory.uniprot(uniprot_id)
        
        prot_props = {
            "canonical_id": uniprot_id,
            "uniprot_id": uniprot_id,
            "name": summary["name"],
            "gene_symbol": summary["gene_symbol"],
            "ensembl_id": summary.get("ensembl_id"),
            "function_description": summary.get("function_description"),
            "sequence_length": summary.get("sequence_length"),
            "source": prov.source,
            "source_id": prov.source_id,
            "source_url": prov.source_url,
            "confidence": prov.confidence
        }

        # Store in Neo4j and in-memory graph
        cypher = """
        MERGE (p:Protein {uniprot_id: $uniprot_id})
        SET p += $props
        RETURN p
        """
        await Neo4jConnectionManager.execute_write(cypher, {"uniprot_id": uniprot_id, "props": prot_props})
        in_memory_graph.merge_node("Protein", uniprot_id, prot_props)

        # Ingest Gene link if available
        if summary.get("gene_symbol"):
            gene_symbol = summary["gene_symbol"]
            gene_id = summary.get("ensembl_id") or f"GENE_{gene_symbol}"
            gene_props = {
                "canonical_id": gene_id,
                "symbol": gene_symbol,
                "ensembl_id": summary.get("ensembl_id") or gene_id
            }
            in_memory_graph.merge_node("Gene", gene_id, gene_props)
            in_memory_graph.merge_edge(gene_id, uniprot_id, "ENCODES", {"source": "UniProt", "confidence": 1.0})
            
            gene_cypher = """
            MERGE (g:Gene {ensembl_id: $ensembl_id})
            ON CREATE SET g.canonical_id = $ensembl_id, g.symbol = $symbol
            ON MATCH SET g.symbol = coalesce(g.symbol, $symbol)
            WITH g
            MERGE (p:Protein {uniprot_id: $uniprot_id})
            MERGE (g)-[r:ENCODES]->(p)
            SET r.source = "UniProt", r.confidence = 1.0
            """
            await Neo4jConnectionManager.execute_write(
                gene_cypher,
                {"ensembl_id": gene_props["ensembl_id"], "symbol": gene_symbol, "uniprot_id": uniprot_id}
            )

        # Ingest Pathways
        for pw_name in summary.get("pathways", []):
            pw_id = f"PATHWAY_{pw_name.replace(' ', '_').upper()}"
            pw_props = {"canonical_id": pw_id, "name": pw_name, "source_db": "Reactome"}
            in_memory_graph.merge_node("Pathway", pw_id, pw_props)
            in_memory_graph.merge_edge(uniprot_id, pw_id, "PARTICIPATES_IN", {"source": "Reactome", "confidence": 1.0})

        return prot_props


if __name__ == "__main__":
    asyncio.run(UniProtIngestor.ingest_protein("P05067"))  # APP (Amyloid precursor protein)
