import logging
from typing import Any, Dict, List, Optional
from app.clients.base import BaseBiomedicalClient
from app.config import settings

logger = logging.getLogger(__name__)


class UniProtClient(BaseBiomedicalClient):
    """
    Client for the UniProt REST API.
    Docs: https://www.uniprot.org/help/api
    """
    def __init__(self):
        super().__init__(base_url=settings.UNIPROT_BASE_URL, rate_limit_delay=0.1)

    async def get_protein_by_accession(self, accession: str) -> Optional[Dict[str, Any]]:
        """Fetch full protein entry by UniProt accession (e.g. P00533, P05067)."""
        try:
            return await self.get(f"{accession}.json")
        except Exception as e:
            logger.warning("UniProt lookup failed for accession '%s': %s", accession, e)
            return None

    async def search_protein_by_gene(self, gene_symbol: str, organism: str = "9606") -> List[Dict[str, Any]]:
        """Search human protein entries by HGNC gene symbol."""
        query = f"gene:{gene_symbol} AND organism_id:{organism} AND reviewed:true"
        try:
            data = await self.get("search", params={"query": query, "format": "json", "size": 5})
            return data.get("results", [])
        except Exception as e:
            logger.warning("UniProt search failed for gene '%s': %s", gene_symbol, e)
            return []

    def extract_protein_summary(self, uniprot_json: Dict[str, Any]) -> Dict[str, Any]:
        """Parses UniProt JSON into standardized protein metadata."""
        if not uniprot_json:
            return {}
        
        accession = uniprot_json.get("primaryAccession", "")
        entry_audit = uniprot_json.get("entryAudit", {})
        
        # Extract protein name
        desc = uniprot_json.get("proteinDescription", {})
        rec_name = desc.get("recommendedName", {}).get("fullName", {}).get("value", "")
        if not rec_name and desc.get("submissionNames"):
            rec_name = desc["submissionNames"][0].get("fullName", {}).get("value", "")

        # Extract Gene Symbol
        genes = uniprot_json.get("genes", [])
        gene_symbol = genes[0].get("geneName", {}).get("value", "") if genes else ""

        # Extract Function Comment
        function_text = ""
        comments = uniprot_json.get("comments", [])
        for c in comments:
            if c.get("commentType") == "FUNCTION":
                texts = c.get("texts", [])
                if texts:
                    function_text = texts[0].get("value", "")
                    break

        # Cross references (Ensembl, HGNC, Reactome)
        ensembl_id = None
        reactome_pathways = []
        for xref in uniprot_json.get("uniProtKBCrossReferences", []):
            db = xref.get("database")
            if db == "Ensembl" and not ensembl_id:
                ensembl_id = xref.get("id")
            elif db == "Reactome":
                reactome_pathways.append(xref.get("properties", [{}])[0].get("value", xref.get("id")))

        return {
            "uniprot_id": accession,
            "name": rec_name or gene_symbol,
            "gene_symbol": gene_symbol,
            "ensembl_id": ensembl_id,
            "function_description": function_text,
            "sequence_length": uniprot_json.get("sequence", {}).get("length"),
            "pathways": reactome_pathways[:10]
        }


uniprot_client = UniProtClient()
