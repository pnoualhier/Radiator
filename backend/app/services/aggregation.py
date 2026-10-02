"""Statistical aggregation calculations for station measurements."""

from typing import List, Optional, Dict
import statistics


def calculate_station_statistics(values: List[float]) -> Dict[str, Optional[float]]:
    """Compute count, minimum, maximum, average, and median for a list of values."""
    clean_values = [v for v in values if v is not None and v >= 0]
    count = len(clean_values)

    if count == 0:
        return {
            "count": 0,
            "minimum": None,
            "maximum": None,
            "average": None,
            "median": None,
        }

    return {
        "count": count,
        "minimum": round(min(clean_values), 2),
        "maximum": round(max(clean_values), 2),
        "average": round(statistics.mean(clean_values), 2),
        "median": round(statistics.median(clean_values), 2),
    }
