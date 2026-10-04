import logging
from typing import List
from app.graph.driver import Neo4jConnectionManager

logger = logging.getLogger(__name__)

CONSTRAINTS = [
    "CREATE CONSTRAINT constraint_drug_canonical_id IF NOT EXISTS FOR (d:Drug) REQUIRE d.canonical_id IS UNIQUE",
    "CREATE CONSTRAINT constraint_disease_canonical_id IF NOT EXISTS FOR (d:Disease) REQUIRE d.canonical_id IS UNIQUE",
    "CREATE CONSTRAINT constraint_protein_uniprot_id IF NOT EXISTS FOR (p:Protein) REQUIRE p.uniprot_id IS UNIQUE",
    "CREATE CONSTRAINT constraint_gene_ensembl_id IF NOT EXISTS FOR (g:Gene) REQUIRE g.ensembl_id IS UNIQUE",
    "CREATE CONSTRAINT constraint_target_target_id IF NOT EXISTS FOR (t:Target) REQUIRE t.target_id IS UNIQUE",
    "CREATE CONSTRAINT constraint_pathway_pathway_id IF NOT EXISTS FOR (p:Pathway) REQUIRE p.pathway_id IS UNIQUE",
    "CREATE CONSTRAINT constraint_clinicaltrial_nct_id IF NOT EXISTS FOR (c:ClinicalTrial) REQUIRE c.nct_id IS UNIQUE",
    "CREATE CONSTRAINT constraint_publication_pmid IF NOT EXISTS FOR (p:Publication) REQUIRE p.pmid IS UNIQUE",
]

INDEXES = [
    "CREATE INDEX index_drug_name IF NOT EXISTS FOR (d:Drug) ON (d.name)",
    "CREATE INDEX index_drug_chembl_id IF NOT EXISTS FOR (d:Drug) ON (d.chembl_id)",
    "CREATE INDEX index_drug_pubchem_cid IF NOT EXISTS FOR (d:Drug) ON (d.pubchem_cid)",
    "CREATE INDEX index_disease_name IF NOT EXISTS FOR (d:Disease) ON (d.name)",
    "CREATE INDEX index_disease_efo_id IF NOT EXISTS FOR (d:Disease) ON (d.efo_id)",
    "CREATE INDEX index_disease_mondo_id IF NOT EXISTS FOR (d:Disease) ON (d.mondo_id)",
    "CREATE INDEX index_protein_gene_symbol IF NOT EXISTS FOR (p:Protein) ON (p.gene_symbol)",
    "CREATE INDEX index_gene_symbol IF NOT EXISTS FOR (g:Gene) ON (g.symbol)",
    "CREATE INDEX index_target_pref_name IF NOT EXISTS FOR (t:Target) ON (t.pref_name)",
    "CREATE INDEX index_clinicaltrial_phase IF NOT EXISTS FOR (c:ClinicalTrial) ON (c.phase)",
    "CREATE INDEX index_clinicaltrial_status IF NOT EXISTS FOR (c:ClinicalTrial) ON (c.status)",
]


async def init_schema():
    """Initializes Neo4j uniqueness constraints and performance indexes."""
    logger.info("Initializing Neo4j graph schema constraints and indexes...")
    driver = await Neo4jConnectionManager.get_driver()
    if not driver:
        logger.info("Neo4j driver offline. In-memory schema initialized.")
        return

    for constraint in CONSTRAINTS:
        try:
            await Neo4jConnectionManager.execute_write(constraint)
            logger.debug("Applied constraint: %s", constraint)
        except Exception as e:
            logger.warning("Error creating constraint (%s): %s", constraint, e)

    for index in INDEXES:
        try:
            await Neo4jConnectionManager.execute_write(index)
            logger.debug("Applied index: %s", index)
        except Exception as e:
            logger.warning("Error creating index (%s): %s", index, e)

    logger.info("Neo4j graph schema initialization completed.")
