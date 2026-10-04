'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Terminal, ShieldAlert, Loader2 } from 'lucide-react';
import { ChatMessage, ChatResponse, RepurposingCandidate, SubgraphResponse } from '@/lib/types';
import { sendCopilotChat } from '@/lib/api';

interface CopilotChatProps {
  onCandidatesFound?: (candidates: RepurposingCandidate[]) => void;
  onSubgraphReceived?: (subgraph: SubgraphResponse) => void;
  onSelectCandidate?: (candidate: RepurposingCandidate) => void;
}

const SUGGESTED_PROMPTS = [
  "Find drugs that could potentially be repurposed for Alzheimer's disease.",
  "Why was Metformin suggested for neurodegenerative diseases?",
  "What proteins connect Donepezil to Alzheimer's disease?",
  "Find alternative drugs that affect the same biological pathway.",
  "Show clinical trials involving Memantine."
];

export default function CopilotChat({
  onCandidatesFound,
  onSubgraphReceived,
  onSelectCandidate,
}: CopilotChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Hello! I am your **AI Drug Repurposing Copilot**, connected to a live Neo4j biomedical knowledge graph and databases (ChEMBL, Open Targets, UniProt, PubChem, ClinicalTrials.gov, PubMed).\n\nAsk me any drug repurposing question, and I will generate evidence-backed computational hypotheses."
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [toolStatus, setToolStatus] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMessage: ChatMessage = { role: 'user', content: query };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setToolStatus("Querying Neo4j & biomedical APIs...");

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
          content: `Sorry, an error occurred while analyzing the biomedical graph: ${err.message}`
        }
      ]);
    } finally {
      setLoading(false);
      setToolStatus(null);
    }
  };

  return (
    <div className="flex h-full flex-col bg-surface border border-surface-border rounded-xl overflow-hidden">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start space-x-3 ${
              m.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {m.role !== 'user' && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md">
                <Bot className="h-4 w-4" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-xl p-3.5 leading-relaxed ${
                m.role === 'user'
                  ? 'bg-blue-600 text-white font-medium'
                  : 'bg-surface-raised border border-surface-border text-gray-200 shadow-sm'
              }`}
            >
              <div className="prose prose-invert max-w-none whitespace-pre-wrap">
                {m.content}
              </div>
            </div>
            {m.role === 'user' && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-700 text-white shadow-md">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-3 text-gray-400">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600/50 text-white animate-pulse">
              <Bot className="h-4 w-4" />
            </div>
            <div className="flex items-center space-x-2 rounded-xl bg-surface-raised border border-surface-border p-3">
              <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
              <span>{toolStatus || "Analyzing graph evidence..."}</span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Suggested Prompts */}
      <div className="border-t border-surface-border p-2 bg-background/50 flex flex-wrap gap-1.5 overflow-x-auto">
        {SUGGESTED_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="rounded-full bg-surface-raised border border-surface-border px-2.5 py-1 text-[11px] text-gray-300 hover:text-white hover:border-blue-500/50 transition-colors whitespace-nowrap flex items-center space-x-1"
          >
            <Sparkles className="h-3 w-3 text-cyan-400" />
            <span>{prompt}</span>
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="border-t border-surface-border p-3 bg-surface flex items-center space-x-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question (e.g. Find drugs that could be repurposed for Alzheimer's)..."
          className="flex-1 rounded-xl bg-background border border-surface-border px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
