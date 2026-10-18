
::: {align="center"} `<img src="docs/images/sahay-homepage.png" alt="Sahay-AI homepage showing the landing page and system health panel" width="100%" />`{=html} # 🌿 SAHAY AI ### Your AI-Powered Financial & Business Companion **Democratizing Capital, Schemes & Knowledge for Small Business** An independent, multilingual AI platform designed to help Indian micro-entrepreneurs discover information, understand eligibility, organize applications, and make more informed business and financial decisions. ```{=html} <p> ``` `<a href="https://sahay-ai-beige.vercel.app/">`{=html}`<img src="https://img.shields.io/badge/🚀_Live_Demo-Open_Sahay-079669?style=for-the-badge" alt="Live demo" />`{=html}`</a>`{=html} `<a href="https://sahay-ai-5.onrender.com">`{=html}`<img src="https://img.shields.io/badge/⚙️_Backend-Render-0F766E?style=for-the-badge" alt="Backend API" />`{=html}`</a>`{=html} `<a href="https://sahay-ai-5.onrender.com/docs">`{=html}`<img src="https://img.shields.io/badge/📚_API_Documentation-Swagger-4F46E5?style=for-the-badge" alt="API docs" />`{=html}`</a>`{=html} ```{=html} </p> ``` **[🌐 Open Live App](https://sahay-ai-beige.vercel.app/) · [📚 Explore API Docs](https://sahay-ai-5.onrender.com/docs) · [💻 View Source Code](https://github.com/sayantandutta-18/Sahay-AI)** :::
🧭 Table of Contents
Project Overview
Mission & Vision
Core Principles
Live Demo & Resources
Homepage Demo Screenshot
Features & Modules
Multilingual Experience
System Architecture
Technology Stack
Repository & Folder Structure
How the Platform Works
Getting Started Locally
Environment Configuration
Testing & Quality Checks
Security, Privacy & Responsible
AI
Roadmap
Resources
Contributing
Disclaimer
License
✨ Project Overview
Sahay AI is an independent software project focused on making
financial and business information easier to discover, understand, and
organize.

Micro-entrepreneurs may need to navigate scheme information, review
eligibility criteria, prepare documents, track applications, and
understand business finances. Sahay aims to bring these activities into
a single, approachable experience with multilingual support.

                                  Details
🏷️ Project name Sahay AI

🎯 Domain Financial information,
micro-enterprise support, scheme
discovery and business tools

👥 Intended users Indian micro-entrepreneurs,
small-business owners and
individuals seeking accessible
financial information

🌐 Languages English, Hindi and Bengali

🖥️ Frontend deployment Vercel

⚙️ Backend deployment Render

📚 API documentation FastAPI / Swagger UI

💻 Repository sayantandutta-18/Sahay-AI
The problem
Useful financial and scheme-related information can be spread across
different websites and tools. Eligibility language may be difficult to
understand, application documents can be hard to organize, and business
information may not be easy to interpret.

The approach
Sahay brings together information discovery, rule-based eligibility
workflows, application organization, business insights and AI-assisted
explanations in one interface. The exact availability of each module
depends on the current implementation and integrations.

🎯 Mission & Vision
🌱 Mission
Make financial knowledge more accessible, understandable and actionable
for people who run or want to grow small businesses.

🔭 Vision
Build a trustworthy, multilingual digital companion that helps users
move from confusing information to clearer next steps---without
replacing official sources, professional advice or user judgment.

💚 Product goals
Make complex information easier to navigate.
Present eligibility outcomes with clear reasoning.
Help users organize documents and application progress.
Support users in their preferred language.
Explain financial concepts in accessible language.
Design for transparency, privacy and practical usefulness.
🧩 Core Principles
These principles guide the intended product design and future
development.

1. ✅ Accuracy before confidence
Scheme details, eligibility rules and financial information should be
grounded in reliable sources. If information is missing or uncertain,
the product should say so.

2. 🧮 Deterministic calculations
Eligibility decisions and financial calculations should use explicit,
testable application logic wherever possible. An AI model may explain a
result, but must not invent or override the underlying calculation.

3. 📚 Source-aware assistance
AI-generated explanations should use available supporting information
and make uncertainty clear. Users should be encouraged to verify
important details through official sources.

4. 🌍 Accessibility & inclusion
The experience should be readable, responsive and usable across
supported languages and common devices.

5. 🔐 Privacy & least privilege
Private documents, account data and privileged actions should be
protected with appropriate authentication, authorization and data-access
controls.

6. 🧱 Modular, maintainable engineering
Keep routes, services, schemas, data models and UI components organized
so features can be tested and improved independently.

7. 🩺 Honest system status
Show connected or healthy status only when the relevant check succeeds.
Do not hide errors or replace failed API responses with fake success
states.

8. 🤝 Human-centered decisions
Sahay is intended to assist users, not make consequential financial,
legal, government-benefit or investment decisions on their behalf.

🚀 Live Demo & Resources
Resource Description Link

🌐 Live frontend Open the deployed Sahay sahay-ai-beige.vercel.app
interface

⚙️ Backend service Deployed API base URL sahay-ai-5.onrender.com

📚 Interactive API Explore available Open API Docs
docs endpoints through
Swagger UI

💻 Source code Repository, issues and GitHub Repository
project history

Live status note: A URL being available does not guarantee that
every feature or integration is currently healthy. The homepage
screenshot below records what the system-health panel displayed at the
time it was captured.

🖼️ Homepage Demo Screenshot
::: {align="center"} `<img src="docs/images/sahay-homepage.png" alt="Sahay AI landing page with navigation, onboarding actions, backend health and database status" width="100%" />`{=html} **Figure 1. Sahay AI homepage demo** :::
The supplied screenshot shows the main landing-page headline, language
selector, Dashboard and Admin navigation, onboarding actions, and the
System Health & Backend Connection panel.

At screenshot time, the panel displayed: - 🟢 Backend Health:
Connected - 🟢 Database: Connected - ⏱️ Displayed latency: 413
ms - 🗃️ Displayed database label: SQLite WAL, 21 tables

These are screenshot observations, not a guarantee of current uptime or
a claim about the database currently used in production. Check the live
app and backend configuration for current status.

💎 Features & Modules
The following describes the product modules and intended behavior. A
feature should be treated as production-ready only after its
implementation and live behavior have been verified.

🏛️ 1. Scheme Discovery
Explore scheme-related information.
Review published requirements and important conditions.
Identify details that need verification from an official source.
🎯 2. Eligibility Evaluation
Collect relevant user-provided information.
Compare inputs with implemented eligibility rules.
Explain outcomes and missing information.
Avoid presenting an estimate as an official approval.
🗂️ 3. Application Tracker
Organize application progress.
Track checklists and pending steps.
Make next actions easier to review.
🔐 4. Document Vault & Readiness
Organize document records and requirements.
Identify missing items where supported.
Apply strict access controls to private documents and records.
💼 5. Business & Financial Insights
Support review of income and expenses where implemented.
Help users understand trends and summaries.
Make assumptions behind calculations clear.
📈 6. Stock Learning & Analysis
Present educational explanations and structured analysis where
available.
Distinguish educational content from personalized financial advice.
Never imply guaranteed investment returns.
🤖 7. AI-Assisted Companion
Explain complex information in simpler language.
Help users navigate available platform information.
Communicate limitations and uncertainty rather than fabricating
facts.
🛡️ 8. Admin & Audit Workflows
Support restricted administrative operations where implemented.
Protect privileged routes and data.
Maintain appropriate activity records where configured.
🩺 9. System Health & API Connection
Show backend connectivity and database status when checks are
available.
Help identify API and database connection problems.
Report failures honestly rather than displaying a false connected
state.
🌍 Multilingual Experience
Sahay is designed to support users in three languages.

Language Locale code Experience

🇬🇧 English en English interface content
🇮🇳 हिन्दी hi Hindi interface content
🇮🇳 বাংলা bn Bengali interface content

Localization goals
🗣️ Consistent language switching across supported pages.
🧩 Translation keys kept in parity across locales.
💱 Appropriate Indian Rupee (INR) formatting.
📝 Clear, accessible wording rather than literal or confusing
translations.
Previously reported check: translation-key parity across en, hi
and bn, along with INR formatting checks, passed in a reported run.
Re-run the checks after changes.

🏗️ System Architecture
Sahay follows a frontend/backend architecture. The deployed frontend
communicates with the API over HTTP(S), while the backend handles
application logic and database access.

                         👤 USER
                            │
                            ▼
              ┌──────────────────────────┐
              │       FRONTEND           │
              │  Next.js · React · TS     │
              │          Vercel          │
              └────────────┬─────────────┘
                           │
                           │ HTTPS / REST API
                           ▼
              ┌──────────────────────────┐
              │       BACKEND API        │
              │      Python · FastAPI    │
              │         Render           │
              └────────────┬─────────────┘
                           │
                           │ Database connection
                           ▼
              ┌──────────────────────────┐
              │       DATA LAYER         │
              │ Database configured by   │
              │ backend environment      │
              └──────────────────────────┘
🔄 Request lifecycle
A user opens a page or performs an action in the frontend.
The frontend API client sends a request to the configured backend
URL.
FastAPI validates the request and runs the relevant route/service
logic.
Database-dependent operations access the configured database.
The API returns a structured response.
The frontend displays the result or a meaningful error state.
🩺 Health checks are separate concerns
Backend health checks whether the API is responding.
Database health checks whether the backend can perform a safe
database connectivity check.
Frontend connectivity status reflects the result observed by the
browser and may also be affected by CORS, URL configuration, network
failures or timeouts.
A successful frontend build alone does not prove the live API/database
connection works.

🛠️ Technology Stack
Layer Technology Purpose

🎨 Frontend Next.js Application framework
and routing

⚛️ UI React Component-based
interface

🔷 Language TypeScript Typed frontend code

💅 Styling Tailwind CSS UI styling and
responsive layouts

⚙️ Backend Python + FastAPI API routes and
application logic

📦 Validation Pydantic Request/response
validation

🗄️ Data Database configured by Persistent application
backend data

🧪 Tests pytest Backend automated tests

🌐 Frontend hosting Vercel Frontend deployment

☁️ Backend hosting Render Backend deployment

📚 API exploration Swagger UI Interactive API
documentation

Database clarification: The supplied homepage screenshot displayed
SQLite WAL (21 tables). The project's actual production database must
be confirmed from the backend configuration and hosting environment.
PostgreSQL should not be described as the active production database
unless the deployed application is configured to use it.

AI providers, retrieval systems, vector databases, payment services or
other integrations should be documented as active only when they are
present and configured in the current codebase.

📂 Repository & Folder Structure
The following is a logical guide to the repository layout. It
includes the main areas referenced by the project; use the actual
repository as the source of truth for exact filenames.

Sahay-AI/
│
├── frontend/                       # Next.js frontend
│   ├── src/
│   │   ├── app/                    # Routes and page layouts
│   │   ├── components/             # Reusable UI components
│   │   │   └── ui/                 # Shared interface elements
│   │   ├── lib/                    # API client, i18n and utilities
│   │   └── types/                  # Shared TypeScript types
│   ├── scripts/                    # Localization/validation scripts
│   ├── public/                     # Static assets
│   ├── package.json                # Frontend scripts and dependencies
│   └── .gitignore
│
├── backend/                        # FastAPI backend
│   ├── app/
│   │   ├── main.py                 # FastAPI application entry point
│   │   ├── routes/                 # API endpoints
│   │   ├── schemas/                # Request/response schemas
│   │   ├── models/                 # Database models
│   │   ├── services/               # Business logic
│   │   ├── database/               # Database session and setup
│   │   └── core/                   # Settings, security and shared config
│   ├── tests/                      # Backend test suite
│   ├── requirements.txt            # Python dependencies
│   └── .env                        # Local secrets; do not commit
│
├── docs/
│   └── images/
│       └── sahay-homepage.png      # Homepage demo screenshot
│
├── .gitignore
├── render.yaml                     # Deployment config, if maintained
└── README.md
📌 Structure principles
routes/ defines API endpoints and HTTP behavior.
schemas/ validates incoming and outgoing data.
models/ describes database entities.
services/ holds reusable business logic.
database/ manages database connectivity and sessions.
core/ contains shared configuration and security utilities.
components/ contains reusable frontend UI.
lib/ contains shared frontend helpers such as API clients and
localization logic.
tests/ verifies expected behavior and helps prevent
regressions.
⚙️ Getting Started Locally
📋 Prerequisites
Git
Node.js and npm
Python version supported by backend/requirements.txt
A reachable database configured for the backend
Environment variables required by the current codebase
1. Clone the repository
git clone https://github.com/sayantandutta-18/Sahay-AI.git
cd Sahay-AI
2. Set up the backend
In PowerShell, from the repository root:

cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Create/configure the backend environment file using the exact variable
names expected by the settings code.

If app/main.py exports a FastAPI instance named app, start the
development server with:

python -m uvicorn app.main:app --reload
API base: http://localhost:8000
Swagger docs: http://localhost:8000/docs
3. Set up the frontend
Open a second terminal from the repository root:

cd frontend
npm install
Create frontend/.env.local using the exact API variable read by
frontend/src/lib/api.ts. Example only:

NEXT_PUBLIC_API_URL=http://localhost:8000
Then run:

npm run dev
Open http://localhost:3000.

4. Verify the connection
Confirm the backend starts without import or configuration errors.
Confirm the frontend uses the correct API base URL.
Confirm backend CORS permits the local frontend origin.
Confirm the database configured for the backend is reachable.
Test the health endpoint and a database-dependent API route.
💡 VS Code is an editor, not a database server. You do not need to
install PostgreSQL locally if the backend is intentionally configured
to use a reachable hosted database. The configured database engine and
URL must match the actual backend setup.

🔐 Environment Configuration
Environment-variable names must match the current code. The following
values are examples, not guaranteed names for every deployment.

Frontend --- frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
If the frontend API client reads NEXT_PUBLIC_API_URL, the production
value can be:

NEXT_PUBLIC_API_URL=https://sahay-ai-5.onrender.com
Backend --- backend/.env
DATABASE_URL=your-database-connection-string
SECRET_KEY=replace-with-a-strong-random-secret
Only add variables that the current backend requires.

🔒 Secret-handling rules
Never commit .env files, passwords, API keys, JWT secrets or
access tokens.
Configure production variables through Vercel/Render environment
settings.
Do not expose private backend secrets through NEXT_PUBLIC_*
variables.
Use separate development and production credentials.
Do not commit real user documents or personal financial data.
🧪 Testing & Quality Checks
Run these from the repository root unless noted otherwise.

🐍 Backend tests
backend\.venv\Scripts\python.exe -m pytest backend\tests -q
🌐 Localization checks
node frontend\scripts\test-i18n.mjs
🏗️ Production frontend build
cd frontend
npm run build
📊 Previously reported results
Check Status

Backend automated tests ✅ 59 passed in a previously
reported run

Translation-key parity (en, hi, ✅ Passed in a previously reported
bn) run

INR formatting ✅ Passed in a previously reported
run

Current production build ⏳ Re-run and confirm

Live frontend/backend/database ⏳ Verify against current
integration deployment
These results are historical reports from development, not a guarantee
that the latest code or deployment passes all checks.

🗺️ Roadmap
🧱 Phase 1 --- Reliability & Core Experience
Verify live API and database health end-to-end.
Complete frontend/backend integration testing.
Improve error states, timeout handling and retry behavior.
Verify authorization on protected endpoints.
Confirm production build and deployment configuration.
🏛️ Phase 2 --- Scheme & Application Workflows
Verify scheme information against official sources.
Expand and test eligibility rule coverage.
Improve application checklists and progress tracking.
Review document access controls and retention.
Strengthen administrative permissions and audit coverage.
💼 Phase 3 --- Business & Financial Intelligence
Expand business income and expense summaries.
Add financial health and emergency-fund analysis.
Develop transparent what-if simulations.
Improve explainable risk indicators.
Expand grounded AI assistance.
Evaluate fraud indicators and false-positive behavior.
🚀 Phase 4 --- Production Readiness
Complete security and privacy reviews.
Add monitoring and error reporting.
Validate backups and recovery procedures.
Expand automated and end-to-end tests.
Document deployment and incident-response processes.
🔒 Security, Privacy & Responsible AI
Sahay handles workflows that may involve sensitive personal, document or
financial information. Security should be part of the
implementation---not just documentation.

🔐 Enforce authentication and authorization on the server.
🧾 Validate incoming data and return safe error messages.
🛡️ Restrict admin operations to authorized users.
📂 Apply access checks to every private document or user-owned
record.
🔑 Keep secrets out of source control, browser bundles and logs.
🏛️ Verify scheme requirements against official sources.
🤖 Treat AI output as assistance, not guaranteed truth.
🧮 Explain assumptions behind financial calculations.
🚨 Treat fraud signals as reasons to review, not proof of
wrongdoing.
🧪 Test failure cases as well as successful requests.
🤝 Contributing
Suggestions, bug reports and contributions are welcome.

🍴 Fork the repository.
🌱 Create a focused branch.
💻 Implement your change with clear, maintainable code.
🧪 Add or update tests.
✅ Run relevant checks.
📬 Open a pull request describing the change and its validation.
Example branch names:

feature/application-tracker
feature/financial-insights
fix/backend-health-check
test/api-integration
Please do not commit credentials, private user data or unverified claims
about production behavior.

📚 Resources
🌐 Live application: Sahay
AI
⚙️ Backend: Render service
📖 API reference: Swagger
UI
💻 Repository: GitHub source
code
🧰 Next.js documentation:
nextjs.org/docs
⚛️ React documentation: react.dev
🐍 FastAPI documentation:
fastapi.tiangolo.com
🧪 pytest documentation:
docs.pytest.org
Use official scheme portals and authoritative financial sources when
verifying real-world scheme or financial information.

⚠️ Disclaimer
Sahay AI is an independent software project intended to support
information discovery, organization and financial understanding.

It is not affiliated with or endorsed by any government authority.
Scheme details, deadlines and eligibility criteria must be verified
through official sources.
AI-generated content may contain errors or omissions.
Eligibility evaluations are informational and do not guarantee
government approval.
Financial simulations are estimates, not guarantees.
Investment-related information does not guarantee returns.
Fraud indicators do not prove that a person, account or transaction
is fraudulent.
Seek qualified professional advice for consequential financial,
legal or investment decisions.
📄 License
A project license has not been specified in this README. Add a LICENSE
file once the repository owner selects a license.

::: {align="center"} # 🌿 Sahay AI ### Clearer information. Better-informed decisions. **[🚀 Live Demo](https://sahay-ai-beige.vercel.app/) · [📚 API Docs](https://sahay-ai-5.onrender.com/docs) · [💻 Source Code](https://github.com/sayantandutta-18/Sahay-AI)** `<sub>`{=html}Built to make financial and business information more accessible.`</sub>`{=html} :::
