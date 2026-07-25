from __future__ import annotations

import time
import uuid
from enum import Enum

from pydantic import BaseModel, Field


class JobStatus(str, Enum):
    QUEUED = "queued"
    PROCESSING = "processing"
    SUCCEEDED = "succeeded"
    FAILED = "failed"


class UploadedVideo(BaseModel):
    video_id: str
    filename: str
    url: str
    size_bytes: int
    content_type: str | None = None


class StylePresetOut(BaseModel):
    id: str
    label: str
    description: str
    accent: str


class GenerationRequest(BaseModel):
    video_id: str
    style_id: str
    prompt: str | None = Field(
        default=None,
        description="Instruction libre en complément du style choisi (facultatif).",
    )
    strength: float = Field(
        default=0.5,
        ge=0.0,
        le=1.0,
        description="Intensité de la transformation : proche de l'original (0) à réinvention complète (1).",
    )


class GenerationJob(BaseModel):
    job_id: str = Field(default_factory=lambda: uuid.uuid4().hex[:12])
    video_id: str
    source_url: str
    style_id: str
    prompt: str | None = None
    strength: float = 0.5
    status: JobStatus = JobStatus.QUEUED
    progress: float = 0.0
    provider: str = "mock"
    output_url: str | None = None
    error: str | None = None
    created_at: float = Field(default_factory=time.time)
    updated_at: float = Field(default_factory=time.time)

    def touch(self) -> None:
        self.updated_at = time.time()
