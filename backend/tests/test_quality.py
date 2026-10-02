"""Tests for data quality and validation rules."""

from datetime import datetime, timedelta
from app.services.quality import assess_measurement_quality, validate_coordinates


def test_validate_coordinates():
    # Valid France coordinates
    assert validate_coordinates(48.8566, 2.3522) is True
    assert validate_coordinates(42.0, 9.0) is True

    # Invalid coordinates
    assert validate_coordinates(95.0, 2.0) is False
    assert validate_coordinates(48.0, 195.0) is False
    assert validate_coordinates(None, 2.0) is False


def test_quality_valid_measurement():
    now = datetime.utcnow()
    status, reason = assess_measurement_quality(95.0, now - timedelta(minutes=15), "nSv/h")
    assert status == "VALID"
    assert reason is None


def test_quality_negative_value():
    now = datetime.utcnow()
    status, reason = assess_measurement_quality(-5.0, now, "nSv/h")
    assert status == "INVALID"
    assert "cannot be negative" in reason


def test_quality_future_timestamp():
    now = datetime.utcnow()
    future = now + timedelta(hours=2)
    status, reason = assess_measurement_quality(90.0, future, "nSv/h", current_time=now)
    assert status == "INVALID"
    assert "future" in reason


def test_quality_stale_data():
    now = datetime.utcnow()
    old_time = now - timedelta(hours=50)
    status, reason = assess_measurement_quality(90.0, old_time, "nSv/h", current_time=now)
    assert status == "STALE"


def test_quality_suspect_high_value():
    now = datetime.utcnow()
    # 8,000 nSv/h is exceptionally high without confirmation
    status, reason = assess_measurement_quality(8000.0, now, "nSv/h", current_time=now)
    assert status == "SUSPECT"
