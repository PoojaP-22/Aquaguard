"""
Pipeline model — represents a physical pipeline segment in the water network.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime
from app.database import Base


class Pipeline(Base):
    __tablename__ = "pipelines"

    id = Column(Integer, primary_key=True, index=True)
    pipeline_id = Column(String(10), unique=True, index=True, nullable=False)  # e.g. "P04"
    zone = Column(String(50), nullable=False)                                  # e.g. "North Zone"
    location = Column(String(100), nullable=False)                             # e.g. "North Distribution Area"

    # Live sensor readings (updated by sensor ingestion or mock service)
    pressure = Column(Float, nullable=False, default=0.0)   # MPa
    flow = Column(Float, nullable=False, default=0.0)       # L/min

    # AI-derived values (populated by prediction / PHI service)
    phi = Column(Float, nullable=False, default=100.0)       # Pipeline Health Index 0-100
    leak_risk = Column(Float, nullable=False, default=0.0)   # Risk score 0-100
    time_to_failure = Column(String(30), nullable=True)      # e.g. "18 hours", "7 days"

    # Derived status: Healthy | Warning | High Risk | Critical
    status = Column(String(20), nullable=False, default="Healthy")

    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Pipeline {self.pipeline_id} zone={self.zone} status={self.status}>"
