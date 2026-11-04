import React from "react";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import {
  Cpu,
  Radio,
  Server,
  BrainCircuit,
  Lock,
  Layers,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

export default function PlatformPage() {
  const stack = [
    {
      icon: <Cpu className="w-6 h-6 text-brand-600" />,
      title: "1. Edge Sensor Hardware Layer",
      desc: "Microcontroller edge beacons (ESP32) interfaced with multi-parameter sensor arrays (PMS5003 laser particulate, MQ-135 electrochemical gas, BME280 meteorological sensor). On-device hardware watchdog and Kalman filtering.",
    },
    {
      icon: <Radio className="w-6 h-6 text-purple-600" />,
      title: "2. Real-Time Ingestion & WebSocket Stream",
      desc: "FastAPI asynchronous ingestion gateway handling sub-second packet ingest over WebSockets and secure HTTPS REST endpoints with Firebase Auth Bearer token verification.",
    },
    {
      icon: <BrainCircuit className="w-6 h-6 text-indigo-600" />,
      title: "3. Neural Intelligence & Apportionment",
      desc: "Prophet and LSTM time-series forecast models, spatial covariance anomaly detection, and LLM environmental agents powered by Groq and local Ollama inference with RAG retrieval.",
    },
    {
      icon: <Server className="w-6 h-6 text-blue-600" />,
      title: "4. Multi-Tenant Enterprise SaaS Core",
      desc: "Strict tenant isolation, role-based access control (RBAC), automated CPCB compliance report generation, usage telemetry metering, and webhook alerting.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
      <PublicHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            Technical Architecture
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            How STREETAIR Powers Environmental Intelligence
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
            From low-cost physical sensor hardware to cloud-scale spatial neural models and municipal command centres.
          </p>
        </div>

        {/* Stack Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {stack.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-5">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="rounded-2xl border border-brand-200 dark:border-brand-900/60 bg-gradient-to-r from-brand-50 to-emerald-50 dark:from-brand-950/30 dark:to-emerald-950/30 p-8 text-center space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Ready to deploy continuous environmental intelligence?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Book an engineering pilot demonstration for your university campus, municipality, or industrial facility.
          </p>
          <div className="flex justify-center gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition"
            >
              <span>Book Pilot Demonstration</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

