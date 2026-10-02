"""Radiological measurement quality and validation service."""

from datetime import datetime, timezone, timedelta
from typing import Optional, Tuple, Dict, Any


def validate_coordinates(latitude: Optional[float], longitude: Optional[float]) -> bool:
    """Check if geographic coordinates are physically valid."""
    if latitude is None or longitude is None:
        return False
    if not (-90.0 <= latitude <= 90.0):
        return False
    if not (-180.0 <= longitude <= 180.0):
        return False
    return True


def assess_measurement_quality(
    value_nsvh: Optional[float],
    measured_at: Optional[datetime],
    raw_unit: Optional[str],
    is_official: bool = True,
    current_time: Optional[datetime] = None,
) -> Tuple[str, Optional[str]]:
    """Assess radiological data quality status.

    Statuses:
    - VALID: Consistent value within known bounds, recent, properly formed.
    - SUSPECT: Statistically unusual variation or extreme value needing review.
    - STALE: Measurement is older than 48 hours.
    - MISSING: Empty or unreadable value.
    - INVALID: Mathematically or physically impossible value, invalid date or unit.

    Returns:
        (quality_status, reason_message)
    """
    if current_time is None:
        current_time = datetime.utcnow()

    # 1. Missing check
    if value_nsvh is None:
        return "MISSING", "Value is None"

    # 2. Strict negative check
    if value_nsvh < 0:
        return "INVALID", "Dose rate cannot be negative"

    # 3. Unit validity check
    if not raw_unit:
        return "INVALID", "Raw unit is missing"

    # 4. Timestamp validity check
    if measured_at is None:
        return "INVALID", "Measurement timestamp is missing"

    # Normalize timezone for comparison
    ts = measured_at.replace(tzinfo=None) if measured_at.tzinfo else measured_at
    now = current_time.replace(tzinfo=None) if current_time.tzinfo else current_time

    # Future date check (tolerance of 10 minutes for clock drift)
    if ts > now + timedelta(minutes=10):
        return "INVALID", "Measurement date is in the future"

    # Extreme physical bound (> 100,000,000 nSv/h = 100 mSv/h)
    if value_nsvh > 100_000_000:
        return "INVALID", "Value exceeds physical sensor operating ceiling"

    # Suspect bounds (> 5,000 nSv/h = 5 µSv/h without official alert)
    if value_nsvh > 5_000:
        return "SUSPECT", "Value is unusually high for environmental ambient background"

    # Suspiciously near zero (< 5 nSv/h is likely sensor disconnect/failure)
    if value_nsvh < 5:
        return "SUSPECT", "Value is abnormally low, possible sensor disconnection"

    # Stale data check (> 48 hours old)
    if (now - ts) > timedelta(hours=48):
        return "STALE", "Data was recorded more than 48 hours ago"

    return "VALID", None
