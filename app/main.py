"""Application FastAPI : API + interface web de MotionForge."""
from __future__ import annotations

import shutil
import uuid
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from . import __version__, video
from .config import get_settings
from .jobs import JobManager
from .providers import available_providers
from .video import MOTION_PRESETS, STYLE_PRESETS, RenderParams

settings = get_settings()
jobs = JobManager(settings)

app = FastAPI(title="MotionForge", version=__version__)

STATIC_DIR = Path(__file__).parent / "static"


# ---------------------------------------------------------------------------
# Métadonnées / capacités
# ---------------------------------------------------------------------------
@app.get("/api/health")
def health() -> dict:
    return {
        "status": "ok",
        "version": __version__,
        "ffmpeg": video.ffmpeg_available(),
    }


@app.get("/api/options")
def options() -> dict:
    """Styles, effets et fournisseurs disponibles (pour peupler l'UI)."""
    return {
        "styles": [
            {"key": p.key, "label": p.label, "description": p.description}
            for p in STYLE_PRESETS.values()
        ],
        "motions": [
            {"key": p.key, "label": p.label, "description": p.description}
            for p in MOTION_PRESETS.values()
        ],
        "providers": available_providers(settings),
        "default_provider": settings.default_provider,
        "max_upload_mb": settings.max_upload_mb,
    }


# ---------------------------------------------------------------------------
# Génération
# ---------------------------------------------------------------------------
@app.post("/api/generate")
async def generate(
    file: UploadFile = File(...),
    provider: str = Form(""),
    prompt: str = Form(""),
    negative_prompt: str = Form(""),
    style: str = Form("cartoon"),
    motion: str = Form("none"),
    intensity: float = Form(1.0),
    speed: float = Form(1.0),
    fps: Optional[int] = Form(None),
    max_height: Optional[int] = Form(None),
    seed: Optional[int] = Form(None),
) -> JSONResponse:
    provider_name = (provider or settings.default_provider).lower()

    # Sauvegarde du fichier source (avec garde-fou de taille).
    src_path = await _save_upload(file)

    try:
        params = RenderParams(
            style=style,
            motion=motion,
            intensity=intensity,
            speed=speed,
            fps=fps or None,
            max_height=max_height or None,
        )
        params.validate()
    except video.VideoError as exc:
        src_path.unlink(missing_ok=True)
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    job = jobs.create_and_start(
        provider_name=provider_name,
        source=src_path,
        source_name=file.filename or src_path.name,
        prompt=prompt.strip(),
        negative_prompt=negative_prompt.strip(),
        params=params,
        seed=seed,
    )
    return JSONResponse({"job_id": job.id, "status": job.status})


@app.get("/api/jobs/{job_id}")
def job_status(job_id: str) -> dict:
    job = jobs.get(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job introuvable.")
    data = job.public()
    if job.output_file:
        data["download_url"] = f"/api/jobs/{job_id}/download"
        data["preview_url"] = f"/api/jobs/{job_id}/preview"
    if job.thumbnail_file:
        data["thumbnail_url"] = f"/media/outputs/{job.thumbnail_file}"
    return data


@app.get("/api/jobs/{job_id}/download")
def download(job_id: str):
    job = jobs.get(job_id)
    if job is None or not job.output_file:
        raise HTTPException(status_code=404, detail="Résultat indisponible.")
    path = settings.outputs_path / job.output_file
    if not path.exists():
        raise HTTPException(status_code=404, detail="Fichier de sortie manquant.")
    filename = f"motionforge_{job_id}.mp4"
    return FileResponse(path, media_type="video/mp4", filename=filename)


@app.get("/api/jobs/{job_id}/preview")
def preview(job_id: str):
    job = jobs.get(job_id)
    if job is None or not job.output_file:
        raise HTTPException(status_code=404, detail="Résultat indisponible.")
    path = settings.outputs_path / job.output_file
    if not path.exists():
        raise HTTPException(status_code=404, detail="Fichier de sortie manquant.")
    return FileResponse(path, media_type="video/mp4")


# ---------------------------------------------------------------------------
# Fichiers statiques (médias + UI)
# ---------------------------------------------------------------------------
app.mount("/media/outputs", StaticFiles(directory=str(settings.outputs_path)), name="outputs")

if STATIC_DIR.exists():
    app.mount("/", StaticFiles(directory=str(STATIC_DIR), html=True), name="ui")


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
async def _save_upload(file: UploadFile) -> Path:
    settings.ensure_dirs()
    suffix = Path(file.filename or "video.mp4").suffix or ".mp4"
    dst = settings.uploads_path / f"{uuid.uuid4().hex[:12]}{suffix}"

    size = 0
    with dst.open("wb") as out:
        while chunk := await file.read(1024 * 1024):
            size += len(chunk)
            if size > settings.max_upload_bytes:
                out.close()
                dst.unlink(missing_ok=True)
                raise HTTPException(
                    status_code=413,
                    detail=f"Fichier trop volumineux (max {settings.max_upload_mb} Mo).",
                )
            out.write(chunk)

    if size == 0:
        dst.unlink(missing_ok=True)
        raise HTTPException(status_code=400, detail="Fichier vide.")
    return dst
