"""Configuration de l'application (variables d'environnement / .env)."""
from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Paramètres chargés depuis l'environnement ou un fichier `.env`."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_prefix="",
        extra="ignore",
    )

    # Fournisseur par défaut : "local" ou "replicate".
    default_provider: str = "local"

    # Replicate
    replicate_api_token: str = ""
    replicate_model: str = "fofr/video-to-video"

    # Limites & stockage
    max_upload_mb: int = 200
    storage_dir: str = "storage"

    # --- Accès pratiques ---------------------------------------------------
    @property
    def storage_path(self) -> Path:
        return Path(self.storage_dir).resolve()

    @property
    def uploads_path(self) -> Path:
        return self.storage_path / "uploads"

    @property
    def outputs_path(self) -> Path:
        return self.storage_path / "outputs"

    @property
    def max_upload_bytes(self) -> int:
        return self.max_upload_mb * 1024 * 1024

    def ensure_dirs(self) -> None:
        self.uploads_path.mkdir(parents=True, exist_ok=True)
        self.outputs_path.mkdir(parents=True, exist_ok=True)


@lru_cache
def get_settings() -> "Settings":
    # Mapping explicite des variables préfixées "MF_" et des tokens tiers,
    # afin de garder des noms d'env lisibles côté utilisateur.
    import os

    mapping = {
        "default_provider": os.getenv("MF_DEFAULT_PROVIDER"),
        "replicate_api_token": os.getenv("REPLICATE_API_TOKEN"),
        "replicate_model": os.getenv("MF_REPLICATE_MODEL"),
        "max_upload_mb": os.getenv("MF_MAX_UPLOAD_MB"),
        "storage_dir": os.getenv("MF_STORAGE_DIR"),
    }
    kwargs = {k: v for k, v in mapping.items() if v is not None and v != ""}
    settings = Settings(**kwargs)  # type: ignore[arg-type]
    settings.ensure_dirs()
    return settings
