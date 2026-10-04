# Real Biomedical Data Sources 🌐🔬

DrugRepurposingCopilot strictly enforces a **Zero Synthetic Data Policy**. All entities, affinities, genetic links, pathways, trials, and publications are queried from official biomedical APIs.

---

## 1. ChEMBL Database (EMBL-EBI)
- **Official Documentation**: [https://www.ebi.ac.uk/chembl/](https://www.ebi.ac.uk/chembl/)
- **Base REST URL**: `https://www.ebi.ac.uk/chembl/api/data/`
- **Data Retrieved**:
  - `molecule`: Molecular weight, formula, canonical SMILES, synonyms, max clinical phase.
  - `mechanism`: Drug target mechanisms of action, action types (inhibitor, agonist, antagonist).
  - `target`: ChEMBL target entities, UniProt accession cross-references.
  - `activity`: Bioactivity measurements (IC50, Ki, Kd, EC50 in nM).
  - `drug_indication`: Approved and investigational indications with MeSH and EFO identifiers.

---

## 2. Open Targets Platform
- **Official Documentation**: [https://platform-docs.opentargets.org/](https://platform-docs.opentargets.org/)
- **GraphQL Endpoint**: `https://api.platform.opentargets.org/api/v4/graphql`
- **Data Retrieved**:
  - Disease search by name and synonym to EFO and MONDO ontologies.
  - Ranked target-disease associations with overall evidence scores and genetic datatype scores (GWAS, ClinVar, L2G).
  - Reactome biological pathway involvement.
  - Known clinical drugs and investigational candidates for diseases.

---

## 3. UniProtKB (UniProt Consortium)
- **Official Documentation**: [https://www.uniprot.org/help/api](https://www.uniprot.org/help/api)
- **Base REST URL**: `https://rest.uniprot.org/uniprotkb/`
- **Data Retrieved**:
  - Reviewed Swiss-Prot human protein records by accession (e.g. `P05067`) and gene symbol.
  - Functional annotation comments.
  - Sequence lengths and enzyme classifications.
  - Reactome pathway mappings and Ensembl gene cross-references.

---

## 4. NCBI PubChem
- **Official Documentation**: [https://pubchem.ncbi.nlm.nih.gov/docs/pug-rest](https://pubchem.ncbi.nlm.nih.gov/docs/pug-rest)
- **Base REST URL**: `https://pubchem.ncbi.nlm.nih.gov/rest/pug/`
- **Data Retrieved**:
  - Compound property tables by name or CID (`MolecularFormula`, `MolecularWeight`, `CanonicalSMILES`, `IUPACName`).
  - Synonym lists for entity resolution.

---

## 5. ClinicalTrials.gov (NLM / NIH)
- **Official Documentation**: [https://clinicaltrials.gov/data-api/api](https://clinicaltrials.gov/data-api/api)
- **Base REST URL**: `https://clinicaltrials.gov/api/v2/studies`
- **Data Retrieved**:
  - Live human clinical trials by condition and drug intervention.
  - NCT identifiers, brief titles, study phases (Phase 1–4), overall recruitment status.
  - Lead sponsors, start dates, and completion dates.

---

## 6. PubMed / NCBI E-Utilities
- **Official Documentation**: [https://www.ncbi.nlm.nih.gov/books/NBK25501/](https://www.ncbi.nlm.nih.gov/books/NBK25501/)
- **Endpoints**: `esearch.fcgi`, `esummary.fcgi`, `efetch.fcgi`
- **Data Retrieved**:
  - Literature co-mentions connecting drugs, targets, and diseases.
  - PMIDs, publication titles, author lists, journal sources, publication years, and DOIs.
