# STREETAIR — Backend to AI Engine Service Contract

This document defines the interface boundary between the STREETAIR public FastAPI backend and the private, internal AI/ML Service.

---

## 1. Architectural Boundaries

- **Separation of Concerns**: The AI Engine owns LLM provider abstractions (Groq, Ollama), Tavily search integration, RAG document indexing, and machine learning inference models.
- **Security**: The AI Engine runs in a private network or protected endpoint.
  - The frontend NEVER calls the AI engine directly.
  - Provider credentials (Groq API keys, Tavily keys) NEVER leave the AI Engine.
  - The backend authenticates to the AI Engine via `Authorization: Bearer <AI_ENGINE_SERVICE_TOKEN>`.

---

## 2. Internal Endpoints Expected by Backend

### 1. `POST /internal/v1/chat`
Handles conversational reasoning and environmental queries.
- **Request**:
  ```json
  {
    "message": "Why is PM2.5 high at Crescent station today?",
    "provider": "groq | ollama",
    "conversation_id": "uuid",
    "history": [
      {"role": "user", "content": "..."},
      {"role": "assistant", "content": "..."}
    ],
    "station_context": {
      "station_id": "ST-CRESCENT-01"
    },
    "request_id": "uuid"
  }
  ```
- **Response**:
  ```json
  {
    "message_id": "uuid",
    "content": "Analysis based on historical readings and traffic patterns...",
    "provider": "groq",
    "model": "llama-3.3-70b-versatile",
    "citations": [
      {
        "title": "CPCB Air Quality Guidelines",
        "url": "https://cpcb.nic.in/...",
        "date": "2024-01-15",
        "source_type": "rag"
      }
    ]
  }
  ```

### 2. `POST /internal/v1/forecast`
Time-series forecasting endpoint (ARIMA / Prophet / ML).
- **Request**:
  ```json
  {
    "station_id": "ST-CRESCENT-01",
    "pollutant": "pm25",
    "readings_window": [...],
    "horizon_hours": 24,
    "request_id": "uuid"
  }
  ```
- **Response**:
  ```json
  {
    "model_version": "streetair-arima-v1",
    "predicted_values": [
      {"offset_hours": 1, "predicted_value": 32.5, "uncertainty": 4.1},
      {"offset_hours": 2, "predicted_value": 35.8, "uncertainty": 5.2}
    ]
  }
  ```

### 3. `POST /internal/v1/anomaly-detection`
Evaluates a bounded reading window for statistical anomalies.
- **Request**:
  ```json
  {
    "station_id": "ST-CRESCENT-01",
    "readings": [...],
    "request_id": "uuid"
  }
  ```
- **Response**:
  ```json
  {
    "anomaly_detected": true,
    "confidence": 0.88,
    "explanation": "Unusual sudden rise in coarse particulate ratio inconsistent with diurnal curve."
  }
  ```

### 4. `POST /internal/v1/report-classification`
Classifies citizen-submitted pollution reports and estimates severity.
- **Request**:
  ```json
  {
    "description": "Black smoke coming from waste pile behind the building",
    "category": "waste_burning",
    "request_id": "uuid"
  }
  ```
- **Response**:
  ```json
  {
    "predicted_category": "waste_burning",
    "suggested_severity": "high",
    "tags": ["smoke", "open_burning", "biomass"]
  }
  ```

