import asyncio
import sys
from app.ingestion.pubmed import PubMedIngestor

if __name__ == "__main__":
    drug = sys.argv[1] if len(sys.argv) > 1 else "Donepezil"
    disease = sys.argv[2] if len(sys.argv) > 2 else "Alzheimer"
    print(f"Ingesting PubMed literature for drug: {drug}, disease: {disease}")
    asyncio.run(PubMedIngestor.ingest_literature_for_drug_and_disease(drug, disease))
