/**
 * SAHAY Frontend API Client
 * Centralized, typed HTTP client communicating with FastAPI backend.
 */

import {
  HealthResponse,
  ApiError,
  User,
  AuthToken,
  BusinessProfile,
  Scheme,
  EligibilitySummaryResponse,
  ApplicationResponse,
  UserDocumentResponse,
  DataSharingConsentResponse,
  EmiCalculationResult,
  PricingCalculationResult,
  CashFlowCalculationResult,
  AdminStats,
  AuditLogItem,
  ChatResponse,
  CourseResponse,
  LessonResponse,
  QuizSubmissionResponse,
  FinancialProfileBase,
  FinancialProfileResponse,
  MarketQuoteResponse,
  WatchlistItemResponse,
  PaperHoldingResponse,
  PaperPortfolioSummaryResponse,
} from "@/types";

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

// ==========================================
// Authentication APIs
// ==========================================

export async function authLogin(phone: string, password?: string, otp?: string): Promise<AuthToken> {
  const res = await fetchApi<AuthToken>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({ phone, password: password || "dev_pass", otp }),
  });
  if (typeof window !== "undefined" && res.access_token) {
    localStorage.setItem("sahay_access_token", res.access_token);
    localStorage.setItem("sahay_user", JSON.stringify(res.user));
  }
  return res;
}

export async function authRegister(userData: {
  phone: string;
  name: string;
  role?: string;
  language?: string;
  state?: string;
  district?: string;
}): Promise<AuthToken> {
  const res = await fetchApi<AuthToken>("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });
  if (typeof window !== "undefined" && res.access_token) {
    localStorage.setItem("sahay_access_token", res.access_token);
    localStorage.setItem("sahay_user", JSON.stringify(res.user));
  }
  return res;
}

export async function authMe(): Promise<User> {
  return fetchApi<User>("/api/v1/auth/me");
}

export function authLogout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("sahay_access_token");
    localStorage.removeItem("sahay_user");
  }
}

// ==========================================
// Business Profile APIs
// ==========================================

export async function getBusinessProfile(): Promise<BusinessProfile> {
  return fetchApi<BusinessProfile>("/api/v1/business-profile");
}

export async function updateBusinessProfile(
  data: Partial<BusinessProfile>
): Promise<BusinessProfile> {
  return fetchApi<BusinessProfile>("/api/v1/business-profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// ==========================================
// Government Schemes APIs
// ==========================================

export async function getSchemes(params?: {
  scheme_type?: string;
  state?: string;
  search?: string;
}): Promise<Scheme[]> {
  const searchParams = new URLSearchParams();
  if (params?.scheme_type && params.scheme_type !== "all") {
    searchParams.append("scheme_type", params.scheme_type);
  }
  if (params?.state && params.state !== "ALL") {
    searchParams.append("state", params.state);
  }
  if (params?.search) {
    searchParams.append("search", params.search);
  }
  const query = searchParams.toString() ? `?${searchParams.toString()}` : "";
  return fetchApi<Scheme[]>(`/api/v1/schemes${query}`);
}

export async function getSchemeById(schemeId: string): Promise<Scheme> {
  return fetchApi<Scheme>(`/api/v1/schemes/${schemeId}`);
}

export async function getSchemeBySlug(slug: string): Promise<Scheme> {
  return fetchApi<Scheme>(`/api/v1/schemes/slug/${slug}`);
}

// ==========================================
// Deterministic Eligibility APIs
// ==========================================

export async function checkEligibility(
  criteria: Record<string, unknown>
): Promise<EligibilitySummaryResponse> {
  return fetchApi<EligibilitySummaryResponse>("/api/v1/eligibility/check", {
    method: "POST",
    body: JSON.stringify(criteria),
  });
}

export async function getMyMatches(): Promise<EligibilitySummaryResponse> {
  return fetchApi<EligibilitySummaryResponse>("/api/v1/eligibility/my-matches");
}

// ==========================================
// Applications & Documents APIs
// ==========================================

export async function getApplications(): Promise<ApplicationResponse[]> {
  return fetchApi<ApplicationResponse[]>("/api/v1/applications");
}

export async function createApplication(schemeId: string, notes?: string): Promise<ApplicationResponse> {
  return fetchApi<ApplicationResponse>("/api/v1/applications", {
    method: "POST",
    body: JSON.stringify({ scheme_id: schemeId, notes: notes || "" }),
  });
}

export async function updateApplicationStatus(
  applicationId: string,
  status: string,
  notes?: string
): Promise<ApplicationResponse> {
  return fetchApi<ApplicationResponse>(`/api/v1/applications/${applicationId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, notes }),
  });
}

export async function grantConsent(
  applicationId: string,
  partnerName: string,
  sharedFields: string
): Promise<DataSharingConsentResponse> {
  return fetchApi<DataSharingConsentResponse>("/api/v1/applications/consent", {
    method: "POST",
    body: JSON.stringify({
      application_id: applicationId,
      partner_name: partnerName,
      shared_fields: sharedFields,
    }),
  });
}

export async function getUserDocuments(): Promise<UserDocumentResponse[]> {
  return fetchApi<UserDocumentResponse[]>("/api/v1/documents");
}

export async function recordDocumentUpload(data: {
  application_id?: string;
  document_type: string;
  file_name: string;
  file_size_bytes?: number;
}): Promise<UserDocumentResponse> {
  return fetchApi<UserDocumentResponse>("/api/v1/documents", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ==========================================
// Deterministic Business Advisor APIs
// ==========================================

export async function calculateEmi(data: {
  principal: number;
  annual_interest_rate: number;
  tenure_months: number;
}): Promise<EmiCalculationResult> {
  return fetchApi<EmiCalculationResult>("/api/v1/business/emi", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function calculatePricing(data: {
  unit_cost: number;
  target_margin_pct: number;
  packaging_logistics_cost?: number;
  fixed_overhead_monthly?: number;
}): Promise<PricingCalculationResult> {
  return fetchApi<PricingCalculationResult>("/api/v1/business/pricing", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function calculateCashFlow(data: {
  monthly_revenue: number;
  monthly_expense: number;
  existing_debt_emi?: number;
}): Promise<CashFlowCalculationResult> {
  return fetchApi<CashFlowCalculationResult>("/api/v1/business/cash-flow", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ==========================================
// Admin & Audit APIs
// ==========================================

export async function getAdminStats(): Promise<AdminStats> {
  return fetchApi<AdminStats>("/api/v1/admin/stats");
}

export async function getAdminAuditLogs(limit: number = 50): Promise<AuditLogItem[]> {
  return fetchApi<AuditLogItem[]>(`/api/v1/admin/audit-logs?limit=${limit}`);
}

// ==========================================
// Grounded AI Assistant (RAG) APIs
// ==========================================

export async function sendChatMessage(
  message: string,
  conversationId?: string,
  languagePreference: string = "en"
): Promise<ChatResponse> {
  return fetchApi<ChatResponse>("/api/v1/chat", {
    method: "POST",
    body: JSON.stringify({
      message,
      conversation_id: conversationId,
      language_preference: languagePreference,
    }),
  });
}

// ==========================================
// Stock Market Academy APIs
// ==========================================

export async function getAcademyCourses(): Promise<CourseResponse[]> {
  return fetchApi<CourseResponse[]>("/api/v1/academy/courses");
}

export async function getAcademyLessons(courseId: string): Promise<LessonResponse[]> {
  return fetchApi<LessonResponse[]>(`/api/v1/academy/courses/${courseId}/lessons`);
}

export async function submitQuizAnswer(
  lessonId: string,
  selectedOptionIndex: number
): Promise<QuizSubmissionResponse> {
  return fetchApi<QuizSubmissionResponse>("/api/v1/academy/quiz", {
    method: "POST",
    body: JSON.stringify({
      lesson_id: lessonId,
      selected_option_index: selectedOptionIndex,
    }),
  });
}

// ==========================================
// Investment Profile & Market Data APIs
// ==========================================

export async function getInvestmentProfile(): Promise<FinancialProfileResponse> {
  return fetchApi<FinancialProfileResponse>("/api/v1/investment/profile");
}

export async function updateInvestmentProfile(
  data: Partial<FinancialProfileBase>
): Promise<FinancialProfileResponse> {
  return fetchApi<FinancialProfileResponse>("/api/v1/investment/profile", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getMarketBenchmarks(): Promise<MarketQuoteResponse[]> {
  return fetchApi<MarketQuoteResponse[]>("/api/v1/investment/benchmarks");
}

// ==========================================
// Watchlist & Paper Portfolio APIs
// ==========================================

export async function getWatchlist(): Promise<WatchlistItemResponse[]> {
  return fetchApi<WatchlistItemResponse[]>("/api/v1/portfolio/watchlist");
}

export async function addToWatchlist(
  ticker: string,
  name?: string,
  assetClass: string = "etf",
  exchange: string = "NSE"
): Promise<WatchlistItemResponse> {
  return fetchApi<WatchlistItemResponse>("/api/v1/portfolio/watchlist", {
    method: "POST",
    body: JSON.stringify({
      ticker,
      name,
      asset_class: assetClass,
      exchange,
    }),
  });
}

export async function removeFromWatchlist(ticker: string): Promise<void> {
  await fetchApi<void>(`/api/v1/portfolio/watchlist/${ticker}`, {
    method: "DELETE",
  });
}

export async function getPaperPortfolio(): Promise<PaperPortfolioSummaryResponse> {
  return fetchApi<PaperPortfolioSummaryResponse>("/api/v1/portfolio");
}

export async function executePaperOrder(
  ticker: string,
  transactionType: "BUY" | "SELL",
  quantity: number
): Promise<PaperHoldingResponse> {
  return fetchApi<PaperHoldingResponse>("/api/v1/portfolio/order", {
    method: "POST",
    body: JSON.stringify({
      ticker,
      transaction_type: transactionType,
      quantity,
    }),
  });
}

export { API_BASE_URL };

