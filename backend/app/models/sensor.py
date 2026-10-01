"""
Sensor model — stores individual sensor readings over time.
Each row is one time-stamped reading from a pressure or flow sensor.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime
from app.database import Base


class Sensor(Base):
    __tablename__ = "sensors"

    id = Column(Integer, primary_key=True, index=True)
    sensor_id = Column(String(20), index=True, nullable=False)       # e.g. "PS-04"
    pipeline_id = Column(String(10), index=True, nullable=False)     # e.g. "P04"
    sensor_type = Column(String(20), nullable=False)                  # "pressure" | "flow"
    value = Column(Float, nullable=False)
    unit = Column(String(10), nullable=False)                         # "MPa" | "L/min"
    status = Column(String(20), nullable=False, default="Online")    # Online | Offline
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

    def __repr__(self):
        return f"<Sensor {self.sensor_id} pipeline={self.pipeline_id} value={self.value}{self.unit}>"
