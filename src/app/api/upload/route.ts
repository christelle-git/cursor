import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import path from "path";
import { createJob } from "@/lib/jobs";
import { saveUpload, mediaUrl } from "@/lib/storage";
import type { TransformMode } from "@/lib/styles";
import { getPreset, inferTitleFromPrompt } from "@/lib/styles";

export const runtime = "nodejs";

const MAX_BYTES = 80 * 1024 * 1024;
const ALLOWED = new Set([
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-matroska",
  "video/mpeg",
]);

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    const mode = String(form.get("mode") || "restyle") as TransformMode;
    const presetId = String(form.get("presetId") || "teal-noir");
    const prompt = String(form.get("prompt") || "");
    const title = String(form.get("title") || inferTitleFromPrompt(prompt));

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Fichier vidéo manquant" }, { status: 400 });
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Fichier trop volumineux (max 80 Mo)" },
        { status: 400 },
      );
    }

    if (file.type && !ALLOWED.has(file.type) && !file.name.match(/\.(mp4|mov|webm|mkv|mpeg|mpg)$/i)) {
      return NextResponse.json(
        { error: "Format non supporté. Utilisez MP4, MOV, WEBM ou MKV." },
        { status: 400 },
      );
    }

    const preset = getPreset(presetId);
    const id = randomUUID();
    const ext = path.extname(file.name) || ".mp4";
    const sourceFilename = `${id}${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await saveUpload(sourceFilename, buffer);

    const job = await createJob({
      id,
      sourceFilename,
      sourceOriginalName: file.name,
      mode: mode || preset.mode,
      presetId: preset.id,
      prompt,
      title,
      status: "queued",
    });

    return NextResponse.json({
      jobId: job.id,
      sourceUrl: mediaUrl("uploads", sourceFilename),
      job,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload échoué";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
