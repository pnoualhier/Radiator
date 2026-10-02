from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class SourceBase(BaseModel):
    code: str
    name: str
    organization: str
    source_type: str
    api_url: Optional[str] = None
    license: Optional[str] = None
    is_official: bool = True
    is_active: bool = True


class SourceRead(SourceBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SourceHealth(BaseModel):
    code: str
    name: str
    is_active: bool
    is_official: bool
    status: str  # OK, DEGRADED, DISABLED, ERROR
    last_sync_at: Optional[datetime] = None
    last_sync_status: Optional[str] = None
    records_count: int = 0
