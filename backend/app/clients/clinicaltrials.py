import logging
from typing import Any, Dict, List, Optional
from app.clients.base import BaseBiomedicalClient
from app.config import settings

logger = logging.getLogger(__name__)


class ClinicalTrialsClient(BaseBiomedicalClient):
    """
    Client for the official ClinicalTrials.gov REST API v2.
    Docs: https://clinicaltrials.gov/data-api/api
    """
    def __init__(self):
        super().__init__(base_url=settings.CLINICALTRIALS_BASE_URL, rate_limit_delay=0.2)

    async def search_trials(
        self,
        condition: Optional[str] = None,
        intervention: Optional[str] = None,
        page_size: int = 10
    ) -> List[Dict[str, Any]]:
        """Search trials by condition and/or drug intervention."""
        params = {
            "pageSize": page_size,
            "fields": "NCTId,BriefTitle,Phase,OverallStatus,Condition,InterventionName,LeadSponsorName,StartDate,CompletionDate"
        }
        if condition:
            params["query.cond"] = condition
        if intervention:
            params["query.intr"] = intervention

        try:
            data = await self.get("", params=params)
            studies = data.get("studies", [])
            return [self._parse_study(s) for s in studies]
        except Exception as e:
            logger.warning("ClinicalTrials.gov search failed for cond='%s', intr='%s': %s", condition, intervention, e)
            return []

    async def get_trial_by_nct_id(self, nct_id: str) -> Optional[Dict[str, Any]]:
        """Fetch full study details for a specific NCT ID."""
        try:
            data = await self.get(nct_id)
            return self._parse_study(data)
        except Exception as e:
            logger.warning("ClinicalTrials.gov fetch failed for '%s': %s", nct_id, e)
            return None

    def _parse_study(self, raw_study: Dict[str, Any]) -> Dict[str, Any]:
        proto = raw_study.get("protocolSection", {})
        ident = proto.get("identificationModule", {})
        status_mod = proto.get("statusModule", {})
        design_mod = proto.get("designModule", {})
        sponsor_mod = proto.get("sponsorCollaboratorsModule", {})
        cond_mod = proto.get("conditionsModule", {})
        arms_mod = proto.get("armsInterventionsModule", {})

        nct_id = ident.get("nctId", "")
        title = ident.get("briefTitle", "")
        overall_status = status_mod.get("overallStatus", "UNKNOWN")
        phases = design_mod.get("phases", ["NA"])
        phase = phases[0] if phases else "NA"
        
        conditions = cond_mod.get("conditions", [])
        interventions = [i.get("name", "") for i in arms_mod.get("interventions", [])]
        sponsors = [sponsor_mod.get("leadSponsor", {}).get("name", "")]

        start_date = status_mod.get("startDateStruct", {}).get("date")
        comp_date = status_mod.get("completionDateStruct", {}).get("date")

        return {
            "nct_id": nct_id,
            "title": title,
            "phase": phase,
            "status": overall_status,
            "conditions": conditions,
            "interventions": interventions,
            "sponsors": sponsors,
            "start_date": start_date,
            "completion_date": comp_date,
            "url": f"https://clinicaltrials.gov/study/{nct_id}" if nct_id else None
        }


clinicaltrials_client = ClinicalTrialsClient()
