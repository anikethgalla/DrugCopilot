'use client';

import React, { useState, useEffect } from 'react';
import GraphVisualization from '@/components/GraphVisualization';
import { SubgraphResponse, GraphNode, GraphEdge } from '@/lib/types';
import { fetchEntitySubgraph, searchRepurposing } from '@/lib/api';
import { Search, Filter, Network, Dna, Pill, Layers } from 'lucide-react';

export default function ExplorePage() {
  const [query, setQuery] = useState('EFO_0000249'); // Alzheimer's default
  const [subgraph, setSubgraph] = useState<SubgraphResponse | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<GraphEdge | null>(null);
  const [loading, setLoading] = useState(false);
  const [maxDepth, setMaxDepth] = useState(2);

  const loadGraph = async (entityId: string, depth = maxDepth) => {
    setLoading(true);
    try {
      const data = await fetchEntitySubgraph('Disease', entityId, depth, 60);
      setSubgraph(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGraph(query, maxDepth);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      loadGraph(query.trim(), maxDepth);
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] p-4 flex flex-col space-y-4">
      {/* Top Search & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface border border-surface-border rounded-xl p-3 shadow-md">
        <form onSubmit={handleSearch} className="flex items-center space-x-2 flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search entity (e.g. EFO_0000249, CHEMBL502, Donepezil, Alzheimer)..."
              className="w-full rounded-lg bg-background border border-surface-border pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition-colors"
          >
            Explore
          </button>
        </form>

        <div className="flex items-center space-x-3 text-xs text-gray-300">
          <div className="flex items-center space-x-2">
            <span>Traversal Depth:</span>
            <select
              value={maxDepth}
              onChange={(e) => {
                const d = parseInt(e.target.value);
                setMaxDepth(d);
                loadGraph(query, d);
              }}
              className="rounded bg-surface-raised border border-surface-border px-2 py-1 text-xs text-white focus:outline-none"
            >
              <option value="1">1 Hop</option>
              <option value="2">2 Hops</option>
              <option value="3">3 Hops</option>
            </select>
          </div>

          <div className="border-l border-surface-border pl-3 text-gray-400">
            {subgraph?.nodes?.length || 0} Nodes • {subgraph?.edges?.length || 0} Relationships
          </div>
        </div>
      </div>

      {/* Main Canvas & Details Overlay */}
      <div className="flex-1 relative rounded-xl border border-surface-border bg-surface overflow-hidden">
        <GraphVisualization
          subgraph={subgraph}
          onNodeSelect={setSelectedNode}
          onEdgeSelect={setSelectedEdge}
          height="100%"
        />

        {/* Selected Node Details Floating Card */}
        {selectedNode && (
          <div className="absolute bottom-4 right-4 w-80 bg-surface/95 backdrop-blur-md border border-blue-500/40 rounded-xl p-4 shadow-2xl z-20 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-surface-border">
              <span className="font-bold text-white">{selectedNode.name}</span>
              <span className="rounded bg-blue-500/20 px-2 py-0.5 text-blue-300 font-mono">
                {selectedNode.label}
              </span>
            </div>
            <div className="mt-3 space-y-1.5 text-gray-300">
              <p><strong>Canonical ID:</strong> <code className="text-cyan-400">{selectedNode.id}</code></p>
              {selectedNode.properties.gene_symbol && (
                <p><strong>Gene Symbol:</strong> {selectedNode.properties.gene_symbol}</p>
              )}
              {selectedNode.properties.smiles && (
                <p className="truncate"><strong>SMILES:</strong> {selectedNode.properties.smiles}</p>
              )}
              {selectedNode.properties.source && (
                <p><strong>Source:</strong> {selectedNode.properties.source}</p>
              )}
            </div>
            <button
              onClick={() => loadGraph(selectedNode.id)}
              className="mt-3 w-full rounded-lg bg-blue-600/20 border border-blue-500/40 py-1.5 text-blue-300 hover:bg-blue-600/30 transition-colors font-medium text-center"
            >
              Re-center Graph on This Entity
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
