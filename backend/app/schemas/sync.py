from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class SyncRunRead(BaseModel):
    id: int
    source_id: int
    source_code: Optional[str] = None
    started_at: datetime
    finished_at: Optional[datetime] = None
    status: str
    records_received: int
    records_inserted: int
    records_updated: int
    records_rejected: int
    error_message: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class SyncResponse(BaseModel):
    status: str
    message: str
    sync_run: Optional[SyncRunRead] = None
