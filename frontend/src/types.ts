export type JobStatus = "queued" | "processing" | "succeeded" | "failed";

export interface StylePreset {
  id: string;
  label: string;
  description: string;
  accent: string;
}

export interface UploadedVideo {
  video_id: string;
  filename: string;
  url: string;
  size_bytes: number;
  content_type: string | null;
}

export interface GenerationJob {
  job_id: string;
  video_id: string;
  source_url: string;
  style_id: string;
  prompt: string | null;
  strength: number;
  status: JobStatus;
  progress: number;
  provider: string;
  output_url: string | null;
  error: string | null;
  created_at: number;
  updated_at: number;
}
