
<div align="center">
<<<<<<< HEAD
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
=======
🌟 SAHAY AI
Your AI-Powered Financial & Business Companion
Understand your money. Discover opportunities. Make more informed decisions.

A multilingual platform designed to help Indian micro-entrepreneurs and small-business owners explore scheme information, organize applications, understand business finances, and access practical AI-assisted guidance.

<p> <a href="https://sahay-ai-beige.vercel.app/"><strong>🌐 Live Demo</strong></a> &nbsp; · &nbsp; <a href="https://sahay-ai-5.onrender.com/"><strong>⚡ Backend API</strong></a> &nbsp; · &nbsp; <a href="https://sahay-ai-5.onrender.com/docs"><strong>📚 API Documentation</strong></a> &nbsp; · &nbsp; <a href="https://github.com/sayantandutta-18/Sahay-AI"><strong>💻 Source Code</strong></a> </p> <p> <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" /> <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" /> <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /> <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" /> <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" /> <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" /> </p> </div>
📑 Table of Contents
✨ Overview
🎯 Mission & Vision
🖥️ Live Demo
📸 Product Screenshots
💎 Features & Modules
🌐 Multilingual Experience
🧠 AI Principles
🏗️ System Architecture
🛠️ Technology Stack
📁 Repository Structure
🚀 Run Locally
🔐 Environment Configuration
🧪 Testing & Quality
🗺️ Roadmap
📚 Resources
🤝 Contributing
⚠️ Disclaimer & Security
📄 License
✨ Overview
Sahay AI is an independent software project focused on making business and financial information easier to find, understand, and organize.

Small-business owners may need to navigate scheme eligibility rules, application requirements, document checklists, everyday financial information, and unfamiliar financial concepts. Sahay brings these workflows together in one interface, with multilingual access and AI-assisted explanations.

👥 Who is it for?
🧑‍💼 Micro-entrepreneurs and small-business owners
🧾 People organizing scheme applications and document requirements
💰 Users who want clearer views of income, expenses, and financial scenarios
🌱 People looking for accessible financial and business education
🇮🇳 Important: Sahay is an independent project. It is not an official government website and is not affiliated with, endorsed by, or operated by any government authority.

🎯 Mission & Vision
Our mission is to make financial and business information more accessible, understandable, and actionable.

Our vision is to build a trustworthy digital companion that helps people move from scattered information to clearer next steps.

Design goals
Make complex information easier to navigate.
Explain eligibility and financial concepts in plain language.
Help users organize applications and document requirements.
Support English, Hindi, and Bengali experiences.
Make limitations, assumptions, and uncertainty visible.
🖥️ Live Demo
Explore the deployed project:

Resource	Link	Purpose
🌐 Live Frontend	Open Sahay AI	Explore the web interface
⚡ Backend API	Open Backend	Access the deployed API service
📚 Swagger API Docs	Explore API Documentation	Inspect available endpoints
💻 GitHub Repository	View Source Code	Browse the codebase
Deployment note: A live URL does not guarantee every feature or integration is available at all times. Check the application’s health panel and API documentation for the current service state.

📸 Product Screenshots
🏠 Homepage — Sahay AI
The homepage introduces Sahay, provides language selection and onboarding actions, and displays the backend connection and database health panel.

Sahay AI homepage demo

<sub>Screenshot path: docs/images/sahay-homepage.png</sub>

📊 Dashboard
Add a separate screenshot of the actual dashboard here.

Sahay AI dashboard demo

<sub>Screenshot path: docs/images/sahay-dashboard.png</sub>

Screenshot setup: Save the homepage image as docs/images/sahay-homepage.png and a real dashboard screenshot as docs/images/sahay-dashboard.png. Create the docs/images/ directory if it does not exist. GitHub will render these images when the files are committed to the repository.

💎 Features & Modules
The following describes the product’s feature areas. Availability depends on the current implementation and configured integrations.

<details> <summary><strong>🏛️ 1. Scheme Discovery</strong></summary>
Explore available government-scheme information.
Review published eligibility criteria.
Understand potentially required documents.
Use AI-assisted explanations to make requirements easier to understand.
Verify important details with the relevant official source.
Eligibility guidance is informational and does not guarantee approval or benefits.

</details> <details> <summary><strong>🎯 2. Eligibility Evaluation</strong></summary>
Organize user-provided details against known criteria.
Present understandable eligibility outcomes.
Keep rule-based checks separate from AI-generated explanations.
Make missing information and uncertainty clear.
Results depend on the accuracy and completeness of the configured rules and user inputs.

</details> <details> <summary><strong>📌 3. Application Tracking</strong></summary>
Organize application records.
Track progress and pending steps.
Maintain checklists for application tasks.
Keep related information together.</details>
<details> <summary><strong>🔐 4. Document Vault & Readiness</strong></summary>
Organize document records and metadata.
Associate documents with relevant workflows.
Identify potentially missing documents.
Support document-readiness checklists.
Actual file storage, retention, and access controls depend on the deployed configuration. Do not upload sensitive documents unless the deployed service’s security and storage behavior has been verified.

</details> <details> <summary><strong>💼 5. Business & Financial Insights</strong></summary>
Review income and expense information.
Explore spending patterns and financial summaries.
Identify possible savings opportunities.
Use structured calculations to support financial understanding.</details>
<details> <summary><strong>📈 6. Stock Learning & Analysis</strong></summary>
Support financial and stock-market education.
Explore available analysis and watchlist-style workflows.
Help users understand concepts and hypothetical scenarios.
This module is educational and should not be treated as a guarantee of returns or personalized regulated investment advice.

</details> <details> <summary><strong>🤖 7. AI-Assisted Companion</strong></summary>
Explain complex information in simpler language.
Help users navigate available product workflows.
Provide context-aware explanations where relevant data is available.
Communicate assumptions and uncertainty rather than inventing facts.</details>
<details> <summary><strong>🛡️ 8. Admin, Audit & System Health</strong></summary>
Provide administrative workflows where implemented.
Support visibility into relevant activity and audit information.
Display backend connection and health information.
Help diagnose API connectivity problems.
Administrative functions must be protected by appropriate server-side authorization.

</details>
🌐 Multilingual Experience
Sahay is designed for three language options:

Language	Locale
🇬🇧 English	en
🇮🇳 हिन्दी (Hindi)	hi
🇮🇳 বাংলা (Bengali)	bn
Localization goals include consistent language switching, translation-key parity, understandable interface wording, and Indian Rupee (INR) formatting.

The project previously reported successful translation-key parity and INR-formatting checks. Re-run the checks after code changes to confirm the current state.

🧠 AI Principles
Sahay’s AI direction follows a simple principle: use AI to explain information, not to manufacture facts.

📚 Grounded information: Important scheme details should be checked against relevant official sources.
🧮 Deterministic calculations: Financial arithmetic and rule-based eligibility should run in validated application logic.
💬 Clear explanations: AI can explain calculated results in accessible language.
⚖️ Visible uncertainty: Missing data, assumptions, and limitations should be communicated.
🔒 Privacy by design: Sensitive user data should only be processed and stored with appropriate safeguards.
🚫 No guaranteed outcomes: The system must not promise scheme approval, investment returns, or guaranteed financial results.
🏗️ System Architecture
Sahay uses a frontend/backend architecture. The frontend communicates with the backend through HTTP API requests; the backend handles request validation, application logic, authentication, and database access.

                         👤 USER
                            │
                            ▼
              ┌─────────────────────────┐
              │       FRONTEND          │
              │ Next.js + React         │
              │ TypeScript + Tailwind   │
              └────────────┬────────────┘
                           │
                       HTTP API
                           │
                           ▼
              ┌─────────────────────────┐
              │        BACKEND          │
              │ Python + FastAPI        │
              ├─────────────────────────┤
              │ Authentication          │
              │ API routes & validation │
              │ Scheme / eligibility    │
              │ Application workflows   │
              │ Financial features      │
              │ AI-assisted services    │
              └────────────┬────────────┘
                           │
                           ▼
              ┌─────────────────────────┐
              │       DATABASE          │
              │ Configured data store   │
              └─────────────────────────┘
Architecture principles
🧩 Modular design: Keep routes, schemas, models, and services organized by responsibility.
🔐 Server-side security: Validate requests and enforce authorization on the backend.
🧮 Reliable calculations: Keep deterministic business rules separate from generated text.
🧪 Testable components: Add tests for core logic, API behavior, and error cases.
🌱 Incremental growth: Add new integrations only when they can be configured, tested, and maintained safely.
Database note: Configure the database through the project’s actual settings and deployment environment. Do not assume the production database type solely from the technology list or a screenshot.

🛠️ Technology Stack
Layer	Technology	Responsibility
Frontend framework	Next.js	Application pages, routing, and rendering
UI library	React	Reusable, component-based interface
Language	TypeScript	Type-safe frontend development
Styling	Tailwind CSS	Responsive UI styling
Backend language	Python	API and application logic
API framework	FastAPI	HTTP endpoints and dependency handling
Validation	Pydantic	Request and response data validation
Database	Configured database	Persistent application data
Testing	pytest	Backend automated tests
Localization	Project i18n utilities	English, Hindi, and Bengali support
Frontend hosting	Vercel	Deployed web interface
Backend hosting	Render	Deployed API service
Version control	Git & GitHub	Source history and collaboration
Other tools such as PostgreSQL, pgvector, hosted LLMs, RAG, Docker, and CI/CD should be listed as active components only when they are present and configured in the current codebase.

📁 Repository Structure
The tree below reflects the repository’s main frontend/backend organization. Some nested files may differ; check the actual repository before assuming every optional directory exists.

Sahay-AI/
│
├── frontend/                       # Next.js web application
│   ├── public/                     # Static assets and images
│   ├── scripts/                    # Validation and helper scripts
│   ├── src/
│   │   ├── app/                    # Routes, pages and layouts
│   │   ├── components/             # Reusable UI components
│   │   │   └── ui/                 # Shared UI elements
│   │   ├── lib/                    # API client, i18n and utilities
│   │   └── types/                  # TypeScript types
│   ├── package.json                # Frontend dependencies/scripts
│   └── .gitignore                  # Frontend ignore rules
│
├── backend/                        # Python FastAPI service
│   ├── app/
│   │   ├── core/                   # Settings, security and utilities
│   │   ├── database/               # Database session/configuration
│   │   ├── models/                 # Database models
│   │   ├── routes/                 # API route handlers
│   │   ├── schemas/                # Request/response schemas
│   │   ├── services/               # Application/business logic
│   │   └── main.py                 # FastAPI application entry point
│   ├── tests/                      # Backend automated tests
│   ├── requirements.txt            # Python dependencies
│   └── .env                        # Local secrets (never commit)
│
├── docs/
│   └── images/
│       ├── sahay-homepage.png      # Homepage demo screenshot
│       └── sahay-dashboard.png     # Dashboard screenshot
│
├── .env.example                    # Safe configuration template
├── .gitignore                      # Root ignore rules
├── docker-compose.yml              # Local services, if configured
├── render.yaml                     # Render deployment config, if used
└── README.md                       # Project documentation
📂 Folder responsibilities
frontend/src/app/ — page routes and layouts.
frontend/src/components/ — reusable interface components.
frontend/src/lib/ — API client, localization, and shared utilities.
frontend/src/types/ — shared TypeScript definitions.
backend/app/routes/ — HTTP endpoint definitions.
backend/app/schemas/ — input/output validation models.
backend/app/models/ — database model definitions.
backend/app/services/ — reusable business logic.
backend/app/database/ — database connection and session management.
backend/app/core/ — configuration and security utilities.
backend/tests/ — automated tests.
docs/images/ — screenshots used by this README.
Keep the folder tree synchronized with the actual repository as modules are added or renamed. Never commit .env, credentials, database secrets, or private user data.

🚀 Run Locally
Prerequisites
Install:

Node.js and npm
Python compatible with backend dependencies
Git
A configured database required by the backend
1. Clone the repository
git clone https://github.com/sayantandutta-18/Sahay-AI.git
cd Sahay-AI
2. Start the backend
Open a terminal at the repository root:
>>>>>>> e0683a6 (docs: improve Sahay AI README)

cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
<<<<<<< HEAD
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
=======
Configure the backend environment variables and database before starting the service.

If app/main.py exposes a FastAPI object named app, start it with:

python -m uvicorn app.main:app --reload
The local API is typically available at http://localhost:8000; confirm the configured port and health endpoint in the code.

3. Start the frontend
Open a second terminal at the repository root:

cd frontend
npm install
Create frontend/.env.local using the variable name expected by the current frontend code. For example:

NEXT_PUBLIC_API_URL=http://localhost:8000
Then start Next.js:
>>>>>>> e0683a6 (docs: improve Sahay AI README)

npm run dev
Open http://localhost:3000.

<<<<<<< HEAD
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

=======
If your code uses a different API environment variable or URL prefix, follow the implementation in frontend/src/lib/api.ts rather than copying the example blindly.

🔐 Environment Configuration
Environment variable names vary by implementation. Use .env.example, the backend settings module, and the frontend API client as the source of truth.

Illustrative examples:

Frontend — frontend/.env.local

NEXT_PUBLIC_API_URL=http://localhost:8000
Backend — backend/.env

DATABASE_URL=replace-with-your-database-connection-string
SECRET_KEY=replace-with-a-long-random-secret
Add any AI-provider key only if the current backend uses that provider.

Security checklist
Never commit real .env files, passwords, API keys, JWT secrets, or access tokens.
Keep backend secrets on the server; never expose them through NEXT_PUBLIC_* variables.
Configure production environment variables in the hosting provider’s dashboard.
Restrict CORS to the required frontend origins.
Use server-side authorization for private and administrative routes.
Verify database persistence, backups, and access permissions before production use.
🧪 Testing & Quality
Run checks from the repository root unless otherwise noted.

>>>>>>> e0683a6 (docs: improve Sahay AI README)
Backend tests
backend\.venv\Scripts\python.exe -m pytest backend\tests -q
Localization checks
node frontend\scripts\test-i18n.mjs
<<<<<<< HEAD
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
=======
Or from the frontend directory:

cd frontend
npm run test:i18n
Frontend production build
cd frontend
npm run build
Before a release
Backend tests pass.
Frontend production build succeeds.
Translation parity and INR formatting checks pass.
Frontend can reach the deployed API.
Database health and persistence are verified.
Authentication and protected endpoints are tested.
Loading, empty, failure, and retry states behave correctly.
No secrets or private data are included in the repository.
Previously reported test results are historical and should not be treated as confirmation that the current commit or production deployment is healthy.

🗺️ Roadmap
The following are development directions, not claims that every item is already production-ready.

Verify live frontend/backend/database integration end to end.
Improve API error handling and service-health reporting.
Validate scheme information against official sources.
Strengthen eligibility rule coverage and explainability.
Improve application progress and document-readiness workflows.
Expand financial summaries and scenario analysis.
Improve grounded AI responses and communicate uncertainty.
Review authorization, privacy, logging, and document security.
Expand automated tests and deployment monitoring.
Improve English, Hindi, and Bengali localization quality.
📚 Resources
🌐 Live Sahay AI application
⚡ Backend API
📘 FastAPI Swagger documentation
💻 Sahay AI GitHub repository
▲ Next.js documentation
⚛️ React documentation
🐍 Python documentation
⚡ FastAPI documentation
🧪 pytest documentation
For government scheme information, always consult the relevant official government portal or department.

🤝 Contributing
Ideas, bug reports, and improvements are welcome.

Fork the repository.
Create a focused branch.
Make your changes and add relevant tests.
Run the applicable checks.
Open a pull request describing the change and its impact.
>>>>>>> e0683a6 (docs: improve Sahay AI README)
Example branch names:

feature/application-tracker
feature/financial-insights
<<<<<<< HEAD
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

=======
fix/api-health-check
fix/localization
test/authentication
Please avoid unrelated changes in a pull request and never include credentials or private user data.

⚠️ Disclaimer & Security
Sahay AI is an independent informational and software project.

It is not an official government platform.
Scheme information and eligibility must be verified against official sources.
AI-generated explanations can be incomplete or incorrect.
Financial calculations and simulations depend on their inputs and assumptions.
Investment-related information does not guarantee returns.
Fraud indicators are signals for review, not proof of wrongdoing.
Do not use the application as a substitute for qualified professional advice in consequential financial, legal, or investment matters.
Use the application with care and avoid entering sensitive information unless the deployed service’s data handling and security controls have been reviewed.

📄 License
No license is declared here. Add a LICENSE file and update this section after choosing the license for the project.

<div align="center">
🌱 Sahay AI — Clearer Information. Smarter Decisions.
Built to make business and financial knowledge more accessible.

🌐 Live Demo · 💻 GitHub · 📚 API Docs

>>>>>>> e0683a6 (docs: improve Sahay AI README)
</div>
