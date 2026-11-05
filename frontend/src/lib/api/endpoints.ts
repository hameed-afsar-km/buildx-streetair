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

  const res = await apiClient<any>(`/api/v1/devices${qStr}`, {}, () => {
    let list = [...MOCK_STATIONS];
    if (params?.status && params.status !== "all") {
      list = list.filter((s) => s.status === params.status);
    }
    return list;
  });

  const rawList = Array.isArray(res) ? res : res && Array.isArray(res.items) ? res.items : MOCK_STATIONS;
  const list: MonitoringStation[] = (rawList && rawList.length > 0 ? rawList : MOCK_STATIONS).map((st: any, idx: number) => {
    const lat = Number(st.coordinates?.lat ?? st.latitude ?? st.lat ?? (12.8797 + (idx * 0.01)));
    const lng = Number(st.coordinates?.lng ?? st.longitude ?? st.lng ?? (80.0833 + (idx * 0.01)));
    const aqi = typeof st.aqi === "number" ? st.aqi : 68;
    return {
      id: String(st.id || st.station_id || `station-${idx + 1}`),
      name: String(st.name || `Station ${idx + 1}`),
      location_name: String(st.location_name || st.description || "Tamil Nadu Mesh"),
      city: String(st.city || "Chennai"),
      state: String(st.state || "Tamil Nadu"),
      country: String(st.country || "India"),
      coordinates: { lat, lng },
      status: st.status === "active" ? "online" : (st.status || "online"),
      source: st.source || (st.source_mode === "hardware" ? "HARDWARE" : "SIMULATED"),
      scenario_active: st.scenario_active || "scenario_1_normal",
      is_hardware_connected: Boolean(st.is_hardware_connected || st.source_mode === "hardware"),
      last_seen: String(st.last_seen || st.last_seen_at || new Date().toISOString()),
      aqi,
      category: st.category || (aqi > 100 ? "Moderate" : "Good"),
      dominant_pollutant: String(st.dominant_pollutant || "PM2.5"),
      firmware_version: String(st.firmware_version || "v2.4.1"),
      sensor_suite: Array.isArray(st.sensor_suite) ? st.sensor_suite : ["PM2.5", "PM10"],
    };
  });

  if (params?.status && params.status !== "all") {
    return list.filter((s) => s.status === params.status);
  }
  return list;
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

  const rawResponse = await apiClient<any>(
    `/api/v1/readings/latest${q}`,
    { skipAuth: true },
    () => getMockLatestReading(deviceId || "crescent-vandalur-01")
  );

  // If mock data already has the right shape (has pollutants), return as-is
  if (rawResponse && "pollutants" in rawResponse) {
    return rawResponse as AirReading;
  }

  // Transform backend response → AirReading shape (handles raw reading or nested under .reading)
  const readingObj = (rawResponse && typeof rawResponse === "object" && "reading" in rawResponse)
    ? rawResponse.reading
    : rawResponse;

  if (readingObj && "readings" in readingObj && readingObj.readings) {
    const r = readingObj.readings;
    const aqi = typeof readingObj.aqi === "number"
      ? readingObj.aqi
      : typeof readingObj.aqi?.aqi === "number"
      ? readingObj.aqi.aqi
      : 0;
    const category = readingObj.aqi_category || readingObj.aqi?.category || "Good";

    // Map scenario_id to ScenarioKey (includes short aliases from ESP32 keypad firmware)
    const scenarioIdMap: Record<string, ScenarioKey> = {
      "normal": "scenario_1_normal",
      "traffic": "scenario_2_traffic",
      "traffic_congestion": "scenario_2_traffic",
      "construction": "scenario_3_construction",
      "construction_dust": "scenario_3_construction",
      "industrial": "scenario_4_industrial",
      "industrial_emissions": "scenario_4_industrial",
      "waste_burning": "scenario_5_waste_burning",
      "high_humidity": "scenario_6_humidity",
      "smoke": "scenario_7_smoke",
      "smoke_event": "scenario_7_smoke",
      "dispersal": "scenario_8_dispersal",
      "pollution_dispersal": "scenario_8_dispersal",
      "extreme": "scenario_9_extreme",
      "extreme_pollution": "scenario_9_extreme",
    };
    const scenarioKey: ScenarioKey = scenarioIdMap[readingObj.scenario_id || "normal"] || "scenario_1_normal";

    return {
      reading_id: readingObj.reading_id || `rdg_${Date.now()}`,
      device_id: readingObj.device_id || deviceId || "unknown",
      station_name: rawResponse?.station_name || readingObj.station_name || "Crescent Institute Campus Beacon",
      timestamp: readingObj.timestamp || new Date().toISOString(),
      source: (readingObj.source || "SIMULATED") as "HARDWARE" | "SIMULATED" | "DEMONSTRATION" | "HISTORICAL",
      data_status: "LIVE" as const,
      scenario: scenarioKey,
      aqi,
      category: category as any,
      pollutants: {
        pm25: { value: r.pm25 ?? 0, unit: "µg/m³", sub_index: Math.min(500, Math.round((r.pm25 ?? 0) * 1.6)), safe_threshold: 60, description: "Fine inhalable particles ≤ 2.5 micrometers" },
        pm10: { value: r.pm10 ?? 0, unit: "µg/m³", sub_index: Math.min(500, Math.round((r.pm10 ?? 0) * 1.1)), safe_threshold: 100, description: "Inhalable coarse particles ≤ 10 micrometers" },
        no2: { value: 0, unit: "ppb", sub_index: 0, safe_threshold: 80, description: "Nitrogen Dioxide (derived from MQ135)" },
        so2: { value: 0, unit: "ppb", sub_index: 0, safe_threshold: 80, description: "Sulfur Dioxide" },
        co: { value: 0, unit: "ppm", sub_index: 0, safe_threshold: 2.0, description: "Carbon Monoxide" },
        o3: { value: 0, unit: "ppb", sub_index: 0, safe_threshold: 100, description: "Ground-level Ozone" },
        voc: { value: r.mq135_raw ? Math.round(r.mq135_raw / 10) : 50, unit: "ppb", sub_index: null, safe_threshold: 300, description: "MQ135 Raw Gas Sensor (uncalibrated VOC proxy)" },
      },
      weather: {
        temperature: r.temperature ?? 28,
        humidity: r.humidity ?? 60,
        wind_speed: 12.8,
        wind_direction: "ENE",
        pressure: r.pressure ?? 1012,
      },
    };
  }

  // Fallback to mock
  return getMockLatestReading(deviceId || "crescent-vandalur-01");
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
  const res = await apiClient<any>(`/api/v1/alerts?active_only=${activeOnly}`, {}, () => {
    if (activeOnly) return MOCK_ALERTS.filter((a) => a.active);
    return MOCK_ALERTS;
  });
  const list: EnvironmentalAlert[] = Array.isArray(res)
    ? res
    : res && Array.isArray(res.items)
    ? res.items
    : MOCK_ALERTS;
  if (activeOnly) return list.filter((a) => a.active);
  return list;
}

export async function getIncidents(): Promise<EnvironmentalIncident[]> {
  const res = await apiClient<any>("/api/v1/incidents", {}, () => MOCK_INCIDENTS);
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.items)) return res.items;
  return MOCK_INCIDENTS;
}

// ----------------------------------------------------------------------
// Community Reports
// ----------------------------------------------------------------------
export async function getReports(userId?: string): Promise<CommunityReport[]> {
  const res = await apiClient<any>("/api/v1/reports", {}, () => {
    if (userId) return MOCK_REPORTS.filter((r) => r.user_id === userId);
    return MOCK_REPORTS;
  });
  const list: CommunityReport[] = Array.isArray(res)
    ? res
    : res && Array.isArray(res.items)
    ? res.items
    : MOCK_REPORTS;
  if (userId) return list.filter((r) => r.user_id === userId);
  return list;
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
  // Transform frontend AiChatRequest → backend ChatRequest schema
  const messages = request.messages || [];
  const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
  const history = messages.slice(0, -1); // All but the last message

  const backendPayload = {
    message: lastUserMsg?.content || "",
    provider: request.provider || "groq",
    station_context: request.context?.station_id || null,
    conversation_id: null,
    history: history.map((m) => ({ role: m.role, content: m.content })),
  };

  return apiClient<AiChatResponse>(
    "/api/v1/ai/chat",
    {
      method: "POST",
      body: JSON.stringify(backendPayload),
    },
    () => {
      const lastMsg = lastUserMsg?.content || "";
      return getMockAiChatReply(lastMsg, request.provider || "groq", request.model);
    }
  ).then((rawResponse: any) => {
    // Backend returns ChatResponse shape; transform to AiChatResponse
    if (rawResponse && "content" in rawResponse && !("reply" in rawResponse)) {
      return {
        reply: rawResponse.content || "",
        provider_used: rawResponse.provider || request.provider || "groq",
        model_used: rawResponse.model || "llama-3.3-70b-versatile",
        citations: (rawResponse.citations || []).map((c: any) => ({
          title: c.title || "",
          url: c.url || "#",
          source_type: c.source_type || "rag_document",
          snippet: c.snippet || c.date || undefined,
        })),
        evidence: [],
      } as AiChatResponse;
    }
    return rawResponse as AiChatResponse;
  });
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

