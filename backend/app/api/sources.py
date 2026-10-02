"""FastAPI Sources Router."""

from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.models.source import Source
from app.schemas.source import SourceRead

router = APIRouter(prefix="/sources", tags=["Sources"])


@router.get("", response_model=List[SourceRead], summary="List data providers")
def list_sources(db: Session = Depends(get_db)):
    """Retrieve all radiological sources and networks configured in the platform."""
    return db.query(Source).order_by(Source.is_official.desc(), Source.name).all()
