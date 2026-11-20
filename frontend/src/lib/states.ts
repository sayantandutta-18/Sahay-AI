/**
 * Authoritative Indian States and Union Territories metadata for SAHAY State Directory & SVG Map.
 * Zero external CDN dependencies.
 */

export interface IndiaStateInfo {
  code: string;
  name: string;
  nameHi: string;
  nameBn: string;
  zone: "East" | "West" | "North" | "South" | "Central" | "North-East" | "Union Territory";
  isUT: boolean;
  // SVG polygon / path representation coordinates [x, y, width, height, path]
  svg: {
    cx: number;
    cy: number;
    path: string;
  };
}

export const INDIAN_STATES: IndiaStateInfo[] = [
  // EASTERN ZONE
  {
    code: "WB",
    name: "West Bengal",
    nameHi: "पश्चिम बंगाल",
    nameBn: "পশ্চিমবঙ্গ",
    zone: "East",
    isUT: false,
    svg: {
      cx: 470,
      cy: 370,
      path: "M450,330 L480,310 L495,340 L485,385 L475,415 L450,425 L455,380 Z",
    },
  },
  {
    code: "BR",
    name: "Bihar",
    nameHi: "बिहार",
    nameBn: "বিহার",
    zone: "East",
    isUT: false,
    svg: {
      cx: 420,
      cy: 310,
      path: "M385,285 L445,280 L460,320 L425,335 L385,325 Z",
    },
  },
  {
    code: "JH",
    name: "Jharkhand",
    nameHi: "झारखंड",
    nameBn: "ঝাড়খণ্ড",
    zone: "East",
    isUT: false,
    svg: {
      cx: 420,
      cy: 360,
      path: "M385,335 L445,330 L450,375 L405,385 L385,360 Z",
    },
  },
  {
    code: "OD",
    name: "Odisha",
    nameHi: "ओडिशा",
    nameBn: "ওড়িশা",
    zone: "East",
    isUT: false,
    svg: {
      cx: 425,
      cy: 420,
      path: "M395,385 L455,380 L465,420 L440,460 L395,440 Z",
    },
  },

  // NORTHERN ZONE
  {
    code: "JK",
    name: "Jammu and Kashmir",
    nameHi: "जम्मू और कश्मीर",
    nameBn: "জম্মু ও কাশ্মীর",
    zone: "Union Territory",
    isUT: true,
    svg: {
      cx: 210,
      cy: 90,
      path: "M175,70 L230,50 L245,100 L210,130 L170,110 Z",
    },
  },
  {
    code: "LA",
    name: "Ladakh",
    nameHi: "लद्दाख",
    nameBn: "লাদাখ",
    zone: "Union Territory",
    isUT: true,
    svg: {
      cx: 285,
      cy: 70,
      path: "M245,45 L320,40 L345,95 L275,115 L245,90 Z",
    },
  },
  {
    code: "HP",
    name: "Himachal Pradesh",
    nameHi: "हिमाचल प्रदेश",
    nameBn: "হিমাচল প্রদেশ",
    zone: "North",
    isUT: false,
    svg: {
      cx: 250,
      cy: 145,
      path: "M220,125 L275,120 L285,160 L240,175 L215,150 Z",
    },
  },
  {
    code: "PB",
    name: "Punjab",
    nameHi: "पंजाब",
    nameBn: "পাঞ্জাব",
    zone: "North",
    isUT: false,
    svg: {
      cx: 195,
      cy: 165,
      path: "M170,140 L220,135 L225,185 L180,195 L165,170 Z",
    },
  },
  {
    code: "HR",
    name: "Haryana",
    nameHi: "हरियाणा",
    nameBn: "হরিয়ানা",
    zone: "North",
    isUT: false,
    svg: {
      cx: 225,
      cy: 200,
      path: "M205,180 L250,175 L255,220 L215,225 L200,205 Z",
    },
  },
  {
    code: "DL",
    name: "Delhi",
    nameHi: "दिल्ली",
    nameBn: "দিল্লি",
    zone: "Union Territory",
    isUT: true,
    svg: {
      cx: 242,
      cy: 202,
      path: "M237,197 L248,197 L248,208 L237,208 Z",
    },
  },
  {
    code: "UK",
    name: "Uttarakhand",
    nameHi: "उत्तराखंड",
    nameBn: "উত্তরাখণ্ড",
    zone: "North",
    isUT: false,
    svg: {
      cx: 290,
      cy: 180,
      path: "M265,160 L320,155 L325,195 L280,205 L260,185 Z",
    },
  },
  {
    code: "UP",
    name: "Uttar Pradesh",
    nameHi: "उत्तर प्रदेश",
    nameBn: "উত্তর প্রদেশ",
    zone: "North",
    isUT: false,
    svg: {
      cx: 335,
      cy: 260,
      path: "M265,220 L375,210 L410,270 L345,305 L260,265 Z",
    },
  },
  {
    code: "RJ",
    name: "Rajasthan",
    nameHi: "राजस्थान",
    nameBn: "রাজস্থান",
    zone: "North",
    isUT: false,
    svg: {
      cx: 165,
      cy: 250,
      path: "M100,210 L220,190 L245,265 L190,320 L115,295 Z",
    },
  },

  // WESTERN ZONE
  {
    code: "GJ",
    name: "Gujarat",
    nameHi: "गुजरात",
    nameBn: "গুজরাট",
    zone: "West",
    isUT: false,
    svg: {
      cx: 110,
      cy: 360,
      path: "M60,330 L160,315 L175,370 L135,420 L75,385 Z",
    },
  },
  {
    code: "MH",
    name: "Maharashtra",
    nameHi: "महाराष्ट्र",
    nameBn: "মহারাষ্ট্র",
    zone: "West",
    isUT: false,
    svg: {
      cx: 215,
      cy: 440,
      path: "M145,395 L285,385 L305,465 L215,505 L150,470 Z",
    },
  },
  {
    code: "GA",
    name: "Goa",
    nameHi: "गोवा",
    nameBn: "গোয়া",
    zone: "West",
    isUT: false,
    svg: {
      cx: 175,
      cy: 535,
      path: "M168,528 L182,528 L182,542 L168,542 Z",
    },
  },

  // CENTRAL ZONE
  {
    code: "MP",
    name: "Madhya Pradesh",
    nameHi: "मध्य प्रदेश",
    nameBn: "মধ্যপ্রদেশ",
    zone: "Central",
    isUT: false,
    svg: {
      cx: 275,
      cy: 340,
      path: "M205,305 L355,290 L370,365 L280,395 L200,360 Z",
    },
  },
  {
    code: "CG",
    name: "Chhattisgarh",
    nameHi: "छत्तीसगढ़",
    nameBn: "ছত্তিশগড়",
    zone: "Central",
    isUT: false,
    svg: {
      cx: 355,
      cy: 400,
      path: "M335,355 L385,350 L395,445 L350,475 L330,420 Z",
    },
  },

  // SOUTHERN ZONE
  {
    code: "TG",
    name: "Telangana",
    nameHi: "तेलंगाना",
    nameBn: "তেলেঙ্গানা",
    zone: "South",
    isUT: false,
    svg: {
      cx: 285,
      cy: 485,
      path: "M255,455 L325,450 L330,515 L270,525 L250,490 Z",
    },
  },
  {
    code: "AP",
    name: "Andhra Pradesh",
    nameHi: "आंध्र प्रदेश",
    nameBn: "অন্ধ্রপ্রদেশ",
    zone: "South",
    isUT: false,
    svg: {
      cx: 315,
      cy: 550,
      path: "M285,515 L355,490 L365,565 L300,600 L275,550 Z",
    },
  },
  {
    code: "KA",
    name: "Karnataka",
    nameHi: "कर्नाटक",
    nameBn: "কর্ণাটক",
    zone: "South",
    isUT: false,
    svg: {
      cx: 215,
      cy: 555,
      path: "M180,495 L255,490 L260,595 L210,630 L180,575 Z",
    },
  },
  {
    code: "KL",
    name: "Kerala",
    nameHi: "केरल",
    nameBn: "কেরালা",
    zone: "South",
    isUT: false,
    svg: {
      cx: 215,
      cy: 655,
      path: "M195,620 L230,620 L235,685 L205,690 L195,650 Z",
    },
  },
  {
    code: "TN",
    name: "Tamil Nadu",
    nameHi: "तमिलनाडु",
    nameBn: "তামিলনাড়ু",
    zone: "South",
    isUT: false,
    svg: {
      cx: 270,
      cy: 645,
      path: "M240,605 L300,600 L305,675 L255,690 L235,650 Z",
    },
  },

  // NORTH-EASTERN ZONE
  {
    code: "SK",
    name: "Sikkim",
    nameHi: "सिक्किम",
    nameBn: "সিকিম",
    zone: "North-East",
    isUT: false,
    svg: {
      cx: 475,
      cy: 260,
      path: "M465,245 L485,245 L485,275 L465,275 Z",
    },
  },
  {
    code: "AS",
    name: "Assam",
    nameHi: "असम",
    nameBn: "অসম",
    zone: "North-East",
    isUT: false,
    svg: {
      cx: 550,
      cy: 295,
      path: "M515,275 L590,265 L605,305 L530,320 L510,295 Z",
    },
  },
  {
    code: "AR",
    name: "Arunachal Pradesh",
    nameHi: "अरुणाचल प्रदेश",
    nameBn: "অরুণাচল প্রদেশ",
    zone: "North-East",
    isUT: false,
    svg: {
      cx: 585,
      cy: 235,
      path: "M535,215 L630,205 L635,255 L565,265 L530,240 Z",
    },
  },
  {
    code: "ML",
    name: "Meghalaya",
    nameHi: "मेघालय",
    nameBn: "মেঘালয়",
    zone: "North-East",
    isUT: false,
    svg: {
      cx: 525,
      cy: 330,
      path: "M500,320 L555,320 L555,340 L500,340 Z",
    },
  },
  {
    code: "TR",
    name: "Tripura",
    nameHi: "त्रिपुरा",
    nameBn: "ত্রিপুরা",
    zone: "North-East",
    isUT: false,
    svg: {
      cx: 535,
      cy: 380,
      path: "M525,365 L548,365 L548,395 L525,395 Z",
    },
  },
  {
    code: "MZ",
    name: "Mizoram",
    nameHi: "मिजोरम",
    nameBn: "মিজোরাম",
    zone: "North-East",
    isUT: false,
    svg: {
      cx: 565,
      cy: 395,
      path: "M555,370 L578,370 L578,420 L555,420 Z",
    },
  },
  {
    code: "MN",
    name: "Manipur",
    nameHi: "मणिपुर",
    nameBn: "মণিপুর",
    zone: "North-East",
    isUT: false,
    svg: {
      cx: 590,
      cy: 345,
      path: "M575,325 L605,325 L605,365 L575,365 Z",
    },
  },
  {
    code: "NL",
    name: "Nagaland",
    nameHi: "नागालैंड",
    nameBn: "নাগাল্যান্ড",
    zone: "North-East",
    isUT: false,
    svg: {
      cx: 605,
      cy: 295,
      path: "M590,275 L620,275 L620,315 L590,315 Z",
    },
  },

  // OTHER UNION TERRITORIES
  {
    code: "CH",
    name: "Chandigarh",
    nameHi: "चंडीगढ़",
    nameBn: "চণ্ডীগড়",
    zone: "Union Territory",
    isUT: true,
    svg: {
      cx: 215,
      cy: 160,
      path: "M210,155 L220,155 L220,165 L210,165 Z",
    },
  },
  {
    code: "PY",
    name: "Puducherry",
    nameHi: "पुडुचेरी",
    nameBn: "পুদুচেরি",
    zone: "Union Territory",
    isUT: true,
    svg: {
      cx: 295,
      cy: 625,
      path: "M290,620 L300,620 L300,630 L290,630 Z",
    },
  },
  {
    code: "AN",
    name: "Andaman and Nicobar Islands",
    nameHi: "अंडमान और निकोबार द्वीप समूह",
    nameBn: "আন্দামান ও নিকোবর দ্বীপপুঞ্জ",
    zone: "Union Territory",
    isUT: true,
    svg: {
      cx: 560,
      cy: 610,
      path: "M550,560 L570,560 L570,660 L550,660 Z",
    },
  },
  {
    code: "LD",
    name: "Lakshadweep",
    nameHi: "लक्षद्वीप",
    nameBn: "লক্ষদ্বীপ",
    zone: "Union Territory",
    isUT: true,
    svg: {
      cx: 140,
      cy: 630,
      path: "M130,600 L150,600 L150,660 L130,660 Z",
    },
  },
  {
    code: "DH",
    name: "Dadra and Nagar Haveli and Daman and Diu",
    nameHi: "दादरा और नगर हवेली और दमन और दीव",
    nameBn: "দাদরা ও নগর হাভেলি এবং দমন ও দিউ",
    zone: "Union Territory",
    isUT: true,
    svg: {
      cx: 130,
      cy: 405,
      path: "M120,400 L140,400 L140,415 L120,415 Z",
    },
  },
];

/**
 * Helper to compute how many schemes in an array serve a given state.
 */
export function countSchemesForState(
  stateName: string,
  schemes: Array<{ states_served?: string }>
): number {
  if (!stateName || stateName.toUpperCase() === "ALL") {
    return schemes.length;
  }
  const cleanTarget = stateName.trim().toLowerCase();
  return schemes.filter((s) => {
    const served = (s.states_served || "ALL").toLowerCase();
    return served === "all" || served.includes(cleanTarget);
  }).length;
}
