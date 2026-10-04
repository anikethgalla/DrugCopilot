'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Bot, 
  Network, 
  Dna, 
  Pill, 
  FlaskConical, 
  ShieldCheck, 
  ArrowRight, 
  Activity, 
  Search,
  Sparkles,
  GitMerge,
  FileCheck2
} from 'lucide-react';
import { fetchHealth, fetchGraphStats } from '@/lib/api';

export default function HomePage() {
  const [health, setHealth] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchHealth().then(setHealth).catch(console.error);
    fetchGraphStats().then(setStats).catch(console.error);
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-12">
      {/* Hero Section */}
      <div className="relative rounded-3xl bg-gradient-to-b from-blue-950/40 via-surface to-background border border-blue-500/20 p-8 sm:p-12 overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center space-x-2 rounded-full bg-blue-500/10 border border-blue-500/30 px-3 py-1 text-xs font-medium text-blue-300">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>Next-Gen Biomedical AI & Graph Reasoning</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Accelerate Drug Repurposing with <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Real Biomedical Evidence</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-300 leading-relaxed">
            Discover novel therapeutic indications using a live Neo4j knowledge graph powered by official public biomedical APIs: <strong>ChEMBL</strong>, <strong>Open Targets Platform</strong>, <strong>UniProt</strong>, <strong>PubChem</strong>, <strong>ClinicalTrials.gov</strong>, and <strong>PubMed</strong>.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-3">
            <Link
              href="/copilot"
              className="inline-flex items-center space-x-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition-all"
            >
              <Bot className="h-5 w-5" />
              <span>Launch AI Copilot</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/explore"
              className="inline-flex items-center space-x-2 rounded-xl bg-surface-raised border border-surface-border px-6 py-3.5 text-sm font-semibold text-gray-200 hover:bg-surface hover:text-white transition-all"
            >
              <Network className="h-5 w-5 text-cyan-400" />
              <span>Explore Knowledge Graph</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Real-time Knowledge Graph Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-surface border border-surface-border p-5">
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            <Pill className="h-4 w-4" />
            <span>Repurposing Drugs</span>
          </div>
          <div className="mt-2 text-3xl font-black text-white">
            {stats?.node_counts?.Drug || '15+'}
          </div>
          <p className="mt-1 text-xs text-gray-400">Canonical ChEMBL molecules</p>
        </div>

        <div className="rounded-2xl bg-surface border border-surface-border p-5">
          <div className="flex items-center space-x-2 text-red-400 text-xs font-semibold uppercase tracking-wider">
            <Dna className="h-4 w-4" />
            <span>Disease Profiles</span>
          </div>
          <div className="mt-2 text-3xl font-black text-white">
            {stats?.node_counts?.Disease || '10+'}
          </div>
          <p className="mt-1 text-xs text-gray-400">EFO / MONDO mapped ontologies</p>
        </div>

        <div className="rounded-2xl bg-surface border border-surface-border p-5">
          <div className="flex items-center space-x-2 text-blue-400 text-xs font-semibold uppercase tracking-wider">
            <Activity className="h-4 w-4" />
            <span>Proteins & Genes</span>
          </div>
          <div className="mt-2 text-3xl font-black text-white">
            {(stats?.node_counts?.Protein || 0) + (stats?.node_counts?.Gene || 0) || '40+'}
          </div>
          <p className="mt-1 text-xs text-gray-400">UniProt & Ensembl targets</p>
        </div>

        <div className="rounded-2xl bg-surface border border-surface-border p-5">
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <GitMerge className="h-4 w-4" />
            <span>Biomedical Relationships</span>
          </div>
          <div className="mt-2 text-3xl font-black text-white">
            {stats?.total_edges || '120+'}
          </div>
          <p className="mt-1 text-xs text-gray-400">Verified evidence edges</p>
        </div>
      </div>

      {/* Feature Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl bg-surface border border-surface-border p-6 space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Zero Synthetic Data</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            All drug targets, bioactivities, clinical phases, genetic associations, and literature citations originate from real public biomedical databases with complete provenance.
          </p>
        </div>

        <div className="rounded-2xl bg-surface border border-surface-border p-6 space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Network className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Multi-Strategy Graph Reasoning</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Traverse direct target overlap, shared biological pathways (Reactome), PPI 2-hop network proximity, and indication pivots with transparent scoring algorithms.
          </p>
        </div>

        <div className="rounded-2xl bg-surface border border-surface-border p-6 space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Bot className="h-5 w-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Interactive Copilot Workspace</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Pair an AI assistant with an interactive Cytoscape knowledge graph and granular evidence drawer to inspect biological chains and scientific limitations.
          </p>
        </div>
      </div>
    </div>
  );
}
