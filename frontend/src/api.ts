import type { GenerationJob, StylePreset, UploadedVideo } from "./types";

async function parseJsonOrThrow<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let detail = `Erreur ${response.status}`;
    try {
      const body = await response.json();
      detail = body.detail ?? detail;
    } catch {
      // corps non-JSON : on garde le message par défaut
    }
    throw new Error(detail);
  }
  return response.json() as Promise<T>;
}

export async function fetchStyles(): Promise<StylePreset[]> {
  const response = await fetch("/api/styles");
  return parseJsonOrThrow(response);
}

export async function uploadVideo(
  file: File,
  onProgress?: (fraction: number) => void,
): Promise<UploadedVideo> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", file);

    xhr.open("POST", "/api/uploads");

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(event.loaded / event.total);
      }
    };

    xhr.onload = () => {
      try {
        const body = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(body as UploadedVideo);
        } else {
          reject(new Error(body.detail ?? `Erreur ${xhr.status}`));
        }
      } catch {
        reject(new Error("Réponse invalide du serveur pendant l'upload."));
      }
    };

    xhr.onerror = () => reject(new Error("Échec réseau pendant l'upload."));
    xhr.send(formData);
  });
}

export async function createGeneration(params: {
  video_id: string;
  style_id: string;
  prompt?: string;
  strength: number;
}): Promise<GenerationJob> {
  const response = await fetch("/api/generations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  return parseJsonOrThrow(response);
}

export async function fetchGeneration(jobId: string): Promise<GenerationJob> {
  const response = await fetch(`/api/generations/${jobId}`);
  return parseJsonOrThrow(response);
}

export async function fetchGenerations(): Promise<GenerationJob[]> {
  const response = await fetch("/api/generations");
  return parseJsonOrThrow(response);
}

export function pollGeneration(
  jobId: string,
  onUpdate: (job: GenerationJob) => void,
  intervalMs = 900,
): () => void {
  let cancelled = false;

  const tick = async () => {
    if (cancelled) return;
    try {
      const job = await fetchGeneration(jobId);
      onUpdate(job);
      if (job.status === "succeeded" || job.status === "failed") {
        return;
      }
    } catch {
      // on retente au prochain tick plutôt que d'interrompre le suivi
    }
    if (!cancelled) {
      setTimeout(tick, intervalMs);
    }
  };

  tick();

  return () => {
    cancelled = true;
  };
}
