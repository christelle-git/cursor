"""Fournisseur Replicate : vraie génération vidéo-à-vidéo par modèle distant.

Nécessite `REPLICATE_API_TOKEN`. Le flux est :
  1. Upload de la vidéo source via l'API Files de Replicate.
  2. Création d'une prédiction sur le modèle vidéo-à-vidéo configuré.
  3. Polling jusqu'à complétion.
  4. Téléchargement de la vidéo générée.

L'implémentation reste défensive : si le token est absent, `is_available()`
renvoie False et l'UI bascule sur le fournisseur local.
"""
from __future__ import annotations

import time
from pathlib import Path
from typing import Any, Optional

import httpx

from ..config import Settings
from .base import GenerationRequest, Provider, ProgressCb, ProviderError

API_BASE = "https://api.replicate.com/v1"
POLL_INTERVAL = 3.0
MAX_WAIT_SECONDS = 900  # 15 min


class ReplicateProvider(Provider):
    key = "replicate"

    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.token = settings.replicate_api_token
        self.model = settings.replicate_model

    def is_available(self) -> bool:
        return bool(self.token) and bool(self.model)

    # ------------------------------------------------------------------
    def generate(self, req: GenerationRequest, progress: Optional[ProgressCb] = None) -> Path:
        if not self.is_available():
            raise ProviderError(
                "Fournisseur Replicate indisponible : définissez REPLICATE_API_TOKEN "
                "et MF_REPLICATE_MODEL."
            )

        headers = {"Authorization": f"Bearer {self.token}"}
        with httpx.Client(timeout=120.0, headers=headers) as client:
            self._emit(progress, 0.05, "Envoi de la vidéo source à Replicate…")
            file_url = self._upload_file(client, req.source)

            self._emit(progress, 0.2, "Création de la prédiction…")
            prediction = self._create_prediction(client, file_url, req)

            output_url = self._poll(client, prediction, progress)

            self._emit(progress, 0.95, "Téléchargement du résultat…")
            self._download(client, output_url, req.output)

        self._emit(progress, 1.0, "Terminé.")
        return req.output

    # ------------------------------------------------------------------
    def _upload_file(self, client: httpx.Client, path: Path) -> str:
        with path.open("rb") as fh:
            resp = client.post(
                f"{API_BASE}/files",
                files={"content": (path.name, fh, "video/mp4")},
            )
        _raise_for_status(resp, "upload du fichier")
        data = resp.json()
        url = (data.get("urls") or {}).get("get") or data.get("url")
        if not url:
            raise ProviderError("Réponse d'upload Replicate inattendue (URL absente).")
        return url

    def _create_prediction(
        self, client: httpx.Client, file_url: str, req: GenerationRequest
    ) -> dict[str, Any]:
        model_input: dict[str, Any] = {
            "video": file_url,
            "prompt": req.prompt or "cinematic, high quality",
        }
        if req.negative_prompt:
            model_input["negative_prompt"] = req.negative_prompt
        if req.seed is not None:
            model_input["seed"] = req.seed

        if ":" in self.model:
            # owner/name:version -> endpoint générique /predictions
            _, _, version = self.model.partition(":")
            payload = {"version": version, "input": model_input}
            resp = client.post(f"{API_BASE}/predictions", json=payload)
        else:
            # owner/name -> endpoint modèle officiel
            resp = client.post(
                f"{API_BASE}/models/{self.model}/predictions",
                json={"input": model_input},
            )
        _raise_for_status(resp, "création de la prédiction")
        return resp.json()

    def _poll(
        self, client: httpx.Client, prediction: dict[str, Any], progress: Optional[ProgressCb]
    ) -> str:
        get_url = (prediction.get("urls") or {}).get("get")
        if not get_url:
            raise ProviderError("URL de suivi de prédiction absente.")

        start = time.monotonic()
        while True:
            if time.monotonic() - start > MAX_WAIT_SECONDS:
                raise ProviderError("Délai dépassé en attendant Replicate.")

            resp = client.get(get_url)
            _raise_for_status(resp, "suivi de la prédiction")
            data = resp.json()
            status = data.get("status")

            if status == "succeeded":
                return _extract_output_url(data.get("output"))
            if status in {"failed", "canceled"}:
                raise ProviderError(f"Génération Replicate {status} : {data.get('error')}")

            # 20% -> 90% pendant le traitement.
            elapsed = time.monotonic() - start
            frac = min(elapsed / 120.0, 1.0)
            self._emit(progress, 0.2 + frac * 0.7, f"Génération en cours ({status})…")
            time.sleep(POLL_INTERVAL)

    def _download(self, client: httpx.Client, url: str, dst: Path) -> None:
        dst.parent.mkdir(parents=True, exist_ok=True)
        with client.stream("GET", url) as resp:
            _raise_for_status(resp, "téléchargement du résultat")
            with dst.open("wb") as fh:
                for chunk in resp.iter_bytes():
                    fh.write(chunk)


def _extract_output_url(output: Any) -> str:
    if isinstance(output, str):
        return output
    if isinstance(output, list) and output:
        return str(output[-1])
    if isinstance(output, dict):
        for key in ("video", "output", "url"):
            if output.get(key):
                return str(output[key])
    raise ProviderError("Impossible d'extraire l'URL de sortie de Replicate.")


def _raise_for_status(resp: httpx.Response, action: str) -> None:
    if resp.status_code >= 400:
        try:
            detail = resp.json()
        except Exception:  # noqa: BLE001
            detail = resp.text
        raise ProviderError(f"Erreur Replicate lors de {action} ({resp.status_code}) : {detail}")
