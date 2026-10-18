
<div align="center">
🌿 SAHAY AI
Your AI-Powered Financial & Business Companion
Understand your options. Find useful information. Make informed decisions.





</div>
📌 About Sahay AI
Sahay AI is an AI-powered platform designed to make useful financial, business, and government-scheme information easier to explore. It aims to help users understand eligibility requirements, organize application-related tasks, and access information in a more approachable way.

Our goal: Make complex information easier to understand and more accessible to more people.

🌐 Project Links
Resource	Link
Live Application	Open Sahay AI
Backend API	Open API
API Documentation	Swagger UI
Source Code	GitHub Repository
✨ Features Explained
🏛️ 1. Government Scheme Discovery
Scheme information: Explore information about government schemes.
Eligibility guidance: Understand eligibility criteria and requirements.
Document requirements: Review documents that may be needed for an application.
Simplified explanations: Make complicated information easier to understand.
Official verification: Check important details with official sources before applying.
🤖 2. AI-Powered Assistance
Natural-language questions: Ask questions using everyday language.
Clear explanations: Get help understanding complex or unfamiliar topics.
Context-aware guidance: Receive assistance based on the information available to the application.
Decision support: Explore options before making a decision.
Information discovery: Reduce the effort needed to find and understand information.
🌍 3. Multilingual Experience
English: Use the application in English.
Hindi: Access supported content in Hindi.
Bengali: Access supported content in Bengali.
Improved accessibility: Use a language that feels comfortable.
Inclusive design: Help make the platform approachable for more users.
📋 4. Application Tracking
Application organization: Keep application-related information organized.
Progress review: Review progress where the feature is implemented.
Pending actions: Identify steps that still need attention.
Task checklists: Track actions and required documents.
Better organization: Reduce the chance of overlooking important steps.
📄 5. Document Management
Document organization: Keep track of application-related documents.
Requirement checklist: Review which documents may be required.
Readiness review: Check whether the necessary documents are prepared.
Application preparation: Prepare documents before beginning an application.
Workflow support: Keep document-related tasks in one organized workflow.
💰 6. Financial & Business Information
Financial concepts: Explore explanations of general financial topics.
Business information: Find information relevant to business-related questions.
Opportunity discovery: Investigate potentially relevant schemes and opportunities.
Simple explanations: Understand unfamiliar terminology more easily.
Informed decisions: Use informational guidance to support, not replace, your own judgement.
📊 7. Dashboard & User Experience
Central dashboard: Access available application features from a central interface.
Structured information: View supported information in an organized layout.
Navigation: Move between the available sections of the application.
Responsive layout: Use the interface across supported screen sizes.
Usability: Find important information and actions more easily.
🔌 8. Backend API Integration
REST API: Connect the frontend and backend through HTTP requests.
FastAPI backend: Handle supported API endpoints using FastAPI.
Data validation: Use Pydantic validation where configured.
Error handling: Handle unsuccessful requests and API errors.
Interactive documentation: Inspect available endpoints through Swagger UI.
🩺 9. Health & Connectivity
Backend connectivity: Check whether the frontend can communicate with the backend.
Health information: View health status if the relevant endpoint is configured.
Response timing: Show latency where implemented.
Troubleshooting: Help investigate connectivity issues.
Service visibility: Make the state of connected services easier to inspect.
🔐 10. Security & Configuration
Environment configuration: Keep settings outside the main source code.
Secret protection: Avoid committing credentials and API keys.
Input validation: Validate request data on the backend.
Access control: Use authentication and authorization only where implemented.
Safer deployment: Follow secure configuration practices.
☁️ 11. Deployment
Frontend hosting: The frontend is deployed on Vercel.
Backend hosting: The backend is deployed on Render.
Production API connection: Configure the frontend to call the deployed backend.
Environment settings: Maintain the required configuration for each environment.
Remote access: Access the deployed application using the live links above.
🧪 12. Testing & Maintenance
Backend tests: Run automated tests with Pytest where configured.
Frontend linting: Use the configured lint command to check code quality.
Build validation: Check whether the frontend builds successfully.
API testing: Inspect and test endpoints through Swagger UI.
Regression prevention: Use tests to catch issues after code changes.
Accuracy note: The feature list describes the product's intended capabilities. Confirm each item against the current code before presenting it as fully implemented. Remove or relabel features that are still planned.

🛠️ Technology Stack
Layer	Technologies
Frontend	Next.js, React, TypeScript
Styling	Tailwind CSS
Backend	Python, FastAPI
Validation	Pydantic
API style	REST
Backend testing	Pytest
Frontend hosting	Vercel
Backend hosting	Render
🏗️ How It Works
                         ┌──────────────────────┐
                         │         USER         │
                         └──────────┬───────────┘
                                    │
                                    ▼
                 ┌─────────────────────────────────┐
                 │          FRONTEND               │
                 │       Next.js + React           │
                 │       TypeScript + UI           │
                 └────────────────┬────────────────┘
                                  │
                           HTTP / REST API
                                  │
                                  ▼
                 ┌─────────────────────────────────┐
                 │           BACKEND               │
                 │             FastAPI              │
                 │     Routes, Validation, Logic   │
                 └────────────────┬────────────────┘
                                  │
                                  ▼
                 ┌─────────────────────────────────┐
                 │        DATA / SERVICES          │
                 │   Configured by the project     │
                 └─────────────────────────────────┘
📂 Project Folder Structure
The tree below is a reference layout based on the project discussed. Keep the names aligned with the actual files in your repository.

Sahay-AI/
│
├── frontend/
│   ├── public/                       # Static assets
│   ├── src/
│   │   ├── app/                      # Pages, layouts and routes
│   │   ├── components/               # Reusable UI components
│   │   ├── lib/                      # API helpers, utilities, localization
│   │   └── types/                    # TypeScript types, if used
│   ├── scripts/                      # Helper scripts, if present
│   ├── package.json                  # Dependencies and npm scripts
│   ├── next.config.*                 # Next.js configuration
│   └── tsconfig.json                 # TypeScript configuration
│
├── backend/
│   ├── app/
│   │   ├── main.py                   # FastAPI entry point (verify filename)
│   │   ├── routes/                   # API endpoint handlers
│   │   ├── schemas/                  # Request and response schemas
│   │   ├── models/                   # Data models, if used
│   │   ├── services/                 # Application/business logic
│   │   ├── database/                 # Database setup, if present
│   │   └── core/                     # Settings and shared configuration
│   ├── tests/                        # Backend tests
│   └── requirements.txt              # Python dependencies
│
├── docs/
│   └── images/
│       ├── sahay-homepage.png        # Homepage screenshot
│       └── sahay-dashboard.png       # Dashboard screenshot
│
├── .gitignore
└── README.md
What Each Folder Does
frontend/src/app/ — Contains the app's pages, layouts, and route definitions.
frontend/src/components/ — Stores reusable UI components.
frontend/src/lib/ — Holds shared utilities, API helpers, and localization logic.
backend/app/routes/ — Defines API endpoints.
backend/app/schemas/ — Defines and validates request/response data.
backend/app/models/ — Holds data model definitions when used.
backend/app/services/ — Contains business logic and service operations.
backend/tests/ — Stores automated backend tests.
docs/images/ — Stores screenshots used in this README.
⚙️ Getting Started
Prerequisites
Git
Node.js and npm
A Python version compatible with the backend dependencies
1. Clone the Repository
git clone https://github.com/sayantandutta-18/Sahay-AI.git
cd Sahay-AI
2. Set Up the Backend
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Create the required environment file and configure the variables used by your backend. Start the server using your actual FastAPI entry point. For example, if the application object is app in app/main.py:

uvicorn app.main:app --reload
Local API: http://127.0.0.1:8000
API documentation: http://127.0.0.1:8000/docs
3. Set Up the Frontend
Open a separate terminal and navigate to the frontend directory (adjust the folder name if your repository differs):

cd frontend
npm install
npm run dev
Open http://localhost:3000 in your browser. Configure the frontend's API base URL using the environment variable already defined by the project.

🧪 Run Tests
From the repository root, if the backend test directory is configured:

python -m pytest backend/tests/ -v
From the frontend directory, use the scripts actually present in package.json. Examples, only if defined:

npm run lint
npm run build
npm run test:i18n
🔑 Environment Variables & Security
Use environment variables for local and production configuration.
Never commit API keys, passwords, database credentials, or production secrets.
Provide a safe .env.example with variable names but no real secrets.
Configure CORS for trusted frontend origins only.
Validate input and handle API errors carefully.
🌐 Deployment
Frontend: Vercel
Backend: Render
After deployment, verify the frontend's backend URL, environment variables, CORS configuration, and service logs if requests fail.

🗺️ Future Improvements
Improve scheme discovery and eligibility guidance.
Expand financial and business information features.
Improve application and document workflows.
Expand multilingual coverage and accessibility.
Strengthen automated tests and monitoring.
🤝 Contributing
Fork the repository.
Create a feature branch.
Make your changes.
Run the relevant checks.
Submit a pull request describing your changes.
⚠️ Disclaimer
Sahay AI is an independent project. It is not an official government website and is not affiliated with or endorsed by any government authority. Verify scheme details through official sources. AI-generated information may be incomplete or inaccurate and should not replace professional financial, legal, or other qualified advice.

👨‍💻 Author
Sayantan Dutta
GitHub: @sayantandutta-18

<div align="center">
Made with ❤️ to make useful information easier to access.

</div>
⋮⋮⋮⋮⋮⋮⋮⋮⋮⋮⋮⋮
