import pytest
from app.agent.security import CypherSecurityEnforcer


def test_safe_read_only_queries():
    safe_queries = [
        "MATCH (d:Drug)-[:TARGETS]->(p:Protein) RETURN d, p LIMIT 10",
        "MATCH (dis:Disease {canonical_id: $id})<-[:ASSOCIATED_WITH]-(g:Gene) RETURN g",
        "MATCH path = (d:Disease)-[*1..3]-(drug:Drug) RETURN path LIMIT 5"
    ]
    for q in safe_queries:
        is_safe, msg = CypherSecurityEnforcer.validate_read_only(q)
        assert is_safe is True, f"Failed for safe query: {q} ({msg})"


def test_prohibited_write_queries():
    dangerous_queries = [
        "MATCH (d:Drug) DELETE d",
        "CREATE (d:Drug {name: 'FakeDrug'})",
        "MERGE (d:Drug {id: '123'}) SET d.name = 'Hacked'",
        "DROP CONSTRAINT constraint_drug_canonical_id",
        "CALL apoc.trigger.add('myTrigger', '...')",
        "LOAD CSV FROM 'http://evil.com/data.csv' AS line CREATE (n:Node)"
    ]
    for q in dangerous_queries:
        is_safe, msg = CypherSecurityEnforcer.validate_read_only(q)
        assert is_safe is False, f"Should have blocked dangerous query: {q}"
