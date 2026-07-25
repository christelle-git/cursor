import { mkdir, writeFile, readFile, access } from "fs/promises";
import path from "path";

export const DATA_ROOT = path.join(process.cwd(), "data");
export const UPLOADS_DIR = path.join(DATA_ROOT, "uploads");
export const OUTPUTS_DIR = path.join(DATA_ROOT, "outputs");
export const JOBS_DIR = path.join(DATA_ROOT, "jobs");
export const THUMBS_DIR = path.join(DATA_ROOT, "thumbs");

export async function ensureDataDirs() {
  await Promise.all([
    mkdir(UPLOADS_DIR, { recursive: true }),
    mkdir(OUTPUTS_DIR, { recursive: true }),
    mkdir(JOBS_DIR, { recursive: true }),
    mkdir(THUMBS_DIR, { recursive: true }),
  ]);
}

export function mediaUrl(kind: "uploads" | "outputs" | "thumbs", filename: string) {
  return `/api/media/${kind}/${filename}`;
}

export async function saveUpload(filename: string, data: Buffer) {
  await ensureDataDirs();
  const fullPath = path.join(UPLOADS_DIR, filename);
  await writeFile(fullPath, data);
  return fullPath;
}

export async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    await access(filePath);
    const raw = await readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function writeJsonFile(filePath: string, data: unknown) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
}
