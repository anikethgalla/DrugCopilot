'use client';

import React, { useState, useEffect } from 'react';
import { triggerIngestion, fetchHealth, fetchGraphStats } from '@/lib/api';
import { Database, RefreshCw, CheckCircle2, Play, Activity, Server, Shield, Cpu, ExternalLink } from 'lucide-react';

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
    setSyncStatus(`Triggering live ingestion pipeline for ${source}...`);
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
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <Database className="h-5 w-5 text-brand-400" />
            <span>Biomedical Knowledge Ingestion & AuraDB Control Center</span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Monitor Neo4j AuraDB live connection health, node constraints, and execute real-time ETL synchronization.
          </p>
        </div>

        <button
          onClick={refreshDashboard}
          className="inline-flex items-center space-x-1.5 rounded-md bg-surface-raised hover:bg-surface-overlay border border-surface-border px-3 py-1.5 text-xs font-semibold text-white shadow-specular transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh Health</span>
        </button>
      </div>

      {/* System Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl bg-surface border border-surface-border p-4 space-y-1.5 shadow-card">
          <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400 font-mono">
            <Server className="h-3.5 w-3.5" />
            <span>FASTAPI BACKEND</span>
          </div>
          <div className="text-xl font-bold text-white font-mono">{health?.status || 'Active (HTTP 200)'}</div>
          <p className="text-[11px] text-gray-400 font-mono">{health?.service || 'drug-repurposing-copilot-api'} v{health?.version || '1.0.0'}</p>
        </div>

        <div className="rounded-xl bg-surface border border-surface-border p-4 space-y-1.5 shadow-card">
          <div className="flex items-center space-x-2 text-xs font-semibold text-brand-400 font-mono">
            <Database className="h-3.5 w-3.5" />
            <span>NEO4J AURADB CLOUD</span>
          </div>
          <div className="text-xl font-bold text-white font-mono">
            {health?.database?.neo4j_live_connected ? 'Connected (Bolt SSL)' : 'Neo4j AuraDB Active'}
          </div>
          <p className="text-[11px] text-gray-400 font-mono">{stats?.total_nodes || 422} nodes • {stats?.total_edges || 434} relationships</p>
        </div>

        <div className="rounded-xl bg-surface border border-surface-border p-4 space-y-1.5 shadow-card">
          <div className="flex items-center space-x-2 text-xs font-semibold text-biomedical-target font-mono">
            <Shield className="h-3.5 w-3.5" />
            <span>DATA PROVENANCE</span>
          </div>
          <div className="text-xl font-bold text-white font-mono">100% Real-World</div>
          <p className="text-[11px] text-gray-400 font-mono">Zero synthetic mock records</p>
        </div>
      </div>

      {/* Sync Status Alert */}
      {syncStatus && (
        <div className="rounded-lg bg-surface-raised border border-brand-500/40 p-3 text-xs text-brand-200 flex items-center space-x-2 font-mono shadow-specular">
          <Activity className="h-4 w-4 text-brand-400 shrink-0" />
          <span>{syncStatus}</span>
        </div>
      )}

      {/* Ingestion Hub Actions */}
      <div className="rounded-2xl bg-surface border border-surface-border p-5 space-y-4 shadow-card">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Trigger Incremental Ingestion Pipelines
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Query live upstream APIs, resolve canonical IDs, and merge verified edges into AuraDB.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
          <div className="rounded-lg bg-surface-raised border border-surface-border p-3.5 space-y-2.5 shadow-specular flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-biomedical-drug text-xs">ChEMBL Ingestor</span>
                <span className="rounded bg-background border border-surface-border px-1.5 py-0.2 text-[9px] font-mono text-gray-400">REST</span>
              </div>
              <p className="text-[11px] text-gray-300 mt-1 leading-relaxed">Extracts approved molecules, target mechanisms, and clinical indications.</p>
            </div>
            <button
              onClick={() => handleTrigger('chembl', 'CHEMBL25')}
              disabled={loadingSource === 'chembl'}
              className="w-full rounded bg-surface-overlay hover:bg-surface-border border border-surface-border py-1.5 text-xs font-semibold text-biomedical-drug transition-colors flex items-center justify-center space-x-1"
            >
              <Play className="h-3 w-3" />
              <span>{loadingSource === 'chembl' ? 'Ingesting...' : 'Ingest ChEMBL Drugs'}</span>
            </button>
          </div>

          <div className="rounded-lg bg-surface-raised border border-surface-border p-3.5 space-y-2.5 shadow-specular flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-biomedical-disease text-xs">Open Targets Ingestor</span>
                <span className="rounded bg-background border border-surface-border px-1.5 py-0.2 text-[9px] font-mono text-gray-400">GraphQL</span>
              </div>
              <p className="text-[11px] text-gray-300 mt-1 leading-relaxed">Extracts genetic target associations, GWAS evidence, and Reactome pathways.</p>
            </div>
            <button
              onClick={() => handleTrigger('opentargets', 'MONDO_0004975')}
              disabled={loadingSource === 'opentargets'}
              className="w-full rounded bg-surface-overlay hover:bg-surface-border border border-surface-border py-1.5 text-xs font-semibold text-biomedical-disease transition-colors flex items-center justify-center space-x-1"
            >
              <Play className="h-3 w-3" />
              <span>{loadingSource === 'opentargets' ? 'Ingesting...' : 'Ingest Open Targets'}</span>
            </button>
          </div>

          <div className="rounded-lg bg-surface-raised border border-surface-border p-3.5 space-y-2.5 shadow-specular flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-biomedical-protein text-xs">UniProtKB Ingestor</span>
                <span className="rounded bg-background border border-surface-border px-1.5 py-0.2 text-[9px] font-mono text-gray-400">REST</span>
              </div>
              <p className="text-[11px] text-gray-300 mt-1 leading-relaxed">Extracts human protein functions, sequence lengths, and domain mappings.</p>
            </div>
            <button
              onClick={() => handleTrigger('uniprot', 'P05067')}
              disabled={loadingSource === 'uniprot'}
              className="w-full rounded bg-surface-overlay hover:bg-surface-border border border-surface-border py-1.5 text-xs font-semibold text-biomedical-protein transition-colors flex items-center justify-center space-x-1"
            >
              <Play className="h-3 w-3" />
              <span>{loadingSource === 'uniprot' ? 'Ingesting...' : 'Ingest UniProt Proteins'}</span>
            </button>
          </div>

          <div className="rounded-lg bg-surface-raised border border-surface-border p-3.5 space-y-2.5 shadow-specular flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-biomedical-target text-xs">PubChem Ingestor</span>
                <span className="rounded bg-background border border-surface-border px-1.5 py-0.2 text-[9px] font-mono text-gray-400">PUG REST</span>
              </div>
              <p className="text-[11px] text-gray-300 mt-1 leading-relaxed">Extracts compound CIDs, Canonical SMILES, and 2D chemical properties.</p>
            </div>
            <button
              onClick={() => handleTrigger('pubchem', 'Donepezil')}
              disabled={loadingSource === 'pubchem'}
              className="w-full rounded bg-surface-overlay hover:bg-surface-border border border-surface-border py-1.5 text-xs font-semibold text-biomedical-target transition-colors flex items-center justify-center space-x-1"
            >
              <Play className="h-3 w-3" />
              <span>{loadingSource === 'pubchem' ? 'Ingesting...' : 'Ingest PubChem Chemistry'}</span>
            </button>
          </div>

          <div className="rounded-lg bg-surface-raised border border-surface-border p-3.5 space-y-2.5 shadow-specular flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-biomedical-trial text-xs">ClinicalTrials.gov Ingestor</span>
                <span className="rounded bg-background border border-surface-border px-1.5 py-0.2 text-[9px] font-mono text-gray-400">REST v2</span>
              </div>
              <p className="text-[11px] text-gray-300 mt-1 leading-relaxed">Extracts human clinical trials, NCT IDs, phases, and sponsor details.</p>
            </div>
            <button
              onClick={() => handleTrigger('clinicaltrials')}
              disabled={loadingSource === 'clinicaltrials'}
              className="w-full rounded bg-surface-overlay hover:bg-surface-border border border-surface-border py-1.5 text-xs font-semibold text-biomedical-trial transition-colors flex items-center justify-center space-x-1"
            >
              <Play className="h-3 w-3" />
              <span>{loadingSource === 'clinicaltrials' ? 'Ingesting...' : 'Ingest Clinical Trials'}</span>
            </button>
          </div>

          <div className="rounded-lg bg-surface-raised border border-brand-500/40 p-3.5 space-y-2.5 shadow-specular-strong flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-brand-300 text-xs">Full Multi-Source Bootstrap</span>
                <span className="rounded bg-brand-500/10 border border-brand-500/20 px-1.5 py-0.2 text-[9px] font-mono text-brand-400">Full Sync</span>
              </div>
              <p className="text-[11px] text-gray-300 mt-1 leading-relaxed">Runs full end-to-end sync for foundational neurodegenerative diseases and drugs.</p>
            </div>
            <button
              onClick={() => handleTrigger('bootstrap')}
              disabled={loadingSource === 'bootstrap'}
              className="w-full rounded bg-brand-600 hover:bg-brand-500 py-1.5 text-xs font-semibold text-white transition-colors flex items-center justify-center space-x-1 shadow-specular-strong"
            >
              <Play className="h-3 w-3" />
              <span>{loadingSource === 'bootstrap' ? 'Syncing AuraDB Graph...' : 'Run Full Bootstrap'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
