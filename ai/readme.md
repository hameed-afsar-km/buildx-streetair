# STREETAIR — AI, ML & Data Intelligence Service

> **Core Workflow:** MONITOR → DETECT → INVESTIGATE → ANALYSE → PREDICT → RESPOND  
> Production-ready, independently deployable FastAPI microservice for environmental monitoring intelligence.

---

## 1. System Overview

The STREETAIR AI Service powers the platform's environmental intelligence:
- **Provider Abstraction:** Groq Cloud (`llama-3.3-70b-versatile`) and Ollama local (`llama3.2:3b`) with deterministic fallback and provenance reporting.
- **Evidence-Grounded Conversational AI:** Intent routing with internal station context, RAG document citations, and real-time Tavily search.
- **Pollutant Forecasting:** Baseline statistical forecasting with chronological holdout evaluation and uncertainty intervals.
- **Anomaly Detection:** Multi-variable hybrid Z-score and IQR outlier detection with sensor flatline diagnosis.
- **Pollution Detective:** Evidence-first incident investigation correlating station telemetry, reference stations, and community reports.
- **What-If City Simulator:** Deterministic mathematical scenario models for traffic curbs, dust suppression, and open burning bans.
- **Spatial Hotspot Analysis:** Haversine density clustering with station density safeguards.
- **Community Report Classification:** Citizen complaint categorization with duplicate detection candidates.
- **CPCB NAQI Standard:** Rigorous Indian National Air Quality Index sub-index and breakpoint calculations.

---

## 2. Directory Structure

```
buildx-streetair/ai/
├── app/
│   ├── main.py                     # FastAPI application factory & router registration
│   ├── core/                       # Config, structured logging, s2s security, errors
│   ├── api/internal/               # Internal authenticated API endpoints
│   ├── schemas/                    # Pydantic v2 request/response schemas
│   ├── providers/                  # Groq, Ollama, and ProviderManager
│   ├── orchestration/              # Chat orchestrator, intent router, tools, validator
│   ├── rag/                        # Ingestion, chunking, embeddings, vector store, retriever
│   ├── search/                     # Tavily client and authoritative web research
│   ├── ml/                         # Forecasting, anomaly, hotspot, reports, scenarios, investigation
│   ├── analytics/                  # Descriptive stats, trends, comparisons, correlations
│   └── data/                       # Contracts, provenance, CPCB AQI calculator
├── docs/
│   ├── AI_API_CONTRACT.md          # Authoritative backend integration contract
│   └── MODEL_DOCUMENTATION.md      # Algorithm descriptions and limitations
├── tests/                          # Comprehensive pytest test suite
├── pyproject.toml                  # Project dependencies & build config
└── .env.example                    # Environment variable template
```

---

## 3. Getting Started

### 3.1. Requirements
- Python 3.11 or higher (Python 3.13 supported)
- Optional: Local Ollama instance (if testing local offline inference)

### 3.2. Setup Virtual Environment
```bash
cd "buildx-streetair/ai"

# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows (PowerShell):
.\.venv\Scripts\Activate.ps1
# Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -e .
# Or install development / testing tools:
pip install -e ".[dev]"
```

### 3.3. Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Edit `.env` to configure your credentials:
- `AI_INTERNAL_API_KEY`: Strong random secret shared with the central backend.
- `AI_DEFAULT_PROVIDER`: `groq` or `ollama`.
- `GROQ_API_KEY`: Your Groq Cloud API key (if using Groq).
- `TAVILY_API_KEY`: Your Tavily API key (if using web search).
- `OLLAMA_BASE_URL`: `http://localhost:11434` (if using local Ollama).

---

## 4. Running the Service

### Development Mode
```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

### Production Mode
```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8001 --workers 4
```

### Interactive API Documentation
Once running, view internal OpenAPI documentation at:  
👉 `http://localhost:8001/internal/docs`

---

## 5. Running Tests

Run the test suite with pytest:
```bash
pytest
```

Run with coverage report:
```bash
pytest --cov=app --cov-report=term-missing
```

---

## 6. Backend Integration Guide

The central backend authenticates via Bearer token:
```http
POST /internal/v1/chat HTTP/1.1
Host: localhost:8001
Authorization: Bearer <AI_INTERNAL_API_KEY>
Content-Type: application/json
```

Detailed payloads and responses are documented in [docs/AI_API_CONTRACT.md](docs/AI_API_CONTRACT.md).

---

## 7. Non-Negotiable Data Rules

1. **Provenance First:** Every observation is explicitly tagged `simulated` or `hardware`. Simulated readings are never presented as verified real-world measurements.
2. **Uncalibrated MQ-135:** Raw ADC values from MQ-135 are sensor readings, **not** gas concentrations or AQI inputs.
3. **No Hallucinated Math:** Scenarios and forecasts use deterministic mathematical and statistical algorithms, never unconstrained LLM arithmetic.
4. **CPCB AQI Standard:** Complies with India's Central Pollution Control Board NAQI standards.
