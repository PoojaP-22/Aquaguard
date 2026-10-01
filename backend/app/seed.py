"""
AquaGuard AI — Database Seed Script

Populates the database with realistic demo data:
  - 12 pipelines across 5 zones
  - 2 sensor readings per pipeline (pressure + flow)
  - 5 active alerts (Critical → Low)
  - 5 maintenance records
  - 2 demo users
  - 1 default configuration row

Run from the backend/ directory:
    python -m app.seed
"""

import json
import sys
import os
from datetime import datetime, timedelta
import random

# Ensure the backend/ directory is on the path when run directly
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal, create_tables
from app.models.pipeline import Pipeline
from app.models.sensor import Sensor
from app.models.alert import Alert
from app.models.maintenance import Maintenance
from app.models.user import User
from app.models.configuration import Configuration


# ---------------------------------------------------------------------------
# Seed data definitions
# ---------------------------------------------------------------------------

PIPELINES = [
    # (pipeline_id, zone,           location,                   pressure, flow,  phi,   leak_risk, ttf,         status)
    ("P01", "Central Zone",  "Central Distribution Hub",         1.02,  41.2,  94.0,  11.0,  "30+ days",  "Healthy"),
    ("P02", "Central Zone",  "Central Secondary Line",           0.98,  39.5,  91.0,   9.0,  "30+ days",  "Healthy"),
    ("P03", "West Zone",     "West Residential Area",            1.05,  42.1,  89.0,  22.0,  "30+ days",  "Healthy"),
    ("P04", "North Zone",    "North Distribution Area",          0.71,  38.2,  62.0,  82.0,  "18 hours",  "Critical"),
    ("P05", "North Zone",    "North Industrial Supply",          0.85,  35.8,  76.0,  31.0,  "7 days",    "Warning"),
    ("P06", "East Zone",     "East Residential Supply",          1.01,  40.8,  93.0,  18.0,  "30+ days",  "Healthy"),
    ("P07", "South Zone",    "South Distribution Main",          0.88,  36.5,  72.0,  54.0,  "3 days",    "Warning"),
    ("P08", "South Zone",    "South Secondary Line",             1.03,  43.2,  95.0,  14.0,  "30+ days",  "Healthy"),
    ("P09", "West Zone",     "West Industrial Zone",             0.93,  37.9,  80.0,  38.0,  "7 days",    "Warning"),
    ("P10", "East Zone",     "East Commercial District",         0.82,  34.1,  68.0,  65.0,  "3 days",    "High Risk"),
    ("P11", "East Zone",     "East Primary Trunk Main",          0.79,  36.8,  71.0,  61.0,  "3 days",    "High Risk"),
    ("P12", "North Zone",    "North Reservoir Feeder",           0.96,  40.1,  84.0,  28.0,  "30+ days",  "Healthy"),
]

ALERTS = [
    {
        "alert_id": "A001",
        "pipeline_id": "P04",
        "risk_level": "Critical",
        "risk_score": 82.0,
        "title": "Critical leak risk detected — P04",
        "description": "Abnormal pressure drop and flow anomaly detected on P04 (North Zone). AI model confidence: 91%.",
        "shap_explanation": json.dumps([
            {"feature": "Pressure Drop Rate", "impact": 0.38},
            {"feature": "Flow Anomaly",        "impact": 0.24},
            {"feature": "Pressure Variance",   "impact": 0.16},
            {"feature": "Recent Fluctuation",  "impact": 0.09},
        ]),
        "recommended_action": "Dispatch maintenance crew to P04 immediately. Estimated time to failure: 18 hours.",
        "priority": "Critical",
        "status": "Active",
    },
    {
        "alert_id": "A002",
        "pipeline_id": "P11",
        "risk_level": "High",
        "risk_score": 61.0,
        "title": "High leak risk — P11 East Primary Trunk",
        "description": "Moderate pressure and flow deviation detected on P11 (East Zone). AI model confidence: 84%.",
        "shap_explanation": json.dumps([
            {"feature": "Flow Anomaly",           "impact": 0.29},
            {"feature": "Pressure Drop Rate",     "impact": 0.21},
            {"feature": "Historical Fault Rate",  "impact": 0.14},
            {"feature": "Zone Risk Factor",       "impact": 0.08},
        ]),
        "recommended_action": "Schedule inspection of P11 within 24–48 hours.",
        "priority": "High",
        "status": "Active",
    },
    {
        "alert_id": "A003",
        "pipeline_id": "P07",
        "risk_level": "Medium",
        "risk_score": 54.0,
        "title": "Elevated pressure instability — P07",
        "description": "Pressure instability detected on P07 (South Zone). AI model confidence: 78%.",
        "shap_explanation": json.dumps([
            {"feature": "Pressure Variance",   "impact": 0.25},
            {"feature": "Recent Fluctuation",  "impact": 0.18},
            {"feature": "Flow Anomaly",        "impact": 0.10},
            {"feature": "Zone Risk Factor",    "impact": 0.06},
        ]),
        "recommended_action": "Monitor P07 closely. Plan inspection this week.",
        "priority": "Medium",
        "status": "Active",
    },
    {
        "alert_id": "A004",
        "pipeline_id": "P09",
        "risk_level": "Medium",
        "risk_score": 38.0,
        "title": "Minor flow deviation — P09",
        "description": "Minor flow deviation observed on P09 (West Zone). AI model confidence: 72%.",
        "shap_explanation": json.dumps([
            {"feature": "Flow Anomaly",        "impact": 0.20},
            {"feature": "Pressure Variance",   "impact": 0.12},
            {"feature": "Recent Fluctuation",  "impact": 0.07},
            {"feature": "Zone Risk Factor",    "impact": 0.04},
        ]),
        "recommended_action": "Log P09 for inspection during next scheduled maintenance.",
        "priority": "Medium",
        "status": "Active",
    },
    {
        "alert_id": "A005",
        "pipeline_id": "P05",
        "risk_level": "Low",
        "risk_score": 31.0,
        "title": "Pressure trending downward — P05",
        "description": "Gradual pressure decline observed on P05 (North Zone). AI model confidence: 69%.",
        "shap_explanation": json.dumps([
            {"feature": "Pressure Drop Rate",  "impact": 0.15},
            {"feature": "Flow Anomaly",        "impact": 0.09},
            {"feature": "Recent Fluctuation",  "impact": 0.06},
            {"feature": "Zone Risk Factor",    "impact": 0.03},
        ]),
        "recommended_action": "Log P05 for routine next-cycle inspection.",
        "priority": "Low",
        "status": "Active",
    },
]

MAINTENANCE = [
    {
        "pipeline_id": "P04",
        "issue_type": "Critical leak risk — pressure and flow anomaly",
        "priority": "Critical",
        "action_taken": "Emergency valve inspection and pressure test",
        "assigned_engineer": "Arun Kumar",
        "notes": "Dispatched based on AI alert A001. Immediate inspection required.",
        "status": "In Progress",
        "created_at": datetime.utcnow() - timedelta(days=1),
    },
    {
        "pipeline_id": "P11",
        "issue_type": "High leak risk — flow deviation",
        "priority": "High",
        "action_taken": "Flow meter calibration and joint inspection",
        "assigned_engineer": "Priya Sharma",
        "notes": "Scheduled based on AI alert A002.",
        "status": "Pending",
        "created_at": datetime.utcnow() - timedelta(days=2),
    },
    {
        "pipeline_id": "P07",
        "issue_type": "Pressure instability",
        "priority": "Medium",
        "action_taken": "Pressure regulator inspection",
        "assigned_engineer": "Arun Kumar",
        "notes": "Routine follow-up from AI alert A003.",
        "status": "Pending",
        "created_at": datetime.utcnow() - timedelta(days=3),
    },
    {
        "pipeline_id": "P10",
        "issue_type": "High risk — pressure and flow deviation",
        "priority": "High",
        "action_taken": "Full pipeline section inspection",
        "assigned_engineer": "Ravi Menon",
        "notes": "P10 shows elevated risk. Pre-emptive inspection scheduled.",
        "status": "Completed",
        "created_at": datetime.utcnow() - timedelta(days=14),
        "completed_at": datetime.utcnow() - timedelta(days=12),
    },
    {
        "pipeline_id": "P03",
        "issue_type": "Routine scheduled maintenance",
        "priority": "Low",
        "action_taken": "General inspection and valve lubrication",
        "assigned_engineer": "Priya Sharma",
        "notes": "Quarterly routine maintenance. No issues found.",
        "status": "Completed",
        "created_at": datetime.utcnow() - timedelta(days=30),
        "completed_at": datetime.utcnow() - timedelta(days=29),
    },
]

USERS = [
    {
        "name": "Arun Kumar",
        "email": "arun@aquaguard.io",
        "role": "Maintenance Engineer",
    },
    {
        "name": "Admin User",
        "email": "admin@aquaguard.io",
        "role": "Utility Dashboard Admin",
    },
]


# ---------------------------------------------------------------------------
# Sensor reading generator
# ---------------------------------------------------------------------------

def _generate_sensor_readings(pipeline_id: str, pressure: float, flow: float) -> list:
    """Generate 48 historical readings (one per 30 min) for a pipeline."""
    readings = []
    now = datetime.utcnow()
    rng = random.Random(hash(pipeline_id))

    pressure_sensor_id = f"PS-{pipeline_id[1:].zfill(2)}"
    flow_sensor_id = f"FS-{pipeline_id[1:].zfill(2)}"

    # Determine if offline (only FS-06 per original mock data)
    fs_offline = pipeline_id == "P06"

    for i in range(48):
        ts = now - timedelta(minutes=30 * (47 - i))

        # Small random drift around the seed value
        p_val = round(pressure + rng.uniform(-0.05, 0.05), 3)
        f_val = round(flow + rng.uniform(-1.5, 1.5), 2)

        readings.append(Sensor(
            sensor_id=pressure_sensor_id,
            pipeline_id=pipeline_id,
            sensor_type="pressure",
            value=max(0.0, p_val),
            unit="MPa",
            status="Online",
            timestamp=ts,
        ))
        readings.append(Sensor(
            sensor_id=flow_sensor_id,
            pipeline_id=pipeline_id,
            sensor_type="flow",
            value=max(0.0, f_val),
            unit="L/min",
            status="Offline" if fs_offline else "Online",
            timestamp=ts,
        ))

    return readings


# ---------------------------------------------------------------------------
# Main seeder
# ---------------------------------------------------------------------------

def seed():
    print("⏳  Creating database tables...")
    create_tables()

    db = SessionLocal()
    try:
        # Guard: skip if already seeded
        if db.query(Pipeline).count() > 0:
            print("✅  Database already seeded — skipping.")
            return

        print("🌱  Seeding pipelines...")
        for row in PIPELINES:
            p = Pipeline(
                pipeline_id=row[0],
                zone=row[1],
                location=row[2],
                pressure=row[3],
                flow=row[4],
                phi=row[5],
                leak_risk=row[6],
                time_to_failure=row[7],
                status=row[8],
            )
            db.add(p)
        db.commit()
        print(f"   ✔ {len(PIPELINES)} pipelines added")

        print("🌱  Seeding sensor readings...")
        total_sensors = 0
        for row in PIPELINES:
            readings = _generate_sensor_readings(row[0], row[3], row[4])
            for r in readings:
                db.add(r)
            total_sensors += len(readings)
        db.commit()
        print(f"   ✔ {total_sensors} sensor readings added ({total_sensors // len(PIPELINES)} per pipeline)")

        print("🌱  Seeding alerts...")
        for a in ALERTS:
            db.add(Alert(**a))
        db.commit()
        print(f"   ✔ {len(ALERTS)} alerts added")

        print("🌱  Seeding maintenance records...")
        for m in MAINTENANCE:
            db.add(Maintenance(**m))
        db.commit()
        print(f"   ✔ {len(MAINTENANCE)} maintenance records added")

        print("🌱  Seeding users...")
        for u in USERS:
            db.add(User(**u))
        db.commit()
        print(f"   ✔ {len(USERS)} users added")

        print("🌱  Seeding configuration...")
        db.add(Configuration(id=1))
        db.commit()
        print("   ✔ Default configuration added")

        print("\n✅  Seed complete! Start the server with:")
        print("       uvicorn app.main:app --reload")
        print("   Swagger docs: http://127.0.0.1:8000/docs\n")

    except Exception as e:
        db.rollback()
        print(f"\n❌  Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
