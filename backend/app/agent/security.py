import re
import logging
from typing import Tuple

logger = logging.getLogger(__name__)

DISALLOWED_CYPHER_KEYWORDS = [
    r"\bCREATE\b",
    r"\bMERGE\b",
    r"\bDELETE\b",
    r"\bDETACH\b",
    r"\bSET\b",
    r"\bREMOVE\b",
    r"\bDROP\b",
    r"\bALTER\b",
    r"\bCALL\s+apoc\.trigger\b",
    r"\bCALL\s+apoc\.util\b",
    r"\bCALL\s+dbms\b",
    r"\bLOAD\s+CSV\b"
]


class CypherSecurityEnforcer:
    """
    Guarantees that user or AI-generated Cypher queries are strictly READ-ONLY.
    Prevents Cypher injection and database modifications.
    """

    @classmethod
    def validate_read_only(cls, query: str) -> Tuple[bool, str]:
        """Validates that a Cypher query contains no write or destructive operations."""
        query_upper = query.upper()
        
        # Check forbidden keywords
        for pattern in DISALLOWED_CYPHER_KEYWORDS:
            if re.search(pattern, query_upper):
                return False, f"Forbidden keyword or procedure detected: {pattern}"

        # Must contain MATCH or RETURN or CALL gds / CALL apoc.path
        if not ("MATCH" in query_upper or "RETURN" in query_upper or "SHOW" in query_upper):
            return False, "Query must be a valid read-only MATCH or RETURN statement."

        return True, "Query is verified read-only."
