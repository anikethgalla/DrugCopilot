'use client';

import React from 'react';
import { RepurposingCandidate } from '@/lib/types';
import { formatScorePercent, getBadgeColorByClassification } from '@/lib/utils';
import { ShieldCheck, GitMerge, Pill, ArrowRight } from 'lucide-react';

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
      className={`group cursor-pointer rounded-2xl border p-4 transition-all duration-300 ${
        isSelected
          ? 'bg-zinc-900 border-white/50 shadow-xl ring-1 ring-white/30'
          : 'bg-zinc-950/60 hover:bg-zinc-900/60 border-white/10 hover:border-white/25 shadow-md'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2.5">
            <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
              isSelected ? 'bg-white text-black' : 'bg-zinc-900 border border-white/10 text-zinc-400 group-hover:text-white'
            } transition-colors`}>
              <Pill className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm font-bold text-white tracking-tight truncate">{drug.name}</span>
            {drug.chembl_id && (
              <span className="rounded-full bg-zinc-900 px-2 py-0.5 font-mono text-[10px] text-zinc-400 border border-white/10 shrink-0">
                {drug.chembl_id}
              </span>
            )}
          </div>

          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold border ${getBadgeColorByClassification(classification)}`}>
              {classification}
            </span>
            {drug.is_approved && (
              <span className="inline-flex items-center space-x-1 rounded-full bg-white/10 border border-white/20 px-2 py-0.5 text-[10px] font-medium text-white">
                <ShieldCheck className="h-3 w-3 text-white" />
                <span>FDA Approved</span>
              </span>
            )}
            {drug.max_clinical_phase && !drug.is_approved && (
              <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] font-mono text-zinc-300 border border-white/10">
                Phase {drug.max_clinical_phase}
              </span>
            )}
          </div>
        </div>

        {/* Score Pill */}
        <div className="text-right shrink-0">
          <div className="flex items-baseline justify-end space-x-0.5">
            <span className="text-2xl font-bold font-mono tracking-tight text-white">
              {formatScorePercent(overall_score)}
            </span>
          </div>
          <div className="text-[9px] uppercase font-mono text-zinc-500 tracking-wider mt-0.5">
            Evidence
          </div>
        </div>
      </div>

      {/* Breakdown Metrics Grid */}
      <div className="mt-3.5 grid grid-cols-3 gap-2 text-[11px] font-mono">
        {[
          { label: 'Target Match', value: score_breakdown.target_association },
          { label: 'Pathway Match', value: score_breakdown.pathway_overlap },
          { label: 'Clinical Trials', value: score_breakdown.clinical_evidence },
        ].map((metric) => (
          <div key={metric.label} className="rounded-xl bg-black/60 border border-white/10 px-2.5 py-2">
            <div className="text-zinc-500 text-[9px] uppercase">{metric.label}</div>
            <div className="font-semibold text-white mt-0.5">{formatScorePercent(metric.value)}</div>
            {/* Monochrome Mini progress bar */}
            <div className="w-full bg-zinc-800 rounded-full h-1 mt-1.5 overflow-hidden">
              <div 
                className="h-1 rounded-full bg-white" 
                style={{ width: `${metric.value * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Biological Reasoning Traversal Path */}
      {biological_paths && biological_paths.length > 0 && (
        <div className="mt-3 rounded-xl bg-black/40 border border-white/10 p-3 text-[11px] text-zinc-300">
          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 mb-1.5">
            <span className="flex items-center space-x-1.5 text-zinc-200">
              <GitMerge className="h-3 w-3 text-white" />
              <span>{biological_paths[0].strategy} Path</span>
            </span>
            <span className="flex items-center space-x-1 text-zinc-400 group-hover:text-white transition-colors">
              <span>View in Drawer</span>
              <ArrowRight className="h-3 w-3" />
            </span>
          </div>
          <p className="line-clamp-2 text-zinc-400 leading-relaxed font-sans">{biological_paths[0].description}</p>
        </div>
      )}
    </div>
  );
}
