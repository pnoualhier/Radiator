from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from app.schemas.measurement import MeasurementRead, LatestMeasurement


class StationBase(BaseModel):
    external_id: str
    name: str
    latitude: float
    longitude: float
    altitude: Optional[float] = None
    country: str = "FR"
    region_code: Optional[str] = None
    department_code: Optional[str] = None
    commune: Optional[str] = None
    station_type: str = "FIXED"
    is_official: bool = True
    is_active: bool = True


class StationRead(StationBase):
    id: int
    source_id: int
    source_code: Optional[str] = None
    source_name: Optional[str] = None
    last_seen_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    latest_measurement: Optional[MeasurementRead] = None
    distance_km: Optional[float] = None

    model_config = ConfigDict(from_attributes=True)


class StationDetail(StationRead):
    recent_measurements: List[MeasurementRead] = []
