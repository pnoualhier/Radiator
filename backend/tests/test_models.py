"""Tests for SQLAlchemy database models and relationships."""

from datetime import datetime
from app.models.source import Source
from app.models.station import Station
from app.models.measurement import Measurement
from app.models.alert import OfficialAlert
from app.models.sync import SyncRun


def test_models_relationships(test_db):
    # Verify source station relationship
    source = test_db.query(Source).filter(Source.code == "TELERAY").first()
    assert source is not None
    assert len(source.stations) >= 1

    station = source.stations[0]
    assert station.source.code == "TELERAY"
    assert len(station.measurements) == 3

    meas = station.measurements[0]
    assert meas.unit == "nSv/h"
    assert meas.station.id == station.id
    assert meas.source.id == source.id


def test_sync_run_model(test_db):
    source = test_db.query(Source).first()
    sync = SyncRun(
        source_id=source.id,
        started_at=datetime.utcnow(),
        status="SUCCESS",
        records_received=10,
        records_inserted=10,
    )
    test_db.add(sync)
    test_db.commit()
    test_db.refresh(sync)

    assert sync.id is not None
    assert sync.status == "SUCCESS"
    assert sync.source.code == source.code
