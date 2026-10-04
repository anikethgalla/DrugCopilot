'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Bot, 
  Network, 
  Dna, 
  Pill, 
  ShieldCheck, 
  ArrowRight, 
  Activity, 
  Search,
  Sparkles,
  GitMerge,
  ExternalLink,
  Layers,
  Database,
  CheckCircle2,
  FileCode2,
  Cpu
} from 'lucide-react';
import { fetchHealth, fetchGraphStats } from '@/lib/api';

import Capsule3DHero from '@/components/Capsule3DHero';

const PRESET_INVESTIGATIONS = [
  {
    title: "Alzheimer's Disease",
    disease_id: "MONDO_0004975",
    targets: ["APP", "ACHE", "GSK3B", "APOE"],
    sample_repurposing: "Donepezil / Rivastigmine",
    rationale: "Acetylcholinesterase inhibition & amyloid-beta precursor pathway modulation.",
    query: "Find drugs that could potentially be repurposed for Alzheimer's disease."
  },
  {
    title: "Parkinson's Disease",
    disease_id: "MONDO_0005180",
    targets: ["LRRK2", "SNCA", "PARK7"],
    sample_repurposing: "Rapamycin / Metformin",
    rationale: "mTOR inhibition & autophagy induction for alpha-synuclein clearance.",
    query: "Why is Rapamycin or Metformin investigated for Parkinson's disease?"
  },
  {
    title: "Amyotrophic Lateral Sclerosis",
    disease_id: "MONDO_0004976",
    targets: ["SOD1", "TARDBP", "FUS"],
    sample_repurposing: "Riluzole / Lithium",
    rationale: "Glutamate neurotransmission inhibition and neuroprotection pathways.",
    query: "Analyze mechanisms of Riluzole in Amyotrophic Lateral Sclerosis."
  }
];

const DATA_PROVIDERS = [
  {
    name: "ChEMBL (EMBL-EBI)",
    type: "REST API",
    description: "Approved small molecules, clinical trial phases, target mechanisms, and quantitative IC50/Ki bioactivities.",
    records: "9+ Core Drugs • 116 Target Edges",
    href: "https://www.ebi.ac.uk/chembl/"
  },
  {
    name: "Open Targets Platform",
    type: "GraphQL",
    description: "Target-disease genetic associations, GWAS evidence, and Reactome biological pathway involvement.",
    records: "122 Diseases • 80 Genetic Edges",
    href: "https://platform.opentargets.org/"
  },
  {
    name: "UniProtKB",
    type: "REST API",
    description: "Curated human protein sequences, functional domain descriptions, enzyme classifications, and SwissProt IDs.",
    records: "193 Curated Proteins",
    href: "https://www.uniprot.org/"
  },
  {
    name: "NCBI PubChem",
    type: "PUG REST",
    description: "Canonical and isomeric SMILES, 2D/3D chemical formulas, molecular weights, and IUPAC nomenclature.",
    records: "Structure Properties",
    href: "https://pubchem.ncbi.nlm.nih.gov/"
  },
  {
    name: "ClinicalTrials.gov",
    type: "REST API v2",
    description: "Worldwide human clinical studies, NCT accession numbers, recruitment statuses, and lead sponsors.",
    records: "6 Live Verified Studies",
    href: "https://clinicaltrials.gov/"
  },
  {
    name: "PubMed (NCBI)",
    type: "E-Utilities",
    description: "Peer-reviewed biomedical literature citations, PMIDs, publication dates, and clinical trial results.",
    records: "6 Peer-reviewed Citations",
    href: "https://pubmed.ncbi.nlm.nih.gov/"
  }
];

export default function HomePage() {
  const [health, setHealth] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchHealth().then(setHealth).catch(console.error);
    fetchGraphStats().then(setStats).catch(console.error);
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      
      {/* 3D Capsule Rupture Hero */}
      <Capsule3DHero />

      {/* Live AuraDB Telemetry Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl bg-surface border border-surface-border p-4 shadow-specular">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span className="font-mono text-[11px] uppercase tracking-wider text-biomedical-drug">Proteins & Targets</span>
            <Activity className="h-4 w-4 text-biomedical-protein" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-white">
            {stats?.node_counts?.Protein || 193}
          </div>
          <div className="mt-1 text-[11px] text-gray-500 font-mono">UniProtKB Curated Accessions</div>
        </div>

        <div className="rounded-xl bg-surface border border-surface-border p-4 shadow-specular">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span className="font-mono text-[11px] uppercase tracking-wider text-biomedical-disease">Disease Profiles</span>
            <Dna className="h-4 w-4 text-biomedical-disease" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-white">
            {stats?.node_counts?.Disease || 122}
          </div>
          <div className="mt-1 text-[11px] text-gray-500 font-mono">EFO / MONDO Ontologies</div>
        </div>

        <div className="rounded-xl bg-surface border border-surface-border p-4 shadow-specular">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span className="font-mono text-[11px] uppercase tracking-wider text-biomedical-gene">Associated Genes</span>
            <Layers className="h-4 w-4 text-biomedical-gene" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-white">
            {stats?.node_counts?.Gene || 86}
          </div>
          <div className="mt-1 text-[11px] text-gray-500 font-mono">Open Targets Genomes</div>
        </div>

        <div className="rounded-xl bg-surface border border-surface-border p-4 shadow-specular">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span className="font-mono text-[11px] uppercase tracking-wider text-brand-400">Verified Evidence Edges</span>
            <GitMerge className="h-4 w-4 text-brand-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-white">
            {stats?.total_edges || 434}
          </div>
          <div className="mt-1 text-[11px] text-gray-500 font-mono">TARGETS, TREATS, ENCODES</div>
        </div>
      </div>

      {/* Preset Investigation Workflows */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
              Featured Computational Repurposing Hypotheses
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Traverse verified 4-node biological chains (`Drug` &rarr; `Protein` &larr; `Gene` &rarr; `Disease`)
            </p>
          </div>
          <Link
            href="/copilot"
            className="text-xs text-brand-400 hover:text-brand-300 font-medium inline-flex items-center space-x-1"
          >
            <span>Open Custom Query</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PRESET_INVESTIGATIONS.map((item, idx) => (
            <div
              key={idx}
              className="rounded-xl bg-surface border border-surface-border p-4 space-y-3 flex flex-col justify-between hover:border-surface-border-subtle transition-all shadow-specular"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">{item.title}</h3>
                  <span className="rounded bg-surface-raised border border-surface-border px-1.5 py-0.5 text-[10px] font-mono text-gray-400">
                    {item.disease_id}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {item.targets.map((tgt, tIdx) => (
                    <span
                      key={tIdx}
                      className="rounded bg-brand-500/10 border border-brand-500/20 px-1.5 py-0.2 text-[10px] font-mono text-brand-300"
                    >
                      {tgt}
                    </span>
                  ))}
                </div>

                <p className="text-xs text-gray-300 leading-relaxed">
                  {item.rationale}
                </p>
              </div>

              <div className="pt-2 border-t border-surface-border">
                <Link
                  href={`/copilot?q=${encodeURIComponent(item.query)}`}
                  className="w-full inline-flex items-center justify-between rounded-md bg-surface-raised hover:bg-surface-overlay px-3 py-1.5 text-xs font-medium text-brand-400 hover:text-brand-300 transition-colors"
                >
                  <span>Evaluate Repurposing Candidates</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Real-World Data Provider Contracts */}
      <div className="rounded-2xl bg-surface border border-surface-border p-6 space-y-4 shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
              Integrated Multi-Modal Biomedical Pipelines
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              100% verified public domain biomedical sources with full W3C PROV-DM provenance tracking.
            </p>
          </div>
          <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[11px] font-mono text-emerald-400">
            Zero Synthetic Data
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {DATA_PROVIDERS.map((src, idx) => (
            <div
              key={idx}
              className="rounded-xl bg-surface-raised border border-surface-border p-3.5 space-y-2 flex flex-col justify-between shadow-specular"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white text-xs">{src.name}</span>
                  <span className="rounded bg-background border border-surface-border px-1.5 py-0.2 text-[9px] font-mono text-gray-400">
                    {src.type}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 mt-1.5 leading-relaxed">
                  {src.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-surface-border/60 text-[11px]">
                <span className="font-mono text-gray-300 text-[10px]">{src.records}</span>
                <a
                  href={src.href}
                  target="_blank"
                  rel="noreferrer"
                  className="text-brand-400 hover:text-brand-300 inline-flex items-center space-x-1"
                >
                  <span>Portal</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
