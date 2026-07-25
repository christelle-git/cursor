"""Fournisseurs de génération vidéo-à-vidéo."""
from __future__ import annotations

from ..config import Settings
from .base import GenerationRequest, Provider, ProviderError
from .local import LocalProvider
from .replicate import ReplicateProvider

__all__ = [
    "GenerationRequest",
    "Provider",
    "ProviderError",
    "LocalProvider",
    "ReplicateProvider",
    "get_provider",
    "available_providers",
]


def get_provider(name: str, settings: Settings) -> Provider:
    """Retourne une instance de fournisseur par nom."""
    name = (name or settings.default_provider).lower()
    if name == "local":
        return LocalProvider(settings)
    if name == "replicate":
        return ReplicateProvider(settings)
    raise ProviderError(f"Fournisseur inconnu : {name!r}")


def available_providers(settings: Settings) -> list[dict]:
    """Décrit les fournisseurs et leur disponibilité (pour l'UI)."""
    return [
        {
            "key": "local",
            "label": "Local (ffmpeg)",
            "description": "Restyling vidéo-à-vidéo hors-ligne, déterministe. Aucune clé requise.",
            "available": LocalProvider(settings).is_available(),
            "requires_key": False,
        },
        {
            "key": "replicate",
            "label": "Replicate (IA générative)",
            "description": "Vraie génération vidéo-à-vidéo par modèle de diffusion distant.",
            "available": ReplicateProvider(settings).is_available(),
            "requires_key": True,
        },
    ]
