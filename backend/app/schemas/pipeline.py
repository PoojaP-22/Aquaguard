"""Pydantic schemas for Pipeline endpoints."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator


VALID_STATUSES = {"Healthy", "Warning", "High Risk", "Critical"}


class PipelineBase(BaseModel):
    pipeline_id: str = Field(..., max_length=10, examples=["P04"])
    zone: str = Field(..., max_length=50, examples=["North Zone"])
    location: str = Field(..., max_length=100, examples=["North Distribution Area"])
    pressure: float = Field(..., ge=0.0, examples=[0.71])
    flow: float = Field(..., ge=0.0, examples=[38.2])
    phi: float = Field(..., ge=0.0, le=100.0, examples=[62.0])
    leak_risk: float = Field(..., ge=0.0, le=100.0, examples=[82.0])
    time_to_failure: Optional[str] = Field(None, examples=["18 hours"])
    status: str = Field("Healthy", examples=["Critical"])

    @field_validator("leak_risk", "phi")
    @classmethod
    def score_range(cls, v: float) -> float:
        if not (0.0 <= v <= 100.0):
            raise ValueError("Score must be between 0 and 100")
        return v

    @field_validator("status")
    @classmethod
    def valid_status(cls, v: str) -> str:
        if v not in VALID_STATUSES:
            raise ValueError(f"status must be one of {VALID_STATUSES}")
        return v


class PipelineCreate(PipelineBase):
    pass


class PipelineUpdate(BaseModel):
    """All fields optional for PATCH-style updates."""
    zone: Optional[str] = None
    location: Optional[str] = None
    pressure: Optional[float] = Field(None, ge=0.0)
    flow: Optional[float] = Field(None, ge=0.0)
    phi: Optional[float] = Field(None, ge=0.0, le=100.0)
    leak_risk: Optional[float] = Field(None, ge=0.0, le=100.0)
    time_to_failure: Optional[str] = None
    status: Optional[str] = None

    @field_validator("status")
    @classmethod
    def valid_status(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in VALID_STATUSES:
            raise ValueError(f"status must be one of {VALID_STATUSES}")
        return v


class PipelineOut(PipelineBase):
    id: int
    last_updated: datetime
    created_at: datetime

    model_config = {"from_attributes": True}
