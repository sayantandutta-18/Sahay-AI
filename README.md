<div align="center">

# 🌿 Sahay AI

### Your AI-Powered Financial & Business Companion

*Democratizing capital, schemes and knowledge for small businesses.*

A multilingual platform that helps Indian micro-entrepreneurs explore scheme information, understand eligibility, organize applications, and make sense of their business finances.

[🌐 Live App](https://sahay-ai-beige.vercel.app/) · [⚡ Backend API](https://sahay-ai-5.onrender.com/) · [📚 API Docs](https://sahay-ai-5.onrender.com/docs) · [💻 Source Code](https://github.com/sayantandutta-18/Sahay-AI)

[![CI](https://github.com/sayantandutta-18/Sahay-AI/actions/workflows/ci.yml/badge.svg)](https://github.com/sayantandutta-18/Sahay-AI/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
![Next.js](https://img.shields.io/badge/Next.js-16.4.6-000000?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=for-the-badge&logo=fastapi&logoColor=white)

</div>

> 🇮🇳 **Note:** Sahay AI is an independent project. It is not an official government website and is not affiliated with, endorsed by, or operated by any government authority.

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Current Status](#-current-status)
- [Screenshots](#-screenshots)
- [Features](#-features)
- [Multilingual Support](#-multilingual-support)
- [Design Principles](#-design-principles)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Repository Structure](#-repository-structure)
- [Getting Started](#-getting-started)
- [Environment Configuration](#-environment-configuration)
- [Testing](#-testing)
- [Roadmap](#-roadmap)
- [Security & Responsible AI](#-security--responsible-ai)
- [Contributing](#-contributing)
- [License](#-license)
- [Disclaimer](#-disclaimer)

---

## ✨ Overview

Small-business owners often have to navigate scattered scheme information, hard-to-read eligibility rules, document checklists, and unfamiliar financial concepts. **Sahay AI** brings these workflows into one approachable, multilingual interface with AI-assisted explanations.

**Mission:** Make business and financial information easier to access, understand, and act on.

**Vision:** A trustworthy digital companion that helps people move from scattered information to clearer next steps.

| | |
|---|---|
| **Audience** | Indian micro-entrepreneurs and small-business owners |
| **Focus** | Scheme discovery, eligibility, application tracking, financial understanding |
| **Languages** | English, Hindi, Bengali |
| **Frontend** | Next.js on Vercel |
| **Backend** | FastAPI on Render |

---

## 📊 Current Status

Sahay AI is in an **active release-ready state** following the completion of all 16 systematic development milestones (Checkpoints 0 through 15).

### What Works
- **Eligibility Engine & Questionnaire**: Pure-function deterministic rules engine (`rules_engine.py`) evaluating user inputs against government guidelines without hallucinations.
- **Verified Scheme Library & Caching**: 7 seeded national and state schemes complete with official government portal URLs, categories, eligibility criteria, required documents, and in-memory 60s TTL caching with automatic invalidation upon administrative updates.
- **3-State Verification Badging**: Real-time classifications (`Verified`, `Outdated`, `Unverified`) with direct portal links, official circular citations, and 180-day freshness auditing.
- **Business Readiness Radar**: 5-axis dimensional assessment (Documentation, Banking, Turnover, Compliance, Digital) with interactive, responsive SVG visualization and personalized action items.
- **Application Tracker & Vault**: Application pipeline tracking with stage progress bars, pending steps, document checklists, and local state persistence with strict ownership validation (returning 404 for unowned private resources).
- **Scheme Comparison Matrix**: Side-by-side comparison matrix with sticky dock, URL state sharing (`?compare=slug1,slug2`), and automatic 6-scheme safety capping.
- **Multilingual Search & Filter Presets**: Real-time cross-language keyword expansion across English, Hindi, and Bengali (e.g., searching "মহিলা" matches women entrepreneur schemes), plus quick-filter chips.
- **Interactive State Scheme Directory**: SVG map of India with interactive hover and click selection, state-filtered scheme queries, and keyboard accessibility.
- **Terminology Glossary & Onboarding Tour**: 3-step interactive onboarding walkthrough with targeted tooltips and auto-highlighted technical terms (`PMEGP`, `margin money`, `collateral-free`, `Udyam`).
- **Dual AI Operation (Live & Fallback Modes)**: Live Gemini / OpenAI / Groq integration with graceful, transparent fallback to deterministic offline responses when rate limits are reached or API keys are unconfigured.
- **Accessibility & Contrast**: Full WCAG 2.1 AA keyboard landmarks (`#main-content` skip link), dual-encoded badges (color + icons) for color-blind accessibility, and mobile truncation safety.
- **Production Security, RBAC & DPDP Act Compliance**:
  - Reusable server-side `require_admin()` dependency checking the live database user role, returning 403 Forbidden for unauthorized users.
  - Rate limiting & brute-force account lockout: 5 consecutive failed login attempts locks out the phone account for 15 minutes with `Retry-After` headers and generic error messaging.
  - Shortened session lifetimes: 120 minutes for standard users and 60 minutes for administrative users, paired with an idempotent `GET`/`POST` `/api/v1/auth/logout` endpoint.
  - Frontend automatic session expiration handling (redirecting to `/login?expired=1` without looping).
  - Magic-byte file signature validation on uploads (PDF, PNG, JPEG with 10MB ceiling), AES-128-CBC + HMAC-SHA256 authenticated encryption with automatic PII masking (PAN, Aadhaar, Bank Accounts), statutory Right to Erasure (`DELETE /api/v1/auth/me`), and zero committed secrets.
- **Production Multi-Worker Runtime**: Gunicorn multi-worker ASGI runtime (`gunicorn -k uvicorn.workers.UvicornWorker -w 2`) configured for Render Linux environments, with real database query health checks on `/health` (returning 503 if unreachable).
- **Render Cold-Start UX Handler**: Proactive status banner detecting Render free-tier cold-starts with localized spin-up notifications in English, Hindi, and Bengali, paired with extended 45s timeouts.
- **Continuous Integration (CI)**: GitHub Actions workflow (`.github/workflows/ci.yml`) running 132 backend pytest tests, full frontend audit scripts (i18n parity, a11y, verification, comparison, search, state map, tour, AI mode), and Next.js 16 production build on every push and PR.

### What is Partial
- **Render Free-Tier Spin-Up Latency**: Because the backend runs on Render's free tier, idle instances take 30–45 seconds on the very first incoming request. This delay is now transparently communicated to users via the localized cold-start banner.
- **External AI Provider Quotas**: Free-tier Gemini / OpenAI API quotas can be constrained during bursts; the platform's automatic fallback layer ensures zero interruption or error states by falling back to verified local responses.

### What is Planned (Next Milestones)
- **Direct DigiLocker Integration**: Direct fetching of official government certificates via DigiLocker API.
- **Automated Document OCR & Verification**: Offline OCR processing to pre-fill application questionnaires from Aadhaar and Udyam certificates.
- **Automated Scheme Deadline Alerts**: Real-time SMS and WhatsApp notifications for expiring scheme application windows.

---

## 📸 Screenshots

<table>
  <tr>
    <td align="center" width="100%">
      <strong>🏠 Homepage</strong><br><br>
      <a href="https://sahay-ai-beige.vercel.app/">
        <img src="docs/images/sahay-homepage.png" alt="Sahay AI homepage with language selector, onboarding actions and system health panel" width="100%">
      </a><br>
      <sub>Language selector, onboarding actions, and backend/database health panel.</sub>
    </td>
  </tr>
  <tr>
    <td align="center" width="100%">
      <strong>📊 Dashboard</strong><br><br>
      <img src="docs/images/sahay-dashboard.png" alt="Sahay AI dashboard" width="100%"><br>
      <sub>Dashboard overview.</sub>
    </td>
  </tr>
</table>

> Screenshots are point-in-time captures and do not reflect current uptime or production configuration.

---

## 💎 Features

| Module | What it does |
|---|---|
| 🏛️ **Scheme Discovery** | Browse scheme information, published eligibility criteria, and commonly required documents, with reminders to verify against official sources. |
| 🎯 **Eligibility Evaluation** | Compares user-provided details against implemented rules, explains outcomes, and flags missing information. Rule-based checks stay separate from AI-generated text. |
| 📌 **Application Tracker** | Organizes application records, progress, pending steps, and checklists in one place. |
| 🔐 **Document Vault & Readiness** | Tracks document records and metadata, links them to workflows, and highlights potentially missing items. |
| 💼 **Business & Financial Insights** | Reviews income and expenses, surfaces spending patterns and possible savings, using structured, transparent calculations. |
| 📈 **Stock Learning & Analysis** | Educational content and analysis workflows. Not personalized investment advice and never a guarantee of returns. |
| 🤖 **AI Companion** | Explains complex information in plain language and helps users navigate the platform, while communicating assumptions and uncertainty. |
| 🛡️ **Admin, Audit & Health** | Restricted administrative workflows, audit visibility, and a live backend/database health panel. |

> Feature availability depends on the current implementation and configured integrations. Eligibility results are informational and do not guarantee approval or benefits.

---

## 🌍 Multilingual Support

| Language | Locale |
|---|---|
| 🇬🇧 English | `en` |
| 🇮🇳 हिन्दी | `hi` |
| 🇮🇳 বাংলা | `bn` |

Localization goals: consistent language switching, translation-key parity across all locales, clear wording, and proper Indian Rupee (INR) formatting.

---

## 🧩 Design Principles

| Principle | How it guides the project |
|---|---|
| ✅ **Accuracy first** | Ground scheme and financial information in reliable sources and communicate uncertainty. |
| 🧮 **Deterministic calculations** | Eligibility and financial arithmetic run in explicit, testable application logic. AI explains results; it never invents or overrides them. |
| 📚 **Source-aware AI** | Use available evidence and encourage official verification for consequential information. |
| 🔐 **Privacy & least privilege** | Protect private data with authentication, authorization, and access checks. |
| 🌍 **Accessibility** | Keep the interface readable, responsive, and usable in every supported language. |
| 🧱 **Modular engineering** | Routes, schemas, models, services, and UI components have clear responsibilities. |
| 🩺 **Honest system status** | Health indicators reflect real checks; errors are never disguised as success. |
| 🤝 **Human in control** | Support decisions without promising approvals, returns, or outcomes. |

---

## 🏗️ Architecture

The frontend communicates with the backend over HTTP(S). The backend handles validation, business logic, authentication, and database access.

```mermaid
flowchart TD
    U[👤 User] --> F["Frontend<br/>Next.js · React · TypeScript · Tailwind"]
    F -- HTTP API --> B["Backend<br/>Python · FastAPI"]
    B --> A[Authentication]
    B --> R[Routes & Validation]
    B --> S["Schemes & Eligibility"]
    B --> W[Application Workflows]
    B --> M[Financial Features]
    B --> L[AI-Assisted Services]
    B --> D[("Database<br/>configured via DATABASE_URL")]
```

| Layer | Deployment | Responsibility |
|---|---|---|
| Frontend | Vercel | User interface |
| Backend | Render | API endpoints and application logic |
| Database | Set by backend configuration | Persistent application data |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | Next.js |
| UI library | React |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Backend | Python, FastAPI |
| Validation | Pydantic |
| Testing | pytest |
| Localization | Custom i18n utilities |
| Hosting | Vercel (frontend), Render (backend) |
| API explorer | Swagger UI |
| Version control | Git & GitHub |

---

## 📂 Repository Structure

```text
Sahay-AI/
├── .github/
│   ├── ISSUE_TEMPLATE/        # GitHub defect, feature, & contributor templates
│   └── workflows/ci.yml       # GitHub Actions automated CI workflow
│
├── frontend/                  # Next.js 16.4.6 web application
│   ├── public/                # Static assets, icons, and SVG maps
│   ├── scripts/               # Automated audit scripts (i18n, a11y, state map, etc.)
│   ├── src/
│   │   ├── app/               # Next.js App Router (19 prerendered routes)
│   │   ├── components/        # UI, Layout, Radar, Map, & Candlestick components
│   │   ├── lib/               # Typed API client, i18n, search, glossary, & state data
│   │   └── types/             # TypeScript interfaces and response schemas
│   └── package.json
│
├── backend/                   # FastAPI Python backend service
│   ├── app/
│   │   ├── core/              # Config, CORS, & AES-128-CBC encryption security
│   │   ├── database/          # Database session, base model, & migrations
│   │   ├── models/            # SQLAlchemy database entities
│   │   ├── routes/            # REST API endpoints (schemes, auth, admin, etc.)
│   │   ├── schemas/           # Pydantic request & response validation models
│   │   ├── services/          # Pure-function rule engine & AI integrations
│   │   └── main.py            # FastAPI entry point & lifespan handler
│   ├── tests/                 # Pytest test suite (132 automated unit tests)
│   └── requirements.txt
│
├── docs/                      # Security policy, audit documentation, & images
│   ├── SECURITY_AND_DATA_RETENTION_POLICY.md
│   └── images/
│
├── .env.example               # Root configuration template
├── LICENSE                    # MIT Open-Source License
└── README.md                  # Project documentation & release status
```

---

## 🚀 Getting Started

### Prerequisites

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) and npm
- Python version compatible with `backend/requirements.txt`
- A database reachable by the backend

### 1. Clone the repository

```bash
git clone https://github.com/sayantandutta-18/Sahay-AI.git
cd Sahay-AI
```

### 2. Start the backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1      # macOS/Linux: source .venv/bin/activate
python -m pip install -r requirements.txt
```

Configure the backend environment variables (see [Environment Configuration](#-environment-configuration)), then run:

```bash
python -m uvicorn app.main:app --reload
```

- API: <http://localhost:8000>
- Swagger UI: <http://localhost:8000/docs>

### 3. Start the frontend

In a second terminal:

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

```bash
npm run dev
```

Open <http://localhost:3000>.

### 4. Verify the setup

- [ ] Backend starts without import or configuration errors
- [ ] Frontend uses the correct API base URL
- [ ] Backend CORS allows the local frontend origin
- [ ] The configured database is reachable
- [ ] Health endpoint and a database-backed route respond correctly

---

## 🔐 Environment Configuration

Variable names must match the current code. Use `.env.example`, the backend settings module, and `frontend/src/lib/api.ts` as the source of truth.

**Frontend — `frontend/.env.local`**

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Backend — `backend/.env`**

```env
# Database & Security
DATABASE_URL=sqlite+aiosqlite:///./sahay.db  # or postgresql+asyncpg://user:pass@host/dbname
SECRET_KEY=replace-with-a-64-character-random-secret
DATA_ENCRYPTION_KEY=replace-with-base64-encoded-32-byte-fernet-key

# AI Engine Configuration (Defaults to demo mode if keys are omitted)
AI_MODE=auto                                 # auto | live | demo
GEMINI_API_KEY=your-gemini-api-key-here
OPENAI_API_KEY=your-openai-api-key-here
```

Add an AI provider key only if you wish to run live external LLM inference. If omitted, Sahay automatically activates the verified local **Demo Mode**.

**Secret-handling rules**

- Never commit `.env` files, passwords, API keys, JWT secrets, or tokens.
- Never expose backend secrets through `NEXT_PUBLIC_*` variables.
- Configure production variables in the hosting provider's dashboard.
- Use separate credentials for development and production.
- Restrict CORS to required frontend origins.

---

## 🧪 Testing

Sahay AI maintains extensive automated test coverage across both the backend service and the frontend web application.

### Backend Pytest Suite (113 Tests)

```bash
# Run all backend unit and API tests
python -m pytest backend/tests -v

# Run automated repository secret scanner
python -m pytest backend/tests/test_secret_scan.py -v

# Run security, privacy, and encryption verification
python -m pytest backend/tests/test_checkpoint14_security.py -v
```

### Frontend Audits & Verification

```bash
cd frontend

# 1. Audit 100% i18n translation key parity across English, Hindi, and Bengali
npm run test:i18n

# 2. Audit WCAG 2.1 AA keyboard landmarks, skip links, and color-blind dual encoding
npm run test:a11y

# 3. Test verification badge 3-state classification and 180-day freshness logic
npm run test:verification

# 4. Test 5-axis Business Readiness Radar dimensional mathematics
npm run test:readiness

# 5. Test scheme comparison matrix, multi-select chips, and 6-scheme capping
npm run test:comparison

# 6. Test multilingual search keyword expansion (Bengali, Hindi, English)
npm run test:search

# 7. Test interactive India SVG state directory and regional filtering
npm run test:state-map

# 8. Test microfinance glossary auto-highlighting and 3-step onboarding tour
npm run test:tour

# 9. Test dual AI demo/live mode negotiation and rate-limit fallbacks
npm run test:ai-mode

# 10. Compile optimized production Next.js build
npm run build
```

**Pre-release checklist**

- [x] Backend tests pass (113/113 pytest suite verified)
- [x] Frontend production build succeeds (Next.js 16.4.6 with 19/19 routes prerendered)
- [x] i18n parity and INR formatting checks pass (100% key parity across en, hi, bn)
- [x] Frontend can reach the deployed API (verified via connectivity helper and HealthIndicator)
- [x] Database health and persistence verified (SQLite / PostgreSQL health endpoint verified)
- [x] Authentication and protected endpoints tested (401/403 enforced on admin, Right to Erasure implemented)
- [x] Loading, empty, error, and retry states behave correctly (Render cold-start UX + empty states)
- [x] No secrets or private data in the repository (Automated security scan verified 0 leaks)

---

## 🗺️ Roadmap

- [ ] **Reliability:** verify live frontend/backend/database integration end to end; improve error, timeout, and retry states.
- [ ] **Schemes & applications:** validate scheme data against official sources; expand eligibility rule coverage; improve checklists and progress tracking.
- [ ] **Financial intelligence:** richer income/expense summaries, explainable what-if simulations, better grounded AI responses.
- [ ] **Security & privacy:** review authorization, document access controls, retention, and audit coverage.
- [ ] **Production readiness:** monitoring and error reporting, backup/recovery validation, broader end-to-end tests, deployment and incident documentation.
- [ ] **Localization:** keep improving English, Hindi, and Bengali quality.

---

## 🛡️ Security & Responsible AI

- Enforce authentication and authorization on the server, especially for admin routes and private documents.
- Validate all incoming data and return safe error messages.
- Keep secrets out of source control, browser bundles, and logs.
- Treat AI output as assistance, not guaranteed truth; show assumptions and uncertainty.
- Run financial arithmetic and eligibility rules in validated application logic, not in generated text.
- Treat fraud indicators as signals for review, not proof of wrongdoing.
- Do not upload sensitive documents unless the deployed service's storage and access controls have been verified.

---

## 🤝 Contributing

Contributions from the open-source community are warmly welcomed!

1. Fork the repository on GitHub.
2. Check existing issue templates under `.github/ISSUE_TEMPLATE/`:
   - Use `bug_report.md` to report defects and unexpected behaviors.
   - Use `feature_request.md` to propose feature enhancements for micro-entrepreneurs.
   - Look for issues tagged `good-first-issue` for scoped starter tasks.
3. Create a focused branch (e.g. `feature/application-tracker`, `fix/api-health-check`).
4. Make your changes and add or update relevant tests.
5. Ensure all verification checks pass:
   - Backend: `python -m pytest backend/tests`
   - Frontend: `cd frontend && npm run test:i18n && npm run test:a11y && npm run build`
6. Open a pull request describing the change, motivation, and test results.

Please avoid unrelated changes in a PR and never commit credentials or private user data.

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for complete license terms.

---

## ⚠️ Disclaimer

Sahay AI is an independent informational and software project.

- It is not an official government platform and is not affiliated with any government authority.
- Scheme details, deadlines, and eligibility criteria must be verified through official sources.
- AI-generated content may be incomplete or incorrect.
- Eligibility evaluations are informational and do not guarantee approval or benefits.
- Financial calculations and simulations are estimates that depend on inputs and assumptions.
- Investment-related information does not guarantee returns.
- Seek qualified professional advice for consequential financial, legal, or investment decisions.

<div align="center">

**🌿 Sahay AI — Clearer information. Better-informed decisions.**

[🌐 Live Demo](https://sahay-ai-beige.vercel.app/) · [📚 API Docs](https://sahay-ai-5.onrender.com/docs) · [💻 GitHub](https://github.com/sayantandutta-18/Sahay-AI)

</div>
