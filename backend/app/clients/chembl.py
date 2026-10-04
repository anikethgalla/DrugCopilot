import logging
from typing import Any, Dict, List, Optional
from app.clients.base import BaseBiomedicalClient
from app.config import settings

logger = logging.getLogger(__name__)


class ChEMBLClient(BaseBiomedicalClient):
    """
    Client for the official ChEMBL REST API.
    Docs: https://www.ebi.ac.uk/chembl/api/data/
    """
    def __init__(self):
        super().__init__(base_url=settings.CHEMBL_BASE_URL, rate_limit_delay=0.15)

    async def get_status(self) -> Dict[str, Any]:
        """Check API status and release information."""
        return await self.get("status.json")

    async def search_molecules(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Search molecules by name or synonym."""
        try:
            data = await self.get(f"molecule/search.json", params={"q": query, "limit": limit})
            return data.get("molecules", [])
        except Exception as e:
            logger.warning("ChEMBL molecule search error for '%s': %s", query, e)
            return []

    async def get_molecule(self, chembl_id: str) -> Optional[Dict[str, Any]]:
        """Get molecule details by ChEMBL ID."""
        try:
            return await self.get(f"molecule/{chembl_id}.json")
        except Exception as e:
            logger.warning("ChEMBL get molecule error for '%s': %s", chembl_id, e)
            return None

    async def get_drug_mechanisms(self, molecule_chembl_id: str) -> List[Dict[str, Any]]:
        """Get mechanism of action and target associations for a drug."""
        try:
            data = await self.get("mechanism.json", params={"molecule_chembl_id": molecule_chembl_id})
            return data.get("mechanisms", [])
        except Exception as e:
            logger.warning("ChEMBL mechanisms error for '%s': %s", molecule_chembl_id, e)
            return []

    async def get_drug_indications(self, molecule_chembl_id: str) -> List[Dict[str, Any]]:
        """Get approved or investigational indications for a drug."""
        try:
            data = await self.get("drug_indication.json", params={"molecule_chembl_id": molecule_chembl_id})
            return data.get("drug_indications", [])
        except Exception as e:
            logger.warning("ChEMBL indications error for '%s': %s", molecule_chembl_id, e)
            return []

    async def get_target(self, target_chembl_id: str) -> Optional[Dict[str, Any]]:
        """Get target details including UniProt accession mapping."""
        try:
            return await self.get(f"target/{target_chembl_id}.json")
        except Exception as e:
            logger.warning("ChEMBL get target error for '%s': %s", target_chembl_id, e)
            return None

    async def search_targets(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Search targets by name or gene symbol."""
        try:
            data = await self.get("target/search.json", params={"q": query, "limit": limit})
            return data.get("targets", [])
        except Exception as e:
            logger.warning("ChEMBL target search error for '%s': %s", query, e)
            return []

    async def get_target_activities(self, target_chembl_id: str, limit: int = 20) -> List[Dict[str, Any]]:
        """Fetch bioactivity measurements (IC50, Ki, Kd, EC50) for a target."""
        try:
            data = await self.get(
                "activity.json",
                params={"target_chembl_id": target_chembl_id, "limit": limit, "standard_type": "IC50"}
            )
            return data.get("activities", [])
        except Exception as e:
            logger.warning("ChEMBL activity error for '%s': %s", target_chembl_id, e)
            return []


chembl_client = ChEMBLClient()
