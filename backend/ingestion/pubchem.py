import asyncio
import sys
from app.ingestion.pubchem import PubChemIngestor

if __name__ == "__main__":
    name = sys.argv[1] if len(sys.argv) > 1 else "Donepezil"
    print(f"Ingesting PubChem compound: {name}")
    asyncio.run(PubChemIngestor.ingest_compound_by_name(name))
