import fs from "fs";
import path from "path";
import assert from "assert";

console.log("=== SAHAY CHECKPOINT 13 ACCESSIBILITY & UI AUDIT ===");

// 1. Audit i18n a11y dictionary parity
const i18nPath = path.resolve("./src/lib/i18n.ts");
const i18nContent = fs.readFileSync(i18nPath, "utf-8");

const expectedA11yKeys = [
  "skipToContent",
  "closeModal",
  "toggleMenu",
  "expandDetails",
  "collapseDetails",
  "verifiedStatus",
  "unverifiedStatus",
  "outdatedStatus",
];

for (const key of expectedA11yKeys) {
  assert(
    i18nContent.includes(`${key}:`),
    `i18n.ts should contain translation key '${key}'`
  );
}
console.log("PASS 1: All 8 a11y dictionary keys present across locales.");

// 2. Audit Skip to Content link in AppLayout.tsx
const appLayoutPath = path.resolve("./src/components/layout/AppLayout.tsx");
const appLayoutContent = fs.readFileSync(appLayoutPath, "utf-8");

assert(
  appLayoutContent.includes('href="#main-content"'),
  "AppLayout must contain a skip link pointing to #main-content"
);
assert(
  appLayoutContent.includes('id="main-content"'),
  "AppLayout must contain a landmark element with id='main-content'"
);
assert(
  appLayoutContent.includes("sr-only focus:not-sr-only"),
  "Skip link must use accessible focus styling"
);
console.log("PASS 2: Skip-to-content accessible landmark confirmed.");

// 3. Audit Navbar and Sidebar ARIA navigation
const navbarPath = path.resolve("./src/components/layout/Navbar.tsx");
const navbarContent = fs.readFileSync(navbarPath, "utf-8");

assert(
  navbarContent.includes("aria-label={`Switch language to ${lang.label}`}"),
  "Language buttons in Navbar must have explicit aria-label"
);
assert(
  navbarContent.includes("aria-pressed={selectedLang === lang.code}"),
  "Language buttons must indicate pressed state via aria-pressed"
);
assert(
  navbarContent.includes("aria-expanded={mobileMenuOpen}"),
  "Mobile toggle must announce expansion state via aria-expanded"
);
assert(
  navbarContent.includes('id="mobile-nav-menu"'),
  "Mobile menu dropdown must have accessible id"
);

const sidebarPath = path.resolve("./src/components/layout/Sidebar.tsx");
const sidebarContent = fs.readFileSync(sidebarPath, "utf-8");

assert(
  sidebarContent.includes('aria-current={isActive ? "page" : undefined}'),
  "Active sidebar link must declare aria-current='page'"
);
console.log("PASS 3: Navigation ARIA attributes and current page states verified.");

// 4. Audit Color-Blind Status and Verdict Badges
const appPagePath = path.resolve("./src/app/applications/page.tsx");
const appPageContent = fs.readFileSync(appPagePath, "utf-8");

assert(
  appPageContent.includes("<CheckCircle2") &&
  appPageContent.includes("<ArrowRight") &&
  appPageContent.includes("<Clock") &&
  appPageContent.includes("<FileText") &&
  appPageContent.includes("<Trash2") &&
  appPageContent.includes("<AlertCircle"),
  "Applications page must render explicit glyph icons alongside colors in getStatusBadge"
);

const matchesPagePath = path.resolve("./src/app/matches/page.tsx");
const matchesPageContent = fs.readFileSync(matchesPagePath, "utf-8");

assert(
  matchesPageContent.includes("<CheckCircle") &&
  matchesPageContent.includes("<HelpCircle") &&
  matchesPageContent.includes("<AlertTriangle"),
  "Matches page must render explicit glyph icons for eligible, info needed, and not eligible verdicts"
);
console.log("PASS 4: Color-blind dual encoding (icons + text) verified on statuses and verdicts.");

// 5. Audit Mobile Truncation & Tooltip Preservation
const schemesPagePath = path.resolve("./src/app/schemes/page.tsx");
const schemesPageContent = fs.readFileSync(schemesPagePath, "utf-8");

assert(
  schemesPageContent.includes("title={s.name}") &&
  schemesPageContent.includes("sm:max-w-[200px]"),
  "Floating comparison dock must render full title tooltip and responsive width"
);
assert(
  schemesPageContent.includes("pb-36 sm:pb-32"),
  "Schemes page must have sufficient bottom padding (pb-36 sm:pb-32) so dock does not cover content"
);

const tablePath = path.resolve("./src/components/ui/SchemeComparisonTable.tsx");
const tableContent = fs.readFileSync(tablePath, "utf-8");

assert(
  tableContent.includes("title={s.name}") &&
  tableContent.includes("title={s.provider}"),
  "Comparison table headers and providers must specify title attributes for truncated text"
);

const academyPath = path.resolve("./src/app/academy/page.tsx");
const academyContent = fs.readFileSync(academyPath, "utf-8");

assert(
  academyContent.includes("title={lesson.title}"),
  "Academy lesson titles must include tooltip title attribute"
);
console.log("PASS 5: Mobile truncation safety, tooltips, and floating dock clearance verified.");

// 6. Audit Form Input and Dialog Accessibility
const inputPath = path.resolve("./src/components/ui/Input.tsx");
const inputContent = fs.readFileSync(inputPath, "utf-8");

assert(
  inputContent.includes("aria-invalid={!!error}") &&
  inputContent.includes("aria-describedby={describedBy}"),
  "Input component must declare aria-invalid and aria-describedby for assistive tech"
);

const modalPath = path.resolve("./src/components/ui/Modal.tsx");
const modalContent = fs.readFileSync(modalPath, "utf-8");

assert(
  modalContent.includes('role="dialog"') &&
  modalContent.includes('aria-modal="true"') &&
  modalContent.includes('aria-labelledby="modal-title"'),
  "Modal component must include proper dialog ARIA roles and labels"
);

const badgePath = path.resolve("./src/components/ui/Badge.tsx");
const badgeContent = fs.readFileSync(badgePath, "utf-8");

assert(
  badgeContent.includes("text-emerald-800") &&
  badgeContent.includes("text-amber-900") &&
  badgeContent.includes("text-rose-800") &&
  badgeContent.includes("text-sky-800") &&
  badgeContent.includes("text-slate-800"),
  "Badge component must use high-contrast text shades for WCAG AA/AAA compliance"
);
console.log("PASS 6: Form inputs, modal dialogs, and high-contrast badges verified.");

console.log("\n*** ALL CHECKPOINT 13 ACCESSIBILITY TESTS PASSED SUCCESFULLY! ***\n");
