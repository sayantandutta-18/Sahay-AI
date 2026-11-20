/**
 * Checkpoint 9: Multilingual Search and Presets Test Suite
 * Tests Bengali/Hindi/English keyword search matching and preset chips.
 */

import assert from "node:assert";
import { translations } from "../src/lib/i18n.ts";
import {
  expandMultilingualSearchTerms,
  schemeMatchesQuery,
  SCHEME_PRESETS,
} from "../src/lib/search.ts";

console.log("=== SAHAY CHECKPOINT 9: MULTILINGUAL SEARCH & PRESETS TEST SUITE ===");

// Mock government schemes dataset
const mockSchemes = [
  {
    id: "id-1",
    slug: "pmegp",
    name: "Prime Minister Employment Generation Programme (PMEGP)",
    provider: "Ministry of MSME, Govt of India",
    scheme_type: "subsidy",
    short_description: "Credit-linked subsidy program to generate employment in non-farm sectors.",
    detailed_benefits: "Margin money subsidy of 25% to 35% on bank-financed projects up to ₹50 Lakhs.",
    target_sectors: "manufacturing,services,agriculture_allied",
    states_served: "ALL",
  },
  {
    id: "id-2",
    slug: "stand-up-india",
    name: "Stand-Up India Scheme",
    provider: "Department of Financial Services, MoF & SIDBI",
    scheme_type: "loan",
    short_description: "Promotes entrepreneurship among women and SC/ST communities for setting up greenfield enterprises.",
    detailed_benefits: "Composite loans between ₹10 Lakhs and ₹1 Crore to at least one SC/ST borrower and one woman borrower per bank branch.",
    target_sectors: "manufacturing,services,trading,agriculture_allied",
    states_served: "ALL",
  },
  {
    id: "id-3",
    slug: "cgtmse",
    name: "Credit Guarantee Fund Trust for Micro and Small Enterprises (CGTMSE)",
    provider: "Ministry of MSME & SIDBI",
    scheme_type: "credit_guarantee",
    short_description: "Enables credit flow to micro and small enterprises by providing loan guarantee coverage without collateral.",
    detailed_benefits: "Credit guarantee coverage up to 85% for micro-enterprises and women-owned units on credit facilities up to ₹500 Lakhs.",
    target_sectors: "manufacturing,services",
    states_served: "ALL",
  },
  {
    id: "id-4",
    slug: "pmmy-tarun",
    name: "Pradhan Mantri MUDRA Yojana (Tarun)",
    provider: "Department of Financial Services, MoF",
    scheme_type: "loan",
    short_description: "Collateral-free institutional credit for established micro-enterprises.",
    detailed_benefits: "Working capital and term loans from ₹5 Lakhs to ₹10 Lakhs with zero processing fees.",
    target_sectors: "manufacturing,services,trading,agriculture_allied",
    states_served: "ALL",
  },
  {
    id: "id-5",
    slug: "pm-svanidhi",
    name: "PM SVANidhi (Street Vendor's AtmaNirbhar Nidhi)",
    provider: "Ministry of Housing and Urban Affairs (MoHUA)",
    scheme_type: "loan",
    short_description: "Micro-credit facility for urban street vendors to resume livelihoods.",
    detailed_benefits: "Working capital loan up to ₹50,000 with 7% interest subsidy on regular repayment.",
    target_sectors: "trading,services",
    states_served: "ALL",
  },
];

// ==========================================
// Test 1: Multilingual Keyword Expansion
// ==========================================
console.log("TEST 1: Multilingual keyword expansion (Bengali, Hindi, English)...");

const bengaliTerms = expandMultilingualSearchTerms("মহিলা");
assert(bengaliTerms.includes("মহিলা"), "Must contain original query");
assert(bengaliTerms.includes("women"), "Must expand to 'women'");
assert(bengaliTerms.includes("female"), "Must expand to 'female'");
assert(bengaliTerms.includes("stand-up"), "Must expand to 'stand-up'");

const hindiTerms = expandMultilingualSearchTerms("महिला");
assert(hindiTerms.includes("महिला"), "Must contain Hindi query");
assert(hindiTerms.includes("women"), "Must expand to 'women'");

const subsidyTerms = expandMultilingualSearchTerms("ভর্তুকি");
assert(subsidyTerms.includes("subsidy"), "Bengali 'ভর্তুকি' must expand to 'subsidy'");
assert(subsidyTerms.includes("pmegp"), "Bengali 'ভর্তুকি' must expand to 'pmegp'");

console.log("PASS: Multilingual keyword expansion confirmed across Bengali and Hindi.");

// ==========================================
// Test 2: Done When Requirement: Searching 'মহিলা' Shows Women Schemes
// ==========================================
console.log("TEST 2: Checkpoint 9 Done When: Searching for 'মহিলা' shows women entrepreneur schemes...");

const mohilaMatches = mockSchemes.filter((s) => schemeMatchesQuery(s, "মহিলা"));
assert(mohilaMatches.length >= 2, `Expected at least 2 schemes matching 'মহিলা', got ${mohilaMatches.length}`);

const matchedNames = mohilaMatches.map((s) => s.name);
const matchedSlugs = mohilaMatches.map((s) => s.slug);
assert(
  matchedSlugs.includes("stand-up-india"),
  `Stand-Up India Scheme must match 'মহিলা'. Matched: ${matchedNames.join(", ")}`
);
assert(
  matchedSlugs.includes("cgtmse"),
  `CGTMSE must match 'মহিলা' (women-owned units). Matched: ${matchedNames.join(", ")}`
);

console.log(`PASS: Searching for 'মহিলা' successfully returned: ${matchedNames.join(" | ")}`);

// ==========================================
// Test 3: English and Hindi Search Equivalence
// ==========================================
console.log("TEST 3: English ('women') and Hindi ('महिला') produce equivalent results...");

const englishMatches = mockSchemes.filter((s) => schemeMatchesQuery(s, "women"));
const hindiMatches = mockSchemes.filter((s) => schemeMatchesQuery(s, "महिला"));

assert.deepStrictEqual(
  englishMatches.map((s) => s.id),
  mohilaMatches.map((s) => s.id),
  "English search 'women' and Bengali search 'মহিলা' should match same schemes"
);
assert.deepStrictEqual(
  hindiMatches.map((s) => s.id),
  mohilaMatches.map((s) => s.id),
  "Hindi search 'महिला' and Bengali search 'মহিলা' should match same schemes"
);
console.log("PASS: Cross-lingual search equivalence confirmed.");

// ==========================================
// Test 4: Preset Chips Configuration & Filtering
// ==========================================
console.log("TEST 4: Preset chips configuration & filtering...");

assert(SCHEME_PRESETS.length >= 5, "At least 5 preset filters should be defined");
const womenPreset = SCHEME_PRESETS.find((p) => p.id === "women");
assert(womenPreset && womenPreset.searchKeyword, "Women preset must exist with search keyword");

const subsidyPreset = SCHEME_PRESETS.find((p) => p.id === "subsidies");
assert(subsidyPreset && subsidyPreset.schemeType === "subsidy", "Subsidy preset must filter by type");

const mudraMatches = mockSchemes.filter((s) => schemeMatchesQuery(s, "mudra"));
assert(mudraMatches.some((s) => s.slug === "pmmy-tarun"), "MUDRA preset query must match PMMY Tarun");

console.log("PASS: Preset filter chips verified.");

// ==========================================
// Test 5: Empty Result & Suggestion Fallback
// ==========================================
console.log("TEST 5: Empty results with suggestions...");

const nonExistentMatches = mockSchemes.filter((s) =>
  schemeMatchesQuery(s, "non_existent_keyword_xyz123")
);
assert.strictEqual(nonExistentMatches.length, 0, "Non-existent keyword should return 0 results");
console.log("PASS: Zero results handled cleanly without error.");

// ==========================================
// Test 6: Multilingual Dictionary Parity for Search
// ==========================================
console.log("TEST 6: Search dictionary localization across en, hi, bn...");

const searchKeys = [
  "placeholder",
  "presetsLabel",
  "allSchemes",
  "womenEntrepreneurs",
  "startupLoans",
  "msmeSubsidies",
  "mudraLoans",
  "streetVendors",
  "collateralFree",
  "noResultsTitle",
  "noResultsMessage",
  "suggestionsTitle",
  "suggestionWomen",
  "suggestionSubsidies",
  "suggestionLoans",
  "clearSearch",
  "resultsFound",
  "showingAll",
];

for (const lang of ["en", "hi", "bn"]) {
  assert(translations[lang].search, `Language '${lang}' missing search dictionary`);
  for (const k of searchKeys) {
    assert(
      translations[lang].search[k],
      `Language '${lang}' missing search translation key '${k}'`
    );
  }
}
console.log("PASS: Search translation dictionary 100% complete across en, hi, bn.");

console.log("\nALL CHECKPOINT 9 TESTS PASSED (6/6 tests verified successfully).");
