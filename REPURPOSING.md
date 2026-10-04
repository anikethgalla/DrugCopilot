# Drug Repurposing Engine & Explainable Scoring 🎯📐

## 1. Multi-Strategy Graph Traversal

The Drug Repurposing Engine evaluates candidate molecules using four graph reasoning strategies:

### Strategy 1: Direct Target Overlap
Finds drugs that directly modulate proteins whose corresponding genes have high genetic and omics association scores with the disease.
```cypher
MATCH (d:Disease {canonical_id: $disease_id})
MATCH (g:Gene)-[assoc:ASSOCIATED_WITH]->(d)
MATCH (g)-[:ENCODES]->(p:Protein)
MATCH (drug:Drug)-[tgt:TARGETS]->(p)
RETURN drug, p AS protein, g AS gene, assoc.score AS target_disease_score
```

### Strategy 2: Shared Biological Pathway Co-occurrence
Identifies drugs targeting proteins involved in Reactome biological pathways implicated in disease pathology.
```cypher
MATCH (d:Disease {canonical_id: $disease_id})-[inv:INVOLVES]->(pw:Pathway)
MATCH (p:Protein)-[part:PARTICIPATES_IN]->(pw)
MATCH (drug:Drug)-[tgt:TARGETS]->(p)
RETURN drug, pw AS pathway, p AS protein
```

### Strategy 3: Protein-Protein Interaction (PPI) 2-Hop Proximity
Expands to drugs targeting proteins directly interacting with disease-associated proteins in the interactome.
```cypher
MATCH (d:Disease {canonical_id: $disease_id})<-[:ASSOCIATED_WITH]-(g:Gene)-[:ENCODES]->(p1:Protein)
MATCH (p1)-[:INTERACTS_WITH]-(p2:Protein)<-[:TARGETS]-(drug:Drug)
RETURN drug, p1, p2
```

### Strategy 4: Indication Pivot
Finds drugs sharing target profiles with approved treatments for the disease.

---

## 2. Explainable Scoring Engine

Every candidate score is calculated from real graph metrics using documented mathematical formulas:

$$\text{Overall Score} = \sum_{i} w_i \cdot S_i$$

Where weights $w_i$ sum to $1.0$:
- **Target Association Score ($S_{\text{target}}$)** (30%): $S_{\text{target}} = \text{Open Targets Overall Score} \in [0, 1]$
- **Pathway Overlap Score ($S_{\text{pathway}}$)** (20%): Jaccard similarity of target biological pathways.
- **Network Proximity Score ($S_{\text{network}}$)** (20%): Topological distance in PPI network $S = \frac{1}{1 + \bar{d}}$.
- **Clinical Validation Score ($S_{\text{clinical}}$)** (15%): Phase 4 (1.0), Phase 3 (0.75), Phase 2 (0.50), Phase 1 (0.25) + active clinical trial bonus (+0.10).
- **Literature Citation Score ($S_{\text{pub}}$)** (10%): Logarithmic scaling $S_{\text{pub}} = \min\left(1.0, \frac{\ln(1 + N_{\text{pubs}})}{\ln(11)}\right)$.
- **Genetic Evidence Score ($S_{\text{genetic}}$)** (5%): Open Targets genetic association score (GWAS/L2G).

---

## 3. Evidence Classification Tiers

1. **Established Evidence**: Clinically validated (Phase 3/4) with strong target affinity and multiple peer-reviewed publications.
2. **Strong Computational Evidence**: $\text{Overall Score} \ge 0.70$ with multi-strategy convergence across direct target and pathway overlap.
3. **Moderate Computational Evidence**: $\text{Overall Score} \ge 0.50$ with documented target modulation.
4. **Weak Evidence**: $\text{Overall Score} \ge 0.30$ supported primarily by exploratory pathway co-occurrence.
5. **Hypothesis**: Exploratory multi-hop network connection requiring experimental validation.
