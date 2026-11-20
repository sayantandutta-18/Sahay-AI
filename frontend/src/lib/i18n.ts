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
    watchlistTitle: string;
    sortByDeadline: string;
    sortByCreated: string;
    urgentBadge: string;
    dueInDays: string;
    dueToday: string;
    overdue: string;
    changeStatus: string;
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
    moreInfoNeeded: string;
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
  verification: {
    verified: string;
    unverified: string;
    outdated: string;
    verifiedBadge: string;
    unverifiedBadge: string;
    outdatedBadge: string;
    officialSource: string;
    lastVerifiedDate: string;
    verifiedBy: string;
    dialogTitle: string;
    verifiedDesc: string;
    unverifiedDesc: string;
    outdatedDesc: string;
    openPortal: string;
    close: string;
  };
  checklist: {
    title: string;
    completed: string;
    allCompleted: string;
    requiredDocs: string;
    unmetRules: string;
    missingParams: string;
    nextStepAction: string;
    acquired: string;
    missing: string;
    mandatory: string;
    optional: string;
    getDoc: string;
    applyPortal: string;
  };
  readiness: {
    title: string;
    subtitle: string;
    estimatedWarning: string;
    overallScore: string;
    outOf100: string;
    dimensionsTitle: string;
    formulaLabel: string;
    capital: string;
    documents: string;
    vintage: string;
    income: string;
    records: string;
    recalculate: string;
    adjustParameters: string;
    monthlyRevenue: string;
    monthlyExpense: string;
    existingDebt: string;
    turnover: string;
    vintageMonths: string;
    recordKeeping: string;
    informal: string;
    bankRecorded: string;
    formalBooks: string;
    credentialsTitle: string;
  };
  comparison: {
    title: string;
    subtitle: string;
    selectToCompare: string;
    selectedToCompare: string;
    selectedCount: string;
    maxLimitAlert: string;
    clearAll: string;
    viewComparison: string;
    closeComparison: string;
    shareLink: string;
    linkCopied: string;
    stateCoverage: string;
    maxLimit: string;
    schemeType: string;
    interestSubsidy: string;
    documents: string;
    deadline: string;
    verification: string;
    provider: string;
    targetSectors: string;
    officialPortal: string;
    remove: string;
    emptyTitle: string;
    emptyDesc: string;
    stickyParameter: string;
    openInPortal: string;
  };
  search: {
    placeholder: string;
    presetsLabel: string;
    allSchemes: string;
    womenEntrepreneurs: string;
    startupLoans: string;
    msmeSubsidies: string;
    mudraLoans: string;
    streetVendors: string;
    collateralFree: string;
    noResultsTitle: string;
    noResultsMessage: string;
    suggestionsTitle: string;
    suggestionWomen: string;
    suggestionSubsidies: string;
    suggestionLoans: string;
    clearSearch: string;
    resultsFound: string;
    showingAll: string;
  };
  stateMap: {
    title: string;
    subtitle: string;
    mapView: string;
    listView: string;
    selectedState: string;
    allIndia: string;
    clearStateFilter: string;
    schemesAvailable: string;
    svgFallbackNotice: string;
    searchStatePlaceholder: string;
    filterByState: string;
    statesAndUTs: string;
    westBengalNotice: string;
    selectStatePrompt: string;
  };
  tour: {
    startTour: string;
    stepIndicator: string;
    next: string;
    prev: string;
    finish: string;
    skip: string;
    step1Title: string;
    step1Desc: string;
    step2Title: string;
    step2Desc: string;
    step3Title: string;
    step3Desc: string;
    tooltipHelp: string;
  };
  aiMode: {
    modeLabel: string;
    auto: string;
    demo: string;
    live: string;
    liveBadge: string;
    demoBadge: string;
    fallbackBadge: string;
    fallbackNotice: string;
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
      watchlistTitle: "Deadline Watchlist & Tracker",
      sortByDeadline: "Sort by Deadline",
      sortByCreated: "Sort by Created Date",
      urgentBadge: "URGENT",
      dueInDays: "Due in {days} days",
      dueToday: "Due Today",
      overdue: "Deadline Passed",
      changeStatus: "Change Status",
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
      moreInfoNeeded: "More Info Needed",
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
    verification: {
      verified: "Verified",
      unverified: "Unverified",
      outdated: "Outdated",
      verifiedBadge: "VERIFIED",
      unverifiedBadge: "UNVERIFIED",
      outdatedBadge: "OUTDATED",
      officialSource: "Official Source Portal",
      lastVerifiedDate: "Last Verified Date",
      verifiedBy: "Verifying Authority",
      dialogTitle: "Official Verification Status",
      verifiedDesc: "This scheme was verified against the official government gazette / portal notification.",
      unverifiedDesc: "Caution: This information has not yet been verified against a primary government portal.",
      outdatedDesc: "Notice: This scheme was last checked >180 days ago. Requirements or financial limits may have changed.",
      openPortal: "Visit Official Portal",
      close: "Close",
    },
    checklist: {
      title: "What's Still Missing & Action Checklist",
      completed: "Completed",
      allCompleted: "All requirements fulfilled! You are ready to apply on the official portal.",
      requiredDocs: "Required Application Documents",
      unmetRules: "Unmet Criteria to Address",
      missingParams: "Missing Profile Information Needed",
      nextStepAction: "Recommended Action to Unlock",
      acquired: "Acquired",
      missing: "Missing",
      mandatory: "Mandatory",
      optional: "Optional",
      getDoc: "Official Source Portal",
      applyPortal: "Proceed to Official Application Portal",
    },
    readiness: {
      title: "Micro-Business Readiness Radar",
      subtitle: "5-dimension auditable readiness assessment based on deterministic formulas.",
      estimatedWarning: "Warning: This score is an estimated micro-business readiness indicator, not an official government or institutional eligibility decision.",
      overallScore: "Overall Enterprise Readiness",
      outOf100: "out of 100",
      dimensionsTitle: "Readiness Dimension Breakdown & Formulas",
      formulaLabel: "Calculation Rule",
      capital: "Capital & Financial Buffer",
      documents: "Document Readiness",
      vintage: "Business Vintage & Stability",
      income: "Regular Income & Turnover",
      records: "Record-Keeping & Formalization",
      recalculate: "Recalculate Readiness",
      adjustParameters: "Interactive Business Parameters",
      monthlyRevenue: "Monthly Revenue (₹)",
      monthlyExpense: "Monthly Operational Expense (₹)",
      existingDebt: "Existing Monthly Debt / EMI (₹)",
      turnover: "Annual Gross Turnover (₹)",
      vintageMonths: "Months in Operation",
      recordKeeping: "Accounting / Record Method",
      informal: "Informal Cash Records",
      bankRecorded: "Active Bank Records",
      formalBooks: "Auditable Digital Books & GST",
      credentialsTitle: "Verified Credentials",
    },
    comparison: {
      title: "Scheme Comparison",
      subtitle: "Compare up to 6 government schemes side-by-side to choose the best option for your business.",
      selectToCompare: "Compare",
      selectedToCompare: "Selected",
      selectedCount: "{count} of 6 selected",
      maxLimitAlert: "You can compare up to 6 schemes at once. Please deselect a scheme to add another.",
      clearAll: "Clear Selection",
      viewComparison: "Compare Schemes",
      closeComparison: "Back to Schemes",
      shareLink: "Share Comparison",
      linkCopied: "Comparison link copied to clipboard!",
      stateCoverage: "State Coverage",
      maxLimit: "Maximum Financial Limit",
      schemeType: "Support Type",
      interestSubsidy: "Interest Subsidy",
      documents: "Required Documents",
      deadline: "Application Deadline",
      verification: "Verification Status",
      provider: "Ministry / Authority",
      targetSectors: "Target Sectors",
      officialPortal: "Official Portal",
      remove: "Remove",
      emptyTitle: "No Schemes Selected for Comparison",
      emptyDesc: "Select up to 6 schemes from the library to compare their coverage, subsidies, documents, and deadlines side-by-side.",
      stickyParameter: "Comparison Feature",
      openInPortal: "Open Official Portal",
    },
    search: {
      placeholder: "Search by scheme title, keywords, or purpose (e.g., মহিলা, loans, subsidy)...",
      presetsLabel: "Quick Presets:",
      allSchemes: "All Schemes",
      womenEntrepreneurs: "Women Entrepreneurs",
      startupLoans: "Startup Loans",
      msmeSubsidies: "MSME Subsidies",
      mudraLoans: "MUDRA Microloans",
      streetVendors: "Street Vendors",
      collateralFree: "Collateral-Free",
      noResultsTitle: "No Schemes Found",
      noResultsMessage: "We couldn't find any verified schemes matching \"{query}\".",
      suggestionsTitle: "Suggested alternatives to explore:",
      suggestionWomen: "Explore Women Entrepreneur Schemes (মহিলা)",
      suggestionSubsidies: "Browse All Capital Subsidies",
      suggestionLoans: "View MUDRA and Startup Loans",
      clearSearch: "Clear Filters & Search",
      resultsFound: "Found {count} matching verified schemes",
      showingAll: "Showing all verified schemes",
    },
    stateMap: {
      title: "State-Level Scheme Directory",
      subtitle: "Click any state or Union Territory on the map to see available Central and State government schemes.",
      mapView: "Interactive Map",
      listView: "Accessible State List",
      selectedState: "Selected State: {state}",
      allIndia: "All India (Pan-India)",
      clearStateFilter: "Reset State Filter",
      schemesAvailable: "{count} schemes available",
      svgFallbackNotice: "Map view is optimized for modern browsers. You can also use the accessible state list below.",
      searchStatePlaceholder: "Search state or Union Territory (e.g., West Bengal, Maharashtra)...",
      filterByState: "Filter by State",
      statesAndUTs: "All 28 States & 8 Union Territories",
      westBengalNotice: "Showing Central & West Bengal State MSME schemes (including Banglashree).",
      selectStatePrompt: "Select a state to filter regional and state-specific programs.",
    },
    tour: {
      startTour: "Quick Tour",
      stepIndicator: "Step {current} of {total}",
      next: "Next",
      prev: "Back",
      finish: "Finish Tour",
      skip: "Skip Tour",
      step1Title: "1. Search & Presets",
      step1Desc: "Find schemes in English or Bengali by keyword (e.g. 'মহিলা', 'loans', 'subsidies') or click preset chips for instant filtering.",
      step2Title: "2. State Directory & Map",
      step2Desc: "Filter schemes by your state or Union Territory using the interactive map or accessible list. View West Bengal and Pan-India programs.",
      step3Title: "3. Compare Schemes Side-by-Side",
      step3Desc: "Select up to 6 schemes to compare subsidies, credit limits, documents, and deadlines in a mobile-friendly sticky matrix.",
      tooltipHelp: "Tap or hover over dotted terms anytime to view technical definitions.",
    },
    aiMode: {
      modeLabel: "AI Operating Mode",
      auto: "Auto Mode",
      demo: "Demo Mode (Offline)",
      live: "Live AI Mode (Gemini)",
      liveBadge: "Live AI",
      demoBadge: "Verified Demo",
      fallbackBadge: "Offline Fallback",
      fallbackNotice: "Notice: Live AI unavailable ({reason}). Serving verified offline answer.",
      disclaimer: "Disclaimer: Sahay AI provides informational guidance based on public government guidelines and deterministic calculations. Answers do not constitute legal, tax, or formal credit approval. Official sanctions are issued solely by respective banks and government nodal agencies.",
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
      watchlistTitle: "समय-सीमा वॉचलिस्ट और ट्रैकर",
      sortByDeadline: "समय-सीमा अनुसार क्रमबद्ध करें",
      sortByCreated: "निर्माण तिथि अनुसार क्रमबद्ध करें",
      urgentBadge: "अति आवश्यक",
      dueInDays: "{days} दिनों में देय",
      dueToday: "आज ही देय",
      overdue: "समय-सीमा समाप्त",
      changeStatus: "स्थिति बदलें",
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
      moreInfoNeeded: "अधिक जानकारी आवश्यक",
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
    verification: {
      verified: "सत्यापित",
      unverified: "असत्यापित",
      outdated: "पुराना (समीक्षा लंबित)",
      verifiedBadge: "सत्यापित",
      unverifiedBadge: "असत्यापित",
      outdatedBadge: "पुराना",
      officialSource: "आधिकारिक पोर्टल स्रोत",
      lastVerifiedDate: "अंतिम सत्यापन तिथि",
      verifiedBy: "सत्यापन प्राधिकरण",
      dialogTitle: "आधिकारिक सत्यापन स्थिति",
      verifiedDesc: "इस योजना को आधिकारिक सरकारी गजट/पोर्टल अधिसूचना से सत्यापित किया गया है।",
      unverifiedDesc: "सावधानी: इस जानकारी को अभी तक किसी प्राथमिक सरकारी पोर्टल से सत्यापित नहीं किया गया है।",
      outdatedDesc: "सूचना: इस योजना की अंतिम जांच 180 दिन से पहले हुई थी। नियम या वित्तीय सीमाएं बदल सकती हैं।",
      openPortal: "आधिकारिक पोर्टल पर जाएं",
      close: "बंद करें",
    },
    checklist: {
      title: "क्या अभी भी बाकी है और कार्य चेकलिस्ट",
      completed: "पूर्ण",
      allCompleted: "सभी आवश्यकताएं पूरी हुईं! आप आधिकारिक पोर्टल पर आवेदन करने के लिए तैयार हैं।",
      requiredDocs: "आवश्यक आवेदन दस्तावेज़",
      unmetRules: "समाधान के लिए अपूर्ण मानदंड",
      missingParams: "आवश्यक अपूर्ण प्रोफ़ाइल विवरण",
      nextStepAction: "पात्रता अनलॉक करने के लिए अगला कदम",
      acquired: "प्राप्त",
      missing: "बाकी",
      mandatory: "अनिवार्य",
      optional: "वैकल्पिक",
      getDoc: "आधिकारिक स्रोत पोर्टल",
      applyPortal: "आधिकारिक आवेदन पोर्टल पर जाएं",
    },
    readiness: {
      title: "सूक्ष्म-व्यवसाय तत्परता रडार",
      subtitle: "निश्चित गणितीय नियमों पर आधारित 5-आयामी सत्यापन योग्य तत्परता मूल्यांकन।",
      estimatedWarning: "चेतावनी: यह स्कोर एक अनुमानित सूक्ष्म-व्यवसाय तत्परता संकेतक है, आधिकारिक सरकारी या संस्थागत पात्रता निर्णय नहीं।",
      overallScore: "कुल उद्यम तत्परता",
      outOf100: "100 में से",
      dimensionsTitle: "तत्परता आयाम विवरण और गणना सूत्र",
      formulaLabel: "गणना नियम",
      capital: "पूंजी और वित्तीय बफर",
      documents: "दस्तावेज़ तत्परता",
      vintage: "व्यापारिक अनुभव और स्थिरता",
      income: "नियमित आय और कारोबार",
      records: "रिकॉर्ड-रखरखाव और औपचारिकता",
      recalculate: "पुनः गणना करें",
      adjustParameters: "इंटरएक्टिव व्यापार पैरामीटर",
      monthlyRevenue: "मासिक राजस्व (₹)",
      monthlyExpense: "मासिक परिचालन व्यय (₹)",
      existingDebt: "मौजूदा मासिक ऋण / ईएमआई (₹)",
      turnover: "वार्षिक सकल कारोबार (₹)",
      vintageMonths: "संचालन के महीने",
      recordKeeping: "लेखा / रिकॉर्ड विधि",
      informal: "अनौपचारिक नकद रिकॉर्ड",
      bankRecorded: "सक्रिय बैंक रिकॉर्ड",
      formalBooks: "सत्यापन योग्य डिजिटल बहीखाता और जीएसटी",
      credentialsTitle: "सत्यापित क्रेडेंशियल",
    },
    comparison: {
      title: "योजना तुलना",
      subtitle: "अपने व्यवसाय के लिए सबसे अच्छा विकल्प चुनने के लिए 6 सरकारी योजनाओं की साथ-साथ तुलना करें।",
      selectToCompare: "तुलना करें",
      selectedToCompare: "चयनित",
      selectedCount: "6 में से {count} चयनित",
      maxLimitAlert: "आप एक बार में अधिकतम 6 योजनाओं की तुलना कर सकते हैं। दूसरी योजना जोड़ने के लिए कृपया किसी चयनित योजना को हटाएं।",
      clearAll: "चयन हटाएं",
      viewComparison: "योजनाओं की तुलना करें",
      closeComparison: "योजनाओं पर वापस जाएं",
      shareLink: "तुलना लिंक साझा करें",
      linkCopied: "तुलना लिंक क्लिपबोर्ड पर कॉपी हो गया!",
      stateCoverage: "राज्य कवरेज",
      maxLimit: "अधिकतम वित्तीय सीमा",
      schemeType: "सहायता का प्रकार",
      interestSubsidy: "ब्याज सब्सिडी",
      documents: "आवश्यक दस्तावेज़",
      deadline: "आवेदन की अंतिम तिथि",
      verification: "सत्यापन स्थिति",
      provider: "मंत्रालय / प्राधिकरण",
      targetSectors: "लक्षित क्षेत्र",
      officialPortal: "आधिकारिक पोर्टल",
      remove: "हटाएं",
      emptyTitle: "तुलना के लिए कोई योजना नहीं चुनी गई",
      emptyDesc: "कवरेज, सब्सिडी, दस्तावेज़ और समय-सीमा की साथ-साथ तुलना करने के लिए लाइब्रेरी से अधिकतम 6 योजनाओं का चयन करें।",
      stickyParameter: "तुलना विशेषता",
      openInPortal: "आधिकारिक पोर्टल खोलें",
    },
    search: {
      placeholder: "योजना का नाम, कीवर्ड या उद्देश्य खोजें (जैसे महिला, ऋण, सब्सिडी)...",
      presetsLabel: "त्वरित श्रेणियां:",
      allSchemes: "सभी योजनाएं",
      womenEntrepreneurs: "महिला उद्यमी",
      startupLoans: "स्टार्टअप ऋण",
      msmeSubsidies: "एमएसएमई सब्सिडी",
      mudraLoans: "मुद्रा माइक्रो ऋण",
      streetVendors: "रेहड़ी-पटरी विक्रेता",
      collateralFree: "बिना गारंटी ऋण",
      noResultsTitle: "कोई योजना नहीं मिली",
      noResultsMessage: "\"{query}\" से मेल खाती कोई सत्यापित योजना नहीं मिली।",
      suggestionsTitle: "सुझाई गई श्रेणियां देखें:",
      suggestionWomen: "महिला उद्यमी योजनाएं देखें (মহিলা / महिला)",
      suggestionSubsidies: "सभी पूंजी सब्सिडी देखें",
      suggestionLoans: "मुद्रा और स्टार्टअप ऋण देखें",
      clearSearch: "फ़िल्टर और खोज साफ़ करें",
      resultsFound: "{count} सत्यापित योजनाएं मिलीं",
      showingAll: "सभी सत्यापित योजनाएं प्रदर्शित हैं",
    },
    stateMap: {
      title: "राज्य-स्तरीय योजना निर्देशिका",
      subtitle: "उपलब्ध केंद्रीय और राज्य सरकार की योजनाओं को देखने के लिए मानचित्र पर किसी भी राज्य या केंद्र शासित प्रदेश पर क्लिक करें।",
      mapView: "इंटरएक्टिव मानचित्र",
      listView: "सुलभ राज्य सूची",
      selectedState: "चयनित राज्य: {state}",
      allIndia: "अखिल भारतीय (पैन-इंडिया)",
      clearStateFilter: "राज्य फ़िल्टर हटाएं",
      schemesAvailable: "{count} योजनाएं उपलब्ध",
      svgFallbackNotice: "मानचित्र दृश्य आधुनिक ब्राउज़रों के लिए अनुकूलित है। आप नीचे दी गई सुलभ राज्य सूची का भी उपयोग कर सकते हैं।",
      searchStatePlaceholder: "राज्य या केंद्र शासित प्रदेश खोजें (जैसे पश्चिम बंगाल, महाराष्ट्र)...",
      filterByState: "राज्य अनुसार फ़िल्टर करें",
      statesAndUTs: "सभी 28 राज्य और 8 केंद्र शासित प्रदेश",
      westBengalNotice: "केंद्रीय और पश्चिम बंगाल राज्य एमएसएमई योजनाएं (बांग्लाश्री सहित) प्रदर्शित हैं।",
      selectStatePrompt: "क्षेत्रीय और राज्य-विशिष्ट कार्यक्रमों को फ़िल्टर करने के लिए कोई राज्य चुनें।",
    },
    tour: {
      startTour: "त्वरित टूर",
      stepIndicator: "चरण {total} में से {current}",
      next: "अगला",
      prev: "पीछे",
      finish: "टूर समाप्त करें",
      skip: "छोड़ें",
      step1Title: "1. खोज और त्वरित श्रेणियां",
      step1Desc: "कीवर्ड (जैसे 'महिला', 'ऋण', 'सब्सिडी') से योजनाएं खोजें या तुरंत फ़िल्टर करने के लिए त्वरित चिप्स पर क्लिक करें।",
      step2Title: "2. राज्य निर्देशिका और मानचित्र",
      step2Desc: "इंटरएक्टिव मानचित्र या सुलभ सूची से अपने राज्य की योजनाएं देखें। पश्चिम बंगाल और अखिल भारतीय योजनाएं फ़िल्टर करें।",
      step3Title: "3. योजनाओं की साथ-साथ तुलना",
      step3Desc: "मोबाइल-अनुकूल तालिका में सब्सिडी, ऋण सीमा, दस्तावेज़ और समय-सीमा की तुलना करने के लिए अधिकतम 6 योजनाएं चुनें।",
      tooltipHelp: "तकनीकी परिभाषाएं देखने के लिए कभी भी रेखांकित शब्दों पर टैप या होवर करें।",
    },
    aiMode: {
      modeLabel: "एआई ऑपरेटिंग मोड",
      auto: "स्वचालित (ऑटो)",
      demo: "डेमो मोड (ऑफलाइन)",
      live: "लाइव एआई (जेमिनी)",
      liveBadge: "लाइव एआई",
      demoBadge: "सत्यापित डेमो",
      fallbackBadge: "ऑफलाइन फ़ॉलबैक",
      fallbackNotice: "सूचना: लाइव एआई अनुपलब्ध ({reason})। सुरक्षित सत्यापित ऑफलाइन उत्तर प्रदर्शित किया गया।",
      disclaimer: "अस्वीकरण: सहाय एआई सार्वजनिक सरकारी दिशानिर्देशों और वित्तीय गणनाओं पर आधारित सूचनात्मक मार्गदर्शन प्रदान करता है। यह उत्तर कानूनी, कर या ऋण स्वीकृति का गठन नहीं करता।",
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
      watchlistTitle: "সময়সীমা নজরতালিকা ও ট্র্যাকার",
      sortByDeadline: "সময়সীমা অনুযায়ী সাজান",
      sortByCreated: "তৈরির তারিখ অনুযায়ী সাজান",
      urgentBadge: "জরুরি",
      dueInDays: "{days} দিনের মধ্যে জমা দিতে হবে",
      dueToday: "আজই শেষ দিন",
      overdue: "সময়সীমা অতিক্রান্ত",
      changeStatus: "অবস্থা পরিবর্তন করুন",
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
      moreInfoNeeded: "আরও তথ্য প্রয়োজন",
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
    verification: {
      verified: "যাচাইকৃত",
      unverified: "অযাচাইকৃত",
      outdated: "মেয়াদোত্তীর্ণ (পুনঃযাচাই বাকি)",
      verifiedBadge: "যাচাইকৃত",
      unverifiedBadge: "অযাচাইকৃত",
      outdatedBadge: "মেয়াদোত্তীর্ণ",
      officialSource: "অফিসিয়াল পোর্টাল উৎস",
      lastVerifiedDate: "সর্বশেষ যাচাইয়ের তারিখ",
      verifiedBy: "যাচাইকারী কর্তৃপক্ষ",
      dialogTitle: "অফিসিয়াল যাচাইকরণ স্থিতি",
      verifiedDesc: "এই প্রকল্পটি সরাসরি সরকারি গেজেট বা পোর্টাল বিজ্ঞপ্তি থেকে যাচাই করা হয়েছে।",
      unverifiedDesc: "সতর্কতা: এই তথ্যটি এখনও কোনো প্রাথমিক সরকারি পোর্টাল থেকে যাচাই করা হয়নি।",
      outdatedDesc: "বিজ্ঞপ্তি: এই প্রকল্পটি ১৮০ দিনেরও বেশি আগে যাচাই করা হয়েছিল। নিয়ম বা অনুদান সীমা পরিবর্তিত হতে পারে।",
      openPortal: "অফিসিয়াল পোর্টালে যান",
      close: "বন্ধ করুন",
    },
    checklist: {
      title: "কী এখনও বাকি আছে এবং অ্যাকশন চেকলিস্ট",
      completed: "সম্পূর্ণ",
      allCompleted: "সমস্ত প্রয়োজনীয়তা পূরণ হয়েছে! আপনি অফিসিয়াল পোর্টালে আবেদনের জন্য প্রস্তুত।",
      requiredDocs: "প্রয়োজনীয় আবেদনপত্র ও নথি",
      unmetRules: "সমাধানযোগ্য অপূর্ণ শর্তাবলী",
      missingParams: "প্রয়োজনীয় অনুপস্থিত প্রোফাইল তথ্য",
      nextStepAction: "যোগ্যতা বৃদ্ধির প্রস্তাবিত পদক্ষেপ",
      acquired: "সংগৃহীত",
      missing: "বাকি",
      mandatory: "বাধ্যতামূলক",
      optional: "ঐচ্ছিক",
      getDoc: "অফিসিয়াল পোর্টাল উৎস",
      applyPortal: "অফিসিয়াল আবেদন পোর্টালে যান",
    },
    readiness: {
      title: "ক্ষুদ্র-ব্যবসা প্রস্তুতি রাডার",
      subtitle: "নির্দিষ্ট নিয়মের ওপর ভিত্তি করে ৫-মাত্রিক যাচাইযোগ্য প্রস্তুতি মূল্যায়ন।",
      estimatedWarning: "সতর্কতা: এই স্কোরটি একটি আনুমানিক ব্যবসায়িক প্রস্তুতির সূচক, কোনো সরকারি বা প্রাতিষ্ঠানিক আনুষ্ঠানিক যোগ্যতার সিদ্ধান্ত নয়।",
      overallScore: "সামগ্রিক ব্যবসায়িক প্রস্তুতি",
      outOf100: "১০০ এর মধ্যে",
      dimensionsTitle: "প্রস্তুতি মাত্রা বিশ্লেষণ ও গণনার নিয়ম",
      formulaLabel: "গণনার নিয়ম",
      capital: "মূলধন ও আর্থিক সুরক্ষা",
      documents: "নথিপত্র প্রস্তুতি",
      vintage: "ব্যবসার বয়স ও স্থায়িত্ব",
      income: "নিয়মিত আয় ও টার্নওভার",
      records: "হিসাবরক্ষণ ও আনুষ্ঠানিকতা",
      recalculate: "পুনরায় হিসাব করুন",
      adjustParameters: "ইন্টারেক্টিভ ব্যবসায়িক পরামিতি",
      monthlyRevenue: "মাসিক আয় (₹)",
      monthlyExpense: "মাসিক পরিচালন খরচ (₹)",
      existingDebt: "বিদ্যমান মাসিক ঋণ / ইএমআই (₹)",
      turnover: "বার্ষিক মোট টার্নওভার (₹)",
      vintageMonths: "পরিচালনার মাস",
      recordKeeping: "হিসাবরক্ষণ পদ্ধতি",
      informal: "অনানুষ্ঠানিক নগদ হিসাব",
      bankRecorded: "সক্রিয় ব্যাংক লেনদেন",
      formalBooks: "যাচাইযোগ্য ডিজিটাল হিসাব ও জিএসটি",
      credentialsTitle: "যাচাইকৃত প্রশংসাপত্র",
    },
    comparison: {
      title: "স্কিম তুলনা",
      subtitle: "আপনার ব্যবসার জন্য সেরা বিকল্পটি বেছে নিতে একসাথে ৬টি সরকারি স্কিমের পাশাপাশি তুলনা করুন।",
      selectToCompare: "তুলনা করুন",
      selectedToCompare: "নির্বাচিত",
      selectedCount: "৬ টির মধ্যে {count} টি নির্বাচিত",
      maxLimitAlert: "আপনি একসাথে সর্বোচ্চ ৬টি স্কিমের তুলনা করতে পারেন। অন্য স্কিম যোগ করতে অনুগ্রহ করে একটি স্কিম বাদ দিন।",
      clearAll: "নির্বাচন মুছুন",
      viewComparison: "স্কিমগুলি তুলনা করুন",
      closeComparison: "স্কিম তালিকায় ফিরুন",
      shareLink: "তুলনা লিঙ্ক শেয়ার করুন",
      linkCopied: "তুলনা লিঙ্ক ক্লিপবোর্ডে কপি করা হয়েছে!",
      stateCoverage: "রাজ্য কভারেজ",
      maxLimit: "সর্বোচ্চ আর্থিক সুবিধা",
      schemeType: "সহায়তার ধরন",
      interestSubsidy: "সুদ ভর্তুকি",
      documents: "প্রয়োজনীয় নথিপত্র",
      deadline: "আবেদনের সময়সীমা",
      verification: "যাচাইকরণ স্থিতি",
      provider: "মন্ত্রণালয় / কর্তৃপক্ষ",
      targetSectors: "লক্ষ্যভিত্তিক খাত",
      officialPortal: "অফিসিয়াল পোর্টাল",
      remove: "মুছুন",
      emptyTitle: "তুলনার জন্য কোনো স্কিম নির্বাচিত হয়নি",
      emptyDesc: "কভারেজ, ভর্তুকি, নথিপত্র এবং সময়সীমার পাশাপাশি তুলনা করতে লাইব্রেরি থেকে সর্বোচ্চ ৬টি স্কিম বেছে নিন।",
      stickyParameter: "তুলনা বৈশিষ্ট্য",
      openInPortal: "অফিসিয়াল পোর্টাল খুলুন",
    },
    search: {
      placeholder: "স্কিমের নাম, উদ্দেশ্য বা কীওয়ার্ড দিয়ে খুঁজুন (যেমন মহিলা, ঋণ, ভর্তুকি)...",
      presetsLabel: "দ্রুত ফিল্টার:",
      allSchemes: "সকল স্কিম",
      womenEntrepreneurs: "মহিলা উদ্যোক্তা",
      startupLoans: "স্টার্টআপ ঋণ",
      msmeSubsidies: "এমএসএমই ভর্তুকি",
      mudraLoans: "মুদ্রা ক্ষুদ্র ঋণ",
      streetVendors: "পথ বিক্রেতা",
      collateralFree: "জামানতহীন ঋণ",
      noResultsTitle: "কোনো স্কিম পাওয়া যায়নি",
      noResultsMessage: "\"{query}\" এর সাথে মেলে এমন কোনো যাচাইকৃত স্কিম খুঁজে পাওয়া যায়নি।",
      suggestionsTitle: "বিকল্প অনুসন্ধান পরামর্শ:",
      suggestionWomen: "মহিলা উদ্যোক্তা স্কিমগুলি দেখুন (মহিলা)",
      suggestionSubsidies: "সকল সরকারি ভর্তুকি দেখুন",
      suggestionLoans: "মুদ্রা ও নতুন ব্যবসার ঋণ দেখুন",
      clearSearch: "ফিল্টার ও অনুসন্ধান মুছুন",
      resultsFound: "{count} টি যাচাইকৃত স্কিম পাওয়া গেছে",
      showingAll: "সকল যাচাইকৃত স্কিম দেখানো হচ্ছে",
    },
    stateMap: {
      title: "রাজ্য-ভিত্তিক সরকারি প্রকল্প নির্দেশিকা",
      subtitle: "উপলব্ধ কেন্দ্রীয় ও রাজ্য সরকারি প্রকল্পগুলি দেখতে মানচিত্রে যেকোনো রাজ্য বা কেন্দ্রশাসিত অঞ্চলে ক্লিক করুন।",
      mapView: "ইন্টারেক্টিভ মানচিত্র",
      listView: "সহজগম্য রাজ্য তালিকা",
      selectedState: "নির্বাচিত রাজ্য: {state}",
      allIndia: "সমগ্র ভারত (প্যান-ইন্ডিয়া)",
      clearStateFilter: "রাজ্য ফিল্টার মুছুন",
      schemesAvailable: "{count} টি প্রকল্প উপলব্ধ",
      svgFallbackNotice: "মানচিত্র দৃশ্যটি আধুনিক ব্রাউজারের জন্য অপ্টিমাইজ করা হয়েছে। আপনি নীচের সহজগম্য রাজ্য তালিকাটিও ব্যবহার করতে পারেন।",
      searchStatePlaceholder: "রাজ্য বা কেন্দ্রশাসিত অঞ্চল খুঁজুন (যেমন পশ্চিমবঙ্গ, মহারাষ্ট্র)...",
      filterByState: "রাজ্য অনুযায়ী ফিল্টার করুন",
      statesAndUTs: "সকল ২৮টি রাজ্য ও ৮টি কেন্দ্রশাসিত অঞ্চল",
      westBengalNotice: "কেন্দ্রীয় ও পশ্চিমবঙ্গ রাজ্য এমএসএমই প্রকল্প (বাংলাশ্রী সহ) দেখানো হচ্ছে।",
      selectStatePrompt: "আঞ্চলিক ও রাজ্য-নির্দিষ্ট প্রকল্পগুলি ফিল্টার করতে একটি রাজ্য নির্বাচন করুন।",
    },
    tour: {
      startTour: "কুইক ট্যুর",
      stepIndicator: "ধাপ {current} / {total}",
      next: "পরবর্তী",
      prev: "পূর্ববর্তী",
      finish: "ট্যুর শেষ করুন",
      skip: "বাদ দিন",
      step1Title: "১. বহুভাষিক অনুসন্ধান ও ফিল্টার",
      step1Desc: "বাংলা বা ইংরেজিতে কীওয়ার্ড (যেমন 'মহিলা', 'ঋণ', 'ভর্তুকি') দিয়ে খুঁজুন অথবা দ্রুত ফিল্টারের জন্য চিপস ক্লিক করুন।",
      step2Title: "২. রাজ্য নির্দেশিকা ও মানচিত্র",
      step2Desc: "মানচিত্র বা সহজগম্য তালিকা ব্যবহার করে আপনার রাজ্যের প্রকল্পগুলি দেখুন। পশ্চিমবঙ্গ ও সমগ্র ভারতের কর্মসূচি ফিল্টার করুন।",
      step3Title: "৩. পাশাপাশি ৬টি স্কিমের তুলনা",
      step3Desc: "ভর্তুকি, ঋণের সীমা, প্রয়োজনীয় নথিপত্র এবং সময়সীমা তুলনা করতে একসাথে সর্বোচ্চ ৬টি স্কিম বেছে নিন।",
      tooltipHelp: "প্রযুক্তিগত সংজ্ঞা দেখতে ডটেড আন্ডারলাইন করা শব্দগুলিতে ট্যাপ বা হোভার করুন।",
    },
    aiMode: {
      modeLabel: "এআই অপারেটিং মোড",
      auto: "স্বয়ংক্রিয় (অটো)",
      demo: "ডেমো মোড (অফলাইন)",
      live: "লাইভ এআই (জেমিনি)",
      liveBadge: "লাইভ এআই",
      demoBadge: "যাচাইকৃত ডেমো",
      fallbackBadge: "অফলাইন ফলব্যাক",
      fallbackNotice: "বিজ্ঞপ্তি: লাইভ এআই অনুপলব্ধ ({reason})। নিরাপদ যাচাইকৃত অফলাইন উত্তর দেখানো হচ্ছে।",
      disclaimer: "সতর্কবার্তা: সহায় এআই সরকারি নির্দেশিকা ও গাণিতিক হিসাবের ভিত্তিতে তথ্যভিত্তিক সহায়তা প্রদান করে। এটি কোনো আইনি পরামর্শ বা ব্যাংক ঋণ মঞ্জুরিপত্র নয়।",
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

