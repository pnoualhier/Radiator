"""FastAPI Measurements Router."""

from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc, and_

from app.database.database import get_db
from app.models.station import Station
from app.models.source import Source
from app.models.measurement import Measurement
from app.schemas.measurement import LatestMeasurement, MeasurementRead, StationStatistics
from app.services.aggregation import calculate_station_statistics

router = APIRouter(tags=["Measurements"])


@router.get("/measurements/latest", response_model=List[LatestMeasurement], summary="Get latest measurement across stations")
def get_latest_measurements(
    bbox: Optional[str] = Query(None, description="Bounding box: min_lon,min_lat,max_lon,max_lat"),
    source: Optional[str] = Query(None, description="Source code filter (e.g. TELERAY)"),
    station_id: Optional[int] = Query(None, description="Station ID filter"),
    limit: int = Query(200, ge=1, le=1000),
    db: Session = Depends(get_db),
):
    """Retrieve the single most recent verified radiological measurement per station."""
    query = db.query(Station).join(Source)

    if source:
        query = query.filter(Source.code == source.upper())
    if station_id:
        query = query.filter(Station.id == station_id)
    if bbox:
        try:
            min_lon, min_lat, max_lon, max_lat = map(float, bbox.split(","))
            query = query.filter(
                and_(
                    Station.latitude >= min_lat,
                    Station.latitude <= max_lat,
                    Station.longitude >= min_lon,
                    Station.longitude <= max_lon,
                )
            )
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid bbox format")

    stations = query.limit(limit).all()
    results: List[LatestMeasurement] = []
    now = datetime.utcnow()

    for s in stations:
        latest = (
            db.query(Measurement)
            .filter(Measurement.station_id == s.id)
            .order_by(Measurement.measured_at.desc())
            .first()
        )
        if not latest:
            continue

        is_stale = (now - latest.measured_at) > timedelta(hours=48)

        results.append(
            LatestMeasurement(
                station_id=s.id,
                station_name=s.name,
                station_commune=s.commune,
                department_code=s.department_code,
                latitude=s.latitude,
                longitude=s.longitude,
                is_official=s.is_official,
                source_code=s.source.code,
                source_name=s.source.name,
                measured_at=latest.measured_at,
                value=latest.value,
                unit=latest.unit,
                quality_status=latest.quality_status,
                is_stale=is_stale,
            )
        )

    return results


@router.get("/stations/{station_id}/measurements", response_model=List[MeasurementRead], summary="Get historical measurements for a station")
def get_station_history(
    station_id: int,
    from_date: Optional[datetime] = Query(None, alias="from", description="Start timestamp ISO8601"),
    to_date: Optional[datetime] = Query(None, alias="to", description="End timestamp ISO8601"),
    limit: int = Query(168, ge=1, le=1000, description="Max measurements (default 168 = 7 days hourly)"),
    db: Session = Depends(get_db),
):
    """Retrieve time-series history of measurements for a station."""
    station = db.query(Station).filter(Station.id == station_id).first()
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")

    query = db.query(Measurement).filter(Measurement.station_id == station_id)

    if from_date:
        query = query.filter(Measurement.measured_at >= from_date)
    if to_date:
        query = query.filter(Measurement.measured_at <= to_date)

    measurements = query.order_by(Measurement.measured_at.desc()).limit(limit).all()
    # Return in chronological order for graphs
    return list(reversed(measurements))


@router.get("/stations/{station_id}/statistics", response_model=StationStatistics, summary="Compute radiological statistics for a station")
def get_station_statistics(
    station_id: int,
    hours: int = Query(168, ge=1, le=720, description="Window in hours (e.g. 24, 168, 720)"),
    db: Session = Depends(get_db),
):
    """Calculate min, max, average, and median dose rates over a given time window."""
    station = db.query(Station).filter(Station.id == station_id).first()
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")

    now = datetime.utcnow()
    since = now - timedelta(hours=hours)

    measurements = (
        db.query(Measurement.value)
        .filter(
            Measurement.station_id == station_id,
            Measurement.measured_at >= since,
            Measurement.quality_status.in_(["VALID", "STALE"]),
        )
        .all()
    )

    values = [m[0] for m in measurements if m[0] is not None]
    stats = calculate_station_statistics(values)

    return StationStatistics(
        station_id=station_id,
        period_hours=hours,
        count=stats["count"],
        minimum=stats["minimum"],
        maximum=stats["maximum"],
        average=stats["average"],
        median=stats["median"],
        unit="nSv/h",
        from_date=since,
        to_date=now,
    )
