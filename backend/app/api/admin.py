"""Admin API Router."""

from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.config import settings
from app.services.synchronization import sync_source
from app.schemas.sync import SyncResponse, SyncRunRead

router = APIRouter(prefix="/admin", tags=["Administration"])


def verify_admin_key(x_admin_key: str = Header(..., description="Administrator secret API key")):
    """Enforce admin security token check."""
    if not settings.ADMIN_API_KEY or x_admin_key != settings.ADMIN_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing administration key",
        )
    return True


@router.post("/sync/teleray", response_model=SyncResponse, summary="Trigger manual Téléray synchronization")
async def trigger_teleray_sync(
    authorized: bool = Depends(verify_admin_key),
    db: Session = Depends(get_db),
):
    """Admin endpoint to manually trigger a fresh Téléray data synchronization."""
    sync_run = await sync_source("TELERAY", db)
    return SyncResponse(
        status=sync_run.status,
        message=f"Synchronization completed with status {sync_run.status}",
        sync_run=SyncRunRead.model_validate(sync_run),
    )


@router.post("/sync/{source_code}", response_model=SyncResponse, summary="Trigger manual sync for any source")
async def trigger_source_sync(
    source_code: str,
    authorized: bool = Depends(verify_admin_key),
    db: Session = Depends(get_db),
):
    """Admin endpoint to manually trigger sync for a specific source."""
    sync_run = await sync_source(source_code, db)
    return SyncResponse(
        status=sync_run.status,
        message=f"Sync {source_code} finished with status {sync_run.status}",
        sync_run=SyncRunRead.model_validate(sync_run),
    )
