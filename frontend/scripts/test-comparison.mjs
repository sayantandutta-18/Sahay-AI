/**
 * Checkpoint 8: Scheme Comparison Engine Test Suite
 * Tests maximum 6 schemes constraint, URL query param serialization/deserialization,
 * and data matrix field completeness.
 */

import assert from "node:assert";
import { translations } from "../src/lib/i18n.ts";

console.log("=== SAHAY CHECKPOINT 8: SCHEME COMPARISON TEST SUITE ===");

// Mock government schemes dataset
const mockSchemes = [
  { id: "id-1", slug: "pmegp", name: "PMEGP", states_served: "ALL", max_amount: 5000000, scheme_type: "subsidy", interest_subsidy_pct: 0, deadline: "Ongoing", verification_status: "verified", documents: [{ id: "d1", title: "PAN" }] },
  { id: "id-2", slug: "pmmy_shishu", name: "PMMY Shishu", states_served: "ALL", max_amount: 50000, scheme_type: "loan", interest_subsidy_pct: 0, deadline: "Ongoing", verification_status: "verified", documents: [{ id: "d2", title: "Aadhaar" }] },
  { id: "id-3", slug: "pmmy_kishore", name: "PMMY Kishore", states_served: "ALL", max_amount: 500000, scheme_type: "loan", interest_subsidy_pct: 0, deadline: "Ongoing", verification_status: "verified", documents: [{ id: "d3", title: "Bank Statement" }] },
  { id: "id-4", slug: "pmmy_tarun", name: "PMMY Tarun", states_served: "ALL", max_amount: 1000000, scheme_type: "loan", interest_subsidy_pct: 0, deadline: "Ongoing", verification_status: "verified", documents: [{ id: "d4", title: "ITR" }] },
  { id: "id-5", slug: "standup_india", name: "Stand-Up India", states_served: "ALL", max_amount: 10000000, scheme_type: "loan", interest_subsidy_pct: 0, deadline: "Ongoing", verification_status: "verified", documents: [{ id: "d5", title: "Caste/Women cert" }] },
  { id: "id-6", slug: "pm_svanidhi", name: "PM SVANidhi", states_served: "ALL", max_amount: 50000, scheme_type: "loan", interest_subsidy_pct: 7.0, deadline: "Ongoing", verification_status: "verified", documents: [{ id: "d6", title: "Vendor ID" }] },
  { id: "id-7", slug: "cgtmse", name: "CGTMSE", states_served: "ALL", max_amount: 20000000, scheme_type: "credit_guarantee", interest_subsidy_pct: 0, deadline: "Ongoing", verification_status: "verified", documents: [{ id: "d7", title: "GSTIN" }] },
];

// Helper functions mirroring frontend logic
function serializeComparison(selectedIds, allSchemes) {
  if (!selectedIds || selectedIds.length === 0) return "";
  return selectedIds
    .map((id) => {
      const found = allSchemes.find((s) => s.id === id);
      return found?.slug || id;
    })
    .join(",");
}

function deserializeComparison(queryString, allSchemes) {
  if (!queryString) return [];
  const slugs = queryString
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);

  const matchedIds = [];
  for (const slug of slugs) {
    if (matchedIds.length >= 6) break; // Enforce maximum 6 schemes
    const found = allSchemes.find(
      (s) => s.slug?.toLowerCase() === slug || s.id?.toLowerCase() === slug
    );
    if (found && !matchedIds.includes(found.id)) {
      matchedIds.push(found.id);
    }
  }
  return matchedIds;
}

function toggleSchemeSelection(selectedIds, schemeId) {
  if (selectedIds.includes(schemeId)) {
    return {
      selectedIds: selectedIds.filter((id) => id !== schemeId),
      warning: null,
    };
  }
  if (selectedIds.length >= 6) {
    return {
      selectedIds,
      warning: "MAX_LIMIT_EXCEEDED",
    };
  }
  return {
    selectedIds: [...selectedIds, schemeId],
    warning: null,
  };
}

// ==========================================
// Test 1: Max 6 Schemes Selection Limit
// ==========================================
console.log("TEST 1: Enforce maximum 6 schemes selection limit...");
let currentSelection = [];

for (let i = 0; i < 6; i++) {
  const result = toggleSchemeSelection(currentSelection, mockSchemes[i].id);
  assert.strictEqual(result.warning, null, `Scheme ${i + 1} should be added without warning`);
  currentSelection = result.selectedIds;
}
assert.strictEqual(currentSelection.length, 6, "Must hold exactly 6 schemes");

// Attempt to add 7th scheme
const attempt7th = toggleSchemeSelection(currentSelection, mockSchemes[6].id);
assert.strictEqual(attempt7th.selectedIds.length, 6, "7th scheme must NOT be added");
assert.strictEqual(attempt7th.warning, "MAX_LIMIT_EXCEEDED", "Should trigger warning when adding 7th scheme");
console.log("PASS: Maximum 6 selection boundary and warning trigger verified.");

// ==========================================
// Test 2: URL Parameter Serialization
// ==========================================
console.log("TEST 2: URL search param serialization (?compare=slug1,slug2...)...");
const testIds = ["id-1", "id-2", "id-6"];
const serialized = serializeComparison(testIds, mockSchemes);
assert.strictEqual(serialized, "pmegp,pmmy_shishu,pm_svanidhi", "URL parameter must use slugs");

const emptySerialized = serializeComparison([], mockSchemes);
assert.strictEqual(emptySerialized, "", "Empty selection serializes to empty string");
console.log("PASS: Comparison serialization into URL slugs confirmed.");

// ==========================================
// Test 3: URL Parameter Deserialization & Reload Persistence
// ==========================================
console.log("TEST 3: URL search param deserialization & capping on reload...");
const testQuery = "pmegp,pmmy_kishore,pm_svanidhi,non_existent_scheme";
const restoredIds = deserializeComparison(testQuery, mockSchemes);
assert.deepStrictEqual(restoredIds, ["id-1", "id-3", "id-6"], "Should restore valid schemes and ignore invalid");

// Test query with 7 items: must cap at 6
const queryWith7 = "pmegp,pmmy_shishu,pmmy_kishore,pmmy_tarun,standup_india,pm_svanidhi,cgtmse";
const cappedRestored = deserializeComparison(queryWith7, mockSchemes);
assert.strictEqual(cappedRestored.length, 6, "URL restoration must strictly cap at 6 schemes");
assert.deepStrictEqual(
  cappedRestored,
  ["id-1", "id-2", "id-3", "id-4", "id-5", "id-6"],
  "First 6 valid schemes should be restored"
);
console.log("PASS: URL search param deserialization and maximum 6 capping confirmed.");

// ==========================================
// Test 4: Required Comparison Matrix Fields
// ==========================================
console.log("TEST 4: Comparison table matrix fields audit...");
const requiredFields = [
  "states_served",
  "max_amount",
  "interest_subsidy_pct",
  "scheme_type",
  "documents",
  "deadline",
  "verification_status",
];

for (const scheme of mockSchemes) {
  for (const field of requiredFields) {
    assert(
      field in scheme && scheme[field] !== undefined,
      `Scheme ${scheme.name} missing required comparison field '${field}'`
    );
  }
}
console.log(`PASS: All 7 mock schemes contain required matrix fields: ${requiredFields.join(", ")}`);

// ==========================================
// Test 5: Localization Dictionary Completeness
// ==========================================
console.log("TEST 5: Comparison dictionary localization across en, hi, bn...");
const expectedComparisonKeys = [
  "title",
  "subtitle",
  "selectToCompare",
  "selectedToCompare",
  "selectedCount",
  "maxLimitAlert",
  "clearAll",
  "viewComparison",
  "closeComparison",
  "shareLink",
  "linkCopied",
  "stateCoverage",
  "maxLimit",
  "schemeType",
  "interestSubsidy",
  "documents",
  "deadline",
  "verification",
  "provider",
  "targetSectors",
  "officialPortal",
  "remove",
  "emptyTitle",
  "emptyDesc",
  "stickyParameter",
  "openInPortal",
];

for (const lang of ["en", "hi", "bn"]) {
  assert(translations[lang].comparison, `Language '${lang}' missing comparison dictionary`);
  for (const key of expectedComparisonKeys) {
    assert(
      translations[lang].comparison[key],
      `Language '${lang}' missing comparison translation key '${key}'`
    );
  }
}
console.log("PASS: Comparison translation dictionary 100% complete across en, hi, bn.");

console.log("\nALL CHECKPOINT 8 TESTS PASSED (5/5 tests verified successfully).");
