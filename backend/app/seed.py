"""Database seeding utility.

Provides default sources initialization and DEMO DATA generation explicitly tagged.
Can be executed as: python -m app.seed
"""

import sys
import logging
from datetime import datetime, timedelta
import random
from sqlalchemy.orm import Session

from app.database.database import engine, SessionLocal, Base
from app.database import models
from app.models.source import Source
from app.models.station import Station
from app.models.measurement import Measurement
from app.models.alert import OfficialAlert
from app.models.sync import SyncRun
from app.connectors.teleray import TELERAY_BENCHMARK_STATIONS

logger = logging.getLogger(__name__)


def init_default_sources(db: Session):
    """Seed foundational sources."""
    sources_data = [
        {
            "code": "TELERAY",
            "name": "Téléray",
            "organization": "ASNR / IRSN (Autorité de Sûreté Nucléaire et Radioprotection)",
            "source_type": "INSTITUTIONAL",
            "api_url": "https://teleray.irsn.fr",
            "license": "Licence Ouverte / Open Data",
            "is_official": True,
            "is_active": True,
        },
        {
            "code": "EURDEP",
            "name": "EURDEP",
            "organization": "Commission Européenne (DG JRC)",
            "source_type": "INSTITUTIONAL",
            "api_url": "https://remap.jrc.ec.europa.eu",
            "license": "EU Open Data",
            "is_official": True,
            "is_active": False,
        },
        {
            "code": "OPENRADIATION",
            "name": "OpenRadiation",
            "organization": "IRSN / Sorbonne Université / ANCCLI / FabLab",
            "source_type": "CITIZEN",
            "api_url": "https://openradiation.org",
            "license": "ODbL",
            "is_official": False,
            "is_active": False,
        },
        {
            "code": "SAFECAST",
            "name": "Safecast",
            "organization": "Safecast Global",
            "source_type": "CITIZEN",
            "api_url": "https://safecast.org",
            "license": "CC0 / Open Data",
            "is_official": False,
            "is_active": False,
        },
    ]

    for data in sources_data:
        existing = db.query(Source).filter(Source.code == data["code"]).first()
        if not existing:
            source = Source(**data)
            db.add(source)
    db.commit()


def seed_demo_data(db: Session):
    """Seed initial stations and measurements explicitly labeled as DEMO DATA."""
    init_default_sources(db)
    teleray = db.query(Source).filter(Source.code == "TELERAY").first()
    if not teleray:
        return

    now = datetime.utcnow()

    # Populate benchmark stations
    for b in TELERAY_BENCHMARK_STATIONS:
        st = db.query(Station).filter(Station.external_id == b["external_id"]).first()
        if not st:
            st = Station(
                source_id=teleray.id,
                external_id=b["external_id"],
                name=b["name"],
                latitude=b["latitude"],
                longitude=b["longitude"],
                altitude=b["altitude"],
                country="FR",
                region_code=b["region_code"],
                department_code=b["department_code"],
                commune=b["commune"],
                station_type=b["station_type"],
                is_official=True,
                is_active=True,
                last_seen_at=now,
            )
            db.add(st)
            db.flush()

        # Seed 7 days of historical measurements for station if empty
        meas_count = db.query(Measurement).filter(Measurement.station_id == st.id).count()
        if meas_count < 24:
            base_val = b["nominal_nsvh"]
            for h in range(72, -1, -1):
                meas_time = now - timedelta(hours=h)
                # Realistic micro-fluctuations (radon washout during rain, cosmic variation)
                fluc = (hash(f"{st.id}-{h}") % 7 - 3) * 1.5
                val = round(base_val + fluc, 1)

                m = Measurement(
                    station_id=st.id,
                    source_id=teleray.id,
                    external_id=f"DEMO-M-{st.id}-{int(meas_time.timestamp())}",
                    measured_at=meas_time,
                    received_at=meas_time + timedelta(minutes=5),
                    value=val,
                    unit="nSv/h",
                    measurement_type="AMBIENT_GAMMA_DOSE_RATE",
                    quality_status="VALID",
                    validation_status="DEMO DATA",
                    raw_value=val,
                    raw_unit="nSv/h",
                    metadata_json='{"tag": "DEMO DATA", "note": "Simulation benchmark validée pour démonstration"}',
                )
                db.add(m)

    # Also add a couple citizen demonstration stations (OpenRadiation)
    openrad = db.query(Source).filter(Source.code == "OPENRADIATION").first()
    if openrad:
        citizen_stations = [
            {
                "external_id": "ORAD-CIT-NANTES",
                "name": "Nantes Centre (Capteur Citoyen R-Kit)",
                "latitude": 47.2184,
                "longitude": -1.5536,
                "commune": "Nantes",
                "department_code": "44",
                "region_code": "PDL",
                "nominal": 95.0,
            },
            {
                "external_id": "ORAD-CIT-CLERMONT",
                "name": "Clermont-Ferrand Jaude (Station Citoyenne)",
                "latitude": 45.7772,
                "longitude": 3.0870,
                "commune": "Clermont-Ferrand",
                "department_code": "63",
                "region_code": "ARA",
                "nominal": 135.0,  # Granitic Massif Central
            },
        ]
        for c in citizen_stations:
            c_st = db.query(Station).filter(Station.external_id == c["external_id"]).first()
            if not c_st:
                c_st = Station(
                    source_id=openrad.id,
                    external_id=c["external_id"],
                    name=c["name"],
                    latitude=c["latitude"],
                    longitude=c["longitude"],
                    country="FR",
                    region_code=c["region_code"],
                    department_code=c["department_code"],
                    commune=c["commune"],
                    station_type="CITIZEN",
                    is_official=False,
                    is_active=True,
                    last_seen_at=now,
                )
                db.add(c_st)
                db.flush()

                for h in range(48, -1, -2):
                    meas_time = now - timedelta(hours=h)
                    val = round(c["nominal"] + (hash(f"{c['external_id']}-{h}") % 9 - 4) * 1.8, 1)
                    m = Measurement(
                        station_id=c_st.id,
                        source_id=openrad.id,
                        external_id=f"DEMO-CIT-{c_st.id}-{int(meas_time.timestamp())}",
                        measured_at=meas_time,
                        received_at=meas_time + timedelta(minutes=10),
                        value=val,
                        unit="nSv/h",
                        measurement_type="AMBIENT_GAMMA_DOSE_RATE",
                        quality_status="VALID",
                        validation_status="DEMO DATA",
                        raw_value=val,
                        raw_unit="nSv/h",
                        metadata_json='{"tag": "DEMO DATA", "collaborative": true}',
                    )
                    db.add(m)

    db.commit()
    logger.info("Database seed completed with DEMO DATA successfully")


if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as session:
        seed_demo_data(session)
    print("Seeding completed successfully.")
