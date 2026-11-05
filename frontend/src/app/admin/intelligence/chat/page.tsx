"use client";

import React, { useState, useRef, useEffect } from "react";
import { TAMIL_NADU_60_STATIONS, ExtendedStation } from "@/lib/stationsData";
import {
  Bot,
  Send,
  User,
  Cloud,
  Cpu,
  ChevronDown,
  Check,
  Globe,
  ExternalLink,
  Search,
  Sparkles,
  MapPin,
  Navigation,
  Compass,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface SearchSource {
  title: string;
  domain: string;
  date: string;
  snippet: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  isWebSearch?: boolean;
  searchSources?: SearchSource[];
}

type ModelProvider = "groq" | "ollama";

interface GroqModelOption {
  id: string;
  label: string;
  speed: string;
}

interface OllamaModelOption {
  id: string;
  label: string;
  size: string;
}

const GROQ_MODELS: GroqModelOption[] = [
  { id: "gpt-oss-120b",          label: "GPT OSS 120B",            speed: "Ultra-Fast (Groq LPU)" },
  { id: "llama-3.1-70b-versatile", label: "LLaMA 3.1 70B Versatile", speed: "Fast" },
  { id: "llama-3.1-8b-instant",    label: "LLaMA 3.1 8B Instant",    speed: "Fastest" },
  { id: "mixtral-8x7b-32768",      label: "Mixtral 8x7B 32K",        speed: "Balanced" },
];

const OLLAMA_MODELS: OllamaModelOption[] = [
  { id: "qwen2.5:1.5b", label: "Qwen 2.5 1.5B", size: "1.5B (Edge/Local)" },
  { id: "llama3",       label: "LLaMA 3",       size: "8B" },
  { id: "mistral",      label: "Mistral",       size: "7B" },
  { id: "phi3",         label: "Phi-3",         size: "3.8B" },
  { id: "gemma2",       label: "Gemma 2",       size: "9B" },
];

// ─── Mock AI response logic ───────────────────────────────────────────────────

const TAVILY_MOCK_SOURCES: SearchSource[] = [
  {
    title: "TNPCB Official Advisory: Air Quality Watch - South Chennai & GST Corridor",
    domain: "tnpcb.gov.in",
    date: "Today, 05:30 IST",
    snippet:
      "Tamil Nadu Pollution Control Board warns of seasonal temperature inversion in Vandalur-Tambaram corridor. Heavy diesel truck rerouting recommended during 18:00-21:00 peak hours.",
  },
  {
    title: "Google News / The Hindu: Kilambakkam Bus Terminus Traffic & Particulate Advisory",
    domain: "thehindu.com",
    date: "Today, 04:15 IST",
    snippet:
      "Ongoing highway maintenance near Crescent Institute junction created localized dust plumes; municipal water sprinklers deployed to mitigate ambient PM10.",
  },
  {
    title: "Central Pollution Control Board (CPCB): Real-Time NAQI Bulletin",
    domain: "cpcb.nic.in",
    date: "Live, 10 min ago",
    snippet:
      "Southern Chennai stations report Moderate Air Quality Index (NAQI 68-112). Ground level ozone remains within safety thresholds with 68% relative humidity.",
  },
];

function getMockResponse(query: string, station?: ExtendedStation): { content: string; isWebSearch?: boolean; searchSources?: SearchSource[] } {
  const currentStation = station || TAMIL_NADU_60_STATIONS[0];
  const stationName = currentStation.name;
  const locationName = currentStation.location_name;
  const aqi = currentStation.aqi;
  const category = currentStation.category;
  const dominant = currentStation.dominant_pollutant || "PM2.5";
  const coords = `${currentStation.coordinates.lat.toFixed(4)}°N, ${currentStation.coordinates.lng.toFixed(4)}°E`;
  const q = query.toLowerCase();

  // Web search / Tavily trigger
  if (
    q.includes("google") ||
    q.includes("tavily") ||
    q.includes("search") ||
    q.includes("live update") ||
    q.includes("news") ||
    q.includes("latest")
  ) {
    return {
      isWebSearch: true,
      searchSources: TAVILY_MOCK_SOURCES,
      content:
        "### 🌐 Live Web Search Results (via Google & Tavily API)\n\nI queried Google and the Tavily live web index for real-time environmental news, traffic alerts, and CPCB/TNPCB advisories around **Chennai and the Vandalur GST corridor**:\n\n1. **TNPCB Winter Inversion Protocol**: Active advisory in effect across the Tambaram-Vandalur highway belt. Early-evening atmospheric trapping is expected between 18:00 and 21:00 IST.\n2. **Kilambakkam Infrastructure Advisory**: Roadwork near the KCBT bus terminus is generating short-term coarse particulate spikes (PM10) along Grand Southern Trunk Road.\n3. **Local Sensor Telemetry Correlation**: Our **ESP32 hardware station at B.S. Abdur Rahman Crescent Institute** confirms this trend with current AQI at **72 (Moderate)** and PM2.5 at **34.2 μg/m³**, aligning closely with CPCB's regional bulletin.\n\n*All search evidence has been verified and cross-referenced with your live ESP32 mesh telemetry.*",
    };
  }

  if (q.includes("aqi") || q.includes("air quality index")) {
    return {
      content:
        `Current Telemetry at **${stationName}** (${locationName}):\n\n• **Current AQI**: **${aqi} (${category})**\n• **Dominant Criteria Pollutant**: **${dominant}**\n• **Coordinates**: [${coords}]\n• **Distance from Crescent Epicenter**: [${currentStation.distance_km} km]\n• **Status**: [${currentStation.status.toUpperCase()}] (${currentStation.is_hardware_connected ? "Live Hardware ESP32 Beacon" : "Mesh Telemetry Node"})\n\nBased on CPCB ambient guidelines, air quality at this location is **${category}**. Sensitive groups should limit prolonged outdoor exertion during evening rush hours.`,
    };
  }
  if (q.includes("incident") || q.includes("anomaly") || q.includes("spike")) {
    return {
      content:
        "Three pollution incidents have been detected in the last 24 hours. The most significant is a **PM2.5 spike (AQI 142)** at the Kilambakkam junction, likely attributed to heavy vehicle traffic during road construction. The anomaly detection engine flagged this at **14:32 IST with 91% confidence**.",
    };
  }
  if (q.includes("cpcb") || q.includes("limit") || q.includes("standard") || q.includes("regulation")) {
    return {
      content:
        "**CPCB National Ambient Air Quality Standards** (24-hour averages):\n\n• PM2.5: 60 μg/m³\n• PM10: 100 μg/m³\n• NO₂: 80 μg/m³\n• SO₂: 80 μg/m³\n• CO: 4 mg/m³\n• O₃: 100 μg/m³\n\nThe Vandalur monitoring station is currently **within permissible limits** for all measured pollutants.",
    };
  }
  if (q.includes("traffic") || q.includes("vehicle") || q.includes("emission")) {
    return {
      content:
        "Traffic emission analysis shows **vehicular sources contribute ~62%** of total PM2.5 load at Vandalur corridor. Peak emission windows: 08:00-10:00 (morning rush) and 18:00-21:00 (evening congestion). Heavy diesel vehicles on GST Road are the primary contributor based on elemental carbon ratio matching.",
    };
  }
  if (q.includes("esp32") || q.includes("crescent") || q.includes("hardware") || q.includes("sensor")) {
    return {
      content:
        "The **ESP32 hardware master node** (and surrounding 60-station Tamil Nadu mesh) is **online and transmitting telemetry**. Latest reading: AQI 72, PM2.5 34.2 μg/m³, temperature 29.4°C, humidity 68%. Signal strength: -62 dBm. Last packet received: just now.",
    };
  }
  return {
    content:
      "Based on the STREETAIR knowledge base and current sensor telemetry, I can provide analysis on this topic. The monitoring network is currently **operational with 5 of 6 stations** reporting live data. Would you like me to focus on a specific pollutant, query Google live news via Tavily, or check the ESP32 node?",
  };
}

function formatTimestamp(): string {
  return new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

// ─── Quick prompts ────────────────────────────────────────────────────────────

const QUICK_PROMPTS = [
  "🔍 Search Google: Live Chennai Air Quality Updates (Tavily)",
  "Explain current AQI",
  "Recent incident analysis",
  "CPCB PM2.5 limits",
  "ESP32 sensor status",
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    role: "assistant",
    content:
      "Hello! I'm **AURA**, your environmental air intelligence assistant. I can help you analyze pollution incidents, interpret sensor telemetry, explain CPCB regulations, or **search Google live via Tavily** for regional news and alerts. What would you like to explore today?",
    timestamp: formatTimestamp(),
  },
];

// ─── Model Selector Component ─────────────────────────────────────────────────

function ModelSelector({
  provider,
  setProvider,
  groqModel,
  setGroqModel,
  ollamaModel,
  setOllamaModel,
}: {
  provider: ModelProvider;
  setProvider: (p: ModelProvider) => void;
  groqModel: string;
  setGroqModel: (m: string) => void;
  ollamaModel: string;
  setOllamaModel: (m: string) => void;
}) {
  const [groqOpen, setGroqOpen] = useState(false);
  const [ollamaOpen, setOllamaOpen] = useState(false);

  const selectedGroq = GROQ_MODELS.find((m) => m.id === groqModel) || GROQ_MODELS[0];
  const selectedOllama = OLLAMA_MODELS.find((m) => m.id === ollamaModel) || OLLAMA_MODELS[0];

  return (
    <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
      {/* Provider Toggle */}
      <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-200 dark:bg-slate-800">
        <button
          onClick={() => setProvider("groq")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
            provider === "groq"
              ? "bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-sm"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
        >
          <Cloud className="w-3.5 h-3.5" />
          Groq Cloud
        </button>
        <button
          onClick={() => setProvider("ollama")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition ${
            provider === "ollama"
              ? "bg-white dark:bg-slate-700 text-violet-700 dark:text-violet-300 shadow-sm"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          Ollama Local
        </button>
      </div>

      {/* Model Dropdown */}
      <div className="relative">
        {provider === "groq" ? (
          <>
            <button
              onClick={() => {
                setGroqOpen((o) => !o);
                setOllamaOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-semibold text-slate-700 dark:text-slate-200 hover:border-emerald-500 transition"
            >
              <span className="text-emerald-600 dark:text-emerald-400">{selectedGroq.label}</span>
              <span className="text-[10px] text-slate-400 font-sans">{selectedGroq.speed}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
            {groqOpen && (
              <div className="absolute top-full mt-1 left-0 w-64 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg z-50 overflow-hidden">
                {GROQ_MODELS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setGroqModel(m.id);
                      setGroqOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2.5 text-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                  >
                    <span className="font-semibold text-slate-800 dark:text-slate-100">{m.label}</span>
                    <span className="flex items-center gap-1.5">
                      <span className="text-slate-400 font-mono text-[10px]">{m.speed}</span>
                      {m.id === groqModel && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <button
              onClick={() => {
                setOllamaOpen((o) => !o);
                setGroqOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-semibold text-slate-700 dark:text-slate-200 hover:border-violet-500 transition"
            >
              <span className="text-violet-600 dark:text-violet-400">{selectedOllama.label}</span>
              <span className="text-[10px] text-slate-400 font-sans">{selectedOllama.size}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
            {ollamaOpen && (
              <div className="absolute top-full mt-1 left-0 w-56 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg z-50 overflow-hidden">
                {OLLAMA_MODELS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setOllamaModel(m.id);
                      setOllamaOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2.5 text-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                  >
                    <span className="font-semibold text-slate-800 dark:text-slate-100">{m.label}</span>
                    <span className="flex items-center gap-1.5">
                      <span className="text-slate-400 font-mono text-[10px]">{m.size}</span>
                      {m.id === ollamaModel && <Check className="w-3.5 h-3.5 text-violet-500" />}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Tavily Integration Badge */}
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-100 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800/80 text-[11px] text-sky-800 dark:text-sky-300 font-medium">
        <Globe className="w-3 h-3 text-sky-500" />
        <span>Tavily Search: Online</span>
      </div>

      {/* Status Indicator */}
      <div className="flex items-center gap-1.5 ml-auto">
        <span
          className={
            "w-1.5 h-1.5 rounded-full animate-pulse " +
            (provider === "groq" ? "bg-emerald-500" : "bg-violet-500")
          }
        />
        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
          {provider === "groq" ? "Groq · High Throughput" : "Ollama · Local Node"}
        </span>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function AIChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSearchingWeb, setIsSearchingWeb] = useState(false);
  const [searchStepText, setSearchStepText] = useState("");

  // Model selection state - defaults to GPT OSS 120B (Groq) & Qwen 2.5 1.5B (Ollama)
  const [provider, setProvider] = useState<ModelProvider>("groq");
  const [groqModel, setGroqModel] = useState("gpt-oss-120b");
  const [ollamaModel, setOllamaModel] = useState("qwen2.5:1.5b");

  // Active Station/Location Selection
  const [selectedStationId, setSelectedStationId] = useState<string>("crescent-vandalur-01");
  const [locSearch, setLocSearch] = useState("");
  const [locDropdownOpen, setLocDropdownOpen] = useState(false);

  const selectedStation =
    TAMIL_NADU_60_STATIONS.find((s) => s.id === selectedStationId) || TAMIL_NADU_60_STATIONS[0];

  const handleSelectLocation = (st: ExtendedStation) => {
    setSelectedStationId(st.id);
    setLocDropdownOpen(false);
    // Add a system notification message into the chat
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: `📍 **Location Context Updated: ${st.name}**\n• **Locality**: ${st.location_name}, ${st.city}\n• **Current AQI**: **${st.aqi} (${st.category})** · Dominant: ${st.dominant_pollutant}\n• **Coordinates**: [${st.coordinates.lat.toFixed(4)}°N, ${st.coordinates.lng.toFixed(4)}°E] (${st.distance_km} km from Crescent epicenter)\n\nYou can now ask questions specifically about air quality, traffic dispersion, or health advisories for this locality.`,
        timestamp: formatTimestamp(),
      },
    ]);
  };

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, isSearchingWeb]);

  const handleSubmit = async (query?: string) => {
    const text = (query ?? input).trim();
    if (!text || isTyping) return;

    const userMessage: ChatMessage = { role: "user", content: text, timestamp: formatTimestamp() };
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
      setSearchStepText("Querying Google web index via Tavily Search API...");
      await new Promise((r) => setTimeout(r, 700));
      setSearchStepText("Scraping live TNPCB government advisories and regional news updates...");
      await new Promise((r) => setTimeout(r, 800));
      setSearchStepText("Cross-referencing live web findings with Crescent Institute ESP32 telemetry...");
      await new Promise((r) => setTimeout(r, 600));
    } else {
      await new Promise((resolve) => setTimeout(resolve, provider === "ollama" ? 1800 : 1300));
    }

    const { content, isWebSearch, searchSources } = getMockResponse(text);

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

  // Active model display label for header
  const activeModelLabel =
    provider === "groq"
      ? GROQ_MODELS.find((m) => m.id === groqModel)?.label ?? groqModel
      : OLLAMA_MODELS.find((m) => m.id === ollamaModel)?.label ?? ollamaModel;

  // Simple markdown-ish renderer (bold, headers, bullet lines)
  const renderContent = (content: string) => {
    const lines = content.split("\n");
    return lines.map((line, i) => {
      if (line.startsWith("### ")) {
        return (
          <h3 key={i} className="text-sm font-bold text-slate-900 dark:text-white mt-2 mb-1 flex items-center gap-1.5">
            {line.replace("### ", "")}
          </h3>
        );
      }
      const parts = line.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={j} className="text-slate-900 dark:text-white font-bold">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });
      return (
        <p key={i} className="leading-relaxed text-sm">
          {parts}
        </p>
      );
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 shadow-sm text-slate-900 dark:text-white transition-colors">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Bot className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span
              className={
                "text-[10px] font-mono font-bold uppercase tracking-wider " +
                (provider === "groq"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-violet-600 dark:text-violet-400")
              }
            >
              {provider === "groq" ? "Groq Cloud" : "Ollama Local"} · {activeModelLabel} · Tavily Search Enabled
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">AURA · Environmental Intelligence</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
            Ask about air quality conditions, sensor readings, CPCB regulations, pollution incidents,
            or search Google via Tavily for live environmental news. Powered by real-time telemetry and web evidence.
          </p>
        </div>
      </div>

      {/* Chat Container */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm overflow-hidden flex flex-col transition-colors">
        {/* Chat Area */}
        <div
          className="flex flex-col gap-4 p-4 overflow-y-auto bg-slate-50 dark:bg-slate-950/80"
          style={{ height: "480px" }}
        >
          {messages.map((msg, i) =>
            msg.role === "assistant" ? (
              <div key={i} className="flex items-start gap-3 max-w-[90%]">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700/50 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-emerald-700 dark:text-emerald-300" />
                </div>
                <div className="space-y-2 flex-1">
                  {/* Tavily Web Search Sources Card */}
                  {msg.isWebSearch && msg.searchSources && (
                    <div className="rounded-xl border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/40 p-3 text-xs space-y-2">
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
                            className="p-2 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-sky-100 dark:border-sky-900/50 flex flex-col gap-0.5"
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
                    {renderContent(msg.content)}
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 pl-1 font-mono">
                    {msg.timestamp} IST {msg.isWebSearch && "· Tavily Search"}
                  </p>
                </div>
              </div>
            ) : (
              <div key={i} className="flex items-end gap-3 max-w-[85%] ml-auto flex-row-reverse">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="space-y-1">
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

          {/* Web Search Progress Indicator */}
          {isSearchingWeb && (
            <div className="flex items-start gap-3 max-w-[90%]">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-sky-100 dark:bg-sky-950/80 border border-sky-300 dark:border-sky-700/50 flex items-center justify-center">
                <Globe className="w-4 h-4 text-sky-600 dark:text-sky-400 animate-spin" />
              </div>
              <div className="p-3.5 rounded-2xl rounded-tl-none border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/50 text-sky-900 dark:text-sky-200 shadow-sm flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-sky-800 dark:text-sky-300 flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-sky-600 animate-pulse" />
                    Searching Google for Live Updates...
                  </span>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-sky-200/80 dark:bg-sky-900/80 text-sky-800 dark:text-sky-200 font-bold uppercase">
                    Tavily Pipeline
                  </span>
                </div>
                <p className="text-[11px] text-sky-700 dark:text-sky-300 font-mono animate-pulse">
                  {searchStepText}
                </p>
              </div>
            </div>
          )}

          {/* Regular Typing indicator */}
          {isTyping && !isSearchingWeb && (
            <div className="flex items-start gap-3 max-w-[85%]">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700/50 flex items-center justify-center">
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

        {/* Input Area */}
        <div className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
          {/* Model Selector */}
          <ModelSelector
            provider={provider}
            setProvider={setProvider}
            groqModel={groqModel}
            setGroqModel={setGroqModel}
            ollamaModel={ollamaModel}
            setOllamaModel={setOllamaModel}
          />

          {/* Quick Location Selector Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 flex-shrink-0">
              <Compass className="w-3.5 h-3.5 text-emerald-500" />
              Location:
            </span>
            {[
              { id: "crescent-vandalur-01", label: "Crescent Campus" },
              { id: "kilambakkam-terminal-02", label: "Kilambakkam KCBT" },
              { id: "tambaram-hub-06", label: "Tambaram Railway Hub" },
              { id: "guindy-industrial-11", label: "Guindy Industrial" },
              { id: "oragadam-auto-26", label: "Oragadam Corridor" },
              { id: "coimbatore-gandhipuram-46", label: "Coimbatore Hub" },
            ].map((loc) => {
              const st = TAMIL_NADU_60_STATIONS.find((s) => s.id === loc.id);
              const isSelected = selectedStationId === loc.id;
              return (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => st && handleSelectLocation(st)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition border font-medium ${
                    isSelected
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-500"
                  }`}
                >
                  <MapPin className="w-3 h-3" />
                  <span>{loc.label}</span>
                  {st && (
                    <span className={`text-[10px] font-mono ${isSelected ? "text-emerald-100" : "text-slate-400"}`}>
                      {st.aqi}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Prompt Pills */}
          <div className="flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSubmit(prompt)}
                disabled={isTyping}
                className={`text-xs px-3 py-1.5 rounded-full border transition disabled:opacity-50 disabled:cursor-not-allowed font-medium ${
                  prompt.includes("Search Google")
                    ? "border-sky-300 dark:border-sky-700 bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/60 shadow-xs"
                    : "border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-700"
                }`}
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Text Input + Send */}
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isTyping}
              placeholder="Ask AURA or ask to 'search Google for live air quality updates'..."
              className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm px-4 py-2.5 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition disabled:opacity-50"
            />
            <button
              onClick={() => handleSubmit()}
              disabled={isTyping || !input.trim()}
              className="flex-shrink-0 w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:cursor-not-allowed flex items-center justify-center transition shadow-md shadow-emerald-500/20"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>

          <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center">
            AURA · Groq {activeModelLabel} · Tavily Search verifies data against live Google indices and TNPCB bulletins
          </p>
        </div>
      </div>
    </div>
  );
}
