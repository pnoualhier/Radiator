"""FastAPI Official Alerts Router."""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.alert import OfficialAlert
from app.schemas.alert import AlertRead

router = APIRouter(prefix="/alerts", tags=["Official Alerts"])


@router.get("", response_model=List[AlertRead], summary="List official radiological alerts")
def list_official_alerts(
    status: Optional[str] = Query("ACTIVE", description="Filter by status (ACTIVE, RESOLVED, ALL)"),
    db: Session = Depends(get_db),
):
    """Retrieve official government or institutional radiological alerts.

    Note: Strictly reserved for verified communications published by authorities
    (ASNR, IRSN, Préfectures, Ministère de la Transition Écologique).
    Local threshold spikes never create automated alerts.
    """
    query = db.query(OfficialAlert)
    if status and status != "ALL":
        query = query.filter(OfficialAlert.status == status)

    alerts = query.order_by(OfficialAlert.published_at.desc()).all()

    results: List[AlertRead] = []
    for a in alerts:
        results.append(
            AlertRead(
                id=a.id,
                external_id=a.external_id,
                source_id=a.source_id,
                source_code=a.source.code if a.source else None,
                source_name=a.source.name if a.source else None,
                title=a.title,
                description=a.description,
                severity=a.severity,
                status=a.status,
                published_at=a.published_at,
                starts_at=a.starts_at,
                ends_at=a.ends_at,
                affected_area=a.affected_area,
                source_url=a.source_url,
                created_at=a.created_at,
                updated_at=a.updated_at,
            )
        )
    return results


@router.get("/{alert_id}", response_model=AlertRead, summary="Get official alert detail")
def get_official_alert(alert_id: int, db: Session = Depends(get_db)):
    """Retrieve details of a specific official alert."""
    alert = db.query(OfficialAlert).filter(OfficialAlert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")

    return AlertRead(
        id=alert.id,
        external_id=alert.external_id,
        source_id=alert.source_id,
        source_code=alert.source.code if alert.source else None,
        source_name=alert.source.name if alert.source else None,
        title=alert.title,
        description=alert.description,
        severity=alert.severity,
        status=alert.status,
        published_at=alert.published_at,
        starts_at=alert.starts_at,
        ends_at=alert.ends_at,
        affected_area=alert.affected_area,
        source_url=alert.source_url,
        created_at=alert.created_at,
        updated_at=alert.updated_at,
    )
