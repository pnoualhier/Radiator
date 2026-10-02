from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class AlertBase(BaseModel):
    title: str
    description: str
    severity: str = "INFO"  # INFO, NOTICE, WARNING, CRITICAL
    status: str = "ACTIVE"  # ACTIVE, RESOLVED, CANCELLED
    published_at: datetime
    starts_at: Optional[datetime] = None
    ends_at: Optional[datetime] = None
    affected_area: Optional[str] = None
    source_url: Optional[str] = None


class AlertRead(AlertBase):
    id: int
    external_id: Optional[str] = None
    source_id: int
    source_code: Optional[str] = None
    source_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
