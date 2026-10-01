"""
User model — basic user record. No auth implemented yet.
JWT authentication can be layered on top later without changing this model.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)

    # Maintenance Engineer | Utility Dashboard Admin
    role = Column(String(50), nullable=False, default="Maintenance Engineer")

    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Placeholder for future password hash (bcrypt)
    hashed_password = Column(String(200), nullable=True)

    def __repr__(self):
        return f"<User {self.email} role={self.role}>"
