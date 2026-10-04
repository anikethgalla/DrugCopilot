from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class Provenance(BaseModel):
    """Metadata tracking the origin and confidence of any biomedical entity or edge."""
    source: str = Field(..., description="Data provider (e.g. ChEMBL, Open Targets, UniProt, PubChem, ClinicalTrials.gov, PubMed)")
    source_id: str = Field(..., description="Identifier in source database (e.g. CHEMBL25, EFO_0000249, P00533, NCT04245644, PMID:123456)")
    source_url: Optional[str] = Field(None, description="Direct URL to source data")
    retrieved_at: datetime = Field(default_factory=datetime.utcnow, description="Timestamp of data retrieval")
    evidence_type: str = Field(..., description="Type of evidence (e.g. DIRECT_TARGET, GENETIC_ASSOCIATION, CLINICAL_TRIAL, LITERATURE_MINING)")
    confidence: float = Field(default=1.0, ge=0.0, le=1.0, description="Numerical confidence score between 0.0 and 1.0")
    assay_id: Optional[str] = Field(None, description="ChEMBL assay ID if applicable")
    publication_id: Optional[str] = Field(None, description="PubMed ID or DOI if available")
    extra_metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional context from source")


class Drug(BaseModel):
    canonical_id: str = Field(..., description="Canonical ID (e.g. CHEMBL:CHEMBL25 or DRUG:DONEPEZIL)")
    name: str = Field(..., description="Approved drug or chemical name")
    chembl_id: Optional[str] = None
    pubchem_cid: Optional[str] = None
    drugbank_id: Optional[str] = None
    synonyms: List[str] = Field(default_factory=list)
    max_clinical_phase: Optional[int] = Field(None, description="0 to 4 (4 = approved)")
    is_approved: bool = False
    mechanism_of_action: Optional[str] = None
    indication_summary: Optional[str] = None
    smiles: Optional[str] = None
    molecular_formula: Optional[str] = None
    molecular_weight: Optional[float] = None
    provenance: Optional[Provenance] = None
    last_updated: Optional[datetime] = None


class Protein(BaseModel):
    uniprot_id: str = Field(..., description="UniProt accession (e.g. P00533, P05067)")
    name: str = Field(..., description="Full protein name")
    gene_symbol: Optional[str] = None
    organism: str = "Homo sapiens"
    ensembl_id: Optional[str] = None
    hgnc_id: Optional[str] = None
    function_description: Optional[str] = None
    sequence_length: Optional[int] = None
    pathways: List[str] = Field(default_factory=list)
    provenance: Optional[Provenance] = None


class Gene(BaseModel):
    ensembl_id: str = Field(..., description="Ensembl Gene ID (e.g. ENSG00000142192)")
    symbol: str = Field(..., description="HGNC Gene Symbol (e.g. APP, EGFR, APOE)")
    name: Optional[str] = None
    chromosome: Optional[str] = None
    provenance: Optional[Provenance] = None


class Target(BaseModel):
    target_id: str = Field(..., description="Target identifier (e.g. CHEMBL240, ENSG00000142192)")
    target_type: str = Field(default="SINGLE PROTEIN", description="Target type")
    pref_name: str
    organism: str = "Homo sapiens"
    target_components: List[str] = Field(default_factory=list)
    provenance: Optional[Provenance] = None


class Disease(BaseModel):
    canonical_id: str = Field(..., description="Canonical ID (e.g. EFO:EFO_0000249 or MONDO:0004975)")
    name: str = Field(..., description="Disease or condition name (e.g. Alzheimer's disease)")
    efo_id: Optional[str] = None
    mondo_id: Optional[str] = None
    mesh_id: Optional[str] = None
    icd10: Optional[str] = None
    description: Optional[str] = None
    synonyms: List[str] = Field(default_factory=list)
    therapeutic_areas: List[str] = Field(default_factory=list)
    provenance: Optional[Provenance] = None


class Pathway(BaseModel):
    pathway_id: str = Field(..., description="Pathway identifier (e.g. R-HSA-109581 or GO:0007165)")
    name: str
    source_db: str = Field(default="Reactome", description="Reactome, KEGG, or GO")
    url: Optional[str] = None
    provenance: Optional[Provenance] = None


class ClinicalTrial(BaseModel):
    nct_id: str = Field(..., description="NCT identifier (e.g. NCT04245644)")
    title: str
    phase: Optional[str] = None  # PHASE1, PHASE2, PHASE3, PHASE4, NA
    status: Optional[str] = None  # RECRUITING, COMPLETED, ACTIVE_NOT_RECRUITING, etc.
    conditions: List[str] = Field(default_factory=list)
    interventions: List[str] = Field(default_factory=list)
    sponsors: List[str] = Field(default_factory=list)
    start_date: Optional[str] = None
    completion_date: Optional[str] = None
    enrollment: Optional[int] = None
    url: Optional[str] = None
    provenance: Optional[Provenance] = None


class Publication(BaseModel):
    pmid: str = Field(..., description="PubMed ID (e.g. 32014114)")
    title: str
    abstract: Optional[str] = None
    authors: List[str] = Field(default_factory=list)
    journal: Optional[str] = None
    publication_year: Optional[int] = None
    doi: Optional[str] = None
    url: Optional[str] = None
    provenance: Optional[Provenance] = None


class SideEffect(BaseModel):
    meddra_id: Optional[str] = None
    name: str
    severity: Optional[str] = None


class RelationshipEdge(BaseModel):
    source_id: str
    source_label: str
    target_id: str
    target_label: str
    relation_type: str
    provenance: Provenance
    properties: Dict[str, Any] = Field(default_factory=dict)
