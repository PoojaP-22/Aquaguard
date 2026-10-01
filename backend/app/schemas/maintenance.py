"""Pydantic schemas for Maintenance endpoints."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator


VALID_STATUSES = {"Pending", "In Progress", "Completed"}
VALID_PRIORITIES = {"Low", "Medium", "High", "Critical"}


class MaintenanceBase(BaseModel):
    pipeline_id: str = Field(..., max_length=10, examples=["P04"])
    issue_type: str = Field(..., max_length=100, examples=["High leak risk"])
    priority: str = Field("Medium", examples=["Critical"])
    action_taken: Optional[str] = Field(None, max_length=200, examples=["Valve inspection"])
    assigned_engineer: Optional[str] = Field(None, max_length=100, examples=["Arun Kumar"])
    notes: Optional[str] = Field(None, examples=["Inspection required based on AI alert."])
    status: str = Field("Pending", examples=["In Progress"])

    @field_validator("priority")
    @classmethod
    def valid_priority(cls, v: str) -> str:
        if v not in VALID_PRIORITIES:
            raise ValueError(f"priority must be one of {VALID_PRIORITIES}")
        return v

    @field_validator("status")
    @classmethod
    def valid_status(cls, v: str) -> str:
        if v not in VALID_STATUSES:
            raise ValueError(f"status must be one of {VALID_STATUSES}")
        return v


class MaintenanceCreate(MaintenanceBase):
    pass


class MaintenanceUpdate(BaseModel):
    """Partial update — all fields optional."""
    issue_type: Optional[str] = None
    priority: Optional[str] = None
    action_taken: Optional[str] = None
    assigned_engineer: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None
    completed_at: Optional[datetime] = None

    @field_validator("status")
    @classmethod
    def valid_status(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in VALID_STATUSES:
            raise ValueError(f"status must be one of {VALID_STATUSES}")
        return v


class MaintenanceOut(MaintenanceBase):
    id: int
    created_at: datetime
    completed_at: Optional[datetime]

    model_config = {"from_attributes": True}
