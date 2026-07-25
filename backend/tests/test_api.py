from __future__ import annotations

import time

from fastapi.testclient import TestClient

from app.config import settings
from app.main import app
from tests.conftest import requires_ffmpeg

client = TestClient(app)


def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_list_styles_returns_presets():
    response = client.get("/api/styles")
    assert response.status_code == 200
    styles = response.json()
    assert len(styles) >= 5
    ids = {s["id"] for s in styles}
    assert "cinematic" in ids
    assert "anime" in ids


def test_upload_rejects_unsupported_extension(tmp_path):
    bogus = tmp_path / "not_a_video.txt"
    bogus.write_text("hello")
    with bogus.open("rb") as f:
        response = client.post("/api/uploads", files={"file": ("not_a_video.txt", f, "text/plain")})
    assert response.status_code == 400


@requires_ffmpeg
def test_upload_then_generate_full_flow(sample_video_path):
    with sample_video_path.open("rb") as f:
        upload_response = client.post(
            "/api/uploads", files={"file": ("source_sample.mp4", f, "video/mp4")}
        )
    assert upload_response.status_code == 200
    video_id = upload_response.json()["video_id"]

    generation_response = client.post(
        "/api/generations",
        json={"video_id": video_id, "style_id": "cinematic", "prompt": "test", "strength": 0.4},
    )
    assert generation_response.status_code == 200
    job = generation_response.json()
    job_id = job["job_id"]
    assert job["status"] in {"queued", "processing", "succeeded"}

    deadline = time.time() + 30
    final_job = job
    while time.time() < deadline:
        status_response = client.get(f"/api/generations/{job_id}")
        assert status_response.status_code == 200
        final_job = status_response.json()
        if final_job["status"] in {"succeeded", "failed"}:
            break
        time.sleep(0.3)

    assert final_job["status"] == "succeeded", final_job
    assert final_job["output_url"]

    # Le montage StaticFiles est résolu au démarrage de l'app ; en test, le
    # dossier de stockage est redirigé vers un répertoire temporaire, donc on
    # vérifie directement la présence du fichier généré sur disque plutôt que
    # via le mount HTTP (qui pointe toujours vers le dossier de démarrage).
    output_path = settings.outputs_dir / f"{job_id}.mp4"
    assert output_path.exists()
    assert output_path.stat().st_size > 0


def test_generate_with_unknown_video_returns_404():
    response = client.post(
        "/api/generations",
        json={"video_id": "unknown-id", "style_id": "cinematic", "strength": 0.5},
    )
    assert response.status_code == 404


@requires_ffmpeg
def test_generate_with_unknown_style_returns_400(sample_video_path):
    with sample_video_path.open("rb") as f:
        upload_response = client.post(
            "/api/uploads", files={"file": ("source_sample.mp4", f, "video/mp4")}
        )
    video_id = upload_response.json()["video_id"]

    response = client.post(
        "/api/generations",
        json={"video_id": video_id, "style_id": "does-not-exist", "strength": 0.5},
    )
    assert response.status_code == 400
