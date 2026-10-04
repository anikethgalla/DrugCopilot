from typing import Any, Dict, List
from app.models.repurposing import BiologicalPath, BiologicalPathStep, EvidenceItem


class BiologicalExplanationBuilder:
    """Constructs rigorous biological mechanism paths, evidence items, and limitation disclosures."""

    @staticmethod
    def build_direct_target_path(
        disease_name: str,
        disease_id: str,
        gene_symbol: str,
        gene_id: str,
        protein_name: str,
        uniprot_id: str,
        drug_name: str,
        drug_id: str
    ) -> BiologicalPath:
        steps = [
            BiologicalPathStep(
                node_type="Disease",
                node_id=disease_id,
                node_name=disease_name,
                relation_to_next="ASSOCIATED_WITH"
            ),
            BiologicalPathStep(
                node_type="Gene",
                node_id=gene_id,
                node_name=gene_symbol,
                relation_to_next="ENCODES"
            ),
            BiologicalPathStep(
                node_type="Protein",
                node_id=uniprot_id,
                node_name=protein_name,
                relation_to_next="TARGETED_BY"
            ),
            BiologicalPathStep(
                node_type="Drug",
                node_id=drug_id,
                node_name=drug_name,
                relation_to_next=None
            )
        ]
        return BiologicalPath(
            strategy="Direct Target Overlap",
            description=f"{drug_name} directly inhibits/modulates {protein_name} ({gene_symbol}), which is genetically and clinically associated with {disease_name}.",
            steps=steps
        )

    @staticmethod
    def build_pathway_path(
        disease_name: str,
        disease_id: str,
        pathway_name: str,
        pathway_id: str,
        protein_name: str,
        uniprot_id: str,
        drug_name: str,
        drug_id: str
    ) -> BiologicalPath:
        steps = [
            BiologicalPathStep(
                node_type="Disease",
                node_id=disease_id,
                node_name=disease_name,
                relation_to_next="INVOLVES"
            ),
            BiologicalPathStep(
                node_type="Pathway",
                node_id=pathway_id,
                node_name=pathway_name,
                relation_to_next="PARTICIPATES_IN"
            ),
            BiologicalPathStep(
                node_type="Protein",
                node_id=uniprot_id,
                node_name=protein_name,
                relation_to_next="TARGETED_BY"
            ),
            BiologicalPathStep(
                node_type="Drug",
                node_id=drug_id,
                node_name=drug_name,
                relation_to_next=None
            )
        ]
        return BiologicalPath(
            strategy="Pathway Co-occurrence",
            description=f"{drug_name} modulates {protein_name}, a key participant in the '{pathway_name}' pathway implicated in {disease_name} pathology.",
            steps=steps
        )

    @staticmethod
    def generate_limitations(
        drug_name: str,
        disease_name: str,
        is_approved: bool,
        clinical_phase: int,
        has_trials: bool
    ) -> List[str]:
        """Synthesizes clinical and pharmacokinetic limitations transparently."""
        limits = []
        if not is_approved:
            limits.append(f"{drug_name} is currently an investigational molecule (Phase {clinical_phase}) and is not FDA/EMA approved for any indication.")
        else:
            limits.append(f"{drug_name} is approved for other clinical indications; dosage, efficacy, and safety profile in {disease_name} remain unestablished.")

        if not has_trials:
            limits.append(f"No direct registered clinical trials currently link {drug_name} to {disease_name} on ClinicalTrials.gov.")

        limits.append("Computational target binding affinity and pathway overlap do not guarantee in vivo disease modification or blood-tissue barrier penetration.")
        return limits
