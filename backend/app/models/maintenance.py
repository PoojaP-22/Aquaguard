"""
Maintenance model — records of maintenance activities on pipelines.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime
from app.database import Base


class Maintenance(Base):
    __tablename__ = "maintenance"

    id = Column(Integer, primary_key=True, index=True)
    pipeline_id = Column(String(10), index=True, nullable=False)   # e.g. "P04"
    issue_type = Column(String(100), nullable=False)               # e.g. "High leak risk"
    priority = Column(String(20), nullable=False, default="Medium") # Low | Medium | High | Critical
    action_taken = Column(String(200), nullable=True)
    assigned_engineer = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)

    # Pending | In Progress | Completed
    status = Column(String(20), nullable=False, default="Pending")

    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    def __repr__(self):
        return f"<Maintenance id={self.id} pipeline={self.pipeline_id} status={self.status}>"
