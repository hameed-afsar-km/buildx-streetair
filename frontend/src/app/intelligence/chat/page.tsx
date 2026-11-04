"use client";

import React, { useState, useRef, useEffect } from "react";
import { sendAiChatMessage } from "@/lib/api/endpoints";
import { AiProvider, ChatMessageItem } from "@/lib/types";
import { SourceCitation } from "@/components/ui/SourceCitation";
import { MarkdownRenderer } from "@/components/ui/MarkdownRenderer";
import {
  Bot,
  Send,
  Sparkles,
  Cpu,
  Server,
  Copy,
  Check,
  RefreshCw,
  Info,
  User,
  Compass,
} from "lucide-react";
import { formatTime } from "@/lib/utils";

export default function AiChatPage() {
  const [messages, setMessages] = useState<ChatMessageItem[]>([
    {
      id: "msg_init",
      role: "assistant",
      content: `Welcome to the **STREETAIR Environmental Intelligence Assistant**.

I am connected to live telemetry from the **B.S. Abdur Rahman Crescent Institute Beacon** in Vandalur, regional meteorological models, and CPCB National Ambient Air Quality standards.

Ask me anything about current anomalies, pollution spikes, historical comparisons, or health advisories.`,
      timestamp: new Date().toISOString(),
      provider: "groq",
      model: "llama-3.3-70b-versatile",
    },
  ]);

  const [input, setInput] = useState("");
  const [provider, setProvider] = useState<AiProvider>("groq");
  const [model, setModel] = useState("llama-3.3-70b-versatile");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isGenerating) return;

    const userMsg: ChatMessageItem = {
      id: `usr_${Date.now()}`,
      role: "user",
      content: query,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsGenerating(true);

    try {
      const response = await sendAiChatMessage({
        messages: [...messages, userMsg].map((m) => ({
          role: m.role,
          content: m.content,
        })),
        provider,
        model,
        context: {
          station_id: "crescent-vandalur-01",
          include_rag: true,
          include_web_search: true,
        },
      });

      const assistantMsg: ChatMessageItem = {
        id: `asst_${Date.now()}`,
        role: "assistant",
        content: response.reply,
        timestamp: new Date().toISOString(),
        provider: response.provider_used,
        model: response.model_used,
        citations: response.citations,
        evidence: response.evidence,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg: ChatMessageItem = {
        id: `err_${Date.now()}`,
        role: "assistant",
        content: `Error: The selected backend AI provider (**${provider}**) is currently unreachable. Please verify your backend server or switch to Ollama / Groq.`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const suggestedQuestions = [
    "Why did PM2.5 increase at the Crescent station?",
    "Compare today's readings with yesterday's baseline.",
    "Explain the latest detected anomaly and wind vector.",
    "What could happen if traffic emissions decrease by 30%?",
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[600px] space-y-4">
      {/* Provider Selector Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm text-xs">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-purple-600 text-white">
            <Sparkles className="w-4 h-4" />
          </span>
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white">
              Environmental AI Inference Engine
            </h2>
            <p className="text-[11px] text-slate-400">
              Accessed via secure backend FastAPI gateway (No browser API key leaks)
            </p>
          </div>
        </div>

        {/* Provider Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono">
            <span className="text-slate-500 font-semibold">Provider:</span>
            <select
              value={provider}
              onChange={(e) => {
                const p = e.target.value as AiProvider;
                setProvider(p);
                setModel(p === "groq" ? "llama-3.3-70b-versatile" : "llama-3-8b-instruct");
              }}
              aria-label="Select AI Inference Provider"
              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-bold focus:outline-none"
            >
              <option value="groq">Groq Cloud (LPU Inference)</option>
              <option value="ollama">Ollama Local Node</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 font-mono">
            <span className="text-slate-500 font-semibold">Model:</span>
            <span className="px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold text-[10px]">
              {model}
            </span>
          </div>
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-sm space-y-6">
        {messages.map((m) => {
          const isUser = m.role === "user";

          return (
            <div
              key={m.id}
              className={`flex gap-3 max-w-3xl ${isUser ? "ml-auto flex-row-reverse" : "mr-auto"}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-sm ${
                  isUser ? "bg-slate-800 dark:bg-slate-700" : "bg-purple-600"
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`rounded-2xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed space-y-2 ${
                  isUser
                    ? "bg-brand-600 text-white rounded-tr-none"
                    : "bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 rounded-tl-none text-slate-800 dark:text-slate-200"
                }`}
              >
                {!isUser && (
                  <div className="flex items-center justify-between gap-4 border-b border-slate-200/60 dark:border-slate-700/60 pb-1.5 text-[10px] text-slate-500 font-mono">
                    <span className="font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                      STREETAIR Neural Diagnostics ({m.provider || "groq"})
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(m.id, m.content)}
                      className="hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
                    >
                      {copiedId === m.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span className="text-emerald-500">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {isUser ? (
                  <div className="whitespace-pre-wrap font-sans text-sm">
                    {m.content}
                  </div>
                ) : (
                  <MarkdownRenderer content={m.content} />
                )}

                {/* Citations & Telemetry Evidence */}
                {!isUser && (
                  <SourceCitation citations={m.citations} evidence={m.evidence} />
                )}

                <div
                  className={`text-[10px] font-mono mt-1 ${
                    isUser ? "text-brand-200" : "text-slate-400"
                  }`}
                >
                  {formatTime(m.timestamp)}
                </div>
              </div>
            </div>
          );
        })}

        {isGenerating && (
          <div className="flex gap-3 max-w-md">
            <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center flex-shrink-0 animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-xs flex items-center gap-2 text-slate-500 font-mono">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-600" />
              <span>Analyzing sensor telemetry & CPCB RAG index...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts Pill Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono whitespace-nowrap">
          Quick Inquiries:
        </span>
        {suggestedQuestions.map((q, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleSend(q)}
            className="px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-purple-500 hover:text-purple-600 whitespace-nowrap transition text-xs font-medium"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="relative flex items-center"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about particulate levels, traffic correlation, or emission causes..."
          className="w-full pl-4 pr-24 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-md"
        />

        <button
          type="submit"
          disabled={!input.trim() || isGenerating}
          className="absolute right-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm transition disabled:opacity-50"
        >
          <span>Ask AI</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}

