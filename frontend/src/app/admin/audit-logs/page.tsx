"use client";

import React, { useState } from "react";
import { Terminal, Download, Filter, Search, ShieldAlert, CheckCircle2 } from "lucide-react";

interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  actorType: "USER" | "SYSTEM" | "API";
  action: "READ" | "WRITE" | "DELETE" | "AUTH";
  resource: string;
  ip: string;
  statusCode: number;
  details: string;
}

const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: "log_001",
    timestamp: "2026-11-04 22:04:12",
    actor: "admin@crescent.ac.in",
    actorType: "USER",
    action: "AUTH",
    resource: "/api/v1/auth/login",
    ip: "103.21.124.8",
    statusCode: 200,
    details: "Firebase JWT session exchange successful (Role: org_admin)",
  },
  {
    id: "log_002",
    timestamp: "2026-11-04 22:02:45",
    actor: "esp32-hw-crescent-01",
    actorType: "API",
    action: "WRITE",
    resource: "/api/v1/readings/ingest",
    ip: "14.139.183.194",
    statusCode: 201,
    details: "Ingested packet: PM2.5=34.2, NO2=28.4, AQI=72 (Normal Air Quality)",
  },
  {
    id: "log_003",
    timestamp: "2026-11-04 21:58:10",
    actor: "ops@streetair.in",
    actorType: "USER",
    action: "WRITE",
    resource: "/api/v1/admin/scenarios/trigger",
    ip: "49.207.211.5",
    statusCode: 200,
    details: "Activated ESP32 Demo Scenario #4: Industrial Emissions",
  },
  {
    id: "log_004",
    timestamp: "2026-11-04 21:50:33",
    actor: "system-scheduler",
    actorType: "SYSTEM",
    action: "READ",
    resource: "/api/v1/analytics/hotspots/recalculate",
    ip: "127.0.0.1",
    statusCode: 200,
    details: "DBSCAN spatial clustering cycle executed. 3 active clusters computed.",
  },
  {
    id: "log_005",
    timestamp: "2026-11-04 21:42:19",
    actor: "citizen.vandalur@gmail.com",
    actorType: "USER",
    action: "WRITE",
    resource: "/api/v1/reports",
    ip: "157.48.92.112",
    statusCode: 201,
    details: "Created community report #rep_301: Heavy dust from flyover construction",
  },
  {
    id: "log_006",
    timestamp: "2026-11-04 21:38:00",
    actor: "unknown-client",
    actorType: "API",
    action: "AUTH",
    resource: "/api/v1/admin/users",
    ip: "185.220.101.5",
    statusCode: 403,
    details: "Forbidden: Unauthorized access attempt to platform admin route",
  },
  {
    id: "log_007",
    timestamp: "2026-11-04 21:30:15",
    actor: "vengat.kr@chennaimetro.gov.in",
    actorType: "USER",
    action: "READ",
    resource: "/api/v1/cpcb/reports/generate",
    ip: "115.114.88.22",
    statusCode: 200,
    details: "Generated CPCB Form V monthly air quality audit PDF",
  },
  {
    id: "log_008",
    timestamp: "2026-11-04 21:15:22",
    actor: "groq-llm-proxy",
    actorType: "SYSTEM",
    action: "READ",
    resource: "/api/v1/ai/chat",
    ip: "127.0.0.1",
    statusCode: 200,
    details: "Processed RAG context inference: query='What is Crescent AQI now?'",
  },
  {
    id: "log_009",
    timestamp: "2026-11-04 21:02:40",
    actor: "esp32-hw-kilambakkam-02",
    actorType: "API",
    action: "WRITE",
    resource: "/api/v1/readings/ingest",
    ip: "14.139.183.194",
    statusCode: 201,
    details: "Ingested packet: PM10=182, AQI=152 (Moderate Exceedance)",
  },
  {
    id: "log_010",
    timestamp: "2026-11-04 20:45:11",
    actor: "priya.r@tnpcb.gov.in",
    actorType: "USER",
    action: "WRITE",
    resource: "/api/v1/incidents/inc_01/status",
    ip: "115.240.12.98",
    statusCode: 200,
    details: "Updated incident status from detected to investigating",
  },
  {
    id: "log_011",
    timestamp: "2026-11-04 20:30:00",
    actor: "system-retention",
    actorType: "SYSTEM",
    action: "DELETE",
    resource: "/api/v1/telemetry/archive",
    ip: "127.0.0.1",
    statusCode: 200,
    details: "Purged 32,000 raw 1-second ticks older than 90-day retention SLA",
  },
  {
    id: "log_012",
    timestamp: "2026-11-04 20:12:04",
    actor: "student.env@crescent.ac.in",
    actorType: "USER",
    action: "READ",
    resource: "/api/v1/stations/crescent-vandalur-01",
    ip: "103.21.124.15",
    statusCode: 200,
    details: "Fetched station telemetry timeline for research study",
  },
];

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>(MOCK_AUDIT_LOGS);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [exported, setExported] = useState(false);

  const handleExport = () => {
    setExported(true);
    setTimeout(() => setExported(false), 3000);
  };

  const filtered = logs.filter((l) => {
    const matchSearch =
      l.actor.toLowerCase().includes(search.toLowerCase()) ||
      l.resource.toLowerCase().includes(search.toLowerCase()) ||
      l.details.toLowerCase().includes(search.toLowerCase());
    const matchAction = actionFilter === "all" || l.action === actionFilter;
    return matchSearch && matchAction;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 text-white">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Immutable Security, Ingress & Audit Trail
            </span>
          </div>
          <h1 className="text-2xl font-black">Security Audit Logs & Access Trail</h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete cryptographic audit trail of user access, scenario injections, telemetry writes, and API authentication events.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition"
        >
          <Download className="w-3.5 h-3.5" />
          {exported ? "Export Queued..." : "Export Audit Trail (CSV)"}
        </button>
      </div>

      {/* Notice Banner */}
      <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-800 text-xs text-blue-300">
        ℹ️ <strong>Compliance Integrity:</strong> All audit logs are signed with SHA-256 digests and streamed to an append-only write store for ISO 27001 & CPCB data validation.
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 ml-1" />
          <input
            type="text"
            placeholder="Search by actor, IP address, resource URI, or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none w-full font-mono"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none font-mono"
          >
            <option value="all">All Actions</option>
            <option value="AUTH">AUTH</option>
            <option value="WRITE">WRITE</option>
            <option value="READ">READ</option>
            <option value="DELETE">DELETE</option>
          </select>
        </div>
      </div>

      {/* Terminal View Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950 font-mono text-xs overflow-hidden shadow-2xl">
        <div className="bg-slate-900/80 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-slate-400">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="text-[11px] font-bold text-slate-200 uppercase tracking-wider">
              Audit Stream /var/log/streetair/audit.log
            </span>
          </div>
          <span className="text-[10px] text-slate-500">{filtered.length} entries</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-900/40 border-b border-slate-800/80 text-slate-500 text-[10px] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-4">Timestamp</th>
                <th className="py-2.5 px-4">Actor</th>
                <th className="py-2.5 px-4">Action</th>
                <th className="py-2.5 px-4">Resource</th>
                <th className="py-2.5 px-4">IP Address</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {filtered.map((log) => {
                const is2xx = log.statusCode >= 200 && log.statusCode < 300;
                const is4xx = log.statusCode >= 400 && log.statusCode < 500;

                return (
                  <tr key={log.id} className="hover:bg-slate-900/40 transition">
                    <td className="py-2.5 px-4 text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                    <td className="py-2.5 px-4 text-slate-200 font-semibold">{log.actor}</td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          log.action === "AUTH"
                            ? "bg-purple-950 text-purple-300"
                            : log.action === "WRITE"
                            ? "bg-blue-950 text-blue-300"
                            : log.action === "DELETE"
                            ? "bg-rose-950 text-rose-300"
                            : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-emerald-400">{log.resource}</td>
                    <td className="py-2.5 px-4 text-slate-400">{log.ip}</td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`font-bold ${
                          is2xx ? "text-emerald-400" : is4xx ? "text-amber-400" : "text-rose-400"
                        }`}
                      >
                        {log.statusCode}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-300 max-w-xs truncate" title={log.details}>
                      {log.details}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

