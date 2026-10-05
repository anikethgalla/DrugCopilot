'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchDrugs, fetchDrugById } from '@/lib/api';
import { Drug } from '@/lib/types';
import { Pill, Search, ExternalLink, Dna, Activity, Bot, ArrowRight } from 'lucide-react';

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
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <Pill className="h-5 w-5 text-gray-300" />
            <span>Drug Directory & Pharmacological Targets</span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Canonical molecules ingested from ChEMBL & PubChem with verified target proteins and clinical indications.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search drug name or ChEMBL ID..."
            className="w-full rounded-lg bg-surface border border-surface-border pl-9 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-white/50 font-sans"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Drugs List (5 cols) */}
        <div className="lg:col-span-5 space-y-1.5 max-h-[calc(100vh-13rem)] overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-500 rounded-xl bg-surface border border-surface-border">
              No matching molecules found.
            </div>
          ) : (
            filtered.map((d) => (
              <div
                key={d.canonical_id}
                onClick={() => handleSelectDrug(d.canonical_id)}
                className={`cursor-pointer rounded-lg border p-3 transition-all ${
                  selectedDrug?.drug?.canonical_id === d.canonical_id
                    ? 'bg-surface-raised border-white/80 shadow-specular-strong ring-1 ring-white/30'
                    : 'bg-surface hover:bg-surface-raised border-surface-border shadow-specular'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white tracking-tight">{d.name}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="font-mono text-[10px] text-gray-400">{d.canonical_id}</span>
                      {d.is_approved && (
                        <span className="inline-flex items-center rounded bg-white/10 border border-white/20 px-1 py-0.2 text-[9px] font-mono text-white">
                          Approved
                        </span>
                      )}
                    </div>
                  </div>
                  {d.max_clinical_phase !== undefined && (
                    <span className="rounded bg-background border border-surface-border px-1.5 py-0.5 text-[10px] text-gray-400 font-mono">
                      Phase {d.max_clinical_phase}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drug Details Panel (7 cols) */}
        <div className="lg:col-span-7 bg-surface border border-surface-border rounded-xl p-5 space-y-5 shadow-card">
          {selectedDrug ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-border">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">{selectedDrug.drug.name}</h2>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">{selectedDrug.drug.canonical_id}</p>
                </div>
                
                <div className="flex items-center space-x-2">
                  {selectedDrug.drug.chembl_id && (
                    <a
                      href={`https://www.ebi.ac.uk/chembl/compound_report_card/${selectedDrug.drug.chembl_id}/`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-1 rounded-md bg-surface-raised hover:bg-surface-overlay border border-surface-border px-2.5 py-1.5 text-xs font-medium text-gray-300 transition-colors shadow-specular"
                    >
                      <span>ChEMBL Card</span>
                      <ExternalLink className="h-3 w-3 text-gray-400" />
                    </a>
                  )}
                  <Link
                    href={`/copilot?q=${encodeURIComponent(`Evaluate new repurposing indications for ${selectedDrug.drug.name}`)}`}
                    className="inline-flex items-center space-x-1.5 rounded-md bg-white hover:bg-neutral-200 px-3.5 py-1.5 text-xs font-bold text-black transition-colors shadow-specular-strong"
                  >
                    <Bot className="h-3.5 w-3.5 text-black" />
                    <span>Copilot</span>
                    <ArrowRight className="h-3 w-3 ml-0.5 text-black" />
                  </Link>
                </div>
              </div>

              {/* Chemical Properties */}
              {selectedDrug.drug.smiles && (
                <div className="rounded-lg bg-background border border-surface-border p-3 space-y-1">
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Canonical SMILES</span>
                  <p className="font-mono text-xs text-white break-all">{selectedDrug.drug.smiles}</p>
                </div>
              )}

              {/* Targets */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                  <Dna className="h-3.5 w-3.5 text-gray-300" />
                  <span>Target Proteins ({selectedDrug.targets?.length || 0})</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedDrug.targets?.map((tgt: any, idx: number) => (
                    <div key={idx} className="rounded-lg bg-surface-raised border border-surface-border p-2.5 text-xs shadow-specular">
                      <div className="font-semibold text-white">{tgt.name || tgt.uniprot_id}</div>
                      <div className="text-gray-400 text-[10px] font-mono mt-0.5">{tgt.uniprot_id}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Indications */}
              {selectedDrug.indications && selectedDrug.indications.length > 0 && (
                <div className="space-y-2.5 pt-2 border-t border-surface-border">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                    <Activity className="h-3.5 w-3.5 text-gray-300" />
                    <span>Approved & Investigational Indications ({selectedDrug.indications.length})</span>
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedDrug.indications.map((ind: any, idx: number) => (
                      <span key={idx} className="rounded bg-surface-raised border border-surface-border px-2.5 py-1 text-[11px] text-gray-300 shadow-specular">
                        {ind.name || ind.canonical_id}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500 text-xs">
              Select a drug to view pharmacology, targets, and indications.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
