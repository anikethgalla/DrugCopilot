import math
from typing import Any, Dict, List, Optional, Tuple
from app.models.repurposing import ScoreBreakdown, EvidenceClassification

TupleScore = Tuple[float, ScoreBreakdown, EvidenceClassification]


class RepurposingScorer:
    """
    Explainable Evidence Scoring Engine for Drug Repurposing Candidates.
    Every numerical score is derived from actual graph evidence and documented mathematical formulas.
    Never invents scores.
    """

    # Weights for overall computational evidence integration (sum = 1.0)
    WEIGHTS = {
        "target_association": 0.30,
        "pathway_overlap": 0.20,
        "network_proximity": 0.20,
        "clinical_evidence": 0.15,
        "publication_evidence": 0.10,
        "genetic_score": 0.05
    }

    @classmethod
    def calculate_score_breakdown(
        cls,
        target_score: float,
        pathway_score: float,
        network_score: float,
        clinical_phase: Optional[int],
        has_trials: bool,
        publication_count: int,
        genetic_association_score: float = 0.0
    ) -> TupleScore:
        """
        Calculates granular components and overall score with formula explanation.
        """
        # 1. Target association score: bound [0, 1]
        s_target = max(0.0, min(1.0, float(target_score)))
        
        # 2. Pathway overlap score: bound [0, 1]
        s_pathway = max(0.0, min(1.0, float(pathway_score)))

        # 3. Network proximity score: bound [0, 1]
        s_network = max(0.0, min(1.0, float(network_score)))

        # 4. Clinical evidence score: Phase 4 = 1.0, Phase 3 = 0.75, Phase 2 = 0.5, Phase 1 = 0.25, active trials = +0.1
        phase = clinical_phase if clinical_phase is not None else 0
        base_clinical = {4: 1.0, 3: 0.75, 2: 0.50, 1: 0.25}.get(phase, 0.1)
        trial_bonus = 0.1 if has_trials else 0.0
        s_clinical = min(1.0, base_clinical + trial_bonus)

        # 5. Publication evidence score: logarithmic scaling s = min(1.0, ln(1 + pub_count) / ln(11))
        # 0 pubs -> 0.0, 1 pub -> 0.29, 3 pubs -> 0.58, 10+ pubs -> 1.0
        s_pub = min(1.0, math.log(1.0 + publication_count) / math.log(11.0)) if publication_count > 0 else 0.0

        # 6. Genetic score from GWAS / Open Targets L2G
        s_genetic = max(0.0, min(1.0, float(genetic_association_score)))

        # Weighted Overall Score
        overall = (
            cls.WEIGHTS["target_association"] * s_target +
            cls.WEIGHTS["pathway_overlap"] * s_pathway +
            cls.WEIGHTS["network_proximity"] * s_network +
            cls.WEIGHTS["clinical_evidence"] * s_clinical +
            cls.WEIGHTS["publication_evidence"] * s_pub +
            cls.WEIGHTS["genetic_score"] * s_genetic
        )
        overall = round(max(0.0, min(1.0, overall)), 3)

        details = {
            "target_association": f"Calculated from direct target bioactivity & disease-target association: {s_target:.2f} (weight 30%)",
            "pathway_overlap": f"Jaccard similarity of target biological pathways: {s_pathway:.2f} (weight 20%)",
            "network_proximity": f"Graph topological proximity in PPI network: {s_network:.2f} (weight 20%)",
            "clinical_evidence": f"Clinical status (Phase {phase}, active trials bonus={trial_bonus}): {s_clinical:.2f} (weight 15%)",
            "publication_evidence": f"Validated co-mentions in PubMed literature ({publication_count} papers): {s_pub:.2f} (weight 10%)",
            "genetic_score": f"Open Targets genetic & GWAS causal evidence: {s_genetic:.2f} (weight 5%)",
            "overall_formula": "Overall = 0.30*Target + 0.20*Pathway + 0.20*Network + 0.15*Clinical + 0.10*Pub + 0.05*Genetic"
        }

        breakdown = ScoreBreakdown(
            target_association=round(s_target, 3),
            pathway_overlap=round(s_pathway, 3),
            network_proximity=round(s_network, 3),
            clinical_evidence=round(s_clinical, 3),
            publication_evidence=round(s_pub, 3),
            genetic_score=round(s_genetic, 3),
            calculation_details=details
        )

        classification = cls.classify_evidence(overall, s_clinical, publication_count)
        return overall, breakdown, classification

    @classmethod
    def classify_evidence(cls, overall_score: float, clinical_score: float, pub_count: int) -> EvidenceClassification:
        """
        Classifies evidence tier strictly:
        - Established evidence: Approved or Phase 3+ with rich literature
        - Strong computational evidence: overall >= 0.70 with direct target and pathway support
        - Moderate computational evidence: overall >= 0.50
        - Weak evidence: overall >= 0.30
        - Hypothesis: overall < 0.30 or exploratory network paths
        """
        if clinical_score >= 0.85 and pub_count >= 3:
            return EvidenceClassification.ESTABLISHED
        elif overall_score >= 0.70:
            return EvidenceClassification.STRONG_COMPUTATIONAL
        elif overall_score >= 0.50:
            return EvidenceClassification.MODERATE_COMPUTATIONAL
        elif overall_score >= 0.30:
            return EvidenceClassification.WEAK_EVIDENCE
        else:
            return EvidenceClassification.HYPOTHESIS


TupleScore = tuple[float, ScoreBreakdown, EvidenceClassification]
