import asyncio
import logging
from app.ingestion.bootstrap import bootstrap_biomedical_graph

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("ingestion.all")


async def main():
    logger.info("Starting complete multi-source biomedical ingestion pipeline...")
    await bootstrap_biomedical_graph()
    logger.info("All ingestion pipelines completed successfully.")


if __name__ == "__main__":
    asyncio.run(main())
