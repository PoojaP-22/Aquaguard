"""
Configuration routes — alert threshold and notification settings.

GET /api/configuration     read current settings
PUT /api/configuration     update settings
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.configuration import Configuration
from app.schemas.dashboard import ConfigurationOut, ConfigurationUpdate

router = APIRouter(prefix="/api/configuration", tags=["Configuration"])


def _get_or_create_config(db: Session) -> Configuration:
    """Always returns the single configuration row, creating it if missing."""
    config = db.query(Configuration).filter(Configuration.id == 1).first()
    if not config:
        config = Configuration(id=1)
        db.add(config)
        db.commit()
        db.refresh(config)
    return config


# ---------------------------------------------------------------------------
# GET /api/configuration
# ---------------------------------------------------------------------------
@router.get(
    "",
    response_model=ConfigurationOut,
    summary="Get alert configuration",
    description="Returns the current risk threshold and notification settings.",
)
def get_configuration(db: Session = Depends(get_db)):
    return _get_or_create_config(db)


# ---------------------------------------------------------------------------
# PUT /api/configuration
# ---------------------------------------------------------------------------
@router.put(
    "",
    response_model=ConfigurationOut,
    summary="Update alert configuration",
    description="Partial update — only send the fields you want to change.",
)
def update_configuration(payload: ConfigurationUpdate, db: Session = Depends(get_db)):
    config = _get_or_create_config(db)

    update_data = payload.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields provided for update")

    proposed = {
        field: update_data.get(field, getattr(config, field))
        for field in (
            "low_risk_max",
            "medium_risk_max",
            "high_risk_max",
            "critical_risk_min",
            "phi_healthy_min",
            "phi_warning_min",
            "phi_high_risk_min",
        )
    }
    risk_values = [
        proposed["low_risk_max"],
        proposed["medium_risk_max"],
        proposed["high_risk_max"],
        proposed["critical_risk_min"],
    ]
    phi_values = [
        proposed["phi_healthy_min"],
        proposed["phi_warning_min"],
        proposed["phi_high_risk_min"],
    ]
    if risk_values != sorted(risk_values) or len(set(risk_values)) != len(risk_values):
        raise HTTPException(
            status_code=422,
            detail="Risk thresholds must be strictly increasing from low to critical.",
        )
    if phi_values != sorted(phi_values, reverse=True) or len(set(phi_values)) != len(phi_values):
        raise HTTPException(
            status_code=422,
            detail="PHI thresholds must be strictly decreasing from healthy to high risk.",
        )

    for field, value in update_data.items():
        setattr(config, field, value)

    db.commit()
    db.refresh(config)
    return config
