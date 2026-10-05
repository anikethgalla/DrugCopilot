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
    <div className="h-[calc(100vh-5.5rem)] p-3 lg:p-4 overflow-hidden">
      <div className="grid h-full grid-cols-1 lg:grid-cols-12 gap-3">
        
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
        <div className="lg:col-span-5 h-full flex flex-col bg-surface border border-surface-border rounded-xl overflow-hidden shadow-card">
          
          {/* Viewport Segmented Control */}
          <div className="flex items-center justify-between border-b border-surface-border px-3.5 py-2 bg-surface-raised">
            <div className="flex items-center space-x-1 bg-background p-0.5 rounded-lg border border-surface-border">
              <button
                onClick={() => setActiveTab('graph')}
                className={`flex items-center space-x-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  activeTab === 'graph' 
                    ? 'bg-surface-raised text-white border border-surface-border shadow-specular' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Network className="h-3.5 w-3.5 text-gray-300" />
                <span>Knowledge Graph</span>
              </button>
              <button
                onClick={() => setActiveTab('candidates')}
                className={`flex items-center space-x-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  activeTab === 'candidates' 
                    ? 'bg-surface-raised text-white border border-surface-border shadow-specular' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <ListOrdered className="h-3.5 w-3.5 text-gray-300" />
                <span>Candidates ({candidates.length})</span>
              </button>
            </div>

            <div className="text-[11px] font-mono text-gray-400">
              {subgraph?.nodes?.length || 0} nodes • {subgraph?.edges?.length || 0} edges
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 p-2.5 overflow-y-auto">
            {activeTab === 'graph' ? (
              <div className="h-full">
                <GraphVisualization
                  subgraph={subgraph}
                  onNodeSelect={handleNodeSelect}
                  height="100%"
                />
              </div>
            ) : (
              <div className="space-y-2.5">
                {candidates.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 text-center text-gray-500 space-y-2">
                    <Sparkles className="h-8 w-8 text-gray-600 mb-1" />
                    <p className="text-xs text-gray-400">No candidates generated yet.</p>
                    <p className="text-[11px] text-gray-500 max-w-xs">Ask a question in the AI Copilot on the left to extract drug repurposing hypotheses.</p>
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
        <div className="lg:col-span-3 h-full bg-surface border border-surface-border rounded-xl overflow-hidden flex flex-col shadow-card">
          <div className="border-b border-surface-border px-3.5 py-2.5 bg-surface-raised flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <FileSearch className="h-3.5 w-3.5 text-gray-300" />
              <h3 className="text-xs font-semibold text-white">Evidence Inspector</h3>
            </div>
            <span className="text-[10px] font-mono text-gray-400">W3C PROV-DM</span>
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
      <div className="h-[calc(100vh-5.5rem)] flex items-center justify-center space-x-2 text-xs text-gray-400 font-mono">
        <Loader2 className="h-4 w-4 animate-spin text-white" />
        <span>Loading Copilot workspace...</span>
      </div>
    }>
      <CopilotContent />
    </Suspense>
  );
}
