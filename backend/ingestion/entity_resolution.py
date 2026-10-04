import asyncio
import sys
from app.ingestion.entity_resolution import EntityResolver

if __name__ == "__main__":
    query = sys.argv[1] if len(sys.argv) > 1 else "Alzheimer's"
    print(f"Resolving entity: {query}")
    res = asyncio.run(EntityResolver.resolve_disease(query))
    print(f"Result: {res}")
