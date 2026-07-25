import { NextResponse } from "next/server";
import { analyzeSource, generateFromSource } from "@/lib/pipeline";
import { getJob, updateJob } from "@/lib/jobs";
import { inferTitleFromPrompt, type TransformMode } from "@/lib/styles";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      jobId?: string;
      prompt?: string;
      title?: string;
      presetId?: string;
      mode?: TransformMode;
    };

    if (!body.jobId) {
      return NextResponse.json({ error: "jobId requis" }, { status: 400 });
    }

    const existing = await getJob(body.jobId);
    if (!existing) {
      return NextResponse.json({ error: "Job introuvable" }, { status: 404 });
    }

    await updateJob(body.jobId, {
      prompt: body.prompt ?? existing.prompt,
      title:
        body.title ||
        inferTitleFromPrompt(body.prompt ?? existing.prompt, existing.title),
      presetId: body.presetId ?? existing.presetId,
      mode: body.mode ?? existing.mode,
    });

    if (!existing.meta) {
      await analyzeSource(body.jobId);
    }

    const result = await generateFromSource(body.jobId);
    const job = await getJob(body.jobId);
    return NextResponse.json({ ...result, job });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Génération échouée";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
