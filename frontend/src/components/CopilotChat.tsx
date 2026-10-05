'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, User, Sparkles, Loader2, CornerDownLeft } from 'lucide-react';
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
      content: "Welcome to **DrugCopilot**. I am connected to the live computational knowledge graph with real-world biomedical datasets (ChEMBL, Open Targets, UniProt, PubChem, ClinicalTrials.gov, PubMed).\n\nAsk any drug repurposing or target pharmacology question, and I will extract verifiable biological chains."
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
    setToolStatus("Querying biomedical knowledge graph & APIs...");

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
    <div className="flex h-full flex-col bg-surface border border-surface-border rounded-xl overflow-hidden shadow-card">
      
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-surface-border px-4 py-2.5 bg-surface-raised">
        <div className="flex items-center space-x-2">
          <div className="flex h-5 w-5 items-center justify-center rounded bg-white/10 border border-white/20 text-white">
            <Bot className="h-3.5 w-3.5" />
          </div>
          <span className="text-xs font-semibold text-white">Biomedical Reasoning Agent</span>
        </div>
        <span className="rounded bg-background border border-surface-border px-1.5 py-0.2 text-[10px] font-mono text-gray-400">
          Reasoning Model
        </span>
      </div>

      {/* Chat Conversation Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start space-x-2.5 ${
              m.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {m.role !== 'user' && (
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-surface-raised border border-surface-border text-white mt-0.5 shadow-specular">
                <Bot className="h-3.5 w-3.5" />
              </div>
            )}
            <div
              className={`max-w-[88%] rounded-xl p-3 leading-relaxed ${
                m.role === 'user'
                  ? 'bg-white text-black font-semibold shadow-specular-strong'
                  : 'bg-surface-raised border border-surface-border text-gray-200 shadow-specular'
              }`}
            >
              <div className="prose prose-invert max-w-none whitespace-pre-wrap leading-relaxed text-xs">
                {m.content}
              </div>
            </div>
            {m.role === 'user' && (
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-surface-raised border border-surface-border text-gray-300 mt-0.5">
                <User className="h-3.5 w-3.5" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-2.5 text-gray-400">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-surface-raised border border-surface-border text-white">
              <Bot className="h-3.5 w-3.5 animate-pulse" />
            </div>
            <div className="flex items-center space-x-2 rounded-xl bg-surface-raised border border-surface-border px-3 py-2 text-xs text-gray-300 shadow-specular">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
              <span>{toolStatus || "Traversing knowledge graph..."}</span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Suggested Prompts Pill Bar */}
      <div className="border-t border-surface-border p-2 bg-background/50 flex gap-1.5 overflow-x-auto">
        {SUGGESTED_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="rounded-md bg-surface-raised border border-surface-border px-2 py-1 text-[11px] text-gray-300 hover:text-white hover:border-white/40 transition-colors whitespace-nowrap shrink-0 flex items-center space-x-1 shadow-specular"
          >
            <Sparkles className="h-3 w-3 text-gray-300 shrink-0" />
            <span>{prompt}</span>
          </button>
        ))}
      </div>

      {/* Input Textarea & Send Control */}
      <div className="border-t border-surface-border p-2.5 bg-surface">
        <div className="relative rounded-lg bg-background border border-surface-border focus-within:border-white/50 transition-colors">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            placeholder="Ask a repurposing hypothesis (e.g. Find candidate drugs for Parkinson's disease)..."
            className="w-full resize-none bg-transparent px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none"
          />
          <div className="flex items-center justify-between px-2.5 pb-2 pt-1 border-t border-surface-border/40 text-[10px] text-gray-500 font-mono">
            <span>Press <kbd className="px-1 py-0.5 rounded bg-surface-raised border border-surface-border text-gray-300">Enter ↵</kbd> to query</span>
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="inline-flex items-center space-x-1 rounded bg-white hover:bg-neutral-200 disabled:opacity-40 disabled:hover:bg-white text-black px-2.5 py-1 text-xs font-bold transition-colors shadow-specular-strong"
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
