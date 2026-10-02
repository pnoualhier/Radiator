"""FastAPI Health & Diagnostic Router."""

from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.database.database import get_db
from app.config import settings
from app.models.source import Source
from app.models.sync import SyncRun
from app.models.station import Station
from app.models.measurement import Measurement
from app.schemas.source import SourceHealth

router = APIRouter(prefix="/health", tags=["Health"])


@router.get("", summary="General platform health check")
def health_check(db: Session = Depends(get_db)):
    """Health status and database connectivity check."""
    db_status = "ok"
    try:
        db.execute(text("SELECT 1"))
    except Exception:
        db_status = "error"

    return {
        "status": "ok" if db_status == "ok" else "degraded",
        "database": db_status,
        "version": settings.APP_VERSION,
        "environment": settings.APP_ENV,
    }


@router.get("/sources", response_model=List[SourceHealth], summary="Sources health & connectivity")
def sources_health(db: Session = Depends(get_db)):
    """Status, sync telemetry, and station counts for all configured source connectors."""
    sources = db.query(Source).all()
    results: List[SourceHealth] = []

    for s in sources:
        last_sync = (
            db.query(SyncRun)
            .filter(SyncRun.source_id == s.id)
            .order_by(SyncRun.started_at.desc())
            .first()
        )
        meas_count = db.query(Measurement).filter(Measurement.source_id == s.id).count()

        status = "OK" if s.is_active else "DISABLED"
        if last_sync and last_sync.status == "FAILED":
            status = "DEGRADED"

        results.append(
            SourceHealth(
                code=s.code,
                name=s.name,
                is_active=s.is_active,
                is_official=s.is_official,
                status=status,
                last_sync_at=last_sync.finished_at if last_sync else None,
                last_sync_status=last_sync.status if last_sync else "NEVER_RUN",
                records_count=meas_count,
            )
        )

    return results
