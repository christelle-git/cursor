import path from "path";
import { extractThumbnails, probeVideo } from "./ffmpeg";
import { appendLog, getJob, updateJob } from "./jobs";
import { getPreset, inferTitleFromPrompt } from "./styles";
import { OUTPUTS_DIR, UPLOADS_DIR, ensureDataDirs, mediaUrl } from "./storage";
import { localProvider } from "./providers/local";
import { replicateProvider } from "./providers/replicate";

export async function analyzeSource(jobId: string) {
  const job = await getJob(jobId);
  if (!job) throw new Error("Job introuvable");

  await updateJob(jobId, { status: "analyzing", progress: 8 });
  await appendLog(jobId, "Analyse ffprobe du master…", 12);

  const sourcePath = path.join(UPLOADS_DIR, job.sourceFilename);
  const meta = await probeVideo(sourcePath);
  const thumbs = await extractThumbnails(sourcePath, jobId, 4);

  await updateJob(jobId, {
    status: "queued",
    meta,
    thumbnails: thumbs,
    progress: 30,
    logs: [
      ...(job.logs ?? []),
      `Master ${meta.width}×${meta.height} · ${meta.duration.toFixed(1)}s · ${meta.fps} fps`,
      `${thumbs.length} vignettes extraites`,
    ],
  });

  return {
    meta,
    thumbnails: thumbs.map((name) => mediaUrl("thumbs", name)),
  };
}

export async function generateFromSource(jobId: string) {
  await ensureDataDirs();
  const job = await getJob(jobId);
  if (!job) throw new Error("Job introuvable");

  const preset = getPreset(job.presetId);
  const title = job.title || inferTitleFromPrompt(job.prompt);
  const sourcePath = path.join(UPLOADS_DIR, job.sourceFilename);
  const outputFilename = `${jobId}-out.mp4`;
  const outputPath = path.join(OUTPUTS_DIR, outputFilename);

  const provider = replicateProvider.isAvailable()
    ? replicateProvider
    : localProvider;

  await updateJob(jobId, {
    status: "generating",
    progress: 35,
    provider: provider.id,
    title,
  });
  await appendLog(
    jobId,
    `Provider ${provider.id} · preset ${preset.label} · mode ${preset.mode}`,
    38,
  );

  try {
    await provider.generate(
      { job: { ...job, title }, sourcePath, outputPath, preset },
      async (msg, pct) => {
        await appendLog(jobId, msg, pct);
        await updateJob(jobId, { status: "generating" });
      },
    );

    await updateJob(jobId, {
      status: "ready",
      progress: 100,
      outputFilename,
      logs: [
        ...((await getJob(jobId))?.logs ?? []),
        "Export prêt",
      ],
    });

    return {
      outputUrl: mediaUrl("outputs", outputFilename),
      provider: provider.id,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur de génération";
    await updateJob(jobId, {
      status: "error",
      error: message,
      progress: 100,
      logs: [...((await getJob(jobId))?.logs ?? []), `Erreur: ${message}`],
    });
    throw error;
  }
}
