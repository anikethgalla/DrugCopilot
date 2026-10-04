'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchDiseases, fetchDiseaseById } from '@/lib/api';
import { Disease } from '@/lib/types';
import { Dna, Bot, Search, ExternalLink, Activity, ArrowRight } from 'lucide-react';

export default function DiseasesPage() {
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [selectedDisease, setSelectedDisease] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDiseases().then((data) => {
      setDiseases(data);
      if (data.length > 0) {
        fetchDiseaseById(data[0].canonical_id).then(setSelectedDisease);
      }
      setLoading(false);
    });
  }, []);

  const handleSelectDisease = async (diseaseId: string) => {
    const details = await fetchDiseaseById(diseaseId);
    setSelectedDisease(details);
  };

  const filtered = diseases.filter((d) =>
    d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.canonical_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Dna className="h-6 w-6 text-red-400" />
            <span>Disease Ontology & Target Associations</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Canonical disease entities mapped to Open Targets genetic scores, Reactome pathways, and known drugs.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter diseases..."
            className="w-full rounded-xl bg-surface border border-surface-border pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Diseases List */}
        <div className="lg:col-span-5 space-y-2 max-h-[calc(100vh-14rem)] overflow-y-auto pr-1">
          {filtered.map((d) => (
            <div
              key={d.canonical_id}
              onClick={() => handleSelectDisease(d.canonical_id)}
              className={`cursor-pointer rounded-xl border p-3.5 transition-all ${
                selectedDisease?.disease?.canonical_id === d.canonical_id
                  ? 'bg-blue-950/30 border-blue-500/80 shadow-md shadow-blue-500/10'
                  : 'bg-surface hover:bg-surface-raised border-surface-border'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">{d.name}</h4>
                  <span className="font-mono text-[11px] text-red-400 mt-1 block">{d.canonical_id}</span>
                </div>
                {d.efo_id && (
                  <span className="rounded bg-surface-raised border border-surface-border px-2 py-0.5 text-xs text-gray-300 font-mono">
                    {d.efo_id}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Disease Details Panel */}
        <div className="lg:col-span-7 bg-surface border border-surface-border rounded-2xl p-6 space-y-6">
          {selectedDisease ? (
            <>
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white">{selectedDisease.disease.name}</h2>
                  <p className="text-xs text-gray-400 mt-1 font-mono">{selectedDisease.disease.canonical_id}</p>
                </div>
                <Link
                  href={`/copilot?disease=${encodeURIComponent(selectedDisease.disease.name)}`}
                  className="inline-flex items-center space-x-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-500 shadow-md"
                >
                  <Bot className="h-4 w-4" />
                  <span>Repurpose in Copilot</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Associated Target Genes */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-blue-400" />
                  <span>Associated Target Genes ({selectedDisease.associated_genes?.length || 0})</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedDisease.associated_genes?.map((g: any, idx: number) => (
                    <div key={idx} className="rounded-xl bg-surface-raised border border-surface-border p-3 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white">{g.symbol || g.name}</span>
                        {g.score && (
                          <span className="text-blue-400 font-semibold">{Math.round(g.score * 100)}%</span>
                        )}
                      </div>
                      <div className="text-gray-400 text-[11px] font-mono mt-0.5">{g.canonical_id}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pathways */}
              {selectedDisease.pathways && selectedDisease.pathways.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-amber-400" />
                    <span>Pathways ({selectedDisease.pathways.length})</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedDisease.pathways.map((pw: any, idx: number) => (
                      <span key={idx} className="rounded-lg bg-surface-raised border border-surface-border px-3 py-1 text-xs text-gray-300">
                        {pw.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500 text-xs">
              Select a disease to view associated genetics and biology.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
