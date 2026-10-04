'use client';

import React, { useState, useEffect } from 'react';
import { fetchClinicalTrials } from '@/lib/api';
import { FlaskConical, Search, ExternalLink, Calendar, Users, Building2 } from 'lucide-react';

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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
          <FlaskConical className="h-6 w-6 text-pink-400" />
          <span>ClinicalTrials.gov Real-time Search</span>
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Query live human clinical trials with NCT identifiers, recruitment phases, interventions, and sponsors.
        </p>
      </div>

      {/* Filter Form */}
      <div className="flex flex-wrap items-center gap-3 bg-surface border border-surface-border rounded-xl p-4">
        <div className="flex-1 min-w-[200px]">
          <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
            Condition / Disease
          </label>
          <input
            type="text"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            placeholder="e.g. Alzheimer's Disease, Parkinson's"
            className="w-full rounded-lg bg-background border border-surface-border px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex-1 min-w-[200px]">
          <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
            Drug / Intervention
          </label>
          <input
            type="text"
            value={drug}
            onChange={(e) => setDrug(e.target.value)}
            placeholder="e.g. Donepezil, Metformin, Rapamycin"
            className="w-full rounded-lg bg-background border border-surface-border px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="self-end">
          <button
            onClick={searchTrials}
            disabled={loading}
            className="rounded-lg bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-500 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Searching...' : 'Search Trials'}
          </button>
        </div>
      </div>

      {/* Results List */}
      <div className="space-y-3">
        {trials.length === 0 && !loading ? (
          <div className="rounded-2xl bg-surface border border-surface-border p-12 text-center text-gray-500 text-xs">
            No clinical trials found matching the search criteria.
          </div>
        ) : (
          trials.map((t, idx) => (
            <div key={idx} className="rounded-xl bg-surface border border-surface-border p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-pink-400">{t.nct_id}</span>
                    <span className="rounded bg-surface-raised border border-surface-border px-2 py-0.5 text-[11px] font-semibold text-gray-300">
                      {t.phase}
                    </span>
                    <span className="rounded bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">
                      {t.status}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1.5">{t.title}</h3>
                </div>

                {t.url && (
                  <a
                    href={t.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1 rounded-lg bg-surface-raised border border-surface-border px-3 py-1.5 text-xs text-blue-400 hover:text-blue-300"
                  >
                    <span>View NCT Study</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-gray-400 pt-2 border-t border-surface-border">
                <div>
                  <span className="font-semibold text-gray-300 block">Interventions:</span>
                  <span className="text-gray-400">{t.interventions?.join(', ') || 'N/A'}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-300 block">Conditions:</span>
                  <span className="text-gray-400">{t.conditions?.join(', ') || 'N/A'}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-300 block">Sponsor:</span>
                  <span className="text-gray-400">{t.sponsors?.join(', ') || 'N/A'}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
