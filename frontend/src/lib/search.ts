/**
 * Multilingual search and preset keyword expansion engine for SAHAY Schemes.
 * Supports English, Bengali (বাংলা), and Hindi (हिन्दी).
 */

export interface SchemeSearchItem {
  id?: string;
  name: string;
  slug?: string;
  provider?: string;
  short_description?: string;
  detailed_benefits?: string;
  target_sectors?: string;
  states_served?: string;
  scheme_type?: string;
}

export interface PresetFilter {
  id: string;
  key: "allSchemes" | "womenEntrepreneurs" | "startupLoans" | "msmeSubsidies" | "mudraLoans" | "streetVendors" | "collateralFree";
  searchKeyword?: string;
  schemeType?: string;
  icon?: string;
}

export const SCHEME_PRESETS: PresetFilter[] = [
  { id: "all", key: "allSchemes" },
  { id: "women", key: "womenEntrepreneurs", searchKeyword: "মহিলা" },
  { id: "startup", key: "startupLoans", searchKeyword: "startup" },
  { id: "subsidies", key: "msmeSubsidies", schemeType: "subsidy" },
  { id: "mudra", key: "mudraLoans", searchKeyword: "mudra" },
  { id: "svanidhi", key: "streetVendors", searchKeyword: "svanidhi" },
  { id: "collateral", key: "collateralFree", searchKeyword: "collateral" },
];

export const MULTILINGUAL_SYNONYM_MAP: Record<string, string[]> = {
  // Bengali (বাংলা)
  "মহিলা": ["women", "woman", "female", "stand-up"],
  "মহিলারা": ["women", "woman", "female", "stand-up"],
  "মহিলাদের": ["women", "woman", "female", "stand-up"],
  "নারী": ["women", "woman", "female"],
  "ঋণ": ["loan", "credit", "mudra", "svanidhi"],
  "ভর্তুকি": ["subsidy", "grant", "pmegp"],
  "অনুদান": ["grant", "subsidy"],
  "উদ্যোক্তা": ["entrepreneur", "enterprise", "startup"],
  "ব্যবসা": ["business", "enterprise", "micro"],
  "মুদ্রা": ["mudra", "pmmy"],
  "হকার": ["vendor", "street vendor", "svanidhi"],
  "পথ বিক্রেতা": ["vendor", "street vendor", "svanidhi"],
  "স্টার্টআপ": ["startup", "greenfield", "stand-up"],
  "ক্ষুদ্র": ["micro", "msme"],
  "জামানতহীন": ["collateral", "guarantee", "cgtmse"],
  "বিনা জামানত": ["collateral", "guarantee", "cgtmse"],

  // Hindi (हिन्दी)
  "महिला": ["women", "woman", "female", "stand-up"],
  "महिलाएं": ["women", "woman", "female", "stand-up"],
  "महिलाओं": ["women", "woman", "female", "stand-up"],
  "नारी": ["women", "woman", "female"],
  "ऋण": ["loan", "credit", "mudra", "svanidhi"],
  "कर्ज": ["loan", "credit"],
  "सब्सिडी": ["subsidy", "grant", "pmegp"],
  "अनुदान": ["grant", "subsidy"],
  "उद्यमी": ["entrepreneur", "enterprise", "startup"],
  "व्यापार": ["business", "enterprise", "micro"],
  "व्यवसाय": ["business", "enterprise", "micro"],
  "मुद्रा": ["mudra", "pmmy"],
  "विक्रेता": ["vendor", "street vendor", "svanidhi"],
  "रेहड़ी": ["vendor", "street vendor", "svanidhi"],
  "स्टार्टআপ": ["startup", "greenfield", "stand-up"],
  "सूक्ष्म": ["micro", "msme"],
  "बिना गारंटी": ["collateral", "guarantee", "cgtmse"],

  // English
  "women": ["women", "woman", "female", "stand-up"],
  "female": ["women", "woman", "female", "stand-up"],
  "woman": ["women", "woman", "female", "stand-up"],
  "startup": ["startup", "greenfield", "stand-up"],
  "vendor": ["vendor", "street vendor", "svanidhi"],
  "subsidies": ["subsidy", "grant", "pmegp"],
  "subsidy": ["subsidy", "grant", "pmegp"],
  "loans": ["loan", "credit"],
  "loan": ["loan", "credit"],
  "collateral": ["collateral", "guarantee", "cgtmse"],
};

/**
 * Expand a user search query into multilingual terms.
 */
export function expandMultilingualSearchTerms(rawQuery: string): string[] {
  const clean = rawQuery.trim().toLowerCase();
  if (!clean) return [];

  const terms = new Set<string>([clean]);

  if (MULTILINGUAL_SYNONYM_MAP[clean]) {
    for (const s of MULTILINGUAL_SYNONYM_MAP[clean]) {
      terms.add(s.toLowerCase());
    }
  }

  const tokens = clean.split(/\s+/);
  for (const token of tokens) {
    if (MULTILINGUAL_SYNONYM_MAP[token]) {
      for (const s of MULTILINGUAL_SYNONYM_MAP[token]) {
        terms.add(s.toLowerCase());
      }
    }
  }

  for (const [key, syns] of Object.entries(MULTILINGUAL_SYNONYM_MAP)) {
    if (clean.includes(key) || key.includes(clean)) {
      for (const s of syns) {
        terms.add(s.toLowerCase());
      }
    }
  }

  return Array.from(terms);
}

/**
 * Checks if a scheme matches any of the expanded multilingual terms.
 */
export function schemeMatchesQuery(scheme: SchemeSearchItem, query: string): boolean {
  if (!query || !query.trim()) return true;

  const terms = expandMultilingualSearchTerms(query);
  const searchableText = [
    scheme.name,
    scheme.slug,
    scheme.provider,
    scheme.short_description,
    scheme.detailed_benefits,
    scheme.target_sectors,
    scheme.states_served,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return terms.some((term) => searchableText.includes(term.toLowerCase()));
}
