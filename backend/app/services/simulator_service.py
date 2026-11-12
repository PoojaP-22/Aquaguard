"""
AquaGuard AI — Sensor Simulator & Demonstration Service

Provides controlled synthetic IoT telemetry generation and interactive fault injection
for live technical demonstrations and verification when hardware sensors are unavailable.

Key capabilities:
1. Real-time hydraulic simulation across all 12 pipeline assets.
2. Controlled fault injection (sudden pressure drop, gradual leak degradation, flow blockage).
3. Automated telemetry propagation through the ML predictive inference pipeline.
4. Clean reset mechanism restoring the entire network to 100% healthy nominal state.
"""

from datetime import datetime, timedelta
import random
import math
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from app.models.pipeline import Pipeline
from app.models.alert import Alert
from app.services.telemetry_service import process_telemetry_reading

# In-memory simulator registry
_SIMULATOR_STATE = {
    "tick_count": 0,
    "last_tick_time": None,
    "active_faults": {},  # pipeline_id -> {"type": ..., "severity": ...}
    "is_auto_running": False,
    "mode": "Demonstration Simulation",
}

NOMINAL_PROFILES = {
    "P01": {"pressure": 1.18, "flow": 49.0, "age": 12.0, "diameter": 250, "corrosion": 0.12},
    "P02": {"pressure": 1.15, "flow": 47.5, "age": 14.0, "diameter": 200, "corrosion": 0.15},
    "P03": {"pressure": 1.10, "flow": 46.0, "age": 18.0, "diameter": 200, "corrosion": 0.18},
    "P04": {"pressure": 1.08, "flow": 45.0, "age": 28.0, "diameter": 150, "corrosion": 0.45},
    "P05": {"pressure": 1.12, "flow": 46.5, "age": 20.0, "diameter": 200, "corrosion": 0.22},
    "P06": {"pressure": 1.14, "flow": 47.0, "age": 15.0, "diameter": 200, "corrosion": 0.16},
    "P07": {"pressure": 1.09, "flow": 45.8, "age": 22.0, "diameter": 200, "corrosion": 0.25},
    "P08": {"pressure": 1.16, "flow": 48.0, "age": 10.0, "diameter": 250, "corrosion": 0.10},
    "P09": {"pressure": 1.11, "flow": 46.2, "age": 19.0, "diameter": 150, "corrosion": 0.21},
    "P10": {"pressure": 1.13, "flow": 47.1, "age": 16.0, "diameter": 200, "corrosion": 0.17},
    "P11": {"pressure": 1.07, "flow": 45.2, "age": 25.0, "diameter": 150, "corrosion": 0.35},
    "P12": {"pressure": 1.17, "flow": 48.5, "age": 11.0, "diameter": 250, "corrosion": 0.11},
}


def get_simulator_status() -> Dict[str, Any]:
    return {
        "mode": _SIMULATOR_STATE["mode"],
        "tick_count": _SIMULATOR_STATE["tick_count"],
        "last_tick_time": _SIMULATOR_STATE["last_tick_time"].isoformat() if _SIMULATOR_STATE["last_tick_time"] else None,
        "active_faults": _SIMULATOR_STATE["active_faults"],
        "is_auto_running": _SIMULATOR_STATE["is_auto_running"],
        "healthy_pipelines_count": 12 - len(_SIMULATOR_STATE["active_faults"]),
    }


def set_auto_running(status: bool) -> bool:
    _SIMULATOR_STATE["is_auto_running"] = status
    return _SIMULATOR_STATE["is_auto_running"]


def inject_fault(
    db: Session,
    pipeline_id: str,
    fault_type: str = "leak_pressure_drop",
    severity: float = 0.85,
) -> Dict[str, Any]:
    """
    Inject a simulated hydraulic anomaly into a target pipeline and propagate telemetry.
    """
    pipeline = db.query(Pipeline).filter(Pipeline.pipeline_id == pipeline_id).first()
    if not pipeline:
        raise ValueError(f"Pipeline {pipeline_id} not found")

    _SIMULATOR_STATE["active_faults"][pipeline_id] = {
        "type": fault_type,
        "severity": max(0.1, min(1.0, float(severity))),
        "injected_at": datetime.utcnow().isoformat(),
    }

    # Immediately generate anomalous readings for this pipeline
    result = step_pipeline(db, pipeline_id, timestamp=datetime.utcnow())
    return {
        "status": "Fault injected successfully",
        "pipeline_id": pipeline_id,
        "fault": _SIMULATOR_STATE["active_faults"][pipeline_id],
        "updated_state": {
            "pressure": result["pipeline"].pressure,
            "flow": result["pipeline"].flow,
            "phi": result["pipeline"].phi,
            "leak_risk": result["pipeline"].leak_risk,
            "status": result["pipeline"].status,
        },
        "alert": result["alert"].alert_id if result.get("alert") else None,
    }


def clear_fault(db: Session, pipeline_id: str) -> Dict[str, Any]:
    """Remove fault from a pipeline and restore nominal telemetry."""
    if pipeline_id in _SIMULATOR_STATE["active_faults"]:
        del _SIMULATOR_STATE["active_faults"][pipeline_id]

    profile = NOMINAL_PROFILES.get(pipeline_id, {"pressure": 1.12, "flow": 46.0})
    result_p = process_telemetry_reading(
        db=db,
        sensor_id=f"PS-{pipeline_id[1:].zfill(2)}",
        pipeline_id=pipeline_id,
        sensor_type="pressure",
        value=profile["pressure"],
        unit="MPa",
        status="Online",
        timestamp=datetime.utcnow(),
    )
    result_f = process_telemetry_reading(
        db=db,
        sensor_id=f"FS-{pipeline_id[1:].zfill(2)}",
        pipeline_id=pipeline_id,
        sensor_type="flow",
        value=profile["flow"],
        unit="L/min",
        status="Online",
        timestamp=datetime.utcnow(),
    )
    return {
        "status": f"Fault cleared for {pipeline_id}",
        "pipeline_id": pipeline_id,
        "updated_state": {
            "pressure": result_f["pipeline"].pressure,
            "flow": result_f["pipeline"].flow,
            "phi": result_f["pipeline"].phi,
            "leak_risk": result_f["pipeline"].leak_risk,
            "status": result_f["pipeline"].status,
        },
    }


def reset_simulation(db: Session) -> Dict[str, Any]:
    """
    Restore all 12 pipelines to 100% healthy nominal state and resolve active alerts.
    """
    _SIMULATOR_STATE["active_faults"].clear()
    _SIMULATOR_STATE["tick_count"] = 0
    now = datetime.utcnow()

    # Mark all active/acknowledged alerts as Resolved
    active_alerts = db.query(Alert).filter(Alert.status.in_(["Active", "Acknowledged"])).all()
    for a in active_alerts:
        a.status = "Resolved"
        a.resolved_at = now
        a.description += " [Resolved during network restoration]"

    pipelines = db.query(Pipeline).all()
    for p in pipelines:
        prof = NOMINAL_PROFILES.get(p.pipeline_id, {"pressure": 1.12, "flow": 46.0})
        # Record nominal sensor readings
        process_telemetry_reading(
            db=db,
            sensor_id=f"PS-{p.pipeline_id[1:].zfill(2)}",
            pipeline_id=p.pipeline_id,
            sensor_type="pressure",
            value=prof["pressure"],
            unit="MPa",
            status="Online",
            timestamp=now,
        )
        process_telemetry_reading(
            db=db,
            sensor_id=f"FS-{p.pipeline_id[1:].zfill(2)}",
            pipeline_id=p.pipeline_id,
            sensor_type="flow",
            value=prof["flow"],
            unit="L/min",
            status="Online",
            timestamp=now,
        )

    db.commit()
    _SIMULATOR_STATE["last_tick_time"] = now
    return {
        "status": "All pipelines restored to healthy nominal operation",
        "active_faults_count": 0,
        "alerts_resolved": len(active_alerts),
        "timestamp": now.isoformat(),
    }


def step_pipeline(db: Session, pipeline_id: str, timestamp: Optional[datetime] = None) -> Dict[str, Any]:
    """Generate and ingest a telemetry step for a single pipeline."""
    now = timestamp or datetime.utcnow()
    prof = NOMINAL_PROFILES.get(pipeline_id, {"pressure": 1.12, "flow": 46.0})
    fault = _SIMULATOR_STATE["active_faults"].get(pipeline_id)

    # Base diurnal oscillation
    t = _SIMULATOR_STATE["tick_count"]
    diurnal = 0.025 * math.sin(t * 0.2)
    p_noise = random.uniform(-0.015, 0.015)
    f_noise = random.uniform(-0.6, 0.6)

    target_pressure = prof["pressure"] + diurnal + p_noise
    target_flow = prof["flow"] + (diurnal * 15) + f_noise

    extra_features = {
        "vibration_rms": 2.1 + random.uniform(-0.2, 0.2),
        "acoustic_rms": 3.0 + random.uniform(-0.3, 0.3),
        "turbidity_ntu": 2.0 + random.uniform(-0.2, 0.2),
        "ambient_temp_c": 24.5 + random.uniform(-0.5, 0.5),
        "sensor_missing_count": 0,
    }

    if fault:
        sev = fault["severity"]
        # Simulate hydraulic rupture / leak physics
        target_pressure = max(0.45, target_pressure - (0.42 * sev))
        target_flow = max(20.0, target_flow - (10.0 * sev))
        extra_features["vibration_rms"] = 2.1 + (7.0 * sev) + random.uniform(-0.2, 0.4)
        extra_features["acoustic_rms"] = 3.0 + (10.0 * sev) + random.uniform(-0.3, 0.5)
        extra_features["turbidity_ntu"] = 2.0 + (12.0 * sev) + random.uniform(-0.4, 0.6)

    # Ingest pressure reading
    p_res = process_telemetry_reading(
        db=db,
        sensor_id=f"PS-{pipeline_id[1:].zfill(2)}",
        pipeline_id=pipeline_id,
        sensor_type="pressure",
        value=target_pressure,
        unit="MPa",
        status="Online",
        timestamp=now,
        extra_features=extra_features,
    )

    # Ingest flow reading
    f_res = process_telemetry_reading(
        db=db,
        sensor_id=f"FS-{pipeline_id[1:].zfill(2)}",
        pipeline_id=pipeline_id,
        sensor_type="flow",
        value=target_flow,
        unit="L/min",
        status="Online",
        timestamp=now,
        extra_features=extra_features,
    )

    return f_res


def step_all(db: Session, step_interval_minutes: int = 15) -> Dict[str, Any]:
    """Advance simulation by 1 tick for all monitored pipelines."""
    now = datetime.utcnow()
    _SIMULATOR_STATE["tick_count"] += 1
    _SIMULATOR_STATE["last_tick_time"] = now

    pipelines = db.query(Pipeline).order_by(Pipeline.pipeline_id).all()
    results = []
    for p in pipelines:
        res = step_pipeline(db, p.pipeline_id, timestamp=now)
        results.append({
            "pipeline_id": p.pipeline_id,
            "pressure": res["pipeline"].pressure,
            "flow": res["pipeline"].flow,
            "phi": res["pipeline"].phi,
            "risk_score": res["pipeline"].leak_risk,
            "status": res["pipeline"].status,
        })

    return {
        "tick": _SIMULATOR_STATE["tick_count"],
        "timestamp": now.isoformat(),
        "pipelines_updated": len(results),
        "active_faults": list(_SIMULATOR_STATE["active_faults"].keys()),
        "summary": results,
    }

