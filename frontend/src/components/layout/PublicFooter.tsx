import React from "react";
import Link from "next/link";
import { Wind, Shield, Github, Heart } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 mt-auto text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-8">
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                <Wind className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                STREET<span className="text-brand-600 dark:text-brand-400">AIR</span>
              </span>
            </Link>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
              AI-Powered Environmental Intelligence SaaS. Empowering institutions, industries,
              and smart cities with continuous sensor ingestion, anomaly detection, predictive
              forecasting, and citizen reporting.
            </p>
            <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-[11px] space-y-1">
              <span className="font-bold text-slate-700 dark:text-slate-300 block">
                Primary Demonstration Site
              </span>
              <p className="text-slate-500">
                B.S. Abdur Rahman Crescent Institute of Science and Technology, Vandalur, Chennai,
                Tamil Nadu 600048, India.
              </p>
            </div>
          </div>

          {/* Environmental Experience */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              Live Experience
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/dashboard" className="hover:text-brand-600 transition">
                  Public Dashboard
                </Link>
              </li>
              <li>
                <Link href="/map" className="hover:text-brand-600 transition">
                  Interactive AQI Map
                </Link>
              </li>
              <li>
                <Link href="/stations" className="hover:text-brand-600 transition">
                  Monitoring Stations Grid
                </Link>
              </li>
              <li>
                <Link href="/nearby-air" className="hover:text-brand-600 transition">
                  Nearby Air Intelligence
                </Link>
              </li>
              <li>
                <Link href="/clean-air-navigation" className="hover:text-brand-600 transition">
                  Clean-Air Navigation
                </Link>
              </li>
            </ul>
          </div>

          {/* AI & Intelligence */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              AI Intelligence
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/intelligence/pollution-detective" className="hover:text-brand-600 transition">
                  Pollution Detective
                </Link>
              </li>
              <li>
                <Link href="/intelligence/time-machine" className="hover:text-brand-600 transition">
                  Pollution Time Machine
                </Link>
              </li>
              <li>
                <Link href="/intelligence/what-if" className="hover:text-brand-600 transition">
                  What-If City Simulator
                </Link>
              </li>
              <li>
                <Link href="/intelligence/chat" className="hover:text-brand-600 transition">
                  Environmental AI Chat
                </Link>
              </li>
              <li>
                <Link href="/intelligence/knowledge" className="hover:text-brand-600 transition">
                  RAG Knowledge Explorer
                </Link>
              </li>
            </ul>
          </div>

          {/* SaaS & Commercial */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              Enterprise & Platform
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/platform" className="hover:text-brand-600 transition">
                  Platform Architecture
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-brand-600 transition">
                  Pricing & Subscriptions
                </Link>
              </li>
              <li>
                <Link href="/organisation/overview" className="hover:text-brand-600 transition">
                  Organisation Portal
                </Link>
              </li>
              <li>
                <Link href="/admin/command-centre" className="hover:text-brand-600 transition">
                  Admin Command Centre
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-brand-600 transition">
                  Data Privacy & Ethics
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal & Data Integrity Transparency Banner */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <p className="text-slate-400">
            &copy; {new Date().getFullYear()} STREETAIR Systems. Engineered for B2B2G Environmental
            Intelligence.
          </p>
          <div className="flex items-center gap-4 text-slate-500">
            <span>Data Transparency: SIMULATED telemetry reflects ESP32 demonstration scenarios.</span>
            <Link href="/terms" className="hover:underline">
              Terms
            </Link>
            <Link href="/privacy" className="hover:underline">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

