from datetime import datetime
from typing import Any, Dict, Optional
from app.models.entities import Provenance


class ProvenanceFactory:
    """Helper to generate consistent, verified provenance metadata for all entities and relationships."""

    @staticmethod
    def chembl(
        source_id: str,
        evidence_type: str = "DIRECT_TARGET_AFFINITY",
        confidence: float = 1.0,
        assay_id: Optional[str] = None,
        publication_id: Optional[str] = None,
        extra: Optional[Dict[str, Any]] = None
    ) -> Provenance:
        return Provenance(
            source="ChEMBL",
            source_id=source_id,
            source_url=f"https://www.ebi.ac.uk/chembl/compound_report_card/{source_id}/" if "CHEMBL" in source_id else "https://www.ebi.ac.uk/chembl/",
            retrieved_at=datetime.utcnow(),
            evidence_type=evidence_type,
            confidence=confidence,
            assay_id=assay_id,
            publication_id=publication_id,
            extra_metadata=extra or {}
        )

    @staticmethod
    def open_targets(
        source_id: str,
        evidence_type: str = "GENETIC_TARGET_ASSOCIATION",
        confidence: float = 1.0,
        extra: Optional[Dict[str, Any]] = None
    ) -> Provenance:
        return Provenance(
            source="Open Targets Platform",
            source_id=source_id,
            source_url=f"https://platform.opentargets.org/disease/{source_id}" if "EFO" in source_id or "MONDO" in source_id else f"https://platform.opentargets.org/target/{source_id}",
            retrieved_at=datetime.utcnow(),
            evidence_type=evidence_type,
            confidence=confidence,
            extra_metadata=extra or {}
        )

    @staticmethod
    def uniprot(
        uniprot_id: str,
        evidence_type: str = "MANUALLY_CURATED_PROTEIN_ENTRY",
        confidence: float = 1.0,
        extra: Optional[Dict[str, Any]] = None
    ) -> Provenance:
        return Provenance(
            source="UniProtKB",
            source_id=uniprot_id,
            source_url=f"https://www.uniprot.org/uniprotkb/{uniprot_id}/entry",
            retrieved_at=datetime.utcnow(),
            evidence_type=evidence_type,
            confidence=confidence,
            extra_metadata=extra or {}
        )

    @staticmethod
    def pubchem(
        cid: int | str,
        evidence_type: str = "CHEMICAL_STRUCTURE_RECORD",
        confidence: float = 1.0,
        extra: Optional[Dict[str, Any]] = None
    ) -> Provenance:
        return Provenance(
            source="PubChem",
            source_id=str(cid),
            source_url=f"https://pubchem.ncbi.nlm.nih.gov/compound/{cid}",
            retrieved_at=datetime.utcnow(),
            evidence_type=evidence_type,
            confidence=confidence,
            extra_metadata=extra or {}
        )

    @staticmethod
    def clinical_trials(
        nct_id: str,
        evidence_type: str = "CLINICAL_INTERVENTION_STUDY",
        confidence: float = 1.0,
        extra: Optional[Dict[str, Any]] = None
    ) -> Provenance:
        return Provenance(
            source="ClinicalTrials.gov",
            source_id=nct_id,
            source_url=f"https://clinicaltrials.gov/study/{nct_id}",
            retrieved_at=datetime.utcnow(),
            evidence_type=evidence_type,
            confidence=confidence,
            extra_metadata=extra or {}
        )

    @staticmethod
    def pubmed(
        pmid: str,
        evidence_type: str = "SCIENTIFIC_LITERATURE_CITATION",
        confidence: float = 0.9,
        extra: Optional[Dict[str, Any]] = None
    ) -> Provenance:
        return Provenance(
            source="PubMed / NCBI",
            source_id=str(pmid),
            source_url=f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/",
            retrieved_at=datetime.utcnow(),
            evidence_type=evidence_type,
            confidence=confidence,
            extra_metadata=extra or {}
        )
