'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, User, Sparkles, Loader2, CornerDownLeft, Pill, Dna } from 'lucide-react';
import { ChatMessage, RepurposingCandidate, SubgraphResponse } from '@/lib/types';
import { sendCopilotChat } from '@/lib/api';

interface CopilotChatProps {
  onCandidatesFound?: (candidates: RepurposingCandidate[]) => void;
  onSubgraphReceived?: (subgraph: SubgraphResponse) => void;
  onSelectCandidate?: (candidate: RepurposingCandidate) => void;
  initialQuery?: string;
}

const SUGGESTED_PROMPTS = [
  "Find drugs that could potentially be repurposed for Alzheimer's disease.",
  "Why was Metformin suggested for neurodegenerative diseases?",
  "What biological targets connect Donepezil to Alzheimer's?",
  "Traverse 2-hop PPI network for Parkinson's disease targets.",
  "Show clinical trials evaluating Memantine or Rapamycin."
];

export default function CopilotChat({
  onCandidatesFound,
  onSubgraphReceived,
  onSelectCandidate,
  initialQuery
}: CopilotChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Welcome to **DrugCopilot**. I am connected to the computational knowledge graph with real-world biomedical datasets (ChEMBL, Open Targets, UniProt, PubChem, ClinicalTrials.gov, PubMed).\n\nAsk any drug repurposing or target pharmacology question, and I will extract verifiable biological chains."
    }
  ]);
  const [input, setInput] = useState(initialQuery || '');
  const [loading, setLoading] = useState(false);
  const [toolStatus, setToolStatus] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      handleSend(initialQuery);
    }
  }, [initialQuery]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMessage: ChatMessage = { role: 'user', content: query };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setToolStatus("Traversing biomedical graph & live datasets...");

    try {
      const response = await sendCopilotChat(query, messages);
      
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.reply
      };
      setMessages((prev) => [...prev, assistantMessage]);

      if (response.candidates && response.candidates.length > 0) {
        if (onCandidatesFound) onCandidatesFound(response.candidates);
        if (onSelectCandidate) onSelectCandidate(response.candidates[0]);
      }

      if (response.subgraph && onSubgraphReceived) {
        onSubgraphReceived(response.subgraph);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `An error occurred while analyzing the biomedical graph: ${err.message}`
        }
      ]);
    } finally {
      setLoading(false);
      setToolStatus(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full flex-col rounded-2xl bg-zinc-950/80 border border-white/10 overflow-hidden shadow-2xl backdrop-blur-xl">
      
      {/* Header bar in pure monochrome */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 bg-black/40">
        <div className="flex items-center space-x-2.5">
          <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 border border-white/20 text-white">
            <Bot className="h-4 w-4" />
            <span className="absolute -bottom-0.5 -right-0.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/60 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
          </div>
          <div>
            <span className="text-xs font-semibold text-white">Biomedical Reasoning Agent</span>
          </div>
        </div>
        <span className="rounded-full bg-white/10 border border-white/15 px-2.5 py-0.5 text-[10px] font-mono text-zinc-300">
          Reasoning Online
        </span>
      </div>

      {/* Chat Conversation Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5 text-sm">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start space-x-3 ${
              m.role === 'user' ? 'justify-end msg-enter-right' : 'justify-start msg-enter-left'
            }`}
          >
            {m.role !== 'user' && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-900 border border-white/15 text-white mt-0.5">
                <Dna className="h-3.5 w-3.5" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 leading-relaxed ${
                m.role === 'user'
                  ? 'bg-white text-black font-medium shadow-md'
                  : 'bg-zinc-900/90 border border-white/10 text-zinc-200'
              }`}
            >
              <div className="prose prose-invert max-w-none whitespace-pre-wrap leading-relaxed text-[13px]">
                {m.content}
              </div>
            </div>
            {m.role === 'user' && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-900 border border-white/15 text-zinc-400 mt-0.5">
                <User className="h-3.5 w-3.5" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-3 msg-enter-left">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 border border-white/20 text-white">
              <Bot className="h-3.5 w-3.5 animate-pulse" />
            </div>
            <div className="flex items-center space-x-2.5 rounded-2xl bg-zinc-900 border border-white/10 px-4 py-2.5 text-sm text-zinc-300">
              <Loader2 className="h-4 w-4 animate-spin text-white" />
              <span className="text-[13px] font-mono">{toolStatus || "Traversing knowledge graph..."}</span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Suggested Prompts Pill Bar */}
      <div className="border-t border-white/10 px-3 py-2.5 bg-black/30 flex gap-2 overflow-x-auto">
        {SUGGESTED_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="group rounded-full bg-zinc-900 border border-white/10 px-3 py-1.5 text-[11px] text-zinc-400 hover:text-white hover:border-white/30 hover:bg-white/[0.06] transition-all duration-200 whitespace-nowrap shrink-0 flex items-center space-x-1.5"
          >
            <Pill className="h-3 w-3 text-zinc-500 group-hover:text-white shrink-0 transition-colors" />
            <span>{prompt}</span>
          </button>
        ))}
      </div>

      {/* Input Textarea & Send Control */}
      <div className="border-t border-white/10 p-3 bg-zinc-950">
        <div className="relative rounded-xl bg-black border border-white/15 focus-within:border-white/40 focus-within:shadow-glow-sm transition-all duration-300">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            placeholder="Ask a repurposing hypothesis (e.g. Find candidate drugs for Parkinson's disease)..."
            className="w-full resize-none bg-transparent px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none"
          />
          <div className="flex items-center justify-between px-3 pb-2.5 pt-1 border-t border-white/5 text-[10px] text-zinc-500 font-mono">
            <span>Press <kbd className="px-1.5 py-0.5 rounded-md bg-zinc-900 border border-white/10 text-zinc-300">Enter ↵</kbd> to query</span>
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="inline-flex items-center space-x-1.5 rounded-lg bg-white hover:bg-zinc-200 disabled:opacity-20 text-black px-3.5 py-1.5 text-xs font-bold transition-all shadow-sm"
            >
              <span>Query</span>
              <CornerDownLeft className="h-3 w-3 text-black" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
