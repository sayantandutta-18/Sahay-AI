/**
 * SAHAY Verification Badge Unit Test (Checkpoint 3)
 * Asserts the three-state verification logic (verified, outdated, unverified)
 * across source URLs, verification ages (>180 days), and status flags.
 */

import { getVerificationState } from "../src/lib/verification.ts";

console.log("=== SAHAY CHECKPOINT 3 VERIFICATION BADGE AUDIT ===");

const now = Date.now();
const oneMonthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
const sevenMonthsAgo = new Date(now - 210 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

// Test Case 1: Verified (Valid official URL and verified within 180 days)
const state1 = getVerificationState("verified", oneMonthAgo, "https://msme.gov.in");
if (state1 !== "verified") {
  console.error(`FAIL: Expected 'verified', got '${state1}'`);
  process.exit(1);
}
console.log("PASS: Fresh official scheme classified as 'verified'.");

// Test Case 2: Outdated (Verified date > 180 days ago)
const state2 = getVerificationState("verified", sevenMonthsAgo, "https://msme.gov.in");
if (state2 !== "outdated") {
  console.error(`FAIL: Expected 'outdated', got '${state2}'`);
  process.exit(1);
}
console.log("PASS: Scheme verified > 180 days ago classified as 'outdated'.");

// Test Case 3: Explicit outdated status
const state3 = getVerificationState("outdated", oneMonthAgo, "https://msme.gov.in");
if (state3 !== "outdated") {
  console.error(`FAIL: Expected 'outdated', got '${state3}'`);
  process.exit(1);
}
console.log("PASS: Explicit status 'outdated' respected.");

// Test Case 4: Unverified (Missing official URL)
const state4 = getVerificationState("verified", oneMonthAgo, null);
if (state4 !== "unverified") {
  console.error(`FAIL: Expected 'unverified', got '${state4}'`);
  process.exit(1);
}
console.log("PASS: Missing official source classified as 'unverified'.");

// Test Case 5: Unverified (Missing verification date)
const state5 = getVerificationState("verified", null, "https://msme.gov.in");
if (state5 !== "unverified") {
  console.error(`FAIL: Expected 'unverified', got '${state5}'`);
  process.exit(1);
}
console.log("PASS: Missing verification date classified as 'unverified'.");

// Test Case 6: Explicit unverified status
const state6 = getVerificationState("unverified", oneMonthAgo, "https://msme.gov.in");
if (state6 !== "unverified") {
  console.error(`FAIL: Expected 'unverified', got '${state6}'`);
  process.exit(1);
}
console.log("PASS: Explicit status 'unverified' respected.");

console.log("ALL CHECKPOINT 3 VERIFICATION LOGIC TESTS PASSED!");
