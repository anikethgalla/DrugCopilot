'use client';

import React from 'react';
import { RepurposingCandidate } from '@/lib/types';
import { formatScorePercent, getBadgeColorByClassification } from '@/lib/utils';
import { ShieldCheck, GitMerge } from 'lucide-react';

interface CandidateCardProps {
  candidate: RepurposingCandidate;
  isSelected?: boolean;
  onSelect?: () => void;
}

export default function CandidateCard({
  candidate,
  isSelected = false,
  onSelect,
}: CandidateCardProps) {
  const { drug, overall_score, score_breakdown, classification, biological_paths } = candidate;

  return (
    <div
      onClick={onSelect}
      className={`group cursor-pointer rounded-xl border p-3.5 transition-all duration-150 ${
        isSelected
          ? 'bg-surface-raised border-white/80 shadow-specular-strong ring-1 ring-white/30'
          : 'bg-surface hover:bg-surface-raised border-surface-border shadow-specular'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold text-white tracking-tight truncate">{drug.name}</span>
            {drug.chembl_id && (
              <span className="rounded bg-background px-1.5 py-0.2 font-mono text-[10px] text-gray-400 border border-surface-border shrink-0">
                {drug.chembl_id}
              </span>
            )}
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <span className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-mono font-semibold border ${getBadgeColorByClassification(classification)}`}>
              {classification}
            </span>
            {drug.is_approved && (
              <span className="inline-flex items-center space-x-1 rounded bg-white/10 border border-white/20 px-1.5 py-0.5 text-[10px] font-medium text-white">
                <ShieldCheck className="h-3 w-3 text-gray-300" />
                <span>FDA Approved</span>
              </span>
            )}
            {drug.max_clinical_phase && !drug.is_approved && (
              <span className="rounded bg-surface-overlay px-1.5 py-0.5 text-[10px] font-mono text-gray-400 border border-surface-border">
                Phase {drug.max_clinical_phase}
              </span>
            )}
          </div>
        </div>

        {/* Score Pill */}
        <div className="text-right shrink-0">
          <div className="flex items-baseline justify-end space-x-0.5">
            <span className="text-xl font-bold font-mono tracking-tight text-white">
              {formatScorePercent(overall_score)}
            </span>
          </div>
          <div className="text-[9px] uppercase font-mono text-gray-400 tracking-wider">
            Evidence
          </div>
        </div>
      </div>

      {/* Breakdown Metrics Grid (Monochrome) */}
      <div className="mt-3 grid grid-cols-3 gap-1.5 text-[11px] font-mono">
        <div className="rounded bg-background/80 border border-surface-border/70 px-2 py-1.5">
          <div className="text-gray-400 text-[9px] uppercase">Target Match</div>
          <div className="font-semibold text-white mt-0.5">{formatScorePercent(score_breakdown.target_association)}</div>
        </div>
        <div className="rounded bg-background/80 border border-surface-border/70 px-2 py-1.5">
          <div className="text-gray-400 text-[9px] uppercase">Pathway Match</div>
          <div className="font-semibold text-gray-200 mt-0.5">{formatScorePercent(score_breakdown.pathway_overlap)}</div>
        </div>
        <div className="rounded bg-background/80 border border-surface-border/70 px-2 py-1.5">
          <div className="text-gray-400 text-[9px] uppercase">Clinical Trials</div>
          <div className="font-semibold text-gray-300 mt-0.5">{formatScorePercent(score_breakdown.clinical_evidence)}</div>
        </div>
      </div>

      {/* Biological Reasoning Traversal Path */}
      {biological_paths && biological_paths.length > 0 && (
        <div className="mt-2.5 rounded bg-background/60 border border-surface-border/50 p-2 text-[11px] text-gray-300">
          <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 mb-1">
            <span className="flex items-center space-x-1 text-gray-200">
              <GitMerge className="h-3 w-3 text-gray-400" />
              <span>{biological_paths[0].strategy} Path</span>
            </span>
            <span className="text-gray-500">View in Drawer &rarr;</span>
          </div>
          <p className="line-clamp-2 text-gray-300 leading-relaxed font-sans">{biological_paths[0].description}</p>
        </div>
      )}
    </div>
  );
}
