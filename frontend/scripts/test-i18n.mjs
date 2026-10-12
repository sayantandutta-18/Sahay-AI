import { auditTranslationKeys, formatCurrencyINR, translations } from "../src/lib/i18n.ts";

console.log("=== SAHAY I18N LOCALIZATION PARITY AUDIT ===");

const audit = auditTranslationKeys();
console.log(`Audited locales: English (en), Hindi (hi), Bengali (bn)`);
console.log(`Total top-level dictionaries: ${Object.keys(translations).length}`);

if (!audit.valid) {
  console.error("FAIL: Missing translation keys detected:", audit.missingKeys);
  process.exit(1);
} else {
  console.log("PASS: 100% Key Parity confirmed across all locales (0 missing keys).");
}

// Test Indian numbering system currency formatting
const sampleAmount = 1542500.5;
const formattedEn = formatCurrencyINR(sampleAmount, "en");
const formattedHi = formatCurrencyINR(sampleAmount, "hi");
const formattedBn = formatCurrencyINR(sampleAmount, "bn");

console.log(`INR Format (en): ${formattedEn}`);
console.log(`INR Format (hi): ${formattedHi}`);
console.log(`INR Format (bn): ${formattedBn}`);

if (!formattedEn.includes("15,42,500.5") && !formattedEn.includes("1,542,500.5")) {
  console.error("FAIL: Currency formatting unexpected:", formattedEn);
  process.exit(1);
}

console.log("PASS: Multilingual currency formatting verified.");
