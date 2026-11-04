import React from "react";
import Link from "next/link";
import {
  Sparkles,
  SearchCode,
  Clock,
  SlidersHorizontal,
  BookOpen,
  MessageSquare,
  ArrowRight,
} from "lucide-react";

export default function IntelligenceHubPage() {
  const modules = [
    {
      title: "Pollution Detective",
      desc: "Isolate root-cause hypotheses for sudden spikes using co-pollutant covariance, local wind vectors, and neighboring stations.",
      href: "/intelligence/pollution-detective",
      icon: <SearchCode className="w-6 h-6 text-brand-600" />,
      tag: "Source Apportionment",
    },
    {
      title: "Pollution Time Machine",
      desc: "Step through atmospheric timelines, compare diurnal periods across seasons, and examine past pollution episodes.",
      href: "/intelligence/time-machine",
      icon: <Clock className="w-6 h-6 text-indigo-600" />,
      tag: "Spatial-Temporal Playback",
    },
    {
      title: "What-If City Simulator",
      desc: "Simulate urban policy interventions: evaluate predicted AQI curves when highway traffic is redirected or green canopy expands.",
      href: "/intelligence/what-if",
      icon: <SlidersHorizontal className="w-6 h-6 text-purple-600" />,
      tag: "Scenario Modeling",
    },
    {
      title: "RAG Environmental Knowledge",
      desc: "Search CPCB National Ambient Air Quality standards, health epidemiological studies, and industrial compliance benchmarks.",
      href: "/intelligence/knowledge",
      icon: <BookOpen className="w-6 h-6 text-blue-600" />,
      tag: "Vector Knowledge Base",
    },
    {
      title: "Environmental AI Assistant",
      desc: "Chat with an environmental intelligence agent with Groq/Ollama provider switching, live citations, and empirical evidence.",
      href: "/intelligence/chat",
      icon: <MessageSquare className="w-6 h-6 text-emerald-600" />,
      tag: "Agentic Inquiries",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 font-mono">
          Neural Environmental Operations
        </span>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
          STREETAIR Intelligence Suite
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Machine learning models, anomaly apportionment algorithms, and interactive policy simulators.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((mod) => (
          <Link
            key={mod.title}
            href={mod.href}
            className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between shadow-sm hover:border-purple-500 hover:shadow-md transition"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:scale-105 transition shadow-sm">
                  {mod.icon}
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold">
                  {mod.tag}
                </span>
              </div>

              <h2 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-purple-600 transition">
                {mod.title}
              </h2>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-2">
                {mod.desc}
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-purple-600">
              <span>Open Module</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

