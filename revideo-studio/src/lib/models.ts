/**
 * Catalogue des modèles IA « video-to-video » disponibles.
 * Chaque modèle part d'une vidéo existante et la transforme selon un prompt.
 */

export type ModelId = "luma-ray2-modify" | "kling-o3-edit";

export interface ModelInfo {
  id: ModelId;
  /** Endpoint fal.ai (utilisé côté serveur uniquement) */
  endpoint: string;
  label: string;
  description: string;
  /** Le modèle accepte-t-il un réglage d'intensité de transformation ? */
  supportsStrength: boolean;
  /** Le modèle peut-il conserver la bande son d'origine ? */
  supportsKeepAudio: boolean;
  /** Le prompt est-il obligatoire ? */
  promptRequired: boolean;
  maxDurationSec: number;
  maxSizeMB: number;
  formatsHint: string;
}

export const MODELS: Record<ModelId, ModelInfo> = {
  "luma-ray2-modify": {
    id: "luma-ray2-modify",
    endpoint: "fal-ai/luma-dream-machine/ray-2/modify",
    label: "Luma Ray 2 Modify",
    description:
      "Restyle la vidéo en préservant le mouvement et la structure. Idéal pour les transferts de style (anime, aquarelle, cinéma…) avec un contrôle fin de l'intensité.",
    supportsStrength: true,
    supportsKeepAudio: false,
    promptRequired: false,
    maxDurationSec: 30,
    maxSizeMB: 100,
    formatsHint: "MP4 / MOV — 30 s max — 100 Mo max",
  },
  "kling-o3-edit": {
    id: "kling-o3-edit",
    endpoint: "fal-ai/kling-video/o3/standard/video-to-video/edit",
    label: "Kling O3 Edit",
    description:
      "Édition guidée par instructions : changer un personnage, la météo, l'ambiance lumineuse, le décor… tout en gardant la continuité du plan (et le son d'origine si souhaité).",
    supportsStrength: false,
    supportsKeepAudio: true,
    promptRequired: true,
    maxDurationSec: 15,
    maxSizeMB: 200,
    formatsHint: "MP4 / MOV — 3 à 15 s — 200 Mo max — 720 à 3840 px",
  },
};

export const MODEL_LIST: ModelInfo[] = Object.values(MODELS);

/**
 * Intensités de transformation pour Luma Ray 2 Modify.
 * De « adhere_1 » (retouche subtile) à « reimagine_3 » (réinvention totale).
 */
export const LUMA_MODES = [
  { value: "adhere_1", label: "Subtil" },
  { value: "adhere_2", label: "Léger" },
  { value: "adhere_3", label: "Modéré" },
  { value: "flex_1", label: "Équilibré" },
  { value: "flex_2", label: "Marqué" },
  { value: "flex_3", label: "Fort" },
  { value: "reimagine_1", label: "Créatif" },
  { value: "reimagine_2", label: "Très créatif" },
  { value: "reimagine_3", label: "Réinvention totale" },
] as const;

export type LumaMode = (typeof LUMA_MODES)[number]["value"];
