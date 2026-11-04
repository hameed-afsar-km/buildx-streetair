import { ApiResponse } from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
const ENABLE_MOCK_FALLBACK = process.env.NEXT_PUBLIC_ENABLE_DEV_MOCK_FALLBACK !== "false";
const REQUEST_TIMEOUT_MS = 8000;

let currentAuthTokenProvider: (() => Promise<string | null>) | null = null;

export function registerAuthTokenProvider(provider: () => Promise<string | null>) {
  currentAuthTokenProvider = provider;
}

export class ApiError extends Error {
  code: string;
  status: number;
  details?: unknown;

  constructor(message: string, code = "API_ERROR", status = 500, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

interface RequestOptions extends RequestInit {
  timeoutMs?: number;
  skipAuth?: boolean;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {},
  fallbackFn?: () => T | Promise<T>
): Promise<T> {
  const url = `${BASE_URL.replace(/\/+$/, "")}/${endpoint.replace(/^\/+/, "")}`;
  const timeoutMs = options.timeoutMs || REQUEST_TIMEOUT_MS;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");

  // Attach Firebase ID token if available and not skipped
  if (!options.skipAuth && currentAuthTokenProvider) {
    try {
      const token = await currentAuthTokenProvider();
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    } catch (e) {
      console.warn("Could not retrieve auth token for request", e);
    }
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorData: ApiResponse<null> | null = null;
      try {
        errorData = await response.json();
      } catch {
        // Non-JSON error body
      }

      throw new ApiError(
        errorData?.error?.message || `HTTP request failed with status ${response.status}`,
        errorData?.error?.code || `HTTP_${response.status}`,
        response.status,
        errorData?.error?.details
      );
    }

    const json = (await response.json()) as ApiResponse<T> | T;
    // Check if wrapped in standard ApiResponse envelope
    if (json && typeof json === "object" && "data" in json && "success" in json) {
      const envelope = json as ApiResponse<T>;
      return envelope.data;
    }

    return json as T;
  } catch (err: unknown) {
    clearTimeout(timeoutId);

    // If mock fallback is enabled and we provided a fallback implementation, use it
    if (ENABLE_MOCK_FALLBACK && fallbackFn) {
      return await fallbackFn();
    }

    if (err instanceof ApiError) {
      throw err;
    }

    const message = err instanceof Error ? err.message : "Unknown network error";
    throw new ApiError(message, "NETWORK_ERROR", 0);
  }
}

