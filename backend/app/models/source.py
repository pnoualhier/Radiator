from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.database.database import Base


class Source(Base):
    __tablename__ = "sources"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False)  # TELERAY, EURDEP, OPENRADIATION, SAFECAST
    name = Column(String(100), nullable=False)
    organization = Column(String(150), nullable=False)
    source_type = Column(String(50), nullable=False)  # INSTITUTIONAL, CITIZEN, RESEARCH
    api_url = Column(String(255), nullable=True)
    license = Column(String(100), nullable=True)
    is_official = Column(Boolean, default=True, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    stations = relationship("Station", back_populates="source", cascade="all, delete-orphan")
    measurements = relationship("Measurement", back_populates="source", cascade="all, delete-orphan")
    sync_runs = relationship("SyncRun", back_populates="source", cascade="all, delete-orphan")
    alerts = relationship("OfficialAlert", back_populates="source", cascade="all, delete-orphan")
