"""Gestion en mémoire des jobs de génération vidéo.

Un stockage en mémoire suffit pour ce projet (mono-instance). Pour une mise en
production multi-worker, remplacer par une file (Redis/RQ, Celery...) et une
base persistante, en conservant la même interface publique.
"""
from __future__ import annotations

import asyncio
import logging
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from app.config import settings
from app.models import GenerationJob, JobStatus
from app.providers import get_provider
from app.storage import find_upload_path, output_path_for
from app.styles import get_style

logger = logging.getLogger("clipforge.jobs")

_jobs: dict[str, GenerationJob] = {}
_executor = ThreadPoolExecutor(max_workers=2)


def list_jobs() -> list[GenerationJob]:
    return sorted(_jobs.values(), key=lambda job: job.created_at, reverse=True)


def get_job(job_id: str) -> GenerationJob | None:
    return _jobs.get(job_id)


def create_job(*, video_id: str, style_id: str, prompt: str | None, strength: float) -> GenerationJob:
    style = get_style(style_id)  # valide l'existence du style, lève sinon
    source_path = find_upload_path(video_id)  # lève si la vidéo n'existe pas

    job = GenerationJob(
        video_id=video_id,
        source_url=f"/media/uploads/{source_path.name}",
        style_id=style.id,
        prompt=prompt,
        strength=strength,
        provider=settings.video_provider,
    )
    _jobs[job.job_id] = job

    loop = asyncio.get_running_loop()
    loop.run_in_executor(_executor, _run_job, job.job_id, source_path)

    return job


def _run_job(job_id: str, source_path: Path) -> None:
    job = _jobs[job_id]
    job.status = JobStatus.PROCESSING
    job.touch()

    def on_progress(value: float) -> None:
        job.progress = value
        job.touch()

    try:
        style = get_style(job.style_id)
        provider = get_provider()
        output_path = output_path_for(job.job_id)

        provider.generate(
            source_path=source_path,
            output_path=output_path,
            style=style,
            prompt=job.prompt,
            strength=job.strength,
            on_progress=on_progress,
        )

        job.output_url = f"/media/outputs/{output_path.name}"
        job.status = JobStatus.SUCCEEDED
        job.progress = 1.0
    except Exception as exc:  # noqa: BLE001 - on veut capturer toute erreur provider
        logger.exception("Génération échouée pour le job %s", job_id)
        job.status = JobStatus.FAILED
        job.error = str(exc)
    finally:
        job.touch()


def reset_jobs_for_tests() -> None:
    _jobs.clear()
