"""
Multi-strategy Cypher query library for Drug Repurposing graph traversal.
All queries are strictly parameterized for security and performance.
"""

# Strategy 1: Direct Disease -> Gene -> Protein <- Drug
CYPHER_DIRECT_TARGET_TRAVERSAL = """
MATCH (d:Disease)
WHERE d.canonical_id = $disease_id OR d.efo_id = $disease_id OR toLower(d.name) = toLower($disease_name)
MATCH (g:Gene)-[assoc:ASSOCIATED_WITH]->(d)
MATCH (g)-[:ENCODES]->(p:Protein)
MATCH (drug:Drug)-[tgt:TARGETS]->(p)
WHERE $approved_only = false OR drug.is_approved = true OR drug.max_clinical_phase >= 4
RETURN drug, p AS protein, g AS gene, d AS disease, assoc.score AS target_disease_score, tgt AS target_relation, assoc AS assoc_relation
ORDER BY assoc.score DESC
LIMIT $limit
"""

# Strategy 2: Shared Biological Pathway Traversal
CYPHER_PATHWAY_TRAVERSAL = """
MATCH (d:Disease)
WHERE d.canonical_id = $disease_id OR d.efo_id = $disease_id OR toLower(d.name) = toLower($disease_name)
MATCH (d)-[inv:INVOLVES]->(pw:Pathway)
MATCH (p:Protein)-[part:PARTICIPATES_IN]->(pw)
MATCH (drug:Drug)-[tgt:TARGETS]->(p)
WHERE $approved_only = false OR drug.is_approved = true OR drug.max_clinical_phase >= 4
RETURN drug, p AS protein, pw AS pathway, d AS disease, tgt AS target_relation, inv AS pathway_relation
LIMIT $limit
"""

# Strategy 3: Protein-Protein Interaction (PPI) 2-Hop Network Proximity
CYPHER_PPI_TRAVERSAL = """
MATCH (d:Disease)
WHERE d.canonical_id = $disease_id OR d.efo_id = $disease_id OR toLower(d.name) = toLower($disease_name)
MATCH (g:Gene)-[assoc:ASSOCIATED_WITH]->(d)
MATCH (g)-[:ENCODES]->(p1:Protein)
MATCH (p1)-[ppi:INTERACTS_WITH]-(p2:Protein)
MATCH (drug:Drug)-[tgt:TARGETS]->(p2)
WHERE p1 <> p2 AND ($approved_only = false OR drug.is_approved = true)
RETURN drug, p1 AS disease_protein, p2 AS drug_target_protein, g AS gene, d AS disease, 
       assoc.score AS disease_score, ppi.score AS ppi_score, tgt AS target_relation
ORDER BY assoc.score DESC
LIMIT $limit
"""

# Strategy 4: Indication Pivot / Similar Target Profile
CYPHER_INDICATION_PIVOT = """
MATCH (d:Disease)
WHERE d.canonical_id = $disease_id OR d.efo_id = $disease_id OR toLower(d.name) = toLower($disease_name)
MATCH (known_drug:Drug)-[:TREATS]->(d)
MATCH (known_drug)-[:TARGETS]->(p:Protein)<-[tgt:TARGETS]-(candidate_drug:Drug)
WHERE known_drug <> candidate_drug AND ($approved_only = false OR candidate_drug.is_approved = true)
RETURN candidate_drug, known_drug, p AS shared_protein, d AS disease, tgt AS target_relation
LIMIT $limit
"""

# Get Full Ego-Subgraph for an entity
CYPHER_GET_SUBGRAPH = """
MATCH (n {canonical_id: $id})
CALL apoc.path.subgraphAll(n, {maxLevel: $max_depth, limit: $max_nodes})
YIELD nodes, relationships
RETURN nodes, relationships
"""

# Fetch Drug Details with Targets, Diseases, Trials & Publications
CYPHER_GET_DRUG_PROFILE = """
MATCH (drug:Drug)
WHERE drug.canonical_id = $drug_id OR drug.chembl_id = $drug_id OR toLower(drug.name) = toLower($drug_id)
OPTIONAL MATCH (drug)-[t:TARGETS]->(p:Protein)
OPTIONAL MATCH (drug)-[tr:TREATS]->(d:Disease)
OPTIONAL MATCH (drug)-[ct:INVESTIGATED_IN]->(trial:ClinicalTrial)
OPTIONAL MATCH (drug)-[pub:MENTIONED_IN]->(paper:Publication)
RETURN drug, 
       collect(DISTINCT {protein: p, relation: t}) AS targets,
       collect(DISTINCT {disease: d, relation: tr}) AS indications,
       collect(DISTINCT trial) AS trials,
       collect(DISTINCT paper) AS publications
"""

# Fetch Disease Details with Associated Genes, Known Drugs, Pathways & Trials
CYPHER_GET_DISEASE_PROFILE = """
MATCH (d:Disease)
WHERE d.canonical_id = $disease_id OR d.efo_id = $disease_id OR toLower(d.name) = toLower($disease_id)
OPTIONAL MATCH (g:Gene)-[assoc:ASSOCIATED_WITH]->(d)
OPTIONAL MATCH (g)-[:ENCODES]->(p:Protein)
OPTIONAL MATCH (drug:Drug)-[t:TREATS]->(d)
OPTIONAL MATCH (d)-[inv:INVOLVES]->(pw:Pathway)
RETURN d AS disease,
       collect(DISTINCT {gene: g, protein: p, score: assoc.score, evidence: assoc}) AS target_associations,
       collect(DISTINCT drug) AS known_drugs,
       collect(DISTINCT pw) AS pathways
"""

# Database Summary Statistics
CYPHER_GRAPH_STATS = """
CALL {
  MATCH (d:Drug) RETURN count(d) AS drug_count
}
CALL {
  MATCH (dis:Disease) RETURN count(dis) AS disease_count
}
CALL {
  MATCH (p:Protein) RETURN count(p) AS protein_count
}
CALL {
  MATCH (g:Gene) RETURN count(g) AS gene_count
}
CALL {
  MATCH (t:Target) RETURN count(t) AS target_count
}
CALL {
  MATCH (pw:Pathway) RETURN count(pw) AS pathway_count
}
CALL {
  MATCH (ct:ClinicalTrial) RETURN count(ct) AS trial_count
}
CALL {
  MATCH (pub:Publication) RETURN count(pub) AS publication_count
}
CALL {
  MATCH ()-[r]->() RETURN count(r) AS relationship_count
}
RETURN drug_count, disease_count, protein_count, gene_count, target_count, 
       pathway_count, trial_count, publication_count, relationship_count
"""
