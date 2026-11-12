"""
AquaGuard AI — Telemetry & Predictive Ingestion Service

Orchestrates the live IoT ingestion pipeline:
1. Ingests raw sensor readings (pressure, flow, etc.) into the Sensor table.
2. Updates pipeline segment current hydraulic state.
3. Invokes the trained ML hybrid model (predict_pipeline_risk) to calculate:
   - Supervised leak probability
   - Unsupervised anomaly score
   - Fault severity
   - Remaining Useful Life (RUL hours)
   - Segment-specific TreeSHAP feature explanations
4. Updates Pipeline health metrics (PHI, leak_risk, time_to_failure, status).
5. Compares against alert thresholds in Configuration and automatically manages
   the Alert lifecycle (creates new early warning alerts, updates existing active
   alerts, or auto-resolves when pipeline condition returns to healthy nominal state).
"""

import json
from datetime import datetime
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.pipeline import Pipeline
from app.models.sensor import Sensor
from app.models.alert import Alert
from app.models.configuration import Configuration
from app.services.prediction_service import predict_pipeline_risk
from app.services.phi_service import calculate_phi, phi_to_status


def _get_configuration(db: Session) -> Configuration:
    config = db.query(Configuration).filter(Configuration.id == 1).first()
    if not config:
        config = Configuration(id=1)
        db.add(config)
        db.commit()
        db.refresh(config)
    return config


def _generate_next_alert_id(db: Session) -> str:
    """Generate next sequential alert ID e.g. A006."""
    latest_alert = db.query(Alert).order_by(Alert.id.desc()).first()
    if not latest_alert or not latest_alert.alert_id.startswith("A"):
        return "A001"
    try:
        current_num = int(latest_alert.alert_id[1:])
        return f"A{str(current_num + 1).zfill(3)}"
    except ValueError:
        return f"A{db.query(Alert).count() + 1:03d}"


def process_telemetry_reading(
    db: Session,
    sensor_id: str,
    pipeline_id: str,
    sensor_type: str,
    value: float,
    unit: str,
    status: str = "Online",
    timestamp: Optional[datetime] = None,
    extra_features: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Ingest a single sensor reading and execute the predictive intelligence pipeline.
    """
    now = timestamp or datetime.utcnow()
    extra_features = extra_features or {}

    # 1. Ingest reading into Sensor table
    reading = Sensor(
        sensor_id=sensor_id,
        pipeline_id=pipeline_id,
        sensor_type=sensor_type,
        value=round(float(value), 3),
        unit=unit,
        status=status,
        timestamp=now,
    )
    db.add(reading)

    # 2. Update pipeline segment current hydraulic state
    pipeline = db.query(Pipeline).filter(Pipeline.pipeline_id == pipeline_id).first()
    if not pipeline:
        db.commit()
        db.refresh(reading)
        return {"reading": reading, "pipeline": None, "alert": None}

    if sensor_type.lower() == "pressure":
        pipeline.pressure = round(float(value), 3)
    elif sensor_type.lower() == "flow":
        pipeline.flow = round(float(value), 2)

    # 3. Execute ML Inference
    pred = predict_pipeline_risk(
        pipeline_id=pipeline.pipeline_id,
        pressure=pipeline.pressure,
        flow=pipeline.flow,
        pipe_age_years=getattr(pipeline, "pipe_age_years", 18.0),
        diameter_mm=getattr(pipeline, "diameter_mm", 200),
        corrosion_index=getattr(pipeline, "corrosion_index", 0.20),
        **extra_features,
    )

    # 4. Update Pipeline health fields
    pipeline.leak_risk = pred["risk_score"]
    pipeline.time_to_failure = pred["time_to_failure"]
    pipeline.phi = calculate_phi(pred["risk_score"], pipeline.pressure, pipeline.flow)
    pipeline.status = phi_to_status(pipeline.phi)
    pipeline.last_updated = now

    # 5. Alert Threshold Management
    config = _get_configuration(db)
    triggered_alert = None

    # Determine if an alert should be triggered based on configuration
    is_critical = pred["risk_score"] >= config.critical_risk_min
    is_high = pred["risk_score"] >= config.high_risk_max
    is_elevated = pred["risk_score"] >= config.medium_risk_max

    # Query for existing Active / Acknowledged alert for this pipeline
    existing_alert = (
        db.query(Alert)
        .filter(
            Alert.pipeline_id == pipeline_id,
            Alert.status.in_(["Active", "Acknowledged"]),
        )
        .order_by(Alert.created_at.desc())
        .first()
    )

    if (is_critical and config.critical_alerts_enabled) or is_high or is_elevated:
        priority_label = "Critical" if is_critical else ("High" if is_high else "Medium")
        shap_json = json.dumps(pred["shap_explanation"])
        top_driver = pred["shap_explanation"][0]["feature"] if pred["shap_explanation"] else "Abnormal hydraulics"

        if existing_alert:
            existing_alert.risk_score = pred["risk_score"]
            existing_alert.risk_level = pred["risk_level"]
            existing_alert.priority = priority_label
            existing_alert.shap_explanation = shap_json
            existing_alert.recommended_action = pred["recommended_action"]
            existing_alert.description = (
                f"Elevated risk ({pred['risk_score']}%) detected on {pipeline_id} ({pipeline.zone}). "
                f"Dominant contributing indicator: {top_driver}. Model confidence: {pred['confidence']}%."
            )
            triggered_alert = existing_alert
        else:
            alert_id = _generate_next_alert_id(db)
            new_alert = Alert(
                alert_id=alert_id,
                pipeline_id=pipeline_id,
                risk_level=pred["risk_level"],
                risk_score=pred["risk_score"],
                title=f"{priority_label} leak vulnerability — {pipeline_id} ({pipeline.zone})",
                description=(
                    f"Predictive maintenance engine flagged {pipeline_id} with {pred['risk_score']}% leak risk. "
                    f"Estimated RUL: {pred['time_to_failure']}. Top driver: {top_driver}."
                ),
                shap_explanation=shap_json,
                recommended_action=pred["recommended_action"],
                priority=priority_label,
                status="Active",
                created_at=now,
            )
            db.add(new_alert)
            triggered_alert = new_alert
    else:
        # If risk is below warning threshold and an active alert exists, auto-resolve it
        if existing_alert and pred["risk_score"] < config.low_risk_max:
            existing_alert.status = "Resolved"
            existing_alert.resolved_at = now
            existing_alert.description += " [Auto-resolved: sensor telemetry returned to nominal healthy envelope]"
            triggered_alert = existing_alert

    db.commit()
    db.refresh(reading)
    db.refresh(pipeline)
    if triggered_alert:
        db.refresh(triggered_alert)

    return {
        "reading": reading,
        "pipeline": pipeline,
        "prediction": pred,
        "alert": triggered_alert,
    }

