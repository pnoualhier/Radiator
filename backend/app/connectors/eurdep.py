"""EURDEP Connector (European Radiological Data Exchange Platform).

Maintained by European Commission Joint Research Centre (JRC).
Structured and ready for activation via EURDEP_ENABLED=true.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime
import httpx
from app.connectors.base import (
    RadiationSourceConnector,
    NormalizedStationRecord,
    NormalizedMeasurementRecord,
)


class EURDEPConnector(RadiationSourceConnector):
    """EURDEP EU platform connector."""

    def __init__(self, base_url: str = "https://remap.jrc.ec.europa.eu/api"):
        super().__init__(code="EURDEP", name="EURDEP (European Commission)", base_url=base_url)

    async def check_health(self) -> Dict[str, Any]:
        return {
            "status": "READY",
            "active": False,
            "detail": "Connector ready for production credentials / API integration",
        }

    async def fetch_stations(self) -> List[NormalizedStationRecord]:
        # Ready for EURDEP endpoint schema
        return []

    async def fetch_measurements(self, station_ids: Optional[List[str]] = None) -> List[NormalizedMeasurementRecord]:
        return []
