# STREETAIR — Model & Machine Learning Documentation
**Version:** 1.0.0  
**Date:** 04 November 2026

---

## 1. Overview and Core Philosophy

STREETAIR uses a tiered data-intelligence architecture:
1. **Deterministic Statistical & Mathematical Models:** Used wherever rigorous formulas exist (CPCB AQI breakpoints, What-If city intervention models, Haversine spatial clustering, holdout time-series evaluation). LLMs are strictly forbidden from generating or hallucinating numerical outcomes.
2. **Generative Language Models (Groq Cloud / Ollama Local):** Used solely for natural language explanation, contextual synthesis, structured intent routing, and report summary generation.
3. **Information Retrieval (RAG & Tavily Search):** Used for grounding conversations in verified CPCB regulations and current external environmental news.

---

## 2. Models & Algorithmic Modules

### 2.1. CPCB National AQI Calculator
- **Standard:** India Central Pollution Control Board (CPCB) NAQI 2014 Framework.
- **Pollutants Calculated:** PM2.5 and PM10 using 24-hour rolling averages.
- **Breakpoints:**
  - Good (0–50): PM2.5 0–30, PM10 0–50
  - Satisfactory (51–100): PM2.5 31–60, PM10 51–100
  - Moderate (101–200): PM2.5 61–90, PM10 101–250
  - Poor (201–300): PM2.5 91–120, PM10 251–350
  - Very Poor (301–400): PM2.5 121–250, PM10 351–430
  - Severe (401–500): PM2.5 >250, PM10 >430
- **Crucial Limitation:** The MQ-135 sensor produces raw analog voltage/ADC values. It is **never** used in AQI calculations as it lacks laboratory multi-gas calibration.

### 2.2. Time-Series Forecasting
- **Model:** `ExponentialDecayMeanRevertingBaseline` (v1.0.0).
- **Architecture:** Combines short-term autoregressive decay with rolling historical mean reversion and dynamic 95% confidence bounds ($1.96 \times \sigma \sqrt{1 + 0.05h}$).
- **Evaluation:** Evaluated on a chronological holdout split (last 20% of readings) computing MAE, RMSE, and MAPE. Future data is never shuffled into training.
- **Limitations:** Demonstrator baseline designed for simulated or hardware telemetry. Complex neural predictors (e.g. PatchTST, Informer) should only be trained when long multi-month empirical records become available.

### 2.3. Statistical Anomaly Detection
- **Technique:** Hybrid Z-Score ($|z| \ge 3.0$), Interquartile Range (IQR $1.5\times$), and Flatline Rule Monitor.
- **Data Quality Distinction:**
  - **Data-Quality Fault:** Consecutive identical readings ($\ge 5$ samples) or physically impossible values (e.g., negative PM, PM2.5 $> 1200$ µg/m³ with no change in other sensors).
  - **Environmental Pollution Signal:** High Z-score confirmed with cross-pollutant or regional elevation.

### 2.4. Spatial Hotspot Analysis
- **Technique:** Great-circle Haversine density clustering.
- **Safeguards:** When fewer than 3 geolocated stations exist in an airshed, a strict `low_station_coverage` flag is emitted. The system refuses to interpolate unmonitored neighborhoods from sparse points without explicit caveats.

### 2.5. What-If City Simulator
- **Technique:** Deterministic linear screening models based on published CPCB and TERI source apportionment studies.
- **Scenarios:**
  - `traffic_reduction`: Assumes vehicular fleet accounts for 28% of ambient PM2.5 and 20% of PM10.
  - `construction_dust_control`: Assumes construction and demolition dust accounts for 35% of coarse PM10.
  - `open_burning_reduction`: Assumes biomass and municipal solid waste open burning accounts for 22% of localized PM2.5.
  - `additional_monitoring_stations`: Geometric spatial density and coverage gain calculation.

### 2.6. Conversational AI Providers
- **Groq Cloud:** Fast cloud inference using `llama-3.3-70b-versatile`.
- **Ollama Local:** Offline/privacy inference using `llama3.2:3b`.
- **Provider Manager:** Transparent fallback with mandatory provider attribution metadata in all responses.

---

## 3. Data Provenance & Ethics
- Every observation is stamped with its source (`simulated` vs `hardware`).
- Synthetic demonstration data is never disguised as real physical monitoring.
- Correlations are documented with the explicit notice that *correlation does not imply causation*.

