"""Catalogue des styles de motion design proposés par l'outil.

Chaque preset fournit :
- un prompt (utilisé par les vrais modèles de génération, ex. Replicate) ;
- une chaîne de filtres ffmpeg (utilisée par le fournisseur "mock" local, pour
  obtenir un aperçu instantané sans dépendre d'une API externe) ;
- un "mode" indicatif pour les modèles qui exposent un curseur d'intensité
  discret (ex. luma/modify-video : adhere / flex / reimagine).
"""
from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class StylePreset:
    id: str
    label: str
    description: str
    prompt: str
    ffmpeg_filter: str
    # Dégradé d'accentuation pour l'UI, sous forme de deux couleurs hex
    # ("#fromColor,#toColor"). On évite volontairement les classes Tailwind
    # (ex. "from-amber-500 to-orange-700") : elles ne vivent que côté backend
    # et le compilateur Tailwind du frontend, qui analyse statiquement le code
    # source, ne les détecterait jamais.
    accent: str


STYLE_PRESETS: list[StylePreset] = [
    StylePreset(
        id="cinematic",
        label="Cinématique",
        description="Étalonnage de couleurs façon blockbuster, contrastes profonds, flares subtils.",
        prompt=(
            "cinematic color grading, anamorphic lens flare, dramatic lighting, "
            "film grain, high production value"
        ),
        ffmpeg_filter=(
            "eq=contrast=1.18:saturation=1.15:brightness=-0.02,"
            "vignette=PI/5,"
            "unsharp=5:5:0.5"
        ),
        accent="#f59e0b,#c2410c",
    ),
    StylePreset(
        id="anime",
        label="Anime",
        description="Couleurs plates et vibrantes, contours accentués, esthétique animée.",
        prompt=(
            "anime style, cel-shaded, vibrant flat colors, clean line art, "
            "studio ghibli inspired"
        ),
        ffmpeg_filter=(
            "eq=saturation=1.8:contrast=1.12,"
            "unsharp=7:7:1.5"
        ),
        accent="#ec4899,#c026d3",
    ),
    StylePreset(
        id="cyberpunk",
        label="Cyberpunk",
        description="Néons magenta et cyan, ambiance futuriste nocturne.",
        prompt=(
            "cyberpunk neon city, magenta and cyan lighting, futuristic glow, "
            "rain-soaked streets, high contrast"
        ),
        ffmpeg_filter=(
            "colorbalance=rs=-0.1:bs=0.25:gs=-0.05,"
            "eq=saturation=1.5:contrast=1.2"
        ),
        accent="#22d3ee,#9333ea",
    ),
    StylePreset(
        id="claymation",
        label="Claymation",
        description="Rendu stop-motion, matières tactiles, lumière douce d'atelier.",
        prompt=(
            "stop-motion claymation, soft studio lighting, tactile clay texture, "
            "handcrafted look"
        ),
        ffmpeg_filter=(
            "smartblur=1.5:-0.3:0,"
            "eq=saturation=0.95:contrast=1.05:brightness=0.02"
        ),
        accent="#fdba74,#d97706",
    ),
    StylePreset(
        id="vhs_retro",
        label="VHS Rétro",
        description="Bandes analogiques années 80, aberration chromatique, grain vidéo.",
        prompt=(
            "retro VHS tape aesthetic, analog scanlines, chromatic aberration, "
            "80s home video, degraded tape"
        ),
        ffmpeg_filter=(
            "rgbashift=rh=2:bh=-2,"
            "noise=alls=18:allf=t,"
            "eq=contrast=0.92:saturation=0.85"
        ),
        accent="#a855f7,#ec4899",
    ),
    StylePreset(
        id="watercolor",
        label="Aquarelle",
        description="Touches picturales, palette pastel, rendu tout en douceur.",
        prompt=(
            "watercolor painting style, soft brush strokes, pastel palette, "
            "delicate texture, artistic"
        ),
        ffmpeg_filter=(
            "smartblur=1.2:-0.35:0,"
            "eq=saturation=0.8:brightness=0.03"
        ),
        accent="#7dd3fc,#3b82f6",
    ),
    StylePreset(
        id="film_noir",
        label="Film Noir",
        description="Noir et blanc contrasté, ombres dramatiques.",
        prompt=(
            "film noir style, high contrast black and white, dramatic hard shadows, "
            "1940s detective movie mood"
        ),
        ffmpeg_filter=(
            "hue=s=0,"
            "eq=contrast=1.45:brightness=-0.04,"
            "vignette=PI/4"
        ),
        accent="#9ca3af,#1f2937",
    ),
    StylePreset(
        id="dreamcore",
        label="Dreamcore",
        description="Halo lumineux, brume pastel, atmosphère éthérée.",
        prompt=(
            "dreamlike glow, soft bloom, pastel haze, ethereal atmosphere, "
            "surreal lighting"
        ),
        ffmpeg_filter=(
            "gblur=sigma=1.2,"
            "eq=saturation=0.9:brightness=0.05:contrast=0.95"
        ),
        accent="#c4b5fd,#6366f1",
    ),
]

STYLE_BY_ID: dict[str, StylePreset] = {preset.id: preset for preset in STYLE_PRESETS}


def get_style(style_id: str) -> StylePreset:
    try:
        return STYLE_BY_ID[style_id]
    except KeyError as exc:
        raise ValueError(f"Style inconnu: {style_id}") from exc
