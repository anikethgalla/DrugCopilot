'use client';

import React, { useState, useEffect } from 'react';
import { fetchEvidenceSummary } from '@/lib/api';
import { FileCheck2, Database, ShieldCheck, CheckCircle2, Layers, ExternalLink } from 'lucide-react';

export default function EvidencePage() {
  const [summary, setSummary] = useState<any | null>(null);

  useEffect(() => {
    fetchEvidenceSummary().then(setSummary).catch(console.error);
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
          <FileCheck2 className="h-6 w-6 text-emerald-400" />
          <span>Biomedical Evidence & Provenance Standard</span>
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Every entity, relationship, and computational repurposing score is backed by verified provenance records from official databases.
        </p>
      </div>

      {/* Provenance Standard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl bg-surface border border-surface-border p-6 space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Database className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-white">W3C PROV-DM Alignment</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            All graph relationships retain data provider attributes: <code>source</code>, <code>source_id</code>, <code>retrieved_at</code>, <code>confidence</code>, and <code>source_url</code>.
          </p>
        </div>

        <div className="rounded-2xl bg-surface border border-surface-border p-6 space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-white">Canonical ID Resolution</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Automatic entity resolution resolves synonyms to ChEMBL IDs, UniProtKB accessions, Ensembl IDs, EFO terms, NCT IDs, and PMIDs with uniqueness constraints.
          </p>
        </div>

        <div className="rounded-2xl bg-surface border border-surface-border p-6 space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Layers className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-white">Transparent Math Derivations</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Every candidate evidence breakdown provides human-readable mathematical derivations with zero synthetic numbers.
          </p>
        </div>
      </div>

      {/* Active Data Source Summary */}
      <div className="rounded-2xl bg-surface border border-surface-border p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center space-x-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          <span>Integrated Real-World Biomedical Data Sources</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="rounded-xl bg-surface-raised border border-surface-border p-4 space-y-2">
            <div className="font-bold text-cyan-400">ChEMBL (EMBL-EBI)</div>
            <p className="text-gray-400">Approved drugs, small molecules, mechanisms of action, target bioactivities (IC50/Ki), clinical indications.</p>
            <a href="https://www.ebi.ac.uk/chembl/" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline inline-flex items-center space-x-1">
              <span>chembl.ebi.ac.uk</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="rounded-xl bg-surface-raised border border-surface-border p-4 space-y-2">
            <div className="font-bold text-red-400">Open Targets Platform</div>
            <p className="text-gray-400">Target-disease genetic associations, GWAS credible sets, L2G causal predictions, Reactome pathways.</p>
            <a href="https://platform.opentargets.org/" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline inline-flex items-center space-x-1">
              <span>platform.opentargets.org</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="rounded-xl bg-surface-raised border border-surface-border p-4 space-y-2">
            <div className="font-bold text-blue-400">UniProtKB (UniProt Consortium)</div>
            <p className="text-gray-400">Curated human protein sequences, functional domain descriptions, enzyme classifications, cross-references.</p>
            <a href="https://www.uniprot.org/" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline inline-flex items-center space-x-1">
              <span>uniprot.org</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="rounded-xl bg-surface-raised border border-surface-border p-4 space-y-2">
            <div className="font-bold text-purple-400">NCBI PubChem</div>
            <p className="text-gray-400">Compound CIDs, Canonical/Isomeric SMILES, molecular formulas, molecular weights, IUPAC names.</p>
            <a href="https://pubchem.ncbi.nlm.nih.gov/" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline inline-flex items-center space-x-1">
              <span>pubchem.ncbi.nlm.nih.gov</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="rounded-xl bg-surface-raised border border-surface-border p-4 space-y-2">
            <div className="font-bold text-pink-400">ClinicalTrials.gov (NLM/NIH)</div>
            <p className="text-gray-400">Worldwide clinical studies, NCT identifiers, clinical phases (1-4), recruitment status, sponsors.</p>
            <a href="https://clinicaltrials.gov/" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline inline-flex items-center space-x-1">
              <span>clinicaltrials.gov</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="rounded-xl bg-surface-raised border border-surface-border p-4 space-y-2">
            <div className="font-bold text-emerald-400">PubMed / NCBI E-Utilities</div>
            <p className="text-gray-400">Peer-reviewed biomedical literature citations, PMIDs, journal metrics, abstracts, DOIs.</p>
            <a href="https://pubmed.ncbi.nlm.nih.gov/" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline inline-flex items-center space-x-1">
              <span>pubmed.ncbi.nlm.nih.gov</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
