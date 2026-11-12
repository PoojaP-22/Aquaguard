"""
Sensor routes — ingest and query sensor readings.

GET  /api/sensors                           list latest reading per sensor
GET  /api/sensors/recent/all                recent readings across all pipelines
GET  /api/sensors/export/csv                export historical readings to CSV
GET  /api/sensors/{pipeline_id}             latest readings for a pipeline
POST /api/sensors                           ingest a new reading (triggers ML pipeline)
GET  /api/sensors/{pipeline_id}/history     historical readings (with limit)
"""

import io
import csv
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.sensor import Sensor
from app.schemas.sensor import SensorCreate, SensorOut
from app.services.telemetry_service import process_telemetry_reading

router = APIRouter(prefix="/api/sensors", tags=["Sensors"])


# ---------------------------------------------------------------------------
# GET /api/sensors  — latest reading per sensor
# ---------------------------------------------------------------------------
@router.get(
    "",
    response_model=List[SensorOut],
    summary="List latest reading for every sensor",
)
def list_sensors(db: Session = Depends(get_db)):
    latest_ts = (
        db.query(
            Sensor.sensor_id,
            func.max(Sensor.timestamp).label("max_ts"),
        )
        .group_by(Sensor.sensor_id)
        .subquery()
    )

    sensors = (
        db.query(Sensor)
        .join(
            latest_ts,
            (Sensor.sensor_id == latest_ts.c.sensor_id)
            & (Sensor.timestamp == latest_ts.c.max_ts),
        )
        .order_by(Sensor.sensor_id)
        .all()
    )
    return sensors


# ---------------------------------------------------------------------------
# GET /api/sensors/recent/all  — recent readings across all pipelines
# ---------------------------------------------------------------------------
@router.get(
    "/recent/all",
    response_model=List[SensorOut],
    summary="Get recent sensor readings across all pipelines",
)
def get_recent_all(
    limit: int = Query(50, ge=1, le=500),
    db: Session = Depends(get_db),
):
    return db.query(Sensor).order_by(Sensor.timestamp.desc()).limit(limit).all()


# ---------------------------------------------------------------------------
# GET /api/sensors/export/csv  — export historical readings
# ---------------------------------------------------------------------------
@router.get(
    "/export/csv",
    summary="Export historical sensor telemetry as CSV",
)
def export_sensors_csv(
    limit: int = Query(2000, ge=1, le=10000),
    pipeline_id: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(Sensor)
    if pipeline_id:
        q = q.filter(Sensor.pipeline_id == pipeline_id)
    records = q.order_by(Sensor.timestamp.desc()).limit(limit).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Timestamp", "SensorID", "PipelineID", "SensorType", "Value", "Unit", "Status"])
    for r in records:
        writer.writerow([
            r.timestamp.isoformat() if r.timestamp else "",
            r.sensor_id,
            r.pipeline_id,
            r.sensor_type,
            r.value,
            r.unit,
            r.status,
        ])

    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": 'attachment; filename="aquaguard_sensor_telemetry.csv"'},
    )


# ---------------------------------------------------------------------------
# GET /api/sensors/{pipeline_id}  — latest readings for one pipeline
# ---------------------------------------------------------------------------
@router.get(
    "/{pipeline_id}",
    response_model=List[SensorOut],
    summary="Get latest sensor readings for a pipeline",
)
def get_pipeline_sensors(pipeline_id: str, db: Session = Depends(get_db)):
    latest_ts = (
        db.query(
            Sensor.sensor_id,
            func.max(Sensor.timestamp).label("max_ts"),
        )
        .filter(Sensor.pipeline_id == pipeline_id)
        .group_by(Sensor.sensor_id)
        .subquery()
    )

    sensors = (
        db.query(Sensor)
        .join(
            latest_ts,
            (Sensor.sensor_id == latest_ts.c.sensor_id)
            & (Sensor.timestamp == latest_ts.c.max_ts),
        )
        .all()
    )

    if not sensors:
        raise HTTPException(status_code=404, detail=f"No sensors found for pipeline '{pipeline_id}'")
    return sensors


# ---------------------------------------------------------------------------
# POST /api/sensors  — ingest a new sensor reading with full ML processing
# ---------------------------------------------------------------------------
@router.post(
    "",
    response_model=SensorOut,
    status_code=201,
    summary="Ingest a new sensor reading",
    description="Ingests telemetry, updates pipeline hydraulics, executes ML risk evaluation, and triggers alerts.",
)
def create_sensor_reading(payload: SensorCreate, db: Session = Depends(get_db)):
    result = process_telemetry_reading(
        db=db,
        sensor_id=payload.sensor_id,
        pipeline_id=payload.pipeline_id,
        sensor_type=payload.sensor_type,
        value=payload.value,
        unit=payload.unit,
        status=payload.status,
    )
    return result["reading"]


# ---------------------------------------------------------------------------
# GET /api/sensors/{pipeline_id}/history
# ---------------------------------------------------------------------------
@router.get(
    "/{pipeline_id}/history",
    response_model=List[SensorOut],
    summary="Get historical sensor readings for a pipeline",
    description="Returns up to `limit` most recent readings for the pipeline.",
)
def get_sensor_history(
    pipeline_id: str,
    limit: int = Query(100, ge=1, le=1000, description="Max number of readings to return"),
    sensor_type: Optional[str] = Query(None, description="Filter by sensor_type: pressure | flow"),
    db: Session = Depends(get_db),
):
    q = db.query(Sensor).filter(Sensor.pipeline_id == pipeline_id)
    if sensor_type:
        q = q.filter(Sensor.sensor_type == sensor_type)
    readings = q.order_by(Sensor.timestamp.desc()).limit(limit).all()
    if not readings:
        raise HTTPException(
            status_code=404,
            detail=f"No sensor history found for pipeline '{pipeline_id}'"
        )
    return readings
