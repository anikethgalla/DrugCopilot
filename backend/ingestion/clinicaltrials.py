import asyncio
import sys
from app.ingestion.clinicaltrials import ClinicalTrialsIngestor

if __name__ == "__main__":
    drug = sys.argv[1] if len(sys.argv) > 1 else "Donepezil"
    cond = sys.argv[2] if len(sys.argv) > 2 else "Alzheimer"
    print(f"Ingesting ClinicalTrials for drug: {drug}, condition: {cond}")
    asyncio.run(ClinicalTrialsIngestor.ingest_trials_for_drug_and_condition(drug, cond))
