import asyncio
import logging
from typing import Any, Dict, Optional
from app.clients.pubchem import pubchem_client
from app.graph.driver import Neo4jConnectionManager
from app.graph.in_memory_graph import in_memory_graph
from app.ingestion.provenance import ProvenanceFactory

logger = logging.getLogger(__name__)


class PubChemIngestor:
    """Ingestion pipeline for PubChem chemical structures, molecular weights, and CIDs."""

    @classmethod
    async def ingest_compound_by_name(cls, name: str, drug_canonical_id: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Fetches PubChem compound properties and associates with Drug node."""
        props = await pubchem_client.get_compound_by_name(name)
        if not props:
            return None

        cid = str(props.get("CID"))
        smiles = props.get("CanonicalSMILES") or props.get("IsomericSMILES")
        formula = props.get("MolecularFormula")
        weight = float(props.get("MolecularWeight", 0.0)) if props.get("MolecularWeight") else None
        iupac = props.get("IUPACName")

        prov = ProvenanceFactory.pubchem(cid=cid)

        compound_props = {
            "canonical_id": f"PUBCHEM:{cid}",
            "pubchem_cid": cid,
            "name": name,
            "smiles": smiles,
            "molecular_formula": formula,
            "molecular_weight": weight,
            "iupac_name": iupac,
            "source": prov.source,
            "source_id": prov.source_id,
            "source_url": prov.source_url,
            "confidence": prov.confidence
        }

        # Store Compound node
        in_memory_graph.merge_node("Compound", f"PUBCHEM:{cid}", compound_props)

        # Link Drug -[:HAS_COMPOUND]-> Compound
        if drug_canonical_id:
            in_memory_graph.merge_edge(
                drug_canonical_id,
                f"PUBCHEM:{cid}",
                "HAS_COMPOUND",
                {"source": "PubChem PUG REST", "confidence": 1.0}
            )

            # Also enrich the Drug node with SMILES & weight
            drug_node = in_memory_graph.get_node(drug_canonical_id)
            if drug_node:
                drug_node["properties"]["pubchem_cid"] = cid
                if not drug_node["properties"].get("smiles"):
                    drug_node["properties"]["smiles"] = smiles
                if not drug_node["properties"].get("molecular_formula"):
                    drug_node["properties"]["molecular_formula"] = formula
                if not drug_node["properties"].get("molecular_weight"):
                    drug_node["properties"]["molecular_weight"] = weight

        return compound_props


if __name__ == "__main__":
    asyncio.run(PubChemIngestor.ingest_compound_by_name("Donepezil", drug_canonical_id="CHEMBL502"))
