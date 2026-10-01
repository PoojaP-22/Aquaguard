"""
Maintenance routes — track maintenance work on pipelines.

GET  /api/maintenance           list all records
GET  /api/maintenance/{id}      get one record
POST /api/maintenance           create a record
PUT  /api/maintenance/{id}      update a record
"""

from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.maintenance import Maintenance
from app.schemas.maintenance import MaintenanceCreate, MaintenanceUpdate, MaintenanceOut

router = APIRouter(prefix="/api/maintenance", tags=["Maintenance"])


# ---------------------------------------------------------------------------
# GET /api/maintenance
# ---------------------------------------------------------------------------
@router.get(
    "",
    response_model=List[MaintenanceOut],
    summary="List maintenance records",
    description="Returns maintenance records. Optionally filter by `pipeline_id` or `status`.",
)
def list_maintenance(
    pipeline_id: Optional[str] = Query(None, description="Filter by pipeline e.g. P04"),
    status: Optional[str] = Query(None, description="Pending | In Progress | Completed"),
    db: Session = Depends(get_db),
):
    q = db.query(Maintenance)
    if pipeline_id:
        q = q.filter(Maintenance.pipeline_id == pipeline_id)
    if status:
        q = q.filter(Maintenance.status == status)
    return q.order_by(Maintenance.created_at.desc()).all()


# ---------------------------------------------------------------------------
# GET /api/maintenance/{id}
# ---------------------------------------------------------------------------
@router.get(
    "/{record_id}",
    response_model=MaintenanceOut,
    summary="Get a single maintenance record",
)
def get_maintenance(record_id: int, db: Session = Depends(get_db)):
    record = db.query(Maintenance).filter(Maintenance.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail=f"Maintenance record {record_id} not found")
    return record


# ---------------------------------------------------------------------------
# POST /api/maintenance
# ---------------------------------------------------------------------------
@router.post(
    "",
    response_model=MaintenanceOut,
    status_code=201,
    summary="Create a maintenance record",
)
def create_maintenance(payload: MaintenanceCreate, db: Session = Depends(get_db)):
    record = Maintenance(**payload.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


# ---------------------------------------------------------------------------
# PUT /api/maintenance/{id}
# ---------------------------------------------------------------------------
@router.put(
    "/{record_id}",
    response_model=MaintenanceOut,
    summary="Update a maintenance record",
    description="Update fields including status. Auto-sets `completed_at` when status → Completed.",
)
def update_maintenance(
    record_id: int,
    payload: MaintenanceUpdate,
    db: Session = Depends(get_db),
):
    record = db.query(Maintenance).filter(Maintenance.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail=f"Maintenance record {record_id} not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(record, field, value)

    # Auto-set completed_at when status moves to Completed
    if payload.status == "Completed" and record.completed_at is None:
        record.completed_at = datetime.utcnow()

    db.commit()
    db.refresh(record)
    return record
