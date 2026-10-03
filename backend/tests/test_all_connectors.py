"""Comprehensive tests for all 4 external radiological connectors."""

import pytest
from app.connectors.teleray import TelerayConnector
from app.connectors.eurdep import EURDEPConnector
from app.connectors.openradiation import OpenRadiationConnector
from app.connectors.safecast import SafecastConnector


@pytest.mark.asyncio
async def test_all_four_connectors_health():
    """Verify all 4 connectors respond with OK status."""
    connectors = [
        TelerayConnector(timeout=0.01),
        EURDEPConnector(timeout=0.01),
        OpenRadiationConnector(timeout=0.01),
        SafecastConnector(timeout=0.01),
    ]
    for c in connectors:
        health = await c.check_health()
        assert health["status"] == "OK"
        assert health["active"] is True


@pytest.mark.asyncio
async def test_openradiation_connector():
    """Verify OpenRadiation fetches stations and measurements with nSv/h conversion."""
    connector = OpenRadiationConnector(timeout=0.01)
    stations = await connector.fetch_stations()
    assert len(stations) > 0
    assert any(s.station_type == "CITIZEN" for s in stations)

    measurements = await connector.fetch_measurements()
    assert len(measurements) > 0
    for m in measurements:
        assert m.value > 0
        assert m.unit == "nSv/h"
        assert m.raw_unit == "µSv/h"


@pytest.mark.asyncio
async def test_safecast_connector():
    """Verify Safecast fetches stations and converts CPM to nSv/h."""
    connector = SafecastConnector(timeout=0.01)
    stations = await connector.fetch_stations()
    assert len(stations) > 0

    measurements = await connector.fetch_measurements()
    assert len(measurements) > 0
    for m in measurements:
        assert m.value > 0
        assert m.unit == "nSv/h"
        assert m.raw_unit == "cpm"


@pytest.mark.asyncio
async def test_eurdep_connector():
    """Verify EURDEP fetches cross-border European stations and certified measurements."""
    connector = EURDEPConnector(timeout=0.01)
    stations = await connector.fetch_stations()
    assert len(stations) > 0
    assert any(s.is_official is True for s in stations)

    measurements = await connector.fetch_measurements()
    assert len(measurements) > 0
    for m in measurements:
        assert m.value > 0
        assert m.unit == "nSv/h"
        assert m.validation_status == "EU_VERIFIED"
