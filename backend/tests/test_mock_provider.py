from __future__ import annotations

from app.providers.mock_provider import MockFfmpegProvider
from app.styles import STYLE_PRESETS, get_style
from tests.conftest import requires_ffmpeg


def test_get_style_returns_known_preset():
    style = get_style("cyberpunk")
    assert style.id == "cyberpunk"
    assert style.label == "Cyberpunk"


def test_get_style_raises_on_unknown_id():
    import pytest

    with pytest.raises(ValueError):
        get_style("does-not-exist")


def test_all_presets_have_required_fields():
    assert len(STYLE_PRESETS) >= 5
    for preset in STYLE_PRESETS:
        assert preset.id
        assert preset.label
        assert preset.prompt
        assert preset.ffmpeg_filter
        assert preset.accent


@requires_ffmpeg
def test_mock_provider_generates_output_file(tmp_path, sample_video_path):
    provider = MockFfmpegProvider()
    output_path = tmp_path / "output.mp4"
    progress_values: list[float] = []

    provider.generate(
        source_path=sample_video_path,
        output_path=output_path,
        style=get_style("anime"),
        prompt="test prompt",
        strength=0.7,
        on_progress=progress_values.append,
    )

    assert output_path.exists()
    assert output_path.stat().st_size > 0
    assert progress_values[-1] == 1.0


@requires_ffmpeg
def test_mock_provider_raises_on_missing_source(tmp_path):
    provider = MockFfmpegProvider()
    from app.providers.mock_provider import VideoProcessingError
    import pytest

    with pytest.raises(VideoProcessingError):
        provider.generate(
            source_path=tmp_path / "does-not-exist.mp4",
            output_path=tmp_path / "out.mp4",
            style=get_style("cinematic"),
            prompt=None,
            strength=0.5,
        )
