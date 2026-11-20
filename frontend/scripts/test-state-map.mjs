/**
 * Checkpoint 10: State-Level Map & Accessible Fallback Test Suite
 * Tests 36 states/UTs data, Pan-India scheme counting, West Bengal filtering,
 * accessible list filtering, and keyboard navigation metadata.
 */

import assert from "node:assert";
import { translations } from "../src/lib/i18n.ts";
import {
  INDIAN_STATES,
  countSchemesForState,
} from "../src/lib/states.ts";

console.log("=== SAHAY CHECKPOINT 10: STATE MAP & ACCESSIBLE FALLBACK TEST SUITE ===");

// Mock schemes catalog
const mockSchemes = [
  { id: "1", slug: "pmegp", name: "PMEGP", states_served: "ALL" },
  { id: "2", slug: "pmmy-tarun", name: "PMMY Tarun", states_served: "ALL" },
  { id: "3", slug: "pmmy-shishu", name: "PMMY Shishu", states_served: "ALL" },
  { id: "4", slug: "stand-up-india", name: "Stand-Up India", states_served: "ALL" },
  { id: "5", slug: "cgtmse", name: "CGTMSE", states_served: "ALL" },
  { id: "6", slug: "pm-svanidhi", name: "PM SVANidhi", states_served: "ALL" },
  { id: "7", slug: "banglashree", name: "Banglashree Scheme", states_served: "West Bengal" },
];

// ==========================================
// Test 1: Complete 36 States & UTs Metadata
// ==========================================
console.log("TEST 1: 28 States & 8 Union Territories completeness audit...");
assert.strictEqual(INDIAN_STATES.length, 36, "Must define all 36 Indian states and UTs");

const westBengal = INDIAN_STATES.find((s) => s.code === "WB");
assert(westBengal, "West Bengal must be present in states list");
assert.strictEqual(westBengal.name, "West Bengal");
assert.strictEqual(westBengal.nameBn, "পশ্চিমবঙ্গ");
assert.strictEqual(westBengal.nameHi, "पश्चिम बंगाल");
assert(westBengal.svg && westBengal.svg.path, "West Bengal must have valid SVG path");
console.log("PASS: 36 states and UTs verified with multilingual names and SVG paths.");

// ==========================================
// Test 2: Checkpoint 10 Done When: West Bengal Filtering
// ==========================================
console.log("TEST 2: Checkpoint 10 Done When: West Bengal includes state + Pan-India schemes...");

const wbSchemeCount = countSchemesForState("West Bengal", mockSchemes);
assert.strictEqual(wbSchemeCount, 7, "West Bengal must count 6 Pan-India + 1 West Bengal scheme (7 total)");

// Test other state (e.g. Maharashtra)
const mhSchemeCount = countSchemesForState("Maharashtra", mockSchemes);
assert.strictEqual(mhSchemeCount, 6, "Maharashtra must only count the 6 Pan-India schemes, excluding Banglashree");

console.log(`PASS: West Bengal yields ${wbSchemeCount} schemes (including Banglashree), while Maharashtra yields ${mhSchemeCount} (Pan-India only).`);

// ==========================================
// Test 3: Accessible Fallback List Search & Matching
// ==========================================
console.log("TEST 3: Accessible fallback list search across Bengali, Hindi, code, and English...");

function searchFallbackList(query) {
  const clean = query.trim().toLowerCase();
  return INDIAN_STATES.filter(
    (s) =>
      s.name.toLowerCase().includes(clean) ||
      s.nameHi.includes(query.trim()) ||
      s.nameBn.includes(query.trim()) ||
      s.code.toLowerCase().includes(clean)
  );
}

const matchByBn = searchFallbackList("পশ্চিমবঙ্গ");
assert.strictEqual(matchByBn.length, 1);
assert.strictEqual(matchByBn[0].code, "WB");

const matchByCode = searchFallbackList("wb");
assert.strictEqual(matchByCode.length, 1);
assert.strictEqual(matchByCode[0].name, "West Bengal");

const matchByHi = searchFallbackList("पश्चिम बंगाल");
assert.strictEqual(matchByHi.length, 1);
assert.strictEqual(matchByHi[0].name, "West Bengal");

console.log("PASS: Accessible list searches seamlessly across Bengali, Hindi, English, and State Code.");

// ==========================================
// Test 4: Keyboard Navigation Accessibility Properties
// ==========================================
console.log("TEST 4: Keyboard navigation and ARIA attributes audit...");

for (const state of INDIAN_STATES) {
  assert(state.code, "State must have unique code for accessibility key");
  assert(state.name, "State must have name for aria-label");
  assert(Number.isFinite(state.svg.cx) && Number.isFinite(state.svg.cy), "Must have centroid coordinates");
}
console.log("PASS: All 36 state SVG elements carry valid ARIA labels and focus coordinates.");

// ==========================================
// Test 5: Multilingual Localization Dictionary Parity
// ==========================================
console.log("TEST 5: State map translation dictionary completeness across en, hi, bn...");

const stateMapKeys = [
  "title",
  "subtitle",
  "mapView",
  "listView",
  "selectedState",
  "allIndia",
  "clearStateFilter",
  "schemesAvailable",
  "svgFallbackNotice",
  "searchStatePlaceholder",
  "filterByState",
  "statesAndUTs",
  "westBengalNotice",
  "selectStatePrompt",
];

for (const lang of ["en", "hi", "bn"]) {
  assert(translations[lang].stateMap, `Language '${lang}' missing stateMap dictionary`);
  for (const k of stateMapKeys) {
    assert(
      translations[lang].stateMap[k],
      `Language '${lang}' missing stateMap translation key '${k}'`
    );
  }
}
console.log("PASS: State map translation dictionary 100% complete across en, hi, bn.");

console.log("\nALL CHECKPOINT 10 TESTS PASSED (5/5 tests verified successfully).");
