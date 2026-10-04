import logging
from typing import Any, Dict, List, Optional
from app.clients.base import BaseBiomedicalClient
from app.config import settings

logger = logging.getLogger(__name__)


class PubMedClient(BaseBiomedicalClient):
    """
    Client for NCBI PubMed E-utilities.
    Docs: https://www.ncbi.nlm.nih.gov/books/NBK25501/
    """
    def __init__(self):
        super().__init__(base_url="https://eutils.ncbi.nlm.nih.gov/entrez/eutils", rate_limit_delay=0.33)

    async def search_publications(self, query: str, retmax: int = 5) -> List[str]:
        """Search PubMed using esearch and return PMIDs."""
        params = {
            "db": "pubmed",
            "term": query,
            "retmode": "json",
            "retmax": retmax,
            "sort": "pub_date"
        }
        if settings.NCBI_API_KEY:
            params["api_key"] = settings.NCBI_API_KEY
        if settings.PUBMED_EMAIL:
            params["email"] = settings.PUBMED_EMAIL

        try:
            data = await self.get("esearch.fcgi", params=params)
            id_list = data.get("esearchresult", {}).get("idlist", [])
            return id_list
        except Exception as e:
            logger.warning("PubMed search failed for query '%s': %s", query, e)
            return []

    async def get_publication_summaries(self, pmids: List[str]) -> List[Dict[str, Any]]:
        """Fetch summary records for given PMIDs using esummary."""
        if not pmids:
            return []
        
        params = {
            "db": "pubmed",
            "id": ",".join(pmids),
            "retmode": "json"
        }
        if settings.NCBI_API_KEY:
            params["api_key"] = settings.NCBI_API_KEY
        if settings.PUBMED_EMAIL:
            params["email"] = settings.PUBMED_EMAIL

        try:
            data = await self.get("esummary.fcgi", params=params)
            result = data.get("result", {})
            uids = result.get("uids", [])
            
            pubs = []
            for uid in uids:
                doc = result.get(uid, {})
                title = doc.get("title", "")
                authors = [a.get("name", "") for a in doc.get("authors", [])]
                source = doc.get("source", "")
                pubdate = doc.get("pubdate", "")
                article_ids = doc.get("articleids", [])
                doi = None
                for aid in article_ids:
                    if aid.get("idtype") == "doi":
                        doi = aid.get("value")
                        break

                pubs.append({
                    "pmid": uid,
                    "title": title,
                    "authors": authors[:5],
                    "journal": source,
                    "publication_year": int(pubdate[:4]) if pubdate[:4].isdigit() else None,
                    "doi": doi,
                    "url": f"https://pubmed.ncbi.nlm.nih.gov/{uid}/"
                })
            return pubs
        except Exception as e:
            logger.warning("PubMed summary failed for PMIDs '%s': %s", pmids, e)
            return []

    async def search_and_get_details(self, drug_name: str, disease_or_target: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Find co-mention literature between a drug and a disease or target."""
        query = f'("{drug_name}"[Title/Abstract]) AND ("{disease_or_target}"[Title/Abstract])'
        pmids = await self.search_publications(query, retmax=limit)
        return await self.get_publication_summaries(pmids)


pubmed_client = PubMedClient()
