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

    for field, value in update_data.items():
        setattr(config, field, value)

    db.commit()
    db.refresh(config)
    return config
