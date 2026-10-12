# SAHAY (सहाय) — Multilingual AI Platform for Indian Micro-Entrepreneurs

SAHAY is an intelligent decision-support and enablement platform tailored for Indian micro-entrepreneurs. It provides deterministic government scheme discovery, document checklists, application tracking, grounded AI consultation (RAG), business financial tools, and an educational stock market academy with decision-support analytics.

---

## 🏛️ Architecture & Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Lucide Icons
- **Backend**: Python 3.14, FastAPI, Pydantic v2, Uvicorn, Pytest
- **Database**: PostgreSQL with `pgvector` & SQLAlchemy ORM
- **Cache & Queues**: Redis
- **Security & Principles**:
  - Deterministic business rules & eligibility calculations (LLMs explain results but never override rules)
  - Strict role-based authorization and granular data consent
  - Zero invented government-scheme or live market data
  - Secrets managed strictly via environment variables

---

## 📁 Repository Structure

```
Sahay-AI/
├── backend/
│   ├── app/
│   │   ├── core/          # Configuration, security, settings
│   │   ├── database/      # Database session, engine, declarative base
│   │   ├── models/        # SQLAlchemy database models
│   │   ├── schemas/       # Pydantic request/response schemas
│   │   ├── routes/        # FastAPI endpoint routers
│   │   ├── services/      # Business logic & deterministic engines
│   │   ├── utils/         # Helper functions
│   │   └── main.py        # FastAPI entrypoint with CORS & middleware
│   ├── tests/             # Pytest test suite
│   ├── requirements.txt   # Python dependencies
│   ├── Dockerfile         # Production backend container definition
│   └── .env.example       # Backend environment variables template
├── frontend/
│   ├── src/
│   │   ├── app/           # Next.js App Router pages
│   │   ├── components/    # Reusable UI system (Button, Card, Modal, etc.)
│   │   ├── lib/           # Typed API client & utilities
│   │   └── types/         # TypeScript shared interfaces
│   ├── package.json       # Frontend dependencies
│   ├── Dockerfile         # Production frontend container definition
│   └── .env.example       # Frontend environment variables template
├── docker-compose.yml     # Local orchestration (PostgreSQL + pgvector, Redis, apps)
├── .env.example           # Monorepo environment template
└── README.md              # Project documentation
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v20+ (v24 recommended)
- **Python**: v3.11+ (Python 3.14 supported)
- **Docker & Docker Compose**: Optional for local PostgreSQL/Redis orchestration

---

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment (if not already created)
python -m venv .venv

# Activate virtual environment
# Windows PowerShell:
.venv\Scripts\Activate.ps1
# Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env from template
cp .env.example .env

# Run unit tests
pytest

# Start FastAPI development server
uvicorn app.main:app --reload --port 8000
```
API Documentation will be available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- Health Endpoint: `http://localhost:8000/health`

---

### 3. Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create .env.local from template
cp .env.example .env.local

# Run build / typecheck
npm run build

# Start Next.js development server
npm run dev
```
Frontend interface will be live at `http://localhost:3000`.

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
.venv\Scripts\pytest
```

### Frontend Build & Lint
```bash
cd frontend
npm run build
```
