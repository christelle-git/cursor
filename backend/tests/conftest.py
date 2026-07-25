from __future__ import annotations

import shutil
import subprocess

import pytest

from app import job_manager
from app.config import settings
from app.providers import reset_provider_cache


def _ffmpeg_available() -> bool:
    return shutil.which("ffmpeg") is not None


requires_ffmpeg = pytest.mark.skipif(not _ffmpeg_available(), reason="ffmpeg introuvable sur ce système")


@pytest.fixture(autouse=True)
def isolated_storage(tmp_path, monkeypatch):
    monkeypatch.setattr(settings, "storage_dir", tmp_path)
    monkeypatch.setattr(settings, "video_provider", "mock")
    job_manager.reset_jobs_for_tests()
    reset_provider_cache()
    yield
    job_manager.reset_jobs_for_tests()
    reset_provider_cache()


@pytest.fixture
def sample_video_path(tmp_path):
    """Génère une courte vidéo de test avec ffmpeg (mire de couleurs)."""
    path = tmp_path / "source_sample.mp4"
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-f",
            "lavfi",
            "-i",
            "testsrc=duration=1:size=64x64:rate=10",
            "-pix_fmt",
            "yuv420p",
            str(path),
        ],
        check=True,
        capture_output=True,
    )
    return path
