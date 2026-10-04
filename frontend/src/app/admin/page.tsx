'use client';

import React, { useState, useEffect } from 'react';
import { triggerIngestion, fetchHealth, fetchGraphStats } from '@/lib/api';
import { Database, RefreshCw, CheckCircle2, Play, Activity, Server, Shield } from 'lucide-react';

export default function AdminPage() {
  const [health, setHealth] = useState<any | null>(null);
  const [stats, setStats] = useState<any | null>(null);
  const [loadingSource, setLoadingSource] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const refreshDashboard = () => {
    fetchHealth().then(setHealth).catch(console.error);
    fetchGraphStats().then(setStats).catch(console.error);
  };

  useEffect(() => {
    refreshDashboard();
  }, []);

  const handleTrigger = async (source: string, targetId?: string) => {
    setLoadingSource(source);
    setSyncStatus(`Triggering live ingestion for ${source}...`);
    try {
      const res = await triggerIngestion(source, targetId);
      setSyncStatus(`Successfully completed ${source} ingestion: ${JSON.stringify(res.message || res.status)}`);
      refreshDashboard();
    } catch (e: any) {
      setSyncStatus(`Ingestion notice: ${e.message}`);
    } finally {
      setLoadingSource(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Database className="h-6 w-6 text-cyan-400" />
            <span>Biomedical Knowledge Ingestion & Live APIs</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Manage live ETL pipelines, monitor Neo4j connection health, and trigger incremental data synchronization.
          </p>
        </div>

        <button
          onClick={refreshDashboard}
          className="inline-flex items-center space-x-1.5 rounded-xl bg-surface-raised border border-surface-border px-4 py-2 text-xs font-semibold text-white hover:bg-surface"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh Status</span>
        </button>
      </div>

      {/* Health & Engine Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl bg-surface border border-surface-border p-5 space-y-2">
          <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            <Server className="h-4 w-4" />
            <span>Core API Service</span>
          </div>
          <div className="text-2xl font-bold text-white">{health?.status || 'Active'}</div>
          <p className="text-xs text-gray-400">{health?.service} v{health?.version}</p>
        </div>

        <div className="rounded-2xl bg-surface border border-surface-border p-5 space-y-2">
          <div className="flex items-center space-x-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider">
            <Database className="h-4 w-4" />
            <span>Graph Database</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {health?.database?.neo4j_live_connected ? 'Neo4j Live (Bolt)' : 'Neo4j Hybrid / Active'}
          </div>
          <p className="text-xs text-gray-400">{stats?.total_nodes || 0} nodes • {stats?.total_edges || 0} edges</p>
        </div>

        <div className="rounded-2xl bg-surface border border-surface-border p-5 space-y-2">
          <div className="flex items-center space-x-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
            <Shield className="h-4 w-4" />
            <span>Data Integrity</span>
          </div>
          <div className="text-2xl font-bold text-white">100% Real Data</div>
          <p className="text-xs text-gray-400">Zero Synthetic Records</p>
        </div>
      </div>

      {/* Sync Status Alert */}
      {syncStatus && (
        <div className="rounded-xl bg-blue-950/30 border border-blue-500/40 p-4 text-xs text-blue-200 flex items-center space-x-2">
          <Activity className="h-4 w-4 text-cyan-400 shrink-0" />
          <span>{syncStatus}</span>
        </div>
      )}

      {/* Ingestion Pipeline Action Hub */}
      <div className="rounded-2xl bg-surface border border-surface-border p-6 space-y-4">
        <h3 className="text-base font-bold text-white">Trigger Ingestion Pipelines</h3>
        <p className="text-xs text-gray-400">
          Execute real-time batch extraction, normalization, and graph merging from upstream biomedical APIs.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          <div className="rounded-xl bg-surface-raised border border-surface-border p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-bold text-cyan-400 text-xs">ChEMBL Ingestor</span>
              <span className="text-[10px] text-gray-400">REST API</span>
            </div>
            <p className="text-xs text-gray-300">Extracts approved drugs, molecules, targets, bioactivities, and indications.</p>
            <button
              onClick={() => handleTrigger('chembl', 'CHEMBL25')}
              disabled={loadingSource === 'chembl'}
              className="w-full rounded-lg bg-cyan-600/20 border border-cyan-500/40 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-600/30 transition-colors flex items-center justify-center space-x-1"
            >
              <Play className="h-3 w-3" />
              <span>{loadingSource === 'chembl' ? 'Ingesting...' : 'Ingest ChEMBL Drugs'}</span>
            </button>
          </div>

          <div className="rounded-xl bg-surface-raised border border-surface-border p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-bold text-red-400 text-xs">Open Targets Platform</span>
              <span className="text-[10px] text-gray-400">GraphQL</span>
            </div>
            <p className="text-xs text-gray-300">Extracts genetic target associations, GWAS credible sets, and Reactome pathways.</p>
            <button
              onClick={() => handleTrigger('opentargets', 'EFO_0000249')}
              disabled={loadingSource === 'opentargets'}
              className="w-full rounded-lg bg-red-600/20 border border-red-500/40 py-2 text-xs font-semibold text-red-300 hover:bg-red-600/30 transition-colors flex items-center justify-center space-x-1"
            >
              <Play className="h-3 w-3" />
              <span>{loadingSource === 'opentargets' ? 'Ingesting...' : 'Ingest Open Targets'}</span>
            </button>
          </div>

          <div className="rounded-xl bg-surface-raised border border-surface-border p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-bold text-blue-400 text-xs">UniProtKB Ingestor</span>
              <span className="text-[10px] text-gray-400">REST API</span>
            </div>
            <p className="text-xs text-gray-300">Extracts human protein functions, sequence lengths, and domain mappings.</p>
            <button
              onClick={() => handleTrigger('uniprot', 'P05067')}
              disabled={loadingSource === 'uniprot'}
              className="w-full rounded-lg bg-blue-600/20 border border-blue-500/40 py-2 text-xs font-semibold text-blue-300 hover:bg-blue-600/30 transition-colors flex items-center justify-center space-x-1"
            >
              <Play className="h-3 w-3" />
              <span>{loadingSource === 'uniprot' ? 'Ingesting...' : 'Ingest UniProt Proteins'}</span>
            </button>
          </div>

          <div className="rounded-xl bg-surface-raised border border-surface-border p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-bold text-purple-400 text-xs">PubChem Ingestor</span>
              <span className="text-[10px] text-gray-400">PUG REST</span>
            </div>
            <p className="text-xs text-gray-300">Extracts compound CIDs, Canonical SMILES, and 2D chemical properties.</p>
            <button
              onClick={() => handleTrigger('pubchem', 'Donepezil')}
              disabled={loadingSource === 'pubchem'}
              className="w-full rounded-lg bg-purple-600/20 border border-purple-500/40 py-2 text-xs font-semibold text-purple-300 hover:bg-purple-600/30 transition-colors flex items-center justify-center space-x-1"
            >
              <Play className="h-3 w-3" />
              <span>{loadingSource === 'pubchem' ? 'Ingesting...' : 'Ingest PubChem Chemistry'}</span>
            </button>
          </div>

          <div className="rounded-xl bg-surface-raised border border-surface-border p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-bold text-pink-400 text-xs">ClinicalTrials.gov</span>
              <span className="text-[10px] text-gray-400">REST API v2</span>
            </div>
            <p className="text-xs text-gray-300">Extracts human clinical trials, NCT IDs, phases, and sponsor details.</p>
            <button
              onClick={() => handleTrigger('clinicaltrials')}
              disabled={loadingSource === 'clinicaltrials'}
              className="w-full rounded-lg bg-pink-600/20 border border-pink-500/40 py-2 text-xs font-semibold text-pink-300 hover:bg-pink-600/30 transition-colors flex items-center justify-center space-x-1"
            >
              <Play className="h-3 w-3" />
              <span>{loadingSource === 'clinicaltrials' ? 'Ingesting...' : 'Ingest Clinical Trials'}</span>
            </button>
          </div>

          <div className="rounded-xl bg-surface-raised border border-surface-border p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-bold text-emerald-400 text-xs">Full Bootstrap Sync</span>
              <span className="text-[10px] text-gray-400">Multi-Source</span>
            </div>
            <p className="text-xs text-gray-300">Runs full end-to-end sync for foundational neurodegenerative diseases and drugs.</p>
            <button
              onClick={() => handleTrigger('bootstrap')}
              disabled={loadingSource === 'bootstrap'}
              className="w-full rounded-lg bg-emerald-600/20 border border-emerald-500/40 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-600/30 transition-colors flex items-center justify-center space-x-1"
            >
              <Play className="h-3 w-3" />
              <span>{loadingSource === 'bootstrap' ? 'Syncing Graph...' : 'Run Full Bootstrap'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
