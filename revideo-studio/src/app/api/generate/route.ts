import { NextRequest, NextResponse } from "next/server";
import { getFalClient, MISSING_KEY_MESSAGE } from "@/lib/fal-server";
import { LUMA_MODES, MODELS, type LumaMode, type ModelId } from "@/lib/models";

export const runtime = "nodejs";

interface GenerateBody {
  modelId?: ModelId;
  videoUrl?: string;
  prompt?: string;
  /** Mode Luma (adhere_1 … reimagine_3) */
  mode?: LumaMode;
  /** Kling : conserver la bande son d'origine */
  keepAudio?: boolean;
}

const VALID_LUMA_MODES = new Set<string>(LUMA_MODES.map((m) => m.value));

/**
 * Soumet un job de génération à la file fal.ai et renvoie son identifiant.
 * Le client interroge ensuite /api/status pour suivre l'avancement.
 */
export async function POST(request: NextRequest) {
  const fal = getFalClient();
  if (!fal) {
    return NextResponse.json({ error: MISSING_KEY_MESSAGE }, { status: 503 });
  }

  let body: GenerateBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
  }

  const model = body.modelId ? MODELS[body.modelId] : undefined;
  if (!model) {
    return NextResponse.json({ error: "Modèle inconnu." }, { status: 400 });
  }
  if (!body.videoUrl || !/^https?:\/\//.test(body.videoUrl)) {
    return NextResponse.json(
      { error: "URL de vidéo source manquante : téléversez d'abord votre vidéo." },
      { status: 400 },
    );
  }
  const prompt = body.prompt?.trim() ?? "";
  if (model.promptRequired && !prompt) {
    return NextResponse.json(
      { error: `Le modèle ${model.label} nécessite un prompt décrivant la transformation.` },
      { status: 400 },
    );
  }

  let input: Record<string, unknown>;
  if (model.id === "luma-ray2-modify") {
    const mode = body.mode && VALID_LUMA_MODES.has(body.mode) ? body.mode : "flex_1";
    input = {
      video_url: body.videoUrl,
      mode,
      ...(prompt ? { prompt } : {}),
    };
  } else {
    input = {
      video_url: body.videoUrl,
      prompt,
      keep_audio: body.keepAudio ?? true,
    };
  }

  try {
    const { request_id } = await fal.queue.submit(model.endpoint, { input });
    return NextResponse.json({ requestId: request_id, modelId: model.id });
  } catch (err) {
    console.error("Échec de la soumission du job :", err);
    return NextResponse.json(
      { error: extractFalError(err) ?? "La soumission de la génération a échoué. Réessayez." },
      { status: 502 },
    );
  }
}

function extractFalError(err: unknown): string | null {
  if (err && typeof err === "object" && "body" in err) {
    const body = (err as { body?: { detail?: unknown } }).body;
    if (typeof body?.detail === "string") return body.detail;
    if (Array.isArray(body?.detail)) {
      const msgs = body.detail
        .map((d) => (d && typeof d === "object" && "msg" in d ? String(d.msg) : null))
        .filter(Boolean);
      if (msgs.length) return msgs.join(" — ");
    }
  }
  return null;
}
