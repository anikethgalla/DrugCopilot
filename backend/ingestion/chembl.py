# Direct CLI forwards to app.ingestion modules
from app.ingestion.chembl import ChEMBLIngestor
import asyncio
import sys

if __name__ == "__main__":
    cid = sys.argv[1] if len(sys.argv) > 1 else "CHEMBL25"
    print(f"Ingesting ChEMBL drug: {cid}")
    asyncio.run(ChEMBLIngestor.ingest_drug_by_chembl_id(cid))
