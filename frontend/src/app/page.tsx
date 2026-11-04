"use client";

import React from "react";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { useLiveWebSocket } from "@/hooks/useLiveWebSocket";
import { AQIBadge } from "@/components/ui/AQIBadge";
import { DataSourceBadge } from "@/components/ui/DataSourceBadge";
import { LiveWebSocketIndicator } from "@/components/ui/LiveWebSocketIndicator";
import { ScenarioSelector } from "@/components/ui/ScenarioSelector";
import {
  Wind,
  ShieldCheck,
  SearchCode,
  Clock,
  SlidersHorizontal,
  FilePlus,
  ArrowRight,
  MapPin,
  Building2,
  Cpu,
  Sparkles,
  BarChart3,
  Bot,
  Activity,
} from "lucide-react";
import { getAQIClassification } from "@/lib/aqi";
import { SCENARIO_DEFINITIONS } from "@/lib/scenarios";

export default function HomePage() {
  const { reading, connectionStatus, lastUpdateTime, triggerScenario } = useLiveWebSocket();

  const currentAqi = reading?.aqi || 34;
  const classification = getAQIClassification(currentAqi);
  const activeScenarioDef = SCENARIO_DEFINITIONS[reading?.scenario || "scenario_1_normal"];

  const workflows = [
    { step: "01", name: "MONITOR", desc: "Continuous sensor mesh ingestion from ESP32 stations & reference monitors." },
    { step: "02", name: "DETECT", desc: "Automated anomaly identification isolating sudden particulate & gas spikes." },
    { step: "03", name: "INVESTIGATE", desc: "Pollution Detective co-variant analysis against weather & transit vectors." },
    { step: "04", name: "ANALYSE", desc: "Spatial-temporal clustering, wind-vector tracking, and historical baselines." },
    { step: "05", name: "PREDICT", desc: "72-hour neural forecasting with Prophet/LSTM uncertainty bounds." },
    { step: "06", name: "RESPOND", desc: "Automated citizen advisories, municipal alerts, and CPCB regulatory compliance." },
  ];

  const features = [
    {
      icon: <SearchCode className="w-6 h-6 text-brand-600" />,
      title: "Pollution Detective",
      desc: "Isolates source hypotheses (highway exhaust, industrial stack, biomass burn) using co-pollutant covariance and local wind plumes.",
      link: "/intelligence/pollution-detective",
    },
    {
      icon: <Clock className="w-6 h-6 text-indigo-600" />,
      title: "Pollution Time Machine",
      desc: "Replay past environmental episodes, compare seasonal diurnal curves, and assess historical policy impact over months.",
      link: "/intelligence/time-machine",
    },
    {
      icon: <SlidersHorizontal className="w-6 h-6 text-purple-600" />,
      title: "What-If City Simulator",
      desc: "Simulate urban interventions: predict regional AQI delta when heavy truck traffic is diverted or green canopy expands by 20%.",
      link: "/intelligence/what-if",
    },
    {
      icon: <Bot className="w-6 h-6 text-emerald-600" />,
      title: "Environmental AI Assistant",
      desc: "Natural language environmental intelligence powered by Groq & Ollama models with verified RAG citations and web evidence.",
      link: "/intelligence/chat",
    },
    {
      icon: <FilePlus className="w-6 h-6 text-amber-600" />,
      title: "Citizen Pollution Reporting",
      desc: "Geo-tagged community reports with photo uploads and verification queues for municipal enforcement cells.",
      link: "/app/reports/new",
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-blue-600" />,
      title: "Automated Compliance & ESG",
      desc: "Export ready-to-file CPCB National Ambient Air Quality standard audits, exceedance logs, and ESG sustainability reports.",
      link: "/organisation/reports",
    },
  ];

  const sectors = [
    {
      title: "Educational Campuses",
      desc: "Protect student health, trigger automated ventilation, and integrate environmental STEM research.",
      site: "B.S. Abdur Rahman Crescent Institute (Active Pilot)",
    },
    {
      title: "Smart Cities & Municipalities",
      desc: "Urban air quality monitoring, traffic routing optimization, and automated waste burning detection.",
      site: "Chennai-Chengalpattu Metropolitan Belt",
    },
    {
      title: "Industrial & Manufacturing",
      desc: "Continuous perimeter monitoring, stack emission exceedance logging, and automated factory compliance.",
      site: "SIPCOT / Maraimalai Nagar Industrial Hub",
    },
    {
      title: "Infrastructure & Real Estate",
      desc: "Construction dust (PM10) perimeter surveillance and environmental impact mitigation audits.",
      site: "Kilambakkam & GST Corridor Projects",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      <PublicHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-20 border-b border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-b from-white via-slate-50/50 to-emerald-50/20 dark:from-slate-950 dark:via-slate-900/50 dark:to-emerald-950/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Heading and Value Prop */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-200 dark:border-brand-900/60 bg-brand-50/80 dark:bg-brand-950/40 text-brand-800 dark:text-brand-300 text-xs font-semibold shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-brand-600 animate-pulse" />
                  <span>B2B2G Environmental Intelligence SaaS Platform</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-slate-950 dark:text-white">
                  Real-Time Air Quality,{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-emerald-500">
                    Predictive AI
                  </span>{" "}
                  & Urban Intelligence.
                </h1>

                <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                  STREETAIR transforms raw environmental sensor telemetry into actionable intelligence.
                  From real-time ESP32 edge beacons to neural source apportionment and municipal policy
                  simulations.
                </p>

                {/* Primary CTA Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-lg shadow-brand-600/25 transition"
                  >
                    <span>Launch Live Public Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    href="/map"
                    className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-sm text-slate-800 dark:text-slate-200 transition shadow-sm"
                  >
                    <span>Explore Spatial Map & Heatmap</span>
                  </Link>

                  <Link
                    href="/pricing"
                    className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl text-xs font-bold text-brand-700 dark:text-brand-300 hover:underline"
                  >
                    <span>View SaaS Pricing Plans</span>
                  </Link>
                </div>

                {/* Demonstration Pilot Attribution */}
                <div className="pt-4 flex items-center gap-3 text-xs text-slate-500 border-t border-slate-200/80 dark:border-slate-800/80">
                  <MapPin className="w-4 h-4 text-brand-600 flex-shrink-0" />
                  <span>
                    Primary Live Demonstration Deployment:{" "}
                    <strong className="text-slate-800 dark:text-slate-200">
                      B.S. Abdur Rahman Crescent Institute of Science and Technology
                    </strong>
                    , Vandalur, Tamil Nadu.
                  </span>
                </div>
              </div>

              {/* Right Column: Live Beacon Hero Card */}
              <div className="lg:col-span-5">
                <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-2xl p-6 relative">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <DataSourceBadge
                          source={reading?.source || "SIMULATED"}
                          dataStatus={reading?.data_status || "LIVE"}
                          size="sm"
                        />
                      </div>
                      <h2 className="text-lg font-extrabold text-slate-900 dark:text-white leading-tight">
                        Crescent Institute Campus Beacon
                      </h2>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        Vandalur, GST Road, Chennai South
                      </p>
                    </div>

                    <LiveWebSocketIndicator
                      status={connectionStatus}
                      lastUpdated={lastUpdateTime}
                      showTime={false}
                    />
                  </div>

                  {/* Big AQI Metric Badge */}
                  <div className="my-5 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Current Air Quality
                      </span>
                      <div className="mt-1.5">
                        <AQIBadge aqi={currentAqi} size="xl" />
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 font-mono">Dominant Parameter</span>
                      <div className="text-base font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                        {activeScenarioDef.dominantPollutant}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        NAQI Standard (CPCB)
                      </span>
                    </div>
                  </div>

                  {/* Pollutant Key Metrics Grid */}
                  <div className="grid grid-cols-3 gap-2 mb-5">
                    <div className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-center">
                      <span className="text-[10px] font-bold text-slate-400 font-mono">PM2.5</span>
                      <div className="text-sm font-extrabold text-slate-900 dark:text-white font-mono mt-0.5">
                        {reading?.pollutants.pm25.value ?? 11.2}{" "}
                        <span className="text-[9px] font-normal text-slate-400">µg/m³</span>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-center">
                      <span className="text-[10px] font-bold text-slate-400 font-mono">PM10</span>
                      <div className="text-sm font-extrabold text-slate-900 dark:text-white font-mono mt-0.5">
                        {reading?.pollutants.pm10.value ?? 24.5}{" "}
                        <span className="text-[9px] font-normal text-slate-400">µg/m³</span>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-center">
                      <span className="text-[10px] font-bold text-slate-400 font-mono">NO2</span>
                      <div className="text-sm font-extrabold text-slate-900 dark:text-white font-mono mt-0.5">
                        {reading?.pollutants.no2.value ?? 12.0}{" "}
                        <span className="text-[9px] font-normal text-slate-400">ppb</span>
                      </div>
                    </div>
                  </div>

                  {/* Advisory Text */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                    {classification.advisory}
                  </p>

                  <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500 font-mono text-[11px]">
                      Scenario #{activeScenarioDef.number}: <strong>{activeScenarioDef.name}</strong>
                    </span>
                    <Link
                      href="/dashboard"
                      className="font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400 flex items-center gap-1"
                    >
                      <span>Full Telemetry</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 9-Scenario Interactive Keypad Matrix Section */}
        <section className="py-12 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-8">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Hardware-Integrated Simulation Protocol
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                9 Environmental Scenarios Simulator
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                The initial Vandalur monitoring beacon includes an ESP32 keypad simulation matrix.
                Test any scenario below to immediately trigger realistic environmental telemetry and
                evaluate how the entire platform responds.
              </p>
            </div>

            <ScenarioSelector
              activeScenario={reading?.scenario || "scenario_1_normal"}
              onSelectScenario={triggerScenario}
              className="max-w-5xl mx-auto"
            />
          </div>
        </section>

        {/* Core Product Workflow */}
        <section className="py-16 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                End-to-End Environmental Workflow
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                MONITOR → DETECT → INVESTIGATE → ANALYSE → PREDICT → RESPOND
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
              {workflows.map((wf) => (
                <div
                  key={wf.step}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm hover:border-brand-500 transition flex flex-col"
                >
                  <span className="text-xs font-mono font-extrabold text-brand-600 dark:text-brand-400">
                    STEP {wf.step}
                  </span>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mt-1 mb-2">
                    {wf.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-auto">
                    {wf.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Modules Grid */}
        <section className="py-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                Modular SaaS Architecture
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                Advanced Environmental Intelligence Suite
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feat) => (
                <Link
                  key={feat.title}
                  href={feat.link}
                  className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-6 hover:bg-white dark:hover:bg-slate-800 hover:border-brand-500 dark:hover:border-brand-500 transition shadow-sm hover:shadow-md flex flex-col"
                >
                  <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center mb-4 group-hover:scale-105 transition shadow-sm">
                    {feat.icon}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-2 mb-4 flex-1">
                    {feat.desc}
                  </p>
                  <span className="text-xs font-bold text-brand-600 dark:text-brand-400 inline-flex items-center gap-1 group-hover:translate-x-1 transition">
                    <span>Explore Module</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Commercial B2B2G Sectors */}
        <section className="py-16 bg-slate-50 dark:bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                Commercial SaaS Direction
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                Serving Industries, Campuses & Smart Cities
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {sectors.map((sec) => (
                <div
                  key={sec.title}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col shadow-sm"
                >
                  <Building2 className="w-6 h-6 text-indigo-600 mb-3" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
                    {sec.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4 flex-1">
                    {sec.desc}
                  </p>
                  <div className="text-[10px] font-mono text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
                    Target: {sec.site}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}

