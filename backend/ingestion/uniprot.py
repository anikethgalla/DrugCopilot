import asyncio
import sys
from app.ingestion.uniprot import UniProtIngestor

if __name__ == "__main__":
    acc = sys.argv[1] if len(sys.argv) > 1 else "P05067"
    print(f"Ingesting UniProt protein: {acc}")
    asyncio.run(UniProtIngestor.ingest_protein(acc))
