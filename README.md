
::: {align="center"} # 🌿 SAHAY ### Your AI-Powered Financial & Business Companion **Understand your money. Discover opportunities. Make confident decisions.** An independent, multilingual platform designed to make financial information, government-scheme discovery, application tracking, and small-business insights easier to understand and manage. `<br />`{=html} [![Live App](https://img.shields.io/badge/🚀_Live_App-Open_Sahay-059669?style=for-the-badge)](https://sahay-ai-beige.vercel.app/) [![Backend API](https://img.shields.io/badge/⚙️_Backend-Render-0F766E?style=for-the-badge)](https://sahay-ai-5.onrender.com) [![API Docs](https://img.shields.io/badge/📚_API_Docs-Swagger-4F46E5?style=for-the-badge)](https://sahay-ai-5.onrender.com/docs) `<br />`{=html} **🌐 Live Website:** [sahay-ai-beige.vercel.app](https://sahay-ai-beige.vercel.app/)\ **🔌 Backend API:** [sahay-ai-5.onrender.com](https://sahay-ai-5.onrender.com) · **[Explore API Docs →](https://sahay-ai-5.onrender.com/docs)** :::
✨ At a Glance
🎯 Purpose Make financial and business
information easier to access and
understand

👥 Designed for Individuals, entrepreneurs, and
small-business owners

🌍 Languages English · हिन्दी · বাংলা

🧩 Architecture Next.js frontend + FastAPI
backend + PostgreSQL

🚀 Status Live deployment links available;
individual workflows and
integrations require ongoing
verification

💚 Why Sahay?
Financial decisions can be confusing. Finding relevant scheme
information, understanding eligibility rules, organizing application
documents, and reviewing business finances often requires switching
between multiple tools.

Sahay brings these workflows together in one experience---with an
emphasis on accessibility, clear explanations, and responsible use of
AI.

What Sahay aims to help with
🏛️ Explore scheme information and understand published
requirements.
🧾 Organize applications and keep track of next steps.
📂 Manage document records associated with important workflows.
💼 Understand business finances through summaries and spending
insights.
🤖 Make complex information easier to understand with
AI-assisted explanations.
🌐 Use the platform in a preferred language: English, Hindi, or
Bengali.
🇮🇳 Independence notice: Sahay is an independent project. It is not
an official government website and is not affiliated with, endorsed
by, or operated by any government authority.

🚀 Explore the Platform
::: {align="center"} ----------------------------------------------------------------------- Module What it is designed to do ----------------------------------- ----------------------------------- 🏛️ **Smart Scheme Discovery** Explore scheme information, review published eligibility criteria, and identify documents to verify. 🎯 **Eligibility Evaluation** Evaluate user-provided information against implemented rules and explain the result. 🗂️ **Application Tracker** Organize application progress, checklists, and pending steps. 🔐 **Document Vault** Maintain document records and identify missing items; actual file-storage security depends on deployment configuration. 📊 **Business & Financial Review income, expenses, and Insights** financial trends where the relevant workflows are implemented. 📈 **Stock Learning & Analysis** Provide educational context and structured analysis where available; not a guarantee of investment outcomes. 🛡️ **Admin & Audit Tools** Support restricted administrative workflows and activity visibility where implemented. 💬 **AI Financial Companion** Help explain financial concepts and information using available context and integrations. ----------------------------------------------------------------------- :::
Some capabilities may be in development or depend on configuration and
external integrations. Please verify each workflow in the live app
before relying on it.

🌍 Designed for Multilingual Access
Sahay is designed to support:

Language Locale

🇬🇧 English en
🇮🇳 हिन्दी (Hindi) hi
🇮🇳 বাংলা (Bengali) bn

The project's latest reported localization check passed translation-key
parity across these three locales and validated INR formatting.

🧰 Technology Stack
::: {align="center"} ![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=next.js&logoColor=white) ![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white) ![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white) ![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white) ![Pydantic](https://img.shields.io/badge/Pydantic-E92063?style=flat-square&logo=pydantic&logoColor=white) ![pytest](https://img.shields.io/badge/pytest-0A9EDC?style=flat-square&logo=pytest&logoColor=white) ![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white) ![Render](https://img.shields.io/badge/Render-46E3B7?style=flat-square&logo=render&logoColor=black) :::
Technology Role

Next.js + React Frontend application and routing
TypeScript Typed frontend code
Tailwind CSS Responsive interface styling
Python + FastAPI Backend API and application logic
Pydantic Request and response validation
PostgreSQL Relational data storage
pytest Backend automated tests
Vercel Frontend hosting
Render Backend hosting

Additional AI/RAG, vector-search, Docker, or CI/CD capabilities should
be considered enabled only where confirmed in the current
implementation.

🏗️ How It Fits Together
                 👤 USER
                    │
                    ▼
       ┌─────────────────────────┐
       │       SAHAY FRONTEND    │
       │     Next.js + React     │
       │       TypeScript        │
       │        Vercel           │
       └────────────┬────────────┘
                    │ HTTPS / REST API
                    ▼
       ┌─────────────────────────┐
       │       FASTAPI BACKEND   │
       │ Authentication & APIs   │
       │     Business Logic      │
       │         Render          │
       └────────────┬────────────┘
                    │
                    ▼
       ┌─────────────────────────┐
       │       PostgreSQL        │
       │     Structured Data     │
       └─────────────────────────┘
Core principles

🧮 Use deterministic application logic for financial calculations
and eligibility rules.
📚 Explain information using relevant sources and clearly state
uncertainty.
🔐 Protect private data, credentials, and administrative operations.
🧱 Prefer clear, modular code that is easier to test and maintain.
✅ Treat deployment and feature status as verified only after actual
tests.
🔗 Live Links
Resource Link

🌐 Sahay Frontend Open the live app

⚙️ FastAPI Backend Open backend URL

📚 API Documentation Open Swagger UI

🧑‍💻 GitHub Repository sayantandutta-18/Sahay-AI
The backend root URL may not display a webpage if no root route is
configured. Use the API documentation or the implemented health endpoint
to check the service. A live URL alone does not prove every feature is
working.

💻 Run Sahay Locally
Prerequisites
Node.js and npm
Python version supported by backend dependencies
Access to a configured PostgreSQL database
Git
1. Clone the repository
git clone https://github.com/sayantandutta-18/Sahay-AI.git
cd Sahay-AI
2. Start the frontend
cd frontend
npm install
Create frontend/.env.local using the exact environment variable name
read by the existing API client. Example only:

NEXT_PUBLIC_API_URL=http://localhost:8000
Then run:

npm run dev
Open http://localhost:3000.

3. Start the backend
Open a second terminal at the repository root:

cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
Configure backend/.env using the exact names expected by the current
backend configuration. Example placeholders:

DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE
SECRET_KEY=replace-with-a-secure-random-secret
Only add other variables, such as an LLM provider key, if the current
implementation requires them.

Start the API (assuming the FastAPI application object is app in
app/main.py):

python -m uvicorn app.main:app --reload
Backend API: http://localhost:8000
API docs: http://localhost:8000/docs

4. Verify the database
Confirm the PostgreSQL server or hosted database is reachable.
Verify DATABASE_URL is set correctly in the backend environment.
Apply the project's migrations if migration tooling is configured.
Test the backend health endpoint and database connectivity.
Confirm the frontend API URL and backend CORS origins match your
local setup.
Important: Installing VS Code does not install or run PostgreSQL.
You can use a hosted PostgreSQL service instead of installing
PostgreSQL locally, provided the backend has the correct connection
details and network access.

🔐 Environment Variables & Secrets
Environment variable names must match the actual application code. The
following are examples, not a guarantee of the names your repository
expects.

Location Example Notes

frontend/.env.local NEXT_PUBLIC_API_URL Set to the local API
URL for development if
this is the variable
your API client reads.

Backend environment DATABASE_URL PostgreSQL connection
string; keep the
password secret.

Backend environment SECRET_KEY Use a strong, unique
production secret.

Backend environment AI provider key Only if required by an
enabled AI integration.

Never commit .env files, database credentials, secret keys, access
tokens, or real user data to GitHub. Configure production variables
through the hosting provider's environment-variable settings.

🧪 Quality Checks
Run checks from the project root unless stated otherwise.

Backend tests
backend\.venv\Scripts\python.exe -m pytest backend\tests -q
Localization checks
node frontend\scripts\test-i18n.mjs
Frontend production build
cd frontend
npm run build
Latest reported checks
✅ Backend tests: 59 passed in the latest reported run.
✅ Localization: 100% translation-key parity across English,
Hindi, and Bengali.
✅ INR formatting checks: Passed.
⏳ Production build and end-to-end live integration: Require
confirmation from the latest run.
These results describe previously reported checks, not a guarantee of
current production health.

🗺️ Roadmap
🧱 Reliability & Core Experience
Verify production API and database health end-to-end.
Complete frontend/backend integration tests.
Improve error states and retry behavior.
Confirm authentication and authorization on protected endpoints.
Verify production build and deployment configuration.
🏛️ Scheme & Application Workflows
Validate scheme information against official sources.
Refine eligibility explanations and rule coverage.
Improve application checklists and status tracking.
Review document access controls and retention.
Strengthen administrative permissions and audit coverage.
💰 Financial Intelligence
Expand income and expense insights.
Add financial health and emergency-fund analysis.
Develop income-loss and what-if simulations.
Improve explainable financial risk indicators.
Expand grounded conversational assistance.
Evaluate fraud signals and false-positive behavior.
🚀 Production Readiness
Complete security and privacy reviews.
Add monitoring and error reporting.
Validate backups and recovery procedures.
Expand automated and end-to-end testing.
Document deployment and incident-response processes.
Roadmap items should be marked complete only after implementation and
verification.

🔒 Security & Responsible Use
Keep authentication and authorization enforced server-side.
Validate incoming data and return safe error messages.
Restrict administrative features to authorized users.
Protect document records and sensitive financial information.
Do not expose secrets through frontend code or logs.
Verify scheme requirements using official sources.
Treat AI-generated answers as assistance, not guaranteed truth.
Treat financial simulations as estimates based on their assumptions.
Treat fraud indicators as signals for review, not proof of
wrongdoing.
🤝 Contributing
Contributions, feedback, and ideas are welcome.

Fork the repository.
Create a focused feature branch.
Implement the change and add appropriate tests.
Run relevant backend, frontend, and localization checks.
Submit a pull request explaining the change.
Example branch names:

feature/application-tracker
feature/financial-insights
fix/backend-health-check
test/api-integration
Please never include private credentials or real personal data in
commits.

⚠️ Disclaimer
Sahay is an independent software project intended to support financial
understanding and information management.

It is not affiliated with or endorsed by any government authority.
Scheme details and eligibility requirements must be checked against
official sources.
AI-generated content may contain errors.
Financial scenarios are estimates, not guarantees.
Investment-related information does not guarantee returns.
Fraud indicators do not prove that a person or transaction is
fraudulent.
Seek qualified professional advice for consequential financial,
legal, or investment decisions.
📄 License
No license has been specified in this README. Add a LICENSE file once
the project license has been selected.

::: {align="center"} ### 🌿 Sahay --- Make Financial Knowledge More Accessible **Understand better. Plan smarter. Move forward with confidence.** [🚀 Visit Sahay](https://sahay-ai-beige.vercel.app/) · [📚 API Docs](https://sahay-ai-5.onrender.com/docs) · [💻 GitHub Repository](https://github.com/sayantandutta-18/Sahay-AI) `<sub>`{=html}Built with care for clearer financial and business decisions.`</sub>`{=html} :::
⋮⋮⋮⋮
