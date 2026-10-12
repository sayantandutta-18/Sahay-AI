/**
 * SAHAY Frontend Types & Interfaces
 */

// Health & System
export interface DatabaseHealth {
  status: "connected" | "disconnected";
  url?: string;
  error?: string;
}

export interface HealthResponse {
  status: "healthy" | "degraded" | "unhealthy";
  project: string;
  version: string;
  environment: string;
  timestamp: string;
  database: DatabaseHealth;
  services: {
    redis_configured?: boolean;
    llm_provider?: string;
    [key: string]: unknown;
  };
}

export interface ApiError {
  message: string;
  statusCode?: number;
  details?: unknown;
}

// User & Auth
export interface User {
  id: string;
  phone: string;
  name: string;
  role: "entrepreneur" | "admin" | "lender" | string;
  language: "en" | "hi" | "bn" | string;
  state: string;
  district: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
  user: User;
}

// Business Profiles
export interface BusinessProfile {
  id: string;
  user_id: string;
  business_name: string;
  business_type: "manufacturing" | "services" | "trading" | "agriculture_allied" | string;
  category: "micro" | "small" | "medium" | string;
  annual_turnover: number;
  monthly_revenue: number;
  monthly_expense: number;
  existing_loans: number;
  gender: "female" | "male" | "other" | "unspecified" | string;
  caste_category?: "general" | "obc" | "sc" | "st" | "minority" | string;
  has_udyam: boolean;
  has_gst: boolean;
  has_pan: boolean;
  has_bank_account: boolean;
  months_in_operation?: number;
  completion_percentage: number;
  created_at?: string;
  updated_at?: string;
}

// Schemes & Rules
export interface SchemeDocumentRequirement {
  id: string;
  scheme_id?: string;
  document_type: string;
  title: string;
  description: string;
  mandatory: boolean;
  how_to_get_url?: string;
}

export interface SchemeRule {
  id: string;
  scheme_id: string;
  field: string;
  operator: string;
  value: string;
  weight: number;
  explanation: string;
  is_hard_rule: boolean;
  rule_version: string;
  is_active: boolean;
}

export interface Scheme {
  id: string;
  name: string;
  slug: string;
  provider: string;
  scheme_type: "subsidy" | "loan" | "grant" | "training" | "equity_support" | string;
  short_description: string;
  detailed_benefits: string;
  max_amount: number;
  interest_subsidy_pct: number;
  states_served: string;
  target_sectors: string;
  official_url: string;
  last_verified_at: string;
  is_active?: boolean;
  documents: SchemeDocumentRequirement[];
  rules: SchemeRule[];
}

// Eligibility
export interface SchemeMatchResult {
  scheme_id: string;
  scheme_name: string;
  slug: string;
  provider: string;
  scheme_type: string;
  max_amount: number;
  official_url: string;
  is_eligible: boolean;
  match_score: number; // 0 to 100
  passed_hard_rules: string[];
  failed_hard_rules: string[];
  soft_rule_breakdown: { rule: string; points: number; awarded: boolean }[];
  missing_requirements: string[];
  near_miss_unlock_path?: string | null;
  rule_version: string;
}

export interface EligibilitySummaryResponse {
  evaluated_schemes_count: number;
  eligible_count: number;
  near_match_count: number;
  evaluated_at: string;
  rule_authority: string;
  matches: SchemeMatchResult[];
}

// Applications, Documents & Consents
export interface DataSharingConsentResponse {
  id: string;
  user_id: string;
  application_id: string;
  partner_name: string;
  shared_fields: string;
  is_revoked: boolean;
  granted_at: string;
  revoked_at?: string | null;
}

export interface UserDocumentResponse {
  id: string;
  user_id: string;
  application_id?: string | null;
  document_type: string;
  file_name: string;
  file_size_bytes: number;
  storage_path: string;
  verification_status: "pending" | "verified" | "rejected" | string;
  rejection_reason: string;
  expiry_date?: string | null;
  created_at: string;
}

export interface ApplicationResponse {
  id: string;
  user_id: string;
  scheme_id: string;
  scheme_name?: string | null;
  status: "not_started" | "in_progress" | "submitted" | "under_review" | "approved" | "rejected" | string;
  progress_percentage: number;
  lender_consent_granted: boolean;
  consent_granted_at?: string | null;
  submitted_at?: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
  documents: UserDocumentResponse[];
  consents: DataSharingConsentResponse[];
}

// Business Advisor Results
export interface EmiCalculationResult {
  principal: number;
  annual_interest_rate: number;
  tenure_months: number;
  monthly_emi: number;
  total_interest: number;
  total_payment: number;
  principal_percentage: number;
  interest_percentage: number;
  authority: string;
}

export interface PricingCalculationResult {
  unit_total_cost: number;
  suggested_selling_price: number;
  gross_profit_per_unit: number;
  markup_percentage: number;
  target_margin_percentage: number;
  monthly_break_even_units: number;
  authority: string;
}

export interface CashFlowCalculationResult {
  monthly_revenue: number;
  monthly_expense: number;
  existing_debt_emi: number;
  net_operating_income: number;
  net_surplus_after_debt: number;
  annual_projected_surplus: number;
  operating_margin_percentage: number;
  debt_service_coverage_ratio: number;
  business_health_grade: string;
  recommendation: string;
  authority: string;
}

// Admin & Audit
export interface AuditLogItem {
  id: string;
  user_id: string;
  user_email: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details: string;
  ip_address: string;
  created_at: string;
}

export interface AdminStats {
  total_users: number;
  total_schemes: number;
  total_applications: number;
  total_verified_documents: number;
  total_audit_events: number;
  timestamp: string;
}
