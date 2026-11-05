// =====================================================================
// STREETAIR DOMAIN AND CONTRACT TYPES
// =====================================================================

export type DataSource = "HARDWARE" | "SIMULATED" | "DEMONSTRATION" | "HISTORICAL";
export type DataStatus = "LIVE" | "STALE" | "HISTORICAL" | "FORECAST";

export interface AnalyticsOverview {
  total_stations: number;
  online_stations?: number;
  active_stations?: number;
  average_aqi?: number;
  overall_category?: string;
  active_alerts_count?: number;
  active_alerts?: number;
  compliance_rate_pct?: number;
  monitored_population?: number;
  primary_concern?: string;
  latest_aqi?: Record<string, { aqi: number }>;
}

export interface AnalyticsTrend {
  pollutant: string;
  unit: string;
  trend_direction: "improving" | "degrading" | "stable";
  change_pct_7d: number;
  historical_7d: { date: string; value: number }[];
}

export type AQICategory =
  | "Good"
  | "Moderate"
  | "Poor"
  | "Unhealthy"
  | "Very Unhealthy"
  | "Hazardous"
  | "Severe";

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface PollutantDetail {
  value: number;
  unit: string;
  sub_index?: number | null;
  safe_threshold?: number;
  description?: string;
}

export interface Pollutants {
  pm25: PollutantDetail;
  pm10: PollutantDetail;
  no2: PollutantDetail;
  so2: PollutantDetail;
  co: PollutantDetail;
  o3: PollutantDetail;
  voc?: PollutantDetail;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  wind_speed: number;
  wind_direction: string;
  pressure: number;
}

export type StationOperationalStatus = "online" | "offline" | "calibrating" | "maintenance";

export interface MonitoringStation {
  id: string;
  name: string;
  location_name: string;
  city: string;
  state: string;
  country: string;
  coordinates: Coordinates;
  status: StationOperationalStatus;
  source: DataSource;
  scenario_active: ScenarioKey;
  is_hardware_connected: boolean;
  last_seen: string;
  aqi: number;
  category: AQICategory;
  dominant_pollutant: string;
  firmware_version: string;
  org_id?: string | null;
  sensor_suite: string[];
}

export interface AirReading {
  reading_id: string;
  device_id: string;
  station_name?: string;
  timestamp: string;
  source: DataSource;
  data_status: DataStatus;
  scenario: ScenarioKey;
  aqi: number;
  category: AQICategory;
  pollutants: Pollutants;
  weather: WeatherData;
}

export interface ReadingHistoryPoint {
  timestamp: string;
  aqi: number;
  pm25: number;
  pm10: number;
  no2: number;
  so2: number;
  co: number;
  o3: number;
  source: DataSource;
  data_status: DataStatus;
}

// ---------------------------------------------------------------------
// 9 Planned ESP32 Scenarios
// ---------------------------------------------------------------------
export type ScenarioKey =
  | "scenario_1_normal"
  | "scenario_2_traffic"
  | "scenario_3_construction"
  | "scenario_4_industrial"
  | "scenario_5_waste_burning"
  | "scenario_6_humidity"
  | "scenario_7_smoke"
  | "scenario_8_dispersal"
  | "scenario_9_extreme";

export interface ScenarioDefinition {
  key: ScenarioKey;
  number: number;
  name: string;
  shortDesc: string;
  fullDescription: string;
  expectedAQIRange: [number, number];
  category: AQICategory;
  dominantPollutant: string;
  realWorldAnalogy: string;
  simulatedValues: {
    pm25: number;
    pm10: number;
    no2: number;
    so2: number;
    co: number;
    o3: number;
    voc?: number;
    humidity: number;
    temp: number;
  };
}

// ---------------------------------------------------------------------
// Alerts & Incidents
// ---------------------------------------------------------------------
export type AlertSeverity = "low" | "moderate" | "high" | "critical";

export interface EnvironmentalAlert {
  id: string;
  device_id: string;
  station_name: string;
  timestamp: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  pollutant: string;
  value: number;
  threshold: number;
  unit: string;
  active: boolean;
  category: string;
}

export type IncidentStatus = "detected" | "investigating" | "confirmed" | "resolved";

export interface EnvironmentalIncident {
  id: string;
  device_id: string;
  station_name: string;
  title: string;
  category: string;
  severity: AlertSeverity;
  status: IncidentStatus;
  detected_at: string;
  resolved_at?: string | null;
  baseline_aqi: number;
  peak_aqi: number;
  root_cause_hypothesis: string;
  confidence: number;
  evidence_notes: string;
  location: Coordinates;
  address: string;
}

// ---------------------------------------------------------------------
// Community Reports
// ---------------------------------------------------------------------
export type ReportCategory =
  | "smoke"
  | "dust"
  | "construction_dust"
  | "waste_burning"
  | "odour"
  | "industrial_emissions"
  | "traffic_congestion"
  | "other";

export type ReportStatus = "submitted" | "under_review" | "verified" | "rejected" | "resolved";

export interface CommunityReport {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  category: ReportCategory;
  location: Coordinates;
  address: string;
  description: string;
  image_url?: string | null;
  status: ReportStatus;
  submitted_at: string;
  verified_at?: string | null;
  reviewer_notes?: string | null;
  linked_incident_id?: string | null;
}

export interface CreateReportInput {
  category: ReportCategory;
  location: Coordinates;
  address: string;
  description: string;
  image_url?: string | null;
}

// ---------------------------------------------------------------------
// Authentication & User Roles
// ---------------------------------------------------------------------
export type UserRole = "citizen" | "analyst" | "org_admin" | "platform_admin";

export interface AuthUser {
  uid: string;
  email: string;
  display_name: string;
  role: UserRole;
  org_id?: string | null;
  org_name?: string | null;
  plan?: string;
  created_at: string;
  avatar_url?: string;
}

// ---------------------------------------------------------------------
// Commercial SaaS & Subscriptions
// ---------------------------------------------------------------------
export type SubscriptionTier = "starter" | "professional" | "enterprise";

export interface SubscriptionPlan {
  id: string;
  name: string;
  tier: SubscriptionTier;
  price_monthly: number;
  price_annual: number;
  currency: string;
  description: string;
  popular?: boolean;
  features: string[];
  limits: {
    max_stations: number;
    api_calls_per_month: number;
    retention_days: number;
    ai_queries_per_month: number;
    team_members: number;
    custom_alerts: boolean;
    dedicated_support: boolean;
  };
}

export interface OrgSubscription {
  org_id: string;
  plan_id: string;
  plan_name: string;
  tier: SubscriptionTier;
  status: "active" | "trialing" | "past_due" | "canceled";
  billing_cycle: "monthly" | "annual";
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  invoices: {
    id: string;
    amount: number;
    status: "paid" | "open";
    date: string;
    pdf_url: string;
  }[];
}

export interface UsageTelemetry {
  org_id: string;
  stations_count: number;
  stations_limit: number;
  api_calls_count: number;
  api_calls_limit: number;
  ai_queries_count: number;
  ai_queries_limit: number;
  storage_mb: number;
  storage_limit_mb: number;
  period_start: string;
  period_end: string;
}

// ---------------------------------------------------------------------
// AI Intelligence & Chat
// ---------------------------------------------------------------------
export type AiProvider = "groq" | "ollama";

export interface AiCitation {
  title: string;
  url: string;
  source_type: "rag_document" | "web_search" | "telemetry_archive";
  snippet?: string;
  published_date?: string;
}

export interface AiEvidence {
  type: "telemetry" | "spatial_correlation" | "historical_baseline" | "external_advisory";
  label: string;
  confidence: number;
}

export interface ChatMessageItem {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  provider?: AiProvider;
  model?: string;
  citations?: AiCitation[];
  evidence?: AiEvidence[];
}

export interface WhatIfScenarioResult {
  scenario_name: string;
  policy_changes: {
    traffic_reduction_pct: number;
    green_canopy_gain_pct: number;
    industrial_curtailment_pct: number;
    ev_transition_pct: number;
  };
  baseline_aqi: number;
  simulated_aqi: number;
  aqi_delta: number;
  pm25_delta_pct: number;
  no2_delta_pct: number;
  confidence_score: number;
  assumptions: string[];
  limitations: string[];
  hourly_projection: {
    hour: string;
    baseline: number;
    simulated: number;
  }[];
}

export interface HotspotCluster {
  id: string;
  name: string;
  coordinates: Coordinates;
  radius_meters: number;
  average_aqi: number;
  severity: AlertSeverity;
  incident_count: number;
  primary_source_type: string;
  reported_at: string;
}

export interface PredictionForecast {
  station_id: string;
  generated_at: string;
  model_type: string;
  horizon_hours: number;
  forecast: {
    timestamp: string;
    aqi_predicted: number;
    aqi_lower_bound: number;
    aqi_upper_bound: number;
    dominant_factor: string;
  }[];
}

// ---------------------------------------------------------------------
// WebSocket Live Protocol Messages
// ---------------------------------------------------------------------
export type LiveWSConnectionState = "connected" | "connecting" | "reconnecting" | "disconnected" | "stale";

export type WebSocketInboundMessage =
  | { type: "ping"; timestamp: string }
  | { type: "pong" }
  | { type: "subscribed"; device_id: string }
  | {
      type: "reading_update";
      device_id: string;
      reading: AirReading;
    }
  | {
      type: "scenario_triggered";
      device_id: string;
      scenario_key: ScenarioKey;
      scenario_name: string;
      simulated_by: string;
    }
  | {
      type: "alert_created";
      alert: EnvironmentalAlert;
    };

export type WebSocketOutboundMessage =
  | { action: "subscribe"; device_id: string; token?: string }
  | { action: "unsubscribe"; device_id: string }
  | { action: "ping" }
  | { action: "trigger_scenario"; device_id: string; scenario_key: ScenarioKey };

