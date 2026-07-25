import { NextResponse } from "next/server";
import { analyzeSource } from "@/lib/pipeline";
import { getJob } from "@/lib/jobs";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { jobId?: string };
    if (!body.jobId) {
      return NextResponse.json({ error: "jobId requis" }, { status: 400 });
    }

    const existing = await getJob(body.jobId);
    if (!existing) {
      return NextResponse.json({ error: "Job introuvable" }, { status: 404 });
    }

    const result = await analyzeSource(body.jobId);
    const job = await getJob(body.jobId);
    return NextResponse.json({ ...result, job });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Analyse échouée";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
