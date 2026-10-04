'use client';

import React, { useState, useEffect } from 'react';
import { fetchEvidenceSummary } from '@/lib/api';
import { FileCheck2, Database, ShieldCheck, CheckCircle2, Layers, ExternalLink, GitBranch, Cpu } from 'lucide-react';

export default function EvidencePage() {
  const [summary, setSummary] = useState<any | null>(null);

  useEffect(() => {
    fetchEvidenceSummary().then(setSummary).catch(console.error);
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
          <FileCheck2 className="h-5 w-5 text-emerald-400" />
          <span>Biomedical Provenance & Scoring Architecture</span>
        </h1>
        <p className="text-xs text-gray-400 mt-0.5">
          Every entity, relationship, and computational repurposing score is backed by verifiable provenance records from official upstream databases.
        </p>
      </div>

      {/* Architectural Standards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl bg-surface border border-surface-border p-4 space-y-2 shadow-card">
          <div className="flex items-center space-x-2 text-xs font-semibold text-brand-400 font-mono">
            <Database className="h-4 w-4" />
            <span>W3C PROV-DM ALIGNMENT</span>
          </div>
          <h3 className="text-sm font-bold text-white">Full Provenance Attributes</h3>
          <p className="text-xs text-gray-300 leading-relaxed font-sans">
            Every edge in the Neo4j graph retains <code>source</code>, <code>source_id</code>, <code>retrieved_at</code>, <code>confidence</code>, and <code>source_url</code>.
          </p>
        </div>

        <div className="rounded-xl bg-surface border border-surface-border p-4 space-y-2 shadow-card">
          <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400 font-mono">
            <ShieldCheck className="h-4 w-4" />
            <span>CANONICAL RESOLUTION</span>
          </div>
          <h3 className="text-sm font-bold text-white">Zero Identity Collisions</h3>
          <p className="text-xs text-gray-300 leading-relaxed font-sans">
            Synonym resolution maps entities to ChEMBL IDs, UniProtKB SwissProt accessions, Ensembl IDs, and EFO/MONDO terms with strict uniqueness constraints.
          </p>
        </div>

        <div className="rounded-xl bg-surface border border-surface-border p-4 space-y-2 shadow-card">
          <div className="flex items-center space-x-2 text-xs font-semibold text-biomedical-target font-mono">
            <GitBranch className="h-4 w-4" />
            <span>EXPLAINABLE SCORING</span>
          </div>
          <h3 className="text-sm font-bold text-white">Transparent Formula Derivation</h3>
          <p className="text-xs text-gray-300 leading-relaxed font-sans">
            Scores combine target association (30%), pathway overlap (20%), network proximity (20%), clinical phase (15%), and PubMed literature (10%).
          </p>
        </div>
      </div>

      {/* Upstream Biomedical Integrations */}
      <div className="rounded-2xl bg-surface border border-surface-border p-5 space-y-4 shadow-card">
        <div className="flex items-center justify-between pb-2 border-b border-surface-border">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Integrated Real-World Biomedical Data Sources
          </h2>
          <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-mono text-emerald-400">
            100% Real Public Data
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="rounded-lg bg-surface-raised border border-surface-border p-3.5 space-y-1.5 shadow-specular">
            <div className="flex items-center justify-between">
              <span className="font-bold text-biomedical-drug text-xs">ChEMBL (EMBL-EBI)</span>
              <span className="rounded bg-background border border-surface-border px-1.5 py-0.2 text-[9px] font-mono text-gray-400">REST API</span>
            </div>
            <p className="text-[11px] text-gray-300 leading-relaxed">
              Approved drugs, small molecules, mechanisms of action, target bioactivities (IC50/Ki), clinical indications.
            </p>
            <a href="https://www.ebi.ac.uk/chembl/" target="_blank" rel="noreferrer" className="text-brand-400 hover:text-brand-300 text-[10px] font-mono inline-flex items-center space-x-1 pt-1">
              <span>chembl.ebi.ac.uk</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>

          <div className="rounded-lg bg-surface-raised border border-surface-border p-3.5 space-y-1.5 shadow-specular">
            <div className="flex items-center justify-between">
              <span className="font-bold text-biomedical-disease text-xs">Open Targets Platform</span>
              <span className="rounded bg-background border border-surface-border px-1.5 py-0.2 text-[9px] font-mono text-gray-400">GraphQL</span>
            </div>
            <p className="text-[11px] text-gray-300 leading-relaxed">
              Target-disease genetic associations, GWAS credible sets, L2G causal predictions, Reactome biological pathways.
            </p>
            <a href="https://platform.opentargets.org/" target="_blank" rel="noreferrer" className="text-brand-400 hover:text-brand-300 text-[10px] font-mono inline-flex items-center space-x-1 pt-1">
              <span>platform.opentargets.org</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>

          <div className="rounded-lg bg-surface-raised border border-surface-border p-3.5 space-y-1.5 shadow-specular">
            <div className="flex items-center justify-between">
              <span className="font-bold text-biomedical-protein text-xs">UniProtKB (UniProt)</span>
              <span className="rounded bg-background border border-surface-border px-1.5 py-0.2 text-[9px] font-mono text-gray-400">REST API</span>
            </div>
            <p className="text-[11px] text-gray-300 leading-relaxed">
              Curated human protein sequences, functional domain descriptions, enzyme classifications, SwissProt accessions.
            </p>
            <a href="https://www.uniprot.org/" target="_blank" rel="noreferrer" className="text-brand-400 hover:text-brand-300 text-[10px] font-mono inline-flex items-center space-x-1 pt-1">
              <span>uniprot.org</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>

          <div className="rounded-lg bg-surface-raised border border-surface-border p-3.5 space-y-1.5 shadow-specular">
            <div className="flex items-center justify-between">
              <span className="font-bold text-biomedical-target text-xs">NCBI PubChem</span>
              <span className="rounded bg-background border border-surface-border px-1.5 py-0.2 text-[9px] font-mono text-gray-400">PUG REST</span>
            </div>
            <p className="text-[11px] text-gray-300 leading-relaxed">
              Compound CIDs, Canonical and Isomeric SMILES, molecular formulas, molecular weights, IUPAC names.
            </p>
            <a href="https://pubchem.ncbi.nlm.nih.gov/" target="_blank" rel="noreferrer" className="text-brand-400 hover:text-brand-300 text-[10px] font-mono inline-flex items-center space-x-1 pt-1">
              <span>pubchem.ncbi.nlm.nih.gov</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>

          <div className="rounded-lg bg-surface-raised border border-surface-border p-3.5 space-y-1.5 shadow-specular">
            <div className="flex items-center justify-between">
              <span className="font-bold text-biomedical-trial text-xs">ClinicalTrials.gov (NLM/NIH)</span>
              <span className="rounded bg-background border border-surface-border px-1.5 py-0.2 text-[9px] font-mono text-gray-400">REST v2</span>
            </div>
            <p className="text-[11px] text-gray-300 leading-relaxed">
              Worldwide clinical studies, NCT identifiers, clinical phases (1-4), recruitment status, and sponsor portfolios.
            </p>
            <a href="https://clinicaltrials.gov/" target="_blank" rel="noreferrer" className="text-brand-400 hover:text-brand-300 text-[10px] font-mono inline-flex items-center space-x-1 pt-1">
              <span>clinicaltrials.gov</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>

          <div className="rounded-lg bg-surface-raised border border-surface-border p-3.5 space-y-1.5 shadow-specular">
            <div className="flex items-center justify-between">
              <span className="font-bold text-biomedical-gene text-xs">PubMed / NCBI E-Utilities</span>
              <span className="rounded bg-background border border-surface-border px-1.5 py-0.2 text-[9px] font-mono text-gray-400">E-Utils</span>
            </div>
            <p className="text-[11px] text-gray-300 leading-relaxed">
              Peer-reviewed biomedical literature citations, PMIDs, journal metrics, abstracts, and published clinical trials.
            </p>
            <a href="https://pubmed.ncbi.nlm.nih.gov/" target="_blank" rel="noreferrer" className="text-brand-400 hover:text-brand-300 text-[10px] font-mono inline-flex items-center space-x-1 pt-1">
              <span>pubmed.ncbi.nlm.nih.gov</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
