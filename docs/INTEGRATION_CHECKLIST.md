# STREETAIR — Frontend Integration Checklist & Status Matrix

| Module / Domain | Endpoint / Contract | Frontend Type / Client | Mock Adapter | Live Backend Status | Notes |
|---|---|---|---|---|---|
| **Auth** | `GET /api/v1/auth/me` | `AuthUser` | ✅ Implemented | ⏳ Pending Backend Deploy | Firebase SDK client auth integrated with fallback mock profile |
| **Devices** | `GET /api/v1/devices` | `MonitoringStation[]` | ✅ Implemented | ⏳ Pending Backend Deploy | Includes Crescent Institute Beacon & regional network |
| **Device Details** | `GET /api/v1/devices/{id}` | `MonitoringStation` | ✅ Implemented | ⏳ Pending Backend Deploy | Complete hardware & firmware specs |
| **Latest Readings**| `GET /api/v1/readings/latest`| `AirReading` | ✅ Implemented | ⏳ Pending Backend Deploy | Real-time parameter extraction with 9 scenario states |
| **Reading History**| `GET /api/v1/readings/history`| `ReadingHistoryPoint[]` | ✅ Implemented | ⏳ Pending Backend Deploy | 24h & 7d granular resolutions |
| **Alerts** | `GET /api/v1/alerts` | `EnvironmentalAlert[]` | ✅ Implemented | ⏳ Pending Backend Deploy | Active threshold alerts & advisories |
| **Incidents** | `GET /api/v1/incidents` | `EnvironmentalIncident[]` | ✅ Implemented | ⏳ Pending Backend Deploy | Full incident lifecycle with root cause |
| **Reports (Create)**| `POST /api/v1/reports` | `CreateReportRequest` | ✅ Implemented | ⏳ Pending Backend Deploy | Citizen reporting with map pinning & image attachment |
| **Reports (List)** | `GET /api/v1/reports` | `CommunityReport[]` | ✅ Implemented | ⏳ Pending Backend Deploy | Filtered by user or admin moderation queue |
| **Analytics Overview**| `GET /api/v1/analytics/overview`| `AnalyticsOverview` | ✅ Implemented | ⏳ Pending Backend Deploy | Compliance %, aggregate AQI, station counts |
| **Analytics Trends**| `GET /api/v1/analytics/trends`| `AnalyticsTrend` | ✅ Implemented | ⏳ Pending Backend Deploy | Multi-pollutant time-series |
| **Hotspots** | `GET /api/v1/analytics/hotspots`| `HotspotCluster[]` | ✅ Implemented | ⏳ Pending Backend Deploy | Geo clusters around Vandalur/GST Road/Maraimalai |
| **Predictions** | `GET /api/v1/predictions` | `PredictionForecast` | ✅ Implemented | ⏳ Pending Backend Deploy | 72h Prophet/LSTM forecast with confidence band |
| **AI Chat** | `POST /api/v1/ai/chat` | `AiChatResponse` | ✅ Implemented | ⏳ Pending Backend Deploy | Groq (Llama 3.3 70B), Ollama (Llama 3), Tavily citations |
| **AI What-If** | `POST /api/v1/ai/scenarios`| `WhatIfScenarioResult` | ✅ Implemented | ⏳ Pending Backend Deploy | Policy simulation: traffic, green cover, industrial limits |
| **Subscriptions** | `GET /api/v1/plans` | `SubscriptionPlan[]` | ✅ Implemented | ⏳ Pending Backend Deploy | Starter, Professional, Enterprise |
| **Current Org Sub**| `GET /api/v1/subscriptions/current`| `OrgSubscription` | ✅ Implemented | ⏳ Pending Backend Deploy | Entitlements and billing info |
| **Quota & Usage** | `GET /api/v1/usage` | `UsageTelemetry` | ✅ Implemented | ⏳ Pending Backend Deploy | Real-time usage meters against tier limits |
| **Live WebSocket** | `WS /ws/v1/live` | `WebSocketMessage` | ✅ Implemented | ⏳ Pending Backend Deploy | Auto-reconnect with exponential backoff & jitter, scenario sync |

---

### Unresolved Integration Questions & Assumptions (Shared with Backend Team)
1. **ESP32 Keypad Scenario Payload**:
   - *Assumption*: When the ESP32 keypad triggers one of the 9 scenarios, the backend immediately ingests the scenario flag (`scenario_1_normal` through `scenario_9_extreme`), computes AQI according to the Indian National AQI (NAQI) standard, and broadcasts a `reading_update` over WebSocket.
2. **WebSocket Authentication**:
   - *Assumption*: Unauthenticated public visitors can connect to `/ws/v1/live` as read-only subscribers for public station `crescent-vandalur-01`. Authenticated tokens allow subscribing to private organisation stations.
3. **Image Upload for Community Reports**:
   - *Assumption*: The frontend uploads images to a signed GCS URL or backend multipart endpoint, returning an image URL passed into `POST /api/v1/reports`.

