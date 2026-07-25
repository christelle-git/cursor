"""Interface commune des fournisseurs de génération vidéo-à-vidéo."""
from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from pathlib import Path
from typing import Callable, Optional

from ..video import RenderParams


class ProviderError(RuntimeError):
    """Erreur émise par un fournisseur (config manquante, appel distant KO...)."""


ProgressCb = Callable[[float, str], None]


@dataclass
class GenerationRequest:
    """Requête de génération transmise à un fournisseur."""

    source: Path
    output: Path
    prompt: str = ""
    negative_prompt: str = ""
    params: RenderParams = field(default_factory=RenderParams)
    seed: Optional[int] = None


class Provider(ABC):
    """Contrat que chaque fournisseur doit respecter."""

    key: str = "base"

    @abstractmethod
    def is_available(self) -> bool:
        """Le fournisseur est-il utilisable (dépendances / clés présentes) ?"""

    @abstractmethod
    def generate(self, req: GenerationRequest, progress: Optional[ProgressCb] = None) -> Path:
        """Génère la vidéo de sortie et retourne son chemin."""

    def _emit(self, progress: Optional[ProgressCb], value: float, message: str) -> None:
        if progress:
            progress(max(0.0, min(value, 1.0)), message)
