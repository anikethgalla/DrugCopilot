import asyncio
from app.ingestion.bootstrap import bootstrap_biomedical_graph

if __name__ == "__main__":
    asyncio.run(bootstrap_biomedical_graph())
