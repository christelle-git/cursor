from __future__ import annotations

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app import job_manager, storage
from app.config import settings
from app.models import GenerationJob, GenerationRequest, StylePresetOut, UploadedVideo
from app.styles import STYLE_PRESETS

app = FastAPI(
    title="ClipForge AI",
    description=(
        "API de génération vidéo par IA à partir d'une vidéo existante "
        "(vidéo-à-vidéo, restylisation, motion design)."
    ),
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/media/uploads", StaticFiles(directory=str(settings.uploads_dir)), name="uploads")
app.mount("/media/outputs", StaticFiles(directory=str(settings.outputs_dir)), name="outputs")


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok", "provider": settings.video_provider}


@app.get("/api/styles", response_model=list[StylePresetOut])
def list_styles() -> list[StylePresetOut]:
    return [
        StylePresetOut(id=s.id, label=s.label, description=s.description, accent=s.accent)
        for s in STYLE_PRESETS
    ]


@app.post("/api/uploads", response_model=UploadedVideo)
async def upload_video(file: UploadFile = File(...)) -> UploadedVideo:
    try:
        video_id, path = await storage.save_upload(file)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return UploadedVideo(
        video_id=video_id,
        filename=file.filename or path.name,
        url=f"/media/uploads/{path.name}",
        size_bytes=path.stat().st_size,
        content_type=file.content_type,
    )


@app.post("/api/generations", response_model=GenerationJob)
async def create_generation(request: GenerationRequest) -> GenerationJob:
    try:
        return job_manager.create_job(
            video_id=request.video_id,
            style_id=request.style_id,
            prompt=request.prompt,
            strength=request.strength,
        )
    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@app.get("/api/generations", response_model=list[GenerationJob])
def list_generations() -> list[GenerationJob]:
    return job_manager.list_jobs()


@app.get("/api/generations/{job_id}", response_model=GenerationJob)
def get_generation(job_id: str) -> GenerationJob:
    job = job_manager.get_job(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job introuvable")
    return job
