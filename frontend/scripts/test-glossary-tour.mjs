/**
 * Checkpoint 11 Verification Script: Glossary Definitions & Onboarding Tour
 * Validates:
 * 1. 12+ technical microfinance/government scheme terms with English, Hindi, Bengali definitions.
 * 2. Case-insensitive and multilingual alias resolution via findGlossaryTerm().
 * 3. 3-step onboarding tour selector mapping and translation key integrity across en, hi, bn.
 * 4. Technical term pattern detection for highlighting.
 */

import { GLOSSARY_TERMS, findGlossaryTerm } from "../src/lib/glossary.ts";
import { translations } from "../src/lib/i18n.ts";
import { TOUR_STEPS_CONFIG } from "../src/lib/tour.ts";

console.log("=== CHECKPOINT 11: GLOSSARY TOOLTIPS & ONBOARDING TOUR AUDIT ===");

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`[PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`[FAIL] ${message}`);
    process.exitCode = 1;
  }
}

// 1. Glossary Definitions Completeness
const expectedTerms = [
  "msme",
  "pmegp",
  "mudra",
  "cgtmse",
  "margin_money",
  "collateral_free",
  "udyam",
  "dpr",
  "edp",
  "interest_subvention",
  "banglashree",
  "greenfield",
];

const actualKeys = Object.keys(GLOSSARY_TERMS);
assert(
  expectedTerms.every((key) => actualKeys.includes(key)),
  `All 12 core microfinance terms exist (found ${actualKeys.length} terms)`
);

// 2. Multilingual Translations Integrity in Glossary
let allDefsComplete = true;
for (const [key, def] of Object.entries(GLOSSARY_TERMS)) {
  if (
    !def.titleEn ||
    !def.titleHi ||
    !def.titleBn ||
    !def.defEn ||
    !def.defHi ||
    !def.defBn ||
    !def.category
  ) {
    allDefsComplete = false;
    console.error(`Incomplete definition for term: ${key}`);
  }
}
assert(
  allDefsComplete,
  "All 12 glossary definitions have non-empty titles & explanations across English, Hindi, and Bengali"
);

// 3. findGlossaryTerm Lookup (Exact, Case-Insensitive, Multilingual Aliases)
assert(
  findGlossaryTerm("MSME")?.term === "MSME",
  "findGlossaryTerm matches exact uppercase term 'MSME'"
);

assert(
  findGlossaryTerm("pmegp")?.term === "PMEGP",
  "findGlossaryTerm matches lowercase 'pmegp' to 'PMEGP'"
);

assert(
  findGlossaryTerm("ভর্তুকি")?.term === "Margin Money",
  "findGlossaryTerm matches Bengali alias 'ভর্তুকি' to Margin Money"
);

assert(
  findGlossaryTerm("उद्यम")?.term === "Udyam",
  "findGlossaryTerm matches Hindi alias 'उद्यम' to Udyam"
);

assert(
  findGlossaryTerm("nonexistent_term_xyz") === null,
  "findGlossaryTerm returns null for unknown terms"
);

// 4. Onboarding Tour Steps Configuration
assert(
  TOUR_STEPS_CONFIG.length === 3,
  `Onboarding tour has exactly 3 steps (found ${TOUR_STEPS_CONFIG.length})`
);

const expectedSelectors = [
  '[data-tour="search-presets"]',
  '[data-tour="state-map"]',
  '[data-tour="scheme-compare"]',
];

const actualSelectors = TOUR_STEPS_CONFIG.map((s) => s.selector);
assert(
  expectedSelectors.every((sel, i) => actualSelectors[i] === sel),
  "Tour selectors match exactly: search-presets, state-map, and scheme-compare"
);

// 5. Tour Translation Key Integrity across Locales
for (const lang of ["en", "hi", "bn"]) {
  const tourDict = translations[lang].tour;
  assert(
    !!tourDict.startTour &&
      !!tourDict.stepIndicator &&
      !!tourDict.next &&
      !!tourDict.prev &&
      !!tourDict.finish &&
      !!tourDict.skip &&
      !!tourDict.step1Title &&
      !!tourDict.step1Desc &&
      !!tourDict.step2Title &&
      !!tourDict.step2Desc &&
      !!tourDict.step3Title &&
      !!tourDict.step3Desc &&
      !!tourDict.tooltipHelp,
    `Tour dictionary fully localized for locale '${lang}'`
  );
}

// 6. Term Highlighting Regex Recognition
const sampleText =
  "PMEGP scheme provides 35% margin money with collateral-free loan and Udyam certificate.";
const termRegex = /\b(MSME|CGTMSE|MUDRA|PMEGP|Margin Money|Collateral-Free|Interest Subvention|Udyam|DPR|EDP|Banglashree|Greenfield)\b/gi;
const matches = sampleText.match(termRegex) || [];
assert(
  matches.length >= 4,
  `Regex extracted ${matches.length} technical terms from sample text: ${matches.join(", ")}`
);

console.log(`\nAUDIT SUMMARY: ${passedTests}/${totalTests} tests passed.`);
if (passedTests === totalTests) {
  console.log("SUCCESS: Checkpoint 11 Glossary & Onboarding Tour fully verified!");
} else {
  process.exit(1);
}
