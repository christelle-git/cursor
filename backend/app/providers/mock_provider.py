"""Fournisseur local basé sur ffmpeg.

Ce mode ne fait pas de génération IA générative à proprement parler : il
applique une chaîne de filtres vidéo (étalonnage, grain, flou...) associée à
chaque style pour produire un aperçu instantané, sans dépendre d'une API
externe ni d'une clé secrète. Il sert de :
  - mode de démonstration/test fonctionnant entièrement hors ligne ;
  - filet de sécurité si aucun fournisseur IA n'est configuré.

Pour une vraie génération vidéo-à-vidéo par IA, configurer
`VIDEO_PROVIDER=replicate` (voir `replicate_provider.py`).
"""
from __future__ import annotations

import subprocess
from pathlib import Path
from typing import Callable

from app.providers.base import VideoProvider
from app.styles import StylePreset


class VideoProcessingError(RuntimeError):
    pass


class MockFfmpegProvider(VideoProvider):
    name = "mock"

    def generate(
        self,
        *,
        source_path: Path,
        output_path: Path,
        style: StylePreset,
        prompt: str | None,
        strength: float,
        on_progress: Callable[[float], None] | None = None,
    ) -> None:
        if on_progress:
            on_progress(0.1)

        filter_chain = self._blend_filter_with_strength(style.ffmpeg_filter, strength)

        command = [
            "ffmpeg",
            "-y",
            "-i",
            str(source_path),
            "-vf",
            filter_chain,
            "-c:v",
            "libx264",
            "-preset",
            "veryfast",
            "-crf",
            "23",
            "-c:a",
            "copy",
            str(output_path),
        ]

        if on_progress:
            on_progress(0.35)

        result = subprocess.run(command, capture_output=True, text=True)

        if result.returncode != 0 or not output_path.exists():
            raise VideoProcessingError(
                "Le traitement local ffmpeg a échoué : "
                f"{result.stderr[-2000:] if result.stderr else 'erreur inconnue'}"
            )

        if on_progress:
            on_progress(1.0)

    @staticmethod
    def _blend_filter_with_strength(base_filter: str, strength: float) -> str:
        """Ajuste légèrement l'intensité de l'effet selon le curseur `strength`.

        Les modèles IA réels utilisent `strength` pour arbitrer entre fidélité
        à la vidéo source et réinvention créative. Ici on module simplement le
        contraste/saturation globaux pour donner une sensation cohérente à la
        démo, sans complexifier inutilement la chaîne de filtres ffmpeg.
        """
        strength = max(0.0, min(1.0, strength))
        extra_saturation = 1.0 + (strength - 0.5) * 0.4
        return f"{base_filter},eq=saturation={extra_saturation:.3f}"
