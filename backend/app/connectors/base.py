from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel


class NormalizedStationRecord(BaseModel):
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
    last_seen_at: Optional[datetime] = None


class NormalizedMeasurementRecord(BaseModel):
    station_external_id: str
    external_id: Optional[str] = None
    measured_at: datetime
    raw_value: float
    raw_unit: str
    value: float  # Normalized to nSv/h
    unit: str = "nSv/h"
    measurement_type: str = "AMBIENT_GAMMA_DOSE_RATE"
    quality_status: str = "VALID"
    validation_status: str = "RAW"
    data_nature: str = "LIVE"  # LIVE, CACHED, DEMO, UNAVAILABLE
    is_simulated: bool = False
    metadata_json: Optional[str] = None


class RadiationSourceConnector(ABC):
    """Abstract Base Class for all external radiological network connectors."""

    def __init__(self, code: str, name: str, base_url: str):
        self.code = code
        self.name = name
        self.base_url = base_url

    @abstractmethod
    async def fetch_stations(self) -> List[NormalizedStationRecord]:
        """Fetch and normalize all available stations for this source."""
        pass

    @abstractmethod
    async def fetch_measurements(self, station_ids: Optional[List[str]] = None) -> List[NormalizedMeasurementRecord]:
        """Fetch and normalize latest measurements for the given stations."""
        pass

    @abstractmethod
    async def check_health(self) -> Dict[str, Any]:
        """Ping source endpoint or test connectivity."""
        pass
