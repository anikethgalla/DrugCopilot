'use client';

import React from 'react';
import { RepurposingCandidate } from '@/lib/types';
import { formatScorePercent, getBadgeColorByClassification } from '@/lib/utils';
import { 
  FileText, 
  ExternalLink, 
  AlertOctagon, 
  Activity, 
  Dna, 
  FlaskConical, 
  CheckCircle2, 
  HelpCircle,
  Pill,
  GitBranch
} from 'lucide-react';

interface EvidenceDrawerProps {
  candidate: RepurposingCandidate | null;
  onClose?: () => void;
}

export default function EvidenceDrawer({ candidate, onClose }: EvidenceDrawerProps) {
  if (!candidate) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-gray-500">
        <Activity className="h-12 w-12 text-gray-600 mb-3" />
        <h4 className="text-base font-semibold text-gray-300">No Candidate Selected</h4>
        <p className="text-xs text-gray-400 mt-1">
          Click any candidate card or knowledge graph node to inspect multi-modal evidence and verified provenance.
        </p>
      </div>
    );
  }

  const { drug, overall_score, score_breakdown, classification, biological_paths, evidence_items, limitations } = candidate;

  return (
    <div className="h-full overflow-y-auto p-5 space-y-6 text-xs text-gray-300">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <span className={`rounded-full border px-2.5 py-0.5 font-semibold ${getBadgeColorByClassification(classification)}`}>
            {classification}
          </span>
          <span className="text-xl font-black text-cyan-400">
            Score: {formatScorePercent(overall_score)}
          </span>
        </div>
        <h2 className="text-xl font-bold text-white mt-2 flex items-center space-x-2">
          <Pill className="h-5 w-5 text-cyan-400" />
          <span>{drug.name}</span>
        </h2>
        <div className="flex items-center space-x-2 text-gray-400 mt-1">
          <span>ChEMBL: <code>{drug.chembl_id || 'N/A'}</code></span>
          {drug.pubchem_cid && <span>• PubChem: <code>CID {drug.pubchem_cid}</code></span>}
        </div>
      </div>

      {/* Mechanism Hypothesis */}
      <div className="rounded-xl bg-surface-raised border border-surface-border p-3.5 space-y-1.5">
        <h4 className="font-bold text-white flex items-center space-x-1.5">
          <Dna className="h-4 w-4 text-blue-400" />
          <span>Biological Mechanism Hypothesis</span>
        </h4>
        <p className="text-gray-300 leading-relaxed">{candidate.mechanism_hypothesis}</p>
      </div>

      {/* Mathematical Score Breakdown */}
      <div className="space-y-3">
        <h4 className="font-bold text-white flex items-center space-x-1.5">
          <Activity className="h-4 w-4 text-cyan-400" />
          <span>Explainable Score Derivation</span>
        </h4>
        <div className="space-y-2 rounded-xl bg-surface-raised border border-surface-border p-3.5">
          <div>
            <div className="flex justify-between font-medium text-gray-200">
              <span>Direct Target Association (30%)</span>
              <span className="text-blue-400">{formatScorePercent(score_breakdown.target_association)}</span>
            </div>
            <div className="w-full bg-background rounded-full h-1.5 mt-1 overflow-hidden">
              <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${score_breakdown.target_association * 100}%` }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between font-medium text-gray-200">
              <span>Pathway Overlap (20%)</span>
              <span className="text-amber-400">{formatScorePercent(score_breakdown.pathway_overlap)}</span>
            </div>
            <div className="w-full bg-background rounded-full h-1.5 mt-1 overflow-hidden">
              <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${score_breakdown.pathway_overlap * 100}%` }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between font-medium text-gray-200">
              <span>Network Proximity (20%)</span>
              <span className="text-purple-400">{formatScorePercent(score_breakdown.network_proximity)}</span>
            </div>
            <div className="w-full bg-background rounded-full h-1.5 mt-1 overflow-hidden">
              <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${score_breakdown.network_proximity * 100}%` }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between font-medium text-gray-200">
              <span>Clinical Validation (15%)</span>
              <span className="text-pink-400">{formatScorePercent(score_breakdown.clinical_evidence)}</span>
            </div>
            <div className="w-full bg-background rounded-full h-1.5 mt-1 overflow-hidden">
              <div className="bg-pink-500 h-1.5 rounded-full" style={{ width: `${score_breakdown.clinical_evidence * 100}%` }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between font-medium text-gray-200">
              <span>Literature Evidence (10%)</span>
              <span className="text-emerald-400">{formatScorePercent(score_breakdown.publication_evidence)}</span>
            </div>
            <div className="w-full bg-background rounded-full h-1.5 mt-1 overflow-hidden">
              <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${score_breakdown.publication_evidence * 100}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Biological Paths */}
      {biological_paths && biological_paths.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-bold text-white flex items-center space-x-1.5">
            <GitBranch className="h-4 w-4 text-emerald-400" />
            <span>Biological Reasoning Traversal</span>
          </h4>
          <div className="space-y-2">
            {biological_paths.map((p, idx) => (
              <div key={idx} className="rounded-xl bg-surface-raised border border-surface-border p-3 space-y-2">
                <span className="font-semibold text-emerald-300">{p.strategy}</span>
                <p className="text-gray-400">{p.description}</p>
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {p.steps.map((step, sIdx) => (
                    <React.Fragment key={sIdx}>
                      <span className="rounded bg-background px-2 py-1 text-[11px] font-mono border border-surface-border">
                        <strong>{step.node_type}:</strong> {step.node_name}
                      </span>
                      {sIdx < p.steps.length - 1 && <span className="text-gray-500">&rarr;</span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Evidence Items */}
      {evidence_items && evidence_items.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-bold text-white flex items-center space-x-1.5">
            <FileText className="h-4 w-4 text-blue-400" />
            <span>Multi-modal Provenance Items</span>
          </h4>
          <div className="space-y-2">
            {evidence_items.map((ev, idx) => (
              <div key={idx} className="rounded-xl bg-surface-raised border border-surface-border p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">{ev.title}</span>
                  <span className="rounded bg-blue-500/10 px-1.5 py-0.5 text-blue-300 font-mono">
                    {ev.source}
                  </span>
                </div>
                <p className="text-gray-400">{ev.detail}</p>
                {ev.source_url && (
                  <a
                    href={ev.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1 text-blue-400 hover:text-blue-300 pt-1"
                  >
                    <span>View in {ev.source}</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Limitations Disclosures */}
      {limitations && limitations.length > 0 && (
        <div className="rounded-xl bg-amber-950/20 border border-amber-500/30 p-3.5 space-y-2">
          <h4 className="font-bold text-amber-300 flex items-center space-x-1.5">
            <AlertOctagon className="h-4 w-4 text-amber-400" />
            <span>Scientific Limitations & Caveats</span>
          </h4>
          <ul className="list-disc list-inside space-y-1 text-amber-200/80">
            {limitations.map((lim, idx) => (
              <li key={idx}>{lim}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
