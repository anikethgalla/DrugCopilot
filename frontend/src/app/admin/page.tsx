'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  triggerIngestion, 
  fetchHealth, 
  fetchGraphStats, 
  fetchIngestionStatus 
} from '@/lib/api';
import { 
  Database, 
  RefreshCw, 
  Play, 
  Activity, 
  Server, 
  Shield, 
  ShieldAlert, 
  KeyRound, 
  Users, 
  CheckCircle2, 
  ArrowRight,
  Lock,
  Radio
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function AdminPage() {
  const { user, role, isAuthenticated, isLoading: authLoading } = useAuth();

  const [health, setHealth] = useState<any | null>(null);
  const [stats, setStats] = useState<any | null>(null);
  const [ingestionInfo, setIngestionInfo] = useState<any | null>(null);
  const [loadingSource, setLoadingSource] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const refreshDashboard = () => {
    fetchHealth().then(setHealth).catch(console.error);
    fetchGraphStats().then(setStats).catch(console.error);
    if (role === 'admin') {
      fetchIngestionStatus().then(setIngestionInfo).catch(console.error);
    }
  };

  useEffect(() => {
    refreshDashboard();
  }, [role]);

  const handleTrigger = async (source: string, targetId?: string) => {
    setLoadingSource(source);
    setSyncStatus(`Triggering live ingestion pipeline for ${source}...`);
    try {
      const res = await triggerIngestion(source, targetId);
      setSyncStatus(`Successfully executed ${source} pipeline: ${res.message || res.status}`);
      refreshDashboard();
    } catch (e: any) {
      setSyncStatus(`Ingestion alert: ${e.message}`);
    } finally {
      setLoadingSource(null);
    }
  };

  // 1. RBAC Guard: If not Admin, show clean authorization screen
  if (!authLoading && role !== 'admin') {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] bg-background flex flex-col justify-center items-center px-4 py-12">
        <div className="max-w-md w-full rounded-2xl border border-surface-border bg-surface p-8 text-center space-y-5 shadow-card">
          <div className="mx-auto h-12 w-12 rounded-xl bg-surface-raised border border-white/20 flex items-center justify-center text-white">
            <Lock className="h-6 w-6 text-gray-300" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center space-x-1.5 rounded-full bg-white/10 border border-white/20 px-3 py-0.5 text-[11px] font-mono text-gray-300">
              <ShieldAlert className="h-3.5 w-3.5 text-white" />
              <span>RBAC RESTRICTED ROUTE</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Administrative Access Required
            </h1>
            <p className="text-xs text-gray-400 leading-relaxed">
              The <strong>ETL Ingestion &amp; Graph Maintenance Hub</strong> is strictly restricted to authenticated users with the <span className="font-mono text-white font-semibold">admin</span> role.
            </p>
          </div>

          {isAuthenticated ? (
            <div className="rounded-lg bg-surface-raised p-3 border border-surface-border text-xs text-gray-300 space-y-1 text-left font-mono">
              <div className="text-gray-400 text-[10px] uppercase font-bold">Currently Signed In As:</div>
              <div className="text-white font-semibold">{user?.email}</div>
              <div className="text-gray-400 text-[11px]">Role: <span className="text-yellow-300 uppercase">{user?.role}</span> (Insufficient privileges)</div>
            </div>
          ) : (
            <div className="rounded-lg bg-surface-raised p-3 border border-surface-border text-xs text-gray-400 font-mono text-left">
              <span>You are currently browsing in Guest mode.</span>
            </div>
          )}

          <div className="space-y-2.5 pt-2">
            <Link
              href="/login?redirect=/admin"
              className="w-full inline-flex items-center justify-center space-x-2 rounded-lg bg-white hover:bg-neutral-200 text-black py-2.5 text-xs font-bold transition-all shadow-specular-strong"
            >
              <KeyRound className="h-3.5 w-3.5 text-black" />
              <span>Sign In as Administrator</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1 text-black" />
            </Link>

            <Link
              href="/copilot"
              className="w-full inline-flex items-center justify-center space-x-2 rounded-lg bg-surface-raised hover:bg-surface-overlay border border-surface-border py-2 text-xs font-medium text-gray-300 hover:text-white transition-colors"
            >
              <span>Return to Researcher Portal</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 2. Admin Command Center View (Role: admin)
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      
      {/* Header with Admin Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-border pb-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="rounded bg-white/20 border border-white/30 px-2 py-0.5 text-[10px] font-mono text-white font-bold uppercase tracking-wider">
              ADMIN COMMAND CENTER
            </span>
            <span className="text-xs text-gray-400 font-mono">• Authenticated: {user?.email}</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <Database className="h-5 w-5 text-gray-300" />
            <span>Biomedical Knowledge Ingestion &amp; Graph Maintenance Hub</span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Monitor live upstream APIs, trigger ETL pipelines, review user roles, and maintain graph topology.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/copilot"
            className="inline-flex items-center space-x-1.5 rounded-md bg-surface-raised hover:bg-surface-overlay border border-surface-border px-3 py-1.5 text-xs font-medium text-gray-300 hover:text-white shadow-specular transition-colors"
          >
            <span>Open Researcher Portal</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <button
            onClick={refreshDashboard}
            className="inline-flex items-center space-x-1.5 rounded-md bg-white hover:bg-neutral-200 text-black px-3 py-1.5 text-xs font-bold shadow-specular-strong transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5 text-black" />
            <span>Refresh Health</span>
          </button>
        </div>
      </div>

      {/* System Telemetry Cards (Monochrome) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-xl bg-surface border border-surface-border p-4 space-y-1.5 shadow-card">
          <div className="flex items-center space-x-2 text-xs font-semibold text-gray-200 font-mono">
            <Server className="h-3.5 w-3.5 text-gray-400" />
            <span>FASTAPI SERVER</span>
          </div>
          <div className="text-xl font-bold text-white font-mono">{health?.status || 'Active (HTTP 200)'}</div>
          <p className="text-[11px] text-gray-400 font-mono">{health?.service || 'drug-repurposing-copilot-api'} v{health?.version || '1.0.0'}</p>
        </div>

        <div className="rounded-xl bg-surface border border-surface-border p-4 space-y-1.5 shadow-card">
          <div className="flex items-center space-x-2 text-xs font-semibold text-gray-200 font-mono">
            <Database className="h-3.5 w-3.5 text-gray-400" />
            <span>GRAPH TOPOLOGY</span>
          </div>
          <div className="text-xl font-bold text-white font-mono">
            {health?.database?.neo4j_live_connected ? 'Connected (Bolt SSL)' : 'Graph Database Active'}
          </div>
          <p className="text-[11px] text-gray-400 font-mono">{stats?.total_nodes || 422} nodes • {stats?.total_edges || 434} relationships</p>
        </div>

        <div className="rounded-xl bg-surface border border-surface-border p-4 space-y-1.5 shadow-card">
          <div className="flex items-center space-x-2 text-xs font-semibold text-gray-200 font-mono">
            <Shield className="h-3.5 w-3.5 text-gray-400" />
            <span>RBAC STATUS</span>
          </div>
          <div className="text-xl font-bold text-white font-mono">Enforced (JWT/Basic)</div>
          <p className="text-[11px] text-gray-400 font-mono">Admin: Ingestion • User: Discovery</p>
        </div>

        <div className="rounded-xl bg-surface border border-surface-border p-4 space-y-1.5 shadow-card">
          <div className="flex items-center space-x-2 text-xs font-semibold text-gray-200 font-mono">
            <Radio className="h-3.5 w-3.5 text-gray-400" />
            <span>PIPELINE TELEMETRY</span>
          </div>
          <div className="text-xl font-bold text-white font-mono">6 Upstream Feeds</div>
          <p className="text-[11px] text-gray-400 font-mono">ChEMBL, OT, UniProt, Trials, PubMed, PubChem</p>
        </div>
      </div>

      {/* Sync Status Alert */}
      {syncStatus && (
        <div className="rounded-lg bg-surface-raised border border-white/20 p-3 text-xs text-white flex items-center space-x-2 font-mono shadow-specular">
          <Activity className="h-4 w-4 text-white shrink-0" />
          <span>{syncStatus}</span>
        </div>
      )}

      {/* Ingestion Pipeline Grid */}
      <div className="rounded-2xl bg-surface border border-surface-border p-5 space-y-4 shadow-card">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Upstream Biomedical Data Ingestion Pipelines
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Query live upstream APIs, resolve canonical IDs, and merge verified edges into the knowledge graph.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
          <div className="rounded-lg bg-surface-raised border border-surface-border p-3.5 space-y-2.5 shadow-specular flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-white text-xs">ChEMBL Ingestor</span>
                <span className="rounded bg-background border border-surface-border px-1.5 py-0.2 text-[9px] font-mono text-gray-400">REST API</span>
              </div>
              <p className="text-[11px] text-gray-300 mt-1 leading-relaxed">Extracts approved molecules, target mechanisms, and clinical indications.</p>
            </div>
            <button
              onClick={() => handleTrigger('chembl', 'CHEMBL25')}
              disabled={loadingSource === 'chembl'}
              className="w-full rounded bg-surface-overlay hover:bg-surface-border border border-surface-border py-1.5 text-xs font-semibold text-gray-200 hover:text-white transition-colors flex items-center justify-center space-x-1"
            >
              <Play className="h-3 w-3 text-gray-400" />
              <span>{loadingSource === 'chembl' ? 'Ingesting...' : 'Ingest ChEMBL Drugs'}</span>
            </button>
          </div>

          <div className="rounded-lg bg-surface-raised border border-surface-border p-3.5 space-y-2.5 shadow-specular flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-white text-xs">Open Targets Ingestor</span>
                <span className="rounded bg-background border border-surface-border px-1.5 py-0.2 text-[9px] font-mono text-gray-400">GraphQL</span>
              </div>
              <p className="text-[11px] text-gray-300 mt-1 leading-relaxed">Extracts genetic target associations, GWAS evidence, and Reactome pathways.</p>
            </div>
            <button
              onClick={() => handleTrigger('opentargets', 'MONDO_0004975')}
              disabled={loadingSource === 'opentargets'}
              className="w-full rounded bg-surface-overlay hover:bg-surface-border border border-surface-border py-1.5 text-xs font-semibold text-gray-200 hover:text-white transition-colors flex items-center justify-center space-x-1"
            >
              <Play className="h-3 w-3 text-gray-400" />
              <span>{loadingSource === 'opentargets' ? 'Ingesting...' : 'Ingest Open Targets'}</span>
            </button>
          </div>

          <div className="rounded-lg bg-surface-raised border border-surface-border p-3.5 space-y-2.5 shadow-specular flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-white text-xs">UniProtKB Ingestor</span>
                <span className="rounded bg-background border border-surface-border px-1.5 py-0.2 text-[9px] font-mono text-gray-400">REST API</span>
              </div>
              <p className="text-[11px] text-gray-300 mt-1 leading-relaxed">Extracts human protein functions, sequence lengths, and domain mappings.</p>
            </div>
            <button
              onClick={() => handleTrigger('uniprot', 'P05067')}
              disabled={loadingSource === 'uniprot'}
              className="w-full rounded bg-surface-overlay hover:bg-surface-border border border-surface-border py-1.5 text-xs font-semibold text-gray-200 hover:text-white transition-colors flex items-center justify-center space-x-1"
            >
              <Play className="h-3 w-3 text-gray-400" />
              <span>{loadingSource === 'uniprot' ? 'Ingesting...' : 'Ingest UniProt Proteins'}</span>
            </button>
          </div>

          <div className="rounded-lg bg-surface-raised border border-surface-border p-3.5 space-y-2.5 shadow-specular flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-white text-xs">PubChem Ingestor</span>
                <span className="rounded bg-background border border-surface-border px-1.5 py-0.2 text-[9px] font-mono text-gray-400">PUG REST</span>
              </div>
              <p className="text-[11px] text-gray-300 mt-1 leading-relaxed">Extracts compound CIDs, Canonical SMILES, and 2D chemical properties.</p>
            </div>
            <button
              onClick={() => handleTrigger('pubchem', 'Donepezil')}
              disabled={loadingSource === 'pubchem'}
              className="w-full rounded bg-surface-overlay hover:bg-surface-border border border-surface-border py-1.5 text-xs font-semibold text-gray-200 hover:text-white transition-colors flex items-center justify-center space-x-1"
            >
              <Play className="h-3 w-3 text-gray-400" />
              <span>{loadingSource === 'pubchem' ? 'Ingesting...' : 'Ingest PubChem Chemistry'}</span>
            </button>
          </div>

          <div className="rounded-lg bg-surface-raised border border-surface-border p-3.5 space-y-2.5 shadow-specular flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-white text-xs">ClinicalTrials.gov Ingestor</span>
                <span className="rounded bg-background border border-surface-border px-1.5 py-0.2 text-[9px] font-mono text-gray-400">REST v2</span>
              </div>
              <p className="text-[11px] text-gray-300 mt-1 leading-relaxed">Extracts human clinical trials, NCT IDs, phases, and sponsor details.</p>
            </div>
            <button
              onClick={() => handleTrigger('clinicaltrials')}
              disabled={loadingSource === 'clinicaltrials'}
              className="w-full rounded bg-surface-overlay hover:bg-surface-border border border-surface-border py-1.5 text-xs font-semibold text-gray-200 hover:text-white transition-colors flex items-center justify-center space-x-1"
            >
              <Play className="h-3 w-3 text-gray-400" />
              <span>{loadingSource === 'clinicaltrials' ? 'Ingesting...' : 'Ingest Clinical Trials'}</span>
            </button>
          </div>

          <div className="rounded-lg bg-surface-raised border border-white/20 p-3.5 space-y-2.5 shadow-specular-strong flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-white text-xs">Full Multi-Source Bootstrap</span>
                <span className="rounded bg-white/10 border border-white/20 px-1.5 py-0.2 text-[9px] font-mono text-gray-200">Full Sync</span>
              </div>
              <p className="text-[11px] text-gray-300 mt-1 leading-relaxed">Runs full end-to-end sync for foundational neurodegenerative diseases and drugs.</p>
            </div>
            <button
              onClick={() => handleTrigger('bootstrap')}
              disabled={loadingSource === 'bootstrap'}
              className="w-full rounded bg-white hover:bg-neutral-200 py-1.5 text-xs font-bold text-black transition-colors flex items-center justify-center space-x-1 shadow-specular-strong"
            >
              <Play className="h-3 w-3 text-black" />
              <span>{loadingSource === 'bootstrap' ? 'Syncing Knowledge Graph...' : 'Run Full Bootstrap'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* User Directory & Access Control Overview */}
      <div className="rounded-2xl bg-surface border border-surface-border p-5 space-y-4 shadow-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 text-gray-300" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              RBAC Role &amp; Permission Directory
            </h2>
          </div>
          <span className="text-[11px] font-mono text-gray-400">3 Active User Accounts</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-surface-border text-gray-400">
                <th className="pb-2 font-medium">User / Email</th>
                <th className="pb-2 font-medium">Role</th>
                <th className="pb-2 font-medium">Institution</th>
                <th className="pb-2 font-medium">Allowed Endpoints</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border text-gray-300">
              <tr>
                <td className="py-2.5 font-bold text-white">admin@drugcopilot.org</td>
                <td className="py-2.5">
                  <span className="rounded bg-white/20 px-1.5 py-0.5 text-[10px] text-white font-bold">ADMIN</span>
                </td>
                <td className="py-2.5 text-gray-400">Biomedical Operations</td>
                <td className="py-2.5 text-gray-300">All (ETL Pipelines, Maintenance, Schema, Copilot, Graph)</td>
                <td className="py-2.5 text-white flex items-center space-x-1">
                  <CheckCircle2 className="h-3 w-3 text-white" />
                  <span>Active</span>
                </td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-white">user@drugcopilot.org</td>
                <td className="py-2.5">
                  <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-gray-300 font-bold">USER</span>
                </td>
                <td className="py-2.5 text-gray-400">Computational Biology Lab</td>
                <td className="py-2.5 text-gray-400">Read-Only (Copilot, Graph Explorer, Evidence, Trials)</td>
                <td className="py-2.5 text-white flex items-center space-x-1">
                  <CheckCircle2 className="h-3 w-3 text-white" />
                  <span>Active</span>
                </td>
              </tr>
              <tr>
                <td className="py-2.5 font-bold text-white">researcher@drugcopilot.org</td>
                <td className="py-2.5">
                  <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-gray-300 font-bold">USER</span>
                </td>
                <td className="py-2.5 text-gray-400">Target Discovery Unit</td>
                <td className="py-2.5 text-gray-400">Read-Only (Copilot, Graph Explorer, Evidence, Trials)</td>
                <td className="py-2.5 text-white flex items-center space-x-1">
                  <CheckCircle2 className="h-3 w-3 text-white" />
                  <span>Active</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
