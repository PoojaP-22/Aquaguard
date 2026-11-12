# AquaGuard AI

AquaGuard is a predictive-maintenance decision-support prototype for water-distribution pipeline assets. It combines a React dashboard, FastAPI service, SQLite persistence, sensor telemetry ingestion, ML inference, alert lifecycle management and repair prioritisation.

> **Prototype boundary:** Demo telemetry and the included model evaluation use synthetic/seeded data. The GIS view is schematic. This project is not a production utility-control system, a field-validated failure predictor, or a deployed physical sensor network.

## Project structure

- `frontend/` — React 19, Vite, Tailwind CSS and Recharts.
- `backend/app/` — FastAPI routes, SQLAlchemy models, services and ML inference.
- `backend/app/ml/artifacts/` — trained prototype model artifacts and feature/metric metadata.
- `backend/tests/` — deterministic scoring-service unit tests.
- `docs/` — implementation notes, semester presentation outline and demo runbook.
- `.github/workflows/quality.yml` — frontend lint/build and backend compile/test checks.

## Requirements

- Python 3.11 recommended.
- Node.js 22.12 or newer (Vite 8 requires a recent Node 20/22 release).
- npm.
- Git.

## Run locally

Open two terminals from the repository root.

### 1. Backend

Windows PowerShell:

```powershell
cd backend
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
python -m app.seed
uvicorn app.main:app --reload
```

macOS / Linux:

```bash
cd backend
python3.11 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
python -m app.seed
uvicorn app.main:app --reload
```

The default development database is SQLite at `backend/aquaguard.db`. Set `DATABASE_URL` before starting the backend to use another SQLAlchemy-supported database. The seed command skips seeding when pipeline records already exist; it does not reset an existing database.

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm ci
npm run dev
```

Open the Vite URL printed in the terminal (normally `http://localhost:5173`). The frontend defaults to `http://127.0.0.1:8000/api` for the API. To override it, create `frontend/.env.local`:

```dotenv
VITE_API_URL=http://127.0.0.1:8000/api
```

The backend CORS allow-list is configured with `ALLOWED_ORIGINS` (comma-separated). Its development defaults include localhost ports 3000, 5173 and 5174.

## Useful URLs

- Frontend: `http://localhost:5173`
- API root: `http://127.0.0.1:8000/`
- Health check: `http://127.0.0.1:8000/health`
- Swagger API docs: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

## Quality checks

Frontend:

```bash
cd frontend
npm ci
npm run lint
npm run build
```

Backend (from repository root, with backend requirements installed):

```bash
python -m compileall -q backend/app
PYTHONPATH=backend python -m unittest discover -s backend/tests -v
python -m pip check
```

GitHub Actions runs these checks for pull requests targeting `main` and pushes to `main` or `aquaguard-2.0`.

## Main workflows

- **Command Center:** API-backed network summary, pipeline status, alert overview and hourly trend endpoint.
- **Pipeline Monitoring:** pipeline search, status filtering and risk/PHI/pressure/flow sorting.
- **Pipeline Details:** per-pipeline model inference and stored sensor-history charts.
- **GIS Workspace:** schematic asset map based on pipeline records; positions are illustrative, not surveyed coordinates.
- **Simulation Lab:** inject and clear demo faults, advance a simulation tick and reset the in-memory simulation.
- **Sensor Telemetry:** latest sensor records, recent readings and CSV export.
- **AI Alerts:** persisted alert records and acknowledge/resolve/dismiss lifecycle actions.
- **Repair Priority:** rule-based ranking using risk, inverse PHI and time-to-failure urgency.
- **Maintenance Logs:** persisted maintenance record creation and status updates.
- **Alert Configuration:** stored threshold and notification preference fields.
- **Settings:** browser-local dashboard refresh preference and backend health information.

## Important limitations and deployment work

- The login entry is explicitly demo-only. Authentication, password verification, authorisation and user-profile management are not implemented.
- Email and dashboard notification flags are persisted preferences; no notification delivery provider is connected. Stored alert thresholds are not yet wired into the model's hard-coded risk/PHI classification logic.
- The model and evaluation metrics use synthetic observations. Validate on representative utility data with temporal and asset-level holdouts before relying on predictions.
- Time-to-failure is a prototype estimate, not a field-calibrated rupture forecast.
- The map has no surveyed coordinates or GeoJSON pipe geometry.
- Simulation faults are in-memory demo state; they do not represent physical sensor actuation.
- Configure production database credentials, secrets, HTTPS, authentication, role-based access, audit logging, backups, monitoring and deployment controls before any operational use.

See `docs/AQUAGUARD_2_0_AND_SEMESTER_GUIDE.md` and `docs/DEMO_RUNBOOK.md` for the implementation notes and demonstration sequence.
