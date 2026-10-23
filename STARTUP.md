# 🚀 DrugCopilot - Quick Startup Guide

This guide provides the exact commands to run the **Backend API**, **Frontend Interface**, or the **Entire Dockerized Stack**.

---

## Method 1: Local Development (Recommended for Fast Iteration)

### Prerequisites
- **Python 3.11+**
- **Node.js 18+ & npm**

---

### Terminal 1: Backend Server (FastAPI)

```powershell
# Windows (PowerShell):
.\backend\venv\Scripts\python.exe -m uvicorn app.main:app --app-dir backend --port 8000 --host 0.0.0.0 --reload

# Linux / macOS (Bash):
source backend/venv/bin/activate
uvicorn app.main:app --app-dir backend --port 8000 --host 0.0.0.0 --reload
```

* **API Endpoint:** [http://localhost:8000](http://localhost:8000)
* **Swagger Interactive Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
* **Health Check:** [http://localhost:8000/health](http://localhost:8000/health)

---

### Terminal 2: Frontend Web Portal (Next.js 14)

```powershell
# Navigate to frontend and start dev server:
cd frontend
npm run dev

# Or from root directory:
npm --prefix frontend run dev
```

* **Web Application:** [http://localhost:3000](http://localhost:3000)
* **AI Copilot Portal:** [http://localhost:3000/copilot](http://localhost:3000/copilot)
* **Knowledge Graph Explorer:** [http://localhost:3000/explore](http://localhost:3000/explore)
* **Admin Command Center:** [http://localhost:3000/admin](http://localhost:3000/admin)

---

## Method 2: One-Click Docker Compose (Production Stack)

Runs the entire isolated infrastructure: **Local Neo4j Graph DB**, **Redis Cache**, **FastAPI Backend**, **Background ETL Worker**, and **Next.js Frontend**.

### 1. Start All Services:
```bash
docker compose up --build -d
```

### 2. View Live Logs:
```bash
# All containers:
docker compose logs -f

# Backend only:
docker compose logs -f backend

# Frontend only:
docker compose logs -f frontend
```

### 3. Stop All Services:
```bash
docker compose down
```

### 4. Stop and Wipe Data Volumes (Fresh Reset):
```bash
docker compose down -v
```

---

## 🧪 Running Tests

```powershell
# Run backend pytest suite (17 unit and integration tests):
.\backend\venv\Scripts\python.exe -m pytest backend\tests

# Run frontend production build check:
npm --prefix frontend run build
```
