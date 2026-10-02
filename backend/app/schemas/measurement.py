from datetime import datetime
from typing import Optional, Dict, Any
from pydantic import BaseModel, ConfigDict


class MeasurementBase(BaseModel):
    measured_at: datetime
    value: float  # Normalized nSv/h
    unit: str = "nSv/h"
    measurement_type: str = "AMBIENT_GAMMA_DOSE_RATE"
    quality_status: str = "VALID"
    validation_status: str = "RAW"
    data_nature: str = "LIVE"  # LIVE, CACHED, DEMO, UNAVAILABLE
    is_simulated: bool = False
    raw_value: Optional[float] = None
    raw_unit: Optional[str] = None


class MeasurementRead(MeasurementBase):
    id: int
    station_id: int
    source_id: int
    external_id: Optional[str] = None
    received_at: datetime
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class LatestMeasurement(BaseModel):
    station_id: int
    station_name: str
    station_commune: Optional[str] = None
    department_code: Optional[str] = None
    latitude: float
    longitude: float
    is_official: bool
    source_code: str
    source_name: str
    measured_at: datetime
    value: float
    unit: str = "nSv/h"
    quality_status: str
    data_nature: str = "LIVE"  # LIVE, CACHED, DEMO, UNAVAILABLE
    is_simulated: bool = False
    is_stale: bool = False

    model_config = ConfigDict(from_attributes=True)


class StationStatistics(BaseModel):
    station_id: int
    period_hours: int
    count: int
    minimum: Optional[float] = None
    maximum: Optional[float] = None
    average: Optional[float] = None
    median: Optional[float] = None
    unit: str = "nSv/h"
    from_date: Optional[datetime] = None
    to_date: Optional[datetime] = None
