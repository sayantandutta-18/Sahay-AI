/**
 * SAHAY Multilingual Localization Engine
 * Supports English (en), Hindi (hi), and Bengali (bn) for micro-entrepreneurs.
 */

export type SupportedLanguage = "en" | "hi" | "bn";

export interface TranslationDictionary {
  appName: string;
  tagline: string;
  nav: {
    dashboard: string;
    schemes: string;
    matches: string;
    applications: string;
    documents: string;
    chat: string;
    business: string;
    academy: string;
    stocks: string;
    portfolio: string;
    profile: string;
    admin: string;
  };
  common: {
    save: string;
    cancel: string;
    submit: string;
    back: string;
    next: string;
    loading: string;
    verified: string;
    eligible: string;
    notEligible: string;
    searchPlaceholder: string;
  };
  compliance: {
    sebiNotice: string;
    deterministicGuarantee: string;
  };
}

export const translations: Record<SupportedLanguage, TranslationDictionary> = {
  en: {
    appName: "SAHAY",
    tagline: "Multilingual AI Platform for Indian Micro-Entrepreneurs",
    nav: {
      dashboard: "Dashboard",
      schemes: "Scheme Library",
      matches: "Eligibility Matches",
      applications: "My Applications",
      documents: "Document Vault",
      chat: "AI Assistant (RAG)",
      business: "Business Advisor",
      academy: "Market Academy",
      stocks: "Stock Research",
      portfolio: "Paper Portfolio",
      profile: "Profile & Business",
      admin: "Admin Console",
    },
    common: {
      save: "Save Changes",
      cancel: "Cancel",
      submit: "Submit",
      back: "Back",
      next: "Next Step",
      loading: "Loading...",
      verified: "Government Verified",
      eligible: "Eligible",
      notEligible: "Not Eligible",
      searchPlaceholder: "Search schemes, subsidies, loans...",
    },
    compliance: {
      sebiNotice:
        "Educational decision-support only. Sahay does not execute live trades or offer guaranteed stock tips.",
      deterministicGuarantee:
        "All calculations and eligibility matches are deterministically evaluated by verified backend rules.",
    },
  },
  hi: {
    appName: "सहाय",
    tagline: "भारतीय सूक्ष्म उद्यमियों के लिए बहुभाषी एआई मंच",
    nav: {
      dashboard: "डैशबोर्ड",
      schemes: "सरकारी योजनाएं",
      matches: "पात्रता मिलान",
      applications: "मेरे आवेदन",
      documents: "दस्तावेज़ वॉल्ट",
      chat: "एआई सहायक",
      business: "व्यापार सलाहकार",
      academy: "मार्केट अकादमी",
      stocks: "शेयर अनुसंधान",
      portfolio: "वर्चुअल पोर्टफोलियो",
      profile: "प्रोफ़ाइल एवं व्यवसाय",
      admin: "व्यवस्थापक कंसोल",
    },
    common: {
      save: "परिवर्तन सहेजें",
      cancel: "रद्द करें",
      submit: "जमा करें",
      back: "पीछे जाएं",
      next: "अगला कदम",
      loading: "लोड हो रहा है...",
      verified: "सरकारी सत्यापित",
      eligible: "पात्र",
      notEligible: "अपात्र",
      searchPlaceholder: "योजनाएं, सब्सिडी या ऋण खोजें...",
    },
    compliance: {
      sebiNotice:
        "केवल शैक्षिक निर्णय सहायता। सहाय कोई लाइव ट्रेडिंग या गारंटीकृत रिटर्न प्रदान नहीं करता है।",
      deterministicGuarantee:
        "सभी वित्तीय गणनाएं और पात्रता मानदंड आधिकारिक नियमों द्वारा निर्धारित किए जाते हैं।",
    },
  },
  bn: {
    appName: "সহায়",
    tagline: "ভারতীয় ক্ষুদ্র উদ্যোক্তাদের জন্য বহুভাষিক এআই প্ল্যাটফর্ম",
    nav: {
      dashboard: "ড্যাশবোর্ড",
      schemes: "সরকারি প্রকল্পসমূহ",
      matches: "যোগ্যতা যাচাই",
      applications: "আমার আবেদনসমূহ",
      documents: "নথিপত্র ভল্ট",
      chat: "এআই সহকারী",
      business: "ব্যবসা উপদেষ্টা",
      academy: "শেয়ার বাজার একাডেমি",
      stocks: "বাজার গবেষণা",
      portfolio: "পেপার পোর্টফোলিও",
      profile: "প্রোফাইল ও ব্যবসা",
      admin: "অ্যাডমিন প্যানেল",
    },
    common: {
      save: "সংরক্ষণ করুন",
      cancel: "বাতিল",
      submit: "জমা দিন",
      back: "ফিরে যান",
      next: "পরবর্তী পদক্ষেপ",
      loading: "লোড হচ্ছে...",
      verified: "সরকারিভাবে যাচাইকৃত",
      eligible: "যোগ্য",
      notEligible: "অযোগ্য",
      searchPlaceholder: "প্রকল্প, ভর্তুকি বা ঋণ অনুসন্ধান করুন...",
    },
    compliance: {
      sebiNotice:
        "শুধুমাত্র শিক্ষামূলক সিদ্ধান্ত-সহায়তা। সহায় কোনো লাইভ ট্রেডিং বা নিশ্চিত রিটার্নের প্রতিশ্রুতি দেয় না।",
      deterministicGuarantee:
        "সমস্ত আর্থিক হিসাব এবং যোগ্যতা সরকারি নিয়মাবলীর মাধ্যমে নিশ্চিত করা হয়।",
    },
  },
};

export function getTranslation(lang: SupportedLanguage = "en"): TranslationDictionary {
  return translations[lang] || translations.en;
}
