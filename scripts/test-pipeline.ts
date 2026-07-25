import { writeFile } from "fs/promises";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";
import { randomUUID } from "crypto";
import { createJob } from "../src/lib/jobs";
import { analyzeSource, generateFromSource } from "../src/lib/pipeline";
import { UPLOADS_DIR, OUTPUTS_DIR, ensureDataDirs } from "../src/lib/storage";

const execFileAsync = promisify(execFile);

async function main() {
  await ensureDataDirs();
  const id = randomUUID();
  const sourceFilename = `${id}.mp4`;
  const sourcePath = path.join(UPLOADS_DIR, sourceFilename);

  console.log("Generating sample master…");
  await execFileAsync("ffmpeg", [
    "-y",
    "-f",
    "lavfi",
    "-i",
    "testsrc=size=1280x720:rate=30",
    "-f",
    "lavfi",
    "-i",
    "sine=frequency=440:sample_rate=44100",
    "-t",
    "3",
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-c:a",
    "aac",
    sourcePath,
  ]);

  await createJob({
    id,
    sourceFilename,
    sourceOriginalName: "sample.mp4",
    mode: "motion",
    presetId: "kinetic-title",
    prompt: "Titre cinétique FrameShift test",
    title: "FrameShift",
  });

  console.log("Analyzing…");
  await analyzeSource(id);
  console.log("Generating…");
  const result = await generateFromSource(id);
  const out = path.join(OUTPUTS_DIR, `${id}-out.mp4`);
  await writeFile(
    path.join(process.cwd(), "data", "jobs", `${id}-test-ok.txt`),
    `ok ${result.outputUrl}\n`,
  );
  console.log("OK", { out, ...result });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
