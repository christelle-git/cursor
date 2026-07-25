"""Fournisseur de génération vidéo-à-vidéo par IA, via l'API Replicate.

Nécessite la variable d'environnement `REPLICATE_API_TOKEN` (à définir comme
secret, jamais en dur dans le code). Le modèle utilisé est configurable via
`REPLICATE_MODEL`, par exemple :

  - "luma/modify-video" (par défaut) : transforme le style d'une vidéo en
    conservant sa structure, avec 3 modes d'intensité (adhere/flex/reimagine).
  - "kwaivgi/kling-v3-omni-video" : modèle multimodal (édition vidéo via
    `reference_video` + `video_reference_type="base"`).

D'autres modèles vidéo-à-vidéo de Replicate peuvent être branchés en ajoutant
une entrée dans `_INPUT_BUILDERS` ci-dessous.
"""
from __future__ import annotations

from pathlib import Path
from typing import Callable

import httpx

from app.config import settings
from app.providers.base import VideoProvider
from app.styles import StylePreset


class ReplicateConfigurationError(RuntimeError):
    pass


class ReplicateGenerationError(RuntimeError):
    pass


def _strength_to_luma_mode(strength: float) -> str:
    if strength < 1 / 3:
        return "adhere"
    if strength < 2 / 3:
        return "flex"
    return "reimagine"


def _build_prompt(style: StylePreset, prompt: str | None) -> str:
    return f"{style.prompt}. {prompt}".strip() if prompt else style.prompt


def _luma_modify_video_input(video_file, style: StylePreset, prompt: str | None, strength: float) -> dict:
    return {
        "video": video_file,
        "prompt": _build_prompt(style, prompt),
        "mode": _strength_to_luma_mode(strength),
    }


def _kling_omni_input(video_file, style: StylePreset, prompt: str | None, strength: float) -> dict:
    return {
        "reference_video": video_file,
        "video_reference_type": "base",
        "prompt": _build_prompt(style, prompt),
        "mode": "pro" if strength > 0.6 else "standard",
    }


_INPUT_BUILDERS: dict[str, Callable] = {
    "luma/modify-video": _luma_modify_video_input,
    "kwaivgi/kling-v3-omni-video": _kling_omni_input,
}


class ReplicateProvider(VideoProvider):
    name = "replicate"

    def __init__(self) -> None:
        if not settings.replicate_api_token:
            raise ReplicateConfigurationError(
                "REPLICATE_API_TOKEN manquant. Ajoutez ce secret dans le "
                "Cursor Dashboard (Cloud Agents > Secrets) ou dans votre .env."
            )
        try:
            import replicate as replicate_sdk
        except ImportError as exc:  # pragma: no cover - dépend de l'install
            raise ReplicateConfigurationError(
                "Le paquet python 'replicate' n'est pas installé."
            ) from exc

        self._client = replicate_sdk.Client(api_token=settings.replicate_api_token)

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
        model = settings.replicate_model
        input_builder = _INPUT_BUILDERS.get(model)
        if input_builder is None:
            raise ReplicateConfigurationError(
                f"Modèle Replicate non pris en charge par cette intégration: {model}. "
                f"Modèles disponibles: {', '.join(_INPUT_BUILDERS)}"
            )

        if on_progress:
            on_progress(0.1)

        with source_path.open("rb") as video_file:
            model_input = input_builder(video_file, style, prompt, strength)
            output = self._client.run(model, input=model_input)

        if on_progress:
            on_progress(0.75)

        video_url = self._extract_video_url(output)
        self._download(video_url, output_path)

        if on_progress:
            on_progress(1.0)

    @staticmethod
    def _extract_video_url(output) -> str:
        # La forme du résultat varie selon le modèle : url unique, objet
        # FileOutput, liste, ou dict avec une clé "video".
        if isinstance(output, str):
            return output
        if isinstance(output, list) and output:
            return ReplicateProvider._extract_video_url(output[0])
        if isinstance(output, dict) and "video" in output:
            return ReplicateProvider._extract_video_url(output["video"])
        url_attr = getattr(output, "url", None)
        if url_attr:
            return url_attr() if callable(url_attr) else str(url_attr)
        raise ReplicateGenerationError(
            f"Impossible d'extraire l'URL vidéo de la réponse Replicate: {output!r}"
        )

    @staticmethod
    def _download(url: str, destination: Path) -> None:
        with httpx.stream("GET", url, timeout=300.0, follow_redirects=True) as response:
            response.raise_for_status()
            with destination.open("wb") as f:
                for chunk in response.iter_bytes(chunk_size=1024 * 1024):
                    f.write(chunk)
