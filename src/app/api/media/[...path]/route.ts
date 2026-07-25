import { NextResponse } from "next/server";
import { readFile, access } from "fs/promises";
import path from "path";
import {
  UPLOADS_DIR,
  OUTPUTS_DIR,
  THUMBS_DIR,
} from "@/lib/storage";

export const runtime = "nodejs";

const ROOTS: Record<string, string> = {
  uploads: UPLOADS_DIR,
  outputs: OUTPUTS_DIR,
  thumbs: THUMBS_DIR,
};

const MIME: Record<string, string> = {
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".webm": "video/webm",
  ".mkv": "video/x-matroska",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  const segments = (await context.params).path;
  if (!segments || segments.length < 2) {
    return NextResponse.json({ error: "Chemin invalide" }, { status: 400 });
  }

  const [kind, ...rest] = segments;
  const root = ROOTS[kind];
  if (!root) {
    return NextResponse.json({ error: "Type média invalide" }, { status: 400 });
  }

  const filename = rest.join("/");
  if (filename.includes("..") || path.isAbsolute(filename)) {
    return NextResponse.json({ error: "Chemin interdit" }, { status: 400 });
  }

  const fullPath = path.join(root, filename);
  try {
    await access(fullPath);
    const data = await readFile(fullPath);
    const ext = path.extname(fullPath).toLowerCase();
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": MIME[ext] || "application/octet-stream",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Fichier introuvable" }, { status: 404 });
  }
}
