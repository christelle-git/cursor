from __future__ import annotations

from app.config import settings
from app.providers.base import VideoProvider
from app.providers.mock_provider import MockFfmpegProvider
from app.providers.replicate_provider import ReplicateProvider

_provider_instance: VideoProvider | None = None


def get_provider() -> VideoProvider:
    """Renvoie le fournisseur de génération vidéo configuré (singleton paresseux)."""
    global _provider_instance
    if _provider_instance is not None:
        return _provider_instance

    if settings.video_provider == "replicate":
        _provider_instance = ReplicateProvider()
    else:
        _provider_instance = MockFfmpegProvider()
    return _provider_instance


def reset_provider_cache() -> None:
    """Utilitaire de test : force la ré-instanciation du fournisseur."""
    global _provider_instance
    _provider_instance = None


__all__ = ["VideoProvider", "get_provider", "reset_provider_cache"]
