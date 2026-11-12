"""
AquaGuard AI — Simulation & Technical Demonstration API Routes

Endpoints:
GET  /api/simulation/status          Current simulation status and active faults
POST /api/simulation/tick            Advance simulation by 1 time step across all pipelines
POST /api/simulation/inject-fault    Inject abnormal pressure drop / leak into a pipeline
POST /api/simulation/clear-fault     Clear fault on a pipeline and restore nominal telemetry
POST /api/simulation/reset           Reset entire network to healthy nominal state
POST /api/simulation/auto-toggle     Enable/disable continuous simulation ticking
"""

from typing import Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.simulator_service import (
    get_simulator_status,
    step_all,
    inject_fault as svc_inject_fault,
    clear_fault as svc_clear_fault,
    reset_simulation as svc_reset_simulation,
    set_auto_running,
)

router = APIRouter(prefix="/api/simulation", tags=["Simulation & Demo"])


class FaultInjectionRequest(BaseModel):
    pipeline_id: str = Field(..., examples=["P04"])
    fault_type: str = Field("leak_pressure_drop", examples=["leak_pressure_drop"])
    severity: float = Field(0.85, ge=0.1, le=1.0, examples=[0.85])


class AutoToggleRequest(BaseModel):
    enabled: bool = Field(..., examples=[True])


@router.get("/status", summary="Get simulation engine status")
def get_status():
    return get_simulator_status()


@router.post("/tick", summary="Advance simulation by 1 step for all pipelines")
def advance_tick(db: Session = Depends(get_db)):
    return step_all(db)


@router.post("/inject-fault", summary="Inject hydraulic fault on a pipeline")
def inject_fault(payload: FaultInjectionRequest, db: Session = Depends(get_db)):
    try:
        return svc_inject_fault(
            db=db,
            pipeline_id=payload.pipeline_id,
            fault_type=payload.fault_type,
            severity=payload.severity,
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/clear-fault/{pipeline_id}", summary="Clear fault on a pipeline")
def clear_fault(pipeline_id: str, db: Session = Depends(get_db)):
    return svc_clear_fault(db=db, pipeline_id=pipeline_id)


@router.post("/reset", summary="Reset entire pipeline network to healthy nominal state")
def reset_network(db: Session = Depends(get_db)):
    return svc_reset_simulation(db=db)


@router.post("/auto-toggle", summary="Toggle background simulation mode")
def toggle_auto(payload: AutoToggleRequest):
    status = set_auto_running(payload.enabled)
    return {"is_auto_running": status}

