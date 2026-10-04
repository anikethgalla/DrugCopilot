import asyncio
import sys
from app.ingestion.opentargets import OpenTargetsIngestor

if __name__ == "__main__":
    disease_id = sys.argv[1] if len(sys.argv) > 1 else "EFO_0000249"
    limit = int(sys.argv[2]) if len(sys.argv) > 2 else 25
    print(f"Ingesting Open Targets for disease: {disease_id} (limit={limit})")
    asyncio.run(OpenTargetsIngestor.ingest_disease_targets(disease_id, limit=limit))
