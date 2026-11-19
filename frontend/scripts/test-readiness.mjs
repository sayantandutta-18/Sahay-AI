/**
 * SAHAY Readiness Radar Unit Test (Checkpoint 6)
 * Asserts the deterministic 5-dimension readiness engine:
 * 1. Capital (financial buffer & surplus)
 * 2. Documents (Aadhaar, PAN, Bank, Udyam, GST)
 * 3. Vintage (operational months)
 * 4. Income (turnover thresholds)
 * 5. Record-keeping (formal accounting vs cash)
 * And asserts geometry generation for the 5-axis SVG radar polygon.
 */

import { computeReadinessScores, calculateRadarCoordinates, RADAR_DIMENSIONS } from "../src/lib/readiness.ts";

console.log("=== SAHAY CHECKPOINT 6 READINESS RADAR AUDIT ===");

// Test 1: Zero / Unregistered input
const zeroInput = {
  annual_turnover: 0,
  monthly_revenue: 0,
  monthly_expense: 0,
  existing_loans: 0,
  months_in_operation: 1,
  has_udyam: false,
  has_pan: false,
  has_gst: false,
  has_bank_account: false,
  has_aadhaar: false,
  record_keeping_type: "informal",
};

const zeroReport = computeReadinessScores(zeroInput);
if (zeroReport.is_official_decision !== false) {
  console.error("FAIL: is_official_decision must be false");
  process.exit(1);
}
if (!zeroReport.disclaimer.toLowerCase().includes("estimated micro-business readiness indicator")) {
  console.error("FAIL: Missing mandatory disclaimer in report");
  process.exit(1);
}
if (zeroReport.dimensions.length !== 5) {
  console.error(`FAIL: Expected 5 dimensions, got ${zeroReport.dimensions.length}`);
  process.exit(1);
}

const zeroDims = Object.fromEntries(zeroReport.dimensions.map(d => [d.dimension_key, d]));
if (zeroDims.capital.score !== 0) {
  console.error(`FAIL: Expected capital 0, got ${zeroDims.capital.score}`);
  process.exit(1);
}
if (zeroDims.documents.score !== 0) {
  console.error(`FAIL: Expected documents 0, got ${zeroDims.documents.score}`);
  process.exit(1);
}
if (zeroDims.vintage.score !== 20) {
  console.error(`FAIL: Expected vintage 20, got ${zeroDims.vintage.score}`);
  process.exit(1);
}
if (zeroDims.income.score !== 15) {
  console.error(`FAIL: Expected income 15, got ${zeroDims.income.score}`);
  process.exit(1);
}
if (zeroDims.record_keeping.score !== 20) {
  console.error(`FAIL: Expected record_keeping 20, got ${zeroDims.record_keeping.score}`);
  process.exit(1);
}
console.log("PASS: Test 1 - Minimal/unregistered enterprise baseline evaluated correctly.");

// Test 2: Moderate / Growing Enterprise
const midInput = {
  annual_turnover: 500000,
  monthly_revenue: 50000,
  monthly_expense: 30000,
  existing_loans: 5000,
  months_in_operation: 16,
  has_udyam: true,
  has_pan: true,
  has_gst: false,
  has_bank_account: true,
  has_aadhaar: true,
  record_keeping_type: "bank_recorded",
};

const midReport = computeReadinessScores(midInput);
const midDims = Object.fromEntries(midReport.dimensions.map(d => [d.dimension_key, d]));

// Capital: Surplus = 50k - 30k - 5k = 15k. Margin = 15k / 50k = 30% (>25% -> 100)
if (midDims.capital.score !== 100) {
  console.error(`FAIL: Expected mid capital 100, got ${midDims.capital.score}`);
  process.exit(1);
}
// Documents: 4 of 5 credentials verified -> 80
if (midDims.documents.score !== 80) {
  console.error(`FAIL: Expected mid documents 80, got ${midDims.documents.score}`);
  process.exit(1);
}
// Vintage: 16 months -> 75
if (midDims.vintage.score !== 75) {
  console.error(`FAIL: Expected mid vintage 75, got ${midDims.vintage.score}`);
  process.exit(1);
}
// Income: Turnover 500k -> 70
if (midDims.income.score !== 70) {
  console.error(`FAIL: Expected mid income 70, got ${midDims.income.score}`);
  process.exit(1);
}
// Records: Udyam + Bank -> 75
if (midDims.record_keeping.score !== 75) {
  console.error(`FAIL: Expected mid record_keeping 75, got ${midDims.record_keeping.score}`);
  process.exit(1);
}

// Every dimension has non-empty explanation
for (const d of midReport.dimensions) {
  if (!d.formula_explanation || d.formula_explanation.length < 10) {
    console.error(`FAIL: Missing explanation for dimension ${d.dimension_key}`);
    process.exit(1);
  }
}
console.log("PASS: Test 2 - Intermediate micro-enterprise formulas and explanations verified.");

// Test 3: Fully Formalized Enterprise
const formalInput = {
  annual_turnover: 3000000,
  monthly_revenue: 250000,
  monthly_expense: 150000,
  existing_loans: 20000,
  months_in_operation: 36,
  has_udyam: true,
  has_pan: true,
  has_gst: true,
  has_bank_account: true,
  has_aadhaar: true,
  record_keeping_type: "formal_accounting",
};

const formalReport = computeReadinessScores(formalInput);
if (formalReport.overall_readiness_score !== 100) {
  console.error(`FAIL: Expected overall 100, got ${formalReport.overall_readiness_score}`);
  process.exit(1);
}
for (const d of formalReport.dimensions) {
  if (d.score !== 100) {
    console.error(`FAIL: Expected dimension ${d.dimension_key} = 100, got ${d.score}`);
    process.exit(1);
  }
}
console.log("PASS: Test 3 - Full formalization achieves 100 across all 5 dimensions.");

// Test 4: Radar Geometry & Coordinates
const sampleScores = [80, 60, 100, 40, 75];
const geom = calculateRadarCoordinates(sampleScores, 150, 150, 100);

if (!geom.pointsString || geom.points.length !== 5) {
  console.error(`FAIL: Invalid radar points generated: ${geom.pointsString}`);
  process.exit(1);
}
if (geom.webPolygons.length !== 4) {
  console.error(`FAIL: Expected 4 concentric web levels, got ${geom.webPolygons.length}`);
  process.exit(1);
}
if (geom.axisLines.length !== 5) {
  console.error(`FAIL: Expected 5 axis lines, got ${geom.axisLines.length}`);
  process.exit(1);
}

// Check that top vertex (index 0) points straight up (y < cy, x ~= cx)
const topPoint = geom.points[0];
if (Math.abs(topPoint.x - 150) > 0.1 || topPoint.y >= 150) {
  console.error(`FAIL: Top vertex misaligned: x=${topPoint.x}, y=${topPoint.y}`);
  process.exit(1);
}
console.log("PASS: Test 4 - 5-axis SVG radar polygon coordinates generated accurately.");

console.log("ALL CHECKPOINT 6 READINESS RADAR TESTS PASSED!");
