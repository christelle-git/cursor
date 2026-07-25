"""Tests d'intégration de l'API (endpoints + génération locale bout-en-bout)."""
from __future__ import annotations

import shutil
import subprocess
import time
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

FFMPEG = shutil.which("ffmpeg") is not None


def test_health():
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_options():
    r = client.get("/api/options")
    assert r.status_code == 200
    data = r.json()
    assert any(s["key"] == "cartoon" for s in data["styles"])
    assert any(p["key"] == "local" for p in data["providers"])


def _make_sample(path: Path) -> None:
    """Génère une petite vidéo de test avec ffmpeg."""
    subprocess.run(
        [
            "ffmpeg", "-y", "-f", "lavfi", "-i", "testsrc=size=320x240:rate=15:duration=1",
            "-pix_fmt", "yuv420p", str(path),
        ],
        check=True,
        capture_output=True,
    )


@pytest.mark.skipif(not FFMPEG, reason="ffmpeg requis")
def test_generate_end_to_end(tmp_path: Path):
    sample = tmp_path / "sample.mp4"
    _make_sample(sample)

    with sample.open("rb") as fh:
        r = client.post(
            "/api/generate",
            files={"file": ("sample.mp4", fh, "video/mp4")},
            data={"provider": "local", "style": "cartoon", "motion": "none"},
        )
    assert r.status_code == 200, r.text
    job_id = r.json()["job_id"]

    # Polling jusqu'à complétion.
    deadline = time.time() + 60
    status = None
    while time.time() < deadline:
        s = client.get(f"/api/jobs/{job_id}").json()
        status = s["status"]
        if status in {"done", "error"}:
            break
        time.sleep(0.5)

    assert status == "done", s
    dl = client.get(f"/api/jobs/{job_id}/download")
    assert dl.status_code == 200
    assert dl.headers["content-type"] == "video/mp4"
    assert len(dl.content) > 0


def test_generate_rejects_empty_file():
    r = client.post(
        "/api/generate",
        files={"file": ("empty.mp4", b"", "video/mp4")},
        data={"provider": "local"},
    )
    assert r.status_code == 400


def test_job_not_found():
    r = client.get("/api/jobs/doesnotexist")
    assert r.status_code == 404
