"""Tests for Téléray connector."""

import pytest
from app.connectors.teleray import TelerayConnector


@pytest.mark.asyncio
async def test_teleray_fetch_stations():
    connector = TelerayConnector(timeout=0.01)
    stations = await connector.fetch_stations()
    assert len(stations) > 0

    paris = next((s for s in stations if "PARIS" in s.external_id), None)
    assert paris is not None
    assert paris.latitude > 40.0
    assert paris.longitude > -5.0
    assert paris.is_official is True


@pytest.mark.asyncio
async def test_teleray_fetch_measurements():
    connector = TelerayConnector(timeout=0.01)
    stations = await connector.fetch_stations()
    station_ids = [s.external_id for s in stations[:3]]

    measurements = await connector.fetch_measurements(station_ids=station_ids)
    assert len(measurements) > 0

    for m in measurements:
        assert m.value > 0
        assert m.unit == "nSv/h"
        assert m.quality_status in ["VALID", "SUSPECT", "STALE"]


@pytest.mark.asyncio
async def test_teleray_health():
    connector = TelerayConnector(timeout=0.01)
    health = await connector.check_health()
    assert health["status"] == "OK"
