import type { JobRecord } from "../jobs";
import type { StylePreset } from "../styles";

export type GenerateInput = {
  job: JobRecord;
  sourcePath: string;
  outputPath: string;
  preset: StylePreset;
};

export type VideoProvider = {
  id: "local" | "replicate";
  isAvailable(): boolean;
  generate(input: GenerateInput, onProgress: (msg: string, pct: number) => Promise<void>): Promise<void>;
};
