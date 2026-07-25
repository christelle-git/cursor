"""Aide-t à l'écriture/lecture des fichiers vidéo sur disque local."""
from __future__ import annotations

import uuid
from pathlib import Path

from fastapi import UploadFile

from app.config import settings

ALLOWED_EXTENSIONS = {".mp4", ".mov", ".webm", ".mkv", ".avi", ".m4v"}


def _safe_extension(filename: str) -> str:
    suffix = Path(filename).suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise ValueError(
            f"Format de fichier non supporté ({suffix or 'inconnu'}). "
            f"Formats acceptés : {', '.join(sorted(ALLOWED_EXTENSIONS))}"
        )
    return suffix


async def save_upload(upload: UploadFile) -> tuple[str, Path]:
    """Sauvegarde un fichier uploadé et renvoie (video_id, chemin_disque)."""
    extension = _safe_extension(upload.filename or "video.mp4")
    video_id = uuid.uuid4().hex[:16]
    destination = settings.uploads_dir / f"{video_id}{extension}"

    size = 0
    chunk_size = 1024 * 1024
    with destination.open("wb") as buffer:
        while chunk := await upload.read(chunk_size):
            size += len(chunk)
            if size > settings.max_upload_size_bytes:
                buffer.close()
                destination.unlink(missing_ok=True)
                raise ValueError(
                    "Fichier trop volumineux "
                    f"(max {settings.max_upload_size_bytes // (1024 * 1024)} Mo)."
                )
            buffer.write(chunk)

    if size == 0:
        destination.unlink(missing_ok=True)
        raise ValueError("Le fichier envoyé est vide.")

    return video_id, destination


def find_upload_path(video_id: str) -> Path:
    for path in settings.uploads_dir.glob(f"{video_id}.*"):
        return path
    raise FileNotFoundError(f"Vidéo introuvable pour l'identifiant {video_id}")


def output_path_for(job_id: str, extension: str = ".mp4") -> Path:
    return settings.outputs_dir / f"{job_id}{extension}"
