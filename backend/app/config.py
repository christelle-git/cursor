"""Configuration centrale de l'application, pilotable via variables d'environnement."""
from __future__ import annotations

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # "mock" fonctionne hors ligne avec ffmpeg (aucune clé requise) et permet de
    # tester tout le pipeline. "replicate" appelle un vrai modèle de génération
    # vidéo-à-vidéo hébergé sur Replicate.
    video_provider: str = "mock"

    # Jeton d'API Replicate (https://replicate.com/account/api-tokens).
    # A définir en secret côté Cursor Dashboard, jamais en dur dans le code.
    replicate_api_token: str | None = None

    # Slug du modèle Replicate utilisé pour la génération vidéo-à-vidéo.
    # Exemples : "luma/modify-video", "kwaivgi/kling-v3-omni-video".
    replicate_model: str = "luma/modify-video"

    # Dossier de stockage local des vidéos uploadées et générées.
    storage_dir: Path = Path(__file__).resolve().parent.parent / "storage"

    # Taille maximale acceptée pour un upload (en octets). 500 Mo par défaut.
    max_upload_size_bytes: int = 500 * 1024 * 1024

    cors_origins: list[str] = ["*"]

    @property
    def uploads_dir(self) -> Path:
        path = self.storage_dir / "uploads"
        path.mkdir(parents=True, exist_ok=True)
        return path

    @property
    def outputs_dir(self) -> Path:
        path = self.storage_dir / "outputs"
        path.mkdir(parents=True, exist_ok=True)
        return path


settings = Settings()
