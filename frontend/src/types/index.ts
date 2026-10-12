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

// User & Profiles
export interface User {
  id: string;
  phone: string;
  name: string;
  role: "entrepreneur" | "admin" | "lender";
  language: "en" | "hi" | "bn";
  state: string;
  district: string;
  createdAt: string;
}

export interface BusinessProfile {
  id: string;
  userId: string;
  businessName: string;
  businessType: "manufacturing" | "services" | "trading" | "agriculture_allied";
  category: "micro" | "small" | "medium";
  annualTurnover: number;
  monthlyRevenue: number;
  monthlyExpense: number;
  existingLoans: number;
  gender: "female" | "male" | "other";
  casteCategory?: "general" | "obc" | "sc" | "st" | "minority";
  hasUdyam: boolean;
  hasGst: boolean;
  hasPan: boolean;
  hasBankAccount: boolean;
  completionPercentage: number;
}

// Schemes & Eligibility
export interface SchemeDocumentRequirement {
  id: string;
  documentType: string;
  title: string;
  description: string;
  mandatory: boolean;
  howToGetUrl?: string;
}

export interface Scheme {
  id: string;
  name: string;
  slug: string;
  provider: string; // e.g., "Ministry of MSME", "Govt of West Bengal"
  type: "subsidy" | "loan" | "grant" | "training" | "equity_support";
  shortDescription: string;
  detailedBenefits: string;
  maxAmount?: number;
  interestSubsidyPct?: number;
  statesServed: string[]; // ["ALL"] or specific states
  targetSectors: string[];
  officialUrl: string;
  lastVerifiedAt: string;
  documents: SchemeDocumentRequirement[];
}

export interface EligibilityResult {
  schemeId: string;
  schemeName: string;
  isEligible: boolean;
  matchScore: number; // 0 to 100
  passedHardRules: string[];
  failedHardRules: string[];
  softRulePoints: { rule: string; points: number }[];
  missingRequirements: string[];
  nearMissUnlockPath?: string;
  ruleVersion: string;
}

// Applications & Documents
export type ApplicationStatus =
  | "not_started"
  | "in_progress"
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected";

export interface ApplicationRecord {
  id: string;
  schemeId: string;
  schemeName: string;
  status: ApplicationStatus;
  progressPercentage: number;
  submittedAt?: string;
  lastUpdatedAt: string;
  notes?: string;
}

export interface UserDocument {
  id: string;
  userId: string;
  documentType: string;
  fileName: string;
  verified: boolean;
  uploadedAt: string;
  expiryDate?: string;
}
