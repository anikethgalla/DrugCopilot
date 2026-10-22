'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import CopilotChat from '@/components/CopilotChat';
import GraphVisualization from '@/components/GraphVisualization';
import CandidateCard from '@/components/CandidateCard';
import EvidenceDrawer from '@/components/EvidenceDrawer';
import { RepurposingCandidate, SubgraphResponse, GraphNode } from '@/lib/types';
import { Network, ListOrdered, FileSearch, Sparkles, Loader2 } from 'lucide-react';

function CopilotContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || (searchParams.get('disease') ? `Find candidate drugs that could be repurposed for ${searchParams.get('disease')}` : '');

  const [candidates, setCandidates] = useState<RepurposingCandidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<RepurposingCandidate | null>(null);
  const [subgraph, setSubgraph] = useState<SubgraphResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'graph' | 'candidates'>('graph');

  const handleCandidatesFound = (cands: RepurposingCandidate[]) => {
    setCandidates(cands);
    if (cands.length > 0) {
      setSelectedCandidate(cands[0]);
      setActiveTab('candidates');
    }
  };

  const handleSubgraphReceived = (graph: SubgraphResponse) => {
    setSubgraph(graph);
  };

  const handleNodeSelect = (node: GraphNode | null) => {
    if (!node) return;
    const cand = candidates.find(
      (c) => c.drug.canonical_id === node.id || c.drug.name?.toLowerCase() === node.name?.toLowerCase()
    );
    if (cand) {
      setSelectedCandidate(cand);
    }
  };

  return (
    <div className="h-[calc(100vh-8.5rem)] p-3 lg:p-4 bg-black overflow-hidden select-none">
      <div className="grid h-full grid-cols-1 lg:grid-cols-12 gap-3.5">
        
        {/* LEFT PANEL: Conversational Agent (4 Cols) */}
        <div className="lg:col-span-4 h-full min-h-[400px]">
          <CopilotChat
            onCandidatesFound={handleCandidatesFound}
            onSubgraphReceived={handleSubgraphReceived}
            onSelectCandidate={setSelectedCandidate}
            initialQuery={initialQuery}
          />
        </div>

        {/* CENTER PANEL: Interactive Graph Viewport & Candidate Matrix (5 Cols) */}
        <div className="lg:col-span-5 h-full flex flex-col rounded-2xl bg-zinc-950/80 border border-white/10 overflow-hidden shadow-2xl backdrop-blur-xl">
          
          {/* Viewport Segmented Control */}
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5 bg-black/40">
            <div className="flex items-center space-x-1 bg-zinc-900/80 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setActiveTab('graph')}
                className={`flex items-center space-x-1.5 px-3 py-1 text-xs rounded-lg transition-all duration-200 ${
                  activeTab === 'graph' 
                    ? 'bg-white text-black font-bold shadow-sm' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Network className={`h-3.5 w-3.5 ${activeTab === 'graph' ? 'text-black' : 'text-zinc-400'}`} />
                <span>Knowledge Graph</span>
              </button>
              <button
                onClick={() => setActiveTab('candidates')}
                className={`flex items-center space-x-1.5 px-3 py-1 text-xs rounded-lg transition-all duration-200 ${
                  activeTab === 'candidates' 
                    ? 'bg-white text-black font-bold shadow-sm' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <ListOrdered className={`h-3.5 w-3.5 ${activeTab === 'candidates' ? 'text-black' : 'text-zinc-400'}`} />
                <span>Candidates ({candidates.length})</span>
              </button>
            </div>

            <div className="text-[11px] font-mono text-zinc-400">
              <span className="text-white font-bold">{subgraph?.nodes?.length || 0}</span> nodes • <span className="text-white font-bold">{subgraph?.edges?.length || 0}</span> edges
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 p-3 overflow-y-auto">
            {activeTab === 'graph' ? (
              <div className="h-full">
                <GraphVisualization
                  subgraph={subgraph}
                  onNodeSelect={handleNodeSelect}
                  height="100%"
                />
              </div>
            ) : (
              <div className="space-y-3">
                {candidates.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-16 text-center space-y-3">
                    <div className="relative">
                      <Sparkles className="h-10 w-10 text-white/40" />
                      <div className="absolute inset-0 animate-ping">
                        <Sparkles className="h-10 w-10 text-white/20" />
                      </div>
                    </div>
                    <p className="text-sm text-zinc-300 font-medium">No candidates generated yet</p>
                    <p className="text-xs text-zinc-500 max-w-xs leading-relaxed">Ask a question in the AI Copilot to extract drug repurposing hypotheses from the biomedical knowledge graph.</p>
                  </div>
                ) : (
                  candidates.map((cand, idx) => (
                    <CandidateCard
                      key={idx}
                      candidate={cand}
                      isSelected={selectedCandidate?.drug.canonical_id === cand.drug.canonical_id}
                      onSelect={() => setSelectedCandidate(cand)}
                    />
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Evidence & Provenance Inspector (3 Cols) */}
        <div className="lg:col-span-3 h-full rounded-2xl bg-zinc-950/80 border border-white/10 overflow-hidden flex flex-col shadow-2xl backdrop-blur-xl">
          <div className="border-b border-white/10 px-4 py-3 bg-black/40 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/10 border border-white/15">
                <FileSearch className="h-3.5 w-3.5 text-white" />
              </div>
              <h3 className="text-xs font-semibold text-white">Evidence Inspector</h3>
            </div>
            <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded-full border border-white/10">W3C PROV-DM</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <EvidenceDrawer candidate={selectedCandidate} />
          </div>
        </div>

      </div>
    </div>
  );
}

export default function CopilotPage() {
  return (
    <Suspense fallback={
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center space-x-3 text-sm text-zinc-400 font-mono">
        <Loader2 className="h-5 w-5 animate-spin text-white" />
        <span>Loading Copilot workspace...</span>
      </div>
    }>
      <CopilotContent />
    </Suspense>
  );
}
