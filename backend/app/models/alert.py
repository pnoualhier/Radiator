from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.database.database import Base


class OfficialAlert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    external_id = Column(String(100), nullable=True, index=True)
    source_id = Column(Integer, ForeignKey("sources.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(String(50), default="INFO", nullable=False)  # INFO, NOTICE, WARNING, CRITICAL
    status = Column(String(50), default="ACTIVE", nullable=False)  # ACTIVE, RESOLVED, CANCELLED
    published_at = Column(DateTime, nullable=False, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    starts_at = Column(DateTime, nullable=True)
    ends_at = Column(DateTime, nullable=True)
    affected_area = Column(String(200), nullable=True)
    source_url = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    source = relationship("Source", back_populates="alerts")

    __table_args__ = (
        Index("idx_alert_status_pub", "status", "published_at"),
    )
