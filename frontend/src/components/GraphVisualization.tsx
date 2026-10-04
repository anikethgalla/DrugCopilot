'use client';

import React, { useEffect, useRef, useState } from 'react';
import cytoscape, { Core, EventObject } from 'cytoscape';
import { SubgraphResponse, GraphNode, GraphEdge } from '@/lib/types';
import { CYTOSCAPE_STYLES } from '@/lib/cytoscape-styles';
import { Maximize2, ZoomIn, ZoomOut, RotateCcw, Info, Layers } from 'lucide-react';

interface GraphVisualizationProps {
  subgraph?: SubgraphResponse | null;
  onNodeSelect?: (node: GraphNode | null) => void;
  onEdgeSelect?: (edge: GraphEdge | null) => void;
  height?: string;
}

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

    // Build Cytoscape elements with valid node/edge references
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
        // Cytoscape throws if an edge references a node that isn't in the elements list
        if (!nodeIds.has(e.source) || !nodeIds.has(e.target)) return;

        // Note: e.properties might have a 'source' key (provenance provider name)
        // We must ensure 'source' and 'target' in data are strictly the node IDs
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
        animationDuration: 500,
        nodeDimensionsIncludeLabels: true,
      } as any,
      minZoom: 0.2,
      maxZoom: 3.5,
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
  const handleFit = () => cyRef.current?.fit(undefined, 30);
  const handleRelayout = () => {
    cyRef.current?.layout({ name: layoutName, animate: true } as any).run();
  };

  return (
    <div className="relative w-full rounded-xl border border-surface-border bg-background overflow-hidden" style={{ height }}>
      {/* Canvas */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Controls Toolbar */}
      <div className="absolute top-3 right-3 flex items-center space-x-1.5 bg-surface/90 backdrop-blur-md border border-surface-border rounded-lg p-1.5 shadow-lg z-10">
        <select
          value={layoutName}
          onChange={(e) => setLayoutName(e.target.value as any)}
          className="bg-surface-raised text-xs text-gray-200 border border-surface-border rounded px-2 py-1 focus:outline-none"
        >
          <option value="cose">Force-Directed (CoSE)</option>
          <option value="concentric">Concentric</option>
          <option value="breadthfirst">Hierarchical</option>
          <option value="circle">Circular</option>
        </select>
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="p-1.5 text-gray-300 hover:text-white hover:bg-surface-raised rounded transition-colors"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="p-1.5 text-gray-300 hover:text-white hover:bg-surface-raised rounded transition-colors"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          onClick={handleFit}
          title="Fit Graph"
          className="p-1.5 text-gray-300 hover:text-white hover:bg-surface-raised rounded transition-colors"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
        <button
          onClick={handleRelayout}
          title="Recalculate Layout"
          className="p-1.5 text-gray-300 hover:text-white hover:bg-surface-raised rounded transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 bg-surface/90 backdrop-blur-md border border-surface-border rounded-lg px-3 py-2 text-xs flex items-center space-x-3 shadow-lg z-10">
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
          <span className="text-gray-300">Drug</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
          <span className="text-gray-300">Disease</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
          <span className="text-gray-300">Protein</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span className="text-gray-300">Gene</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span className="text-gray-300">Pathway</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
          <span className="text-gray-300">Trial</span>
        </div>
      </div>

      {/* Edge Provenance Popover when clicked */}
      {selectedEdgeData && (
        <div className="absolute top-14 left-3 max-w-sm bg-surface/95 backdrop-blur-md border border-cyan-500/40 rounded-xl p-3 shadow-2xl z-20 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-surface-border">
            <span className="font-semibold text-cyan-400">Relationship Provenance</span>
            <span className="rounded bg-cyan-500/10 px-1.5 py-0.5 text-cyan-300 font-mono">
              {selectedEdgeData.type}
            </span>
          </div>
          <div className="mt-2 space-y-1.5 text-gray-300">
            <p><strong>Source Provider:</strong> {selectedEdgeData.source_db || selectedEdgeData.source || 'Curated Database'}</p>
            {selectedEdgeData.source_id && <p><strong>Source ID:</strong> <code className="text-cyan-300">{selectedEdgeData.source_id}</code></p>}
            {selectedEdgeData.confidence !== undefined && <p><strong>Confidence:</strong> {Math.round(selectedEdgeData.confidence * 100)}%</p>}
            {selectedEdgeData.mechanism && <p><strong>Mechanism:</strong> {selectedEdgeData.mechanism}</p>}
            {selectedEdgeData.source_url && (
              <a
                href={selectedEdgeData.source_url}
                target="_blank"
                rel="noreferrer"
                className="inline-block text-blue-400 underline hover:text-blue-300 pt-1"
              >
                Inspect Official Source Record &rarr;
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
