"""Tests for FastAPI HTTP endpoints."""

from fastapi.testclient import TestClient


def test_api_health(client: TestClient):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["database"] == "ok"


def test_api_sources(client: TestClient):
    response = client.get("/api/v1/sources")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["code"] == "TELERAY"


def test_api_stations(client: TestClient):
    response = client.get("/api/v1/stations")
    assert response.status_code == 200
    stations = response.json()
    assert len(stations) >= 1
    st = stations[0]
    assert "id" in st
    assert "name" in st
    assert "latitude" in st
    assert "longitude" in st
    assert st["latest_measurement"] is not None


def test_api_station_detail(client: TestClient):
    # Fetch first station id
    st_res = client.get("/api/v1/stations")
    first_id = st_res.json()[0]["id"]

    response = client.get(f"/api/v1/stations/{first_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == first_id
    assert len(data["recent_measurements"]) > 0


def test_api_measurements_latest(client: TestClient):
    response = client.get("/api/v1/measurements/latest")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    m = data[0]
    assert "value" in m
    assert m["unit"] == "nSv/h"
    assert "station_name" in m


def test_api_station_history(client: TestClient):
    st_res = client.get("/api/v1/stations")
    first_id = st_res.json()[0]["id"]

    response = client.get(f"/api/v1/stations/{first_id}/measurements")
    assert response.status_code == 200
    history = response.json()
    assert len(history) >= 1
    assert "value" in history[0]


def test_api_station_statistics(client: TestClient):
    st_res = client.get("/api/v1/stations")
    first_id = st_res.json()[0]["id"]

    response = client.get(f"/api/v1/stations/{first_id}/statistics?hours=168")
    assert response.status_code == 200
    stats = response.json()
    assert stats["count"] >= 1
    assert stats["minimum"] is not None
    assert stats["maximum"] is not None
    assert stats["average"] is not None
    assert stats["median"] is not None
    assert stats["unit"] == "nSv/h"


def test_api_alerts_empty_state(client: TestClient):
    response = client.get("/api/v1/alerts")
    assert response.status_code == 200
    alerts = response.json()
    assert isinstance(alerts, list)


def test_api_health_sources(client: TestClient):
    response = client.get("/api/v1/health/sources")
    assert response.status_code == 200
    sources = response.json()
    assert len(sources) >= 1
