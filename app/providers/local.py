"""Fournisseur local : restyling vidéo-à-vidéo via ffmpeg (hors-ligne).

Ce fournisseur ne dépend d'aucun service externe. Il applique la bibliothèque
de styles et d'effets de mouvement définie dans `app.video` pour transformer
une vidéo existante en une nouvelle vidéo au rendu "motion design".
"""
from __future__ import annotations

from typing import Optional

from ..config import Settings
from .. import video
from .base import GenerationRequest, Provider, ProgressCb, ProviderError


class LocalProvider(Provider):
    key = "local"

    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    def is_available(self) -> bool:
        return video.ffmpeg_available()

    def generate(self, req: GenerationRequest, progress: Optional[ProgressCb] = None) -> Path:
        if not self.is_available():
            raise ProviderError("ffmpeg est requis pour le fournisseur local.")

        self._emit(progress, 0.02, "Analyse de la vidéo source…")
        try:
            info = video.probe(req.source)
        except video.VideoError as exc:
            raise ProviderError(str(exc)) from exc

        style_label = video.STYLE_PRESETS[req.params.style].label
        self._emit(progress, 0.08, f"Application du style « {style_label} »…")

        def on_ff_progress(p: float) -> None:
            # Réserve 8% -> 99% pour l'encodage ffmpeg.
            self._emit(progress, 0.08 + p * 0.91, f"Rendu ({int(p * 100)}%)…")

        try:
            out = video.render(
                src=req.source,
                dst=req.output,
                params=req.params,
                info=info,
                progress_cb=on_ff_progress,
            )
        except video.VideoError as exc:
            raise ProviderError(str(exc)) from exc

        self._emit(progress, 1.0, "Terminé.")
        return out
