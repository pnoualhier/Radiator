from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from typing import Optional


class Settings(BaseSettings):
    """Application settings using Pydantic Settings."""

    # General
    APP_NAME: str = "Radiation France"
    APP_VERSION: str = "0.1.0"
    APP_ENV: str = "development"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str = Field(
        default="sqlite:///./data/radiation.db",
        description="SQLAlchemy database connection string",
    )

    # Security / Admin
    ADMIN_API_KEY: str = Field(
        default="dev-secret-key-change-in-production",
        description="Secret key required for manual sync admin endpoints",
    )

    # Téléray connector (ASNR / IRSN) - Primary MVP source
    TELERAY_ENABLED: bool = True
    TELERAY_BASE_URL: str = "https://teleray.irsn.fr/api"
    TELERAY_TIMEOUT_SECONDS: float = 15.0

    # EURDEP connector (European Radiological Data Exchange Platform)
    EURDEP_ENABLED: bool = False
    EURDEP_BASE_URL: str = "https://remap.jrc.ec.europa.eu/api"

    # OpenRadiation connector (Citizen science network)
    OPENRADIATION_ENABLED: bool = False
    OPENRADIATION_API_KEY: Optional[str] = None
    OPENRADIATION_BASE_URL: str = "https://openradiation.org/api"

    # Safecast connector (Global open network)
    SAFECAST_ENABLED: bool = False
    SAFECAST_BASE_URL: str = "https://api.safecast.org"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
