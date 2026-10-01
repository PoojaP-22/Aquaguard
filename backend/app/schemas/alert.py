"""Pydantic schemas for Alert endpoints."""

from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, Field, field_validator
import json


VALID_RISK_LEVELS = {"Low", "Medium", "High", "Critical"}
VALID_STATUSES = {"Active", "Acknowledged", "Resolved", "Dismissed"}
VALID_PRIORITIES = {"Low", "Medium", "High", "Critical"}


class ShapFeature(BaseModel):
    feature: str
    impact: float


class AlertBase(BaseModel):
    alert_id: str = Field(..., max_length=20, examples=["A001"])
    pipeline_id: str = Field(..., max_length=10, examples=["P04"])
    risk_level: str = Field(..., examples=["Critical"])
    risk_score: float = Field(..., ge=0.0, le=100.0, examples=[82.0])
    title: str = Field(..., max_length=200, examples=["Potential pipeline fault detected"])
    description: str = Field(..., examples=["Abnormal pressure and flow behavior detected."])
    shap_explanation: Optional[List[ShapFeature]] = None
    recommended_action: Optional[str] = None
    priority: str = Field("Medium", examples=["Critical"])
    status: str = Field("Active", examples=["Active"])

    @field_validator("risk_level")
    @classmethod
    def valid_risk_level(cls, v: str) -> str:
        if v not in VALID_RISK_LEVELS:
            raise ValueError(f"risk_level must be one of {VALID_RISK_LEVELS}")
        return v

    @field_validator("status")
    @classmethod
    def valid_status(cls, v: str) -> str:
        if v not in VALID_STATUSES:
            raise ValueError(f"status must be one of {VALID_STATUSES}")
        return v

    @field_validator("priority")
    @classmethod
    def valid_priority(cls, v: str) -> str:
        if v not in VALID_PRIORITIES:
            raise ValueError(f"priority must be one of {VALID_PRIORITIES}")
        return v


class AlertCreate(AlertBase):
    pass


class AlertUpdate(BaseModel):
    """Used to update alert status lifecycle."""
    status: Optional[str] = None
    priority: Optional[str] = None
    recommended_action: Optional[str] = None

    @field_validator("status")
    @classmethod
    def valid_status(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in VALID_STATUSES:
            raise ValueError(f"status must be one of {VALID_STATUSES}")
        return v


class AlertOut(BaseModel):
    id: int
    alert_id: str
    pipeline_id: str
    risk_level: str
    risk_score: float
    title: str
    description: str
    shap_explanation: Optional[List[ShapFeature]] = None
    recommended_action: Optional[str]
    priority: str
    status: str
    created_at: datetime
    resolved_at: Optional[datetime]

    model_config = {"from_attributes": True}

    @classmethod
    def model_validate(cls, obj: Any, **kwargs):
        """Parse shap_explanation JSON string from DB into list of ShapFeature."""
        if hasattr(obj, "shap_explanation") and isinstance(obj.shap_explanation, str):
            try:
                raw = json.loads(obj.shap_explanation)
                obj.__dict__["shap_explanation"] = raw
            except (json.JSONDecodeError, AttributeError):
                obj.__dict__["shap_explanation"] = []
        return super().model_validate(obj, **kwargs)
