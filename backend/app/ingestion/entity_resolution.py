import difflib
import logging
import re
from typing import Any, Dict, List, Optional, Tuple, Set
from app.clients.opentargets import opentargets_client
from app.clients.chembl import chembl_client
from app.clients.uniprot import uniprot_client
from app.graph.driver import Neo4jConnectionManager
from app.graph.in_memory_graph import in_memory_graph

logger = logging.getLogger(__name__)

# Pre-seeded canonical disease mappings for instant resolution
CANONICAL_DISEASE_MAPPINGS: Dict[str, Dict[str, str]] = {
    "tuberculosis": {
        "canonical_id": "MONDO_0018076",
        "name": "tuberculosis",
        "efo_id": "EFO_0003950",
        "mondo_id": "MONDO_0018076",
        "mesh_id": "D014376"
    },
    "tuberoclosis": {
        "canonical_id": "MONDO_0018076",
        "name": "tuberculosis",
        "efo_id": "EFO_0003950",
        "mondo_id": "MONDO_0018076",
        "mesh_id": "D014376"
    },
    "tb": {
        "canonical_id": "MONDO_0018076",
        "name": "tuberculosis",
        "efo_id": "EFO_0003950",
        "mondo_id": "MONDO_0018076",
        "mesh_id": "D014376"
    },
    "pulmonary tuberculosis": {
        "canonical_id": "MONDO_0006052",
        "name": "pulmonary tuberculosis",
        "efo_id": "EFO_0001072",
        "mondo_id": "MONDO_0006052",
        "mesh_id": "D014397"
    },
    "malaria": {
        "canonical_id": "MONDO_0005136",
        "name": "malaria",
        "efo_id": "EFO_0001068",
        "mondo_id": "MONDO_0005136",
        "mesh_id": "D008288"
    },
    "covid-19": {
        "canonical_id": "MONDO_0100096",
        "name": "COVID-19",
        "efo_id": "EFO_0009941",
        "mondo_id": "MONDO_0100096",
        "mesh_id": "D000086382"
    },
    "covid": {
        "canonical_id": "MONDO_0100096",
        "name": "COVID-19",
        "efo_id": "EFO_0009941",
        "mondo_id": "MONDO_0100096",
        "mesh_id": "D000086382"
    },
    "coronavirus": {
        "canonical_id": "MONDO_0100096",
        "name": "COVID-19",
        "efo_id": "EFO_0009941",
        "mondo_id": "MONDO_0100096",
        "mesh_id": "D000086382"
    },
    "sars-cov-2": {
        "canonical_id": "MONDO_0100096",
        "name": "COVID-19",
        "efo_id": "EFO_0009941",
        "mondo_id": "MONDO_0100096",
        "mesh_id": "D000086382"
    },
    "alzheimer": {
        "canonical_id": "MONDO_0004975",
        "name": "Alzheimer's disease",
        "efo_id": "EFO_0000249",
        "mondo_id": "MONDO_0004975",
        "mesh_id": "D000544"
    },
    "alzheimer's disease": {
        "canonical_id": "MONDO_0004975",
        "name": "Alzheimer's disease",
        "efo_id": "EFO_0000249",
        "mondo_id": "MONDO_0004975",
        "mesh_id": "D000544"
    },
    "parkinson": {
        "canonical_id": "MONDO_0005180",
        "name": "Parkinson's disease",
        "efo_id": "EFO_0002507",
        "mondo_id": "MONDO_0005180",
        "mesh_id": "D010300"
    },
    "parkinson's disease": {
        "canonical_id": "MONDO_0005180",
        "name": "Parkinson's disease",
        "efo_id": "EFO_0002507",
        "mondo_id": "MONDO_0005180",
        "mesh_id": "D010300"
    },
    "amyotrophic lateral sclerosis": {
        "canonical_id": "MONDO_0004976",
        "name": "Amyotrophic lateral sclerosis",
        "efo_id": "EFO_0000253",
        "mondo_id": "MONDO_0004976",
        "mesh_id": "D000690"
    },
    "als": {
        "canonical_id": "MONDO_0004976",
        "name": "Amyotrophic lateral sclerosis",
        "efo_id": "EFO_0000253",
        "mondo_id": "MONDO_0004976",
        "mesh_id": "D000690"
    },
    "type 2 diabetes": {
        "canonical_id": "MONDO_0005148",
        "name": "type II diabetes mellitus",
        "efo_id": "EFO_0001360",
        "mondo_id": "MONDO_0005148",
        "mesh_id": "D003924"
    },
    "diabetes": {
        "canonical_id": "MONDO_0005148",
        "name": "type II diabetes mellitus",
        "efo_id": "EFO_0001360",
        "mondo_id": "MONDO_0005148",
        "mesh_id": "D003924"
    },
    "huntington's disease": {
        "canonical_id": "MONDO_0007739",
        "name": "Huntington's disease",
        "efo_id": "EFO_0000534",
        "mondo_id": "MONDO_0007739",
        "mesh_id": "D006816"
    },
    "breast cancer": {
        "canonical_id": "MONDO_0007254",
        "name": "breast cancer",
        "efo_id": "EFO_0000305",
        "mondo_id": "MONDO_0007254",
        "mesh_id": "D001943"
    },
    "hypertension": {
        "canonical_id": "MONDO_0005044",
        "name": "hypertension",
        "efo_id": "EFO_0000537",
        "mondo_id": "MONDO_0005044",
        "mesh_id": "D006973"
    },
    "asthma": {
        "canonical_id": "MONDO_0004979",
        "name": "asthma",
        "efo_id": "EFO_0000270",
        "mondo_id": "MONDO_0004979",
        "mesh_id": "D001249"
    },
    "multiple sclerosis": {
        "canonical_id": "MONDO_0005301",
        "name": "multiple sclerosis",
        "efo_id": "EFO_0003885",
        "mondo_id": "MONDO_0005301",
        "mesh_id": "D009103"
    },
    "rheumatoid arthritis": {
        "canonical_id": "MONDO_0008383",
        "name": "rheumatoid arthritis",
        "efo_id": "EFO_0000685",
        "mondo_id": "MONDO_0008383",
        "mesh_id": "D001172"
    },
    "depression": {
        "canonical_id": "MONDO_0002054",
        "name": "major depressive disorder",
        "efo_id": "EFO_0003761",
        "mondo_id": "MONDO_0002054",
        "mesh_id": "D003865"
    },
    "epilepsy": {
        "canonical_id": "MONDO_0005027",
        "name": "epilepsy",
        "efo_id": "EFO_0000474",
        "mondo_id": "MONDO_0005027",
        "mesh_id": "D004827"
    },
    "schizophrenia": {
        "canonical_id": "MONDO_0005090",
        "name": "schizophrenia",
        "efo_id": "EFO_0000692",
        "mondo_id": "MONDO_0005090",
        "mesh_id": "D012559"
    }
}


class EntityResolver:
    """
    Canonical Entity Resolution Service.
    Resolves names, synonyms, and external database IDs into canonical graph identifiers
    to guarantee zero duplicate nodes across multiple ingestions.
    """

    @classmethod
    def extract_disease_term(cls, text: str) -> str:
        """Extracts candidate disease terms from conversational or natural language queries."""
        cleaned = text.strip()
        cleaned = re.sub(r'[\?\.\!]+$', '', cleaned)
        patterns = [
            r'(?:repurpos\w*|candidates?|treatment|drugs?|therap\w*)\s+(?:for|targeting|against)\s+([A-Za-z0-9\s\-\'\’]+)',
            r'(?:treat|cure|target)\s+([A-Za-z0-9\s\-\'\’]+)',
            r'(?:evaluate|evaluating|studies on|trials for)\s+([A-Za-z0-9\s\-\'\’]+)',
        ]
        for p in patterns:
            m = re.search(p, cleaned, re.IGNORECASE)
            if m:
                extracted = m.group(1).strip()
                if extracted and len(extracted) >= 2:
                    return extracted

        prefix_patterns = [
            r'^(?:can you\s+)?(?:please\s+)?find\s+(?:potential\s+)?(?:candidate\s+)?drugs?\s+(?:that\s+could\s+(?:potentially\s+)?be\s+)?repurposed\s+for\s+',
            r'^(?:what\s+drugs?\s+(?:can\s+be\s+repurposed\s+for|treat|target)\s+)',
            r'^(?:show\s+(?:me\s+)?(?:repurposing\s+)?candidates?\s+for\s+)',
            r'^(?:find\s+candidates?\s+for\s+)',
            r'^(?:repurpose\s+(?:drugs?\s+)?for\s+)',
            r'^(?:drugs?\s+for\s+)'
        ]
        for p in prefix_patterns:
            subbed = re.sub(p, '', cleaned, flags=re.IGNORECASE).strip()
            if subbed != cleaned and len(subbed) >= 2:
                return subbed

        return cleaned

    @classmethod
    async def resolve_disease(cls, query: str) -> Optional[Dict[str, str]]:
        """Resolves disease name or ID to canonical metadata."""
        extracted = cls.extract_disease_term(query)
        candidates_to_try = [extracted.strip().lower(), query.strip().lower()]

        # 1. Direct ID matching (EFO or MONDO)
        for term in candidates_to_try:
            if term.startswith("efo_") or term.startswith("efo:") or term.startswith("mondo_") or term.startswith("mondo:"):
                canon_id = term.upper().replace(":", "_")
                return {
                    "canonical_id": canon_id,
                    "name": extracted,
                    "efo_id": canon_id if "EFO" in canon_id else None,
                    "mondo_id": canon_id if "MONDO" in canon_id else None
                }

        # 2. Local canonical lookup
        for key, val in CANONICAL_DISEASE_MAPPINGS.items():
            for term in candidates_to_try:
                if key == term or key in term or term in key:
                    return val

        # 2b. Fuzzy match against local canonical mappings using difflib
        for term in candidates_to_try:
            close = difflib.get_close_matches(term, CANONICAL_DISEASE_MAPPINGS.keys(), n=1, cutoff=0.7)
            if close:
                matched_val = CANONICAL_DISEASE_MAPPINGS[close[0]]
                logger.info("Fuzzy matched '%s' -> '%s' (%s)", term, close[0], matched_val["canonical_id"])
                return matched_val

        # 3. Check Neo4j / InMemory graph
        for term in candidates_to_try:
            existing = in_memory_graph.search_nodes(term, label="Disease")
            if existing:
                props = existing[0]["properties"]
                return {
                    "canonical_id": props.get("canonical_id", props.get("efo_id")),
                    "name": props.get("name", extracted),
                    "efo_id": props.get("efo_id"),
                    "mondo_id": props.get("mondo_id")
                }

        # 4. Live query to Open Targets API using extracted term first
        for term in [extracted, query]:
            try:
                hits = await opentargets_client.search_diseases(term, limit=1)
                if hits:
                    top = hits[0]
                    return {
                        "canonical_id": top["id"],
                        "name": top["name"],
                        "efo_id": top["id"] if "EFO" in top["id"] else None,
                        "mondo_id": top["id"] if "MONDO" in top["id"] else None
                    }
            except Exception as e:
                logger.warning("Live disease resolution error for '%s': %s", term, e)

        # 5. Smart NLP Typo Correction via Gemini
        try:
            from app.config import settings
            from google import genai
            gemini_key = settings.GEMINI_API_KEY
            if gemini_key:
                gclient = genai.Client(api_key=gemini_key)
                prompt = (
                    f"Correct any typo and extract the standard medical condition/disease name from: '{extracted}'. "
                    "Output ONLY the corrected single disease name, nothing else. For example: 'tuberoclosis' -> 'Tuberculosis'."
                )
                c_res = await gclient.aio.models.generate_content(
                    model=settings.GEMINI_MODEL,
                    contents=prompt
                )
                corrected_name = (c_res.text or "").strip().strip('"').strip("'")
                if corrected_name and corrected_name.lower() != extracted.lower():
                    logger.info("Gemini corrected disease typo '%s' -> '%s'", extracted, corrected_name)
                    # Check local mappings first
                    for k, v in CANONICAL_DISEASE_MAPPINGS.items():
                        if k == corrected_name.lower() or k in corrected_name.lower():
                            return v
                    # Search Open Targets with corrected name
                    hits = await opentargets_client.search_diseases(corrected_name, limit=1)
                    if hits:
                        top = hits[0]
                        return {
                            "canonical_id": top["id"],
                            "name": top["name"],
                            "efo_id": top["id"] if "EFO" in top["id"] else None,
                            "mondo_id": top["id"] if "MONDO" in top["id"] else None
                        }
        except Exception as ex:
            logger.debug("Gemini typo correction skipped: %s", ex)

        # Fallback to normalized name using extracted term
        norm_id = f"DISEASE_{re.sub(r'[^a-zA-Z0-9]', '_', extracted.strip().lower()).upper()}"
        return {
            "canonical_id": norm_id,
            "name": extracted.strip()
        }

    @classmethod
    async def resolve_drug(cls, query: str) -> Optional[Dict[str, Any]]:
        """Resolves drug name or ChEMBL ID to canonical drug entity."""
        query_clean = query.strip()

        # Check if already a ChEMBL ID
        if query_clean.upper().startswith("CHEMBL"):
            chembl_id = query_clean.upper()
            mol = await chembl_client.get_molecule(chembl_id)
            if mol:
                pref_name = mol.get("pref_name") or chembl_id
                return {
                    "canonical_id": chembl_id,
                    "name": pref_name,
                    "chembl_id": chembl_id,
                    "max_clinical_phase": mol.get("max_phase"),
                    "is_approved": mol.get("max_phase") == 4
                }

        # Search ChEMBL
        molecules = await chembl_client.search_molecules(query_clean, limit=1)
        if molecules:
            top = molecules[0]
            chembl_id = top.get("molecule_chembl_id")
            return {
                "canonical_id": chembl_id,
                "name": top.get("pref_name") or query_clean,
                "chembl_id": chembl_id,
                "max_clinical_phase": top.get("max_phase"),
                "is_approved": top.get("max_phase") == 4
            }

        return {
            "canonical_id": f"DRUG_{re.sub(r'[^a-zA-Z0-9]', '_', query_clean.upper())}",
            "name": query_clean,
            "is_approved": False
        }

    @classmethod
    async def resolve_protein(cls, query: str) -> Optional[Dict[str, Any]]:
        """Resolves gene symbol or UniProt ID to canonical protein metadata."""
        query_clean = query.strip().upper()

        if re.match(r"^[OPQ][0-9][A-Z0-9]{3}[0-9]|[A-NR-Z][0-9]([A-Z][A-Z0-9]{2}[0-9]){1,2}$", query_clean):
            # Valid UniProt Accession
            uniprot_data = await uniprot_client.get_protein_by_accession(query_clean)
            if uniprot_data:
                return uniprot_client.extract_protein_summary(uniprot_data)

        # Search by gene symbol
        results = await uniprot_client.search_protein_by_gene(query_clean)
        if results:
            return uniprot_client.extract_protein_summary(results[0])

        return None
