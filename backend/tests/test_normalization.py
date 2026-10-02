"""Tests for radiological unit normalization."""

from app.services.normalization import normalize_dose_rate


def test_normalize_nsv_per_hour():
    val, unit = normalize_dose_rate(95.4, "nSv/h")
    assert val == 95.4
    assert unit == "nSv/h"


def test_normalize_microsv_per_hour():
    # 0.10 µSv/h = 100.0 nSv/h
    val, unit = normalize_dose_rate(0.10, "µSv/h")
    assert val == 100.0
    assert unit == "nSv/h"

    # Variant spelling uSv/h
    val, unit = normalize_dose_rate(0.125, "uSv/h")
    assert val == 125.0
    assert unit == "nSv/h"


def test_normalize_millisyv_per_hour():
    # 0.001 mSv/h = 1000 nSv/h
    val, unit = normalize_dose_rate(0.002, "mSv/h")
    assert val == 2000.0
    assert unit == "nSv/h"


def test_normalize_gray_ambient():
    # 85 nGy/h = 85 nSv/h
    val, unit = normalize_dose_rate(85.0, "nGy/h")
    assert val == 85.0
    assert unit == "nSv/h"


def test_normalize_cpm():
    # 100 cpm * 2.994 ≈ 299.4 nSv/h
    val, unit = normalize_dose_rate(100.0, "cpm")
    assert val == 299.4
    assert unit == "nSv/h"


def test_negative_value_rejected():
    val, unit = normalize_dose_rate(-10.0, "nSv/h")
    assert val is None


def test_empty_or_none_value():
    val, unit = normalize_dose_rate(None, "nSv/h")
    assert val is None

    val, unit = normalize_dose_rate(100.0, "")
    assert val is None
