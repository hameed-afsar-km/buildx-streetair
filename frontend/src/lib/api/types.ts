export * from "../types";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  metadata?: {
    timestamp: string;
    version: string;
    request_id?: string;
  };
}

export interface AiChatRequest {
  messages: { role: "user" | "assistant" | "system"; content: string }[];
  provider?: "groq" | "ollama";
  model?: string;
  context?: {
    station_id?: string;
    include_rag?: boolean;
    include_web_search?: boolean;
  };
}

export interface AiChatResponse {
  reply: string;
  provider_used: "groq" | "ollama";
  model_used: string;
  citations: {
    title: string;
    url: string;
    source_type: "rag_document" | "web_search" | "telemetry_archive";
    snippet?: string;
    published_date?: string;
  }[];
  evidence: {
    type: "telemetry" | "spatial_correlation" | "historical_baseline" | "external_advisory";
    label: string;
    confidence: number;
  }[];
}

