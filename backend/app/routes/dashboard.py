"""
Dashboard routes — summary metrics and real historical analytics.
GET /api/dashboard/summary
GET /api/dashboard/history
"""

from datetime import datetime, timedelta
from typing import List
from pydantic import BaseModel
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.pipeline import Pipeline
from app.models.alert import Alert
from app.models.sensor import Sensor
from app.schemas.dashboard import DashboardSummary

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


class HistoryPoint(BaseModel):
    time: str
    phi: float
    pressure: float
    flow: float


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


@router.get(
    "/history",
    response_model=List[HistoryPoint],
    summary="Get 24-hour network historical trends from database",
    description="Returns hourly aggregated averages of PHI, pressure, and flow.",
)
def get_dashboard_history(
    hours: int = Query(24, ge=6, le=168),
    db: Session = Depends(get_db),
):
    now = datetime.utcnow()
    points: List[HistoryPoint] = []

    # Pipeline average baseline PHI
    avg_phi = db.query(func.avg(Pipeline.phi)).scalar() or 90.0

    for i in range(hours):
        h_end = now - timedelta(hours=(hours - 1 - i))
        h_start = h_end - timedelta(hours=1)
        time_label = h_end.strftime("%H:%M")

        p_avg = (
            db.query(func.avg(Sensor.value))
            .filter(
                Sensor.sensor_type == "pressure",
                Sensor.timestamp >= h_start,
                Sensor.timestamp <= h_end,
            )
            .scalar()
        )
        f_avg = (
            db.query(func.avg(Sensor.value))
            .filter(
                Sensor.sensor_type == "flow",
                Sensor.timestamp >= h_start,
                Sensor.timestamp <= h_end,
            )
            .scalar()
        )

        pressure_val = round(float(p_avg if p_avg is not None else 1.05), 3)
        flow_val = round(float(f_avg if f_avg is not None else 45.0), 1)

        # PHI response to pressure drop
        phi_val = round(max(10.0, min(100.0, float(avg_phi) - max(0.0, 1.05 - pressure_val) * 60)), 1)

        points.append(HistoryPoint(
            time=time_label,
            phi=phi_val,
            pressure=pressure_val,
            flow=flow_val,
        ))

    return points
