"""
Pipeline routes — CRUD for pipeline segments.

GET    /api/pipelines                  list all (filter by status / zone)
GET    /api/pipelines/{pipeline_id}    get one pipeline
POST   /api/pipelines                  create pipeline
PUT    /api/pipelines/{pipeline_id}    update pipeline
DELETE /api/pipelines/{pipeline_id}    delete pipeline
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.pipeline import Pipeline
from app.schemas.pipeline import PipelineCreate, PipelineUpdate, PipelineOut

router = APIRouter(prefix="/api/pipelines", tags=["Pipelines"])


# ---------------------------------------------------------------------------
# GET /api/pipelines
# ---------------------------------------------------------------------------
@router.get(
    "",
    response_model=List[PipelineOut],
    summary="List all pipelines",
    description="Returns all pipelines. Filter by `status` and/or `zone`.",
)
def list_pipelines(
    status: Optional[str] = Query(None, description="Filter by status e.g. Critical"),
    zone: Optional[str] = Query(None, description="Filter by zone e.g. North Zone"),
    db: Session = Depends(get_db),
):
    q = db.query(Pipeline)
    if status:
        q = q.filter(Pipeline.status == status)
    if zone:
        q = q.filter(Pipeline.zone == zone)
    return q.order_by(Pipeline.pipeline_id).all()


# ---------------------------------------------------------------------------
# GET /api/pipelines/{pipeline_id}
# ---------------------------------------------------------------------------
@router.get(
    "/{pipeline_id}",
    response_model=PipelineOut,
    summary="Get a single pipeline",
)
def get_pipeline(pipeline_id: str, db: Session = Depends(get_db)):
    pipeline = db.query(Pipeline).filter(Pipeline.pipeline_id == pipeline_id).first()
    if not pipeline:
        raise HTTPException(status_code=404, detail=f"Pipeline '{pipeline_id}' not found")
    return pipeline


# ---------------------------------------------------------------------------
# POST /api/pipelines
# ---------------------------------------------------------------------------
@router.post(
    "",
    response_model=PipelineOut,
    status_code=201,
    summary="Create a new pipeline",
)
def create_pipeline(payload: PipelineCreate, db: Session = Depends(get_db)):
    existing = db.query(Pipeline).filter(Pipeline.pipeline_id == payload.pipeline_id).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Pipeline '{payload.pipeline_id}' already exists")

    pipeline = Pipeline(**payload.model_dump())
    db.add(pipeline)
    db.commit()
    db.refresh(pipeline)
    return pipeline


# ---------------------------------------------------------------------------
# PUT /api/pipelines/{pipeline_id}
# ---------------------------------------------------------------------------
@router.put(
    "/{pipeline_id}",
    response_model=PipelineOut,
    summary="Update a pipeline",
)
def update_pipeline(
    pipeline_id: str,
    payload: PipelineUpdate,
    db: Session = Depends(get_db),
):
    pipeline = db.query(Pipeline).filter(Pipeline.pipeline_id == pipeline_id).first()
    if not pipeline:
        raise HTTPException(status_code=404, detail=f"Pipeline '{pipeline_id}' not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(pipeline, field, value)

    db.commit()
    db.refresh(pipeline)
    return pipeline


# ---------------------------------------------------------------------------
# DELETE /api/pipelines/{pipeline_id}
# ---------------------------------------------------------------------------
@router.delete(
    "/{pipeline_id}",
    status_code=204,
    summary="Delete a pipeline",
)
def delete_pipeline(pipeline_id: str, db: Session = Depends(get_db)):
    pipeline = db.query(Pipeline).filter(Pipeline.pipeline_id == pipeline_id).first()
    if not pipeline:
        raise HTTPException(status_code=404, detail=f"Pipeline '{pipeline_id}' not found")
    db.delete(pipeline)
    db.commit()
