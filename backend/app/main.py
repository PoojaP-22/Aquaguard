"""
AquaGuard AI — FastAPI Application Entry Point

Run with:
    uvicorn app.main:app --reload

Swagger UI:  http://127.0.0.1:8000/docs
ReDoc:       http://127.0.0.1:8000/redoc
"""

import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import create_tables
from app.routes import (
    dashboard,
    pipelines,
    sensors,
    alerts,
    repair_priority,
    maintenance,
    configuration,
    predictions,
)

load_dotenv()

# ---------------------------------------------------------------------------
# App instance
# ---------------------------------------------------------------------------
app = FastAPI(
    title="AquaGuard AI",
    description=(
        "Explainable Predictive Maintenance for Water Distribution Pipelines.\n\n"
        "**ML:** AquaGuard-ML-1.0 uses a trained Random Forest + Isolation Forest hybrid, "
        "with SHAP-based feature explanations and synthetic-data validation. "
        "Field validation requires real sensor data."
    ),
    version="2.0.0-ml",
    contact={
        "name": "AquaGuard AI Team",
        "email": "support@aquaguard.io",
    },
    license_info={
        "name": "MIT",
    },
)

# ---------------------------------------------------------------------------
# CORS — allow React dev servers and any origins listed in .env
# ---------------------------------------------------------------------------
_raw_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://localhost:5173,http://localhost:5174",
)
allowed_origins = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Database — create tables on startup (idempotent)
# ---------------------------------------------------------------------------
@app.on_event("startup")
def on_startup():
    create_tables()


# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(dashboard.router)
app.include_router(pipelines.router)
app.include_router(sensors.router)
app.include_router(alerts.router)
app.include_router(repair_priority.router)
app.include_router(maintenance.router)
app.include_router(configuration.router)
app.include_router(predictions.router)


# ---------------------------------------------------------------------------
# Health-check endpoints
# ---------------------------------------------------------------------------
@app.get("/", tags=["Health"], summary="Root health check")
def root():
    return {"message": "AquaGuard AI Backend is running"}


@app.get("/health", tags=["Health"], summary="Detailed health check")
def health():
    return {"status": "healthy", "version": "2.0.0-ml", "model_version": "AquaGuard-ML-1.0"}
