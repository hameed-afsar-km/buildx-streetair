"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { MarkdownMessage } from "@/components/ui/MarkdownMessage";
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
  X,
  Activity,
  Layers,
  ArrowRight,
  MessageSquare,
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
  detectedLocation?: string;
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
  { id: "gpt-oss-120b",            label: "GPT OSS 120B",            speed: "Ultra-Fast (Groq LPU)" },
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

// ─── Helper: Natural Language Location / Area Detection ──────────────────────

export function detectStationFromQuery(query: string): ExtendedStation | null {
  const q = query.toLowerCase();

  const KEYWORD_MAP: Record<string, string> = {
    crescent: "crescent-vandalur-01",
    vandalur: "crescent-vandalur-01",
    kcbt: "kilambakkam-terminal-02",
    kilambakkam: "kilambakkam-terminal-02",
    tambaram: "tambaram-junction-03",
    urapakkam: "urapakkam-gst-07",
    perungalathur: "perungalathur-traffic-08",
    guduvanchery: "guduvanchery-hub-09",
    maraimalai: "maraimalai-industrial-04",
    singaperumal: "singaperumal-koil-10",
    sholinganallur: "omr-sholinganallur-11",
    siruseri: "omr-siruseri-12",
    mahindra: "mahindra-world-city-13",
    mwc: "mahindra-world-city-13",
    velachery: "velachery-mrts-14",
    guindy: "guindy-estate-15",
    porur: "porur-junction-16",
    thiruvanmiyur: "thiruvanmiyur-coastal-17",
    chengalpattu: "chengalpattu-highway-06",
    tnagar: "tnagar-commercial-18",
    "t nagar": "tnagar-commercial-18",
    ambattur: "ambattur-estate-19",
    avadi: "avadi-railway-20",
    central: "chennai-central-21",
    "chennai central": "chennai-central-21",
    madhavaram: "madhavaram-truck-22",
    manali: "manali-petrochem-23",
    ennore: "ennore-thermal-24",
    oragadam: "oragadam-auto-25",
    sriperumbudur: "sriperumbudur-sipcot-26",
    walajabad: "walajabad-agro-27",
    tiruvallur: "tiruvallur-town-28",
    kanchipuram: "kanchipuram-temple-29",
    ponneri: "ponneri-smart-30",
    gummidipoondi: "gummidipoondi-sipcot-31",
    ranipet: "ranipet-chemical-32",
    vellore: "vellore-katpadi-33",
    katpadi: "vellore-katpadi-33",
    vit: "vellore-katpadi-33",
    ambur: "ambur-leather-34",
    tiruvannamalai: "tiruvannamalai-heritage-35",
    krishnagiri: "krishnagiri-nh-36",
    hosur: "hosur-electronics-37",
    cuddalore: "cuddalore-sipcot-38",
    neyveli: "neyveli-lignite-39",
    salem: "salem-steel-40",
    trichy: "trichy-junction-41",
    tiruchirappalli: "trichy-junction-41",
    thanjavur: "thanjavur-heritage-43",
    namakkal: "namakkal-transport-44",
    karur: "karur-textile-45",
    erode: "erode-perundurai-46",
    tiruppur: "tiruppur-knitwear-47",
    coimbatore: "coimbatore-gandhipuram-48",
    pollachi: "pollachi-agro-50",
    ooty: "ooty-nilgiris-51",
    nilgiris: "ooty-nilgiris-51",
    kodaikanal: "kodaikanal-reserve-52",
    dindigul: "dindigul-lock-53",
    madurai: "madurai-mattuthavani-54",
    virudhunagar: "virudhunagar-hub-56",
    sivakasi: "sivakasi-print-57",
    tirunelveli: "tirunelveli-junction-58",
    thoothukudi: "thoothukudi-port-59",
    tuticorin: "thoothukudi-port-59",
    kanyakumari: "kanyakumari-cape-60",
  };

  for (const [kw, stationId] of Object.entries(KEYWORD_MAP)) {
    if (q.includes(kw)) {
      return TAMIL_NADU_60_STATIONS.find((s) => s.id === stationId) || null;
    }
  }

  for (const st of TAMIL_NADU_60_STATIONS) {
    const city = st.city.toLowerCase();
    const name = st.name.toLowerCase();
    if (city.length > 3 && q.includes(city)) return st;
    if (name.length > 4 && q.includes(name)) return st;
  }

  return null;
}

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

function getMockResponse(
  query: string,
  station?: ExtendedStation,
  locationDetected?: boolean
): { content: string; isWebSearch?: boolean; searchSources?: SearchSource[] } {
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
        `### 🌐 Live Web Search Results (via Google & Tavily API)\n\nI queried Google and the Tavily live web index for real-time environmental news, traffic alerts, and CPCB/TNPCB advisories around **${currentStation.city} and ${stationName}**:\n\n1. **TNPCB Regional Advisory**: Active monitoring in effect across the ${currentStation.city} transit corridor. Atmospheric inversion expected during evening traffic peaks.\n2. **Infrastructure & Particulate Bulletin**: Municipal environmental teams are monitoring coarse particulate spikes (${dominant}) along high-density arterials.\n3. **Local Sensor Telemetry Correlation**: Our station at **${stationName}** records a current AQI of **${aqi} (${category})** with dominant pollutant **${dominant}**, aligning closely with CPCB's regional bulletin.\n\n*All search evidence has been verified and cross-referenced with your live mesh telemetry.*`,
    };
  }

  // If user mentioned this station specifically or asked about its area
  if (locationDetected || q.includes(currentStation.city.toLowerCase()) || q.includes(currentStation.name.toLowerCase())) {
    return {
      content: `### 📍 Localized Air Quality Diagnostic: ${stationName}\n\n**Telemetry for ${locationName}, ${currentStation.city}**:\n• **Current AQI**: **${aqi} (${category})**\n• **Dominant Criteria Pollutant**: **${dominant}**\n• **Coordinates**: [${coords}]\n• **Distance from Crescent Epicenter**: [${currentStation.distance_km} km]\n• **Network Status**: [${currentStation.status.toUpperCase()}] · ${currentStation.source} Telemetry\n• **Firmware**: \`${currentStation.firmware_version || "v2.4-mesh"}\`\n• **Sensor Suite**: ${currentStation.sensor_suite?.join(", ") || "PM2.5, PM10, BME280"}\n\n**Environmental Assessment**:\n${
        aqi > 100
          ? `Elevated concentrations of **${dominant}** recorded. Atmospheric boundary layer stability combined with local transit/industrial activity is contributing to localized particulate buildup. Sensitive groups should restrict prolonged outdoor exposure in this area.`
          : `Air quality at this station is considered **${category}** according to India National Air Quality Standards (CPCB NAQI). Ambient pollutant concentrations remain safely within national permissible thresholds.`
      }`,
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
        `Three pollution incidents have been detected across the Tamil Nadu mesh in the last 24 hours. The most significant near **${currentStation.city}** is a particulate elevation (AQI ${aqi}) flagged with **91% confidence**. No critical sensor hardware drift was detected.`,
    };
  }
  if (q.includes("cpcb") || q.includes("limit") || q.includes("standard") || q.includes("regulation")) {
    return {
      content:
        "**CPCB National Ambient Air Quality Standards** (24-hour averages):\n\n• PM2.5: 60 μg/m³\n• PM10: 100 μg/m³\n• NO₂: 80 μg/m³\n• SO₂: 80 μg/m³\n• CO: 4 mg/m³\n• O₃: 100 μg/m³\n\nThe active monitoring station is currently **within permissible limits** for all monitored criteria pollutants.",
    };
  }
  if (q.includes("traffic") || q.includes("vehicle") || q.includes("emission")) {
    return {
      content:
        `Traffic emission analysis for **${currentStation.city}** shows vehicular sources contribute ~58-64% of total particulate load during peak transit hours. Heavy commercial diesel transit along nearby corridors remains the primary source profile.`,
    };
  }
  if (q.includes("esp32") || q.includes("crescent") || q.includes("hardware") || q.includes("sensor")) {
    return {
      content:
        "The **ESP32 hardware master node** (and surrounding 60-station Tamil Nadu mesh) is **online and transmitting telemetry**. Latest reading: AQI 72, PM2.5 34.2 μg/m³, temperature 29.4°C, humidity 68%. Signal strength: -62 dBm. Packets received in real time.",
    };
  }
  return {
    content:
      `Based on STREETAIR telemetry for **${stationName}** (${currentStation.city}), current AQI is **${aqi} (${category})**. You can ask about specific pollutants, request a Google live search via Tavily, or mention another area (e.g. *Kilambakkam*, *Tambaram*, *Guindy*, *Coimbatore*, *Madurai*) to switch location context.`,
  };
}

function formatTimestamp(): string {
  return new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

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
      "Hello! I'm **AURA**, your environmental air intelligence assistant. I can help you analyze pollution incidents, interpret sensor telemetry, explain CPCB regulations, or **search Google live via Tavily** for regional news.\n\n💡 **Tip**: Type in the location search bar to switch nodes, or simply **mention any specific area directly in your chat prompt** (e.g., *'How is the air in Kilambakkam?'* or *'Check Tambaram'*).",
    timestamp: formatTimestamp(),
  },
];

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function AIChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSearchingWeb, setIsSearchingWeb] = useState(false);
  const [searchStepText, setSearchStepText] = useState("");

  // Model selection state
  const [provider, setProvider] = useState<ModelProvider>("groq");
  const [groqModel, setGroqModel] = useState("gpt-oss-120b");
  const [ollamaModel, setOllamaModel] = useState("qwen2.5:1.5b");
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);

  // Active Station/Location Selection
  const [selectedStationId, setSelectedStationId] = useState<string>("crescent-vandalur-01");
  const [locSearchQuery, setLocSearchQuery] = useState("");
  const [isLocDropdownOpen, setIsLocDropdownOpen] = useState(false);
  const locDropdownRef = useRef<HTMLDivElement>(null);
  const modelDropdownRef = useRef<HTMLDivElement>(null);

  const selectedStation =
    TAMIL_NADU_60_STATIONS.find((s) => s.id === selectedStationId) || TAMIL_NADU_60_STATIONS[0];

  const selectedGroq = GROQ_MODELS.find((m) => m.id === groqModel) || GROQ_MODELS[0];
  const selectedOllama = OLLAMA_MODELS.find((m) => m.id === ollamaModel) || OLLAMA_MODELS[0];

  // Filter stations based on user typing
  const filteredStations = useMemo(() => {
    if (!locSearchQuery.trim()) return TAMIL_NADU_60_STATIONS.slice(0, 10);
    const q = locSearchQuery.toLowerCase();
    return TAMIL_NADU_60_STATIONS.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.location_name.toLowerCase().includes(q) ||
        s.region.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [locSearchQuery]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (locDropdownRef.current && !locDropdownRef.current.contains(e.target as Node)) {
        setIsLocDropdownOpen(false);
      }
      if (modelDropdownRef.current && !modelDropdownRef.current.contains(e.target as Node)) {
        setModelDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectLocation = (st: ExtendedStation, fromPrompt = false) => {
    setSelectedStationId(st.id);
    setIsLocDropdownOpen(false);
    setLocSearchQuery("");

    if (!fromPrompt) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `📍 **Location Context Switched to: ${st.name}**\n• **Locality**: ${st.location_name}, ${st.city}\n• **Current AQI**: **${st.aqi} (${st.category})** · Dominant: ${st.dominant_pollutant}\n• **Coordinates**: [${st.coordinates.lat.toFixed(4)}°N, ${st.coordinates.lng.toFixed(4)}°E] (${st.distance_km} km from Crescent epicenter)\n\nYou can now ask specific questions about this station or mention any other area.`,
          timestamp: formatTimestamp(),
        },
      ]);
    }
  };

  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const locSearchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isLocDropdownOpen) {
      setTimeout(() => locSearchInputRef.current?.focus(), 50);
    }
  }, [isLocDropdownOpen]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, isSearchingWeb]);

  const handleSubmit = async (query?: string) => {
    const text = (query ?? input).trim();
    if (!text || isTyping) return;

    // Natural Language Location Recognition: Check if user mentioned an area in the prompt!
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
      setSearchStepText("Querying Google web index via Tavily Search API...");
      await new Promise((r) => setTimeout(r, 700));
      setSearchStepText("Scraping live TNPCB government advisories and regional news updates...");
      await new Promise((r) => setTimeout(r, 800));
      setSearchStepText(`Cross-referencing live web findings with ${targetStation.name} telemetry...`);
      await new Promise((r) => setTimeout(r, 600));
    } else {
      await new Promise((resolve) => setTimeout(resolve, provider === "ollama" ? 1600 : 1100));
    }

    const { content, isWebSearch, searchSources } = getMockResponse(
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

  const activeModelLabel =
    provider === "groq"
      ? GROQ_MODELS.find((m) => m.id === groqModel)?.label ?? groqModel
      : OLLAMA_MODELS.find((m) => m.id === ollamaModel)?.label ?? ollamaModel;

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-xs text-slate-900 dark:text-white transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Bot className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span
                className={
                  "text-[10px] font-mono font-bold uppercase tracking-wider " +
                  (provider === "groq"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-violet-600 dark:text-violet-400")
                }
              >
                {provider === "groq" ? "Groq Cloud" : "Ollama Local"} · {activeModelLabel} · Tavily Search Active
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">AURA · Operations Intelligence & Diagnostic Console</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Admin & Analyst telemetry RAG, hardware diagnostics, sensor drift analysis, model switching, and real-time search.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <Link
              href="/chat"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-100 transition"
            >
              <span>View Citizen AI</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            {/* Compact Active Node Indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-xs shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-slate-700 dark:text-slate-200">{selectedStation.name}</span>
              <span className="px-1.5 py-0.2 rounded font-mono font-bold text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                AQI {selectedStation.aqi}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xl overflow-hidden flex flex-col transition-colors">
        {/* Chat History Viewport */}
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
                  {/* Tavily Web Search Sources Card */}
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
                    {msg.timestamp} IST {msg.isWebSearch && "· Tavily Search"}
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

          {/* Web Search Progress Indicator */}
          {isSearchingWeb && (
            <div className="flex items-start gap-3 max-w-[90%]">
              <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-sky-100 dark:bg-sky-950/80 border border-sky-300 dark:border-sky-700/50 flex items-center justify-center">
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

          {/* Typing indicator */}
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

        {/* ── UNIFIED COMPACT INPUT CONSOLE WITH PROMINENT HIGHLIGHT ────────── */}
        <div className="border-t border-slate-200/90 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/90 p-3 sm:p-4 space-y-2">
          {/* Quick Suggestions Chips (Slim Horizontal Scroll) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
            {QUICK_PROMPTS.map((prompt) => (
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

          {/* 🌟 HERO HIGHLIGHTED CHAT CONSOLE 🌟 */}
          <div className="relative rounded-2xl border-2 border-emerald-500 dark:border-emerald-400 bg-white dark:bg-slate-900 shadow-xl shadow-emerald-500/15 ring-4 ring-emerald-500/15 focus-within:ring-4 focus-within:ring-emerald-500/25 focus-within:border-emerald-500 transition-all p-2.5 sm:p-3 space-y-2">
            {/* Top: Primary Prompt Input with Active Pulsing Indicator */}
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isTyping}
                placeholder="Ask AURA, or type any area (e.g. 'How is Kilambakkam?')..."
                className="w-full bg-transparent text-slate-900 dark:text-white text-sm font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
              />
            </div>

            {/* Bottom: Integrated Tools Bar (Location search popover + Model selector + Send) */}
            <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-1.5 flex-wrap">
                {/* 1. Location Selector Pill */}
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
                    <span className="max-w-[120px] sm:max-w-[160px] truncate">{selectedStation.name}</span>
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

                  {/* Popover: Type-to-Filter 60 Stations */}
                  {isLocDropdownOpen && (
                    <div className="absolute bottom-full mb-2 left-0 w-80 sm:w-96 max-h-72 flex flex-col rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xl z-50 p-2 space-y-2 animate-in fade-in zoom-in-95">
                      <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-700/60 text-[11px]">
                        <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                          Select Monitoring Node
                        </span>
                        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">60 Stations</span>
                      </div>

                      {/* Popover search input */}
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          ref={locSearchInputRef}
                          type="text"
                          value={locSearchQuery}
                          onChange={(e) => setLocSearchQuery(e.target.value)}
                          placeholder="Type to filter stations (e.g. Kilambakkam, Guindy, Madurai)..."
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

                      {/* Results List */}
                      <div className="overflow-y-auto max-h-48 space-y-1 pr-1">
                        {filteredStations.length === 0 ? (
                          <div className="p-3 text-center text-xs text-slate-400">
                            No stations found matching &quot;{locSearchQuery}&quot;
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

                {/* 2. Model Selector Dropdown Pill */}
                <div ref={modelDropdownRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300 hover:border-emerald-500 transition cursor-pointer"
                  >
                    <span className={provider === "groq" ? "text-emerald-600 dark:text-emerald-400" : "text-violet-600 dark:text-violet-400"}>
                      {provider === "groq" ? "Groq" : "Ollama"}: {provider === "groq" ? selectedGroq.label.split(" ")[0] : selectedOllama.label.split(" ")[0]}
                    </span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {modelDropdownOpen && (
                    <div className="absolute bottom-full mb-2 left-0 w-64 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xl z-50 p-2 space-y-1.5 animate-in fade-in zoom-in-95">
                      <div className="flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs">
                        <button
                          type="button"
                          onClick={() => setProvider("groq")}
                          className={`flex-1 py-1 rounded-md text-[10px] font-bold text-center transition cursor-pointer ${
                            provider === "groq"
                              ? "bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          Groq Cloud
                        </button>
                        <button
                          type="button"
                          onClick={() => setProvider("ollama")}
                          className={`flex-1 py-1 rounded-md text-[10px] font-bold text-center transition cursor-pointer ${
                            provider === "ollama"
                              ? "bg-white dark:bg-slate-700 text-violet-700 dark:text-violet-300 shadow-xs"
                              : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          Ollama Local
                        </button>
                      </div>

                      <div className="space-y-0.5 pt-1">
                        {(provider === "groq" ? GROQ_MODELS : OLLAMA_MODELS).map((m) => {
                          const active = (provider === "groq" ? groqModel : ollamaModel) === m.id;
                          return (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => {
                                if (provider === "groq") setGroqModel(m.id);
                                else setOllamaModel(m.id);
                                setModelDropdownOpen(false);
                              }}
                              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-left transition cursor-pointer ${
                                active
                                  ? "bg-emerald-50 dark:bg-emerald-950/60 font-bold text-emerald-800 dark:text-emerald-200"
                                  : "hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-300"
                              }`}
                            >
                              <span>{m.label}</span>
                              {active && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Tavily Live Badge */}
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/50 border border-sky-200/80 dark:border-sky-800 text-[10px] font-mono text-sky-700 dark:text-sky-300">
                  <Globe className="w-3 h-3 text-sky-500" />
                  <span>Tavily Live</span>
                </span>
              </div>

              {/* Glowing High-Contrast Send Button */}
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
              Type any area name to switch station context automatically
            </span>
            <span className="hidden sm:inline font-mono">Press Enter ↵</span>
          </div>
        </div>
      </div>
    </div>
  );
}
