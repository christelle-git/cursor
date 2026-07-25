"""Utilitaires vidéo bâtis sur ffmpeg / ffprobe.

Ce module fournit :
  - `ffmpeg_available()` / `probe()` : introspection.
  - `STYLE_PRESETS` : une bibliothèque de styles "motion design" (filtergraphs).
  - `MOTION_PRESETS` : effets de mouvement (Ken Burns, secousse, glitch...).
  - `build_filtergraph()` / `render()` : construction et exécution du rendu.

L'idée : offrir un moteur de transformation vidéo-à-vidéo local, déterministe et
hors-ligne, réutilisé par le fournisseur `local`. Le fournisseur `replicate`
délègue lui à un vrai modèle génératif distant.
"""
from __future__ import annotations

import json
import shutil
import subprocess
from dataclasses import dataclass, field
from pathlib import Path
from typing import Callable, Optional


class VideoError(RuntimeError):
    """Erreur liée au traitement vidéo (ffmpeg absent, fichier invalide...)."""


# ---------------------------------------------------------------------------
# Introspection
# ---------------------------------------------------------------------------
def ffmpeg_available() -> bool:
    return shutil.which("ffmpeg") is not None and shutil.which("ffprobe") is not None


@dataclass
class VideoInfo:
    duration: float
    width: int
    height: int
    fps: float
    codec: str
    has_audio: bool

    def as_dict(self) -> dict:
        return {
            "duration": round(self.duration, 3),
            "width": self.width,
            "height": self.height,
            "fps": round(self.fps, 3),
            "codec": self.codec,
            "has_audio": self.has_audio,
        }


def probe(path: Path) -> VideoInfo:
    """Retourne les métadonnées d'une vidéo via ffprobe."""
    if not ffmpeg_available():
        raise VideoError("ffmpeg/ffprobe introuvable sur ce système.")

    cmd = [
        "ffprobe",
        "-v",
        "error",
        "-print_format",
        "json",
        "-show_format",
        "-show_streams",
        str(path),
    ]
    out = subprocess.run(cmd, capture_output=True, text=True)
    if out.returncode != 0:
        raise VideoError(f"ffprobe a échoué : {out.stderr.strip()}")

    data = json.loads(out.stdout or "{}")
    streams = data.get("streams", [])
    video_stream = next((s for s in streams if s.get("codec_type") == "video"), None)
    if video_stream is None:
        raise VideoError("Aucun flux vidéo détecté dans le fichier.")

    has_audio = any(s.get("codec_type") == "audio" for s in streams)
    fps = _parse_fraction(video_stream.get("avg_frame_rate") or video_stream.get("r_frame_rate", "0/1"))
    duration = float(data.get("format", {}).get("duration") or video_stream.get("duration") or 0.0)

    return VideoInfo(
        duration=duration,
        width=int(video_stream.get("width", 0)),
        height=int(video_stream.get("height", 0)),
        fps=fps,
        codec=str(video_stream.get("codec_name", "")),
        has_audio=has_audio,
    )


def _parse_fraction(frac: str) -> float:
    try:
        num, _, den = frac.partition("/")
        den_val = float(den) if den else 1.0
        return float(num) / den_val if den_val else 0.0
    except (ValueError, ZeroDivisionError):
        return 0.0


# ---------------------------------------------------------------------------
# Bibliothèque de styles (filtergraphs ffmpeg)
# ---------------------------------------------------------------------------
@dataclass
class StylePreset:
    key: str
    label: str
    description: str
    # Fonction qui retourne la chaîne de filtres vidéo.
    filters: Callable[[], str]


def _cartoon() -> str:
    # Postérisation + accentuation des contours -> effet "toon / illustration".
    return (
        "format=yuv444p,"
        "eq=saturation=1.6:contrast=1.15,"
        "curves=preset=increase_contrast,"
        "edgedetect=low=0.06:high=0.18:mode=colormix,"
        "gblur=sigma=0.4"
    )


def _neon() -> str:
    return (
        "eq=saturation=1.9:contrast=1.25:brightness=0.02,"
        "hue=h=15,"
        "gblur=sigma=1.2,"
        "eq=gamma=0.9,"
        "vignette=PI/5"
    )


def _cyberpunk() -> str:
    return (
        "curves=preset=strong_contrast,"
        "eq=saturation=1.7:contrast=1.2,"
        "hue=h=-20:s=1.3,"
        "colorbalance=rs=0.15:gs=-0.05:bs=0.25:rm=0.1:bm=0.2,"
        "vignette=PI/4"
    )


def _vintage() -> str:
    return (
        "curves=preset=vintage,"
        "eq=saturation=0.75:contrast=0.95:brightness=0.03,"
        "noise=alls=8:allf=t,"
        "vignette=PI/4.5"
    )


def _noir() -> str:
    return (
        "hue=s=0,"
        "eq=contrast=1.4:brightness=-0.02,"
        "curves=preset=strong_contrast,"
        "vignette=PI/4"
    )


def _sketch() -> str:
    return (
        "hue=s=0,"
        "edgedetect=low=0.1:high=0.3,"
        "negate,"
        "eq=contrast=1.3:brightness=0.05"
    )


def _dreamy() -> str:
    # "Glow / bloom" doux via superposition d'une version floutée.
    return (
        "split[a][b];"
        "[b]gblur=sigma=12,eq=brightness=0.06[blur];"
        "[a][blur]blend=all_mode=screen:all_opacity=0.55,"
        "eq=saturation=1.15:contrast=1.05"
    )


def _thermal() -> str:
    return "format=gray,pseudocolor=preset=turbo,eq=contrast=1.2"


def _pixel() -> str:
    # Rétro-gaming : sous-échantillonnage puis ré-agrandissement en nearest.
    return (
        "scale=iw/8:ih/8:flags=neighbor,"
        "scale=iw*8:ih*8:flags=neighbor,"
        "eq=saturation=1.3:contrast=1.1"
    )


STYLE_PRESETS: dict[str, StylePreset] = {
    p.key: p
    for p in [
        StylePreset("none", "Aucun (couleurs d'origine)", "Conserve l'image source, utile avec un effet de mouvement seul.", lambda: "null"),
        StylePreset("cartoon", "Cartoon / Illustration", "Aplats de couleurs et contours marqués, look dessin animé.", _cartoon),
        StylePreset("neon", "Néon", "Couleurs saturées et halo lumineux, ambiance nocturne.", _neon),
        StylePreset("cyberpunk", "Cyberpunk", "Contraste fort, dominante magenta/cyan, vignette.", _cyberpunk),
        StylePreset("vintage", "Vintage / Film", "Teintes chaudes délavées, grain argentique.", _vintage),
        StylePreset("noir", "Noir & Blanc", "Monochrome contrasté, style film noir.", _noir),
        StylePreset("sketch", "Croquis", "Rendu crayonné : contours sur fond clair.", _sketch),
        StylePreset("dreamy", "Rêveur / Glow", "Halo diffus et lumineux, ambiance onirique.", _dreamy),
        StylePreset("thermal", "Thermique", "Fausses couleurs type caméra thermique.", _thermal),
        StylePreset("pixel", "Pixel Art", "Sous-échantillonnage rétro-gaming.", _pixel),
    ]
}


# ---------------------------------------------------------------------------
# Effets de mouvement
# ---------------------------------------------------------------------------
@dataclass
class MotionPreset:
    key: str
    label: str
    description: str
    filters: Callable[["RenderParams", VideoInfo], str]


def _motion_none(_: "RenderParams", __: VideoInfo) -> str:
    return ""


def _motion_zoom(params: "RenderParams", info: VideoInfo) -> str:
    # Ken Burns : zoom lent progressif.
    # `d=1` => une image de sortie par image d'entrée (indispensable pour une
    # source vidéo, sinon zoompan duplique chaque image `d` fois). Un léger
    # sur-échantillonnage (x2) évite le tremblement du zoom.
    fps = info.fps or 30.0
    w = info.width or 1280
    h = info.height or 720
    return (
        "scale=iw*2:ih*2,"
        "zoompan=z='min(pzoom+0.0009,1.25)':d=1:"
        "x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':"
        f"s={w}x{h}:fps={fps:.4f}"
    )


def _motion_shake(_: "RenderParams", __: VideoInfo) -> str:
    # Secousse caméra pseudo-aléatoire.
    return (
        "crop=iw-20:ih-20:"
        "'10+8*sin(n*0.6)':'10+8*cos(n*0.5)'"
    )


def _motion_glitch(_: "RenderParams", __: VideoInfo) -> str:
    # Décalage chromatique + tremblement -> effet glitch.
    return (
        "rgbashift=rh=6:bh=-6:rv=-4:bv=4,"
        "crop=iw-16:ih-16:'8+6*sin(n*1.3)':'8+6*cos(n*1.1)'"
    )


MOTION_PRESETS: dict[str, MotionPreset] = {
    p.key: p
    for p in [
        MotionPreset("none", "Aucun", "Pas d'effet de mouvement ajouté.", _motion_none),
        MotionPreset("zoom", "Zoom (Ken Burns)", "Zoom avant lent et continu.", _motion_zoom),
        MotionPreset("shake", "Secousse caméra", "Tremblement dynamique de l'image.", _motion_shake),
        MotionPreset("glitch", "Glitch", "Décalage chromatique et tremblement numérique.", _motion_glitch),
    ]
}


# ---------------------------------------------------------------------------
# Paramètres de rendu & pipeline
# ---------------------------------------------------------------------------
@dataclass
class RenderParams:
    style: str = "cartoon"
    motion: str = "none"
    intensity: float = 1.0  # 0.0 - 2.0
    fps: Optional[int] = None
    max_height: Optional[int] = None  # ex. 720 pour limiter la résolution
    speed: float = 1.0  # 1.0 = normal, 2.0 = 2x plus rapide
    extra_filters: list[str] = field(default_factory=list)

    def validate(self) -> None:
        if self.style not in STYLE_PRESETS:
            raise VideoError(f"Style inconnu : {self.style!r}")
        if self.motion not in MOTION_PRESETS:
            raise VideoError(f"Effet de mouvement inconnu : {self.motion!r}")
        if not (0.0 <= self.intensity <= 2.0):
            raise VideoError("L'intensité doit être comprise entre 0.0 et 2.0.")
        if not (0.25 <= self.speed <= 4.0):
            raise VideoError("La vitesse doit être comprise entre 0.25 et 4.0.")


def build_filtergraph(params: RenderParams, info: VideoInfo) -> str:
    """Assemble la chaîne de filtres ffmpeg selon les paramètres."""
    params.validate()
    segments: list[str] = []

    # Limitation de résolution (motion design : garder un rendu léger).
    if params.max_height and info.height > params.max_height:
        segments.append(f"scale=-2:{params.max_height}")

    # Mouvement d'abord (zoompan a besoin d'une source stable).
    motion = MOTION_PRESETS[params.motion].filters(params, info)
    if motion:
        segments.append(motion)

    # Style.
    style = STYLE_PRESETS[params.style].filters()
    if style and style != "null":
        segments.append(style)

    # Modulation de l'intensité : mélange vers la saturation/contraste.
    if params.intensity != 1.0 and params.style != "none":
        sat = 1.0 + (params.intensity - 1.0) * 0.5
        segments.append(f"eq=saturation={max(sat, 0.0):.3f}")

    # Vitesse (setpts) — l'audio est géré séparément dans render().
    if params.speed != 1.0:
        segments.append(f"setpts={1.0 / params.speed:.4f}*PTS")

    if params.fps:
        segments.append(f"fps={params.fps}")

    segments.extend(params.extra_filters)

    return ",".join(s for s in segments if s) or "null"


def render(
    src: Path,
    dst: Path,
    params: RenderParams,
    info: Optional[VideoInfo] = None,
    progress_cb: Optional[Callable[[float], None]] = None,
) -> Path:
    """Applique le pipeline de transformation et écrit `dst`.

    `progress_cb` reçoit une progression 0.0 -> 1.0 basée sur le temps encodé.
    """
    if not ffmpeg_available():
        raise VideoError("ffmpeg introuvable : impossible de générer la vidéo.")

    info = info or probe(src)
    filtergraph = build_filtergraph(params, info)
    dst.parent.mkdir(parents=True, exist_ok=True)

    cmd = [
        "ffmpeg",
        "-y",
        "-i",
        str(src),
        "-vf",
        filtergraph,
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-crf",
        "20",
        "-pix_fmt",
        "yuv420p",
        "-movflags",
        "+faststart",
    ]

    # Audio : conservé et éventuellement accéléré (atempo), sinon aucun flux.
    if info.has_audio:
        if params.speed != 1.0:
            cmd += ["-filter:a", _atempo_chain(params.speed)]
        cmd += ["-c:a", "aac", "-b:a", "128k"]
    else:
        cmd += ["-an"]

    cmd += ["-progress", "pipe:1", "-nostats", str(dst)]

    total = max(info.duration / max(params.speed, 0.01), 0.1)
    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    assert proc.stdout is not None
    for line in proc.stdout:
        line = line.strip()
        if line.startswith("out_time_ms=") and progress_cb:
            try:
                out_ms = int(line.split("=", 1)[1])
                progress_cb(min(max((out_ms / 1_000_000) / total, 0.0), 0.99))
            except (ValueError, ZeroDivisionError):
                pass
    proc.wait()
    if proc.returncode != 0:
        err = proc.stderr.read() if proc.stderr else ""
        raise VideoError(f"ffmpeg a échoué (code {proc.returncode}) : {err[-500:]}")

    if progress_cb:
        progress_cb(1.0)
    return dst


def _atempo_chain(speed: float) -> str:
    """`atempo` n'accepte que 0.5–2.0 ; on chaîne les facteurs si besoin."""
    factors: list[float] = []
    remaining = speed
    while remaining > 2.0:
        factors.append(2.0)
        remaining /= 2.0
    while remaining < 0.5:
        factors.append(0.5)
        remaining /= 0.5
    factors.append(remaining)
    return ",".join(f"atempo={f:.4f}" for f in factors)


def make_thumbnail(src: Path, dst: Path, at_seconds: float = 0.5) -> Optional[Path]:
    """Génère une vignette JPEG. Retourne None en cas d'échec silencieux."""
    if not ffmpeg_available():
        return None
    dst.parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        "ffmpeg", "-y", "-ss", str(at_seconds), "-i", str(src),
        "-frames:v", "1", "-vf", "scale=480:-2", str(dst),
    ]
    out = subprocess.run(cmd, capture_output=True, text=True)
    return dst if out.returncode == 0 and dst.exists() else None
