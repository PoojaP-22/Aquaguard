"""
Database configuration for AquaGuard AI.

Uses SQLite for development. Switch to PostgreSQL in production
by changing DATABASE_URL in .env to:
  postgresql://user:password@host:5432/aquaguard
"""

import os
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

load_dotenv()

DEFAULT_DB = (Path(__file__).resolve().parents[1] / "aquaguard.db").as_posix()
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DEFAULT_DB}")

# connect_args is only needed for SQLite (handles multi-thread access)
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency — yields a DB session and closes it after the request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    """Create all tables defined in models. Called at app startup."""
    # Import all models so SQLAlchemy registers them before create_all
    from app.models import pipeline, sensor, alert, maintenance, user, configuration  # noqa: F401
    Base.metadata.create_all(bind=engine)
