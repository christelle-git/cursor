export type TransformMode = "restyle" | "motion" | "remix" | "extend";

export type StylePreset = {
  id: string;
  label: string;
  mode: TransformMode;
  description: string;
  promptHint: string;
  /** ffmpeg eq / colorbalance-ish params */
  grade: {
    contrast: number;
    brightness: number;
    saturation: number;
    gamma: number;
    hue?: number;
  };
  grain: number;
  vignette: number;
  speed: number;
  titleStyle: "none" | "kinetic" | "lowerthird" | "endcard";
};

export const MODES: {
  id: TransformMode;
  label: string;
  blurb: string;
}[] = [
  {
    id: "restyle",
    label: "Restyle",
    blurb: "Recolore et retexture votre rush comme un nouveau look film.",
  },
  {
    id: "motion",
    label: "Motion design",
    blurb: "Titres cinétiques, lower thirds et cartes de fin intégrés au plan.",
  },
  {
    id: "remix",
    label: "Remix rythme",
    blurb: "Repace, speed ramps et coupe dynamique à partir du même master.",
  },
  {
    id: "extend",
    label: "Étendre",
    blurb: "Prolonge la scène avec un morph fluide (local) ou un modèle IA.",
  },
];

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: "teal-noir",
    label: "Teal Noir",
    mode: "restyle",
    description: "Contraste urbain, ombres froides, look pub premium.",
    promptHint: "look cinématique teal et ombres profondes, grain fin",
    grade: { contrast: 1.18, brightness: -0.03, saturation: 1.05, gamma: 0.95 },
    grain: 18,
    vignette: 0.35,
    speed: 1,
    titleStyle: "none",
  },
  {
    id: "golden-hour",
    label: "Golden Hour",
    mode: "restyle",
    description: "Chaleur ambrée, highlights doux, sensation golden hour.",
    promptHint: "lueur dorée, highlights chauds, atmosphère douce",
    grade: { contrast: 1.08, brightness: 0.04, saturation: 1.2, gamma: 1.05 },
    grain: 10,
    vignette: 0.22,
    speed: 1,
    titleStyle: "none",
  },
  {
    id: "docu-raw",
    label: "Docu Raw",
    mode: "restyle",
    description: "Désaturation contrôlée, texture reportage.",
    promptHint: "documentaire, couleurs naturelles, texture 16mm",
    grade: { contrast: 1.12, brightness: 0.01, saturation: 0.78, gamma: 1 },
    grain: 28,
    vignette: 0.18,
    speed: 1,
    titleStyle: "none",
  },
  {
    id: "kinetic-title",
    label: "Titre cinétique",
    mode: "motion",
    description: "Ouverture typographique + lower third animé.",
    promptHint: "titre bold, rythme snappy, lower third moderne",
    grade: { contrast: 1.1, brightness: 0, saturation: 1.08, gamma: 1 },
    grain: 8,
    vignette: 0.15,
    speed: 1,
    titleStyle: "kinetic",
  },
  {
    id: "brand-end",
    label: "Carte de marque",
    mode: "motion",
    description: "Finition brandée avec end card et signature.",
    promptHint: "end card élégante, logo type, fondu propre",
    grade: { contrast: 1.06, brightness: 0.02, saturation: 1.02, gamma: 1 },
    grain: 6,
    vignette: 0.25,
    speed: 1,
    titleStyle: "endcard",
  },
  {
    id: "pulse-cut",
    label: "Pulse Cut",
    mode: "remix",
    description: "Rythme plus tendu, micro-coupes et speed play.",
    promptHint: "montage dynamique, accélérations, énergie sociale",
    grade: { contrast: 1.15, brightness: 0, saturation: 1.12, gamma: 0.98 },
    grain: 12,
    vignette: 0.2,
    speed: 1.15,
    titleStyle: "lowerthird",
  },
  {
    id: "slow-bloom",
    label: "Slow Bloom",
    mode: "remix",
    description: "Ralenti expressif pour les pics émotionnels.",
    promptHint: "ralenti poétique, bloom, respiration",
    grade: { contrast: 1.05, brightness: 0.03, saturation: 1.15, gamma: 1.05 },
    grain: 14,
    vignette: 0.3,
    speed: 0.75,
    titleStyle: "none",
  },
  {
    id: "scene-extend",
    label: "Scene Extend",
    mode: "extend",
    description: "Prolonge la prise avec ping-pong morph + grade.",
    promptHint: "prolonger la scène sans rupture, continuum fluide",
    grade: { contrast: 1.08, brightness: 0, saturation: 1.05, gamma: 1 },
    grain: 10,
    vignette: 0.2,
    speed: 1,
    titleStyle: "none",
  },
];

export function getPreset(id: string): StylePreset {
  return STYLE_PRESETS.find((p) => p.id === id) ?? STYLE_PRESETS[0];
}

export function inferTitleFromPrompt(prompt: string, fallback = "FrameShift") {
  const cleaned = prompt.trim();
  if (!cleaned) return fallback;
  const firstClause = cleaned.split(/[.|!?]/)[0]?.trim() ?? fallback;
  if (firstClause.length <= 42) return firstClause;
  return `${firstClause.slice(0, 39).trim()}…`;
}
