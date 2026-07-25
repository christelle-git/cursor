"""Tests unitaires du moteur vidéo (construction de filtergraphs & presets)."""
from __future__ import annotations

import pytest

from app.video import (
    MOTION_PRESETS,
    STYLE_PRESETS,
    RenderParams,
    VideoError,
    VideoInfo,
    _atempo_chain,
    _parse_fraction,
    build_filtergraph,
)


def _info() -> VideoInfo:
    return VideoInfo(duration=4.0, width=640, height=480, fps=30.0, codec="h264", has_audio=False)


def test_parse_fraction():
    assert _parse_fraction("30/1") == 30.0
    assert _parse_fraction("30000/1001") == pytest.approx(29.97, abs=0.01)
    assert _parse_fraction("0/0") == 0.0
    assert _parse_fraction("garbage") == 0.0


def test_presets_present():
    assert "cartoon" in STYLE_PRESETS
    assert "none" in STYLE_PRESETS
    assert "zoom" in MOTION_PRESETS
    assert "none" in MOTION_PRESETS


def test_build_filtergraph_basic():
    fg = build_filtergraph(RenderParams(style="cartoon", motion="none"), _info())
    assert "edgedetect" in fg


def test_build_filtergraph_none_style():
    fg = build_filtergraph(RenderParams(style="none", motion="none"), _info())
    assert fg == "null"


def test_build_filtergraph_with_motion_and_speed():
    fg = build_filtergraph(
        RenderParams(style="neon", motion="zoom", speed=2.0, fps=24), _info()
    )
    assert "zoompan" in fg
    assert "setpts=0.5000*PTS" in fg
    assert "fps=24" in fg


def test_max_height_scale():
    fg = build_filtergraph(RenderParams(style="none", motion="none", max_height=240), _info())
    assert "scale=-2:240" in fg


def test_validate_rejects_unknown_style():
    with pytest.raises(VideoError):
        RenderParams(style="__nope__").validate()


def test_validate_rejects_bad_intensity():
    with pytest.raises(VideoError):
        RenderParams(intensity=5.0).validate()


def test_validate_rejects_bad_speed():
    with pytest.raises(VideoError):
        RenderParams(speed=10.0).validate()


def test_atempo_chain():
    assert _atempo_chain(1.5).count("atempo") == 1
    # >2 doit être décomposé.
    assert _atempo_chain(4.0).count("atempo") >= 2
    # <0.5 doit être décomposé.
    assert _atempo_chain(0.25).count("atempo") >= 2
