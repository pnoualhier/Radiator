"""Service for radiological unit normalization.

Internal canonical unit: nSv/h (nanoSievert per hour).
Preserves raw values and units faithfully.
"""

from typing import Tuple, Optional
import math


def normalize_dose_rate(raw_value: Optional[float], raw_unit: Optional[str]) -> Tuple[Optional[float], str]:
    """Convert any known dose rate unit to nSv/h.

    Rules:
    - 1 µSv/h = 1000 nSv/h
    - 1 mSv/h = 1,000,000 nSv/h
    - 1 nSv/h = 1 nSv/h
    - 1 nGy/h ≈ 1 nSv/h (for ambient gamma radiation, WR=1)
    - 1 µGy/h ≈ 1000 nSv/h
    - 1 mGy/h ≈ 1,000,000 nSv/h

    Returns:
        Tuple of (normalized_value, "nSv/h") or (None, "UNKNOWN")
    """
    if raw_value is None:
        return None, "nSv/h"

    if math.isnan(raw_value) or math.isinf(raw_value):
        return None, "nSv/h"

    if raw_value < 0:
        return None, "nSv/h"

    if not raw_unit:
        return None, "nSv/h"

    clean_unit = raw_unit.strip().lower()
    # Replace micro sign variations
    clean_unit = clean_unit.replace("μ", "u").replace("µ", "u")

    # nSv/h
    if clean_unit in ["nsv/h", "nsvh", "nsv-h", "nsv"]:
        return round(float(raw_value), 2), "nSv/h"

    # µSv/h / uSv/h
    if clean_unit in ["usv/h", "usvh", "usv-h", "usv"]:
        return round(float(raw_value) * 1000.0, 2), "nSv/h"

    # mSv/h
    if clean_unit in ["msv/h", "msvh", "msv-h", "msv"]:
        return round(float(raw_value) * 1_000_000.0, 2), "nSv/h"

    # Gy equivalents for ambient gamma
    if clean_unit in ["ngy/h", "ngyh", "ngy-h", "ngy"]:
        return round(float(raw_value), 2), "nSv/h"

    if clean_unit in ["ugy/h", "ugyh", "ugy-h", "ugy"]:
        return round(float(raw_value) * 1000.0, 2), "nSv/h"

    if clean_unit in ["mgy/h", "mgyh", "mgy-h", "mgy"]:
        return round(float(raw_value) * 1_000_000.0, 2), "nSv/h"

    # Safecast common: cpm (standard bGeigie pancake LND 7317: ~334 CPM = 1 µSv/h => 1 CPM ≈ 2.994 nSv/h)
    if clean_unit == "cpm":
        return round(float(raw_value) * 2.994, 2), "nSv/h"

    return None, "nSv/h"
