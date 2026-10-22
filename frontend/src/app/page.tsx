'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Bot, 
  Network, 
  ArrowRight, 
  Sparkles, 
  Cpu, 
  Database, 
  Activity, 
  ShieldCheck, 
  ArrowUpRight, 
  Layers, 
  Search,
  CheckCircle2,
  TrendingUp,
  FlaskConical,
  Dna,
  Pill,
  ExternalLink,
  ChevronRight,
  Zap,
  BarChart2,
  Compass
} from 'lucide-react';
import Capsule3DHero from '@/components/Capsule3DHero';

interface DrugCandidate {
  id: string;
  name: string;
  chemblId: string;
  originalIndication: string;
  repurposedIndication: string;
  mechanism: string;
  target: string;
  targetUniProt: string;
  confidenceScore: number;
  trialPhase: string;
  pubmedCount: number;
  category: 'oncology' | 'neuro' | 'immunology' | 'rare';
  pathwaySummary: string;
}

const DRUG_CANDIDATES: DrugCandidate[] = [
  {
    id: 'metformin',
    name: 'Metformin',
    chemblId: 'CHEMBL1431',
    originalIndication: 'Type 2 Diabetes Mellitus',
    repurposedIndication: 'Colorectal & Breast Oncology',
    mechanism: 'AMPK Activation & mTOR Pathway Inhibition',
    target: 'PRKAA1 / MTOR',
    targetUniProt: 'Q13131',
    confidenceScore: 0.94,
    trialPhase: 'Phase III Ongoing',
    pubmedCount: 142,
    category: 'oncology',
    pathwaySummary: 'Suppresses cellular proliferation via mitochondrial complex I decoupling & IGF-1 reduction.'
  },
  {
    id: 'sildenafil',
    name: 'Sildenafil',
    chemblId: 'CHEMBL192',
    originalIndication: 'Erectile Dysfunction & PAH',
    repurposedIndication: 'Alzheimer’s Disease & Neuroprotection',
    mechanism: 'PDE5 Inhibition & cGMP Upregulation',
    target: 'PDE5A',
    targetUniProt: 'O76074',
    confidenceScore: 0.89,
    trialPhase: 'Phase II Validated',
    pubmedCount: 88,
    category: 'neuro',
    pathwaySummary: 'Enhances synaptic transmission, clears hyperphosphorylated tau, and restores neurovascular tone.'
  },
  {
    id: 'thalidomide',
    name: 'Thalidomide',
    chemblId: 'CHEMBL468',
    originalIndication: 'Sedative & Morning Sickness',
    repurposedIndication: 'Multiple Myeloma & Leprosy',
    mechanism: 'E3 Ubiquitin Ligase Modulation',
    target: 'CRBN / Cereblon',
    targetUniProt: 'Q96SW2',
    confidenceScore: 0.98,
    trialPhase: 'FDA Approved (Repurposed)',
    pubmedCount: 310,
    category: 'oncology',
    pathwaySummary: 'Direct targeted proteolysis of transcription factors IKZF1/3 triggers malignant plasma cell apoptosis.'
  },
  {
    id: 'baricitinib',
    name: 'Baricitinib',
    chemblId: 'CHEMBL2105753',
    originalIndication: 'Rheumatoid Arthritis',
    repurposedIndication: 'Acute Respiratory Viral Hyper-inflammation',
    mechanism: 'Selective JAK1 / JAK2 Kinase Inhibition',
    target: 'JAK1 / JAK2',
    targetUniProt: 'P23458',
    confidenceScore: 0.92,
    trialPhase: 'FDA Emergency Authorization',
    pubmedCount: 119,
    category: 'immunology',
    pathwaySummary: 'Dampens hypercytokinemia (IL-6, IFN-γ) and suppresses clathrin-mediated viral host entry.'
  }
];

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeCandidate, setActiveCandidate] = useState<DrugCandidate>(DRUG_CANDIDATES[0]);
  const [showScrollDock, setShowScrollDock] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 280) {
        setShowScrollDock(true);
      } else {
        setShowScrollDock(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredCandidates = selectedCategory === 'all' 
    ? DRUG_CANDIDATES 
    : DRUG_CANDIDATES.filter(c => c.category === selectedCategory);

  return (
    <div className="relative w-full min-h-screen bg-black text-white selection:bg-white selection:text-black overflow-x-hidden">
      
      {/* ═══════════════════════════════════════════════════════════
          HERO SECTION (Matches Pinterest Reference 1040542688905903756)
          - Overhead Volumetric Light Spotlight (Monochrome)
          - Concentric Brushed Chrome Arches
          - BOTH Capsule Halves Balanced in Center (Intact at scroll 0)
          - Scroll-driven 3D Rupture & Particle Burst Explosion
          - Floating Frosted Glass UI Metrics
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative w-full min-h-[92vh] flex flex-col justify-between items-center px-4 sm:px-6 lg:px-8 pt-10 pb-16 overflow-hidden">
        
        {/* Overhead Dramatic Volumetric Spotlight Beam (Pure Monochrome) */}
        <div className="hero-spotlight" />
        <div className="hero-spotlight-secondary" />

        {/* Subtle Atmospheric Stardust */}
        <div className="absolute inset-0 stardust-bg opacity-40 pointer-events-none" />

        {/* Concentric Chrome Arches Rising from Bottom */}
        <div className="concentric-arch-container">
          <div className="arch-ring-outer" />
          <div className="arch-ring-middle" />
          <div className="arch-ring-inner" />
        </div>

        {/* 3D Capsule WebGL Canvas (Both halves visible & bursts on scroll!) */}
        <div className="absolute inset-0 z-10 pointer-events-auto opacity-100">
          <Capsule3DHero />
        </div>

        {/* ── Floating Frosted Glass UI Card 1 (Top Left) ── */}
        <div className="hidden lg:flex absolute left-8 top-28 z-20 flex-col w-64 p-4 rounded-2xl bg-zinc-950/70 border border-white/10 backdrop-blur-xl shadow-2xl space-y-2.5 animate-float-slow">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase">Target Affinity</span>
            <span className="inline-flex items-center space-x-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-mono text-white border border-white/20">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              <span>+18.4%</span>
            </span>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold tracking-tight text-white">47.2%</span>
            <span className="text-xs text-zinc-400 font-sans">Kd binding surge</span>
          </div>
          {/* Mini Sparkline SVG */}
          <div className="w-full h-8 flex items-end">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 30" fill="none">
              <path 
                d="M0,25 Q15,22 30,18 T60,12 T85,5 L100,2" 
                stroke="rgba(255,255,255,0.7)" 
                strokeWidth="1.5" 
                fill="none" 
              />
              <path 
                d="M0,25 Q15,22 30,18 T60,12 T85,5 L100,2 L100,30 L0,30 Z" 
                fill="url(#sparkline-grad)" 
                opacity="0.1" 
              />
              <defs>
                <linearGradient id="sparkline-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="pt-1 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-zinc-400">
            <span>Metformin → AMPK</span>
            <span className="text-zinc-200">Kd: 12.8 nM</span>
          </div>
        </div>

        {/* ── Floating Frosted Pill 2 (Bottom Left) ── */}
        <Link 
          href="/explore" 
          className="hidden lg:flex absolute left-12 bottom-20 z-20 items-center space-x-3 p-3.5 rounded-2xl bg-zinc-950/80 hover:bg-zinc-900 border border-white/10 hover:border-white/30 backdrop-blur-xl shadow-2xl transition-all group"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 border border-white/20 group-hover:bg-white group-hover:text-black transition-colors">
            <Activity className="h-4 w-4 text-white group-hover:text-black" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">UniProtKB Stream</div>
            <div className="text-xs font-semibold text-white">193 Validated Kinase Targets</div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-zinc-400 group-hover:text-white ml-2 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>

        {/* ── Floating Frosted Glass UI Card 3 (Right) ── */}
        <div className="hidden lg:flex absolute right-8 top-32 z-20 flex-col w-64 p-4 rounded-2xl bg-zinc-950/70 border border-white/10 backdrop-blur-xl shadow-2xl space-y-3 animate-float-slow [animation-delay:2s]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Knowledge Edges</span>
            <span className="text-[10px] font-mono text-zinc-400">434 live</span>
          </div>
          {/* Mini Bar Chart Visualizer */}
          <div className="flex items-end justify-between h-9 px-1 gap-1.5">
            {[45, 65, 30, 80, 95, 55, 75, 90, 60].map((h, i) => (
              <div key={i} className="flex-1 bg-white/10 rounded-sm overflow-hidden flex flex-col justify-end h-full">
                <div 
                  className="bg-white/80 w-full transition-all duration-500 rounded-sm"
                  style={{ height: `${h}%` }}
                />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[10px] font-mono text-zinc-400">
            <span>Synthetic Hallucination</span>
            <span className="text-white font-bold">0.00%</span>
          </div>
        </div>

        {/* ── Floating Frosted Pill 4 (Bottom Right) ── */}
        <Link 
          href="/trials" 
          className="hidden lg:flex absolute right-12 bottom-20 z-20 items-center space-x-3 p-3.5 rounded-2xl bg-zinc-950/80 hover:bg-zinc-900 border border-white/10 hover:border-white/30 backdrop-blur-xl shadow-2xl transition-all group"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 border border-white/20 group-hover:bg-white group-hover:text-black transition-colors">
            <FlaskConical className="h-4 w-4 text-white group-hover:text-black" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">Clinical Evidence</div>
            <div className="text-xs font-semibold text-white">Phase III Multi-Center Cohort</div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-zinc-400 group-hover:text-white ml-2 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>

        {/* ── Center Hero Headline & Dual CTAs ── */}
        <div className="relative z-30 max-w-4xl mx-auto text-center space-y-7 pointer-events-auto mt-2 sm:mt-8">
          
          {/* Micro Pill Badge */}
          <div className="inline-flex items-center space-x-2 rounded-full bg-white/5 border border-white/15 px-4 py-1.5 text-xs font-mono text-zinc-200 backdrop-blur-xl shadow-specular">
            <Cpu className="h-3.5 w-3.5 text-white" />
            <span className="tracking-wide">COMPUTATIONAL DRUG REPURPOSING PLATFORM</span>
          </div>

          {/* Majestic Main Headline (Inspired by reference "Data Refined, Deeper Insights Defined") */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
            Data Refined, Deeper<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
              Indications Defined
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto font-sans leading-relaxed">
            Transforming multi-source biomedical knowledge into validated drug repurposing hypotheses to drive smarter, faster clinical decisions.
          </p>

          {/* Dual Pill CTA Buttons (Direct reference style) */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href="/copilot"
              className="inline-flex items-center space-x-2 rounded-full bg-white hover:bg-zinc-200 text-black px-7 py-3.5 text-sm font-bold shadow-glow-pill transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <span>Get Started</span>
              <ArrowRight className="h-4 w-4 text-black" />
            </Link>
            
            <Link
              href="/explore"
              className="inline-flex items-center space-x-2 rounded-full bg-zinc-950/80 hover:bg-zinc-900 border border-white/20 hover:border-white/40 text-white px-7 py-3.5 text-sm font-semibold backdrop-blur-xl transition-all duration-300"
            >
              <Sparkles className="h-4 w-4 text-white" />
              <span>Explore Graph</span>
            </Link>
          </div>

          {/* Micro Stats Bar */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-5 text-xs font-mono text-zinc-400">
            <div className="flex items-center space-x-2">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              <span>193 UniProt Targets</span>
            </div>
            <span className="text-zinc-600 hidden sm:inline">•</span>
            <div className="flex items-center space-x-2">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              <span>122 Disease Ontologies</span>
            </div>
            <span className="text-zinc-600 hidden sm:inline">•</span>
            <div className="flex items-center space-x-2">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
              <span>434 Verified Edges</span>
            </div>
            <span className="text-zinc-600 hidden sm:inline">•</span>
            <span className="text-zinc-300">Strict PubMed Grounding</span>
          </div>
        </div>

      </section>


      {/* ═══════════════════════════════════════════════════════════
          FLOATING STICKY QUICK-CONNECT DOCK (Emerges on scroll down)
          Guarantees instant connectivity to all other pages!
      ═══════════════════════════════════════════════════════════ */}
      <div 
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-40 transition-all duration-500 transform ${
          showScrollDock ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'
        }`}
      >
        <div className="flex items-center space-x-1.5 p-1.5 rounded-full bg-zinc-950/90 border border-white/20 shadow-2xl backdrop-blur-2xl">
          <div className="px-3 py-1 text-[11px] font-mono text-zinc-400 hidden sm:flex items-center space-x-1.5 border-r border-white/10 mr-1">
            <Compass className="h-3 w-3 text-white" />
            <span>QUICK JUMP:</span>
          </div>
          {[
            { label: 'Molecules', href: '/drugs', icon: Pill },
            { label: 'Diseases', href: '/diseases', icon: Dna },
            { label: 'Trials', href: '/trials', icon: FlaskConical },
            { label: 'Graph', href: '/explore', icon: Network },
            { label: 'Copilot', href: '/copilot', icon: Bot, isPrimary: true },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  item.isPrimary 
                    ? 'bg-white text-black font-bold shadow-sm' 
                    : 'text-zinc-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className={`h-3 w-3 ${item.isPrimary ? 'text-black' : 'text-zinc-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>


      {/* ═══════════════════════════════════════════════════════════
          SECTION 1: THE MEDICINE FORMAT — LIVE DRUG CANDIDATES
          "keeping the medicine format same as landing page and making everything really premium"
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 border-t border-white/[0.08]">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 rounded-full bg-white/5 border border-white/10 px-3 py-1 text-xs font-mono text-zinc-400 uppercase tracking-wider">
              <Pill className="h-3 w-3 text-white" />
              <span>Repurposed Indications Repository</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
              Validated Molecular Hypotheses
            </h2>
            <p className="text-zinc-400 max-w-xl text-sm sm:text-base">
              Explore clinically supported repurposing candidates mapped through multi-hop knowledge graph traversal across ChEMBL, UniProt, and Open Targets.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-full bg-zinc-950 border border-white/10 backdrop-blur-xl">
            {[
              { id: 'all', label: 'All Candidates' },
              { id: 'oncology', label: 'Oncology' },
              { id: 'neuro', label: 'Neurodegeneration' },
              { id: 'immunology', label: 'Immunology' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedCategory(f.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedCategory === f.id
                    ? 'bg-white text-black font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2-Column Showcase: Candidate Cards Grid + Detail Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Candidate Cards (4 cols on lg) */}
          <div className="lg:col-span-5 space-y-3.5">
            {filteredCandidates.map((drug) => {
              const isSelected = activeCandidate.id === drug.id;
              return (
                <div
                  key={drug.id}
                  onClick={() => setActiveCandidate(drug)}
                  className={`p-5 rounded-2xl cursor-pointer transition-all duration-300 border ${
                    isSelected
                      ? 'bg-zinc-900/90 border-white/40 shadow-xl'
                      : 'bg-zinc-950/40 border-white/10 hover:border-white/20 hover:bg-zinc-900/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-bold text-white">{drug.name}</h3>
                        <span className="text-[11px] font-mono text-zinc-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md">
                          {drug.chemblId}
                        </span>
                      </div>
                      <div className="text-xs text-zinc-400 mt-1 flex items-center space-x-1.5">
                        <span className="line-through text-zinc-500">{drug.originalIndication}</span>
                        <ChevronRight className="h-3 w-3 text-zinc-400 inline" />
                        <span className="text-white font-medium">{drug.repurposedIndication}</span>
                      </div>
                    </div>

                    {/* Confidence Score Pill */}
                    <div className="text-right">
                      <span className="text-sm font-mono font-bold text-white bg-white/10 border border-white/20 px-2.5 py-1 rounded-full">
                        {Math.round(drug.confidenceScore * 100)}%
                      </span>
                    </div>
                  </div>

                  <div className="mt-3.5 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono text-zinc-400">
                    <span>{drug.trialPhase}</span>
                    <span className="text-zinc-300">{drug.pubmedCount} PubMed Citations</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Deep-Dive Frosted Glass Detail Card (7 cols on lg) */}
          <div className="lg:col-span-7 rounded-3xl bg-zinc-950/80 border border-white/15 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl flex flex-col justify-between space-y-6">
            
            <div className="space-y-6">
              {/* Card Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Candidate Analysis</span>
                    <span className="rounded-full bg-white text-black font-bold text-[10px] px-2 py-0.5">
                      {activeCandidate.trialPhase}
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                    {activeCandidate.name}
                  </h3>
                  <p className="text-xs font-mono text-zinc-400">
                    Primary Target: {activeCandidate.target} (UniProt: {activeCandidate.targetUniProt})
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-[10px] font-mono uppercase text-zinc-400">Evidence Confidence</div>
                  <div className="text-3xl font-mono font-bold text-white">
                    {Math.round(activeCandidate.confidenceScore * 100)}%
                  </div>
                </div>
              </div>

              {/* Repurposing Pathway Traversal Diagram */}
              <div className="p-4 sm:p-5 rounded-2xl bg-black/60 border border-white/10 space-y-3">
                <div className="text-xs font-mono text-zinc-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <Network className="h-3.5 w-3.5 text-white" />
                  <span>Multi-Hop Traversal Evidence Path</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-zinc-900/80 border border-white/10">
                    <div className="text-[10px] font-mono text-zinc-400">STEP 1: MOLECULE</div>
                    <div className="text-xs font-bold text-white mt-1">{activeCandidate.name}</div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">{activeCandidate.mechanism}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-900/80 border border-white/10">
                    <div className="text-[10px] font-mono text-zinc-400">STEP 2: TARGET & PATHWAY</div>
                    <div className="text-xs font-bold text-white mt-1">{activeCandidate.target}</div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">Downstream effector inhibition</div>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-900/80 border border-white/10">
                    <div className="text-[10px] font-mono text-zinc-400">STEP 3: NEW INDICATION</div>
                    <div className="text-xs font-bold text-white mt-1">{activeCandidate.repurposedIndication}</div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">{activeCandidate.pubmedCount} grounded papers</div>
                  </div>
                </div>
              </div>

              {/* Biological Mechanism Description */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                  Molecular Rationale & Validation
                </h4>
                <p className="text-sm text-zinc-300 leading-relaxed font-sans">
                  {activeCandidate.pathwaySummary}
                </p>
              </div>

              {/* Metric Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-zinc-900/50 border border-white/5">
                  <div className="text-[10px] font-mono text-zinc-400">Target Binding</div>
                  <div className="text-base font-bold text-white mt-1">Sub-micromolar</div>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900/50 border border-white/5">
                  <div className="text-[10px] font-mono text-zinc-400">Clinical Phase</div>
                  <div className="text-base font-bold text-white mt-1">{activeCandidate.trialPhase.split(' ')[0]}</div>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900/50 border border-white/5">
                  <div className="text-[10px] font-mono text-zinc-400">Literature Proof</div>
                  <div className="text-base font-bold text-white mt-1">{activeCandidate.pubmedCount} Papers</div>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900/50 border border-white/5">
                  <div className="text-[10px] font-mono text-zinc-400">Zero Hallucination</div>
                  <div className="text-base font-bold text-white mt-1">100% Grounded</div>
                </div>
              </div>
            </div>

            {/* Seamless Cross-Page Connectivity Actions */}
            <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/explore`}
                  className="inline-flex items-center space-x-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-white/10 hover:border-white/30 px-3.5 py-2 text-xs font-mono text-zinc-300 hover:text-white transition-all"
                >
                  <Network className="h-3.5 w-3.5 text-zinc-400" />
                  <span>Traverse Graph</span>
                </Link>

                <Link
                  href={`/drugs`}
                  className="inline-flex items-center space-x-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-white/10 hover:border-white/30 px-3.5 py-2 text-xs font-mono text-zinc-300 hover:text-white transition-all"
                >
                  <Pill className="h-3.5 w-3.5 text-zinc-400" />
                  <span>Drug Specs</span>
                </Link>

                <Link
                  href={`/trials`}
                  className="inline-flex items-center space-x-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-white/10 hover:border-white/30 px-3.5 py-2 text-xs font-mono text-zinc-300 hover:text-white transition-all"
                >
                  <FlaskConical className="h-3.5 w-3.5 text-zinc-400" />
                  <span>Trials</span>
                </Link>
              </div>

              {/* Primary AI Copilot Inquiry Launch */}
              <Link
                href={`/copilot?q=Analyze+repurposing+evidence+for+${encodeURIComponent(activeCandidate.name)}+in+${encodeURIComponent(activeCandidate.repurposedIndication)}`}
                className="inline-flex items-center space-x-2 rounded-full bg-white hover:bg-zinc-200 text-black px-5 py-2.5 text-xs font-bold transition-all shadow-specular"
              >
                <Bot className="h-4 w-4 text-black" />
                <span>Interrogate in AI Copilot</span>
                <ArrowRight className="h-3.5 w-3.5 text-black" />
              </Link>
            </div>
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════
          SECTION 2: 5-LAYER MULTI-HOP GRAPH ARCHITECTURE (Full Links)
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 border-t border-white/[0.08]">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center space-x-2 rounded-full bg-white/5 border border-white/10 px-3.5 py-1 text-xs font-mono text-zinc-400 uppercase tracking-wider">
            <Network className="h-3.5 w-3.5 text-white" />
            <span>Biomedical Knowledge Ingestion</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
            How The Multi-Hop Engine Works
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
            By unifying disconnected silos into a unified graph schema, DrugCopilot connects molecular targets with therapeutic opportunities across 5 distinct biological layers.
          </p>
        </div>

        {/* 5-Layer Stack Grid with Direct Navigation Connectivity */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            {
              step: '01',
              title: 'Molecules',
              source: 'ChEMBL & PubChem',
              desc: 'Over 2.4M curated chemical structures, SMILES descriptors, bioactivities, and potency metrics.',
              icon: Pill,
              link: '/drugs',
              cta: 'Browse Molecules'
            },
            {
              step: '02',
              title: 'Protein Targets',
              source: 'UniProtKB',
              desc: 'High-confidence protein targets, enzymatic classifications, phosphorylation sites, and binding pockets.',
              icon: Dna,
              link: '/explore',
              cta: 'Explore Targets'
            },
            {
              step: '03',
              title: 'Pathways',
              source: 'Reactome & GO',
              desc: 'Cellular signaling cascades, metabolic networks, and gene ontology biological processes.',
              icon: Network,
              link: '/explore',
              cta: 'View Pathways'
            },
            {
              step: '04',
              title: 'Disease Ontologies',
              source: 'Open Targets & EFO',
              desc: 'Experimental factor ontologies, genetic association scores, and phenotypic manifestations.',
              icon: Activity,
              link: '/diseases',
              cta: 'Browse Diseases'
            },
            {
              step: '05',
              title: 'Clinical Trials',
              source: 'ClinicalTrials.gov',
              desc: 'Real-time Phase I–IV interventional trial cohorts, completion endpoints, and adverse events.',
              icon: FlaskConical,
              link: '/trials',
              cta: 'Search Trials'
            }
          ].map((layer) => {
            const Icon = layer.icon;
            return (
              <Link 
                key={layer.step}
                href={layer.link}
                className="group p-6 rounded-2xl bg-zinc-950/60 border border-white/10 hover:border-white/40 transition-all duration-300 backdrop-blur-xl flex flex-col justify-between space-y-6 hover:-translate-y-1"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-mono font-bold text-zinc-600 group-hover:text-white transition-colors">
                      {layer.step}
                    </span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 border border-white/10 group-hover:bg-white group-hover:text-black transition-all">
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white">{layer.title}</h3>
                    <div className="text-[11px] font-mono text-zinc-400 mt-0.5">{layer.source}</div>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                    {layer.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-zinc-400 group-hover:text-white">
                  <span>{layer.cta}</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════
          SECTION 3: LIVE COPILOT INTERACTIVE PREVIEW
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 border-t border-white/[0.08]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Text */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center space-x-2 rounded-full bg-white/5 border border-white/10 px-3.5 py-1 text-xs font-mono text-zinc-400 uppercase tracking-wider">
              <Bot className="h-3.5 w-3.5 text-white" />
              <span>Zero-Hallucination Architecture</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Biomedical Reasoning Grounded In Reality
            </h2>

            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
              Generalist LLMs hallucinate non-existent drug interactions and fabricated target affinities. DrugCopilot eliminates hallucinations by constraining reasoning directly to our verified knowledge graph.
            </p>

            <div className="space-y-3 pt-2">
              {[
                'Multi-hop path verification before response generation',
                'Strict provenance: Every claim links to UniProt or PubMed ID',
                'Deterministic confidence scoring based on clinical evidence',
                'Real-time ingestion from NIH & EMBL-EBI databases'
              ].map((feature, i) => (
                <div key={i} className="flex items-center space-x-3 text-xs sm:text-sm text-zinc-300">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 border border-white/20">
                    <CheckCircle2 className="h-3 w-3 text-white" />
                  </div>
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-3">
              <Link
                href="/copilot?q=Which+existing+FDA-approved+kinase+inhibitors+could+be+repurposed+for+glioblastoma+with+blood-brain+barrier+permeability%3F"
                className="inline-flex items-center space-x-2 rounded-full bg-white hover:bg-zinc-200 text-black px-6 py-3 text-xs font-bold transition-all shadow-specular"
              >
                <span>Launch This Inquiry in Copilot</span>
                <ArrowRight className="h-3.5 w-3.5 text-black" />
              </Link>
            </div>
          </div>

          {/* Right: Simulated High-End Terminal / Chat Window */}
          <div className="lg:col-span-7 rounded-3xl bg-zinc-950/90 border border-white/15 p-6 backdrop-blur-2xl shadow-2xl space-y-4">
            
            {/* Window Title Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 text-xs font-mono">
              <div className="flex items-center space-x-2">
                <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                <span className="text-zinc-400 ml-2 font-mono text-[11px]">drugcopilot-session-agent-v2</span>
              </div>
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-zinc-300 font-mono">
                GRAPH ENGINE ONLINE
              </span>
            </div>

            {/* Chat Exchange */}
            <div className="space-y-4 font-sans text-xs sm:text-sm">
              
              {/* User Prompt */}
              <div className="flex items-start space-x-3 justify-end">
                <div className="p-3.5 rounded-2xl rounded-tr-sm bg-white text-black font-medium max-w-lg">
                  Which existing FDA-approved kinase inhibitors could be repurposed for glioblastoma with blood-brain barrier permeability?
                </div>
              </div>

              {/* Copilot Reasoning Steps */}
              <div className="space-y-2.5 p-4 rounded-2xl bg-black/60 border border-white/10 font-mono text-xs text-zinc-300">
                <div className="flex items-center space-x-2 text-zinc-400">
                  <Cpu className="h-3.5 w-3.5 text-white animate-spin" />
                  <span>TRAVERSING KNOWLEDGE GRAPH SUBGRAPH...</span>
                </div>
                <div className="space-y-1 pl-5 border-l border-white/10 text-[11px] text-zinc-400">
                  <div>[1] Resolved target ontologies: EGFR, CDK4/6, PI3K/Akt/mTOR (UniProt: P00533)</div>
                  <div>[2] Filtering ChEMBL molecules: LogBB &gt; 0.3, Polar Surface Area &lt; 90 Å²</div>
                  <div>[3] Identified candidate: <strong>Regorafenib</strong> (CHEMBL1237113) &amp; <strong>Abemaciclib</strong></div>
                  <div>[4] Cross-checked ClinicalTrials.gov: NCT03970447 (Phase II Glioblastoma active)</div>
                </div>
              </div>

              {/* Copilot Synthesized Response */}
              <div className="p-4 rounded-2xl rounded-tl-sm bg-zinc-900 border border-white/15 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-4 w-4 text-white" />
                    <span className="font-bold text-white">DrugCopilot Synthesis</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400">Confidence: 91%</span>
                </div>

                <p className="text-zinc-300 leading-relaxed text-xs sm:text-sm">
                  <strong>Abemaciclib</strong> (CDK4/6 inhibitor) and <strong>Regorafenib</strong> (multi-kinase inhibitor) represent the highest confidence candidates. Unlike first-generation inhibitors, both demonstrate verified CNS penetration (LogBB: +0.38) and target CDK4/6 amplification present in ~78% of recurrent glioblastoma profiles.
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="inline-flex items-center space-x-1 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-mono text-white border border-white/20">
                    <span>Target: CDK4/6</span>
                  </span>
                  <span className="inline-flex items-center space-x-1 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-mono text-white border border-white/20">
                    <span>NCT03970447</span>
                  </span>
                  <span className="inline-flex items-center space-x-1 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-mono text-white border border-white/20">
                    <span>PubMed: 31835529</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════
          SECTION 4: BENCHMARK METRICS (Clickable Deep-Links)
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/[0.08]">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { metric: '193', label: 'Curated UniProt Targets', sub: 'High-precision kinase & receptor entities', href: '/explore' },
            { metric: '122', label: 'Disease Ontologies', sub: 'EFO & Mondo medical classification', href: '/diseases' },
            { metric: '434', label: 'Verified Knowledge Edges', sub: 'Multi-hop relations with verified provenance', href: '/explore' },
            { metric: '0.0%', label: 'Synthetic Hallucination', sub: 'Deterministic KG validation filter', href: '/evidence' },
          ].map((item, idx) => (
            <Link 
              key={idx} 
              href={item.href}
              className="p-6 rounded-2xl bg-zinc-950/40 hover:bg-zinc-900/60 border border-white/10 hover:border-white/30 backdrop-blur-xl space-y-2 transition-all block group"
            >
              <div className="text-3xl sm:text-5xl font-extrabold font-mono text-white tracking-tight group-hover:text-zinc-200">
                {item.metric}
              </div>
              <div className="text-sm font-semibold text-zinc-200">{item.label}</div>
              <div className="text-xs text-zinc-500 font-sans">{item.sub}</div>
            </Link>
          ))}
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════
          SECTION 5: FINAL LAUNCH CTA PORTAL
      ═══════════════════════════════════════════════════════════ */}
      <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 border-t border-white/[0.08]">
        <div className="relative rounded-3xl bg-gradient-to-b from-zinc-900/80 to-zinc-950 border border-white/20 p-8 sm:p-16 text-center overflow-hidden shadow-2xl">
          
          {/* Subtle Glow Behind Box */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 bg-white/10 blur-[80px] pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <div className="inline-flex items-center space-x-2 rounded-full bg-white/10 border border-white/20 px-3.5 py-1 text-xs font-mono text-zinc-300">
              <Sparkles className="h-3.5 w-3.5 text-white" />
              <span>ACCELERATING PHARMACEUTICAL TRANSLATION</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Ready to Discover New Indications from Existing Molecules?
            </h2>

            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
              Launch the AI Copilot to run complex multi-hop queries, explore graph subgraphs, or inspect ingestion pipelines in the admin command center.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link
                href="/copilot"
                className="inline-flex items-center space-x-2 rounded-full bg-white hover:bg-zinc-200 text-black px-8 py-4 text-sm font-bold shadow-glow-pill transition-all transform hover:-translate-y-0.5"
              >
                <span>Launch AI Copilot</span>
                <ArrowRight className="h-4 w-4 text-black" />
              </Link>

              <Link
                href="/explore"
                className="inline-flex items-center space-x-2 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-white/20 text-white px-8 py-4 text-sm font-semibold transition-all"
              >
                <Network className="h-4 w-4 text-white" />
                <span>Explore Graph</span>
              </Link>

              <Link
                href="/admin"
                className="inline-flex items-center space-x-2 rounded-full bg-zinc-900/60 hover:bg-zinc-800 border border-white/15 text-zinc-400 hover:text-white px-6 py-4 text-sm font-medium transition-all"
              >
                <Database className="h-4 w-4 text-zinc-400" />
                <span>ETL Ingestion Hub</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer in Pure Monochrome */}
      <footer className="w-full border-t border-white/[0.08] bg-black py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-zinc-500 gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-white font-semibold">DrugCopilot</span>
            <span>•</span>
            <span>Computational Drug Repurposing Knowledge Graph</span>
          </div>
          <div>
            Pure Monochromatic Research Grade System
          </div>
        </div>
      </footer>
    </div>
  );
}
