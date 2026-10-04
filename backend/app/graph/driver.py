import logging
import time
from typing import Any, Dict, List, Optional
from neo4j import AsyncGraphDatabase, AsyncDriver, AsyncSession
from app.config import settings

logger = logging.getLogger(__name__)


class Neo4jConnectionManager:
    """Manages async connection to the Neo4j graph database."""
    _driver: Optional[AsyncDriver] = None
    _in_memory_fallback: bool = False

    @classmethod
    async def get_driver(cls) -> Optional[AsyncDriver]:
        if cls._driver is None:
            try:
                cls._driver = AsyncGraphDatabase.driver(
                    settings.NEO4J_URI,
                    auth=(settings.NEO4J_USERNAME, settings.NEO4J_PASSWORD),
                    max_connection_lifetime=settings.NEO4J_MAX_CONNECTION_LIFETIME,
                    max_connection_pool_size=settings.NEO4J_MAX_CONNECTION_POOL_SIZE,
                )
                await cls._driver.verify_connectivity()
                logger.info("Successfully connected to Neo4j database at %s", settings.NEO4J_URI)
            except Exception as e:
                logger.warning("Neo4j is not reachable at %s (%s). Falling back to resilient graph memory mode.", settings.NEO4J_URI, e)
                if cls._driver:
                    try:
                        await cls._driver.close()
                    except Exception:
                        pass
                cls._driver = None
        return cls._driver

    @classmethod
    async def is_connected(cls) -> bool:
        try:
            driver = await cls.get_driver()
            if driver:
                await driver.verify_connectivity()
                return True
        except Exception:
            return False
        return False

    @classmethod
    async def execute_query(cls, cypher: str, parameters: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """Executes a parameterized Cypher query and returns a list of records as dicts."""
        driver = await cls.get_driver()
        parameters = parameters or {}

        if driver:
            try:
                db_name = settings.NEO4J_DATABASE if settings.NEO4J_DATABASE and settings.NEO4J_DATABASE not in ("neo4j", "") else None
                async with driver.session(database=db_name) as session:
                    result = await session.run(cypher, parameters)
                    records = await result.data()
                    return records
            except Exception as e:
                logger.error("Error executing Cypher query on Neo4j: %s. Query: %s", e, cypher)
                raise
        else:
            # InMemory graph store fallback
            from app.graph.in_memory_graph import in_memory_graph
            return in_memory_graph.query(cypher, parameters)

    @classmethod
    async def execute_write(cls, cypher: str, parameters: Optional[Dict[str, Any]] = None) -> Any:
        """Executes a write transaction query in Neo4j."""
        driver = await cls.get_driver()
        parameters = parameters or {}

        if driver:
            try:
                db_name = settings.NEO4J_DATABASE if settings.NEO4J_DATABASE and settings.NEO4J_DATABASE not in ("neo4j", "") else None
                async with driver.session(database=db_name) as session:
                    result = await session.run(cypher, parameters)
                    summary = await result.consume()
                    return summary
            except Exception as e:
                logger.error("Error executing Cypher write on Neo4j: %s", e)
                raise
        else:
            from app.graph.in_memory_graph import in_memory_graph
            return in_memory_graph.execute_write(cypher, parameters)

    @classmethod
    async def close(cls):
        if cls._driver:
            await cls._driver.close()
            cls._driver = None
            logger.info("Neo4j driver connection closed.")
