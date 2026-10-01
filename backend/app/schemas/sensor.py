"""Pydantic schemas for Sensor endpoints."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator


VALID_SENSOR_TYPES = {"pressure", "flow"}
VALID_STATUSES = {"Online", "Offline"}


class SensorBase(BaseModel):
    sensor_id: str = Field(..., max_length=20, examples=["PS-04"])
    pipeline_id: str = Field(..., max_length=10, examples=["P04"])
    sensor_type: str = Field(..., examples=["pressure"])
    value: float = Field(..., examples=[0.71])
    unit: str = Field(..., max_length=10, examples=["MPa"])
    status: str = Field("Online", examples=["Online"])

    @field_validator("sensor_type")
    @classmethod
    def valid_sensor_type(cls, v: str) -> str:
        if v not in VALID_SENSOR_TYPES:
            raise ValueError(f"sensor_type must be one of {VALID_SENSOR_TYPES}")
        return v

    @field_validator("status")
    @classmethod
    def valid_status(cls, v: str) -> str:
        if v not in VALID_STATUSES:
            raise ValueError(f"status must be one of {VALID_STATUSES}")
        return v


class SensorCreate(SensorBase):
    pass


class SensorOut(SensorBase):
    id: int
    timestamp: datetime

    model_config = {"from_attributes": True}
