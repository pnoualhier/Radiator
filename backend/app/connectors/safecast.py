"""Safecast Connector (Global Open Environmental Sensor Network).

Citizen & open data platform for radiation monitoring.
Measurements typically calibrated in CPM or µSv/h.
"""

from typing import List, Dict, Any, Optional
from app.connectors.base import (
    RadiationSourceConnector,
    NormalizedStationRecord,
    NormalizedMeasurementRecord,
)


class SafecastConnector(RadiationSourceConnector):
    """Safecast global open radiation network connector."""

    def __init__(self, base_url: str = "https://api.safecast.org"):
        super().__init__(code="SAFECAST", name="Safecast Open Network", base_url=base_url)

    async def check_health(self) -> Dict[str, Any]:
        return {
            "status": "READY",
            "active": False,
            "detail": "Connector ready for Safecast global API endpoint",
        }

    async def fetch_stations(self) -> List[NormalizedStationRecord]:
        return []

    async def fetch_measurements(self, station_ids: Optional[List[str]] = None) -> List[NormalizedMeasurementRecord]:
        return []
