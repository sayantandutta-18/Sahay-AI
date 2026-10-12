/**
 * SAHAY Frontend API Client
 * Centralized, typed HTTP client communicating with FastAPI backend.
 */

import { HealthResponse, ApiError } from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:8000";

interface FetchOptions extends RequestInit {
  timeoutMs?: number;
}

/**
 * Core typed fetch wrapper with timeouts and structured error handling.
 */
export async function fetchApi<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { timeoutMs = 8000, ...fetchOpts } = options;
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const headers = new Headers(fetchOpts.headers || {});
  if (!headers.has("Content-Type") && !(fetchOpts.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  // Attach token if present in localStorage in browser environment
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("sahay_access_token");
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  try {
    const response = await fetch(url, {
      ...fetchOpts,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorBody: unknown;
      try {
        errorBody = await response.json();
      } catch {
        errorBody = await response.text();
      }

      const apiError: ApiError = {
        message:
          typeof errorBody === "object" && errorBody !== null && "detail" in errorBody
            ? String((errorBody as { detail: unknown }).detail)
            : `HTTP error ${response.status}: ${response.statusText}`,
        statusCode: response.status,
        details: errorBody,
      };
      throw apiError;
    }

    return (await response.json()) as T;
  } catch (err: unknown) {
    clearTimeout(timeoutId);

    if (err && typeof err === "object" && "statusCode" in err) {
      throw err as ApiError;
    }

    if (err instanceof DOMException && err.name === "AbortError") {
      throw {
        message: `Request timed out after ${timeoutMs}ms`,
        statusCode: 408,
      } as ApiError;
    }

    throw {
      message: err instanceof Error ? err.message : "Failed to connect to Sahay API",
      statusCode: 0,
    } as ApiError;
  }
}

/**
 * Fetch system health status.
 */
export async function getHealth(): Promise<HealthResponse> {
  return fetchApi<HealthResponse>("/health");
}

/**
 * Diagnostics helper that measures latency and reports detailed connection state.
 */
export async function checkApiConnectivity(): Promise<{
  connected: boolean;
  latencyMs: number;
  data?: HealthResponse;
  error?: string;
}> {
  const start = performance.now();
  try {
    const data = await getHealth();
    const latencyMs = Math.round(performance.now() - start);
    return {
      connected: true,
      latencyMs,
      data,
    };
  } catch (err) {
    const latencyMs = Math.round(performance.now() - start);
    const errorMsg =
      err && typeof err === "object" && "message" in err
        ? String((err as { message: unknown }).message)
        : "Cannot reach backend server";
    return {
      connected: false,
      latencyMs,
      error: errorMsg,
    };
  }
}

export { API_BASE_URL };
