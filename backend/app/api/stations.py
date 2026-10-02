"""FastAPI Stations Router."""

import math
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select, and_

from app.database.database import get_db
from app.models.station import Station
from app.models.source import Source
from app.models.measurement import Measurement
from app.schemas.station import StationRead, StationDetail
from app.schemas.measurement import MeasurementRead

router = APIRouter(prefix="/stations", tags=["Stations"])


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great circle distance in kilometers between two points on the earth."""
    R = 6371.0  # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2.0) ** 2
        + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2.0) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)


@router.get("", response_model=List[StationRead], summary="List radiological monitoring stations")
def list_stations(
    source: Optional[str] = Query(None, description="Filter by source code (e.g. TELERAY, EURDEP)"),
    region: Optional[str] = Query(None, description="Filter by region code"),
    department: Optional[str] = Query(None, description="Filter by department code"),
    bbox: Optional[str] = Query(None, description="Bounding box: min_lon,min_lat,max_lon,max_lat"),
    lat: Optional[float] = Query(None, description="Latitude for radial search"),
    lon: Optional[float] = Query(None, description="Longitude for radial search"),
    radius: Optional[float] = Query(None, description="Search radius in kilometers"),
    official: Optional[bool] = Query(None, description="Filter official/institutional stations only"),
    active: Optional[bool] = Query(True, description="Filter active stations"),
    limit: int = Query(200, ge=1, le=1000, description="Max results"),
    offset: int = Query(0, ge=0, description="Pagination offset"),
    db: Session = Depends(get_db),
):
    """Retrieve radiological monitoring stations with geospatial, administrative, and status filtering."""
    query = db.query(Station).join(Source)

    if source:
        query = query.filter(Source.code == source.upper())
    if region:
        query = query.filter(Station.region_code == region)
    if department:
        query = query.filter(Station.department_code == department)
    if official is not None:
        query = query.filter(Station.is_official == official)
    if active is not None:
        query = query.filter(Station.is_active == active)

    # Bounding box filter: min_lon,min_lat,max_lon,max_lat
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
            raise HTTPException(status_code=400, detail="Invalid bbox format. Expected min_lon,min_lat,max_lon,max_lat")

    stations = query.offset(offset).limit(limit).all()
    results: List[StationRead] = []

    for s in stations:
        # Get latest measurement
        latest_meas = (
            db.query(Measurement)
            .filter(Measurement.station_id == s.id)
            .order_by(Measurement.measured_at.desc())
            .first()
        )

        dist = None
        if lat is not None and lon is not None:
            dist = haversine_distance(lat, lon, s.latitude, s.longitude)
            if radius is not None and dist > radius:
                continue

        station_dict = {
            "id": s.id,
            "external_id": s.external_id,
            "source_id": s.source_id,
            "source_code": s.source.code if s.source else None,
            "source_name": s.source.name if s.source else None,
            "name": s.name,
            "latitude": s.latitude,
            "longitude": s.longitude,
            "altitude": s.altitude,
            "country": s.country,
            "region_code": s.region_code,
            "department_code": s.department_code,
            "commune": s.commune,
            "station_type": s.station_type,
            "is_official": s.is_official,
            "is_active": s.is_active,
            "last_seen_at": s.last_seen_at,
            "created_at": s.created_at,
            "updated_at": s.updated_at,
            "distance_km": dist,
            "latest_measurement": latest_meas,
        }
        results.append(StationRead.model_validate(station_dict))

    # If radial search, sort by nearest distance
    if lat is not None and lon is not None:
        results.sort(key=lambda x: x.distance_km if x.distance_km is not None else 999999)

    return results


@router.get("/{station_id}", response_model=StationDetail, summary="Get station details")
def get_station(station_id: int, db: Session = Depends(get_db)):
    """Retrieve comprehensive details of a station including recent measurements."""
    station = db.query(Station).filter(Station.id == station_id).first()
    if not station:
        raise HTTPException(status_code=404, detail="Station not found")

    recent = (
        db.query(Measurement)
        .filter(Measurement.station_id == station.id)
        .order_by(Measurement.measured_at.desc())
        .limit(48)
        .all()
    )

    latest = recent[0] if recent else None

    return StationDetail(
        id=station.id,
        external_id=station.external_id,
        source_id=station.source_id,
        source_code=station.source.code if station.source else None,
        source_name=station.source.name if station.source else None,
        name=station.name,
        latitude=station.latitude,
        longitude=station.longitude,
        altitude=station.altitude,
        country=station.country,
        region_code=station.region_code,
        department_code=station.department_code,
        commune=station.commune,
        station_type=station.station_type,
        is_official=station.is_official,
        is_active=station.is_active,
        last_seen_at=station.last_seen_at,
        created_at=station.created_at,
        updated_at=station.updated_at,
        latest_measurement=latest,
        recent_measurements=recent,
    )
