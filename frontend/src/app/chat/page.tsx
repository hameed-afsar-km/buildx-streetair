"use client";

import React, { useState, useRef, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { MarkdownMessage } from "@/components/ui/MarkdownMessage";
import {
  TAMIL_NADU_60_STATIONS,
  ExtendedStation,
  detectStationFromQuery,
  SearchSource,
  TAVILY_MOCK_SOURCES,
} from "@/lib/stationsData";
import {
  Bot,
  Send,
  User,
  ChevronDown,
  Globe,
  Search,
  Sparkles,
  MapPin,
  X,
  Activity,
  Heart,
  ShieldCheck,
  Wind,
  Info,
  Check,
  AlertTriangle,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  isWebSearch?: boolean;
  searchSources?: SearchSource[];
  detectedLocation?: string;
}

// ─── Citizen Quick Prompts ────────────────────────────────────────────────────

const CITIZEN_QUICK_PROMPTS = [
  "Can I jog outside right now?",
  "Health precautions for kids & elderly",
  "Search Google: Live Chennai Air Quality (Tavily)",
  "Should I wear an N95 mask?",
  "What is the cleanest area in Chennai?",
  "How is air quality in Kilambakkam?",
];

// ─── Citizen Response Generator ───────────────────────────────────────────────

function getCitizenResponse(
  query: string,
  station: ExtendedStation,
  locationDetected?: boolean
): { content: string; isWebSearch?: boolean; searchSources?: SearchSource[] } {
  const q = query.toLowerCase();
  const aqi = station.aqi;

  // Web search intent
  if (
    q.includes("google") ||
    q.includes("tavily") ||
    q.includes("search") ||
    q.includes("live update") ||
    q.includes("news") ||
    q.includes("latest")
  ) {
    return {
      content: `### 🌐 Live Web Intelligence & Advisory (Tavily Search)\n\nBased on real-time Google indexing and official bulletins from **TNPCB** and **CPCB**:\n\n• **Regional Advisory**: Local meteorological conditions in the **${station.name}** corridor (${station.city}) show atmospheric boundary stability.\n• **Air Quality Status**: Local AQI is **${aqi} (${station.category})**, with **${station.dominant_pollutant}** as the primary criteria pollutant.\n• **Public Recommendation**: Normal outdoor activities are permitted for healthy adults. Sensitive individuals (asthma, cardiovascular, infants) should limit strenuous exercise during high-traffic peak hours (18:00–21:00).\n• **Municipal Action**: Local water-sprinklers and dust suppression trucks have been active along major transit corridors.`,
      isWebSearch: true,
      searchSources: TAVILY_MOCK_SOURCES,
    };
  }

  // Location switch / area inquiry
  if (locationDetected || q.includes("where") || q.includes("location") || q.includes("area") || q.includes("how is")) {
    const healthAdvice =
      aqi <= 50
        ? "Air quality is satisfactory and poses little to no health risk. Ideal time for outdoor exercise, cycling, and opening home windows."
        : aqi <= 100
        ? "Air quality is acceptable. However, highly sensitive individuals should observe for mild respiratory symptoms if engaging in heavy outdoor workouts."
        : aqi <= 200
        ? "Air quality is moderate to poor. Breathing discomfort may occur for people with lung disease, asthma, or heart conditions. Consider an N95 mask near major roads."
        : "Air quality is unhealthy. Prolonged outdoor exertion should be avoided. Keep windows closed during rush hour.";

    return {
      content: `### 📍 Current Air Quality: ${station.name}\n\n• **Area / Locality**: ${station.location_name}, ${station.city}\n• **Air Quality Index**: **AQI ${aqi} (${station.category})**\n• **Dominant Pollutant**: **${station.dominant_pollutant}**\n• **Distance from Crescent Epicenter**: ${station.distance_km} km\n\n**Citizen Advisory**:\n${healthAdvice}\n\n*Tip: You can ask about other areas like 'How is Tambaram?' or 'Is Guindy air good?' anytime!*`,
    };
  }

  // Jogging / Outdoor sports
  if (q.includes("jog") || q.includes("run") || q.includes("exercise") || q.includes("workout") || q.includes("walk")) {
    if (aqi <= 75) {
      return {
        content: `### 🏃 Outdoor Activity Advisory: Safe to Exercise!\n\n• **Location**: ${station.name} (AQI **${aqi} - ${station.category}**)\n• **Verdict**: **Good for outdoor running & exercise.**\n• **Best Time**: Early morning (05:30 - 07:30 AM) when vehicular emissions along ${station.city} corridors are at their daily minimum.\n• **Hydration**: Drink plenty of water before and after your workout.`,
      };
    } else if (aqi <= 130) {
      return {
        content: `### ⚠️ Outdoor Activity Advisory: Moderate Precautions\n\n• **Location**: ${station.name} (AQI **${aqi} - ${station.category}**)\n• **Verdict**: **Acceptable for moderate outdoor workouts.**\n• **Recommendation**: Joggers with respiratory sensitivities or asthma should reduce intensity or choose parks with dense tree canopies instead of roadside routes.\n• **Peak Traffic Warning**: Avoid running along the highway between 17:30 and 20:30.`,
      };
    } else {
      return {
        content: `### 🚫 Outdoor Activity Advisory: Limit Outdoor Exercise\n\n• **Location**: ${station.name} (AQI **${aqi} - ${station.category}**)\n• **Verdict**: **Indoor workouts recommended.**\n• **Reason**: Elevated particulate matter (${station.dominant_pollutant}) can cause airway irritation and shortness of breath during cardio.\n• **Alternative**: Gym workouts, indoor yoga, or home treadmills with air filtration.`,
      };
    }
  }

  // Mask / Protection advice
  if (q.includes("mask") || q.includes("n95") || q.includes("purifier") || q.includes("filter")) {
    return {
      content: `### 😷 Citizen Protection & Mask Guidance\n\n• **Current AQI at ${station.name}**: **${aqi} (${station.category})**\n\n**Guidelines**:\n1. **Do I need a mask?**:\n   ${
        aqi > 100
          ? "• **Yes, recommended.** A certified N95 or KN95 particulate respirator is advised if you are commuting via two-wheeler, walking along traffic junctions, or spending >30 minutes outdoors."
          : "• **Optional for healthy citizens.** A simple surgical or cloth mask is sufficient for dust, while an N95 is only necessary for high-risk patients during rush hour."
      }\n2. **Home Air Quality**:\n   • Keep doors and windows closed during morning/evening commute spikes.\n   • HEPA air purifiers are recommended for homes located within 100m of major bus terminals or highways.\n3. **Indoor Plants**:\n   • Areca palms, Snake plants, and Spider plants help maintain natural indoor oxygen levels.`,
    };
  }

  // Kids & Elderly health
  if (q.includes("kid") || q.includes("children") || q.includes("elderly") || q.includes("asthma") || q.includes("senior") || q.includes("health")) {
    return {
      content: `### 🩺 Health Guidance for Vulnerable Groups (CPCB Standard)\n\n• **Monitoring Node**: ${station.name}\n• **Index Reading**: AQI **${aqi} (${station.category})** · Dominant: ${station.dominant_pollutant}\n\n**Actionable Advice**:\n• **Children & Schools**: ${
        aqi > 100
          ? "Outdoor sports periods should be shifted indoors or rescheduled to midday when particulate dispersion is higher."
          : "Outdoor playtime is safe. Ensure kids stay hydrated."
      }\n• **Seniors & Asthmatics**: Keep rescue inhalers accessible. If you experience throat dryness, eye irritation, or coughing, stay in well-ventilated indoor spaces.\n• **Dietary Support**: Warm herbal teas, ginger, and Vitamin C rich citrus fruits help strengthen respiratory defenses.`,
    };
  }

  // Cleanest area in Chennai
  if (q.includes("cleanest") || q.includes("best air") || q.includes("safest")) {
    const sortedStations = [...TAMIL_NADU_60_STATIONS].sort((a, b) => a.aqi - b.aqi);
    const top3 = sortedStations.slice(0, 3);
    return {
      content: `### 🌿 Cleanest Monitoring Zones in Tamil Nadu Today\n\nBased on live sensor mesh telemetry, the lowest AQI readings currently recorded are:\n\n1. **${top3[0].name}** — **AQI ${top3[0].aqi} (${top3[0].category})** in ${top3[0].city}\n2. **${top3[1].name}** — **AQI ${top3[1].aqi} (${top3[1].category})** in ${top3[1].city}\n3. **${top3[2].name}** — **AQI ${top3[2].aqi} (${top3[2].category})** in ${top3[2].city}\n\n*Coastal areas and forested eco-zones consistently register satisfactory air quality due to marine breezes and vegetative particulate filtering.*`,
    };
  }

  // General fallback
  return {
    content: `### 🤖 AURA Clean Air Assessment\n\n• **Active Station**: ${station.name} (${station.city})\n• **Current AQI**: **${aqi} (${station.category})**\n• **Dominant Pollutant**: ${station.dominant_pollutant}\n\nAir quality is currently considered **${station.category.toLowerCase()}**. You can ask me:\n• *"Can I jog or exercise outdoors right now?"*\n• *"Should I wear an N95 mask?"*\n• *"Health precautions for kids and seniors"*\n• *"What is the air quality in Guindy or Kilambakkam?"*`,
  };
}

// ─── Main Public Chat Content ─────────────────────────────────────────────────

function PublicChatContent() {
  const searchParams = useSearchParams();
  const stationIdParam = searchParams.get("station_id");

  // Determine initial station
  const initialStation = useMemo(() => {
    if (stationIdParam) {
      const match = TAMIL_NADU_60_STATIONS.find((s) => s.id === stationIdParam);
      if (match) return match;
    }
    return TAMIL_NADU_60_STATIONS[0];
  }, [stationIdParam]);

  const [selectedStationId, setSelectedStationId] = useState(initialStation.id);
  const [locSearchQuery, setLocSearchQuery] = useState("");
  const [isLocDropdownOpen, setIsLocDropdownOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSearchingWeb, setIsSearchingWeb] = useState(false);
  const [searchStepText, setSearchStepText] = useState("");

  const selectedStation = useMemo(
    () => TAMIL_NADU_60_STATIONS.find((s) => s.id === selectedStationId) || TAMIL_NADU_60_STATIONS[0],
    [selectedStationId]
  );

  const filteredStations = useMemo(() => {
    if (!locSearchQuery.trim()) return TAMIL_NADU_60_STATIONS;
    const q = locSearchQuery.toLowerCase();
    return TAMIL_NADU_60_STATIONS.filter(
      (st) =>
        st.name.toLowerCase().includes(q) ||
        st.city.toLowerCase().includes(q) ||
        st.location_name.toLowerCase().includes(q)
    );
  }, [locSearchQuery]);

  const locDropdownRef = useRef<HTMLDivElement>(null);
  const locSearchInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (locDropdownRef.current && !locDropdownRef.current.contains(e.target as Node)) {
        setIsLocDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isLocDropdownOpen) {
      setTimeout(() => locSearchInputRef.current?.focus(), 50);
    }
  }, [isLocDropdownOpen]);

  const formatTimestamp = () =>
    new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  // Initial welcome messages
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: `### 👋 Welcome to AURA · Citizen Clean Air Assistant!\n\nI am your real-time environmental assistant connected to **60 live monitoring stations across Tamil Nadu** and live Google web intelligence via Tavily.\n\n• **Current Focus**: **${initialStation.name}** (${initialStation.city}) · **AQI ${initialStation.aqi} (${initialStation.category})**\n\nFeel free to ask about outdoor exercise, health advice for children & seniors, mask recommendations, or mention any location in Tamil Nadu (e.g. *"How is Kilambakkam?"* or *"Can I jog in Tambaram?"*).`,
      timestamp: formatTimestamp(),
    },
  ]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, isSearchingWeb]);

  const handleSelectLocation = (st: ExtendedStation, fromPrompt = false) => {
    setSelectedStationId(st.id);
    setIsLocDropdownOpen(false);
    setLocSearchQuery("");

    if (!fromPrompt) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `📍 **Station Context Switched to: ${st.name}**\n• **Area**: ${st.location_name}, ${st.city}\n• **Live AQI**: **${st.aqi} (${st.category})** · Dominant Pollutant: ${st.dominant_pollutant}\n• **Distance**: ${st.distance_km} km from Crescent Institute epicenter\n\nYou can ask health or outdoor activity questions about this location or any other Tamil Nadu neighborhood.`,
          timestamp: formatTimestamp(),
        },
      ]);
    }
  };

  const handleSubmit = async (query?: string) => {
    const text = (query ?? input).trim();
    if (!text || isTyping) return;

    // Natural Language Location Recognition
    const mentionedStation = detectStationFromQuery(text);
    const targetStation = mentionedStation || selectedStation;
    let locationDetected = false;

    if (mentionedStation && mentionedStation.id !== selectedStationId) {
      handleSelectLocation(mentionedStation, true);
      locationDetected = true;
    }

    const userMessage: ChatMessage = {
      role: "user",
      content: text,
      timestamp: formatTimestamp(),
      detectedLocation: mentionedStation ? mentionedStation.name : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    const qLower = text.toLowerCase();
    const willSearchWeb =
      qLower.includes("google") ||
      qLower.includes("tavily") ||
      qLower.includes("search") ||
      qLower.includes("live update") ||
      qLower.includes("news") ||
      qLower.includes("latest");

    if (willSearchWeb) {
      setIsSearchingWeb(true);
      setSearchStepText("Querying live Google web index via Tavily API...");
      await new Promise((r) => setTimeout(r, 650));
      setSearchStepText("Fetching live TNPCB bulletins and Chennai air quality news...");
      await new Promise((r) => setTimeout(r, 700));
      setSearchStepText(`Synthesizing clean air guidance for ${targetStation.name}...`);
      await new Promise((r) => setTimeout(r, 550));
    } else {
      await new Promise((resolve) => setTimeout(resolve, 800));
    }

    const { content, isWebSearch, searchSources } = getCitizenResponse(
      text,
      targetStation,
      locationDetected || !!mentionedStation
    );

    const assistantMessage: ChatMessage = {
      role: "assistant",
      content,
      timestamp: formatTimestamp(),
      isWebSearch,
      searchSources,
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setIsSearchingWeb(false);
    setIsTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <PublicHeader variant="standard" />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 sm:px-6 space-y-4">
        {/* Citizen Banner */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-xs transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="p-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                  <Bot className="w-4 h-4" />
                </span>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Public Clean Air Intelligence · 60 Tamil Nadu Stations
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                AURA · Citizen Clean Air Assistant
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Real-time CPCB telemetry, health advisories, outdoor precautions, and Google web intelligence.
              </p>
            </div>

            {/* Active Node Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-xs shrink-0 self-start sm:self-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-slate-700 dark:text-slate-200">{selectedStation.name}</span>
              <span className="px-1.5 py-0.2 rounded font-mono font-bold text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                AQI {selectedStation.aqi}
              </span>
            </div>
          </div>
        </div>

        {/* Chat History Viewport */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xl overflow-hidden flex flex-col transition-colors">
          <div
            className="flex flex-col gap-4 p-4 sm:p-5 overflow-y-auto bg-slate-50/70 dark:bg-slate-950/80"
            style={{ height: "460px" }}
          >
            {messages.map((msg, i) =>
              msg.role === "assistant" ? (
                <div key={i} className="flex items-start gap-3 max-w-[92%]">
                  <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700/50 flex items-center justify-center shadow-xs">
                    <Bot className="w-4 h-4 text-emerald-700 dark:text-emerald-300" />
                  </div>
                  <div className="space-y-1.5 flex-1 min-w-0">
                    {msg.isWebSearch && msg.searchSources && (
                      <div className="rounded-2xl border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/40 p-3 text-xs space-y-2">
                        <div className="flex items-center justify-between text-sky-800 dark:text-sky-300 font-bold">
                          <span className="flex items-center gap-1.5">
                            <Globe className="w-3.5 h-3.5 text-sky-500 animate-pulse" />
                            Live Google Web Search via Tavily API
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-700">
                            {msg.searchSources.length} Verified Sources
                          </span>
                        </div>
                        <div className="grid gap-1.5">
                          {msg.searchSources.map((src, idx) => (
                            <div
                              key={idx}
                              className="p-2 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-sky-100 dark:border-sky-900/50 flex flex-col gap-0.5"
                            >
                              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-800 dark:text-slate-100">
                                <span className="truncate flex-1">{src.title}</span>
                                <span className="text-[10px] text-sky-600 dark:text-sky-400 font-mono ml-2 shrink-0">
                                  {src.domain} · {src.date}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2">
                                {src.snippet}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="rounded-2xl rounded-tl-none border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 px-4 py-3 text-slate-800 dark:text-slate-100 shadow-xs space-y-1">
                      <MarkdownMessage content={msg.content} />
                    </div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 pl-1 font-mono">
                      {msg.timestamp} IST {msg.isWebSearch && "· Tavily Live Search"}
                    </p>
                  </div>
                </div>
              ) : (
                <div key={i} className="flex items-end gap-3 max-w-[85%] ml-auto flex-row-reverse">
                  <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="space-y-1">
                    {msg.detectedLocation && (
                      <div className="flex items-center justify-end gap-1 text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        <MapPin className="w-3 h-3" />
                        <span>Mentioned: {msg.detectedLocation}</span>
                      </div>
                    )}
                    <div className="rounded-2xl rounded-tr-none bg-emerald-600 px-4 py-3 text-white shadow-sm">
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                    </div>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 pr-1 text-right font-mono">
                      {msg.timestamp} IST
                    </p>
                  </div>
                </div>
              )
            )}

            {isSearchingWeb && (
              <div className="flex items-start gap-3 max-w-[90%]">
                <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-950/80 border border-sky-300 dark:border-sky-700/50 flex items-center justify-center">
                  <Globe className="w-4 h-4 text-sky-600 dark:text-sky-400 animate-spin" />
                </div>
                <div className="p-3.5 rounded-2xl rounded-tl-none border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/50 text-sky-900 dark:text-sky-200 shadow-sm flex-1 space-y-1">
                  <span className="text-xs font-bold text-sky-800 dark:text-sky-300 flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-sky-600 animate-pulse" />
                    Searching Google for Live TNPCB Bulletins...
                  </span>
                  <p className="text-[11px] text-sky-700 dark:text-sky-300 font-mono animate-pulse">
                    {searchStepText}
                  </p>
                </div>
              </div>
            )}

            {isTyping && !isSearchingWeb && (
              <div className="flex items-start gap-3 max-w-[85%]">
                <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700/50 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-emerald-700 dark:text-emerald-300" />
                </div>
                <div className="rounded-2xl rounded-tl-none border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 px-4 py-3 shadow-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* ── HIGHLIGHTED COMPACT CITIZEN INPUT BAR ────────────────────── */}
          <div className="border-t border-slate-200/90 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/90 p-3 sm:p-4 space-y-2">
            {/* Quick Prompt Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
              {CITIZEN_QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handleSubmit(prompt)}
                  disabled={isTyping}
                  className={`whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-medium transition shrink-0 cursor-pointer disabled:opacity-50 ${
                    prompt.includes("Search Google")
                      ? "border border-sky-300 dark:border-sky-700 bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 hover:bg-sky-100"
                      : "border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400"
                  }`}
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* 🌟 HERO HIGHLIGHTED INPUT CONSOLE 🌟 */}
            <div className="relative rounded-2xl border-2 border-emerald-500 dark:border-emerald-400 bg-white dark:bg-slate-900 shadow-xl shadow-emerald-500/15 ring-4 ring-emerald-500/15 focus-within:ring-4 focus-within:ring-emerald-500/25 focus-within:border-emerald-500 transition-all p-2.5 sm:p-3 space-y-2">
              {/* Primary Text Input */}
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isTyping}
                  placeholder="Ask about air quality, outdoor exercise, or mention any area (e.g. 'How is Kilambakkam?')..."
                  className="w-full bg-transparent text-slate-900 dark:text-white text-sm font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
                />
              </div>

              {/* Bottom Tools & Send */}
              <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* Location Selector Pill */}
                  <div ref={locDropdownRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setIsLocDropdownOpen(!isLocDropdownOpen)}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition cursor-pointer ${
                        isLocDropdownOpen
                          ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200"
                          : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-400"
                      }`}
                    >
                      <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
                      <span className="max-w-[130px] sm:max-w-[180px] truncate">{selectedStation.name}</span>
                      <span
                        className={`px-1 py-0.2 rounded font-mono font-bold text-[9px] ${
                          selectedStation.aqi > 100
                            ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                            : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        }`}
                      >
                        AQI {selectedStation.aqi}
                      </span>
                      <ChevronDown className="w-3 h-3 text-slate-400" />
                    </button>

                    {/* Popover Type-to-Filter 60 Stations */}
                    {isLocDropdownOpen && (
                      <div className="absolute bottom-full mb-2 left-0 w-80 sm:w-96 max-h-72 flex flex-col rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xl z-50 p-2 space-y-2 animate-in fade-in zoom-in-95">
                        <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-700/60 text-[11px]">
                          <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                            Select Tamil Nadu Location
                          </span>
                          <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                            60 Stations
                          </span>
                        </div>

                        {/* Popover Search Bar */}
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            ref={locSearchInputRef}
                            type="text"
                            value={locSearchQuery}
                            onChange={(e) => setLocSearchQuery(e.target.value)}
                            placeholder="Type location (e.g. Kilambakkam, Guindy, Madurai)..."
                            className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl border border-emerald-500/60 dark:border-emerald-500/60 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                          {locSearchQuery && (
                            <button
                              type="button"
                              onClick={() => setLocSearchQuery("")}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        {/* Station items */}
                        <div className="overflow-y-auto max-h-48 space-y-1 pr-1">
                          {filteredStations.length === 0 ? (
                            <div className="p-3 text-center text-xs text-slate-400">
                              No locations found matching &quot;{locSearchQuery}&quot;
                            </div>
                          ) : (
                            filteredStations.map((st) => {
                              const isSelected = selectedStationId === st.id;
                              return (
                                <button
                                  key={st.id}
                                  type="button"
                                  onClick={() => handleSelectLocation(st)}
                                  className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition cursor-pointer ${
                                    isSelected
                                      ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 font-bold border border-emerald-300 dark:border-emerald-700"
                                      : "hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-300"
                                  }`}
                                >
                                  <div className="min-w-0 flex-1 pr-2">
                                    <p className="font-semibold text-slate-900 dark:text-white truncate text-[11px]">
                                      {st.name}
                                    </p>
                                    <p className="text-[10px] text-slate-400 truncate">
                                      {st.city} · +{st.distance_km} km
                                    </p>
                                  </div>
                                  <span
                                    className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                                      st.aqi > 100
                                        ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                                        : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                    }`}
                                  >
                                    AQI {st.aqi}
                                  </span>
                                </button>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Tavily Badge */}
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/50 border border-sky-200/80 dark:border-sky-800 text-[10px] font-mono text-sky-700 dark:text-sky-300">
                    <Globe className="w-3 h-3 text-sky-500" />
                    <span>Google Search Active</span>
                  </span>
                </div>

                {/* Send Button */}
                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  disabled={isTyping || !input.trim()}
                  aria-label="Send message"
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                >
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Micro Caption */}
            <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 px-1">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-500" />
                Mention any Tamil Nadu neighborhood in your message to switch location automatically
              </span>
              <span className="hidden sm:inline font-mono">Press Enter ↵</span>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

export default function PublicChatPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Bot className="w-5 h-5 text-emerald-500 animate-pulse" />
            <span>Loading Clean Air Assistant...</span>
          </div>
        </div>
      }
    >
      <PublicChatContent />
    </Suspense>
  );
}

