
<div align="center">
🌿 SAHAY AI
Your AI-Powered Financial & Business Companion
Democratizing Capital, Schemes & Knowledge for Small Business

A multilingual platform designed to help Indian micro-entrepreneurs explore scheme information, understand eligibility workflows, organize applications, and improve their business and financial understanding.





🌐 Live App  ·  ⚙️ Backend API  ·  📚 API Docs  ·  💻 Source Code

</div>
📸 Homepage & Dashboard Demo
<table> <tr> <td align="center" width="100%"> <strong>🏠 Homepage — Live Interface</strong><br><br> <a href="https://sahay-ai-beige.vercel.app/"> <img src="docs/images/sahay-homepage.png" alt="Sahay AI homepage with language selector, onboarding actions and system health panel" width="100%"> </a><br> <sub>Homepage, language selector, onboarding actions, and backend/database health panel.</sub> </td> </tr> <tr> <td align="center" width="100%"> <strong>📊 Dashboard Demo</strong><br><br> <img src="docs/images/sahay-dashboard.png" alt="Sahay AI dashboard demo screenshot" width="100%"><br> <sub>Dashboard demo image supplied by the project owner. Replace this image with a dedicated dashboard screenshot when available.</sub> </td> </tr> </table>
Screenshot context: The supplied image displays a connected backend and database, 413 ms latency, and a SQLite WAL (21 tables) label. These values describe the captured screenshot only; they do not guarantee current uptime or confirm the current production database configuration.

🧭 Table of Contents
1. Project Overview
2. Mission and Vision
3. Core Principles
4. Live Demo and Resources
5. Features and Modules
6. Multilingual Experience
7. System Architecture
8. Technology Stack
9. Repository Structure
10. How the Platform Works
11. Run Locally
12. Environment Configuration
13. Testing and Quality
14. Roadmap
15. Security and Responsible AI
16. Contributing
17. Disclaimer
✨ 1. Project Overview
Sahay AI is an independent software project focused on making business and financial information easier to discover, understand, and organize.

Micro-entrepreneurs and small-business owners may need to find scheme information, understand eligibility criteria, prepare documents, track applications, and make sense of business finances. Sahay aims to bring these workflows into one approachable experience with multilingual support.

The problem
Scheme and financial information can be spread across different sources.
Eligibility requirements may be difficult to interpret.
Application steps and document requirements can be hard to organize.
Users may need clear explanations in a language they understand.
The Sahay approach
Sahay combines information discovery, eligibility workflows, application organization, business-oriented tools, and AI-assisted explanations. Feature availability depends on the current implementation and deployed integrations.

Project detail	Description
Project name	Sahay AI
Focus	Micro-enterprise support, scheme discovery, and financial understanding
Intended audience	Indian micro-entrepreneurs and small-business owners
Languages	English, Hindi, and Bengali
Frontend hosting	Vercel
Backend hosting	Render
Backend framework	FastAPI
Source code	GitHub repository
🎯 2. Mission and Vision
🌱 Mission	🔭 Vision
Make business and financial information easier to access, understand, and act on.	Build a trustworthy multilingual companion that helps users move from confusing information to clearer next steps.
Product goals
Make complex information easier to navigate.
Explain eligibility outcomes in understandable language.
Help users organize application steps and document requirements.
Improve access through multilingual support.
Encourage informed decisions through transparent information and calculations.
🧩 3. Core Principles
Principle	How it guides the project
✅ Accuracy first	Ground important scheme and financial information in reliable sources and communicate uncertainty.
🧮 Deterministic calculations	Use explicit, testable rules for eligibility and financial calculations. AI may explain a result but must not invent or override it.
📚 Source-aware AI	Use available evidence and encourage official verification for consequential information.
🌍 Accessibility and inclusion	Keep the interface readable, responsive, and usable across supported languages.
🔐 Privacy and least privilege	Protect private information with authentication, authorization, and access checks.
🧱 Modular engineering	Give routes, schemas, services, models, and UI components clear responsibilities.
🩺 Honest system status	Reflect actual health checks and never disguise errors as successful connections.
🤝 Human in control	Support decisions without guaranteeing approvals, returns, or outcomes.
🚀 4. Live Demo and Resources
Resource	Link	Purpose
🌐 Live frontend	Open Sahay AI	Explore the deployed interface
⚙️ Backend API	Open backend	Access the deployed API base
📚 API documentation	Swagger UI	Explore available endpoints
💻 Source code	GitHub repository	Browse code and history
A reachable URL does not guarantee that every feature or integration is currently healthy. Check the live application for current status.

💎 5. Features and Modules
The modules below describe the product areas and their intended purpose. Treat a feature as production-ready only after its implementation and live behavior have been verified.

🏛️ Scheme Discovery
Explore scheme-related information.
Review important conditions and requirements.
Identify details that must be verified against official sources.
🎯 Eligibility Evaluation
Collect relevant user-provided information.
Compare inputs with implemented eligibility rules.
Explain outcomes and missing information.
Do not present an informational result as official approval.
🗂️ Application Tracker
Organize application progress.
Track checklists and pending steps where supported.
Make next actions easier to review.
🔐 Document Vault and Readiness
Organize document records and requirements.
Identify missing items where implemented.
Protect private documents with appropriate access controls.
💼 Business and Financial Insights
Support income and expense review where implemented.
Present understandable summaries and trends.
Make calculation assumptions clear.
📈 Stock Learning and Analysis
Support financial learning and structured analysis where available.
Distinguish educational content from personalized investment advice.
Never imply guaranteed returns.
🤖 AI-Assisted Companion
Explain complex information in simpler language.
Help users navigate available platform information.
Communicate uncertainty rather than fabricate facts.
🛡️ Admin and Audit Workflows
Support restricted administrative operations where implemented.
Protect privileged routes and data.
Maintain activity records where configured.
🩺 System Health and API Connection
Show backend and database connectivity when checks are available.
Help identify API, CORS, configuration, and database problems.
Report failures honestly.
🌍 6. Multilingual Experience
Language	Locale	Experience
🇬🇧 English	en	English interface
🇮🇳 हिन्दी	hi	Hindi interface
🇮🇳 বাংলা	bn	Bengali interface
Localization goals include consistent language switching, translation-key parity, appropriate Indian Rupee (INR) formatting, and clear wording.

A previous development run reported successful translation-key parity across en, hi, and bn, along with INR formatting checks. Re-run these checks after changes.

🏗️ 7. System Architecture
Sahay uses a frontend/backend architecture. The frontend communicates with the API over HTTP(S), while the backend handles application logic and database access.

Layer	Deployment	Responsibility
Frontend	Vercel	User interface
Backend	Render	API endpoints and application logic
Database	Determined by backend configuration	Persistent application data
Database note: The supplied screenshot displays SQLite WAL (21 tables). Confirm the current backend configuration and production environment before documenting PostgreSQL or another database as the active production database.

🛠️ 8. Technology Stack
Layer	Technology	Role
Frontend framework	Next.js	Application framework and routing
UI library	React	Component-based interface
Language	TypeScript	Typed frontend code
Styling	Tailwind CSS	Responsive interface styling
Backend	Python + FastAPI	API endpoints and application logic
Validation	Pydantic	Request and response validation
Testing	pytest	Backend automated tests
Frontend hosting	Vercel	Frontend deployment
Backend hosting	Render	API deployment
API explorer	Swagger UI	Interactive API documentation
Only document additional AI providers, vector databases, payment services, or external integrations as active when they are present and configured in the current codebase.

📂 9. Repository Structure
This is a logical guide to the main areas of the repository. Confirm exact filenames against the current code before treating it as a complete file inventory.

Sahay-AI/
├── frontend/
│   ├── src/
│   │   ├── app/                  # Pages, routes and layouts
│   │   ├── components/
│   │   │   └── ui/               # Reusable UI elements
│   │   ├── lib/                  # API client, i18n and utilities
│   │   └── types/                # TypeScript types
│   ├── scripts/                  # Checks and helper scripts
│   ├── public/                   # Static assets
│   └── package.json              # Frontend dependencies/scripts
├── backend/
│   ├── app/
│   │   ├── main.py               # FastAPI entry point
│   │   ├── routes/               # API endpoints
│   │   ├── schemas/              # Request/response schemas
│   │   ├── models/               # Database models
│   │   ├── services/             # Business logic
│   │   ├── database/             # Database session and setup
│   │   └── core/                 # Settings and security utilities
│   ├── tests/                    # Backend tests
│   └── requirements.txt          # Python dependencies
├── docs/
│   └── images/
│       ├── sahay-homepage.png    # Homepage/system-health screenshot
│       └── sahay-dashboard.png   # Dashboard demo image
├── .env.example                  # Example variables, if maintained
├── .gitignore
├── render.yaml                   # Render config, if maintained
└── README.md
Folder responsibilities
routes/ — endpoint definitions and HTTP behavior.
schemas/ — input/output validation.
models/ — database entity definitions.
services/ — reusable business logic.
database/ — database connectivity and session setup.
core/ — shared configuration and security utilities.
components/ — reusable frontend UI.
lib/ — frontend API client, localization, and shared helpers.
tests/ — automated checks for expected behavior.
🔄 10. How the Platform Works
User action: A user opens a page or submits a form.
API request: The frontend sends a request to the configured backend URL.
Validation: FastAPI validates the request and executes the relevant route/service logic.
Data access: Database-dependent operations access the configured database.
API response: The backend returns a structured response.
User feedback: The frontend displays the result or a meaningful error state.
💻 11. Run Locally
Prerequisites
Git
Node.js and npm
A Python version supported by backend/requirements.txt
A database reachable by the backend
Environment variables required by the current codebase
Step 1 — Clone the repository
git clone https://github.com/sayantandutta-18/Sahay-AI.git
cd Sahay-AI
Step 2 — Set up the backend
Run in PowerShell from the repository root:

cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Configure the backend environment variables expected by the settings code. If app/main.py exports a FastAPI instance named app, start it with:

python -m uvicorn app.main:app --reload
API base: http://localhost:8000
Swagger UI: http://localhost:8000/docs
Step 3 — Set up the frontend
Open a second terminal from the repository root:

cd frontend
npm install
Create frontend/.env.local using the exact API variable read by frontend/src/lib/api.ts. For example, if the client reads NEXT_PUBLIC_API_URL:

NEXT_PUBLIC_API_URL=http://localhost:8000
Start the frontend:

npm run dev
Open http://localhost:3000.

Step 4 — Verify the connection
Confirm the backend starts without import or configuration errors.
Confirm the frontend uses the correct API base URL.
Confirm backend CORS permits the local frontend origin.
Confirm the configured database is reachable.
Test the health endpoint and a database-dependent API route.
VS Code is an editor, not a database server. A local PostgreSQL installation is not required if the backend is intentionally configured to use a reachable hosted database. The database engine and connection URL must match the actual backend setup.

🔐 12. Environment Configuration
Variable names must match the current code. The examples below are illustrative; configure only variables used by the application.

Frontend — frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
For production, if that is the variable used by the current API client:

NEXT_PUBLIC_API_URL=https://sahay-ai-5.onrender.com
Backend — backend/.env
DATABASE_URL=your-database-connection-string
SECRET_KEY=replace-with-a-strong-random-secret
Secret-handling rules
Never commit .env files, passwords, API keys, JWT secrets, or access tokens.
Configure production variables through the hosting provider's environment settings.
Never expose backend secrets through NEXT_PUBLIC_* variables.
Use separate development and production credentials.
Do not commit real user documents or private financial data.
🧪 13. Testing and Quality
Run commands from the repository root unless noted otherwise.

Backend tests
backend\.venv\Scripts\python.exe -m pytest backend\tests -q
Localization checks
node frontend\scripts\test-i18n.mjs
Production frontend build
cd frontend
npm run build
Previously reported development results
Check	Previously reported result
Backend automated tests	59 passed in a previous run
Translation-key parity (en, hi, bn)	Passed in a previous run
INR formatting	Passed in a previous run
Current production build	Re-run to confirm
Live API/backend/database integration	Verify against the current deployment
Historical results do not guarantee that the latest code or production deployment is healthy.

🗺️ 14. Roadmap
Phase 1 — Reliability and core experience
Verify live API and database health end-to-end.
Test key frontend/backend user journeys.
Improve error, timeout, loading, empty, and retry states.
Verify authorization on protected endpoints.
Confirm production build and deployment configuration.
Phase 2 — Scheme and application workflows
Verify scheme details against official sources.
Expand and test eligibility-rule coverage.
Improve application checklists and progress tracking.
Review document access controls and retention.
Strengthen administrative permissions and audit coverage.
Phase 3 — Business and financial intelligence
Expand transparent income and expense summaries.
Develop explainable what-if simulations.
Improve grounded AI assistance.
Evaluate fraud indicators and false-positive behavior.
Phase 4 — Production readiness
Complete security and privacy reviews.
Add monitoring and error reporting.
Validate backups and recovery procedures.
Expand automated and end-to-end tests.
Document deployment and incident-response processes.
🛡️ 15. Security and Responsible AI
🔐 Enforce authentication and authorization on the server.
🧾 Validate incoming data and return safe error messages.
🛡️ Restrict admin operations to authorized users.
📂 Apply access checks to private documents and user-owned records.
🔑 Keep secrets out of source control, browser bundles, and logs.
🏛️ Verify scheme requirements against official sources.
🤖 Treat AI output as assistance, not guaranteed truth.
🧮 Explain assumptions behind financial calculations.
🚨 Treat fraud signals as reasons to review, not proof of wrongdoing.
🧪 Test failure cases as well as successful requests.
🤝 16. Contributing
Suggestions, bug reports, and contributions are welcome.

Fork the repository.
Create a focused feature or fix branch.
Implement your change with clear, maintainable code.
Add or update relevant tests.
Run the applicable quality checks.
Open a pull request describing the change and checks performed.
Example branch names:

feature/application-tracker
feature/financial-insights
fix/backend-health-check
test/api-integration
Please do not commit credentials, private user data, or unverified claims about production behavior.

⚠️ 17. Disclaimer
Sahay AI is an independent software project intended to support information discovery, organization, and financial understanding.

It is not affiliated with or endorsed by any government authority.
Scheme details, deadlines, and eligibility criteria must be verified through official sources.
AI-generated content may contain errors or omissions.
Eligibility evaluations are informational and do not guarantee government approval.
Financial simulations are estimates, not guarantees.
Investment-related information does not guarantee returns.
Fraud indicators do not prove that a person, account, or transaction is fraudulent.
Seek qualified professional advice for consequential financial, legal, or investment decisions.
<div align="center">
🌿 Sahay AI
Clearer information. Better-informed decisions.

🚀 Live Demo · 📚 API Docs · 💻 GitHub

<sub>Built to make business and financial information more accessible.</sub>

</div>
