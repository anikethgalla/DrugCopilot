# Biomedical Data Ingestion Pipelines 📥🔄

## 1. Ingestion Pipeline Commands

You can run individual ingestion pipelines or bootstrap the entire knowledge graph using standard CLI commands from the `backend/` directory:

```bash
# 1. Full Bootstrap Ingestion (Core neurodegenerative & metabolic domains)
python -m ingestion.bootstrap
# or
python -m ingestion.all

# 2. Ingest specific ChEMBL Drug by ChEMBL ID
python -m ingestion.chembl CHEMBL502

# 3. Ingest Open Targets associations for disease by EFO ID
python -m ingestion.opentargets EFO_0000249 25

# 4. Ingest UniProt human protein entry by Accession or Gene Symbol
python -m ingestion.uniprot P05067

# 5. Ingest PubChem compound properties by chemical name
python -m ingestion.pubchem Donepezil

# 6. Ingest ClinicalTrials.gov studies for drug and condition
python -m ingestion.clinicaltrials Donepezil "Alzheimer's Disease"

# 7. Ingest PubMed scientific literature co-mentions
python -m ingestion.pubmed Donepezil "Alzheimer's Disease"

# 8. Test Entity Resolution
python -m ingestion.entity_resolution "Alzheimer's disease"
```

---

## 2. Ingestion Architecture & Resilience Features

- **Batching & Pagination**: Avoids loading massive datasets into memory; paginates through API results and commits in transactional batches.
- **Rate Limiting & Exponential Retries**: Every client implements rate-limiting delay intervals and automatic retries (`tenacity`) with exponential backoff on HTTP 429/503 errors.
- **Deduplication & Canonical MERGE**: Uses Neo4j `MERGE` on unique constraints to guarantee zero duplicate nodes across multiple ingestions.
- **Provenance Tagging**: Automatically attaches W3C PROV-compliant provenance metadata to every node and edge.
- **Live Cache-Aside Sync**: Queries that encounter missing or stale entities dynamically trigger real-time API queries and graph merging on the fly.
