'use client';

import React, { useState, useEffect } from 'react';
import { fetchClinicalTrials } from '@/lib/api';
import { FlaskConical, Search, ExternalLink, Calendar, Users, Building2, Filter } from 'lucide-react';

export default function TrialsPage() {
  const [trials, setTrials] = useState<any[]>([]);
  const [condition, setCondition] = useState('Alzheimer');
  const [drug, setDrug] = useState('');
  const [loading, setLoading] = useState(false);

  const searchTrials = async () => {
    setLoading(true);
    try {
      const data = await fetchClinicalTrials(condition, drug);
      setTrials(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    searchTrials();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
          <FlaskConical className="h-5 w-5 text-biomedical-trial" />
          <span>ClinicalTrials.gov Real-time Search</span>
        </h1>
        <p className="text-xs text-gray-400 mt-0.5">
          Live human clinical trials with NCT accession codes, clinical phases (1-4), recruitment status, and sponsors.
        </p>
      </div>

      {/* Filter Form */}
      <div className="flex flex-wrap items-end gap-3 bg-surface border border-surface-border rounded-xl p-3.5 shadow-card">
        <div className="flex-1 min-w-[220px]">
          <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block mb-1">
            Condition / Disease
          </label>
          <input
            type="text"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            placeholder="e.g. Alzheimer's Disease, Parkinson's"
            className="w-full rounded-md bg-background border border-surface-border px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 font-sans"
          />
        </div>

        <div className="flex-1 min-w-[220px]">
          <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block mb-1">
            Drug / Intervention
          </label>
          <input
            type="text"
            value={drug}
            onChange={(e) => setDrug(e.target.value)}
            placeholder="e.g. Donepezil, Metformin, Rapamycin"
            className="w-full rounded-md bg-background border border-surface-border px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 font-sans"
          />
        </div>

        <div>
          <button
            onClick={searchTrials}
            disabled={loading}
            className="rounded-md bg-brand-600 hover:bg-brand-500 disabled:opacity-50 px-4 py-1.5 text-xs font-semibold text-white shadow-specular-strong transition-colors"
          >
            {loading ? 'Searching API...' : 'Search Trials'}
          </button>
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-2.5">
        {trials.length === 0 && !loading ? (
          <div className="rounded-xl bg-surface border border-surface-border p-12 text-center text-gray-500 text-xs shadow-card">
            No clinical trials found matching the search criteria.
          </div>
        ) : (
          trials.map((t, idx) => (
            <div key={idx} className="rounded-xl bg-surface border border-surface-border p-4 space-y-2.5 shadow-card hover:border-surface-border-subtle transition-all">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-biomedical-trial">{t.nct_id}</span>
                    <span className="rounded bg-surface-raised border border-surface-border px-1.5 py-0.2 text-[10px] font-mono text-gray-300">
                      {t.phase || 'Phase N/A'}
                    </span>
                    <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 text-[10px] font-mono text-emerald-400">
                      {t.status || 'Active'}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white tracking-tight leading-snug">{t.title}</h3>
                </div>

                {t.url && (
                  <a
                    href={t.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1 rounded-md bg-surface-raised hover:bg-surface-overlay border border-surface-border px-2.5 py-1 text-[11px] font-mono text-brand-300 hover:text-brand-200 transition-colors shadow-specular shrink-0"
                  >
                    <span>View NCT Study</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-gray-400 pt-2 border-t border-surface-border font-sans">
                <div>
                  <span className="font-semibold text-gray-300 block text-[10px] uppercase font-mono">Interventions</span>
                  <span className="text-gray-300">{t.interventions?.join(', ') || 'N/A'}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-300 block text-[10px] uppercase font-mono">Conditions</span>
                  <span className="text-gray-300">{t.conditions?.join(', ') || 'N/A'}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-300 block text-[10px] uppercase font-mono">Lead Sponsor</span>
                  <span className="text-gray-300">{t.sponsors?.join(', ') || 'N/A'}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
