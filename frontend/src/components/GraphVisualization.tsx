'use client';

import React, { useEffect, useRef, useState } from 'react';
import cytoscape, { Core, EventObject } from 'cytoscape';
import { SubgraphResponse, GraphNode, GraphEdge } from '@/lib/types';
import { CYTOSCAPE_STYLES } from '@/lib/cytoscape-styles';
import { Maximize2, ZoomIn, ZoomOut, RotateCcw, X, ExternalLink } from 'lucide-react';

interface GraphVisualizationProps {
  subgraph?: SubgraphResponse | null;
  onNodeSelect?: (node: GraphNode | null) => void;
  onEdgeSelect?: (edge: GraphEdge | null) => void;
  height?: string;
}

// Monochrome Legend definition
const LEGEND_ITEMS = [
  { label: 'Drug', color: '#ffffff', border: '#ffffff' },
  { label: 'Disease', color: '#18181b', border: '#ffffff' },
  { label: 'Protein', color: '#d4d4d8', border: '#ffffff' },
  { label: 'Gene', color: '#71717a', border: 'rgba(255,255,255,0.6)' },
  { label: 'Pathway', color: '#3f3f46', border: 'rgba(255,255,255,0.4)' },
  { label: 'Trial', color: '#27272a', border: '#ffffff', dashed: true },
];

export default function GraphVisualization({
  subgraph,
  onNodeSelect,
  onEdgeSelect,
  height = '500px'
}: GraphVisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);
  const [layoutName, setLayoutName] = useState<'cose' | 'concentric' | 'breadthfirst' | 'circle'>('cose');
  const [selectedEdgeData, setSelectedEdgeData] = useState<any | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const elements: any[] = [];
    const nodeIds = new Set<string>();

    if (subgraph?.nodes) {
      subgraph.nodes.forEach((n) => {
        if (!n?.id) return;
        nodeIds.add(n.id);
        elements.push({
          group: 'nodes',
          data: {
            ...n.properties,
            id: n.id,
            name: n.name || n.id,
            label: n.label,
          }
        });
      });
    }

    if (subgraph?.edges) {
      subgraph.edges.forEach((e) => {
        if (!e?.id || !e.source || !e.target) return;
        if (!nodeIds.has(e.source) || !nodeIds.has(e.target)) return;

        const props = { ...(e.properties || {}) };
        const provenanceSource = props.source;
        delete props.source;

        elements.push({
          group: 'edges',
          data: {
            ...props,
            id: e.id,
            source: e.source,
            target: e.target,
            type: e.type,
            provenance_source: provenanceSource,
          }
        });
      });
    }

    const cy = cytoscape({
      container: containerRef.current,
      elements: elements,
      style: CYTOSCAPE_STYLES as any,
      layout: {
        name: layoutName,
        animate: true,
        animationDuration: 400,
        nodeDimensionsIncludeLabels: true,
      } as any,
      minZoom: 0.15,
      maxZoom: 4.0,
      wheelSensitivity: 0.2,
    });

    cy.on('tap', 'node', (evt: EventObject) => {
      const node = evt.target;
      if (onNodeSelect) {
        onNodeSelect({
          id: node.data('id'),
          label: node.data('label'),
          name: node.data('name'),
          properties: node.data()
        });
      }
      setSelectedEdgeData(null);
    });

    cy.on('tap', 'edge', (evt: EventObject) => {
      const edge = evt.target;
      const data = edge.data();
      setSelectedEdgeData(data);
      if (onEdgeSelect) {
        onEdgeSelect({
          id: data.id,
          source: data.source,
          target: data.target,
          type: data.type,
          properties: data
        });
      }
    });

    cy.on('tap', (evt: EventObject) => {
      if (evt.target === cy) {
        if (onNodeSelect) onNodeSelect(null);
        if (onEdgeSelect) onEdgeSelect(null);
        setSelectedEdgeData(null);
      }
    });

    cyRef.current = cy;

    return () => {
      cy.destroy();
    };
  }, [subgraph, layoutName]);

  const handleZoomIn = () => cyRef.current?.zoom(cyRef.current.zoom() * 1.25);
  const handleZoomOut = () => cyRef.current?.zoom(cyRef.current.zoom() * 0.8);
  const handleFit = () => cyRef.current?.fit(undefined, 25);
  const handleRelayout = () => {
    cyRef.current?.layout({ name: layoutName, animate: true } as any).run();
  };

  return (
    <div className="relative w-full h-full rounded-xl bg-black overflow-hidden" style={{ height }}>
      {/* Background Radial Ambiance */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(255,255,255,0.04),transparent_80%)] pointer-events-none" />

      {/* Cytoscape Canvas */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Toolbar */}
      <div className="absolute top-3 right-3 flex items-center space-x-1 rounded-xl bg-zinc-950/90 border border-white/10 p-1.5 shadow-2xl backdrop-blur-xl z-10">
        <select
          value={layoutName}
          onChange={(e) => setLayoutName(e.target.value as any)}
          className="bg-zinc-900 text-[11px] font-mono text-zinc-300 border border-white/10 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-white/40 transition-colors"
        >
          <option value="cose">Force CoSE</option>
          <option value="concentric">Concentric</option>
          <option value="breadthfirst">Hierarchical</option>
          <option value="circle">Circular</option>
        </select>
        <div className="h-5 w-[1px] bg-white/10 mx-1" />
        {[
          { icon: ZoomIn, handler: handleZoomIn, title: 'Zoom In' },
          { icon: ZoomOut, handler: handleZoomOut, title: 'Zoom Out' },
          { icon: Maximize2, handler: handleFit, title: 'Fit to Screen' },
          { icon: RotateCcw, handler: handleRelayout, title: 'Relayout' },
        ].map(({ icon: Icon, handler, title }) => (
          <button
            key={title}
            onClick={handler}
            title={title}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
          >
            <Icon className="h-3.5 w-3.5" />
          </button>
        ))}
      </div>

      {/* Bottom Legend with Monochrome Entity Dots */}
      <div className="absolute bottom-3 left-3 rounded-xl bg-zinc-950/90 border border-white/10 px-3 py-2 text-[10px] font-mono flex items-center space-x-3 shadow-2xl backdrop-blur-xl z-10">
        {LEGEND_ITEMS.map((item) => (
          <div key={item.label} className="flex items-center space-x-1.5">
            <span 
              className="w-2.5 h-2.5 rounded-full"
              style={{ 
                backgroundColor: item.color, 
                border: `1px ${item.dashed ? 'dashed' : 'solid'} ${item.border}`,
                boxShadow: '0 0 6px rgba(255,255,255,0.2)'
              }}
            />
            <span className="text-zinc-400">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Edge Provenance Popover */}
      {selectedEdgeData && (
        <div className="absolute top-14 left-3 max-w-sm rounded-2xl bg-zinc-950/95 border border-white/15 p-4 shadow-2xl backdrop-blur-2xl z-20 text-xs animate-fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="font-semibold text-white text-sm">Relationship Provenance</span>
            <div className="flex items-center space-x-2">
              <span className="rounded-full bg-white text-black font-mono font-bold text-[10px] px-2 py-0.5">
                {selectedEdgeData.type}
              </span>
              <button onClick={() => setSelectedEdgeData(null)} className="text-zinc-400 hover:text-white transition-colors">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <div className="mt-2.5 space-y-1.5 text-zinc-300 text-[12px] font-sans">
            <p><strong className="text-white">Source Provider:</strong> {selectedEdgeData.provenance_source || selectedEdgeData.source_db || selectedEdgeData.source || 'Curated Database'}</p>
            {selectedEdgeData.source_id && <p className="font-mono"><strong className="text-white">Source ID:</strong> <code className="text-zinc-200">{selectedEdgeData.source_id}</code></p>}
            {selectedEdgeData.confidence !== undefined && <p className="font-mono"><strong className="text-white">Confidence:</strong> <span className="text-white font-bold">{Math.round(selectedEdgeData.confidence * 100)}%</span></p>}
            {selectedEdgeData.mechanism && <p><strong className="text-white">Mechanism:</strong> {selectedEdgeData.mechanism}</p>}
            {selectedEdgeData.source_url && (
              <a
                href={selectedEdgeData.source_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1.5 text-white hover:underline pt-1 font-mono text-[11px] transition-colors"
              >
                <span>Inspect Upstream Source</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
