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

export interface ApplicationChecklistItem {
  id: string;
  application_id: string;
  requirement_id?: string | null;
  title: string;
  description: string;
  mandatory: boolean;
  is_completed: boolean;
  vault_document_id?: string | null;
  notes?: string | null;
  completed_at?: string | null;
}

export interface ApplicationStatusHistory {
  id: string;
  application_id: string;
  previous_status?: string | null;
  new_status: string;
  actor_id?: string | null;
  actor_role: string;
  notes?: string | null;
  created_at: string;
}

export interface ApplicationResponse {
  id: string;
  user_id: string;
  scheme_id: string;
  scheme_name?: string | null;
  status: "not_started" | "in_progress" | "documents_needed" | "submitted" | "under_review" | "approved" | "rejected" | string;
  progress_percentage: number;
  lender_consent_granted: boolean;
  consent_granted_at?: string | null;
  submitted_at?: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
  documents: UserDocumentResponse[];
  consents: DataSharingConsentResponse[];
  checklist_items?: ApplicationChecklistItem[];
}

// Phase 2 Financial Intelligence Types
export interface FinancialHealthSummary {
  monthly_income: number;
  monthly_expenses: number;
  monthly_debt_emi: number;
  net_cash_flow: number;
  debt_to_income_ratio: number;
  savings_rate_pct: number;
  emergency_fund_months: number;
  health_grade: "A" | "B" | "C" | "D" | string;
  key_strengths: string[];
  risk_flags: string[];
}

export interface EmergencyFundAnalysis {
  essential_monthly_expenses: number;
  liquid_savings: number;
  current_runway_months: number;
  recommended_target_amount: number;
  shortfall_or_surplus: number;
  status: "critical" | "warning" | "adequate" | "robust" | string;
  actionable_plan: string[];
}

export interface MonthTrajectory {
  month: number;
  starting_balance: number;
  income: number;
  expenses: number;
  ending_balance: number;
  runway_status: "solvent" | "exhausted" | string;
}

export interface IncomeLossSimulationResult {
  income_reduction_pct: number;
  months_until_exhaustion: number;
  monthly_burn_rate: number;
  austere_monthly_expenses: number;
  runway_with_austerity_months: number;
  trajectory: MonthTrajectory[];
}

export interface WhatIfSimulationResult {
  scenario_type: "new_loan" | "revenue_shock" | "expense_inflation" | "custom" | string;
  scenario_description: string;
  baseline: {
    net_cash_flow: number;
    debt_to_income_ratio: number;
    runway_months: number;
    risk_score: number;
  };
  simulated: {
    net_cash_flow: number;
    debt_to_income_ratio: number;
    runway_months: number;
    risk_score: number;
  };
  deltas: {
    cash_flow_delta: number;
    dti_delta: number;
    risk_delta: number;
  };
  recommendation: string;
  verdict: "safe" | "caution" | "critical" | string;
}

export interface CreditFactor {
  factor: string;
  weight_pct: number;
  status: "excellent" | "good" | "needs_attention" | "critical" | string;
  impact: string;
  recommendation: string;
}

export interface CreditScoreExplainerResult {
  estimated_score: number;
  score_band: "Excellent" | "Good" | "Fair" | "Needs Improvement" | string;
  factors: CreditFactor[];
  compliance_disclaimer: string;
}

export interface RiskDimension {
  dimension: string;
  score: number;
  weight: number;
  assessment: string;
}

export interface FinancialRiskIndicatorResult {
  overall_risk_score: number;
  risk_level: "Low" | "Moderate" | "Elevated" | "High" | string;
  dimensions: RiskDimension[];
  top_vulnerabilities: string[];
  mitigation_steps: string[];
  compliance_disclaimer: string;
}

export interface FraudAlert {
  id: string;
  severity: "low" | "medium" | "high" | string;
  title: string;
  description: string;
  suggested_action: string;
}

export interface DigitalTwinWorkflowResult {
  analysis: FinancialHealthSummary;
  emergency_fund: EmergencyFundAnalysis;
  risk_indicator: FinancialRiskIndicatorResult;
  simulation: WhatIfSimulationResult;
  decision: {
    action: "PROCEED" | "PROCEED_WITH_CAUTION" | "DO_NOT_PROCEED" | string;
    summary: string;
    checklist: string[];
  };
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

// Grounded AI Assistant & RAG
export interface ChatSourceCitation {
  title: string;
  url?: string | null;
  provider?: string | null;
  last_verified_at?: string | null;
}

export interface ChatRequest {
  message: string;
  conversation_id?: string | null;
  language_preference?: string;
}

export interface ChatResponse {
  reply: string;
  intent_detected: string;
  sources: ChatSourceCitation[];
  deterministic_action_taken?: string | null;
  confidence_level: "high" | "medium" | "uncertain" | string;
  compliance_disclaimer: string;
}

// Stock Market Academy
export interface LessonResponse {
  id: string;
  course_id: string;
  title: string;
  slug: string;
  content: string;
  quiz_question: string;
  quiz_options: string[];
  order_index: number;
  is_completed: boolean;
  score: number;
}

export interface CourseResponse {
  id: string;
  title: string;
  slug: string;
  level: "beginner" | "intermediate" | "advanced" | string;
  description: string;
  order_index: number;
  lessons_count: number;
  completed_lessons_count: number;
  is_locked: boolean;
}

export interface QuizSubmissionResponse {
  lesson_id: string;
  is_correct: boolean;
  correct_option_index: number;
  explanation: string;
  score_awarded: number;
}

// Investment Risk Profile
export interface FinancialProfileBase {
  investment_goal: string;
  monthly_investible_surplus: number;
  time_horizon_years: number;
  risk_tolerance: "conservative" | "moderate" | "aggressive" | "capital_preservation" | string;
  market_experience: "beginner" | "intermediate" | "advanced" | string;
  liquidity_needs: "high" | "medium" | "low" | string;
  disclosures_acknowledged?: boolean;
}

export interface FinancialProfileResponse extends FinancialProfileBase {
  id: string;
  user_id: string;
  calculated_risk_score: number;
  risk_category: string;
  created_at: string;
  updated_at: string;
}

// Market Data & Paper Portfolio
export interface MarketQuoteResponse {
  ticker: string;
  name: string;
  current_price: number;
  currency: string;
  exchange: string;
  asset_class: string;
  last_updated_at: string;
  is_stale: boolean;
  provider: string;
}

export interface WatchlistItemResponse {
  id: string;
  ticker: string;
  name: string;
  asset_class: string;
  exchange: string;
  current_price: number;
  created_at: string;
}

export interface PaperHoldingResponse {
  id: string;
  ticker: string;
  name: string;
  asset_class: string;
  quantity: number;
  average_buy_price: number;
  current_price: number;
  total_invested: number;
  current_value: number;
  unrealized_pnl: number;
  pnl_percentage: number;
  allocation_percentage: number;
}

export interface PaperPortfolioSummaryResponse {
  total_invested: number;
  current_value: number;
  total_pnl: number;
  pnl_percentage: number;
  holdings_count: number;
  as_of_timestamp: string;
  holdings: PaperHoldingResponse[];
  compliance_notice: string;
}

