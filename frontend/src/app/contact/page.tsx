"use client";

import React, { useState } from "react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import {
  Mail,
  MapPin,
  Calendar,
  Clock,
  Send,
  CheckCircle2,
  Building2,
  GraduationCap,
  Factory,
  Sparkles,
} from "lucide-react";

export default function ContactPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [organisation, setOrganisation] = useState("");
  const [role, setRole] = useState("Educational Institution");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [demoRequested, setDemoRequested] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <PublicHeader />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
            Enterprise Inquiries & Live Demonstrations
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Schedule a Demonstration or Speak with Our Solutions Team
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Learn how STREETAIR helps campus operations, municipal planners, and industrial environmental officers automate CPCB compliance and air intelligence.
          </p>
        </div>

        {/* Form and Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Contact Form */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Demonstration Request Received!
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                  Thank you, <strong>{fullName}</strong>. An environmental solutions engineer will review your request for <strong>{organisation}</strong> and coordinate a live session within 24 business hours.
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setMessage("");
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold hover:bg-slate-200 transition"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  Request a 30-Minute Live Demo
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Full Name *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Dr. A. K. Sundaram"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Work Email *
                    </label>
                    <input
                      required
                      type="email"
                      placeholder="e.g. sundaram@crescent.ac.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Organisation / Campus Name *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Crescent Institute"
                      value={organisation}
                      onChange={(e) => setOrganisation(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Sector / Role *
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Educational Institution">Educational Campus / University</option>
                      <option value="Municipal Authority">Smart City / Municipal Authority</option>
                      <option value="Industrial Compliance">Industrial Manufacturing Facility</option>
                      <option value="Environmental Consultant">Environmental Consultant / Auditor</option>
                      <option value="Other">Other Community Organization</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98400 12345"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Project Scope / Monitoring Requirements
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Tell us about your monitoring station requirements, target pollutants, or compliance timelines..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="demoCheck"
                    checked={demoRequested}
                    onChange={(e) => setDemoRequested(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 rounded"
                  />
                  <label
                    htmlFor="demoCheck"
                    className="text-xs text-slate-600 dark:text-slate-400 select-none cursor-pointer"
                  >
                    Include a live 9-scenario hardware demo of the Crescent Vandalur ESP32 sensor station
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs tracking-wide shadow-md transition"
                >
                  <Send className="w-4 h-4" />
                  Submit Demonstration Request
                </button>
              </form>
            )}
          </div>

          {/* Right: Info Cards */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Live Demonstration Hub
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-200 block">
                      Crescent Institute Campus
                    </span>
                    <p className="text-slate-500 dark:text-slate-400">
                      B.S. Abdur Rahman Crescent Institute of Science and Technology, GST Road, Vandalur, Chennai – 600048, Tamil Nadu, India.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-200 block">
                      Direct Email
                    </span>
                    <p className="font-mono text-slate-500 dark:text-slate-400">
                      solutions@streetair.in / hello@streetair.in
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-200 block">
                      SLA Response Time
                    </span>
                    <p className="text-slate-500 dark:text-slate-400">
                      Within 24 business hours. Critical industrial exceedance hotlines available 24/7.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Target Sectors */}
            <div className="grid grid-cols-1 gap-3">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                <GraduationCap className="w-5 h-5 text-emerald-500 shrink-0" />
                <div className="text-xs">
                  <strong className="text-slate-900 dark:text-white block">
                    Colleges & Universities
                  </strong>
                  <span className="text-slate-500 dark:text-slate-400">
                    Live campus beacons, student research telemetry streams, and environmental awareness.
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                <Factory className="w-5 h-5 text-amber-500 shrink-0" />
                <div className="text-xs">
                  <strong className="text-slate-900 dark:text-white block">
                    Industrial Facilities & Civil Works
                  </strong>
                  <span className="text-slate-500 dark:text-slate-400">
                    Automated CPCB compliance reporting, continuous boundary monitoring, and fugitive dust mitigation.
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                <Building2 className="w-5 h-5 text-blue-500 shrink-0" />
                <div className="text-xs">
                  <strong className="text-slate-900 dark:text-white block">
                    Smart Cities & Municipal Authorities
                  </strong>
                  <span className="text-slate-500 dark:text-slate-400">
                    Spatial DBSCAN hotspot alerts, transit corridors, and crowd-sourced citizen reports.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

