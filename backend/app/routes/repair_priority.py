"""
Repair Priority route — returns pipelines ranked by maintenance urgency.

GET /api/repair-priority
"""

from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.pipeline import Pipeline
from app.schemas.dashboard import RepairPriorityItem
from app.services.priority_service import calculate_repair_priority, PriorityInput

router = APIRouter(prefix="/api/repair-priority", tags=["Repair Priority"])


@router.get(
    "",
    response_model=List[RepairPriorityItem],
    summary="Get repair priority ranking",
    description=(
        "Returns all pipelines ranked by maintenance urgency. "
        "Score is computed from leak risk (50%), inverse PHI (30%), "
        "and time-to-failure urgency (20%). "
        "This is currently rule-based; ML predictions will replace it later."
    ),
)
def get_repair_priority(db: Session = Depends(get_db)):
    pipelines = db.query(Pipeline).all()

    inputs: List[PriorityInput] = [
        PriorityInput(
            pipeline_id=p.pipeline_id,
            zone=p.zone,
            leak_risk=p.leak_risk,
            phi=p.phi,
            time_to_failure=p.time_to_failure,
            status=p.status,
        )
        for p in pipelines
    ]

    ranked = calculate_repair_priority(inputs)
    return ranked
