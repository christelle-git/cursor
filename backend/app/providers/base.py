"""Interface commune à tous les fournisseurs de génération vidéo-à-vidéo.

Cette abstraction permet de brancher n'importe quel service de génération
(Replicate, Runway, Kling, Luma, un modèle auto-hébergé...) sans modifier le
reste de l'application. Chaque fournisseur reçoit une vidéo source et des
paramètres de style, et doit produire un fichier vidéo de sortie.
"""
from __future__ import annotations

from abc import ABC, abstractmethod
from pathlib import Path

from app.styles import StylePreset


class VideoProvider(ABC):
    name: str = "base"

    @abstractmethod
    def generate(
        self,
        *,
        source_path: Path,
        output_path: Path,
        style: StylePreset,
        prompt: str | None,
        strength: float,
        on_progress: "callable | None" = None,
    ) -> None:
        """Transforme `source_path` en une nouvelle vidéo écrite sur `output_path`.

        Doit lever une exception explicite en cas d'échec ; l'appelant se
        charge de journaliser l'erreur et de mettre à jour le statut du job.
        """
        raise NotImplementedError
