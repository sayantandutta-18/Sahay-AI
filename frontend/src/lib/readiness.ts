/**
 * SAHAY Micro-Enterprise Readiness Scoring & Radar Geometry Logic
 * 
 * Deterministic calculation of 5-dimension enterprise readiness:
 * 1. Capital & Financial Buffer (net surplus, debt service, cash cushion)
 * 2. Document Readiness (Aadhaar, PAN, Bank, Udyam, GST - 20 pts each)
 * 3. Business Vintage & Stability (months in operation, stability)
 * 4. Regular Income & Turnover (turnover thresholds)
 * 5. Record-Keeping & Formalization (cash vs bank vs formal books)
 * 
 * DISCLAIMER: This is an estimated readiness indicator, not an official
 * government or institutional eligibility decision.
 */

export interface BusinessReadinessInput {
  annual_turnover: number;
  monthly_revenue: number;
  monthly_expense: number;
  existing_loans: number;
  months_in_operation: number;
  has_udyam: boolean;
  has_pan: boolean;
  has_gst: boolean;
  has_bank_account: boolean;
  has_aadhaar: boolean;
  record_keeping_type: string;
}

export interface ReadinessDimensionScore {
  dimension_key: string;
  dimension_name: string;
  score: number;
  formula_explanation: string;
  assessment_tier: string;
}

export interface BusinessReadinessReport {
  overall_readiness_score: number;
  is_official_decision: boolean;
  disclaimer: string;
  dimensions: ReadinessDimensionScore[];
  authority: string;
}

export interface RadarPoint {
  x: number;
  y: number;
}

export interface DimensionMetadata {
  key: string;
  name: string;
  shortName: string;
  angle: number;
}

export const RADAR_DIMENSIONS: { key: string; name: string; shortName: string }[] = [
  { key: "capital", name: "Capital & Financial Buffer", shortName: "Capital" },
  { key: "documents", name: "Document Readiness", shortName: "Documents" },
  { key: "vintage", name: "Business Vintage & Stability", shortName: "Vintage" },
  { key: "income", name: "Regular Income & Turnover", shortName: "Income" },
  { key: "record_keeping", name: "Record-Keeping & Formalization", shortName: "Records" },
];

/**
 * Deterministically compute the 5-dimension readiness score from user inputs.
 */
export function computeReadinessScores(input: BusinessReadinessInput): BusinessReadinessReport {
  const dimensions: ReadinessDimensionScore[] = [];

  // 1. Capital & Financial Buffer
  const rev = Math.max(0, input.monthly_revenue);
  const exp = Math.max(0, input.monthly_expense);
  const debt = Math.max(0, input.existing_loans);
  const netSurplus = Math.round((rev - exp - debt) * 100) / 100;

  let capScore = 0;
  let capTier = "Zero Revenue";
  let capExp = "Zero monthly operational revenue recorded; unable to assess operational surplus.";

  if (rev > 0) {
    if (netSurplus < 0) {
      capScore = Math.max(5, Math.round(30 * (1.0 + netSurplus / (exp + debt + 1.0))));
      capTier = "Deficit";
      capExp = "Monthly operational expenses and debt exceed monthly receipts (operating deficit).";
    } else {
      const margin = netSurplus / rev;
      if (margin < 0.10) {
        capScore = 40;
        capTier = "Tight Buffer";
        capExp = `Net monthly surplus is positive but under 10% (${Math.round(margin * 1000) / 10}%) of revenue.`;
      } else if (margin < 0.25) {
        capScore = 70;
        capTier = "Healthy Buffer";
        capExp = `Net monthly surplus is healthy between 10% and 25% (${Math.round(margin * 1000) / 10}%) of revenue.`;
      } else {
        capScore = 100;
        capTier = "Strong Reserves";
        capExp = `Robust operational margin (${Math.round(margin * 1000) / 10}%) providing strong cash cushion for debt service.`;
      }
    }
  }

  dimensions.push({
    dimension_key: "capital",
    dimension_name: "Capital & Financial Buffer",
    score: Math.min(100, Math.max(0, capScore)),
    formula_explanation: capExp,
    assessment_tier: capTier,
  });

  // 2. Document Readiness (20 pts per credential)
  const docFlags = [
    Boolean(input.has_aadhaar),
    Boolean(input.has_pan),
    Boolean(input.has_bank_account),
    Boolean(input.has_udyam),
    Boolean(input.has_gst),
  ];
  const verifiedCount = docFlags.filter(Boolean).length;
  const docScore = verifiedCount * 20;

  let docTier = "Undocumented";
  let docExp = "No core enterprise registration or banking credentials verified (0/100).";
  if (docScore === 100) {
    docTier = "Fully Documented";
    docExp = "All 5 core micro-enterprise credentials (Aadhaar, PAN, Bank, Udyam, GST) verified (20 pts each).";
  } else if (docScore >= 60) {
    docTier = "Substantially Documented";
    docExp = `${verifiedCount} of 5 core credentials verified (20 pts each: ${docScore}/100).`;
  } else if (docScore >= 20) {
    docTier = "Partially Documented";
    docExp = `Only ${verifiedCount} core credential verified (20 pts each: ${docScore}/100).`;
  }

  dimensions.push({
    dimension_key: "documents",
    dimension_name: "Document Readiness",
    score: docScore,
    formula_explanation: docExp,
    assessment_tier: docTier,
  });

  // 3. Business Vintage & Stability
  const months = Math.max(0, input.months_in_operation);
  let vinScore = 20;
  let vinTier = "Seed / Early Inception";
  let vinExp = `${months} months in operation (under 6 months benchmark for institutional lending).`;

  if (months >= 24) {
    vinScore = 100;
    vinTier = "Mature Operation";
    vinExp = `${months} months in operation (2+ years track record meeting formal banking tenure standards).`;
  } else if (months >= 12) {
    vinScore = 75;
    vinTier = "Established Micro";
    vinExp = `${months} months in operation (over 1 year of consistent trading history).`;
  } else if (months >= 6) {
    vinScore = 45;
    vinTier = "Early Stabilization";
    vinExp = `${months} months in operation (established preliminary operational baseline).`;
  }

  dimensions.push({
    dimension_key: "vintage",
    dimension_name: "Business Vintage & Stability",
    score: vinScore,
    formula_explanation: vinExp,
    assessment_tier: vinTier,
  });

  // 4. Regular Income & Turnover
  const effectiveTurnover = Math.max(input.annual_turnover || 0, (rev * 12) || 0);
  let incScore = 15;
  let incTier = "Subsistence Micro";
  let incExp = `Annual turnover (~₹${Math.round(effectiveTurnover).toLocaleString("en-IN")}) under ₹50,000 threshold.`;

  if (effectiveTurnover >= 2500000) {
    incScore = 100;
    incTier = "High Turnover";
    incExp = `Annual turnover (~₹${Math.round(effectiveTurnover).toLocaleString("en-IN")}) meets or exceeds ₹25 Lakhs benchmark.`;
  } else if (effectiveTurnover >= 1000000) {
    incScore = 85;
    incTier = "Growth Enterprise";
    incExp = `Annual turnover (~₹${Math.round(effectiveTurnover).toLocaleString("en-IN")}) between ₹10 Lakhs and ₹25 Lakhs.`;
  } else if (effectiveTurnover >= 200000) {
    incScore = 70;
    incTier = "Commercial Micro";
    incExp = `Annual turnover (~₹${Math.round(effectiveTurnover).toLocaleString("en-IN")}) between ₹2 Lakhs and ₹10 Lakhs.`;
  } else if (effectiveTurnover >= 50000) {
    incScore = 40;
    incTier = "Emerging Enterprise";
    incExp = `Annual turnover (~₹${Math.round(effectiveTurnover).toLocaleString("en-IN")}) between ₹50k and ₹2 Lakhs.`;
  }

  dimensions.push({
    dimension_key: "income",
    dimension_name: "Regular Income & Turnover",
    score: incScore,
    formula_explanation: incExp,
    assessment_tier: incTier,
  });

  // 5. Record-Keeping & Formalization
  const rkType = (input.record_keeping_type || "informal").toLowerCase();
  let recScore = 20;
  let recTier = "Informal Cash Records";
  let recExp = "Informal cash transactions without auditable institutional bank or tax trails.";

  if (rkType === "formal_accounting" || (input.has_gst && input.has_bank_account && input.has_udyam)) {
    recScore = 100;
    recTier = "Auditable Digital Books";
    recExp = "Digital records with bank integration, active Udyam MSME, and GST returns.";
  } else if (input.has_udyam && input.has_bank_account) {
    recScore = 75;
    recTier = "Bank-Linked Formal";
    recExp = "Operating bank account verified with formal Udyam enterprise registration.";
  } else if (input.has_bank_account || rkType === "bank_recorded") {
    recScore = 50;
    recTier = "Basic Bank Account";
    recExp = "Commercial bank account exists, but lacks formal MSME registration filings.";
  }

  dimensions.push({
    dimension_key: "record_keeping",
    dimension_name: "Record-Keeping & Formalization",
    score: recScore,
    formula_explanation: recExp,
    assessment_tier: recTier,
  });

  const overallScore = Math.round(
    dimensions.reduce((acc, curr) => acc + curr.score, 0) / dimensions.length
  );

  return {
    overall_readiness_score: overallScore,
    is_official_decision: false,
    disclaimer:
      "This score is an estimated micro-business readiness indicator, not an official government or institutional eligibility decision.",
    dimensions,
    authority: "Sahay Deterministic 5-Dimension Readiness Model",
  };
}

/**
 * Calculate geometry points for drawing a 5-sided radar polygon.
 */
export function calculateRadarCoordinates(
  scores: number[],
  cx: number = 150,
  cy: number = 150,
  radius: number = 100
): {
  pointsString: string;
  points: RadarPoint[];
  webPolygons: string[];
  axisLines: { x1: number; y1: number; x2: number; y2: number; labelX: number; labelY: number }[];
} {
  const numAxes = scores.length || 5;
  const angleStep = (2 * Math.PI) / numAxes;

  // Concentric background rings (25%, 50%, 75%, 100%)
  const webLevels = [0.25, 0.5, 0.75, 1.0];
  const webPolygons = webLevels.map((level) => {
    const pts = [];
    for (let i = 0; i < numAxes; i++) {
      const angle = -Math.PI / 2 + i * angleStep;
      const x = cx + radius * level * Math.cos(angle);
      const y = cy + radius * level * Math.sin(angle);
      pts.push(`${Math.round(x * 10) / 10},${Math.round(y * 10) / 10}`);
    }
    return pts.join(" ");
  });

  // Axis lines
  const axisLines = [];
  for (let i = 0; i < numAxes; i++) {
    const angle = -Math.PI / 2 + i * angleStep;
    const x2 = cx + radius * Math.cos(angle);
    const y2 = cy + radius * Math.sin(angle);
    const labelX = cx + (radius + 24) * Math.cos(angle);
    const labelY = cy + (radius + 18) * Math.sin(angle);
    axisLines.push({
      x1: cx,
      y1: cy,
      x2: Math.round(x2 * 10) / 10,
      y2: Math.round(y2 * 10) / 10,
      labelX: Math.round(labelX * 10) / 10,
      labelY: Math.round(labelY * 10) / 10,
    });
  }

  // Data polygon points
  const points: RadarPoint[] = [];
  const pointsStrArr: string[] = [];
  for (let i = 0; i < numAxes; i++) {
    const angle = -Math.PI / 2 + i * angleStep;
    const s = Math.min(100, Math.max(0, scores[i] || 0));
    const r = radius * (s / 100.0);
    const x = Math.round((cx + r * Math.cos(angle)) * 10) / 10;
    const y = Math.round((cy + r * Math.sin(angle)) * 10) / 10;
    points.push({ x, y });
    pointsStrArr.push(`${x},${y}`);
  }

  return {
    pointsString: pointsStrArr.join(" "),
    points,
    webPolygons,
    axisLines,
  };
}
