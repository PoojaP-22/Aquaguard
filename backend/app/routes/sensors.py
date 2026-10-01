"""
Sensor routes — ingest and query sensor readings.

GET  /api/sensors                           list latest reading per sensor
GET  /api/sensors/{pipeline_id}             latest readings for a pipeline
POST /api/sensors                           ingest a new reading
GET  /api/sensors/{pipeline_id}/history     historical readings (with limit)
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.sensor import Sensor
from app.schemas.sensor import SensorCreate, SensorOut

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
    # Subquery: max timestamp per sensor_id
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
# POST /api/sensors  — ingest a new sensor reading
# ---------------------------------------------------------------------------
@router.post(
    "",
    response_model=SensorOut,
    status_code=201,
    summary="Ingest a new sensor reading",
)
def create_sensor_reading(payload: SensorCreate, db: Session = Depends(get_db)):
    reading = Sensor(**payload.model_dump())
    db.add(reading)
    db.commit()
    db.refresh(reading)
    return reading


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
