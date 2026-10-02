"""Pytest configuration and test fixtures."""

import os
import sys
import pytest
from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

# Ensure backend root is on path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database.database import Base, get_db
from app.database import models
from app.models.source import Source
from app.models.station import Station
from app.models.measurement import Measurement
from app.models.alert import OfficialAlert
from app.models.sync import SyncRun
from app.main import app

# Test database in memory SQLite
TEST_DATABASE_URL = "sqlite:///:memory:"


@pytest.fixture(scope="function")
def test_db():
    engine = create_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()

    # Pre-populate test source
    source = Source(
        code="TELERAY",
        name="Téléray",
        organization="ASNR / IRSN",
        source_type="INSTITUTIONAL",
        api_url="https://teleray.irsn.fr",
        license="Open Data",
        is_official=True,
        is_active=True,
    )
    db.add(source)
    db.commit()
    db.refresh(source)

    # Pre-populate test station
    station = Station(
        source_id=source.id,
        external_id="TEL-TEST-01",
        name="Paris Montsouris Test",
        latitude=48.82,
        longitude=2.33,
        altitude=75.0,
        commune="Paris",
        department_code="75",
        region_code="IDF",
        station_type="FIXED",
        is_official=True,
        is_active=True,
    )
    db.add(station)
    db.commit()
    db.refresh(station)

    # Pre-populate 3 test measurements
    now = datetime.utcnow()
    for i, val in enumerate([90.0, 95.5, 92.3]):
        m = Measurement(
            station_id=station.id,
            source_id=source.id,
            external_id=f"M-TEST-{i}",
            measured_at=now - timedelta(hours=i),
            received_at=now,
            value=val,
            unit="nSv/h",
            raw_value=val,
            raw_unit="nSv/h",
            quality_status="VALID",
            validation_status="RAW",
        )
        db.add(m)
    db.commit()

    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(test_db):
    def override_get_db():
        try:
            yield test_db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
