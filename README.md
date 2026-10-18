
<div align="center"> <img src="docs/images/sahay-homepage.png" alt="Sahay AI homepage demo" width="100%" />
🌿 SAHAY AI
Your AI-Powered Financial & Business Companion
Democratizing Capital, Schemes & Knowledge for Small Business

A multilingual platform designed to make scheme information, eligibility workflows, document readiness and business knowledge easier to understand for Indian micro-entrepreneurs.





🌐 Live App · ⚙️ Backend · 📚 API Docs · 💻 Source Code

</div>
🧭 Contents
01 · Overview
02 · Mission & Vision
03 · Design Principles
04 · Demo & Live Links
05 · Features
06 · Multilingual Experience
07 · Architecture
08 · Technology Stack
09 · Repository Structure
10 · Local Setup
11 · Environment Variables
12 · Testing
13 · Roadmap
14 · Resources
15 · Security & Disclaimer
16 · Contributing
✨ 01 · Project Overview
Sahay AI is an independent software project intended to help small-business owners and micro-entrepreneurs navigate business and financial information through one accessible interface.

The challenge
Information about government schemes, eligibility conditions, application requirements and financial concepts can be difficult to find and understand. People may need to switch between multiple sources and manually keep track of what to do next.

The Sahay approach
Sahay brings together information discovery, eligibility workflows, application organization and business-oriented tools. Its goal is to turn scattered information into clearer, more manageable next steps—while keeping users aware of limitations and the need to verify important details.

Project detail	Information
Project	Sahay AI
Focus	Micro-enterprise support, scheme discovery and financial understanding
Intended audience	Indian micro-entrepreneurs and small-business owners
Languages	English, Hindi and Bengali
Frontend hosting	Vercel
Backend hosting	Render
API framework	FastAPI
Repository	sayantandutta-18/Sahay-AI
Sahay AI is an independent project, not an official government platform.

🎯 02 · Mission & Vision
<div align="center">
🌱 Our Mission	🔭 Our Vision
Make business and financial information easier to access, understand and act on.	Build a trustworthy, multilingual digital companion that helps users make better-informed decisions.
</div>
What we want to achieve
Make complex information easier to navigate.
Explain eligibility outcomes in understandable language.
Help users organize application steps and document requirements.
Provide a more inclusive experience through language support.
Encourage informed decisions through transparent information and calculations.
🧭 03 · Design Principles
Principle	What it means in Sahay
✅ Accuracy first	Important scheme and financial details should be grounded in reliable sources. Uncertainty should be visible.
🧮 Deterministic calculations	Eligibility and financial calculations should use explicit, testable rules. AI may explain a result, not invent or override it.
📚 Source-aware AI	AI assistance should use available evidence and encourage official verification for consequential information.
🌍 Inclusive by design	The interface should be understandable, responsive and usable across supported languages.
🔐 Privacy by default	Authentication, authorization and access checks should protect private user information.
🧱 Modular engineering	UI components, API routes, schemas, services and data models should have clear responsibilities.
🩺 Honest system status	Health indicators must reflect actual checks. Errors should not be disguised as successful connections.
🤝 Human in control	Sahay supports decisions; it does not guarantee approvals, returns or outcomes.
🚀 04 · Demo & Live Links
<div align="center">
🌐 Frontend	⚙️ Backend	📚 API Documentation
Open Sahay AI	Open API Base	Swagger UI
Deployed Next.js interface	Deployed FastAPI service	Explore available API endpoints
</div>
🖼️ Homepage demo
<img src="docs/images/sahay-homepage.png" alt="Sahay AI homepage, language selector, onboarding buttons and system health panel" width="100%" />
<sub>Demo screenshot supplied for the project README. It shows the landing page and the system-health panel as captured at that time.</sub>

What is visible in the screenshot

Sahay branding and language selector for English, Hindi and Bengali.
Onboarding, Dashboard and scheme-discovery actions.
A system-health panel showing backend and database status.
The captured panel displays 413 ms latency and a SQLite WAL (21 tables) label.
These values describe the supplied screenshot only. They do not guarantee current uptime or establish which database is currently configured in production.

💎 05 · Features & Modules
The sections below describe the product areas and their intended purpose. Feature availability can vary with the current implementation and deployed integrations.

<details> <summary><strong>🏛️ Scheme Discovery</strong></summary>
Explore scheme-related information.
Review requirements and important conditions.
Identify details that should be checked against official sources.</details>
<details> <summary><strong>🎯 Eligibility Evaluation</strong></summary>
Collect relevant user-provided details.
Compare inputs with implemented eligibility rules.
Explain outcomes and missing information.
Avoid presenting an informational result as official approval.</details>
<details> <summary><strong>🗂️ Application Tracking</strong></summary>
Organize application progress.
Track checklists and pending steps where supported.
Make next actions easier to review.</details>
<details> <summary><strong>🔐 Document Vault & Readiness</strong></summary>
Organize document records and requirements.
Identify missing items where implemented.
Protect private documents with appropriate access controls.</details>
<details> <summary><strong>💼 Business & Financial Insights</strong></summary>
Review income and expenses where supported.
Present understandable summaries and trends.
Make calculation assumptions clear.</details>
<details> <summary><strong>📈 Stock Learning & Analysis</strong></summary>
Support financial learning and structured analysis where available.
Distinguish educational information from personalized investment advice.
Never imply guaranteed returns.</details>
<details> <summary><strong>🤖 AI-Assisted Companion</strong></summary>
Explain complex information in simpler language.
Help users navigate platform information.
Communicate uncertainty and limitations instead of fabricating facts.</details>
<details> <summary><strong>🩺 System Health & API Connection</strong></summary>
Show backend and database connectivity when the relevant checks are available.
Help identify configuration, CORS, network and database connection problems.
Report failures honestly.</details>
🌍 06 · Multilingual Experience
Sahay is designed to support three languages.

Language	Locale	Purpose
🇬🇧 English	en	English interface
🇮🇳 हिन्दी	hi	Hindi interface
🇮🇳 বাংলা	bn	Bengali interface
Localization goals

Consistent language switching across supported pages.
Translation-key parity across locales.
Appropriate Indian Rupee (INR) formatting.
Clear wording that is easy to understand.
A previous development run reported successful translation-key parity and INR formatting checks. Re-run those checks after making changes.

🏗️ 07 · System Architecture
Sahay uses a frontend/backend model. The frontend communicates with the API over HTTP(S), and the backend handles request validation, application logic and database access.

Request lifecycle
The user interacts with a page or form.
The frontend API client sends a request to the configured backend URL.
FastAPI validates the request and runs the relevant route and service logic.
Database-dependent operations access the configured database.
The backend returns a structured response.
The frontend renders the result or a meaningful error state.
Health checks are different
Backend health means the API responds.
Database health means a database connectivity check succeeds.
Frontend connection status may also be affected by CORS, an incorrect API URL, timeouts or network errors.
A successful frontend build does not by itself prove the live API/database integration works.

🛠️ 08 · Technology Stack
Layer	Technology	Role
Frontend framework	Next.js	App framework and routing
UI	React	Component-based interface
Language	TypeScript	Typed frontend code
Styling	Tailwind CSS	Responsive UI styling
Backend	Python + FastAPI	API endpoints and application logic
Validation	Pydantic	Request/response validation
Testing	pytest	Backend automated tests
Frontend hosting	Vercel	Deploy the frontend
Backend hosting	Render	Deploy the API
API explorer	Swagger UI	Explore available endpoints
Database note: The supplied screenshot shows SQLite WAL (21 tables). Confirm the actual production database from the current backend configuration and hosting environment before documenting PostgreSQL or another database as the active production system.

📂 09 · Repository Structure
Sahay-AI/
│
├── frontend/                         # Next.js application
│   ├── src/
│   │   ├── app/                      # Pages, routes and layouts
│   │   ├── components/
│   │   │   └── ui/                   # Reusable UI components
│   │   ├── lib/                      # API client, i18n and utilities
│   │   └── types/                    # TypeScript types
│   ├── scripts/                      # Checks and helper scripts
│   ├── public/                       # Static assets
│   └── package.json                  # Frontend dependencies/scripts
│
├── backend/                          # FastAPI application
│   ├── app/
│   │   ├── main.py                   # Application entry point
│   │   ├── routes/                   # HTTP endpoints
│   │   ├── schemas/                  # Request/response schemas
│   │   ├── models/                   # Database models
│   │   ├── services/                 # Business logic
│   │   ├── database/                 # Database session/configuration
│   │   └── core/                     # Settings and security utilities
│   ├── tests/                        # Backend tests
│   └── requirements.txt              # Python dependencies
│
├── docs/
│   └── images/
│       └── sahay-homepage.png        # README demo screenshot
│
├── .gitignore
├── render.yaml                       # If used for deployment
└── README.md
This is a documented logical structure. Check the repository for the exact current file and folder names before treating it as a complete file inventory.

Folder responsibilities
routes/ — endpoint definitions and HTTP behavior.
schemas/ — input/output validation.
models/ — database entity definitions.
services/ — reusable business logic.
database/ — database connectivity and session setup.
core/ — configuration and security utilities.
components/ — reusable frontend UI.
lib/ — shared frontend helpers, API client and localization.
tests/ — automated checks for expected behavior.
💻 10 · Run Locally
Prerequisites
Git
Node.js and npm
A Python version supported by backend/requirements.txt
A database reachable by the backend
The environment variables required by the current code
Step 1 — Clone
git clone https://github.com/sayantandutta-18/Sahay-AI.git
cd Sahay-AI
Step 2 — Backend setup
Run in PowerShell from the repository root:

cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Configure the backend environment variables expected by the settings code, then start the API:

python -m uvicorn app.main:app --reload
API: http://localhost:8000
Swagger UI: http://localhost:8000/docs
Step 3 — Frontend setup
Open a second terminal from the repository root:

cd frontend
npm install
Create frontend/.env.local using the exact API variable read by frontend/src/lib/api.ts. Example only:

NEXT_PUBLIC_API_URL=http://localhost:8000
Start the frontend:

npm run dev
Open http://localhost:3000.

Step 4 — Verify the integration
Confirm the backend starts without import/configuration errors.
Confirm the frontend points to the correct API base URL.
Confirm CORS allows the local frontend origin.
Confirm the configured database is reachable.
Test both the health endpoint and a database-dependent endpoint.
VS Code is an editor, not a database server. A local PostgreSQL installation is not required if the backend is intentionally configured to use a reachable hosted database. The configured database engine and connection URL must match the application setup.

🔐 11 · Environment Variables
Variable names must match the current codebase. The examples below are illustrative.

Frontend — frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
If the API client reads NEXT_PUBLIC_API_URL, the production value may be set to:

NEXT_PUBLIC_API_URL=https://sahay-ai-5.onrender.com
Backend — backend/.env
DATABASE_URL=your-database-connection-string
SECRET_KEY=replace-with-a-strong-random-secret
Only configure variables actually used by the backend.

Never commit

.env files or passwords.
API keys, JWT secrets or access tokens.
Real user documents or private financial data.
Set production values through the hosting provider's environment settings. Never expose backend secrets through NEXT_PUBLIC_* variables.

🧪 12 · Testing & Quality
Run commands from the repository root unless specified otherwise.

Backend tests
backend\.venv\Scripts\python.exe -m pytest backend\tests -q
Localization checks
node frontend\scripts\test-i18n.mjs
Production frontend build
cd frontend
npm run build
Previously reported development checks
Check	Reported result
Backend test suite	59 passed in a previous run
Translation-key parity (en, hi, bn)	Passed in a previous run
INR formatting	Passed in a previous run
Latest production build	Re-run to confirm
Live API + database integration	Verify against current deployment
Historical test results are not a guarantee that the latest code or production deployment is healthy.

🗺️ 13 · Roadmap
Reliability: Verify live API and database health end-to-end.
Integration: Test key frontend/backend user journeys.
UX: Improve loading, empty, error and retry states.
Scheme workflows: Verify details against official sources and expand rule tests.
Applications: Improve progress tracking and document readiness.
Business tools: Expand transparent income, expense and financial summaries.
AI assistance: Improve grounded answers and communicate uncertainty.
Security: Review authorization, document access and secret handling.
Operations: Add monitoring, backups and recovery documentation.
Quality: Expand automated and end-to-end test coverage.
📚 14 · Resources
Resource	Link
🌐 Live Sahay app	sahay-ai-beige.vercel.app
⚙️ Backend service	sahay-ai-5.onrender.com
📖 Interactive API documentation	Swagger UI
💻 Source code	GitHub repository
🧰 Next.js docs	nextjs.org/docs
⚛️ React docs	react.dev
🐍 FastAPI docs	fastapi.tiangolo.com
🧪 pytest docs	docs.pytest.org
For real scheme information, always consult the relevant official government source.

🔒 15 · Security & Disclaimer
Sahay may involve sensitive personal, document or financial information. Protect it through server-side authorization, input validation, restricted admin access, safe error handling and careful secret management.

Sahay AI is not affiliated with or endorsed by a government authority.
Scheme requirements, deadlines and eligibility criteria must be verified through official sources.
AI-generated content may contain errors or omissions.
Eligibility results are informational and do not guarantee approval.
Financial simulations are estimates, not guarantees.
Investment-related content does not guarantee returns.
A fraud indicator is not proof that a person, account or transaction is fraudulent.
Seek qualified professional advice for consequential financial, legal or investment decisions.
🤝 16 · Contributing
Contributions, suggestions and bug reports are welcome.

Fork the repository.
Create a focused feature or fix branch.
Make a clear, maintainable change.
Add or update relevant tests.
Run the applicable quality checks.
Open a pull request describing the change and the checks performed.
Example branch names:

feature/application-tracker
feature/financial-insights
fix/backend-health-check
test/api-integration
Do not commit secrets, private user data or unverified production claims.

<div align="center">
🌿 Sahay AI
Clearer information. Better-informed decisions.

🚀 Live Demo · 📚 API Docs · 💻 GitHub

<sub>Built to make business and financial information more accessible.</sub>

</div>
