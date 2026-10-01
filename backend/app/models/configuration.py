"""
Configuration model — alert thresholds and notification settings.
Only one row should exist (id=1). Seed.py creates it.
"""

from sqlalchemy import Column, Integer, Float, Boolean
from app.database import Base


class Configuration(Base):
    __tablename__ = "configuration"

    id = Column(Integer, primary_key=True, index=True)

    # Leak risk thresholds (%)
    low_risk_max = Column(Float, nullable=False, default=30.0)
    medium_risk_max = Column(Float, nullable=False, default=60.0)
    high_risk_max = Column(Float, nullable=False, default=80.0)
    critical_risk_min = Column(Float, nullable=False, default=81.0)

    # PHI thresholds
    phi_healthy_min = Column(Float, nullable=False, default=90.0)
    phi_warning_min = Column(Float, nullable=False, default=75.0)
    phi_high_risk_min = Column(Float, nullable=False, default=60.0)
    # Below phi_high_risk_min → Critical

    # Notification toggles
    critical_alerts_enabled = Column(Boolean, nullable=False, default=True)
    email_notifications_enabled = Column(Boolean, nullable=False, default=False)
    dashboard_notifications_enabled = Column(Boolean, nullable=False, default=True)

    def __repr__(self):
        return f"<Configuration id={self.id}>"
