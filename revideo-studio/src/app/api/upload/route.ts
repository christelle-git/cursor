import { NextRequest, NextResponse } from "next/server";
import { getFalClient, MISSING_KEY_MESSAGE } from "@/lib/fal-server";

export const runtime = "nodejs";
export const maxDuration = 300;

const MAX_SIZE_BYTES = 200 * 1024 * 1024;

/**
 * Reçoit la vidéo source et la téléverse sur le stockage fal.
 * Renvoie l'URL publique utilisable par les modèles video-to-video.
 */
export async function POST(request: NextRequest) {
  const fal = getFalClient();
  if (!fal) {
    return NextResponse.json({ error: MISSING_KEY_MESSAGE }, { status: 503 });
  }

  let file: File | null = null;
  try {
    const formData = await request.formData();
    const entry = formData.get("file");
    if (entry instanceof File) file = entry;
  } catch {
    return NextResponse.json(
      { error: "Requête invalide : envoyez la vidéo en multipart/form-data (champ « file »)." },
      { status: 400 },
    );
  }

  if (!file) {
    return NextResponse.json(
      { error: "Aucun fichier reçu (champ « file » attendu)." },
      { status: 400 },
    );
  }
  if (!file.type.startsWith("video/")) {
    return NextResponse.json(
      { error: `Format non supporté (${file.type || "inconnu"}). Envoyez une vidéo MP4 ou MOV.` },
      { status: 400 },
    );
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { error: "Fichier trop volumineux (200 Mo maximum)." },
      { status: 413 },
    );
  }

  try {
    const url = await fal.storage.upload(file);
    return NextResponse.json({ url, name: file.name, size: file.size });
  } catch (err) {
    console.error("Échec de l'upload vers fal.storage :", err);
    return NextResponse.json(
      { error: "Le téléversement de la vidéo a échoué. Vérifiez votre clé FAL_KEY et réessayez." },
      { status: 502 },
    );
  }
}
