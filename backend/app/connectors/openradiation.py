"""OpenRadiation Connector (Collaborative Citizen Network in France).

Partnership between IRSN, Sorbonne Université, ANCCLI, and FabLab.
Citizen environmental measurements using mobile or fixed connected dosimeters.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
from app.connectors.base import (
    RadiationSourceConnector,
    NormalizedStationRecord,
    NormalizedMeasurementRecord,
)


class OpenRadiationConnector(RadiationSourceConnector):
    """OpenRadiation participatory science network connector."""

    def __init__(self, base_url: str = "https://openradiation.org/api", api_key: Optional[str] = None):
        super().__init__(code="OPENRADIATION", name="OpenRadiation (Sciences Participatives)", base_url=base_url)
        self.api_key = api_key

    async def check_health(self) -> Dict[str, Any]:
        return {
            "status": "READY",
            "active": False,
            "detail": "Connector ready for OpenRadiation API key configuration",
        }

    async def fetch_stations(self) -> List[NormalizedStationRecord]:
        return []

    async def fetch_measurements(self, station_ids: Optional[List[str]] = None) -> List[NormalizedMeasurementRecord]:
        return []
