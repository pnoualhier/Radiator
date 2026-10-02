from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Index, Text, Boolean
from sqlalchemy.orm import relationship
from app.database.database import Base


class Measurement(Base):
    __tablename__ = "measurements"

    id = Column(Integer, primary_key=True, index=True)
    station_id = Column(Integer, ForeignKey("stations.id", ondelete="CASCADE"), nullable=False, index=True)
    source_id = Column(Integer, ForeignKey("sources.id", ondelete="CASCADE"), nullable=False, index=True)
    external_id = Column(String(100), nullable=True, index=True)

    measured_at = Column(DateTime, nullable=False, index=True)
    received_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Standardized normalized value & unit (nSv/h)
    value = Column(Float, nullable=False, index=True)
    unit = Column(String(20), default="nSv/h", nullable=False)

    measurement_type = Column(String(50), default="AMBIENT_GAMMA_DOSE_RATE", nullable=False)  # AMBIENT_GAMMA_DOSE_RATE, AIRBORNE_RADIONUCLIDE, RADIONUCLIDE_CONCENTRATION, OTHER
    quality_status = Column(String(20), default="VALID", nullable=False, index=True)  # VALID, SUSPECT, MISSING, STALE, INVALID
    validation_status = Column(String(20), default="RAW", nullable=False)  # RAW, AUTO_VALIDATED, EXPERT_VALIDATED

    # Rigorous data provenance distinction (LIVE / CACHED / DEMO / UNAVAILABLE)
    data_nature = Column(String(20), default="LIVE", nullable=False, index=True)
    is_simulated = Column(Boolean, default=False, nullable=False)

    # Preserved original input data
    raw_value = Column(Float, nullable=True)
    raw_unit = Column(String(50), nullable=True)

    metadata_json = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    station = relationship("Station", back_populates="measurements")
    source = relationship("Source", back_populates="measurements")

    __table_args__ = (
        Index("idx_meas_station_time", "station_id", "measured_at"),
        Index("idx_meas_source_time", "source_id", "measured_at"),
    )
