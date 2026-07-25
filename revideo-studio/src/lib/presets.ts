/** Styles prédéfinis proposés dans l'interface pour guider la transformation. */

export interface StylePreset {
  id: string;
  label: string;
  emojiFree: string;
  prompt: string;
}

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: "anime",
    label: "Anime",
    emojiFree: "AN",
    prompt:
      "Transforme la vidéo en anime japonais 2D, cel-shading, contours nets, couleurs vibrantes, style Studio Ghibli",
  },
  {
    id: "aquarelle",
    label: "Aquarelle",
    emojiFree: "AQ",
    prompt:
      "Transforme la vidéo en peinture aquarelle animée, touches de pinceau visibles, papier texturé, couleurs délavées et douces",
  },
  {
    id: "cyberpunk",
    label: "Cyberpunk",
    emojiFree: "CY",
    prompt:
      "Ambiance cyberpunk nocturne, néons roses et cyans, pluie, reflets mouillés, atmosphère Blade Runner",
  },
  {
    id: "claymation",
    label: "Pâte à modeler",
    emojiFree: "PM",
    prompt:
      "Transforme la vidéo en animation en pâte à modeler (claymation), textures d'argile, éclairage studio, style stop-motion",
  },
  {
    id: "noir",
    label: "Film noir",
    emojiFree: "FN",
    prompt:
      "Film noir des années 50, noir et blanc contrasté, grain argentique, ombres dramatiques, fumée de cigarette",
  },
  {
    id: "pixel",
    label: "Pixel art",
    emojiFree: "PX",
    prompt:
      "Transforme la vidéo en pixel art 16 bits rétro, palette limitée, esthétique de jeu vidéo des années 90",
  },
  {
    id: "hiver",
    label: "Hiver",
    emojiFree: "HV",
    prompt:
      "Transforme la scène en plein hiver : neige qui tombe, sol enneigé, buée, lumière froide et bleutée",
  },
  {
    id: "cinema",
    label: "Cinéma épique",
    emojiFree: "CE",
    prompt:
      "Étalonnage cinéma épique, teintes teal & orange, contraste riche, profondeur de champ, rendu pellicule 35 mm anamorphique",
  },
];
