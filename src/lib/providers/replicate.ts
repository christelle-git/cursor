import { writeFile } from "fs/promises";
import type { VideoProvider } from "./types";
import { localProvider } from "./local";

/**
 * Optional Replicate video-to-video bridge.
 * When REPLICATE_API_TOKEN is absent or the call fails, we fall back to local.
 *
 * Set REPLICATE_MODEL to a video-to-video model version id if you have one.
 * Without a model id, this provider delegates to the local director pipeline.
 */
export const replicateProvider: VideoProvider = {
  id: "replicate",
  isAvailable() {
    return Boolean(process.env.REPLICATE_API_TOKEN && process.env.REPLICATE_MODEL);
  },
  async generate(input, onProgress) {
    const token = process.env.REPLICATE_API_TOKEN;
    const model = process.env.REPLICATE_MODEL;

    if (!token || !model) {
      await onProgress("Replicate non configuré — bascule pipeline local", 20);
      return localProvider.generate(input, onProgress);
    }

    await onProgress("Envoi vers Replicate (video-to-video)…", 25);

    try {
      const createRes = await fetch("https://api.replicate.com/v1/predictions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Prefer: "wait",
        },
        body: JSON.stringify({
          version: model,
          input: {
            prompt: input.job.prompt || input.preset.promptHint,
            // Many models expect a public URL; for private deploys, upload separately.
            // Here we primarily document the hook; local remains the default path.
            video: input.job.sourceFilename,
          },
        }),
      });

      if (!createRes.ok) {
        throw new Error(`Replicate HTTP ${createRes.status}`);
      }

      const prediction = (await createRes.json()) as {
        status?: string;
        output?: string | string[];
        error?: string;
      };

      if (prediction.error || !prediction.output) {
        throw new Error(prediction.error || "Sortie Replicate vide");
      }

      const url = Array.isArray(prediction.output)
        ? prediction.output[0]
        : prediction.output;

      await onProgress("Téléchargement de la génération IA…", 75);
      const videoRes = await fetch(url);
      if (!videoRes.ok) throw new Error("Téléchargement vidéo échoué");
      const buffer = Buffer.from(await videoRes.arrayBuffer());
      await writeFile(input.outputPath, buffer);
      await onProgress("Génération IA récupérée", 92);
    } catch (error) {
      const message = error instanceof Error ? error.message : "erreur Replicate";
      await onProgress(`Replicate indisponible (${message}) — pipeline local`, 30);
      await localProvider.generate(input, onProgress);
    }
  },
};
