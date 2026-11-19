/**
 * SAHAY Verification & Provenance Logic
 * Strict implementation of Checkpoint 3 rules:
 * - 'verified': Confirmed official source and verified within maxAgeDays (default 180 days).
 * - 'outdated': Checked longer ago than maxAgeDays or flagged outdated.
 * - 'unverified': Missing official portal URL, missing verification date, or flagged unverified.
 */

export type VerificationState = "verified" | "outdated" | "unverified";

export const VERIFICATION_FRESHNESS_LIMIT_DAYS = 180;

export function getVerificationState(
  status?: string | null,
  lastVerifiedAt?: string | null,
  officialUrl?: string | null,
  maxAgeDays: number = VERIFICATION_FRESHNESS_LIMIT_DAYS,
  referenceTimestamp?: number | null
): VerificationState {
  if (status === "unverified" || !officialUrl || !lastVerifiedAt) {
    return "unverified";
  }
  if (status === "outdated") {
    return "outdated";
  }

  try {
    const dateStr = lastVerifiedAt.slice(0, 10);
    const verifiedTime = new Date(dateStr).getTime();
    if (isNaN(verifiedTime)) return "unverified";

    // If referenceTimestamp is explicitly null, defer age calculation (used during SSR prerender)
    if (referenceTimestamp === null) {
      return "verified";
    }

    const now = referenceTimestamp ?? Date.now();
    const ageInDays = (now - verifiedTime) / (1000 * 60 * 60 * 24);
    if (ageInDays > maxAgeDays) {
      return "outdated";
    }
    return "verified";
  } catch {
    return "unverified";
  }
}
