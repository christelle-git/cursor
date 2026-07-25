import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";
import { THUMBS_DIR, ensureDataDirs } from "./storage";

const execFileAsync = promisify(execFile);

export type VideoMeta = {
  duration: number;
  width: number;
  height: number;
  fps: number;
  codec: string;
  hasAudio: boolean;
  sizeBytes: number;
};

function parseFps(rate: string | undefined): number {
  if (!rate) return 30;
  if (rate.includes("/")) {
    const [a, b] = rate.split("/").map(Number);
    if (b) return Math.round((a / b) * 100) / 100;
  }
  const n = Number(rate);
  return Number.isFinite(n) && n > 0 ? n : 30;
}

export async function probeVideo(filePath: string): Promise<VideoMeta> {
  const { stdout } = await execFileAsync("ffprobe", [
    "-v",
    "quiet",
    "-print_format",
    "json",
    "-show_format",
    "-show_streams",
    filePath,
  ]);

  const data = JSON.parse(stdout) as {
    format?: { duration?: string; size?: string };
    streams?: Array<{
      codec_type?: string;
      codec_name?: string;
      width?: number;
      height?: number;
      r_frame_rate?: string;
      avg_frame_rate?: string;
    }>;
  };

  const video = data.streams?.find((s) => s.codec_type === "video");
  const audio = data.streams?.find((s) => s.codec_type === "audio");

  return {
    duration: Number(data.format?.duration ?? 0),
    width: video?.width ?? 0,
    height: video?.height ?? 0,
    fps: parseFps(video?.avg_frame_rate || video?.r_frame_rate),
    codec: video?.codec_name ?? "unknown",
    hasAudio: Boolean(audio),
    sizeBytes: Number(data.format?.size ?? 0),
  };
}

export async function extractThumbnails(
  filePath: string,
  jobId: string,
  count = 4,
): Promise<string[]> {
  await ensureDataDirs();
  const meta = await probeVideo(filePath);
  const duration = Math.max(meta.duration, 1);
  const names: string[] = [];

  for (let i = 0; i < count; i += 1) {
    const t = ((i + 0.5) / count) * duration;
    const name = `${jobId}-thumb-${i}.jpg`;
    const out = path.join(THUMBS_DIR, name);
    await execFileAsync("ffmpeg", [
      "-y",
      "-ss",
      t.toFixed(3),
      "-i",
      filePath,
      "-frames:v",
      "1",
      "-q:v",
      "3",
      out,
    ]);
    names.push(name);
  }

  return names;
}

export async function runFfmpeg(args: string[]) {
  await execFileAsync("ffmpeg", args, {
    maxBuffer: 20 * 1024 * 1024,
  });
}
