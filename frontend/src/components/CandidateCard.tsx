'use client';

import React from 'react';
import { RepurposingCandidate } from '@/lib/types';
import { formatScorePercent, getBadgeColorByClassification } from '@/lib/utils';
import { Pill, ShieldCheck, ArrowRight, Dna, GitMerge, ExternalLink } from 'lucide-react';

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
      className={`cursor-pointer rounded-xl border p-4 transition-all duration-200 ${
        isSelected
          ? 'bg-blue-950/30 border-blue-500/80 shadow-lg shadow-blue-500/10'
          : 'bg-surface hover:bg-surface-raised border-surface-border'
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <Pill className="h-5 w-5 text-cyan-400" />
            <h3 className="text-base font-bold text-white">{drug.name}</h3>
            {drug.chembl_id && (
              <span className="rounded bg-surface-raised border border-surface-border px-1.5 py-0.5 text-xs text-gray-400 font-mono">
                {drug.chembl_id}
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center space-x-2">
            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getBadgeColorByClassification(classification)}`}>
              {classification}
            </span>
            {drug.is_approved && (
              <span className="inline-flex items-center space-x-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-xs font-medium text-emerald-300">
                <ShieldCheck className="h-3 w-3" />
                <span>FDA/EMA Approved</span>
              </span>
            )}
          </div>
        </div>

        {/* Overall Score Badge */}
        <div className="text-right">
          <div className="text-2xl font-black tracking-tight text-cyan-400">
            {formatScorePercent(overall_score)}
          </div>
          <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
            Evidence Score
          </div>
        </div>
      </div>

      {/* Score Bars */}
      <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
        <div className="rounded-lg bg-surface-raised p-2">
          <div className="text-gray-400">Target Match</div>
          <div className="font-semibold text-blue-400">{formatScorePercent(score_breakdown.target_association)}</div>
        </div>
        <div className="rounded-lg bg-surface-raised p-2">
          <div className="text-gray-400">Pathway Overlap</div>
          <div className="font-semibold text-amber-400">{formatScorePercent(score_breakdown.pathway_overlap)}</div>
        </div>
        <div className="rounded-lg bg-surface-raised p-2">
          <div className="text-gray-400">Clinical Valid.</div>
          <div className="font-semibold text-pink-400">{formatScorePercent(score_breakdown.clinical_evidence)}</div>
        </div>
      </div>

      {/* Biological Reasoning Path Preview */}
      {biological_paths && biological_paths.length > 0 && (
        <div className="mt-3 rounded-lg bg-background/60 border border-surface-border/50 p-2.5 text-xs text-gray-300">
          <div className="flex items-center space-x-1.5 font-semibold text-gray-200 mb-1">
            <GitMerge className="h-3.5 w-3.5 text-blue-400" />
            <span>Biological Path ({biological_paths[0].strategy})</span>
          </div>
          <p className="line-clamp-2 text-gray-400">{biological_paths[0].description}</p>
        </div>
      )}
    </div>
  );
}
