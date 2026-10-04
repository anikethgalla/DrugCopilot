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
    <div className="relative w-full h-full rounded-xl bg-canvas-subtle overflow-hidden" style={{ height }}>
      {/* Cytoscape Canvas */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Toolbar */}
      <div className="absolute top-3 right-3 flex items-center space-x-1 bg-surface/90 backdrop-blur-md border border-surface-border rounded-lg p-1 shadow-card z-10">
        <select
          value={layoutName}
          onChange={(e) => setLayoutName(e.target.value as any)}
          className="bg-surface-raised text-[11px] font-mono text-gray-200 border border-surface-border rounded px-2 py-1 focus:outline-none"
        >
          <option value="cose">Force CoSE</option>
          <option value="concentric">Concentric</option>
          <option value="breadthfirst">Hierarchical</option>
          <option value="circle">Circular</option>
        </select>
        <div className="h-4 w-[1px] bg-surface-border mx-1" />
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="p-1.5 text-gray-400 hover:text-white hover:bg-surface-raised rounded transition-colors"
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="p-1.5 text-gray-400 hover:text-white hover:bg-surface-raised rounded transition-colors"
        >
          <ZoomOut className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={handleFit}
          title="Fit to Screen"
          className="p-1.5 text-gray-400 hover:text-white hover:bg-surface-raised rounded transition-colors"
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={handleRelayout}
          title="Relayout Graph"
          className="p-1.5 text-gray-400 hover:text-white hover:bg-surface-raised rounded transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Discrete Bottom Legend */}
      <div className="absolute bottom-3 left-3 bg-surface/90 backdrop-blur-md border border-surface-border rounded-md px-2.5 py-1.5 text-[10px] font-mono flex items-center space-x-2.5 shadow-card z-10">
        <div className="flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-biomedical-drug"></span>
          <span className="text-gray-300">Drug</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-biomedical-disease"></span>
          <span className="text-gray-300">Disease</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-biomedical-protein"></span>
          <span className="text-gray-300">Protein</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-biomedical-gene"></span>
          <span className="text-gray-300">Gene</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-biomedical-pathway"></span>
          <span className="text-gray-300">Pathway</span>
        </div>
        <div className="flex items-center space-x-1">
          <span className="w-2 h-2 rounded-full bg-biomedical-trial"></span>
          <span className="text-gray-300">Trial</span>
        </div>
      </div>

      {/* Edge Provenance Popover */}
      {selectedEdgeData && (
        <div className="absolute top-14 left-3 max-w-sm bg-surface/95 backdrop-blur-md border border-brand-500/40 rounded-xl p-3 shadow-card z-20 text-xs">
          <div className="flex items-center justify-between pb-1.5 border-b border-surface-border">
            <span className="font-semibold text-brand-300">Relationship Provenance</span>
            <div className="flex items-center space-x-1.5">
              <span className="rounded bg-brand-500/10 px-1.5 py-0.2 text-brand-300 font-mono text-[10px]">
                {selectedEdgeData.type}
              </span>
              <button onClick={() => setSelectedEdgeData(null)} className="text-gray-400 hover:text-white">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <div className="mt-2 space-y-1 text-gray-300 text-[11px] font-sans">
            <p><strong>Source Provider:</strong> {selectedEdgeData.provenance_source || selectedEdgeData.source_db || selectedEdgeData.source || 'Curated Database'}</p>
            {selectedEdgeData.source_id && <p className="font-mono"><strong>Source ID:</strong> <code className="text-brand-300">{selectedEdgeData.source_id}</code></p>}
            {selectedEdgeData.confidence !== undefined && <p className="font-mono"><strong>Confidence:</strong> {Math.round(selectedEdgeData.confidence * 100)}%</p>}
            {selectedEdgeData.mechanism && <p><strong>Mechanism:</strong> {selectedEdgeData.mechanism}</p>}
            {selectedEdgeData.source_url && (
              <a
                href={selectedEdgeData.source_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1 text-brand-400 hover:text-brand-300 pt-1 font-mono text-[10px]"
              >
                <span>Inspect Upstream Source Record</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
