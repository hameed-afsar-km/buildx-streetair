"use client";

import React, { useState } from "react";
import { BookOpen, Search, ExternalLink, FileText, ShieldCheck } from "lucide-react";

export default function KnowledgeExplorerPage() {
  const [query, setQuery] = useState("");

  const articles = [
    {
      title: "CPCB National Ambient Air Quality Standards (NAAQS)",
      category: "Indian Environmental Law",
      snippet:
        "Prescribes permissible annual and 24-hour limits for PM2.5 (60 µg/m³), PM10 (100 µg/m³), NO2 (80 µg/m³), and SO2 (80 µg/m³) in industrial and residential areas.",
      source: "Central Pollution Control Board (Schedule VII)",
      link: "https://cpcb.nic.in/air-quality-standard/",
    },
    {
      title: "Tamil Nadu Air (Prevention and Control of Pollution) Rules",
      category: "State Environmental Rules",
      snippet:
        "Regulatory enforcement powers of the Tamil Nadu Pollution Control Board (TNPCB) regarding consent to operate, stack monitoring, and roadside biomass burning penalties.",
      source: "TNPCB Legal Cell",
      link: "https://tnpcb.gov.in/",
    },
    {
      title: "WHO Global Air Quality Guidelines 2021 Update",
      category: "Global Health Standards",
      snippet:
        "World Health Organization recommendations lowering safe 24-hour PM2.5 exposure guideline to 15 µg/m³ and annual exposure to 5 µg/m³.",
      source: "WHO Headquarters Geneva",
      link: "https://www.who.int/publications/i/item/9789240034228",
    },
    {
      title: "Diurnal Planetary Boundary Layer Dynamics in Coastal Tamil Nadu",
      category: "Atmospheric Science",
      snippet:
        "Meteorological research detailing afternoon thermal convective mixing from Bay of Bengal sea breeze onset versus nocturnal shallow inversion trapping.",
      source: "Indian Institute of Science / IMD",
      link: "#",
    },
  ];

  const filtered = articles.filter(
    (a) =>
      a.title.toLowerCase().includes(query.toLowerCase()) ||
      a.snippet.toLowerCase().includes(query.toLowerCase()) ||
      a.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-600 text-white">
              <BookOpen className="w-4 h-4" />
            </span>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              RAG Environmental Knowledge Explorer
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Indexed vector database containing statutory regulations, CPCB limits, and peer-reviewed
            atmospheric research.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search standards & guidelines..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((item, i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between shadow-sm space-y-4 hover:border-blue-500 transition"
          >
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 uppercase">
                {item.category}
              </span>

              <h2 className="text-base font-bold text-slate-900 dark:text-white mt-2">
                {item.title}
              </h2>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-2">
                {item.snippet}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="truncate max-w-[200px]">{item.source}</span>
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-bold text-blue-600 hover:underline"
              >
                <span>Read Full Standard</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

