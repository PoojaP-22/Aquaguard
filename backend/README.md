# AquaGuard AI — Backend

**Explainable Predictive Maintenance for Water Distribution Pipelines**

FastAPI backend powering the AquaGuard AI dashboard. Provides pipeline health data, AI-generated risk alerts, repair priority rankings, sensor readings, and maintenance records.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | FastAPI 0.111 |
| Server | Uvicorn |
| ORM | SQLAlchemy 2.0 |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Validation | Pydantic v2 |
| Config | python-dotenv |

---

## Folder Structure

```
backend/
├── app/
│   ├── main.py               # FastAPI app, CORS, router registration
│   ├── database.py           # SQLAlchemy engine, session, Base
│   ├── seed.py               # Demo data seeder
│   ├── models/
│   │   ├── pipeline.py       # Pipeline table
│   │   ├── sensor.py         # Sensor readings table
│   │   ├── alert.py          # AI alerts table
│   │   ├── maintenance.py    # Maintenance records table
│   │   ├── user.py           # Users table
│   │   └── configuration.py  # Alert thresholds + notification settings
│   ├── schemas/
│   │   ├── pipeline.py       # Pydantic in/out for pipelines
│   │   ├── sensor.py         # Pydantic in/out for sensors
│   │   ├── alert.py          # Pydantic in/out for alerts (incl. SHAP)
│   │   ├── maintenance.py    # Pydantic in/out for maintenance
│   │   └── dashboard.py      # DashboardSummary, RepairPriorityItem, ConfigurationOut
│   ├── routes/
│   │   ├── dashboard.py      # GET /api/dashboard/summary
│   │   ├── pipelines.py      # CRUD /api/pipelines
│   │   ├── sensors.py        # /api/sensors
│   │   ├── alerts.py         # CRUD /api/alerts
│   │   ├── repair_priority.py# GET /api/repair-priority
│   │   ├── maintenance.py    # CRUD /api/maintenance
│   │   └── configuration.py  # GET/PUT /api/configuration
│   └── services/
│       ├── prediction_service.py  # Mock AI predictions (swap for ML later)
│       ├── phi_service.py         # Pipeline Health Index calculator
│       └── priority_service.py   # Repair priority ranking engine
├── data/                     # Reserved for ML datasets / exports
├── .env                      # Environment variables (not committed)
├── .gitignore
├── requirements.txt
└── README.md
```

---

## Installation

### 1. Navigate to the backend folder

```bash
cd backend
```

### 2. Create a virtual environment

```bash
python -m venv venv
```

### 3. Activate it

**Windows (PowerShell):**
```powershell
.\venv\Scripts\Activate.ps1
```

**macOS / Linux:**
```bash
source venv/bin/activate
```

### 4. Install dependencies

```bash
pip install -r requirements.txt
```

---

## Environment Setup

Create a `.env` file in `backend/` (already provided, never commit it):

```env
DATABASE_URL=sqlite:///./aquaguard.db
APP_ENV=development
SECRET_KEY=aquaguard-dev-secret-change-in-production
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:5174
```

To use **PostgreSQL** in production, change `DATABASE_URL`:

```env
DATABASE_URL=postgresql://user:password@host:5432/aquaguard
```

---

## Database Setup & Seed Data

Tables are created automatically at startup. To populate demo data:

```bash
python -m app.seed
```

This adds:
- 12 pipelines across 5 zones
- 1,152 historical sensor readings (48 per pipeline)
- 5 AI alerts (Critical → Low)
- 5 maintenance records
- 2 demo users
- 1 default configuration

---

## Running the Server

```bash
uvicorn app.main:app --reload
```

| URL | Description |
|---|---|
| `http://127.0.0.1:8000` | Root health check |
| `http://127.0.0.1:8000/health` | Detailed health check |
| `http://127.0.0.1:8000/docs` | Swagger UI |
| `http://127.0.0.1:8000/redoc` | ReDoc |

---

## API Reference

### Dashboard
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard/summary` | Aggregated health metrics |

### Pipelines
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/pipelines` | List all (filter: `status`, `zone`) |
| GET | `/api/pipelines/{pipeline_id}` | Get one pipeline |
| POST | `/api/pipelines` | Create pipeline |
| PUT | `/api/pipelines/{pipeline_id}` | Update pipeline |
| DELETE | `/api/pipelines/{pipeline_id}` | Delete pipeline |

### Sensors
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/sensors` | Latest reading per sensor |
| GET | `/api/sensors/{pipeline_id}` | Latest readings for a pipeline |
| POST | `/api/sensors` | Ingest a new reading |
| GET | `/api/sensors/{pipeline_id}/history` | Historical readings (`?limit=100`) |

### Alerts
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/alerts` | List alerts (filter: `risk_level`, `status`, `pipeline_id`) |
| GET | `/api/alerts/{alert_id}` | Get one alert |
| POST | `/api/alerts` | Create alert |
| PUT | `/api/alerts/{alert_id}` | Update alert status |

### Repair Priority
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/repair-priority` | Pipelines ranked by maintenance urgency |

### Maintenance
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/maintenance` | List records (filter: `pipeline_id`, `status`) |
| GET | `/api/maintenance/{id}` | Get one record |
| POST | `/api/maintenance` | Create record |
| PUT | `/api/maintenance/{id}` | Update record |

### Configuration
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/configuration` | Get current thresholds |
| PUT | `/api/configuration` | Update thresholds |

---

## Example API Requests

```bash
# Dashboard summary
curl http://127.0.0.1:8000/api/dashboard/summary

# All pipelines
curl http://127.0.0.1:8000/api/pipelines

# Critical pipelines only
curl "http://127.0.0.1:8000/api/pipelines?status=Critical"

# Single pipeline
curl http://127.0.0.1:8000/api/pipelines/P04

# Active alerts
curl "http://127.0.0.1:8000/api/alerts?status=Active"

# Repair priority ranking
curl http://127.0.0.1:8000/api/repair-priority

# Sensor history for P04 (last 50 readings)
curl "http://127.0.0.1:8000/api/sensors/P04/history?limit=50"

# Create maintenance record
curl -X POST http://127.0.0.1:8000/api/maintenance \
  -H "Content-Type: application/json" \
  -d '{"pipeline_id":"P04","issue_type":"High leak risk","priority":"Critical","action_taken":"Valve inspection","assigned_engineer":"Arun Kumar","status":"In Progress"}'

# Update alert status
curl -X PUT http://127.0.0.1:8000/api/alerts/A001 \
  -H "Content-Type: application/json" \
  -d '{"status":"Acknowledged"}'
```

---

## Frontend Connection

The React frontend (in `frontend/`) connects to this API. Configure the base URL in the frontend:

```js
// frontend/src/data/mockData.js or an api.js config file
const API_BASE = "http://127.0.0.1:8000";
```

CORS is pre-configured for:
- `http://localhost:3000`
- `http://localhost:5173`
- `http://localhost:5174`

---

## Future ML Integration

The prediction pipeline is isolated in `app/services/prediction_service.py`.

To swap in the real ML model:

1. Train your Random Forest / XGBoost model on historical sensor data
2. Save the model (joblib / pickle)
3. Replace the body of `predict_pipeline_risk()` in `prediction_service.py`
4. Keep the same function signature and `PredictionResult` return type
5. No route, schema, or model changes required

```
Dataset → Preprocessing → XGBoost → SHAP → prediction_service.py → FastAPI → React
```

---

## Demo Credentials

| Name | Email | Role |
|---|---|---|
| Arun Kumar | arun@aquaguard.io | Maintenance Engineer |
| Admin User | admin@aquaguard.io | Utility Dashboard Admin |

> Authentication is not implemented yet. JWT auth can be added without changing existing routes.


## Predictive inference
The application now exposes `GET /api/predictions` and `GET /api/predictions/{pipeline_id}`. The current dependency-light inference service computes a deterministic hybrid risk from pressure/flow and optional sensor features. It is intended as an immediately runnable prototype and a stable integration point for a trained ML artifact.
