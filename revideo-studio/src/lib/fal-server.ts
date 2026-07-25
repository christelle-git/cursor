import { fal } from "@fal-ai/client";

let configured = false;

/**
 * Retourne le client fal configuré, ou `null` si la clé API est absente.
 * Les routes API renvoient alors une erreur explicite au lieu de planter.
 */
export function getFalClient(): typeof fal | null {
  const key = process.env.FAL_KEY;
  if (!key) return null;
  if (!configured) {
    fal.config({ credentials: key });
    configured = true;
  }
  return fal;
}

export const MISSING_KEY_MESSAGE =
  "Clé API manquante : définissez la variable d'environnement FAL_KEY (voir https://fal.ai/dashboard/keys), puis redémarrez le serveur.";
