import path from "path";
import { JOBS_DIR, ensureDataDirs, readJsonFile, writeJsonFile } from "./storage";
import type { TransformMode } from "./styles";
import type { VideoMeta } from "./ffmpeg";

export type JobStatus = "queued" | "analyzing" | "generating" | "ready" | "error";

export type JobRecord = {
  id: string;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
  sourceFilename: string;
  sourceOriginalName: string;
  mode: TransformMode;
  presetId: string;
  prompt: string;
  title: string;
  meta?: VideoMeta;
  thumbnails?: string[];
  outputFilename?: string;
  provider?: "local" | "replicate";
  progress: number;
  logs: string[];
  error?: string;
};

function jobPath(id: string) {
  return path.join(JOBS_DIR, `${id}.json`);
}

export async function createJob(
  partial: Omit<JobRecord, "createdAt" | "updatedAt" | "status" | "progress" | "logs"> & {
    status?: JobStatus;
  },
): Promise<JobRecord> {
  await ensureDataDirs();
  const now = new Date().toISOString();
  const job: JobRecord = {
    ...partial,
    status: partial.status ?? "queued",
    createdAt: now,
    updatedAt: now,
    progress: 0,
    logs: ["Job créé"],
  };
  await writeJsonFile(jobPath(job.id), job);
  return job;
}

export async function getJob(id: string) {
  return readJsonFile<JobRecord>(jobPath(id));
}

export async function updateJob(id: string, patch: Partial<JobRecord>) {
  const current = await getJob(id);
  if (!current) throw new Error("Job introuvable");
  const next: JobRecord = {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString(),
    logs: patch.logs ?? current.logs,
  };
  await writeJsonFile(jobPath(id), next);
  return next;
}

export async function appendLog(id: string, message: string, progress?: number) {
  const current = await getJob(id);
  if (!current) return;
  await updateJob(id, {
    logs: [...current.logs, message],
    ...(typeof progress === "number" ? { progress } : {}),
  });
}
