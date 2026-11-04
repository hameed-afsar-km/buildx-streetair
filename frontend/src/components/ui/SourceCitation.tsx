import React from "react";
import { AiCitation, AiEvidence } from "@/lib/types";
import { ExternalLink, FileText, Globe, Database, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface SourceCitationProps {
  citations?: AiCitation[];
  evidence?: AiEvidence[];
  className?: string;
}

export function SourceCitation({ citations, evidence, className }: SourceCitationProps) {
  if ((!citations || citations.length === 0) && (!evidence || evidence.length === 0)) {
    return null;
  }

  const getSourceBadge = (type: AiCitation["source_type"]) => {
    switch (type) {
      case "rag_document":
        return {
          icon: <FileText className="w-3 h-3 text-indigo-500" />,
          label: "RAG KNOWLEDGE SOURCE",
          class: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800",
        };
      case "web_search":
        return {
          icon: <Globe className="w-3 h-3 text-blue-500" />,
          label: "VERIFIED WEB EVIDENCE",
          class: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
        };
      case "telemetry_archive":
      default:
        return {
          icon: <Database className="w-3 h-3 text-emerald-500" />,
          label: "STREETAIR TELEMETRY",
          class: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
        };
    }
  };

  return (
    <div className={cn("mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800/80 space-y-2.5", className)}>
      {evidence && evidence.length > 0 && (
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Empirical Telemetry Corroboration
          </span>
          <div className="flex flex-wrap gap-1.5">
            {evidence.map((ev, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span className="font-medium text-slate-800 dark:text-slate-200">{ev.label}</span>
                <span className="text-[10px] text-slate-500">({Math.round(ev.confidence * 100)}% conf)</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {citations && citations.length > 0 && (
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Citations & Reference Material
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {citations.map((c, i) => {
              const badge = getSourceBadge(c.source_type);
              return (
                <a
                  key={i}
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-800/40 hover:border-brand-500 transition text-left"
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded border uppercase",
                        badge.class
                      )}
                    >
                      {badge.icon}
                      {badge.label}
                    </span>
                    <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-brand-500 transition" />
                  </div>
                  <span className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-1 group-hover:text-brand-600 dark:group-hover:text-brand-400">
                    {c.title}
                  </span>
                  {c.snippet && (
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                      {c.snippet}
                    </p>
                  )}
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

