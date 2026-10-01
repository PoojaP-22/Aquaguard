"""Pydantic schemas for Dashboard and Configuration endpoints."""

from typing import Optional
from pydantic import BaseModel, Field


class DashboardSummary(BaseModel):
    pipeline_health: float = Field(..., description="Average PHI across all pipelines")
    monitored_pipelines: int = Field(..., description="Total number of pipelines in DB")
    active_alerts: int = Field(..., description="Count of alerts with status=Active")
    leak_risk: float = Field(..., description="Average leak risk % across all pipelines")
    sensors_online: int = Field(..., description="Count of distinct sensors with latest status=Online")
    total_sensors: int = Field(..., description="Total distinct sensors")

    model_config = {"from_attributes": True}


class ConfigurationOut(BaseModel):
    id: int
    low_risk_max: float
    medium_risk_max: float
    high_risk_max: float
    critical_risk_min: float
    phi_healthy_min: float
    phi_warning_min: float
    phi_high_risk_min: float
    critical_alerts_enabled: bool
    email_notifications_enabled: bool
    dashboard_notifications_enabled: bool

    model_config = {"from_attributes": True}


class ConfigurationUpdate(BaseModel):
    low_risk_max: Optional[float] = Field(None, ge=0, le=100)
    medium_risk_max: Optional[float] = Field(None, ge=0, le=100)
    high_risk_max: Optional[float] = Field(None, ge=0, le=100)
    critical_risk_min: Optional[float] = Field(None, ge=0, le=100)
    phi_healthy_min: Optional[float] = Field(None, ge=0, le=100)
    phi_warning_min: Optional[float] = Field(None, ge=0, le=100)
    phi_high_risk_min: Optional[float] = Field(None, ge=0, le=100)
    critical_alerts_enabled: Optional[bool] = None
    email_notifications_enabled: Optional[bool] = None
    dashboard_notifications_enabled: Optional[bool] = None


class RepairPriorityItem(BaseModel):
    rank: int
    pipeline_id: str
    zone: str
    risk: float
    phi: float
    time_to_failure: Optional[str]
    priority: str
    recommended_action: str

    model_config = {"from_attributes": True}
