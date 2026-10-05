'use client';

import React from 'react';
import { RepurposingCandidate } from '@/lib/types';
import { formatScorePercent, getBadgeColorByClassification } from '@/lib/utils';
import { 
  FileText, 
  ExternalLink, 
  AlertCircle, 
  Activity, 
  Dna, 
  GitBranch
} from 'lucide-react';

interface EvidenceDrawerProps {
  candidate: RepurposingCandidate | null;
  onClose?: () => void;
}

export default function EvidenceDrawer({ candidate, onClose }: EvidenceDrawerProps) {
  if (!candidate) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-gray-500 space-y-2">
        <Activity className="h-8 w-8 text-gray-600 mb-1" />
        <h4 className="text-xs font-semibold text-gray-300">No Candidate Selected</h4>
        <p className="text-[11px] text-gray-400 max-w-xs leading-relaxed">
          Select any drug candidate card or click a graph node to inspect verified multi-modal provenance.
        </p>
      </div>
    );
  }

  const { drug, overall_score, score_breakdown, classification, biological_paths, evidence_items, limitations } = candidate;

  return (
    <div className="h-full overflow-y-auto p-4 space-y-5 text-xs text-gray-300">
      
      {/* Header Summary */}
      <div className="pb-3 border-b border-surface-border">
        <div className="flex items-center justify-between">
          <span className={`rounded px-2 py-0.5 text-[10px] font-mono font-semibold border ${getBadgeColorByClassification(classification)}`}>
            {classification}
          </span>
          <div className="text-right">
            <span className="text-xs text-gray-400 font-mono mr-1.5">Score:</span>
            <span className="text-base font-bold font-mono text-white">
              {formatScorePercent(overall_score)}
            </span>
          </div>
        </div>

        <h2 className="text-lg font-bold text-white mt-1.5 tracking-tight flex items-center space-x-1.5">
          <span>{drug.name}</span>
        </h2>

        <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-400 font-mono mt-1">
          {drug.chembl_id && <span>ChEMBL: <code className="text-gray-200">{drug.chembl_id}</code></span>}
          {drug.pubchem_cid && <span>• PubChem: <code className="text-gray-200">CID {drug.pubchem_cid}</code></span>}
          {drug.is_approved && (
            <span className="text-white font-medium">• Approved</span>
          )}
        </div>
      </div>

      {/* Mechanism Hypothesis */}
      <div className="rounded-lg bg-surface-raised border border-surface-border p-3 space-y-1.5 shadow-specular">
        <div className="flex items-center space-x-1.5 text-xs font-semibold text-white">
          <Dna className="h-3.5 w-3.5 text-gray-400" />
          <span>Biological Mechanism Hypothesis</span>
        </div>
        <p className="text-[11px] text-gray-300 leading-relaxed font-sans">{candidate.mechanism_hypothesis}</p>
      </div>

      {/* Mathematical Score Breakdown (Monochrome Progress Bars) */}
      <div className="space-y-2">
        <div className="flex items-center space-x-1.5 text-xs font-semibold text-white">
          <Activity className="h-3.5 w-3.5 text-gray-400" />
          <span>Explainable Score Breakdown</span>
        </div>

        <div className="space-y-2.5 rounded-lg bg-surface-raised border border-surface-border p-3 shadow-specular">
          <div>
            <div className="flex justify-between text-[11px] font-mono text-gray-200">
              <span className="text-gray-400">Target Association (30%)</span>
              <span className="text-white font-semibold">{formatScorePercent(score_breakdown.target_association)}</span>
            </div>
            <div className="w-full bg-background rounded-full h-1 mt-1 overflow-hidden">
              <div className="bg-white h-1 rounded-full" style={{ width: `${score_breakdown.target_association * 100}%` }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] font-mono text-gray-200">
              <span className="text-gray-400">Pathway Overlap (20%)</span>
              <span className="text-gray-200 font-semibold">{formatScorePercent(score_breakdown.pathway_overlap)}</span>
            </div>
            <div className="w-full bg-background rounded-full h-1 mt-1 overflow-hidden">
              <div className="bg-neutral-300 h-1 rounded-full" style={{ width: `${score_breakdown.pathway_overlap * 100}%` }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] font-mono text-gray-200">
              <span className="text-gray-400">Network Proximity (20%)</span>
              <span className="text-gray-300 font-semibold">{formatScorePercent(score_breakdown.network_proximity)}</span>
            </div>
            <div className="w-full bg-background rounded-full h-1 mt-1 overflow-hidden">
              <div className="bg-neutral-400 h-1 rounded-full" style={{ width: `${score_breakdown.network_proximity * 100}%` }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] font-mono text-gray-200">
              <span className="text-gray-400">Clinical Validation (15%)</span>
              <span className="text-gray-300 font-semibold">{formatScorePercent(score_breakdown.clinical_evidence)}</span>
            </div>
            <div className="w-full bg-background rounded-full h-1 mt-1 overflow-hidden">
              <div className="bg-neutral-400 h-1 rounded-full" style={{ width: `${score_breakdown.clinical_evidence * 100}%` }}></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[11px] font-mono text-gray-200">
              <span className="text-gray-400">Literature Citations (10%)</span>
              <span className="text-gray-400 font-semibold">{formatScorePercent(score_breakdown.publication_evidence)}</span>
            </div>
            <div className="w-full bg-background rounded-full h-1 mt-1 overflow-hidden">
              <div className="bg-neutral-500 h-1 rounded-full" style={{ width: `${score_breakdown.publication_evidence * 100}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Biological Reasoning Traversal Steps */}
      {biological_paths && biological_paths.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-white">
            <GitBranch className="h-3.5 w-3.5 text-gray-400" />
            <span>Biological Traversal Chains</span>
          </div>
          <div className="space-y-2">
            {biological_paths.map((p, idx) => (
              <div key={idx} className="rounded-lg bg-surface-raised border border-surface-border p-3 space-y-2 shadow-specular">
                <span className="font-mono text-[10px] uppercase font-bold text-white">{p.strategy} Strategy</span>
                <p className="text-[11px] text-gray-300 leading-relaxed font-sans">{p.description}</p>
                <div className="flex flex-wrap items-center gap-1 pt-1 font-mono text-[10px]">
                  {p.steps.map((step, sIdx) => (
                    <React.Fragment key={sIdx}>
                      <span className="rounded bg-background px-1.5 py-0.5 border border-surface-border text-gray-300">
                        <strong className="text-white">{step.node_type}:</strong> {step.node_name}
                      </span>
                      {sIdx < p.steps.length - 1 && <span className="text-gray-600">&rarr;</span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Multi-modal Evidence Items */}
      {evidence_items && evidence_items.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-white">
            <FileText className="h-3.5 w-3.5 text-gray-400" />
            <span>Multi-modal Provenance Items</span>
          </div>
          <div className="space-y-1.5">
            {evidence_items.map((ev, idx) => (
              <div key={idx} className="rounded-lg bg-surface-raised border border-surface-border p-2.5 space-y-1 shadow-specular">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white text-[11px]">{ev.title}</span>
                  <span className="rounded bg-white/10 px-1 py-0.2 text-[9px] font-mono text-gray-300 border border-white/20">
                    {ev.source}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed font-sans">{ev.detail}</p>
                {ev.source_url && (
                  <a
                    href={ev.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1 text-[10px] font-mono text-gray-300 hover:text-white pt-0.5 transition-colors"
                  >
                    <span>Inspect Record in {ev.source}</span>
                    <ExternalLink className="h-2.5 w-2.5 text-gray-400" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scientific Limitations (Monochrome) */}
      {limitations && limitations.length > 0 && (
        <div className="rounded-lg bg-surface-raised border border-surface-border p-3 space-y-1.5 shadow-specular">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-gray-200">
            <AlertCircle className="h-3.5 w-3.5 text-gray-400" />
            <span>Scientific Limitations & Caveats</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-[11px] text-gray-400 font-sans">
            {limitations.map((lim, idx) => (
              <li key={idx}>{lim}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
