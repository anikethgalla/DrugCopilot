import logging
from typing import Any, Dict, List, Optional
from app.clients.base import BaseBiomedicalClient
from app.config import settings

logger = logging.getLogger(__name__)


class PubChemClient(BaseBiomedicalClient):
    """
    Client for the NCBI PubChem PUG REST API.
    Docs: https://pubchem.ncbi.nlm.nih.gov/docs/pug-rest
    """
    def __init__(self):
        super().__init__(base_url=settings.PUBCHEM_BASE_URL, rate_limit_delay=0.2)

    async def get_compound_by_name(self, name: str) -> Optional[Dict[str, Any]]:
        """Fetch compound properties (CID, formula, weight, SMILES, IUPAC name) by name."""
        try:
            properties = "MolecularFormula,MolecularWeight,CanonicalSMILES,IsomericSMILES,IUPACName"
            url = f"compound/name/{name}/property/{properties}/JSON"
            data = await self.get(url)
            props = data.get("PropertyTable", {}).get("Properties", [])
            return props[0] if props else None
        except Exception as e:
            logger.warning("PubChem compound search failed for '%s': %s", name, e)
            return None

    async def get_compound_by_cid(self, cid: int | str) -> Optional[Dict[str, Any]]:
        """Fetch compound properties by CID."""
        try:
            properties = "MolecularFormula,MolecularWeight,CanonicalSMILES,IsomericSMILES,IUPACName"
            url = f"compound/cid/{cid}/property/{properties}/JSON"
            data = await self.get(url)
            props = data.get("PropertyTable", {}).get("Properties", [])
            return props[0] if props else None
        except Exception as e:
            logger.warning("PubChem CID lookup failed for '%s': %s", cid, e)
            return None

    async def get_synonyms(self, cid: int | str) -> List[str]:
        """Fetch synonyms for a given PubChem CID."""
        try:
            url = f"compound/cid/{cid}/synonyms/JSON"
            data = await self.get(url)
            syn_info = data.get("InformationList", {}).get("Information", [])
            return syn_info[0].get("Synonym", []) if syn_info else []
        except Exception as e:
            logger.warning("PubChem synonyms failed for CID '%s': %s", cid, e)
            return []


pubchem_client = PubChemClient()
