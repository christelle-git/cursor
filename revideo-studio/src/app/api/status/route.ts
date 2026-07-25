import { NextRequest, NextResponse } from "next/server";
import { getFalClient, MISSING_KEY_MESSAGE } from "@/lib/fal-server";
import { MODELS, type ModelId } from "@/lib/models";

export const runtime = "nodejs";

/**
 * Suit l'avancement d'un job : file d'attente, en cours, terminé ou en erreur.
 * Quand le job est terminé, renvoie l'URL de la vidéo générée.
 */
export async function GET(request: NextRequest) {
  const fal = getFalClient();
  if (!fal) {
    return NextResponse.json({ error: MISSING_KEY_MESSAGE }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  const modelId = searchParams.get("modelId") as ModelId | null;
  const requestId = searchParams.get("requestId");
  const model = modelId ? MODELS[modelId] : undefined;

  if (!model || !requestId) {
    return NextResponse.json(
      { error: "Paramètres manquants : modelId et requestId sont requis." },
      { status: 400 },
    );
  }

  try {
    const status = await fal.queue.status(model.endpoint, { requestId, logs: true });

    if (status.status !== "COMPLETED") {
      const logs =
        "logs" in status && Array.isArray(status.logs)
          ? status.logs.map((l: { message: string }) => l.message).slice(-5)
          : [];
      const queuePosition =
        "queue_position" in status ? (status.queue_position as number) : undefined;
      return NextResponse.json({ status: status.status, logs, queuePosition });
    }

    const result = await fal.queue.result(model.endpoint, { requestId });
    const data = result.data as { video?: { url?: string } };
    const videoUrl = data?.video?.url;
    if (!videoUrl) {
      return NextResponse.json(
        { status: "FAILED", error: "Le modèle n'a renvoyé aucune vidéo." },
        { status: 502 },
      );
    }
    return NextResponse.json({ status: "COMPLETED", videoUrl });
  } catch (err) {
    console.error("Échec du suivi du job :", err);
    return NextResponse.json(
      { status: "FAILED", error: extractFalError(err) ?? "La génération a échoué." },
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
