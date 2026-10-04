'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import GraphVisualization from '@/components/GraphVisualization';
import { SubgraphResponse, GraphNode, GraphEdge } from '@/lib/types';
import { fetchEntitySubgraph } from '@/lib/api';
import { Search, Network, Bot, ArrowRight, Layers, SlidersHorizontal, RefreshCw } from 'lucide-react';

const QUICK_ENTITIES = [
  { label: "Alzheimer's", id: "MONDO_0004975", type: "Disease" },
  { label: "Parkinson's", id: "MONDO_0005180", type: "Disease" },
  { label: "Donepezil", id: "CHEMBL502", type: "Drug" },
  { label: "Metformin", id: "CHEMBL1434", type: "Drug" },
  { label: "ACHE", id: "P22303", type: "Protein" },
  { label: "APP", id: "P05067", type: "Protein" }
];

export default function ExplorePage() {
  const [query, setQuery] = useState('MONDO_0004975'); // Alzheimer's default
  const [entityType, setEntityType] = useState<'Disease' | 'Drug' | 'Protein' | 'Gene'>('Disease');
  const [subgraph, setSubgraph] = useState<SubgraphResponse | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<GraphEdge | null>(null);
  const [loading, setLoading] = useState(false);
  const [maxDepth, setMaxDepth] = useState(2);

  const loadGraph = async (entityId: string, depth = maxDepth, type = entityType) => {
    setLoading(true);
    try {
      const data = await fetchEntitySubgraph(type, entityId, depth, 60);
      setSubgraph(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGraph(query, maxDepth, entityType);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      loadGraph(query.trim(), maxDepth, entityType);
    }
  };

  const handleQuickSelect = (item: typeof QUICK_ENTITIES[0]) => {
    setQuery(item.id);
    setEntityType(item.type as any);
    loadGraph(item.id, maxDepth, item.type as any);
  };

  return (
    <div className="h-[calc(100vh-5.5rem)] p-3 lg:p-4 flex flex-col space-y-3 overflow-hidden">
      
      {/* Top Search & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface border border-surface-border rounded-xl p-2.5 shadow-card">
        
        {/* Search Input Form */}
        <form onSubmit={handleSearch} className="flex items-center space-x-2 flex-1 min-w-[280px] max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search canonical ID or symbol (e.g. MONDO_0004975, CHEMBL502, P05067)..."
              className="w-full rounded-md bg-background border border-surface-border pl-8 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 font-mono"
            />
          </div>

          <select
            value={entityType}
            onChange={(e) => setEntityType(e.target.value as any)}
            className="rounded-md bg-surface-raised border border-surface-border px-2 py-1.5 text-xs font-mono text-gray-200 focus:outline-none"
          >
            <option value="Disease">Disease</option>
            <option value="Drug">Drug</option>
            <option value="Protein">Protein</option>
            <option value="Gene">Gene</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-brand-600 hover:bg-brand-500 disabled:opacity-50 px-3.5 py-1.5 text-xs font-semibold text-white shadow-specular-strong transition-colors"
          >
            {loading ? 'Traversing...' : 'Explore'}
          </button>
        </form>

        {/* Quick Presets & Traversal Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="hidden sm:flex items-center space-x-1">
            {QUICK_ENTITIES.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickSelect(q)}
                className={`rounded px-2 py-0.5 text-[10px] font-mono border transition-colors ${
                  query === q.id 
                    ? 'bg-brand-500/20 text-brand-300 border-brand-500/40' 
                    : 'bg-surface-raised text-gray-400 border-surface-border hover:text-white'
                }`}
              >
                {q.label}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-1.5 border-l border-surface-border pl-2">
            <span className="text-gray-400 font-mono text-[11px]">Hops:</span>
            <select
              value={maxDepth}
              onChange={(e) => {
                const d = parseInt(e.target.value);
                setMaxDepth(d);
                loadGraph(query, d, entityType);
              }}
              className="rounded bg-surface-raised border border-surface-border px-1.5 py-0.5 text-xs font-mono text-gray-200 focus:outline-none"
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
            </select>
          </div>

          <div className="text-[11px] font-mono text-gray-400 border-l border-surface-border pl-2">
            {subgraph?.nodes?.length || 0}N • {subgraph?.edges?.length || 0}E
          </div>
        </div>
      </div>

      {/* Main Canvas & Details Overlay */}
      <div className="flex-1 relative rounded-xl border border-surface-border bg-surface overflow-hidden shadow-card">
        <GraphVisualization
          subgraph={subgraph}
          onNodeSelect={setSelectedNode}
          onEdgeSelect={setSelectedEdge}
          height="100%"
        />

        {/* Selected Node Details Floating Card */}
        {selectedNode && (
          <div className="absolute bottom-4 right-4 w-80 bg-surface/95 backdrop-blur-md border border-brand-500/40 rounded-xl p-3.5 shadow-card z-20 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-surface-border">
              <span className="font-bold text-white tracking-tight">{selectedNode.name}</span>
              <span className="rounded bg-brand-500/10 border border-brand-500/20 px-1.5 py-0.2 text-brand-300 font-mono text-[10px]">
                {selectedNode.label}
              </span>
            </div>
            
            <div className="mt-2.5 space-y-1 text-gray-300 font-mono text-[11px]">
              <p><strong>ID:</strong> <code className="text-brand-300">{selectedNode.id}</code></p>
              {selectedNode.properties.gene_symbol && (
                <p><strong>Gene:</strong> {selectedNode.properties.gene_symbol}</p>
              )}
              {selectedNode.properties.smiles && (
                <p className="truncate"><strong>SMILES:</strong> {selectedNode.properties.smiles}</p>
              )}
              {selectedNode.properties.source && (
                <p><strong>Source:</strong> {selectedNode.properties.source}</p>
              )}
            </div>

            <div className="mt-3 pt-2 border-t border-surface-border flex items-center gap-2">
              <button
                onClick={() => loadGraph(selectedNode.id, maxDepth, selectedNode.label as any)}
                className="flex-1 rounded bg-surface-raised hover:bg-surface-overlay border border-surface-border py-1.5 text-xs text-gray-300 font-medium transition-colors text-center"
              >
                Re-center
              </button>
              <Link
                href={`/copilot?q=${encodeURIComponent(`Analyze repurposing opportunities involving ${selectedNode.name}`)}`}
                className="flex-1 rounded bg-brand-600 hover:bg-brand-500 py-1.5 text-xs text-white font-semibold transition-colors text-center inline-flex items-center justify-center space-x-1"
              >
                <Bot className="h-3 w-3" />
                <span>Copilot</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
