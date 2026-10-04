import pytest
from app.repurposing.scoring import RepurposingScorer
from app.models.repurposing import EvidenceClassification


def test_scoring_weights_sum_to_one():
    weights = RepurposingScorer.WEIGHTS
    total = sum(weights.values())
    assert abs(total - 1.0) < 1e-6


def test_score_calculation_boundary_conditions():
    # Test zero scores
    overall_zero, breakdown_zero, class_zero = RepurposingScorer.calculate_score_breakdown(
        target_score=0.0,
        pathway_score=0.0,
        network_score=0.0,
        clinical_phase=0,
        has_trials=False,
        publication_count=0,
        genetic_association_score=0.0
    )
    assert 0.0 <= overall_zero <= 1.0
    assert breakdown_zero.target_association == 0.0
    assert breakdown_zero.publication_evidence == 0.0

    # Test maximal scores
    overall_max, breakdown_max, class_max = RepurposingScorer.calculate_score_breakdown(
        target_score=1.0,
        pathway_score=1.0,
        network_score=1.0,
        clinical_phase=4,
        has_trials=True,
        publication_count=15,
        genetic_association_score=1.0
    )
    assert overall_max == 1.0
    assert breakdown_max.target_association == 1.0
    assert breakdown_max.pathway_overlap == 1.0
    assert class_max == EvidenceClassification.ESTABLISHED


def test_score_calculation_details_formula_documented():
    _, breakdown, _ = RepurposingScorer.calculate_score_breakdown(
        target_score=0.84,
        pathway_score=0.71,
        network_score=0.82,
        clinical_phase=2,
        has_trials=True,
        publication_count=5,
        genetic_association_score=0.65
    )
    assert "target_association" in breakdown.calculation_details
    assert "overall_formula" in breakdown.calculation_details
    assert "weight 30%" in breakdown.calculation_details["target_association"]
