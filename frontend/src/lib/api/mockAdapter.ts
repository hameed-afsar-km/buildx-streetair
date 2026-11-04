import {
  AirReading,
  AnalyticsOverview,
  AuthUser,
  CommunityReport,
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
  AiChatResponse,
} from "./types";
import { SCENARIO_DEFINITIONS } from "../scenarios";

// In-memory active scenario state for local demonstration preview
let activeScenarioKey: ScenarioKey = "scenario_1_normal";

export function getActiveMockScenario(): ScenarioKey {
  return activeScenarioKey;
}

export function setActiveMockScenario(key: ScenarioKey): void {
  activeScenarioKey = key;
}

// ----------------------------------------------------------------------
// Primary Monitoring Stations
// ----------------------------------------------------------------------
export const MOCK_STATIONS: MonitoringStation[] = [
  {
    id: "crescent-vandalur-01",
    name: "Crescent Institute Campus Beacon",
    location_name: "B.S. Abdur Rahman Crescent Institute of Science and Technology, GST Road",
    city: "Vandalur, Chennai South",
    state: "Tamil Nadu",
    country: "India",
    coordinates: { lat: 12.8797, lng: 80.0833 },
    status: "online",
    source: "SIMULATED",
    scenario_active: "scenario_1_normal",
    is_hardware_connected: true,
    last_seen: new Date().toISOString(),
    aqi: 34,
    category: "Good",
    dominant_pollutant: "PM2.5",
    firmware_version: "esp32-freertos-v2.3.1",
    sensor_suite: ["MQ-135 Gas Sensor", "PMS5003 Particulate", "BME280 Temp/Humidity/Pressure"],
  },
  {
    id: "kilambakkam-terminal-02",
    name: "Kilambakkam Bus Terminus (KCBT)",
    location_name: "Kalaignar Centenary Bus Terminus, GST Road",
    city: "Kilambakkam",
    state: "Tamil Nadu",
    country: "India",
    coordinates: { lat: 12.8622, lng: 80.0715 },
    status: "online",
    source: "SIMULATED",
    scenario_active: "scenario_2_traffic",
    is_hardware_connected: false,
    last_seen: new Date().toISOString(),
    aqi: 148,
    category: "Poor",
    dominant_pollutant: "NO2",
    firmware_version: "station-grid-v1.8.0",
    sensor_suite: ["Laser PM2.5/PM10", "NO2 Electrochemical", "Wind Anemometer"],
  },
  {
    id: "tambaram-junction-03",
    name: "Tambaram Railway Hub Station",
    location_name: "Grand Southern Trunk Rd, East Tambaram",
    city: "Tambaram, Chennai",
    state: "Tamil Nadu",
    country: "India",
    coordinates: { lat: 12.9249, lng: 80.1285 },
    status: "online",
    source: "DEMONSTRATION",
    scenario_active: "scenario_2_traffic",
    is_hardware_connected: false,
    last_seen: new Date().toISOString(),
    aqi: 165,
    category: "Unhealthy",
    dominant_pollutant: "PM2.5",
    firmware_version: "station-grid-v1.8.0",
    sensor_suite: ["Optical Dust Sensor", "CO & NO2 Sensor", "Sound Level Meter"],
  },
  {
    id: "maraimalai-industrial-04",
    name: "SIPCOT Industrial Corridor Beacon",
    location_name: "Maraimalai Nagar Industrial Area Phase II",
    city: "Chengalpattu District",
    state: "Tamil Nadu",
    country: "India",
    coordinates: { lat: 12.7938, lng: 80.0238 },
    status: "online",
    source: "SIMULATED",
    scenario_active: "scenario_4_industrial",
    is_hardware_connected: false,
    last_seen: new Date().toISOString(),
    aqi: 228,
    category: "Very Unhealthy",
    dominant_pollutant: "SO2 & VOC",
    firmware_version: "station-grid-v2.0.4",
    sensor_suite: ["PID VOC Detector", "SO2 NDIR", "PM1/2.5/10 Spectrometer"],
  },
  {
    id: "vandalur-zoo-eco-05",
    name: "Arignar Anna Zoological Park Reserve",
    location_name: "Vandalur Reserve Forest Buffer Zone",
    city: "Vandalur",
    state: "Tamil Nadu",
    country: "India",
    coordinates: { lat: 12.8912, lng: 80.0984 },
    status: "online",
    source: "DEMONSTRATION",
    scenario_active: "scenario_1_normal",
    is_hardware_connected: false,
    last_seen: new Date().toISOString(),
    aqi: 38,
    category: "Good",
    dominant_pollutant: "PM10",
    firmware_version: "solar-remote-v1.4.2",
    sensor_suite: ["Ultrasonic Particle Sensor", "Forest Canopy Temp/Humid"],
  },
];

// Helper to compute reading for the active scenario
export function getMockLatestReading(deviceId: string = "crescent-vandalur-01"): AirReading {
  const sc = SCENARIO_DEFINITIONS[activeScenarioKey];
  const station = MOCK_STATIONS.find((s) => s.id === deviceId) || MOCK_STATIONS[0];
  const aqiMid = Math.round((sc.expectedAQIRange[0] + sc.expectedAQIRange[1]) / 2);

  return {
    reading_id: `rdg_${Date.now()}`,
    device_id: station.id,
    station_name: station.name,
    timestamp: new Date().toISOString(),
    source: "SIMULATED",
    data_status: "LIVE",
    scenario: activeScenarioKey,
    aqi: aqiMid,
    category: sc.category,
    pollutants: {
      pm25: {
        value: sc.simulatedValues.pm25,
        unit: "µg/m³",
        sub_index: Math.min(500, Math.round(sc.simulatedValues.pm25 * 1.6)),
        safe_threshold: 60, // CPCB 24h standard
        description: "Fine inhalable particles ≤ 2.5 micrometers",
      },
      pm10: {
        value: sc.simulatedValues.pm10,
        unit: "µg/m³",
        sub_index: Math.min(500, Math.round(sc.simulatedValues.pm10 * 1.1)),
        safe_threshold: 100, // CPCB 24h standard
        description: "Inhalable coarse particles ≤ 10 micrometers",
      },
      no2: {
        value: sc.simulatedValues.no2,
        unit: "ppb",
        sub_index: Math.min(500, Math.round(sc.simulatedValues.no2 * 1.3)),
        safe_threshold: 80,
        description: "Nitrogen Dioxide combustion byproduct",
      },
      so2: {
        value: sc.simulatedValues.so2,
        unit: "ppb",
        sub_index: Math.min(500, Math.round(sc.simulatedValues.so2 * 1.8)),
        safe_threshold: 80,
        description: "Sulfur Dioxide from industrial fuel burning",
      },
      co: {
        value: sc.simulatedValues.co,
        unit: "ppm",
        sub_index: Math.min(500, Math.round(sc.simulatedValues.co * 35)),
        safe_threshold: 2.0,
        description: "Carbon Monoxide incomplete combustion",
      },
      o3: {
        value: sc.simulatedValues.o3,
        unit: "ppb",
        sub_index: Math.min(500, Math.round(sc.simulatedValues.o3 * 1.0)),
        safe_threshold: 100,
        description: "Ground-level Tropospheric Ozone",
      },
      voc: {
        value: sc.simulatedValues.voc || 50,
        unit: "ppb",
        sub_index: null,
        safe_threshold: 300,
        description: "Total Volatile Organic Compounds",
      },
    },
    weather: {
      temperature: sc.simulatedValues.temp,
      humidity: sc.simulatedValues.humidity,
      wind_speed: 12.8,
      wind_direction: "ENE",
      pressure: 1012.4,
    },
  };
}

// ----------------------------------------------------------------------
// Reading History Generator (24-Hour Timeline)
// ----------------------------------------------------------------------
export function getMockReadingHistory(deviceId: string = "crescent-vandalur-01"): ReadingHistoryPoint[] {
  const points: ReadingHistoryPoint[] = [];
  const now = new Date();

  for (let i = 24; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 60 * 60 * 1000);
    const hour = t.getHours();

    // Diurnal pattern: peaks around 8-10 AM (rush) and 7-9 PM (evening inversion)
    let diurnalBoost = 0;
    if (hour >= 7 && hour <= 10) diurnalBoost = 45;
    else if (hour >= 18 && hour <= 21) diurnalBoost = 55;
    else if (hour >= 13 && hour <= 16) diurnalBoost = -20; // Convective mixing / afternoon breeze

    const baseAqi = 40 + diurnalBoost + (Math.sin(i / 3) * 12);
    const aqi = Math.max(22, Math.round(baseAqi));

    points.push({
      timestamp: t.toISOString(),
      aqi,
      pm25: +(aqi * 0.42).toFixed(1),
      pm10: +(aqi * 0.78).toFixed(1),
      no2: +(12 + (diurnalBoost > 0 ? diurnalBoost * 0.4 : 2)).toFixed(1),
      so2: +(4 + Math.random() * 3).toFixed(1),
      co: +(0.3 + (diurnalBoost > 0 ? 0.6 : 0.1)).toFixed(2),
      o3: +(18 + (hour >= 12 && hour <= 16 ? 24 : 4)).toFixed(1),
      source: "HISTORICAL",
      data_status: "HISTORICAL",
    });
  }

  return points;
}

// ----------------------------------------------------------------------
// Mock Environmental Alerts & Incidents
// ----------------------------------------------------------------------
export const MOCK_ALERTS: EnvironmentalAlert[] = [
  {
    id: "alt_001",
    device_id: "crescent-vandalur-01",
    station_name: "Crescent Institute Campus Beacon",
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    severity: "high",
    title: "Particulate Threshold Exceeded (PM2.5)",
    message: "PM2.5 exceeded national 24-hr threshold (60 µg/m³) following GST Road vehicle backlog.",
    pollutant: "PM2.5",
    value: 78.5,
    threshold: 60.0,
    unit: "µg/m³",
    active: true,
    category: "Traffic / Transit",
  },
  {
    id: "alt_002",
    device_id: "maraimalai-industrial-04",
    station_name: "SIPCOT Industrial Corridor Beacon",
    timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    severity: "critical",
    title: "Industrial Sulfur Dioxide Surge Detected",
    message: "SO2 reached 44.5 ppb, exceeding standard guideline for continuous industrial perimeter.",
    pollutant: "SO2",
    value: 44.5,
    threshold: 30.0,
    unit: "ppb",
    active: true,
    category: "Industrial",
  },
  {
    id: "alt_003",
    device_id: "tambaram-junction-03",
    station_name: "Tambaram Railway Hub Station",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    severity: "moderate",
    title: "Elevated Coarse Dust PM10 Advisory",
    message: "Moderate PM10 advisory in effect near pedestrian footbridges due to road resurfacing.",
    pollutant: "PM10",
    value: 125.0,
    threshold: 100.0,
    unit: "µg/m³",
    active: false,
    category: "Civil Works",
  },
];

export const MOCK_INCIDENTS: EnvironmentalIncident[] = [
  {
    id: "inc_vandalur_101",
    device_id: "crescent-vandalur-01",
    station_name: "Crescent Institute Campus Beacon",
    title: "GST Road Evening Bottleneck Particulate Anomaly",
    category: "Traffic Congestion",
    severity: "high",
    status: "investigating",
    detected_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    baseline_aqi: 32,
    peak_aqi: 178,
    root_cause_hypothesis:
      "Southbound bus congestion near Crescent Gate 1 intersecting with Vandalur flyover construction bottleneck.",
    confidence: 0.92,
    evidence_notes:
      "Sharp NO2 (68 ppb) and PM2.5 (78.5 µg/m³) co-spike with prevailing northerly wind carrying highway tailpipe plume onto campus sensor beacon.",
    location: { lat: 12.8797, lng: 80.0833 },
    address: "GST Road outside Crescent Institute Main Gate, Vandalur",
  },
  {
    id: "inc_sipcot_102",
    device_id: "maraimalai-industrial-04",
    station_name: "SIPCOT Industrial Corridor Beacon",
    title: "Suburban Industrial Stack Emission Exceedance",
    category: "Industrial Emissions",
    severity: "critical",
    status: "confirmed",
    detected_at: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
    baseline_aqi: 45,
    peak_aqi: 242,
    root_cause_hypothesis:
      "Boiler desulfurization scrubber bypass at manufacturing complex during scheduled plant turnaround.",
    confidence: 0.88,
    evidence_notes:
      "Consistent downwind SO2 plume detected across two consecutive monitoring points with elevated VOC signals.",
    location: { lat: 12.7938, lng: 80.0238 },
    address: "Maraimalai Nagar Industrial Estate, Phase 2",
  },
];

// ----------------------------------------------------------------------
// Mock Community Reports
// ----------------------------------------------------------------------
export const MOCK_REPORTS: CommunityReport[] = [
  {
    id: "rep_5501",
    user_id: "usr_citizen_01",
    user_name: "Siddharth Raman",
    user_email: "siddharth.r@crescent.education",
    category: "waste_burning",
    location: { lat: 12.8785, lng: 80.0815 },
    address: "Behind Crescent Sports Pavilion, adjacent to perimeter fence",
    description:
      "Dense white smoke with strong chemical odor. Dry leaf waste mixed with plastic packaging being burned in open ditch.",
    image_url: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?auto=format&fit=crop&w=600&q=80",
    status: "under_review",
    submitted_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    reviewer_notes: "Patrol team dispatched to verify perimeter burning violation.",
  },
  {
    id: "rep_5502",
    user_id: "usr_citizen_02",
    user_name: "Ayesha Banu",
    user_email: "ayesha.b@gmail.com",
    category: "construction_dust",
    location: { lat: 12.864, lng: 80.073 },
    address: "Kilambakkam Service Lane entrance",
    description: "Uncovered sand trucks driving without water sprinklers causing blinding dust cloud for two-wheelers.",
    image_url: null,
    status: "verified",
    submitted_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    verified_at: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    reviewer_notes: "Forwarded to Chengalpattu Municipal Enforcement cell.",
  },
];

// ----------------------------------------------------------------------
// Mock Hotspots
// ----------------------------------------------------------------------
export const MOCK_HOTSPOTS: HotspotCluster[] = [
  {
    id: "hotspot_vandalur",
    name: "Vandalur GST Corridor Cluster",
    coordinates: { lat: 12.879, lng: 80.082 },
    radius_meters: 850,
    average_aqi: 168,
    severity: "high",
    incident_count: 7,
    primary_source_type: "Highway Diesel & Idling",
    reported_at: new Date().toISOString(),
  },
  {
    id: "hotspot_kilambakkam",
    name: "KCBT Bus Hub Dust & Idling Cluster",
    coordinates: { lat: 12.862, lng: 80.071 },
    radius_meters: 1200,
    average_aqi: 152,
    severity: "high",
    incident_count: 12,
    primary_source_type: "Fleet Ingestion & Civil Works",
    reported_at: new Date().toISOString(),
  },
  {
    id: "hotspot_maraimalai",
    name: "Maraimalai Nagar Chemical Manufacturing Belt",
    coordinates: { lat: 12.793, lng: 80.024 },
    radius_meters: 1600,
    average_aqi: 235,
    severity: "critical",
    incident_count: 19,
    primary_source_type: "Industrial Combustion Stacks",
    reported_at: new Date().toISOString(),
  },
];

// ----------------------------------------------------------------------
// Mock Forecast / Predictions (Prophet / LSTM)
// ----------------------------------------------------------------------
export function getMockPredictions(stationId: string = "crescent-vandalur-01"): PredictionForecast {
  const points = [];
  const now = new Date();

  for (let i = 1; i <= 24; i++) {
    const t = new Date(now.getTime() + i * 60 * 60 * 1000);
    const hour = t.getHours();

    let expected = 42;
    if (hour >= 8 && hour <= 10) expected = 145; // Morning peak
    else if (hour >= 18 && hour <= 21) expected = 160; // Evening peak
    else if (hour >= 2 && hour <= 5) expected = 35; // Late night lull

    points.push({
      timestamp: t.toISOString(),
      aqi_predicted: expected,
      aqi_lower_bound: Math.max(15, expected - 18),
      aqi_upper_bound: expected + 24,
      dominant_factor: hour >= 8 && hour <= 10 ? "GST Commuter Rush" : "Ambient Inversion",
    });
  }

  return {
    station_id: stationId,
    generated_at: new Date().toISOString(),
    model_type: "STREETAIR Spatial-Temporal LSTM v3.2 + Weather Ensemble",
    horizon_hours: 24,
    forecast: points,
  };
}

// ----------------------------------------------------------------------
// Mock Subscriptions & Plans
// ----------------------------------------------------------------------
export const MOCK_PLANS: SubscriptionPlan[] = [
  {
    id: "plan_starter",
    name: "Starter Beacon",
    tier: "starter",
    price_monthly: 4999,
    price_annual: 47990,
    currency: "INR",
    description: "Designed for small educational campuses, individual commercial sites, and residential communities.",
    popular: false,
    features: [
      "1 Continuous Monitoring Station",
      "Public & Private Dashboard Access",
      "Real-time Live WebSocket Stream",
      "Standard SMS/Email Pollution Alerts",
      "30-Day Historical Data Storage",
      "Up to 3 Team Members",
      "Basic Anomaly Detection",
    ],
    limits: {
      max_stations: 1,
      api_calls_per_month: 25000,
      retention_days: 30,
      ai_queries_per_month: 100,
      team_members: 3,
      custom_alerts: false,
      dedicated_support: false,
    },
  },
  {
    id: "plan_professional",
    name: "Professional Intelligence",
    tier: "professional",
    price_monthly: 19999,
    price_annual: 191990,
    currency: "INR",
    description: "For construction firms, industrial facilities, and regional colleges needing compliance reporting.",
    popular: true,
    features: [
      "Up to 5 Monitoring Stations",
      "Advanced Anomaly Detection (Pollution Detective)",
      "Automated CPCB Compliance Reports (PDF/CSV)",
      "Time Machine & 24h Predictive Forecasting",
      "AI Environmental Assistant (Groq & Ollama)",
      "90-Day High-Resolution Historical Data",
      "Up to 15 Team Members with RBAC",
      "Webhook Alert Integrations (Slack/Teams)",
    ],
    limits: {
      max_stations: 5,
      api_calls_per_month: 250000,
      retention_days: 90,
      ai_queries_per_month: 1000,
      team_members: 15,
      custom_alerts: true,
      dedicated_support: true,
    },
  },
  {
    id: "plan_enterprise",
    name: "Enterprise & Smart City",
    tier: "enterprise",
    price_monthly: 59999,
    price_annual: 575990,
    currency: "INR",
    description: "For municipal corporations, smart-city boards, and large multi-site industrial conglomerates.",
    popular: false,
    features: [
      "Unlimited Monitoring Stations & Mesh Grids",
      "What-If City Simulator & Scenario Modeling",
      "Full Command Centre & Network Moderation",
      "Dedicated Enterprise SLA & Sensor Calibration",
      "Tavily Real-time Web Evidence & Custom RAG",
      "3-Year Historical Data Retention",
      "Unlimited Team Seats & SSO/SAML Integration",
      "On-premise / Private Cloud Gateway Options",
    ],
    limits: {
      max_stations: 999,
      api_calls_per_month: 2000000,
      retention_days: 1095,
      ai_queries_per_month: 10000,
      team_members: 999,
      custom_alerts: true,
      dedicated_support: true,
    },
  },
];

export const MOCK_ORG_SUBSCRIPTION: OrgSubscription = {
  org_id: "org_crescent_institute",
  plan_id: "plan_enterprise",
  plan_name: "Enterprise & Smart City",
  tier: "enterprise",
  status: "active",
  billing_cycle: "annual",
  current_period_start: "2026-01-01T00:00:00Z",
  current_period_end: "2026-12-31T23:59:59Z",
  cancel_at_period_end: false,
  invoices: [
    {
      id: "inv_2026_01",
      amount: 575990,
      status: "paid",
      date: "2026-01-02T10:00:00Z",
      pdf_url: "#",
    },
    {
      id: "inv_2025_01",
      amount: 575990,
      status: "paid",
      date: "2025-01-02T10:00:00Z",
      pdf_url: "#",
    },
  ],
};

export const MOCK_USAGE_TELEMETRY: UsageTelemetry = {
  org_id: "org_crescent_institute",
  stations_count: 5,
  stations_limit: 999,
  api_calls_count: 142850,
  api_calls_limit: 2000000,
  ai_queries_count: 342,
  ai_queries_limit: 10000,
  storage_mb: 2840,
  storage_limit_mb: 100000,
  period_start: "2026-11-01T00:00:00Z",
  period_end: "2026-11-30T23:59:59Z",
};

// ----------------------------------------------------------------------
// Mock User Profile
// ----------------------------------------------------------------------
export const MOCK_CURRENT_USER: AuthUser = {
  uid: "usr_lead_crescent_01",
  email: "director.research@crescent.education",
  display_name: "Dr. K. Ahmed (Dean of Research)",
  role: "platform_admin", // Full capabilities preview
  org_id: "org_crescent_institute",
  org_name: "B.S. Abdur Rahman Crescent Institute of Science and Technology",
  plan: "enterprise",
  created_at: "2026-01-10T08:00:00Z",
  avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
};

// ----------------------------------------------------------------------
// Mock AI Chat Responses with Citations and Evidence
// ----------------------------------------------------------------------
export function getMockAiChatReply(
  userQuery: string,
  provider: "groq" | "ollama" = "groq",
  model?: string
): AiChatResponse {
  const queryLower = userQuery.toLowerCase();

  if (queryLower.includes("crescent") || queryLower.includes("spike") || queryLower.includes("pm2.5")) {
    return {
      reply: `### Air Quality Diagnostic: Crescent Institute Station

Based on real-time and telemetry telemetry at the **B.S. Abdur Rahman Crescent Institute Beacon** in Vandalur:

1. **Observed Particulate Surge**: PM2.5 elevated from a clean baseline of **11.2 µg/m³** to **78.5 µg/m³** during peak commuter hours.
2. **Co-Pollutant Profile**: High correlation with elevated **NO₂ (68.4 ppb)** and **CO (2.1 ppm)**, strongly pointing to diesel exhaust plumes from the adjacent Grand Southern Trunk (GST) Road rather than vegetative burning.
3. **Meteorological Factor**: Surface wind from the East-Northeast at 12.8 km/h creates a direct downwind path from the highway bottleneck directly across the university's western quadrangle.

**Recommended Action**:
- Maintain mechanical ventilation with MERV-13/HEPA filtration in classrooms facing GST Road.
- Restrict outdoor physical education activities until the dispersion phase stabilizes (projected by 11:30 AM).`,
      provider_used: provider,
      model_used: model || (provider === "groq" ? "llama-3.3-70b-versatile" : "llama-3-8b-instruct"),
      citations: [
        {
          title: "CPCB National Ambient Air Quality Standards (NAAQS) Schedule VII",
          url: "https://cpcb.nic.in/air-quality-standard/",
          source_type: "rag_document",
          snippet: "Prescribes 24-hour limit for PM2.5 at 60 µg/m³ and NO2 at 80 µg/m³ in ambient air.",
        },
        {
          title: "Tamil Nadu Pollution Control Board — Chennai Ambient Monitoring Network",
          url: "https://tnpcb.gov.in/air-quality.php",
          source_type: "web_search",
          snippet: "Official regional air monitor data for Chengalpattu / South Chennai transit nodes.",
        },
      ],
      evidence: [
        {
          type: "telemetry",
          label: "PM2.5 / NO2 co-variance index: r = 0.89",
          confidence: 0.94,
        },
        {
          type: "spatial_correlation",
          label: "Downwind gradient verified against Kilambakkam KCBT station",
          confidence: 0.91,
        },
      ],
    };
  }

  // Generic environmental answer
  return {
    reply: `### STREETAIR Environmental Analysis

Regarding your inquiry: **"${userQuery}"**

Our spatial-temporal neural framework correlates sensor signals from the Vandalur monitoring beacon with regional meteorological models and CPCB standards:

- **Ambient Status**: Currently operating under scenario parameters (**${SCENARIO_DEFINITIONS[activeScenarioKey].name}**).
- **Dominant Parameter**: ${SCENARIO_DEFINITIONS[activeScenarioKey].dominantPollutant} with an expected AQI range of **${SCENARIO_DEFINITIONS[activeScenarioKey].expectedAQIRange[0]} - ${SCENARIO_DEFINITIONS[activeScenarioKey].expectedAQIRange[1]}**.
- **Real-World Context**: ${SCENARIO_DEFINITIONS[activeScenarioKey].realWorldAnalogy}

Feel free to ask for detailed historical comparisons, scenario simulations, or mitigation guidance!`,
    provider_used: provider,
    model_used: model || (provider === "groq" ? "llama-3.3-70b-versatile" : "llama-3-8b-instruct"),
    citations: [
      {
        title: "STREETAIR Verified Sensor Telemetry Archive",
        url: "#",
        source_type: "telemetry_archive",
        snippet: "Continuous time-series database stored in Firestore / TimescaleDB.",
      },
      {
        title: "World Health Organization (WHO) Global Air Quality Guidelines 2021",
        url: "https://www.who.int/publications/i/item/9789240034228",
        source_type: "rag_document",
        snippet: "Key guidelines recommending annual PM2.5 mean under 5 µg/m³ and 24-hr under 15 µg/m³.",
      },
    ],
    evidence: [
      {
        type: "historical_baseline",
        label: "30-Day moving average comparison for Vandalur corridor",
        confidence: 0.88,
      },
    ],
  };
}

