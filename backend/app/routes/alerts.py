"""
Alert routes — manage AI-generated pipeline alerts.

GET  /api/alerts                   list alerts (filter by risk_level / status / pipeline_id)
GET  /api/alerts/{alert_id}        get one alert
POST /api/alerts                   create an alert
PUT  /api/alerts/{alert_id}        update alert status
"""

import json
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.alert import Alert
from app.schemas.alert import AlertCreate, AlertUpdate, AlertOut

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])


def _to_alert_out(alert: Alert) -> AlertOut:
    """Convert ORM Alert to AlertOut, deserialising the SHAP JSON field."""
    data = {
        "id": alert.id,
        "alert_id": alert.alert_id,
        "pipeline_id": alert.pipeline_id,
        "risk_level": alert.risk_level,
        "risk_score": alert.risk_score,
        "title": alert.title,
        "description": alert.description,
        "shap_explanation": json.loads(alert.shap_explanation) if alert.shap_explanation else [],
        "recommended_action": alert.recommended_action,
        "priority": alert.priority,
        "status": alert.status,
        "created_at": alert.created_at,
        "resolved_at": alert.resolved_at,
    }
    return AlertOut(**data)


# ---------------------------------------------------------------------------
# GET /api/alerts
# ---------------------------------------------------------------------------
@router.get(
    "",
    response_model=List[AlertOut],
    summary="List alerts",
    description="Returns alerts. Filter by `risk_level`, `status`, and/or `pipeline_id`.",
)
def list_alerts(
    risk_level: Optional[str] = Query(None, description="Low | Medium | High | Critical"),
    status: Optional[str] = Query(None, description="Active | Acknowledged | Resolved | Dismissed"),
    pipeline_id: Optional[str] = Query(None, description="e.g. P04"),
    db: Session = Depends(get_db),
):
    q = db.query(Alert)
    if risk_level:
        q = q.filter(Alert.risk_level == risk_level)
    if status:
        q = q.filter(Alert.status == status)
    if pipeline_id:
        q = q.filter(Alert.pipeline_id == pipeline_id)
    alerts = q.order_by(Alert.created_at.desc()).all()
    return [_to_alert_out(a) for a in alerts]


# ---------------------------------------------------------------------------
# GET /api/alerts/{alert_id}
# ---------------------------------------------------------------------------
@router.get(
    "/{alert_id}",
    response_model=AlertOut,
    summary="Get a single alert",
)
def get_alert(alert_id: str, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.alert_id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail=f"Alert '{alert_id}' not found")
    return _to_alert_out(alert)


# ---------------------------------------------------------------------------
# POST /api/alerts
# ---------------------------------------------------------------------------
@router.post(
    "",
    response_model=AlertOut,
    status_code=201,
    summary="Create a new alert",
)
def create_alert(payload: AlertCreate, db: Session = Depends(get_db)):
    existing = db.query(Alert).filter(Alert.alert_id == payload.alert_id).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Alert '{payload.alert_id}' already exists")

    data = payload.model_dump()
    # Serialise shap_explanation list → JSON string for storage
    shap = data.pop("shap_explanation", None)
    data["shap_explanation"] = json.dumps(
        [s.model_dump() if hasattr(s, "model_dump") else s for s in shap]
    ) if shap else None

    alert = Alert(**data)
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return _to_alert_out(alert)


# ---------------------------------------------------------------------------
# PUT /api/alerts/{alert_id}
# ---------------------------------------------------------------------------
@router.put(
    "/{alert_id}",
    response_model=AlertOut,
    summary="Update alert status",
    description="Advance alert lifecycle: Active → Acknowledged → Resolved | Dismissed.",
)
def update_alert(alert_id: str, payload: AlertUpdate, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.alert_id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail=f"Alert '{alert_id}' not found")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(alert, field, value)

    # Auto-set resolved_at when status moves to Resolved or Dismissed
    if payload.status in ("Resolved", "Dismissed") and alert.resolved_at is None:
        alert.resolved_at = datetime.utcnow()

    db.commit()
    db.refresh(alert)
    return _to_alert_out(alert)
