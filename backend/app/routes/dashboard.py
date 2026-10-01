"""
Dashboard routes — summary metrics for the main dashboard view.
GET /api/dashboard/summary
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.pipeline import Pipeline
from app.models.alert import Alert
from app.models.sensor import Sensor
from app.schemas.dashboard import DashboardSummary

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get(
    "/summary",
    response_model=DashboardSummary,
    summary="Get dashboard summary metrics",
    description=(
        "Returns aggregated metrics: average PHI, pipeline count, "
        "active alert count, average leak risk, and sensor online counts."
    ),
)
def get_dashboard_summary(db: Session = Depends(get_db)):
    # --- Pipeline metrics ---
    pipeline_stats = db.query(
        func.count(Pipeline.id).label("total"),
        func.avg(Pipeline.phi).label("avg_phi"),
        func.avg(Pipeline.leak_risk).label("avg_risk"),
    ).first()

    total_pipelines = pipeline_stats.total or 0
    avg_phi = round(float(pipeline_stats.avg_phi or 0), 1)
    avg_risk = round(float(pipeline_stats.avg_risk or 0), 1)

    # --- Active alerts ---
    active_alerts = db.query(func.count(Alert.id)).filter(
        Alert.status == "Active"
    ).scalar() or 0

    # --- Sensor counts: latest reading per sensor_id ---
    # Subquery: get max timestamp per sensor_id
    latest_ts = (
        db.query(
            Sensor.sensor_id,
            func.max(Sensor.timestamp).label("max_ts"),
        )
        .group_by(Sensor.sensor_id)
        .subquery()
    )

    latest_sensors = (
        db.query(Sensor)
        .join(
            latest_ts,
            (Sensor.sensor_id == latest_ts.c.sensor_id)
            & (Sensor.timestamp == latest_ts.c.max_ts),
        )
        .all()
    )

    total_sensors = len(latest_sensors)
    sensors_online = sum(1 for s in latest_sensors if s.status == "Online")

    return DashboardSummary(
        pipeline_health=avg_phi,
        monitored_pipelines=total_pipelines,
        active_alerts=active_alerts,
        leak_risk=avg_risk,
        sensors_online=sensors_online,
        total_sensors=total_sensors,
    )
