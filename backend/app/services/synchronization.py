"""Source synchronization service.

Orchestrates fetching, normalizing, validating, and persisting data from external sources.
Tracks execution within SyncRun records.
"""

import logging
from datetime import datetime
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.source import Source
from app.models.station import Station
from app.models.measurement import Measurement
from app.models.sync import SyncRun
from app.connectors.teleray import TelerayConnector
from app.connectors.eurdep import EURDEPConnector
from app.connectors.openradiation import OpenRadiationConnector
from app.connectors.safecast import SafecastConnector
from app.config import settings

logger = logging.getLogger(__name__)


def get_connector(source_code: str):
    """Factory for source connectors."""
    code = source_code.upper()
    if code == "TELERAY":
        return TelerayConnector(base_url=settings.TELERAY_BASE_URL, timeout=settings.TELERAY_TIMEOUT_SECONDS)
    elif code == "EURDEP":
        return EURDEPConnector(base_url=settings.EURDEP_BASE_URL)
    elif code == "OPENRADIATION":
        return OpenRadiationConnector(base_url=settings.OPENRADIATION_BASE_URL, api_key=settings.OPENRADIATION_API_KEY)
    elif code == "SAFECAST":
        return SafecastConnector(base_url=settings.SAFECAST_BASE_URL)
    raise ValueError(f"Unknown source code: {source_code}")


async def sync_source(source_code: str, db: Session) -> SyncRun:
    """Execute full synchronization pipeline for a given source."""
    code = source_code.upper()
    logger.info("Starting synchronization for source %s", code)

    # 1. Lookup or create Source entity
    source = db.query(Source).filter(Source.code == code).first()
    if not source:
        source_names = {
            "TELERAY": ("Téléray", "ASNR / IRSN (Autorité de Sûreté Nucléaire et Radioprotection)", "INSTITUTIONAL", True, "https://teleray.irsn.fr", "Open Data"),
            "EURDEP": ("EURDEP", "Commission Européenne (JRC)", "INSTITUTIONAL", True, "https://remap.jrc.ec.europa.eu", "EU Open Data"),
            "OPENRADIATION": ("OpenRadiation", "IRSN / Sorbonne Université / ANCCLI", "CITIZEN", False, "https://openradiation.org", "ODbL"),
            "SAFECAST": ("Safecast", "Safecast Global", "CITIZEN", False, "https://safecast.org", "CC0"),
        }
        name, org, stype, is_off, url, lic = source_names.get(code, (code, "External", "OTHER", False, None, None))
        source = Source(
            code=code,
            name=name,
            organization=org,
            source_type=stype,
            api_url=url,
            license=lic,
            is_official=is_off,
            is_active=True,
        )
        db.add(source)
        db.commit()
        db.refresh(source)

    # 2. Initialize SyncRun record
    sync_run = SyncRun(
        source_id=source.id,
        started_at=datetime.utcnow(),
        status="RUNNING",
        records_received=0,
        records_inserted=0,
        records_updated=0,
        records_rejected=0,
    )
    db.add(sync_run)
    db.commit()
    db.refresh(sync_run)

    try:
        connector = get_connector(code)

        # 3. Fetch stations
        station_records = await connector.fetch_stations()
        sync_run.records_received += len(station_records)

        # Upsert stations
        station_id_map: Dict[str, Station] = {}
        for s_rec in station_records:
            existing = (
                db.query(Station)
                .filter(Station.source_id == source.id, Station.external_id == s_rec.external_id)
                .first()
            )
            if existing:
                existing.name = s_rec.name
                existing.latitude = s_rec.latitude
                existing.longitude = s_rec.longitude
                existing.altitude = s_rec.altitude
                existing.commune = s_rec.commune
                existing.department_code = s_rec.department_code
                existing.region_code = s_rec.region_code
                existing.last_seen_at = s_rec.last_seen_at or datetime.utcnow()
                existing.is_active = True
                station_id_map[s_rec.external_id] = existing
                sync_run.records_updated += 1
            else:
                new_st = Station(
                    source_id=source.id,
                    external_id=s_rec.external_id,
                    name=s_rec.name,
                    latitude=s_rec.latitude,
                    longitude=s_rec.longitude,
                    altitude=s_rec.altitude,
                    country=s_rec.country,
                    region_code=s_rec.region_code,
                    department_code=s_rec.department_code,
                    commune=s_rec.commune,
                    station_type=s_rec.station_type,
                    is_official=s_rec.is_official,
                    is_active=s_rec.is_active,
                    last_seen_at=s_rec.last_seen_at or datetime.utcnow(),
                )
                db.add(new_st)
                db.flush()
                station_id_map[s_rec.external_id] = new_st
                sync_run.records_inserted += 1

        db.commit()

        # 4. Fetch measurements
        measurements = await connector.fetch_measurements()
        sync_run.records_received += len(measurements)

        for m_rec in measurements:
            st = station_id_map.get(m_rec.station_external_id)
            if not st:
                # Try finding station in db
                st = db.query(Station).filter(Station.source_id == source.id, Station.external_id == m_rec.station_external_id).first()
            
            if not st:
                sync_run.records_rejected += 1
                continue

            # Validation check
            if m_rec.quality_status == "INVALID":
                sync_run.records_rejected += 1
                continue

            # Check duplicate (station_id + measured_at)
            existing_m = (
                db.query(Measurement)
                .filter(Measurement.station_id == st.id, Measurement.measured_at == m_rec.measured_at)
                .first()
            )
            if existing_m:
                continue

            meas = Measurement(
                station_id=st.id,
                source_id=source.id,
                external_id=m_rec.external_id,
                measured_at=m_rec.measured_at,
                received_at=datetime.utcnow(),
                value=m_rec.value,
                unit=m_rec.unit,
                measurement_type=m_rec.measurement_type,
                quality_status=m_rec.quality_status,
                validation_status=m_rec.validation_status,
                data_nature=m_rec.data_nature,
                is_simulated=m_rec.is_simulated,
                raw_value=m_rec.raw_value,
                raw_unit=m_rec.raw_unit,
                metadata_json=m_rec.metadata_json,
            )
            db.add(meas)
            sync_run.records_inserted += 1

        sync_run.status = "SUCCESS"
        sync_run.finished_at = datetime.utcnow()
        db.commit()
        db.refresh(sync_run)
        logger.info("Synchronization succeeded for %s: %d inserted, %d updated", code, sync_run.records_inserted, sync_run.records_updated)
        return sync_run

    except Exception as e:
        logger.error("Synchronization failed for %s: %s", code, str(e), exc_info=True)
        db.rollback()
        sync_run.status = "FAILED"
        sync_run.finished_at = datetime.utcnow()
        sync_run.error_message = str(e)
        db.commit()
        db.refresh(sync_run)
        return sync_run
