/**
 * Authoritative Glossary of Technical Government & Micro-Finance Terms
 * Explained simply for Indian micro-entrepreneurs in English, Hindi, and Bengali.
 */

export interface GlossaryDefinition {
  term: string;
  aliases: string[];
  titleEn: string;
  titleHi: string;
  titleBn: string;
  defEn: string;
  defHi: string;
  defBn: string;
  exampleEn?: string;
  exampleHi?: string;
  exampleBn?: string;
  category: "subsidy" | "loan" | "compliance" | "general";
}

export const GLOSSARY_TERMS: Record<string, GlossaryDefinition> = {
  msme: {
    term: "MSME",
    aliases: ["msme", "micro enterprise", "small enterprise", "ক্ষুদ্র উদ্যোগ", "सूक्ष्म उद्यम"],
    titleEn: "Micro, Small & Medium Enterprises (MSME)",
    titleHi: "सूक्ष्म, लघु एवं मध्यम उद्यम (एमएसएमई)",
    titleBn: "ক্ষুদ্র, ছোট ও মাঝারি উদ্যোগ (এমএসএমই)",
    defEn: "Official government classification for businesses. Micro units have investment under ₹1 Crore and annual turnover under ₹5 Crores.",
    defHi: "व्यवसायों के लिए आधिकारिक सरकारी वर्गीकरण। सूक्ष्म इकाइयों का निवेश ₹1 करोड़ से कम और वार्षिक कारोबार ₹5 करोड़ से कम होता है।",
    defBn: "ব্যবসার জন্য সরকারি আনুষ্ঠানিক শ্রেণিবিভাগ। ক্ষুদ্র ইউনিটের মূলধনী বিনিয়োগ ১ কোটি টাকার কম এবং বার্ষিক টার্নওভার ৫ কোটি টাকার কম।",
    exampleEn: "Example: Grocery stores, garment stitching units, bakeries, tea stalls, and repair workshops.",
    category: "general",
  },
  pmegp: {
    term: "PMEGP",
    aliases: ["pmegp", "prime minister employment generation programme", "পিএমইজিপি"],
    titleEn: "Prime Minister Employment Generation Programme",
    titleHi: "प्रधानमंत्री रोजगार सृजन कार्यक्रम (PMEGP)",
    titleBn: "প্রধানমন্ত্রী কর্মসংস্থান সৃষ্টি কর্মসূচি (পিএমইজিপি)",
    defEn: "A major central subsidy scheme providing 15% to 35% margin money grant on bank loans for setting up new non-farm enterprises up to ₹50 Lakhs.",
    defHi: "एक प्रमुख केंद्रीय सब्सिडी योजना जो ₹50 लाख तक के नए गैर-कृषि उद्यम स्थापित करने के लिए बैंक ऋण पर 15% से 35% मार्जिन मनी अनुदान देती है।",
    defBn: "একটি প্রধান কেন্দ্রীয় ভর্তুকি প্রকল্প যা ৫০ লাখ টাকা পর্যন্ত ব্যাংক ঋণের উপর ১৫% থেকে ৩৫% অ-ফেরতযোগ্য মার্জিন মানি অনুদান প্রদান করে।",
    category: "subsidy",
  },
  mudra: {
    term: "MUDRA",
    aliases: ["mudra", "pmmy", "shishu", "kishore", "tarun", "মুদ্রা"],
    titleEn: "Micro Units Development & Refinance Agency (MUDRA)",
    titleHi: "प्रधानमंत्री मुद्रा योजना (MUDRA)",
    titleBn: "প্রধানমন্ত্রী মুদ্রা যোজনা (মুদ্রা)",
    defEn: "Collateral-free commercial bank loans up to ₹10 Lakhs categorized into Shishu (up to ₹50K), Kishore (₹50K-₹5L), and Tarun (₹5L-₹10L).",
    defHi: "बिना किसी गारंटी के ₹10 लाख तक का बैंक ऋण, जिसे शिशु (₹50,000 तक), किशोर (₹50 हजार-₹5 लाख) और तरुण (₹5-10 लाख) में बांटा गया है।",
    defBn: "জামানতবিহীন বাণিজ্যিক ব্যাংক ঋণ (১০ লাখ টাকা পর্যন্ত), যা শিশু (৫০ হাজার পর্যন্ত), কিশোর (৫০ হাজার-৫ লাখ) এবং তরুণ (৫-১০ লাখ) ভাগে বিভক্ত।",
    category: "loan",
  },
  cgtmse: {
    term: "CGTMSE",
    aliases: ["cgtmse", "credit guarantee", "ক্রেডিট গ্যারান্টি", "क्रेडिट गारंटी"],
    titleEn: "Credit Guarantee Fund Trust for Micro & Small Enterprises",
    titleHi: "क्रेडिट गारंटी फंड ट्रस्ट (CGTMSE)",
    titleBn: "ক্রেডিট গ্যারান্টি ফান্ড ট্রাস্ট (সিজিটিএমএসই)",
    defEn: "A government guarantee trust that promises to repay banks up to 85% of your loan if your business defaults, so banks do not ask for land or gold as security.",
    defHi: "एक सरकारी गारंटी ट्रस्ट जो आपके व्यवसाय में चूक होने पर बैंक को 85% तक चुकाने का वचन देता है, ताकि बैंक आपसे ज़मीन या सोना न मांगें।",
    defBn: "একটি সরকারি ট্রাস্ট যা ব্যবসায়ে কোনো ক্ষতি হলে ব্যাংকের ৮৫% পর্যন্ত ঋণ পরিশোধের ঝুঁকি নেয়, যাতে জামানত হিসেবে জমি বা সোনা জমা দিতে না হয়।",
    category: "loan",
  },
  margin_money: {
    term: "Margin Money",
    aliases: ["margin money", "subsidy", "bhortuki", "ভর্তুকি", "मार्जिन मनी"],
    titleEn: "Margin Money / Capital Subsidy",
    titleHi: "मार्जिन मनी / पूंजीगत सब्सिडी",
    titleBn: "মার্জিন মানি / মূলধনী ভর্তুকি",
    defEn: "The government grant portion of a scheme-linked loan that you do NOT have to repay, credited directly to your bank loan account.",
    defHi: "सरकारी अनुदान का वह हिस्सा जिसे आपको कभी वापस नहीं लौटाना होता, यह सीधे आपके बैंक ऋण खाते में जमा कर दिया जाता है।",
    defBn: "সরকারি অনুদানের অংশ যা আপনাকে কোনোদিন ফেরত দিতে হবে না, এটি সরাসরি আপনার ব্যাংক ঋণ অ্যাকাউন্টে জমা হয়ে আসল ঋণ কমিয়ে দেয়।",
    category: "subsidy",
  },
  collateral_free: {
    term: "Collateral-Free",
    aliases: ["collateral", "collateral-free", "zero security", "জামানতহীন", "बिना गारंटी"],
    titleEn: "Collateral-Free Loan",
    titleHi: "जमानत-मुक्त (बिना गारंटी) ऋण",
    titleBn: "জামানতহীন ঋণ (বিনা সিকিউরিটি)",
    defEn: "A business loan issued purely based on your project cash flow without requiring you to mortgage a home, commercial shop, or land plot.",
    defHi: "एक ऐसा व्यावसायिक ऋण जो बिना किसी घर, दुकान या ज़मीन को गिरवी रखे विशुद्ध रूप से आपके व्यवसाय की आय पर दिया जाता है।",
    defBn: "এমন একটি বাণিজ্যিক ঋণ যা বাড়ি, দোকান বা জমি বন্ধক না রেখেই শুধুমাত্র প্রকল্পের ব্যবসায়িক সক্ষমতার ভিত্তিতে দেওয়া হয়।",
    category: "loan",
  },
  udyam: {
    term: "Udyam",
    aliases: ["udyam", "msme registration", "উদ্যম", "उद्यम"],
    titleEn: "Udyam Registration Certificate",
    titleHi: "उद्यम पंजीकरण प्रमाण पत्र",
    titleBn: "উদ্যম রেজিস্ট্রেশন সনদপত্র",
    defEn: "The 100% free, 19-digit online Aadhaar-linked digital identity certificate issued to Indian MSMEs by the Ministry of MSME.",
    defHi: "सूक्ष्म, लघु एवं मध्यम उद्यम मंत्रालय द्वारा जारी 19 अंकों का पूरी तरह मुफ़्त और आधार-लिंक्ड डिजिटल पहचान प्रमाण पत्र।",
    defBn: "এমএসএমই মন্ত্রণালয় দ্বারা প্রদত্ত সম্পূর্ণ বিনামূল্যে প্রাপ্ত ১৯-সংখ্যার আধার-সংযুক্ত অনলাইন ডিজিটাল ব্যবসায়িক সনদপত্র।",
    category: "compliance",
  },
  dpr: {
    term: "DPR",
    aliases: ["dpr", "project report", "ডিপিআর", "डीपीआर"],
    titleEn: "Detailed Project Report (DPR)",
    titleHi: "विस्तृत परियोजना रिपोर्ट (DPR)",
    titleBn: "বিস্তারিত প্রকল্প প্রতিবেদন (ডিপিআর)",
    defEn: "A formal bank appraisal document detailing your required machinery quotes, rent, estimated monthly sales, expenses, and repayment ability.",
    defHi: "बैंक मूल्यांकन हेतु एक औपचारिक दस्तावेज़ जिसमें आपकी मशीनरी, किराया, अनुमानित मासिक बिक्री, खर्च और ऋण चुकाने की क्षमता का विवरण होता है।",
    defBn: "ব্যাংক মূল্যায়নের জন্য একটি আনুষ্ঠানিক নথি যেখানে প্রস্তাবিত যন্ত্রপাতি, ভাড়া, আনুমানিক মাসিক আয়-ব্যয় এবং ঋণ পরিশোধ ক্ষমতার হিসাব থাকে।",
    category: "compliance",
  },
  edp: {
    term: "EDP",
    aliases: ["edp", "edp training", "ইডিপি", "ईडीपी"],
    titleEn: "Entrepreneurship Development Programme (EDP)",
    titleHi: "उद्यमिता विकास कार्यक्रम (EDP)",
    titleBn: "উদ্যোক্তা উন্নয়ন কর্মসূচি (ইডিপি)",
    defEn: "A 5 to 10-day practical business training program conducted by government institutes or online portals (like msmetraining.gov.in) before subsidy release.",
    defHi: "सरकारी संस्थानों या ऑनलाइन पोर्टल द्वारा आयोजित 5 से 10 दिनों का व्यावहारिक व्यावसायिक प्रशिक्षण जो सब्सिडी जारी करने से पहले पूरा करना होता है।",
    defBn: "সরকারি প্রতিষ্ঠান দ্বারা পরিচালিত ৫ থেকে ১০ দিনের ব্যবহারিক ব্যবসায়িক প্রশিক্ষণ কোর্স যা ভর্তুকি ছাড়ের পূর্বে সম্পন্ন করতে হয়।",
    category: "compliance",
  },
  interest_subvention: {
    term: "Interest Subvention",
    aliases: ["interest subsidy", "subvention", "সুদ ভর্তুকি", "ब्याज सब्सिडी"],
    titleEn: "Interest Subvention / Subsidy",
    titleHi: "ब्याज सहायता (सबवेंशन)",
    titleBn: "সুদ ভর্তুকি (ইন্টারেস্ট সাবভেনশন)",
    defEn: "A financial benefit where the government pays part of your loan interest rate (e.g. 7% in PM SVANidhi), reducing your monthly EMI burden.",
    defHi: "एक ऐसा वित्तीय लाभ जिसमें सरकार आपके बैंक ऋण के ब्याज का एक हिस्सा (जैसे पीएम स्वनिधि में 7%) स्वयं वहन करती है, जिससे आपकी ईएमआई कम हो जाती है।",
    defBn: "এমন একটি আর্থিক সুবিধা যেখানে সরকার আপনার ব্যাংক ঋণের সুদের একটি অংশ নিজে পরিশোধ করে (যেমন পিএম স্বনিধিতে ৭%), ফলে কিস্তির চাপ কমে যায়।",
    category: "subsidy",
  },
  banglashree: {
    term: "Banglashree",
    aliases: ["banglashree", "wb msme", "বাংলাশ্রী", "बांग्लाश्री"],
    titleEn: "Banglashree Scheme (West Bengal MSME)",
    titleHi: "बांग्लाश्री योजना (पश्चिम बंगाल एमएसएमई)",
    titleBn: "বাংলাশ্রী প্রকল্প (পশ্চিমবঙ্গ এমএসএমই)",
    defEn: "West Bengal's flagship state scheme providing 15% to 25% capital investment subsidy on machinery and 5-year waiver on electricity duties for micro units.",
    defHi: "पश्चिम बंगाल सरकार की प्रमुख योजना जो सूक्ष्म इकाइयों को मशीनरी पर 15% से 25% पूंजीगत सब्सिडी और 5 साल की बिजली शुल्क छूट देती है।",
    defBn: "পশ্চিমবঙ্গ সরকারের প্রধান রাজ্য প্রকল্প যা ক্ষুদ্র উৎপাদন ইউনিটের যন্ত্রপাতিতে ১৫% থেকে ২৫% মূলধনী অনুদান এবং ৫ বছরের বিদ্যুৎ শুল্ক মকুব দেয়।",
    category: "subsidy",
  },
  greenfield: {
    term: "Greenfield Enterprise",
    aliases: ["greenfield", "first-time", "নতুন উদ্যোগ", "ग्रीनफील्ड"],
    titleEn: "Greenfield Enterprise",
    titleHi: "ग्रीनफील्ड उद्यम (नया व्यापार)",
    titleBn: "গ্রিনফিল্ড এন্টারপ্রাইজ (নতুন ব্যবসা)",
    defEn: "A brand-new enterprise setting up in manufacturing, services, or trading for the very first time (as required by Stand-Up India).",
    defHi: "विनिर्माण, सेवाओं या व्यापार में पहली बार स्थापित किया जाने वाला बिल्कुल नया उद्यम (जैसा कि स्टैंड-अप इंडिया में अनिवार्य है)।",
    defBn: "উৎপাদন, সেবা বা বাণিজ্যে প্রথমবারের মতো স্থাপিত সম্পূর্ণ নতুন কোনো উদ্যোগ বা ব্যবসা (যেমন স্ট্যান্ড-আপ ইন্ডিয়া প্রকল্পে প্রয়োজন)।",
    category: "general",
  },
};

/**
 * Find glossary definition by keyword or alias (case-insensitive).
 */
export function findGlossaryTerm(rawTerm: string): GlossaryDefinition | null {
  if (!rawTerm) return null;
  const clean = rawTerm.trim().toLowerCase();

  if (GLOSSARY_TERMS[clean]) {
    return GLOSSARY_TERMS[clean];
  }

  for (const def of Object.values(GLOSSARY_TERMS)) {
    if (def.term.toLowerCase() === clean) return def;
    if (def.aliases.some((alias) => alias.toLowerCase() === clean)) return def;
  }

  return null;
}
