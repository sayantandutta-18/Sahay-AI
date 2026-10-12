/**
 * SAHAY Multilingual Localization Engine
 * Complete English (en), Hindi (hi), and Bengali (bn) parity for micro-entrepreneurs.
 */

"use client";

import { useState, useEffect } from "react";

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
    financialTwin: string;
  };
  statuses: {
    draft: string;
    documents_needed: string;
    ready_to_submit: string;
    submitted: string;
    in_review: string;
    action_required: string;
    approved: string;
    rejected: string;
    withdrawn: string;
    in_progress: string;
  };
  applications: {
    title: string;
    subtitle: string;
    newApplication: string;
    checklistTitle: string;
    statusHistoryTitle: string;
    dueDate: string;
    nextAction: string;
    mandatoryDocs: string;
    optionalDocs: string;
    attachDocument: string;
    attached: string;
    submitApplication: string;
    withdrawApplication: string;
    noApplications: string;
  };
  vault: {
    title: string;
    subtitle: string;
    uploadTitle: string;
    uploadButton: string;
    uploading: string;
    maxSizeNotice: string;
    allowedTypesNotice: string;
    docType: string;
    fileName: string;
    uploadDate: string;
    fileSize: string;
    checksum: string;
    download: string;
    delete: string;
    deleteConfirm: string;
    verified: string;
    pending: string;
    emptyVault: string;
  };
  twin: {
    title: string;
    subtitle: string;
    simulationNotice: string;
    baselineState: string;
    scenarioBranches: string;
    newScenario: string;
    compareTitle: string;
    metrics: {
      monthlyCashFlow: string;
      debtCoverage: string;
      emergencyRunway: string;
      riskScore: string;
      savingsRate: string;
    };
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
    success: string;
    error: string;
    refresh: string;
    actions: string;
  };
  compliance: {
    sebiNotice: string;
    deterministicGuarantee: string;
    disclaimer: string;
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
      financialTwin: "Financial Twin",
    },
    statuses: {
      draft: "Draft",
      documents_needed: "Documents Needed",
      ready_to_submit: "Ready to Submit",
      submitted: "Submitted",
      in_review: "In Review",
      action_required: "Action Required",
      approved: "Approved",
      rejected: "Rejected",
      withdrawn: "Withdrawn",
      in_progress: "In Progress",
    },
    applications: {
      title: "Scheme Applications & Tracker",
      subtitle: "Track submission status, required document checklists, and next steps.",
      newApplication: "Start Application",
      checklistTitle: "Mandatory Document Checklist",
      statusHistoryTitle: "Application Status Audit History",
      dueDate: "Target Due Date",
      nextAction: "Recommended Next Action",
      mandatoryDocs: "Mandatory Requirements",
      optionalDocs: "Optional Supporting Documents",
      attachDocument: "Attach Vault Document",
      attached: "Attached & Verified",
      submitApplication: "Submit for Official Review",
      withdrawApplication: "Withdraw Application",
      noApplications: "No active scheme applications. Explore verified schemes to begin.",
    },
    vault: {
      title: "Document Vault & Metadata Store",
      subtitle: "Secure encrypted repository for business documents. Reusable across scheme checklists.",
      uploadTitle: "Upload New Document",
      uploadButton: "Upload to Vault",
      uploading: "Uploading & Verifying...",
      maxSizeNotice: "Maximum file size: 10 MB per file.",
      allowedTypesNotice: "Accepted formats: PDF, JPEG, PNG with verified cryptographic signature.",
      docType: "Document Category",
      fileName: "File Name",
      uploadDate: "Uploaded Date",
      fileSize: "Size",
      checksum: "SHA-256 Checksum",
      download: "Download",
      delete: "Delete",
      deleteConfirm: "Are you sure you want to permanently delete this document?",
      verified: "Government Verified",
      pending: "Pending Verification",
      emptyVault: "Your document vault is empty. Upload PAN, Udyam, or Bank Statements to get started.",
    },
    twin: {
      title: "AI Financial Digital Twin",
      subtitle: "Deterministic simulation sandbox. Model financial decisions before acting.",
      simulationNotice: "All scenarios are isolated simulations. ₹0 real money moved or borrowed.",
      baselineState: "Current Financial Reality (Baseline)",
      scenarioBranches: "Hypothetical Scenario Branches",
      newScenario: "Create Simulation Scenario",
      compareTitle: "Baseline vs. Scenario Comparison",
      metrics: {
        monthlyCashFlow: "Monthly Cash Flow",
        debtCoverage: "Debt Service Coverage (DSCR)",
        emergencyRunway: "Emergency Reserve Runway",
        riskScore: "Financial Risk Indicator",
        savingsRate: "Net Savings Rate",
      },
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
      success: "Operation successful",
      error: "Something went wrong",
      refresh: "Refresh Data",
      actions: "Actions",
    },
    compliance: {
      sebiNotice:
        "Educational decision-support only. Sahay does not execute live trades or offer guaranteed stock tips.",
      deterministicGuarantee:
        "All calculations and eligibility matches are deterministically evaluated by verified backend rules.",
      disclaimer: "Sahay is an independent private application and is not affiliated with any government portal.",
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
      financialTwin: "वित्तीय डिजिटल ट्विन",
    },
    statuses: {
      draft: "प्रारूप (ड्राफ्ट)",
      documents_needed: "दस्तावेज़ आवश्यक",
      ready_to_submit: "जमा करने हेतु तैयार",
      submitted: "जमा किया गया",
      in_review: "समीक्षाधीन",
      action_required: "कार्रवाई आवश्यक",
      approved: "स्वीकृत",
      rejected: "अस्वीकृत",
      withdrawn: "वापस लिया गया",
      in_progress: "प्रगति पर",
    },
    applications: {
      title: "योजना आवेदन एवं ट्रैकर",
      subtitle: "आवेदन की स्थिति, आवश्यक दस्तावेज़ चेकलिस्ट और अगले कदम ट्रैक करें।",
      newApplication: "नया आवेदन शुरू करें",
      checklistTitle: "अनिवार्य दस्तावेज़ चेकलिस्ट",
      statusHistoryTitle: "आवेदन स्थिति का ऐतिहासिक ऑडिट",
      dueDate: "लक्षित नियत तिथि",
      nextAction: "अनुशंसित अगला कदम",
      mandatoryDocs: "अनिवार्य आवश्यकताएं",
      optionalDocs: "वैकल्पिक सहायक दस्तावेज़",
      attachDocument: "वॉल्ट से दस्तावेज़ जोड़ें",
      attached: "संलग्न एवं सत्यापित",
      submitApplication: "अंतिम समीक्षा हेतु जमा करें",
      withdrawApplication: "आवेदन वापस लें",
      noApplications: "कोई सक्रिय आवेदन नहीं है। शुरू करने के लिए योजनाओं का अन्वेषण करें।",
    },
    vault: {
      title: "दस्तावेज़ वॉल्ट एवं डेटा स्टोर",
      subtitle: "व्यवसाय दस्तावेज़ों के लिए सुरक्षित रिपॉजिटरी। सभी चेकलिस्ट में पुन: प्रयोज्य।",
      uploadTitle: "नया दस्तावेज़ अपलोड करें",
      uploadButton: "वॉल्ट में अपलोड करें",
      uploading: "अपलोड एवं सत्यापन जारी...",
      maxSizeNotice: "अधिकतम फ़ाइल आकार: 10 एमबी प्रति फ़ाइल।",
      allowedTypesNotice: "स्वीकृत प्रारूप: क्रिप्टोग्राफ़िक हस्ताक्षर युक्त पीडीएफ, जेपीईजी, पीएनजी।",
      docType: "दस्तावेज़ श्रेणी",
      fileName: "फ़ाइल का नाम",
      uploadDate: "अपलोड तिथि",
      fileSize: "आकार",
      checksum: "एसएचए-256 चेकसम",
      download: "डाउनलोड करें",
      delete: "हटाएं",
      deleteConfirm: "क्या आप वाकई इस दस्तावेज़ को स्थायी रूप से हटाना चाहते हैं?",
      verified: "सरकारी सत्यापित",
      pending: "सत्यापन लंबित",
      emptyVault: "आपका दस्तावेज़ वॉल्ट खाली है। पैन, उद्यम या बैंक विवरण अपलोड करें।",
    },
    twin: {
      title: "एआई वित्तीय डिजिटल ट्विन",
      subtitle: "सटीक वित्तीय सिमुलेशन सैंडबॉक्स। वास्तविक निर्णय लेने से पहले परिणामों की जांच करें।",
      simulationNotice: "सभी परिदृश्य आभासी हैं। कोई वास्तविक धन उधार या स्थानांतरित नहीं होता।",
      baselineState: "वर्तमान वित्तीय स्थिति (बेसलाइन)",
      scenarioBranches: "परिकल्पित निर्णय शाखाएं",
      newScenario: "नया सिमुलेशन परिदृश्य बनाएं",
      compareTitle: "बेसलाइन बनाम परिदृश्य तुलना",
      metrics: {
        monthlyCashFlow: "मासिक नकदी प्रवाह",
        debtCoverage: "ऋण सेवा कवरेज (डीएससीआर)",
        emergencyRunway: "आपातकालीन फंड रनवे",
        riskScore: "वित्तीय जोखिम संकेतक",
        savingsRate: "शुद्ध बचत दर",
      },
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
      success: "कार्य सफलतापूर्वक संपन्न हुआ",
      error: "कुछ त्रुटि हुई",
      refresh: "डेटा रीफ़्रेश करें",
      actions: "कार्रवाइयां",
    },
    compliance: {
      sebiNotice:
        "केवल शैक्षिक निर्णय सहायता। सहाय कोई लाइव ट्रेडिंग या गारंटीकृत रिटर्न प्रदान नहीं करता है।",
      deterministicGuarantee:
        "सभी वित्तीय गणनाएं और पात्रता मानदंड आधिकारिक नियमों द्वारा निर्धारित किए जाते हैं।",
      disclaimer: "सहाय एक स्वतंत्र निजी एप्लिकेशन है और किसी भी सरकारी पोर्टल से संबद्ध नहीं है।",
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
      financialTwin: "ফাইন্যান্সিয়াল ডিজিটাল টুইন",
    },
    statuses: {
      draft: "খসড়া (ড্রাফট)",
      documents_needed: "নথিপত্র প্রয়োজন",
      ready_to_submit: "জমা দেওয়ার জন্য প্রস্তুত",
      submitted: "জমা দেওয়া হয়েছে",
      in_review: "পর্যালোচনাধীন",
      action_required: "পদক্ষেপ প্রয়োজন",
      approved: "অনুমোদিত",
      rejected: "প্রত্যাখ্যাত",
      withdrawn: "প্রত্যাহার করা হয়েছে",
      in_progress: "চলমান",
    },
    applications: {
      title: "প্রকল্প আবেদন ও ট্র্যাকার",
      subtitle: "আবেদনের অগ্রগতি, প্রয়োজনীয় নথিপত্র চেকলিস্ট এবং পরবর্তী পদক্ষেপ ট্র্যাক করুন।",
      newApplication: "নতুন আবেদন শুরু করুন",
      checklistTitle: "বাধ্যতামূলক নথিপত্র চেকলিস্ট",
      statusHistoryTitle: "আবেদনের অগ্রগতির অডিট ইতিহাস",
      dueDate: "নির্ধারিত লক্ষ্য তারিখ",
      nextAction: "প্রস্তাবিত পরবর্তী পদক্ষেপ",
      mandatoryDocs: "বাধ্যতামূলক প্রয়োজনীয়তা",
      optionalDocs: "ঐচ্ছিক সহায়ক নথিপত্র",
      attachDocument: "ভল্ট থেকে নথি সংযুক্ত করুন",
      attached: "সংযুক্ত ও যাচাইকৃত",
      submitApplication: "চূড়ান্ত পর্যালোচনার জন্য জমা দিন",
      withdrawApplication: "আবেদন প্রত্যাহার করুন",
      noApplications: "কোনো সক্রিয় আবেদন নেই। শুরু করতে সরকারি প্রকল্পগুলো দেখুন।",
    },
    vault: {
      title: "নথিপত্র ভল্ট ও মেটাডেটা স্টোর",
      subtitle: "ব্যবসায়িক নথিপত্রের নিরাপদ সংগ্রহস্থল। সমস্ত চেকলিস্টে পুনরায় ব্যবহারযোগ্য।",
      uploadTitle: "নতুন নথি আপলোড করুন",
      uploadButton: "ভল্টে আপলোড করুন",
      uploading: "আপলোড ও যাচাইকরণ চলছে...",
      maxSizeNotice: "সর্বোচ্চ ফাইলের আকার: প্রতি ফাইলে ১০ মেগাবাইট।",
      allowedTypesNotice: "অনুমোদিত ফরম্যাট: ক্রিপ্টোগ্রাফিক স্বাক্ষরযুক্ত পিডিএফ, জেপিইজি, পিএনজি।",
      docType: "নথিপত্রের ধরন",
      fileName: "ফাইলের নাম",
      uploadDate: "আপলোডের তারিখ",
      fileSize: "আকার",
      checksum: "এসএইচএ-২৫৬ চেকসাম",
      download: "ডাউনলোড",
      delete: "মুছে ফেলুন",
      deleteConfirm: "আপনি কি নিশ্চিতভাবে এই নথিটি স্থায়ীভাবে মুছে ফেলতে চান?",
      verified: "সরকারিভাবে যাচাইকৃত",
      pending: "যাচাইকরণ প্রক্রিয়াধীন",
      emptyVault: "আপনার নথিপত্র ভল্ট খালি। প্যান, উদ্যোগ বা ব্যাংক স্টেটমেন্ট আপলোড করুন।",
    },
    twin: {
      title: "এআই ফাইন্যান্সিয়াল ডিজিটাল টুইন",
      subtitle: "নির্ভুল আর্থিক সিমুলেশন স্যান্ডবক্স। বাস্তব সিদ্ধান্ত নেওয়ার আগে ফলাফল পরীক্ষা করুন।",
      simulationNotice: "সমস্ত দৃশ্যপট ভার্চুয়াল। কোনো বাস্তব অর্থ লেনদেন বা ধার করা হয় না।",
      baselineState: "বর্তমান আর্থিক অবস্থান (বেসলাইন)",
      scenarioBranches: "কাল্পনিক সিদ্ধান্ত শাখা",
      newScenario: "নতুন সিমুলেশন দৃশ্যপট তৈরি করুন",
      compareTitle: "বেসলাইন বনাম দৃশ্যপট তুলনা",
      metrics: {
        monthlyCashFlow: "মাসিক নগদ প্রবাহ",
        debtCoverage: "ঋণ পরিশোধ কভারেজ (ডিএসসিআর)",
        emergencyRunway: "জরুরি ফান্ড রানওয়ে",
        riskScore: "আর্থিক ঝুঁকি নির্দেশক",
        savingsRate: "নিট সঞ্চয় হার",
      },
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
      success: "কাজটি সফলভাবে সম্পন্ন হয়েছে",
      error: "কিছু সমস্যা হয়েছে",
      refresh: "তথ্য রিফ্রেশ করুন",
      actions: "পদক্ষেপ",
    },
    compliance: {
      sebiNotice:
        "শুধুমাত্র শিক্ষামূলক সিদ্ধান্ত-সহায়তা। সহায় কোনো লাইভ ট্রেডিং বা নিশ্চিত রিটার্নের প্রতিশ্রুতি দেয় না।",
      deterministicGuarantee:
        "সমস্ত আর্থিক হিসাব এবং যোগ্যতা সরকারি নিয়মাবলীর মাধ্যমে নিশ্চিত করা হয়।",
      disclaimer: "সহায় একটি স্বাধীন ব্যক্তিগত প্ল্যাটফর্ম এবং কোনো সরকারি পোর্টালের সাথে যুক্ত নয়।",
    },
  },
};

export function getTranslation(lang: SupportedLanguage = "en"): TranslationDictionary {
  return translations[lang] || translations.en;
}

export function getStoredLanguage(): SupportedLanguage {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("sahay_lang") as SupportedLanguage;
    if (stored && ["en", "hi", "bn"].includes(stored)) {
      return stored;
    }
  }
  return "en";
}

export function setStoredLanguage(lang: SupportedLanguage): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("sahay_lang", lang);
    window.dispatchEvent(new Event("languagechange"));
  }
}

/**
 * Format currency in Indian Numbering System (Lakhs, Crores, ₹)
 */
export function formatCurrencyINR(amount: number, lang: SupportedLanguage = "en"): string {
  if (isNaN(amount)) return "₹0";
  const formatted = amount.toLocaleString(lang === "bn" ? "bn-IN" : lang === "hi" ? "hi-IN" : "en-IN", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  });
  return `₹${formatted}`;
}

/**
 * Audit translation keys across all supported locales to guarantee parity.
 */
export function auditTranslationKeys(): { valid: boolean; missingKeys: string[] } {
  const missingKeys: string[] = [];
  const baseKeys = Object.keys(translations.en) as (keyof TranslationDictionary)[];

  for (const lang of ["hi", "bn"] as SupportedLanguage[]) {
    const dict = translations[lang];
    for (const topKey of baseKeys) {
      if (!(topKey in dict)) {
        missingKeys.push(`${lang}.${topKey}`);
      } else if (typeof translations.en[topKey] === "object") {
        const subKeys = Object.keys(translations.en[topKey]);
        for (const subKey of subKeys) {
          if (!((dict[topKey] as Record<string, unknown>)[subKey])) {
            missingKeys.push(`${lang}.${topKey}.${subKey}`);
          }
        }
      }
    }
  }

  return {
    valid: missingKeys.length === 0,
    missingKeys,
  };
}

/**
 * Custom React hook for dynamic language preference and reactive UI updates.
 */
export function useLanguage() {
  const [lang, setLang] = useState<SupportedLanguage>("en");

  useEffect(() => {
    setLang(getStoredLanguage());
    const handleLangChange = () => setLang(getStoredLanguage());
    window.addEventListener("languagechange", handleLangChange);
    return () => window.removeEventListener("languagechange", handleLangChange);
  }, []);

  return {
    lang,
    setLang: (newLang: SupportedLanguage) => setStoredLanguage(newLang),
    t: translations[lang],
    formatCurrency: (amt: number) => formatCurrencyINR(amt, lang),
  };
}

