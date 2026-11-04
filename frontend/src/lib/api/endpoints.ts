import { apiClient } from "./client";
import {
  AirReading,
  AnalyticsOverview,
  AnalyticsTrend,
  AuthUser,
  CommunityReport,
  CreateReportInput,
  EnvironmentalAlert,
  EnvironmentalIncident,
  HotspotCluster,
  MonitoringStation,
  OrgSubscription,
  PredictionForecast,
  ReadingHistoryPoint,
  ScenarioKey,
  SubscriptionPlan,
  UsageTelemetry,
  WhatIfScenarioResult,
  AiChatRequest,
  AiChatResponse,
} from "./types";
import {
  MOCK_ALERTS,
  MOCK_CURRENT_USER,
  MOCK_HOTSPOTS,
  MOCK_INCIDENTS,
  MOCK_ORG_SUBSCRIPTION,
  MOCK_PLANS,
  MOCK_REPORTS,
  MOCK_STATIONS,
  MOCK_USAGE_TELEMETRY,
  getActiveMockScenario,
  getMockAiChatReply,
  getMockLatestReading,
  getMockPredictions,
  getMockReadingHistory,
  setActiveMockScenario,
} from "./mockAdapter";

// ----------------------------------------------------------------------
// Auth & Current User
// ----------------------------------------------------------------------
export async function getCurrentUser(): Promise<AuthUser> {
  return apiClient<AuthUser>("/api/v1/auth/me", {}, () => MOCK_CURRENT_USER);
}

// ----------------------------------------------------------------------
// Devices / Monitoring Stations
// ----------------------------------------------------------------------
export async function getStations(params?: { status?: string; org_id?: string }): Promise<MonitoringStation[]> {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.org_id) query.set("org_id", params.org_id);
  const qStr = query.toString() ? `?${query.toString()}` : "";

  return apiClient<MonitoringStation[]>(`/api/v1/devices${qStr}`, {}, () => {
    let list = [...MOCK_STATIONS];
    if (params?.status && params.status !== "all") {
      list = list.filter((s) => s.status === params.status);
    }
    return list;
  });
}

export async function getStationById(deviceId: string): Promise<MonitoringStation> {
  return apiClient<MonitoringStation>(`/api/v1/devices/${deviceId}`, {}, () => {
    const found = MOCK_STATIONS.find((s) => s.id === deviceId);
    if (!found) throw new Error("Station not found");
    return found;
  });
}

// ----------------------------------------------------------------------
// Readings & Telemetry
// ----------------------------------------------------------------------
export async function getLatestReading(deviceId?: string): Promise<AirReading> {
  const q = deviceId ? `?device_id=${encodeURIComponent(deviceId)}` : "";
  return apiClient<AirReading>(`/api/v1/readings/latest${q}`, {}, () =>
    getMockLatestReading(deviceId || "crescent-vandalur-01")
  );
}

export async function getReadingHistory(
  deviceId: string,
  startTime?: string,
  endTime?: string,
  resolution: string = "1h"
): Promise<ReadingHistoryPoint[]> {
  const q = `?device_id=${encodeURIComponent(deviceId)}&resolution=${resolution}`;
  return apiClient<ReadingHistoryPoint[]>(`/api/v1/readings/history${q}`, {}, () =>
    getMockReadingHistory(deviceId)
  );
}

// ----------------------------------------------------------------------
// Alerts & Incidents
// ----------------------------------------------------------------------
export async function getAlerts(activeOnly: boolean = true): Promise<EnvironmentalAlert[]> {
  return apiClient<EnvironmentalAlert[]>(`/api/v1/alerts?active_only=${activeOnly}`, {}, () => {
    if (activeOnly) return MOCK_ALERTS.filter((a) => a.active);
    return MOCK_ALERTS;
  });
}

export async function getIncidents(): Promise<EnvironmentalIncident[]> {
  return apiClient<EnvironmentalIncident[]>("/api/v1/incidents", {}, () => MOCK_INCIDENTS);
}

// ----------------------------------------------------------------------
// Community Reports
// ----------------------------------------------------------------------
export async function getReports(userId?: string): Promise<CommunityReport[]> {
  return apiClient<CommunityReport[]>("/api/v1/reports", {}, () => {
    if (userId) return MOCK_REPORTS.filter((r) => r.user_id === userId);
    return MOCK_REPORTS;
  });
}

export async function getReportById(reportId: string): Promise<CommunityReport> {
  return apiClient<CommunityReport>(`/api/v1/reports/${reportId}`, {}, () => {
    const r = MOCK_REPORTS.find((item) => item.id === reportId);
    if (!r) throw new Error("Report not found");
    return r;
  });
}

export async function createReport(input: CreateReportInput): Promise<CommunityReport> {
  return apiClient<CommunityReport>(
    "/api/v1/reports",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
    () => {
      const newRep: CommunityReport = {
        id: `rep_${Date.now()}`,
        user_id: MOCK_CURRENT_USER.uid,
        user_name: MOCK_CURRENT_USER.display_name,
        user_email: MOCK_CURRENT_USER.email,
        category: input.category,
        location: input.location,
        address: input.address,
        description: input.description,
        image_url: input.image_url || null,
        status: "submitted",
        submitted_at: new Date().toISOString(),
        reviewer_notes: "Report logged into spatial database. Awaiting moderation verification.",
      };
      MOCK_REPORTS.unshift(newRep);
      return newRep;
    }
  );
}

// ----------------------------------------------------------------------
// Analytics & Hotspots
// ----------------------------------------------------------------------
export async function getAnalyticsOverview(): Promise<AnalyticsOverview> {
  return apiClient<AnalyticsOverview>("/api/v1/analytics/overview", {}, () => {
    const reading = getMockLatestReading();
    return {
      total_stations: MOCK_STATIONS.length,
      online_stations: MOCK_STATIONS.filter((s) => s.status === "online").length,
      average_aqi: Math.round(
        MOCK_STATIONS.reduce((acc, s) => acc + s.aqi, 0) / MOCK_STATIONS.length
      ),
      overall_category: reading.category,
      active_alerts_count: MOCK_ALERTS.filter((a) => a.active).length,
      compliance_rate_pct: 88.4,
      monitored_population: 185000,
      primary_concern: "GST Corridor Evening Vehicular NO2 & PM2.5",
    };
  });
}

export async function getAnalyticsTrends(): Promise<AnalyticsTrend[]> {
  return apiClient<AnalyticsTrend[]>("/api/v1/analytics/trends", {}, () => [
    {
      pollutant: "PM2.5",
      unit: "µg/m³",
      trend_direction: "improving",
      change_pct_7d: -12.4,
      historical_7d: [
        { date: "Oct 29", value: 48 },
        { date: "Oct 30", value: 52 },
        { date: "Oct 31", value: 45 },
        { date: "Nov 01", value: 41 },
        { date: "Nov 02", value: 38 },
        { date: "Nov 03", value: 36 },
        { date: "Nov 04", value: 34 },
      ],
    },
    {
      pollutant: "PM10",
      unit: "µg/m³",
      trend_direction: "stable",
      change_pct_7d: 2.1,
      historical_7d: [
        { date: "Oct 29", value: 92 },
        { date: "Oct 30", value: 98 },
        { date: "Oct 31", value: 90 },
        { date: "Nov 01", value: 88 },
        { date: "Nov 02", value: 94 },
        { date: "Nov 03", value: 91 },
        { date: "Nov 04", value: 89 },
      ],
    },
    {
      pollutant: "NO2",
      unit: "ppb",
      trend_direction: "degrading",
      change_pct_7d: 14.8,
      historical_7d: [
        { date: "Oct 29", value: 24 },
        { date: "Oct 30", value: 28 },
        { date: "Oct 31", value: 31 },
        { date: "Nov 01", value: 35 },
        { date: "Nov 02", value: 39 },
        { date: "Nov 03", value: 42 },
        { date: "Nov 04", value: 44 },
      ],
    },
  ]);
}

export async function getHotspots(): Promise<HotspotCluster[]> {
  return apiClient<HotspotCluster[]>("/api/v1/analytics/hotspots", {}, () => MOCK_HOTSPOTS);
}

export async function getPredictions(stationId?: string): Promise<PredictionForecast> {
  return apiClient<PredictionForecast>(
    `/api/v1/predictions?station_id=${stationId || "crescent-vandalur-01"}`,
    {},
    () => getMockPredictions(stationId)
  );
}

// ----------------------------------------------------------------------
// AI Suite
// ----------------------------------------------------------------------
export async function sendAiChatMessage(request: AiChatRequest): Promise<AiChatResponse> {
  return apiClient<AiChatResponse>(
    "/api/v1/ai/chat",
    {
      method: "POST",
      body: JSON.stringify(request),
    },
    () => {
      const lastMsg = request.messages[request.messages.length - 1]?.content || "";
      return getMockAiChatReply(lastMsg, request.provider || "groq", request.model);
    }
  );
}

export async function runWhatIfSimulation(policy: {
  traffic_reduction_pct: number;
  green_canopy_gain_pct: number;
  industrial_curtailment_pct: number;
}): Promise<WhatIfScenarioResult> {
  return apiClient<WhatIfScenarioResult>(
    "/api/v1/ai/scenarios",
    {
      method: "POST",
      body: JSON.stringify(policy),
    },
    () => {
      const baseline = 168;
      // Formula estimating aggregate reduction based on coefficients
      const reduction =
        policy.traffic_reduction_pct * 0.45 +
        policy.green_canopy_gain_pct * 0.25 +
        policy.industrial_curtailment_pct * 0.38;
      const simulated = Math.max(28, Math.round(baseline - reduction));

      return {
        scenario_name: "Combined Urban & Transit Mitigation Model",
        policy_changes: {
          traffic_reduction_pct: policy.traffic_reduction_pct,
          green_canopy_gain_pct: policy.green_canopy_gain_pct,
          industrial_curtailment_pct: policy.industrial_curtailment_pct,
          ev_transition_pct: Math.round(policy.traffic_reduction_pct * 0.7),
        },
        baseline_aqi: baseline,
        simulated_aqi: simulated,
        aqi_delta: simulated - baseline,
        pm25_delta_pct: -Math.round(reduction * 0.8),
        no2_delta_pct: -Math.round(policy.traffic_reduction_pct * 0.9),
        confidence_score: 0.89,
        assumptions: [
          "Linear emission decay along Grand Southern Trunk corridor within 1.5km buffer.",
          "Wind vector assumption: 12 km/h ENE typical November coastal sea-breeze circulation.",
          "Vegetative canopy interception factor: 0.18 µg/m³ PM deposition per hectare.",
        ],
        limitations: [
          "Estimated via neural surrogate model; actual real-world dispersion depends on meteorological boundary layer inversion height.",
          "Does not account for non-compliant off-grid diesel gen-sets or cross-border transport.",
        ],
        hourly_projection: [
          { hour: "06:00", baseline: 65, simulated: 42 },
          { hour: "08:00", baseline: 145, simulated: 85 },
          { hour: "10:00", baseline: 178, simulated: 105 },
          { hour: "12:00", baseline: 110, simulated: 68 },
          { hour: "14:00", baseline: 85, simulated: 52 },
          { hour: "16:00", baseline: 95, simulated: 60 },
          { hour: "18:00", baseline: 168, simulated: 98 },
          { hour: "20:00", baseline: 190, simulated: 112 },
          { hour: "22:00", baseline: 130, simulated: 75 },
        ],
      };
    }
  );
}

// ----------------------------------------------------------------------
// Subscriptions, Plans & Usage
// ----------------------------------------------------------------------
export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  return apiClient<SubscriptionPlan[]>("/api/v1/plans", {}, () => MOCK_PLANS);
}

export async function getOrgSubscription(): Promise<OrgSubscription> {
  return apiClient<OrgSubscription>("/api/v1/subscriptions/current", {}, () => MOCK_ORG_SUBSCRIPTION);
}

export async function getUsageTelemetry(): Promise<UsageTelemetry> {
  return apiClient<UsageTelemetry>("/api/v1/usage", {}, () => MOCK_USAGE_TELEMETRY);
}

// ----------------------------------------------------------------------
// Scenario Switcher Helper (Synchronizes local demo with WebSocket/State)
// ----------------------------------------------------------------------
export function switchActiveScenario(key: ScenarioKey): void {
  setActiveMockScenario(key);
}

export function getCurrentScenarioKey(): ScenarioKey {
  return getActiveMockScenario();
}

