'use client';

import React, { useState, useEffect } from 'react';
import { fetchDrugs, fetchDrugById } from '@/lib/api';
import { Drug } from '@/lib/types';
import { Pill, ShieldCheck, Search, ExternalLink, Dna, Activity } from 'lucide-react';

export default function DrugsPage() {
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDrug, setSelectedDrug] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDrugs().then((data) => {
      setDrugs(data);
      if (data.length > 0) {
        fetchDrugById(data[0].canonical_id).then(setSelectedDrug);
      }
      setLoading(false);
    });
  }, []);

  const handleSelectDrug = async (drugId: string) => {
    const details = await fetchDrugById(drugId);
    setSelectedDrug(details);
  };

  const filtered = drugs.filter((d) =>
    d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.canonical_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Pill className="h-6 w-6 text-cyan-400" />
            <span>Drug Directory & Target Profiles</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Canonical molecules ingested from ChEMBL & PubChem with pharmacological targets and indications.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter drugs..."
            className="w-full rounded-xl bg-surface border border-surface-border pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Drugs List */}
        <div className="lg:col-span-5 space-y-2 max-h-[calc(100vh-14rem)] overflow-y-auto pr-1">
          {filtered.map((d) => (
            <div
              key={d.canonical_id}
              onClick={() => handleSelectDrug(d.canonical_id)}
              className={`cursor-pointer rounded-xl border p-3.5 transition-all ${
                selectedDrug?.drug?.canonical_id === d.canonical_id
                  ? 'bg-blue-950/30 border-blue-500/80 shadow-md shadow-blue-500/10'
                  : 'bg-surface hover:bg-surface-raised border-surface-border'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">{d.name}</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="font-mono text-[11px] text-cyan-400">{d.canonical_id}</span>
                    {d.is_approved && (
                      <span className="inline-flex items-center rounded-full bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.2 text-[10px] font-medium text-emerald-400">
                        Approved
                      </span>
                    )}
                  </div>
                </div>
                {d.max_clinical_phase !== undefined && (
                  <span className="rounded bg-surface-raised border border-surface-border px-2 py-0.5 text-xs text-gray-300 font-mono">
                    Phase {d.max_clinical_phase}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Drug Details Panel */}
        <div className="lg:col-span-7 bg-surface border border-surface-border rounded-2xl p-6 space-y-6">
          {selectedDrug ? (
            <>
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black text-white">{selectedDrug.drug.name}</h2>
                  {selectedDrug.drug.chembl_id && (
                    <a
                      href={`https://www.ebi.ac.uk/chembl/compound_report_card/${selectedDrug.drug.chembl_id}/`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-1 text-xs text-blue-400 hover:text-blue-300"
                    >
                      <span>ChEMBL Card</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1 font-mono">{selectedDrug.drug.canonical_id}</p>
              </div>

              {/* Chemical Info */}
              {selectedDrug.drug.smiles && (
                <div className="rounded-xl bg-background border border-surface-border p-3.5 space-y-1">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Canonical SMILES</span>
                  <p className="font-mono text-xs text-cyan-300 break-all">{selectedDrug.drug.smiles}</p>
                </div>
              )}

              {/* Targets */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Dna className="h-4 w-4 text-blue-400" />
                  <span>Target Proteins ({selectedDrug.targets?.length || 0})</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedDrug.targets?.map((tgt: any, idx: number) => (
                    <div key={idx} className="rounded-xl bg-surface-raised border border-surface-border p-3 text-xs">
                      <div className="font-semibold text-white">{tgt.name || tgt.uniprot_id}</div>
                      <div className="text-gray-400 text-[11px] font-mono mt-0.5">{tgt.uniprot_id}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Indications */}
              {selectedDrug.indications && selectedDrug.indications.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-emerald-400" />
                    <span>Clinical Indications ({selectedDrug.indications.length})</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedDrug.indications.map((ind: any, idx: number) => (
                      <span key={idx} className="rounded-lg bg-surface-raised border border-surface-border px-3 py-1 text-xs text-gray-200">
                        {ind.name || ind.canonical_id}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500 text-xs">
              Select a drug from the left to view target biology and pharmacology.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
