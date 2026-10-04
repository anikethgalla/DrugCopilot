# REST API Reference 📡📋

Base URL: `http://localhost:8000`

---

## Endpoints

### 1. Health & Status
- **`GET /health`**: Health status, Neo4j connectivity, and system metadata.
- **`GET /`**: Welcome message and links to interactive OpenAPI `/docs`.

---

### 2. AI Copilot
- **`POST /copilot/chat`**: Multi-turn AI Copilot chat with tool execution and ego-subgraph extraction.
  - **Request Body**:
    ```json
    {
      "message": "Find potential drug repurposing candidates for Alzheimer's disease.",
      "history": [],
      "include_subgraph": true
    }
    ```
  - **Response**: `ChatResponse` with `reply`, `tool_executions`, `candidates`, `subgraph`, and `medical_disclaimer`.

---

### 3. Drug Repurposing
- **`POST /repurposing/search`**: Executes multi-strategy graph repurposing for a disease.
  - **Request Body**:
    ```json
    {
      "disease_id_or_name": "Alzheimer's disease",
      "max_candidates": 10,
      "min_score": 0.3,
      "approved_only": false
    }
    ```

---

### 4. Knowledge Graph & Subgraphs
- **`GET /graph/stats`**: Overall node and edge counts by label and type.
- **`GET /graph/{entity_type}/{id}`**: Extracts interactive Cytoscape ego-subgraph centered around an entity.
- **`POST /graph/query`**: Executes parameterized, validated read-only Cypher queries.

---

### 5. Entity Lookups
- **`GET /drugs`**: List drugs in the knowledge graph.
- **`GET /drugs/{id}`**: Complete drug profile with targets, indications, trials, and publications.
- **`GET /drugs/{id}/targets`**: List target proteins for a drug.
- **`GET /diseases`**: List diseases in the knowledge graph.
- **`GET /diseases/{id}`**: Complete disease profile with associated genes, pathways, and known drugs.
- **`GET /diseases/{id}/pathways`**: List biological pathways involved in disease.
- **`GET /targets/{id}`**: Protein target details and targeting molecules.
- **`GET /clinical-trials`**: Search human clinical trials by condition and drug.
- **`GET /clinical-trials/{id}`**: Clinical study details by NCT ID.

---

### 6. Ingestion & Provenance
- **`POST /ingestion/{source}`**: Triggers real-time ingestion from an external source (`chembl`, `opentargets`, `uniprot`, `pubchem`, `clinicaltrials`, `pubmed`, `bootstrap`).
- **`GET /evidence/summary`**: Statistical distribution of evidence types and data sources.
- **`GET /evidence/inspect?source_id={id}`**: Inspects provenance records for a given source ID.
