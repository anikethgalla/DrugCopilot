import asyncio
import logging
import sys
from app.graph.schema import init_schema
from app.ingestion.opentargets import OpenTargetsIngestor
from app.ingestion.chembl import ChEMBLIngestor
from app.ingestion.uniprot import UniProtIngestor
from app.ingestion.pubchem import PubChemIngestor
from app.ingestion.clinicaltrials import ClinicalTrialsIngestor
from app.ingestion.pubmed import PubMedIngestor

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("bootstrap")

# Key real biomedical entities for foundational bootstrap
CORE_DISEASES = [
    ("MONDO_0004975", "Alzheimer's disease"),
    ("MONDO_0005180", "Parkinson's disease"),
    ("MONDO_0004976", "Amyotrophic lateral sclerosis"),
    ("MONDO_0005148", "Type 2 diabetes mellitus"),
]

CORE_DRUGS = [
    ("CHEMBL502", "Donepezil"),
    ("CHEMBL651", "Memantine"),
    ("CHEMBL1456", "Rivastigmine"),
    ("CHEMBL1431", "Galantamine"),
    ("CHEMBL1434", "Metformin"),
    ("CHEMBL411", "Rapamycin"),
    ("CHEMBL684", "Riluzole"),
    ("CHEMBL25", "Aspirin"),
    ("CHEMBL1201585", "Lithium carbonate"),
]

CORE_PROTEINS = [
    ("P05067", "APP"),
    ("P49841", "GSK3B"),
    ("P10636", "MAPT"),
    ("P02649", "APOE"),
    ("P22303", "ACHE"),
    ("Q99497", "PARK7"),
    ("Q9Y6K8", "LRRK2"),
    ("P37840", "SNCA"),
]


async def bootstrap_biomedical_graph():
    """Bootstraps the Neo4j biomedical knowledge graph with foundational real-world data."""
    logger.info("==================================================================")
    logger.info("Starting Drug Repurposing Copilot Biomedical Knowledge Bootstrap")
    logger.info("Data Sources: ChEMBL, Open Targets, UniProt, PubChem, ClinicalTrials.gov, PubMed")
    logger.info("==================================================================")

    # 1. Initialize schema constraints and indexes
    await init_schema()

    # 2. Ingest foundational diseases and genetic targets
    logger.info("--- Phase 1: Ingesting Core Diseases & Associated Targets (Open Targets) ---")
    for efo_id, name in CORE_DISEASES:
        logger.info("Ingesting disease: %s (%s)", name, efo_id)
        try:
            await OpenTargetsIngestor.ingest_disease_targets(efo_id, limit=20)
        except Exception as e:
            logger.warning("Failed ingesting %s from Open Targets: %s", name, e)

    # 3. Ingest core proteins from UniProt
    logger.info("--- Phase 2: Ingesting Core Proteins & Functions (UniProt) ---")
    for accession, symbol in CORE_PROTEINS:
        logger.info("Ingesting protein: %s (%s)", symbol, accession)
        try:
            await UniProtIngestor.ingest_protein(accession)
        except Exception as e:
            logger.warning("Failed ingesting protein %s: %s", accession, e)

    # 4. Ingest foundational drugs and mechanisms from ChEMBL & PubChem
    logger.info("--- Phase 3: Ingesting Core Drugs, Targets & Chemistry (ChEMBL & PubChem) ---")
    for chembl_id, name in CORE_DRUGS:
        logger.info("Ingesting drug: %s (%s)", name, chembl_id)
        try:
            await ChEMBLIngestor.ingest_drug_by_chembl_id(chembl_id)
            await PubChemIngestor.ingest_compound_by_name(name, drug_canonical_id=chembl_id)
        except Exception as e:
            logger.warning("Failed ingesting drug %s: %s", name, e)

    # 5. Ingest clinical trials and scientific literature
    logger.info("--- Phase 4: Ingesting Clinical Trials & Literature (ClinicalTrials.gov & PubMed) ---")
    try:
        await ClinicalTrialsIngestor.ingest_trials_for_drug_and_condition(
            "Donepezil", "Alzheimer's Disease", drug_canonical_id="CHEMBL502", limit=3
        )
        await ClinicalTrialsIngestor.ingest_trials_for_drug_and_condition(
            "Metformin", "Alzheimer's Disease", drug_canonical_id="CHEMBL1434", limit=3
        )
        await PubMedIngestor.ingest_literature_for_drug_and_disease(
            "Metformin", "Alzheimer", drug_canonical_id="CHEMBL1434", disease_canonical_id="MONDO_0004975", limit=3
        )
        await PubMedIngestor.ingest_literature_for_drug_and_disease(
            "Rapamycin", "Alzheimer", drug_canonical_id="CHEMBL411", disease_canonical_id="MONDO_0004975", limit=3
        )
    except Exception as e:
        logger.warning("Failed literature/trials ingestion: %s", e)

    logger.info("==================================================================")
    logger.info("Bootstrap complete! Knowledge graph populated with real biomedical data.")
    logger.info("==================================================================")


if __name__ == "__main__":
    asyncio.run(bootstrap_biomedical_graph())
