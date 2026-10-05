from fastapi import APIRouter, BackgroundTasks, HTTPException, Depends
from typing import Any, Dict, Optional
from pydantic import BaseModel
from app.auth.security import User
from app.auth.dependencies import require_role
from app.ingestion.bootstrap import bootstrap_biomedical_graph
from app.ingestion.chembl import ChEMBLIngestor
from app.ingestion.opentargets import OpenTargetsIngestor
from app.ingestion.uniprot import UniProtIngestor
from app.ingestion.pubchem import PubChemIngestor
from app.ingestion.clinicaltrials import ClinicalTrialsIngestor
from app.ingestion.pubmed import PubMedIngestor

router = APIRouter(prefix="/ingestion", tags=["Data Ingestion & Admin ETL"])


class IngestionTriggerRequest(BaseModel):
    target_id: Optional[str] = None
    limit: Optional[int] = 20
    extra_param: Optional[str] = None


@router.get("/status")
async def get_ingestion_status(
    admin_user: User = Depends(require_role(["admin"]))
) -> Dict[str, Any]:
    """Retrieve ETL pipeline telemetry and data source sync states (Admin only)."""
    return {
        "status": "operational",
        "authorized_admin": admin_user.email,
        "sources": [
            {"name": "ChEMBL", "status": "synced", "primary_key": "chembl_id", "rate_limit": "20 req/sec"},
            {"name": "Open Targets", "status": "synced", "primary_key": "target_id / disease_id", "rate_limit": "GraphQL"},
            {"name": "UniProtKB", "status": "synced", "primary_key": "uniprot_id", "rate_limit": "REST"},
            {"name": "ClinicalTrials.gov", "status": "synced", "primary_key": "nct_id", "rate_limit": "APIv2"},
            {"name": "PubChem", "status": "synced", "primary_key": "pubchem_cid", "rate_limit": "5 req/sec"},
            {"name": "PubMed", "status": "synced", "primary_key": "pmid", "rate_limit": "NCBI E-Utils"}
        ]
    }


@router.post("/{source}")
async def trigger_ingestion(
    source: str,
    request: Optional[IngestionTriggerRequest] = None,
    background_tasks: BackgroundTasks = BackgroundTasks(),
    admin_user: User = Depends(require_role(["admin"]))
) -> Dict[str, Any]:
    """Trigger real-time ingestion from an official biomedical data source (Admin only)."""
    req = request or IngestionTriggerRequest()
    source_clean = source.lower()

    if source_clean == "bootstrap" or source_clean == "all":
        if background_tasks:
            background_tasks.add_task(bootstrap_biomedical_graph)
            return {"status": "started", "message": "Bootstrap ingestion running in background"}
        else:
            await bootstrap_biomedical_graph()
            return {"status": "completed", "message": "Bootstrap ingestion completed"}

    elif source_clean == "chembl":
        drug_id = req.target_id or "CHEMBL25"
        res = await ChEMBLIngestor.ingest_drug_by_chembl_id(drug_id)
        return {"status": "completed", "source": "ChEMBL", "result": res}

    elif source_clean == "opentargets":
        dis_id = req.target_id or "EFO_0000249"
        res = await OpenTargetsIngestor.ingest_disease_targets(dis_id, limit=req.limit or 20)
        return {"status": "completed", "source": "Open Targets", "result": res}

    elif source_clean == "uniprot":
        prot_id = req.target_id or "P05067"
        res = await UniProtIngestor.ingest_protein(prot_id)
        return {"status": "completed", "source": "UniProt", "result": res}

    elif source_clean == "pubchem":
        name = req.target_id or "Donepezil"
        res = await PubChemIngestor.ingest_compound_by_name(name)
        return {"status": "completed", "source": "PubChem", "result": res}

    elif source_clean == "clinicaltrials":
        drug = req.target_id or "Donepezil"
        cond = req.extra_param or "Alzheimer"
        res = await ClinicalTrialsIngestor.ingest_trials_for_drug_and_condition(drug, cond, limit=req.limit or 5)
        return {"status": "completed", "source": "ClinicalTrials.gov", "count": len(res)}

    elif source_clean == "pubmed":
        drug = req.target_id or "Donepezil"
        dis = req.extra_param or "Alzheimer"
        res = await PubMedIngestor.ingest_literature_for_drug_and_disease(drug, dis, limit=req.limit or 3)
        return {"status": "completed", "source": "PubMed", "count": len(res)}

    else:
        raise HTTPException(status_code=400, detail=f"Unsupported ingestion source: '{source}'. Valid: chembl, opentargets, uniprot, pubchem, clinicaltrials, pubmed, bootstrap.")
