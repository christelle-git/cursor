import { NextResponse } from "next/server";
import { getJob } from "@/lib/jobs";
import { mediaUrl } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const job = await getJob(id);
  if (!job) {
    return NextResponse.json({ error: "Job introuvable" }, { status: 404 });
  }

  return NextResponse.json({
    job,
    sourceUrl: mediaUrl("uploads", job.sourceFilename),
    outputUrl: job.outputFilename
      ? mediaUrl("outputs", job.outputFilename)
      : null,
    thumbnails: (job.thumbnails ?? []).map((name) => mediaUrl("thumbs", name)),
  });
}
