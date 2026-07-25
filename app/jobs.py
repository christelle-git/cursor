"""Gestionnaire de jobs de génération en mémoire, exécutés en arrière-plan."""
from __future__ import annotations

import threading
import time
import uuid
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Optional

from .config import Settings
from .providers import GenerationRequest, ProviderError, get_provider
from .video import RenderParams


@dataclass
class Job:
    id: str
    provider: str
    status: str = "queued"  # queued | running | done | error
    progress: float = 0.0
    message: str = "En attente…"
    source_name: str = ""
    output_file: Optional[str] = None
    thumbnail_file: Optional[str] = None
    error: Optional[str] = None
    created_at: float = field(default_factory=time.time)
    params: dict = field(default_factory=dict)

    def public(self) -> dict:
        data = asdict(self)
        return data


class JobManager:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self._jobs: dict[str, Job] = {}
        self._lock = threading.Lock()

    def get(self, job_id: str) -> Optional[Job]:
        with self._lock:
            return self._jobs.get(job_id)

    def create_and_start(
        self,
        *,
        provider_name: str,
        source: Path,
        source_name: str,
        prompt: str,
        negative_prompt: str,
        params: RenderParams,
        seed: Optional[int],
    ) -> Job:
        job_id = uuid.uuid4().hex[:12]
        output = self.settings.outputs_path / f"{job_id}.mp4"
        job = Job(
            id=job_id,
            provider=provider_name,
            source_name=source_name,
            params={
                "style": params.style,
                "motion": params.motion,
                "intensity": params.intensity,
                "fps": params.fps,
                "max_height": params.max_height,
                "speed": params.speed,
                "prompt": prompt,
            },
        )
        with self._lock:
            self._jobs[job_id] = job

        thread = threading.Thread(
            target=self._run,
            args=(job, provider_name, source, output, prompt, negative_prompt, params, seed),
            daemon=True,
        )
        thread.start()
        return job

    def _run(
        self,
        job: Job,
        provider_name: str,
        source: Path,
        output: Path,
        prompt: str,
        negative_prompt: str,
        params: RenderParams,
        seed: Optional[int],
    ) -> None:
        def progress(value: float, message: str) -> None:
            with self._lock:
                job.progress = round(value, 4)
                job.message = message
                if job.status == "queued":
                    job.status = "running"

        try:
            with self._lock:
                job.status = "running"
                job.message = "Initialisation…"

            provider = get_provider(provider_name, self.settings)
            req = GenerationRequest(
                source=source,
                output=output,
                prompt=prompt,
                negative_prompt=negative_prompt,
                params=params,
                seed=seed,
            )
            result = provider.generate(req, progress=progress)

            # Vignette du résultat (best-effort).
            thumb = self.settings.outputs_path / f"{job.id}.jpg"
            try:
                from .video import make_thumbnail

                make_thumbnail(result, thumb)
            except Exception:  # noqa: BLE001
                thumb = None

            with self._lock:
                job.status = "done"
                job.progress = 1.0
                job.message = "Génération terminée."
                job.output_file = result.name
                job.thumbnail_file = thumb.name if thumb and thumb.exists() else None
        except (ProviderError, Exception) as exc:  # noqa: BLE001
            with self._lock:
                job.status = "error"
                job.error = str(exc)
                job.message = "Échec de la génération."
