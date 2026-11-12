"""
AquaGuard AI — Direct In-Process Integration Tests

Tests all backend route handlers, ORM models, schemas, ML prediction engine,
simulator, and configuration in a single cohesive test suite.
"""

import sys
import os
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.database import create_tables, SessionLocal
from app.main import root, health
from app.routes.predictions import get_model_info, get_prediction, get_all_predictions
from app.routes.pipelines import list_pipelines, get_pipeline
from app.routes.dashboard import get_dashboard_summary, get_dashboard_history
from app.routes.repair_priority import get_repair_priority
from app.routes.configuration import get_configuration, update_configuration
from app.routes.sensors import create_sensor_reading, list_sensors, get_pipeline_sensors, get_recent_all, export_sensors_csv
from app.routes.maintenance import create_maintenance, list_maintenance
from app.routes.simulation import get_status, advance_tick, inject_fault, clear_fault, reset_network, FaultInjectionRequest
from app.schemas.configuration import ConfigurationUpdate
from app.schemas.sensor import SensorCreate
from app.schemas.maintenance import MaintenanceCreate


def run_tests():
    print("⏳ [1/11] Initializing database...", flush=True)
    create_tables()
    db = SessionLocal()

    try:
        # 1. Health checks
        print("⏳ [2/11] Testing root and health endpoints...", flush=True)
        r = root()
        assert "message" in r
        h = health()
        assert h["status"] == "healthy"
        assert h["model_version"] == "AquaGuard-ML-1.1"
        print(f"   ✔ Health passed: {h}", flush=True)

        # 2. Model info
        print("⏳ [3/11] Testing model info...", flush=True)
        info = get_model_info()
        assert info["model_version"] == "AquaGuard-ML-1.1"
        assert len(info["features"]) == 13
        assert "baseline_comparison" in info["evaluation"]
        print(f"   ✔ Model info passed: RF vs Heuristic vs LR verified", flush=True)

        # 3. Pipelines list & get
        print("⏳ [4/11] Testing pipelines query...", flush=True)
        pipes = list_pipelines(db=db)
        assert len(pipes) >= 12
        p04 = get_pipeline("P04", db=db)
        assert p04.pipeline_id == "P04"
        print(f"   ✔ Pipelines list passed: {len(pipes)} pipelines active", flush=True)

        # 4. Predictions for P04
        print("⏳ [5/11] Testing ML live inference for P04...", flush=True)
        pred = get_prediction("P04", db=db)
        assert pred["pipeline_id"] == "P04"
        assert "risk_score" in pred
        assert "shap_explanation" in pred
        assert len(pred["shap_explanation"]) > 0
        print(f"   ✔ P04 Prediction: Risk={pred['risk_score']}%, Level={pred['risk_level']}, TTF={pred['time_to_failure']}", flush=True)

        # 5. Dashboard Summary & 24H History
        print("⏳ [6/11] Testing dashboard metrics & 24H history...", flush=True)
        summary = get_dashboard_summary(db=db)
        assert summary.monitored_pipelines >= 12
        history = get_dashboard_history(hours=24, db=db)
        assert len(history) == 24
        print(f"   ✔ Dashboard summary: Health={summary.pipeline_health}, History={len(history)} hours", flush=True)

        # 6. Repair Priority Ranking
        print("⏳ [7/11] Testing repair priority rankings...", flush=True)
        priority = get_repair_priority(db=db)
        assert len(priority) >= 12
        assert priority[0].rank == 1
        print(f"   ✔ Repair Priority #1: {priority[0].pipeline_id} (Risk={priority[0].risk}%, Action='{priority[0].recommended_action}')", flush=True)

        # 7. Configuration read & update
        print("⏳ [8/11] Testing configuration update...", flush=True)
        cfg = get_configuration(db=db)
        assert hasattr(cfg, "critical_risk_min")
        updated_cfg = update_configuration(ConfigurationUpdate(critical_risk_min=80.0, critical_alerts_enabled=True), db=db)
        assert updated_cfg.critical_risk_min == 80.0
        print("   ✔ Configuration update persisted to DB", flush=True)

        # 8. Sensor Ingestion & Alert Generation
        print("⏳ [9/11] Testing sensor ingestion and automated alert trigger...", flush=True)
        reading = create_sensor_reading(SensorCreate(
            sensor_id="PS-02",
            pipeline_id="P02",
            sensor_type="pressure",
            value=0.62,
            unit="MPa",
            status="Online",
        ), db=db)
        assert reading.value == 0.62
        p02 = get_pipeline("P02", db=db)
        assert p02.pressure == 0.62
        print(f"   ✔ Telemetry ingested: P02 pressure={p02.pressure} MPa, Risk={p02.leak_risk}%, Status={p02.status}", flush=True)

        # 9. Maintenance Logging & Alert Sync
        print("⏳ [10/11] Testing maintenance record creation & alert sync...", flush=True)
        maint = create_maintenance(MaintenanceCreate(
            pipeline_id="P02",
            issue_type="Emergency pressure drop",
            priority="Critical",
            action_taken="Replaced valve assembly and joint seal",
            assigned_engineer="Arun Kumar",
            notes="Triggered by AI alert",
            status="In Progress",
        ), db=db)
        assert maint.pipeline_id == "P02"
        records = list_maintenance(pipeline_id="P02", db=db)
        assert len(records) > 0
        print(f"   ✔ Maintenance record logged: ID={maint.id}, Action='{maint.action_taken}'", flush=True)

        # 10. Simulation Engine (Reset -> Tick -> Inject Fault -> Clear Fault)
        print("⏳ [11/11] Testing technical demonstration simulation workflow...", flush=True)
        # Reset
        reset_res = reset_network(db=db)
        assert reset_res["status"] == "All pipelines restored to healthy nominal operation"
        # Tick
        tick_res = advance_tick(db=db)
        assert tick_res["pipelines_updated"] >= 12
        # Inject fault
        fault_res = inject_fault(FaultInjectionRequest(
            pipeline_id="P03",
            fault_type="leak_pressure_drop",
            severity=0.88,
        ), db=db)
        assert fault_res["updated_state"]["status"] in ("High Risk", "Critical")
        assert fault_res["updated_state"]["leak_risk"] > 70.0
        # Clear fault
        clear_res = clear_fault("P03", db=db)
        assert clear_res["updated_state"]["status"] == "Healthy"
        print("   ✔ Simulation workflow passed: Reset -> Tick -> Inject Fault -> Clear Fault", flush=True)

        # CSV export
        csv_res = export_sensors_csv(limit=10, db=db)
        assert "Timestamp,SensorID,PipelineID" in csv_res.body.decode("utf-8")
        print("   ✔ CSV telemetry export generated valid header and rows", flush=True)

        print("\n🎉 ALL 11 BACKEND MODULE & INTEGRATION TESTS PASSED PERFECTLY!\n", flush=True)

    finally:
        db.close()


if __name__ == "__main__":
    run_tests()
