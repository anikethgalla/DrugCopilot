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
  GitBranch,
  Pill,
} from 'lucide-react';

interface EvidenceDrawerProps {
  candidate: RepurposingCandidate | null;
  onClose?: () => void;
}

export default function EvidenceDrawer({ candidate }: EvidenceDrawerProps) {
  if (!candidate) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center">
            <Activity className="h-8 w-8 text-zinc-500" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-zinc-800 border border-white/20 flex items-center justify-center">
            <Pill className="h-3 w-3 text-white" />
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-zinc-300">No Candidate Selected</h4>
          <p className="text-xs text-zinc-500 max-w-xs leading-relaxed mt-1.5">
            Select any drug candidate card or click a graph node to inspect verified multi-modal provenance.
          </p>
        </div>
      </div>
    );
  }

  const { drug, overall_score, score_breakdown, classification, biological_paths, evidence_items, limitations } = candidate;

  return (
    <div className="h-full overflow-y-auto p-4 space-y-5 text-xs text-zinc-300">
      
      {/* Header Summary */}
      <div className="pb-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-mono font-bold border ${getBadgeColorByClassification(classification)}`}>
            {classification}
          </span>
          <div className="text-right">
            <span className="text-[10px] text-zinc-500 font-mono mr-1.5">Score:</span>
            <span className="text-lg font-bold font-mono text-white">
              {formatScorePercent(overall_score)}
            </span>
          </div>
        </div>

        <h2 className="text-base font-bold text-white mt-2 tracking-tight flex items-center space-x-2">
          <Pill className="h-4 w-4 text-white shrink-0" />
          <span>{drug.name}</span>
        </h2>

        <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-400 font-mono mt-1.5">
          {drug.chembl_id && <span>ChEMBL: <code className="text-zinc-200">{drug.chembl_id}</code></span>}
          {drug.pubchem_cid && <span>• PubChem: <code className="text-zinc-200">CID {drug.pubchem_cid}</code></span>}
          {drug.is_approved && (
            <span className="text-white font-medium">• ✓ FDA Approved</span>
          )}
        </div>
      </div>

      {/* Mechanism Hypothesis */}
      <div className="rounded-xl bg-black/60 border border-white/10 p-3.5 space-y-2">
        <div className="flex items-center space-x-2 text-xs font-semibold text-white">
          <Dna className="h-4 w-4 text-zinc-400" />
          <span>Biological Mechanism Hypothesis</span>
        </div>
        <p className="text-[12px] text-zinc-300 leading-relaxed font-sans">{candidate.mechanism_hypothesis}</p>
      </div>

      {/* Score Breakdown with Pure White Progress Bars */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2 text-xs font-semibold text-white">
          <Activity className="h-4 w-4 text-zinc-400" />
          <span>Explainable Score Breakdown</span>
        </div>

        <div className="space-y-3 rounded-xl bg-black/60 border border-white/10 p-3.5">
          {[
            { label: 'Target Association', weight: '30%', value: score_breakdown.target_association },
            { label: 'Pathway Overlap', weight: '20%', value: score_breakdown.pathway_overlap },
            { label: 'Network Proximity', weight: '20%', value: score_breakdown.network_proximity },
            { label: 'Clinical Validation', weight: '15%', value: score_breakdown.clinical_evidence },
            { label: 'Literature Citations', weight: '10%', value: score_breakdown.publication_evidence },
          ].map((item) => (
            <div key={item.label}>
              <div className="flex justify-between text-[11px] font-mono text-zinc-300 mb-1">
                <span className="text-zinc-400">{item.label} ({item.weight})</span>
                <span className="text-white font-semibold">{formatScorePercent(item.value)}</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-white h-1.5 rounded-full animate-fill" 
                  style={{ width: `${item.value * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Biological Reasoning Traversal Steps */}
      {biological_paths && biological_paths.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-xs font-semibold text-white">
            <GitBranch className="h-4 w-4 text-zinc-400" />
            <span>Biological Traversal Chains</span>
          </div>
          <div className="space-y-2.5">
            {biological_paths.map((p, idx) => (
              <div key={idx} className="rounded-xl bg-black/60 border border-white/10 p-3.5 space-y-2">
                <span className="font-mono text-[10px] uppercase font-bold text-white">{p.strategy} Strategy</span>
                <p className="text-[12px] text-zinc-300 leading-relaxed font-sans">{p.description}</p>
                <div className="flex flex-wrap items-center gap-1.5 pt-1 font-mono text-[10px]">
                  {p.steps.map((step, sIdx) => (
                    <React.Fragment key={sIdx}>
                      <span className="rounded-lg bg-zinc-900 px-2 py-1 border border-white/10 text-zinc-300">
                        <strong className="text-white">{step.node_type}:</strong> {step.node_name}
                      </span>
                      {sIdx < p.steps.length - 1 && <span className="text-zinc-600">→</span>}
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
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-xs font-semibold text-white">
            <FileText className="h-4 w-4 text-zinc-400" />
            <span>Multi-modal Provenance Items</span>
          </div>
          <div className="space-y-2">
            {evidence_items.map((ev, idx) => (
              <div key={idx} className="rounded-xl bg-black/60 border border-white/10 p-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white text-[12px]">{ev.title}</span>
                  <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-[9px] font-mono text-zinc-300 border border-white/10">
                    {ev.source}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">{ev.detail}</p>
                {ev.source_url && (
                  <a
                    href={ev.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1.5 text-[10px] font-mono text-white hover:underline pt-0.5 transition-colors"
                  >
                    <span>Inspect Record in {ev.source}</span>
                    <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scientific Limitations */}
      {limitations && limitations.length > 0 && (
        <div className="rounded-xl bg-zinc-900 border border-white/10 p-3.5 space-y-2">
          <div className="flex items-center space-x-2 text-xs font-semibold text-zinc-200">
            <AlertCircle className="h-4 w-4 text-zinc-400" />
            <span>Scientific Limitations & Caveats</span>
          </div>
          <ul className="list-disc list-inside space-y-1.5 text-[11px] text-zinc-400 font-sans">
            {limitations.map((lim, idx) => (
              <li key={idx}>{lim}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
