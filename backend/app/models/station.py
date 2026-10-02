from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.database.database import Base


class Station(Base):
    __tablename__ = "stations"

    id = Column(Integer, primary_key=True, index=True)
    external_id = Column(String(100), nullable=False, index=True)
    source_id = Column(Integer, ForeignKey("sources.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(150), nullable=False, index=True)
    latitude = Column(Float, nullable=False, index=True)
    longitude = Column(Float, nullable=False, index=True)
    altitude = Column(Float, nullable=True)
    country = Column(String(50), default="FR", nullable=False)
    region_code = Column(String(50), nullable=True, index=True)
    department_code = Column(String(10), nullable=True, index=True)
    commune = Column(String(100), nullable=True, index=True)
    station_type = Column(String(50), default="FIXED", nullable=False)  # FIXED, MOBILE, CITIZEN, OTHER
    is_official = Column(Boolean, default=True, nullable=False, index=True)
    is_active = Column(Boolean, default=True, nullable=False, index=True)
    last_seen_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    source = relationship("Source", back_populates="stations")
    measurements = relationship("Measurement", back_populates="station", cascade="all, delete-orphan", order_by="desc(Measurement.measured_at)")

    __table_args__ = (
        Index("idx_station_source_external", "source_id", "external_id", unique=True),
        Index("idx_station_coords", "latitude", "longitude"),
    )
