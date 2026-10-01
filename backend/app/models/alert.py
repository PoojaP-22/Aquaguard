"""
Alert model — AI-generated risk alerts for pipeline anomalies.
"""

import json
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, DateTime
from app.database import Base


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(String(20), unique=True, index=True, nullable=False)  # e.g. "A001"
    pipeline_id = Column(String(10), index=True, nullable=False)            # e.g. "P04"

    # Risk classification
    risk_level = Column(String(20), nullable=False)   # Low | Medium | High | Critical
    risk_score = Column(Float, nullable=False)         # 0–100

    # Human-readable content
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)

    # SHAP explanation stored as JSON string; parsed in schema layer
    # Example: '[{"feature": "Pressure Drop Rate", "impact": 0.38}, ...]'
    shap_explanation = Column(Text, nullable=True)

    recommended_action = Column(Text, nullable=True)
    priority = Column(String(20), nullable=False, default="Medium")  # Low | Medium | High | Critical

    # Lifecycle: Active → Acknowledged → Resolved | Dismissed
    status = Column(String(20), nullable=False, default="Active")

    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    def get_shap_explanation(self):
        """Deserialise the SHAP JSON field into a Python list."""
        if self.shap_explanation:
            return json.loads(self.shap_explanation)
        return []

    def __repr__(self):
        return f"<Alert {self.alert_id} pipeline={self.pipeline_id} level={self.risk_level}>"
