🌿 Sahay AI — AI-Powered Financial & Business Companion
Understand Your Money. Discover Opportunities. Make Smarter Decisions.
Sahay AI is an AI-powered platform designed to help users explore government schemes, understand eligibility requirements, organize application-related tasks, and access financial and business information in a simpler way.
🚀 Live Demo
- Frontend: https://sahay-ai-beige.vercel.app/
- Backend API: https://sahay-ai-5.onrender.com/
- API Documentation: https://sahay-ai-5.onrender.com/docs
- GitHub Repository: https://github.com/sayantandutta-18/Sahay-AI
✨ Features Explained
1. 🏛️ Government Scheme Discovery
- Scheme Information: Helps users explore information about government schemes.
- Eligibility Guidance: Helps users understand eligibility criteria.
- Document Requirements: Highlights documents that may be required for an application.
- Simplified Explanations: Makes complex scheme information easier to understand.
- Official Verification: Encourages users to confirm requirements and deadlines through official sources.
2. 🤖 AI-Powered Assistance
- Natural-Language Questions: Lets users ask questions in everyday language.
- Clear Explanations: Helps explain unfamiliar or complex topics.
- Contextual Guidance: Provides assistance based on the information available to the application.
- Decision Support: Helps users understand options before deciding.
- Information Assistance: Makes information easier to explore and understand.
3. 🌍 Multilingual Support
- English: Supports English-language users.
- Hindi: Supports Hindi-language users.
- Bengali: Supports Bengali-language users.
- Accessibility: Helps users interact in a language they understand.
- Inclusive Experience: Makes the platform more approachable for different users.
4. 📋 Application Tracking
- Application Organization: Helps organize application-related information.
- Progress Tracking: Helps users review progress where supported.
- Pending Tasks: Helps identify remaining steps.
- Checklists: Helps users keep track of actions and required documents.
- Better Organization: Reduces the chance of overlooking application tasks.
5. 📄 Document Management
- Document Organization: Helps users keep track of relevant documents.
- Requirement Checklist: Helps identify documents that may be needed.
- Readiness Review: Helps users check whether documents are prepared.
- Application Preparation: Supports preparation before applying.
- Workflow Support: Keeps document-related tasks organized.
6. 💰 Financial & Business Assistance
- Financial Information: Helps users explore general financial concepts.
- Business Guidance: Supports exploration of business-related information.
- Opportunity Awareness: Helps users investigate potentially relevant schemes or opportunities.
- Simple Terminology: Explains unfamiliar terms in accessible language.
- Informed Decisions: Provides informational support before financial or business decisions.
7. 📊 Dashboard & User Interface
- Central Dashboard: Provides a central place to access available features.
- Organized Information: Presents supported information in a structured layout.
- Navigation: Helps users move between application sections.
- Responsive Layout: Aims to support desktop and mobile screen sizes.
- Usability: Keeps key information and actions easy to find.
8. 🔌 Backend API Integration
- REST API: Connects the frontend to backend functionality through HTTP requests.
- FastAPI: Provides the backend API framework.
- Request Validation: Pydantic schemas can validate supported request and response data.
- Error Handling: Helps the application handle unsuccessful API requests.
- Swagger Documentation: Makes supported endpoints easier to inspect and test.
9. 🩺 System Health Monitoring
- Backend Connectivity: Helps check whether the frontend can reach the backend.
- API Health: Exposes health information when a health endpoint is configured.
- Response Latency: Can display response timing where implemented.
- Troubleshooting: Helps developers investigate connectivity issues.
- Service Visibility: Makes service status easier to inspect.
10. 🔐 Security & Configuration
- Environment Variables: Separates configuration from source code.
- Secret Protection: Keeps API keys and credentials out of public commits.
- Input Validation: Helps reject invalid request data.
- Authentication: Authentication and authorization should be described as available only where implemented.
- Safer Deployment: Encourages secure configuration practices.
11. ☁️ Cloud Deployment
- Frontend Hosting: The frontend is deployed on Vercel.
- Backend Hosting: The backend is deployed on Render.
- Production API URL: Configures the frontend to communicate with the deployed backend.
- Environment Configuration: Supports deployment-specific settings.
- Remote Access: Makes the deployed application available through its public URLs.
12. 🧪 Testing & Reliability
- Backend Tests: Uses Pytest for backend automated tests where configured.
- Frontend Linting: Can check code quality using the configured npm script.
- Build Validation: Can verify whether the frontend builds successfully.
- API Testing: Swagger UI can be used to inspect and test available endpoints.
- Regression Checks: Automated tests can help catch issues after code changes.
Implementation note: Feature descriptions above explain the intended product capabilities. Before presenting every item as implemented, verify it against the current codebase and remove features that are not yet available.

🛠️ Technology Stack
Layer	Technologies
Frontend	Next.js, React, TypeScript
Styling	Tailwind CSS
Backend	Python, FastAPI
Validation	Pydantic
API	REST
Testing	Pytest and configured frontend scripts
Frontend Deployment	Vercel
Backend Deployment	Render


🏗️ System Architecture
                 ┌──────────────────────┐
                 │         User         │
                 └──────────┬───────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │   Next.js Frontend   │
                 │ React / TypeScript   │
                 └──────────┬───────────┘
                            │ HTTP / REST API
                            ▼
                 ┌──────────────────────┐
                 │    FastAPI Backend   │
                 │ Routes and Services  │
                 │ Request Validation   │
                 └──────────┬───────────┘
                            │
                            ▼
                 ┌──────────────────────┐
                 │    Data Storage      │
                 └──────────────────────┘
📂 Project Folder Structure
The tree below is a reference structure. Adjust it to match the actual folders and filenames in your repository.
Sahay-AI/
├── frontend/
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── app/                # Next.js pages, layouts and routes
│   │   ├── components/         # Reusable UI components
│   │   ├── lib/                # Utilities, API helpers and localization
│   │   └── types/              # TypeScript types (if present)
│   ├── scripts/                # Helper scripts (if present)
│   ├── package.json            # Frontend dependencies and scripts
│   └── tsconfig.json           # TypeScript configuration
│
├── backend/
│   ├── app/
│   │   ├── main.py             # FastAPI entry point (verify filename)
│   │   ├── routes/             # API route handlers
│   │   ├── schemas/            # Request/response schemas
│   │   ├── models/             # Data models
│   │   ├── services/           # Business logic
│   │   ├── database/           # Database configuration (if present)
│   │   └── core/               # Settings and shared configuration
│   ├── tests/                  # Backend tests
│   └── requirements.txt        # Python dependencies
│
├── docs/
│   └── images/
│       ├── sahay-homepage.png  # Add homepage screenshot
│       └── sahay-dashboard.png # Add dashboard screenshot
│
├── .gitignore
└── README.md
Folder Responsibilities
- frontend/src/app/: Pages, layouts, and route definitions.
- frontend/src/components/: Reusable UI components.
- frontend/src/lib/: Shared utilities, API helpers, and localization logic.
- backend/app/routes/: API endpoint definitions.
- backend/app/schemas/: Input and output validation schemas.
- backend/app/models/: Data model definitions.
- backend/app/services/: Application business logic.
- backend/tests/: Automated backend tests.
- docs/images/: Images referenced by this README.
⚙️ Getting Started
Prerequisites
- Git
- Node.js and npm
- Python version compatible with the backend dependencies
1. Clone the Repository
git clone https://github.com/sayantandutta-18/Sahay-AI.git
cd Sahay-AI
2. Set Up the Backend
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Configure the environment variables required by the backend, then start the server using the actual application entry point. For example, if the entry point is app.main:app:
uvicorn app.main:app --reload
- Local API: http://127.0.0.1:8000
- API documentation: http://127.0.0.1:8000/docs
3. Set Up the Frontend
Open another terminal and navigate to the actual frontend directory (shown as frontend/ here):
cd frontend
npm install
npm run dev
Open http://localhost:3000 in your browser.
Configure the frontend API base URL using the environment variable name already defined in your project.
🧪 Testing
From the repository root, run backend tests if Pytest and the listed test directory are configured:
python -m pytest backend/tests/ -v
From the frontend directory, use the scripts that actually exist in package.json. Common examples include:
npm run lint
npm run build
npm run test:i18n
🔑 Environment Variables & Security
- Use .env files for local configuration.
- Never commit API keys, passwords, database credentials, or production secrets.
- Document required variable names in a safe .env.example file.
- Configure production CORS to allow only trusted frontend origins.
- Validate user input and handle API errors carefully.
🌐 Deployment
- Frontend: Vercel
- Backend: Render
- Configure the deployed frontend to use the correct backend URL.
- Check environment variables, CORS settings, and service logs if requests fail.
🗺️ Future Improvements
- Improve scheme discovery and eligibility guidance.
- Expand financial and business assistance.
- Improve application and document workflows.
- Expand multilingual coverage and accessibility.
- Strengthen automated tests and production monitoring.
🤝 Contributing
1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Run the relevant tests and checks.
5. Open a pull request with a clear description.
⚠️ Disclaimer
Sahay AI is an independent project. It is not an official government website and is not affiliated with or endorsed by a government authority. Verify scheme information with official sources. AI-generated information may be incomplete or inaccurate and should not replace professional financial or legal advice.
👨‍💻 Author
Sayantan Dutta
GitHub: @sayantandutta-18
<p align="center">Made with ❤️ to make useful information easier to access.</p>
