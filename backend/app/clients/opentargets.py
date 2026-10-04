import logging
from typing import Any, Dict, List, Optional
from app.clients.base import BaseBiomedicalClient
from app.config import settings

logger = logging.getLogger(__name__)


class OpenTargetsClient(BaseBiomedicalClient):
    """
    Client for Open Targets Platform GraphQL API.
    Docs: https://platform-docs.opentargets.org/
    """
    def __init__(self):
        super().__init__(base_url=settings.OPENTARGETS_GRAPHQL_URL, rate_limit_delay=0.1)

    async def search_diseases(self, query_string: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Search disease entities by name to resolve canonical EFO / MONDO IDs."""
        query = """
        query searchDisease($queryString: String!) {
          search(queryString: $queryString, entityNames: ["disease"], page: {index: 0, size: 5}) {
            total
            hits {
              id
              name
              description
              entity
            }
          }
        }
        """
        try:
            res = await self.post("", json_data={"query": query, "variables": {"queryString": query_string}})
            hits = res.get("data", {}).get("search", {}).get("hits", [])
            return hits[:limit]
        except Exception as e:
            logger.warning("Open Targets disease search failed for '%s': %s", query_string, e)
            return []

    async def get_associated_targets(self, disease_id: str, limit: int = 25) -> List[Dict[str, Any]]:
        """Get ranked target genes associated with a disease (including score & genetics)."""
        query = """
        query associatedTargets($efoId: String!) {
          disease(efoId: $efoId) {
            id
            name
            associatedTargets(page: {size: 25, index: 0}) {
              count
              rows {
                score
                datatypeScores {
                  id
                  score
                }
                target {
                  id
                  approvedSymbol
                  approvedName
                  proteinIds {
                    id
                    source
                  }
                  pathways {
                    pathwayId
                    pathway
                  }
                }
              }
            }
          }
        }
        """
        try:
            res = await self.post("", json_data={"query": query, "variables": {"efoId": disease_id}})
            disease_data = res.get("data", {}).get("disease")
            if not disease_data:
                # If EFO ID didn't match, attempt search resolution
                search_hits = await self.search_diseases(disease_id.replace("_", " "), limit=1)
                if search_hits:
                    alt_id = search_hits[0]["id"]
                    res = await self.post("", json_data={"query": query, "variables": {"efoId": alt_id}})
                    disease_data = res.get("data", {}).get("disease")
            
            if not disease_data:
                return []
            return disease_data.get("associatedTargets", {}).get("rows", [])[:limit]
        except Exception as e:
            logger.warning("Open Targets associated targets failed for '%s': %s", disease_id, e)
            return []

    async def get_disease_drugs(self, disease_id: str, limit: int = 25) -> List[Dict[str, Any]]:
        """Find approved and investigational drugs linked to disease in Open Targets."""
        query = """
        query getDiseaseDrugs($efoId: String!) {
          disease(efoId: $efoId) {
            id
            name
            drugAndClinicalCandidates {
              count
              rows {
                maxClinicalStage
                drug {
                  id
                  name
                  drugType
                  maximumClinicalStage
                }
              }
            }
          }
        }
        """
        try:
            res = await self.post("", json_data={"query": query, "variables": {"efoId": disease_id}})
            data_obj = res.get("data") or {}
            disease_obj = data_obj.get("disease")
            if not disease_obj:
                search_hits = await self.search_diseases(disease_id.replace("_", " "), limit=1)
                if search_hits:
                    alt_id = search_hits[0]["id"]
                    res = await self.post("", json_data={"query": query, "variables": {"efoId": alt_id}})
                    data_obj = res.get("data") or {}
                    disease_obj = data_obj.get("disease")

            if not disease_obj:
                return []
            drugs_obj = disease_obj.get("drugAndClinicalCandidates") or {}
            rows = drugs_obj.get("rows") or []
            return rows[:limit]
        except Exception as e:
            logger.warning("Open Targets disease drugs failed for '%s': %s", disease_id, e)
            return []

    async def get_target_details(self, ensembl_id: str) -> Optional[Dict[str, Any]]:
        """Fetch detailed target biology, tractability, and pathways."""
        query = """
        query targetDetails($ensemblId: String!) {
          target(ensemblId: $ensemblId) {
            id
            approvedSymbol
            approvedName
            proteinIds {
              id
              source
            }
            pathways {
              id
              name
            }
            subcellularLocations {
              location
              source
            }
          }
        }
        """
        try:
            res = await self.post("", json_data={"query": query, "variables": {"ensemblId": ensembl_id}})
            return res.get("data", {}).get("target")
        except Exception as e:
            logger.warning("Open Targets target details failed for '%s': %s", ensembl_id, e)
            return None


opentargets_client = OpenTargetsClient()
