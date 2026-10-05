'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchDiseases, fetchDiseaseById } from '@/lib/api';
import { Disease } from '@/lib/types';
import { Dna, Bot, Search, Activity, ArrowRight, Layers, Network } from 'lucide-react';

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
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <Dna className="h-5 w-5 text-gray-300" />
            <span>Disease Ontology & Genetic Targets</span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            EFO / MONDO disease entities mapped to Open Targets genetic scores and Reactome pathways.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search disease name or ontology ID..."
            className="w-full rounded-lg bg-surface border border-surface-border pl-9 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-white/50 font-sans"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Diseases List (5 cols) */}
        <div className="lg:col-span-5 space-y-1.5 max-h-[calc(100vh-13rem)] overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-500 rounded-xl bg-surface border border-surface-border">
              No matching diseases found.
            </div>
          ) : (
            filtered.map((d) => (
              <div
                key={d.canonical_id}
                onClick={() => handleSelectDisease(d.canonical_id)}
                className={`cursor-pointer rounded-lg border p-3 transition-all ${
                  selectedDisease?.disease?.canonical_id === d.canonical_id
                    ? 'bg-surface-raised border-white/80 shadow-specular-strong ring-1 ring-white/30'
                    : 'bg-surface hover:bg-surface-raised border-surface-border shadow-specular'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white tracking-tight">{d.name || d.canonical_id}</h4>
                    <span className="font-mono text-[10px] text-gray-400 mt-0.5 block">{d.canonical_id}</span>
                  </div>
                  {d.efo_id && (
                    <span className="rounded bg-background border border-surface-border px-1.5 py-0.2 text-[10px] text-gray-400 font-mono">
                      {d.efo_id}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Disease Details Panel (7 cols) */}
        <div className="lg:col-span-7 bg-surface border border-surface-border rounded-xl p-5 space-y-5 shadow-card">
          {selectedDisease ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-surface-border">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">{selectedDisease.disease.name || selectedDisease.disease.canonical_id}</h2>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">{selectedDisease.disease.canonical_id}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Link
                    href={`/explore`}
                    className="inline-flex items-center space-x-1 rounded-md bg-surface-raised hover:bg-surface-overlay border border-surface-border px-3 py-1.5 text-xs font-medium text-gray-300 transition-colors shadow-specular"
                  >
                    <Network className="h-3.5 w-3.5 text-gray-300" />
                    <span>Explore Graph</span>
                  </Link>
                  <Link
                    href={`/copilot?disease=${encodeURIComponent(selectedDisease.disease.name || selectedDisease.disease.canonical_id)}`}
                    className="inline-flex items-center space-x-1.5 rounded-md bg-white hover:bg-neutral-200 px-3.5 py-1.5 text-xs font-bold text-black transition-colors shadow-specular-strong"
                  >
                    <Bot className="h-3.5 w-3.5 text-black" />
                    <span>Repurpose in Copilot</span>
                    <ArrowRight className="h-3 w-3 ml-0.5 text-black" />
                  </Link>
                </div>
              </div>

              {/* Associated Target Genes */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                    <Activity className="h-3.5 w-3.5 text-gray-300" />
                    <span>Genetic Target Drivers ({selectedDisease.associated_genes?.length || 0})</span>
                  </h3>
                  <span className="text-[10px] font-mono text-gray-400">Open Targets L2G / GWAS</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedDisease.associated_genes?.map((g: any, idx: number) => (
                    <div key={idx} className="rounded-lg bg-surface-raised border border-surface-border p-2.5 text-xs shadow-specular">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white font-mono">{g.symbol || g.name}</span>
                        {g.score && (
                          <span className="text-white font-mono text-[11px] font-semibold">{Math.round(g.score * 100)}% Match</span>
                        )}
                      </div>
                      <div className="text-gray-400 text-[10px] font-mono mt-1">{g.canonical_id}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Biological Pathways */}
              {selectedDisease.pathways && selectedDisease.pathways.length > 0 && (
                <div className="space-y-2.5 pt-2 border-t border-surface-border">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                    <Layers className="h-3.5 w-3.5 text-gray-300" />
                    <span>Reactome Biological Pathways ({selectedDisease.pathways.length})</span>
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedDisease.pathways.map((pw: any, idx: number) => (
                      <span key={idx} className="rounded bg-surface-raised border border-surface-border px-2.5 py-1 text-[11px] text-gray-300 shadow-specular">
                        {pw.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500 text-xs">
              Select a disease from the list to view its genetic targets and pathways.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
