# Neo4j Biomedical Knowledge Graph Schema 🧬📊

## 1. Node Labels & Properties

| Label | Canonical ID Format | Key Properties | Data Sources |
|---|---|---|---|
| `Drug` | `CHEMBL:CHEMBLxxx` | `name`, `chembl_id`, `pubchem_cid`, `max_clinical_phase`, `is_approved`, `smiles`, `molecular_formula`, `molecular_weight` | ChEMBL, PubChem, Open Targets |
| `Disease` | `EFO_xxxxxxx` / `MONDO_xxxxxxx` | `name`, `efo_id`, `mondo_id`, `mesh_id`, `synonyms` | Open Targets, EFO, MeSH |
| `Protein` | `Pxxxxx` (UniProt Accession) | `name`, `gene_symbol`, `uniprot_id`, `ensembl_id`, `function_description`, `sequence_length` | UniProtKB, Ensembl |
| `Gene` | `ENSGxxxxxxxxxxx` | `symbol`, `ensembl_id`, `name`, `chromosome` | Ensembl, Open Targets, HGNC |
| `Target` | `CHEMBLxxx` / `ENSGxxx` | `target_id`, `pref_name`, `target_type`, `organism` | ChEMBL |
| `Pathway` | `R-HSA-xxxxxx` / `PATHWAY_xxx` | `pathway_id`, `name`, `source_db` (Reactome/KEGG/GO) | Reactome, Open Targets |
| `ClinicalTrial` | `NCTxxxxxxxx` | `nct_id`, `title`, `phase`, `status`, `conditions`, `interventions`, `sponsors`, `start_date`, `url` | ClinicalTrials.gov |
| `Publication` | `PMID:xxxxxxxx` | `pmid`, `title`, `journal`, `publication_year`, `authors`, `doi`, `url` | PubMed / NCBI |
| `Compound` | `PUBCHEM:xxxxxx` | `pubchem_cid`, `smiles`, `molecular_formula`, `molecular_weight`, `iupac_name` | PubChem |

---

## 2. Relationship Types & Provenance Properties

Every relationship in the knowledge graph maintains provenance attributes:
- `source`: Upstream database name (e.g., `ChEMBL`, `Open Targets Platform`, `UniProtKB`, `ClinicalTrials.gov`, `PubMed`).
- `source_id`: Upstream record identifier.
- `source_url`: Verified URL for drill-down inspection.
- `retrieved_at`: UTC timestamp of data retrieval.
- `confidence`: Numeric confidence score ($0.0 \le C \le 1.0$).
- `evidence_type`: Classification of biomedical relationship.

| Relationship Type | Source Node | Target Node | Key Metadata |
|---|---|---|---|
| `[:TARGETS]` | `Drug` | `Protein` | `action_type`, `mechanism`, `confidence`, `source_id` |
| `[:BINDS_TO]` | `Drug` | `Target` | `affinity_nm`, `standard_type` (IC50/Ki) |
| `[:ASSOCIATED_WITH]` | `Gene` | `Disease` | `score`, `genetic_score`, `literature_score` |
| `[:ENCODES]` | `Gene` | `Protein` | `source` (Ensembl / UniProt) |
| `[:PARTICIPATES_IN]` | `Protein` | `Pathway` | `source` (Reactome) |
| `[:INVOLVES]` | `Disease` | `Pathway` | `source` (Open Targets / Reactome) |
| `[:INTERACTS_WITH]` | `Protein` | `Protein` | `score`, `source` (STRING / BioGRID) |
| `[:TREATS]` | `Drug` | `Disease` | `phase` (1-4), `source` (ChEMBL / Open Targets) |
| `[:INVESTIGATED_IN]` | `Drug` | `ClinicalTrial` | `phase`, `status`, `source_id` (NCT ID) |
| `[:MENTIONED_IN]` | `Drug` / `Disease` | `Publication` | `pmid`, `source` (PubMed) |
| `[:HAS_COMPOUND]` | `Drug` | `Compound` | `source` (PubChem) |

---

## 3. Database Constraints & Performance Indexes

```cypher
// Uniqueness Constraints
CREATE CONSTRAINT constraint_drug_canonical_id IF NOT EXISTS FOR (d:Drug) REQUIRE d.canonical_id IS UNIQUE;
CREATE CONSTRAINT constraint_disease_canonical_id IF NOT EXISTS FOR (d:Disease) REQUIRE d.canonical_id IS UNIQUE;
CREATE CONSTRAINT constraint_protein_uniprot_id IF NOT EXISTS FOR (p:Protein) REQUIRE p.uniprot_id IS UNIQUE;
CREATE CONSTRAINT constraint_gene_ensembl_id IF NOT EXISTS FOR (g:Gene) REQUIRE g.ensembl_id IS UNIQUE;
CREATE CONSTRAINT constraint_target_target_id IF NOT EXISTS FOR (t:Target) REQUIRE t.target_id IS UNIQUE;
CREATE CONSTRAINT constraint_pathway_pathway_id IF NOT EXISTS FOR (p:Pathway) REQUIRE p.pathway_id IS UNIQUE;
CREATE CONSTRAINT constraint_clinicaltrial_nct_id IF NOT EXISTS FOR (c:ClinicalTrial) REQUIRE c.nct_id IS UNIQUE;
CREATE CONSTRAINT constraint_publication_pmid IF NOT EXISTS FOR (p:Publication) REQUIRE p.pmid IS UNIQUE;

// Performance Indexes
CREATE INDEX index_drug_name IF NOT EXISTS FOR (d:Drug) ON (d.name);
CREATE INDEX index_drug_chembl_id IF NOT EXISTS FOR (d:Drug) ON (d.chembl_id);
CREATE INDEX index_disease_name IF NOT EXISTS FOR (d:Disease) ON (d.name);
CREATE INDEX index_disease_efo_id IF NOT EXISTS FOR (d:Disease) ON (d.efo_id);
CREATE INDEX index_protein_gene_symbol IF NOT EXISTS FOR (p:Protein) ON (p.gene_symbol);
CREATE INDEX index_gene_symbol IF NOT EXISTS FOR (g:Gene) ON (g.symbol);
CREATE INDEX index_clinicaltrial_phase IF NOT EXISTS FOR (c:ClinicalTrial) ON (c.phase);
```
