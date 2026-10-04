'use client';

import React, { useState } from 'react';
import CopilotChat from '@/components/CopilotChat';
import GraphVisualization from '@/components/GraphVisualization';
import CandidateCard from '@/components/CandidateCard';
import EvidenceDrawer from '@/components/EvidenceDrawer';
import { RepurposingCandidate, SubgraphResponse, GraphNode, GraphEdge } from '@/lib/types';
import { Sparkles, Network, ListOrdered, FileSearch } from 'lucide-react';

export default function CopilotPage() {
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
    // Find if matches a candidate drug
    const cand = candidates.find(
      (c) => c.drug.canonical_id === node.id || c.drug.name.toLowerCase() === node.name.toLowerCase()
    );
    if (cand) {
      setSelectedCandidate(cand);
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] p-4">
      <div className="grid h-full grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT PANEL: AI Conversation (4 Cols) */}
        <div className="lg:col-span-4 h-full">
          <CopilotChat
            onCandidatesFound={handleCandidatesFound}
            onSubgraphReceived={handleSubgraphReceived}
            onSelectCandidate={setSelectedCandidate}
          />
        </div>

        {/* CENTER PANEL: Interactive Knowledge Graph & Candidate Cards (5 Cols) */}
        <div className="lg:col-span-5 h-full flex flex-col bg-surface border border-surface-border rounded-xl overflow-hidden">
          {/* Top Switcher */}
          <div className="flex items-center justify-between border-b border-surface-border px-4 py-2.5 bg-surface-raised">
            <div className="flex items-center space-x-1 bg-background p-1 rounded-lg border border-surface-border">
              <button
                onClick={() => setActiveTab('graph')}
                className={`flex items-center space-x-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  activeTab === 'graph' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Network className="h-3.5 w-3.5" />
                <span>Knowledge Graph</span>
              </button>
              <button
                onClick={() => setActiveTab('candidates')}
                className={`flex items-center space-x-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  activeTab === 'candidates' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
                }`}
              >
                <ListOrdered className="h-3.5 w-3.5" />
                <span>Candidates ({candidates.length})</span>
              </button>
            </div>

            <span className="text-xs text-gray-400">
              {subgraph?.nodes?.length || 0} nodes • {subgraph?.edges?.length || 0} relationships
            </span>
          </div>

          {/* Body Content */}
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
                  <div className="flex flex-col items-center justify-center p-12 text-center text-gray-500">
                    <Sparkles className="h-10 w-10 text-gray-600 mb-2" />
                    <p className="text-xs">No candidate drugs generated yet. Ask a question on the left to discover candidates.</p>
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
        <div className="lg:col-span-3 h-full bg-surface border border-surface-border rounded-xl overflow-hidden flex flex-col">
          <div className="border-b border-surface-border px-4 py-3 bg-surface-raised flex items-center space-x-2">
            <FileSearch className="h-4 w-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Evidence Inspector</h3>
          </div>
          <div className="flex-1 overflow-hidden">
            <EvidenceDrawer candidate={selectedCandidate} />
          </div>
        </div>
      </div>
    </div>
  );
}
