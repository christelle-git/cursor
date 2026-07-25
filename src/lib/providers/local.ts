import path from "path";
import { runFfmpeg, probeVideo } from "../ffmpeg";
import type { VideoProvider } from "./types";
import type { StylePreset } from "../styles";

function escapeDrawtext(text: string) {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/:/g, "\\:")
    .replace(/'/g, "\\'")
    .replace(/%/g, "\\%")
    .replace(/\n/g, " ");
}

function buildFilter(preset: StylePreset, title: string, duration: number): string {
  const { grade, grain, vignette, speed, titleStyle } = preset;
  const parts: string[] = [];

  parts.push(
    `eq=contrast=${grade.contrast}:brightness=${grade.brightness}:saturation=${grade.saturation}:gamma=${grade.gamma}`,
  );

  if (grain > 0) {
    parts.push(`noise=alls=${Math.round(grain)}:allf=t+u`);
  }

  if (vignette > 0) {
    parts.push(`vignette=PI/${(1.5 + (1 - vignette) * 2).toFixed(2)}`);
  }

  if (Math.abs(speed - 1) > 0.01) {
    parts.push(`setpts=${(1 / speed).toFixed(4)}*PTS`);
  }

  const safeTitle = escapeDrawtext(title || "FrameShift");

  if (titleStyle === "kinetic") {
    const end = Math.min(2.4, Math.max(1.2, duration * 0.25));
    parts.push(
      `drawtext=text='${safeTitle}':fontsize=h/10:fontcolor=white:borderw=2:bordercolor=black@0.35:x=(w-text_w)/2:y=(h-text_h)/2:enable='lt(t,${end.toFixed(2)})':alpha='if(lt(t,0.25),t/0.25,if(gt(t,${(end - 0.35).toFixed(2)}),(${end.toFixed(2)}-t)/0.35,1))'`,
    );
  }

  if (titleStyle === "lowerthird") {
    parts.push(
      `drawbox=x=0:y=h*0.78:w=w*0.62:h=h*0.12:color=0x0F2D38@0.72:t=fill:enable='gte(t,0.6)'`,
      `drawtext=text='${safeTitle}':fontsize=h/22:fontcolor=white:x=w*0.04:y=h*0.82:enable='gte(t,0.75)'`,
    );
  }

  if (titleStyle === "endcard") {
    const start = Math.max(0, duration / speed - 2.2);
    parts.push(
      `drawbox=x=0:y=0:w=iw:h=ih:color=0x0B1C22@0.55:t=fill:enable='gte(t,${start.toFixed(2)})'`,
      `drawtext=text='${safeTitle}':fontsize=h/12:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2-20:enable='gte(t,${(start + 0.2).toFixed(2)})'`,
      `drawtext=text='FrameShift':fontsize=h/28:fontcolor=0x2DD4BF:x=(w-text_w)/2:y=(h-text_h)/2+36:enable='gte(t,${(start + 0.35).toFixed(2)})'`,
    );
  }

  return parts.join(",");
}

export const localProvider: VideoProvider = {
  id: "local",
  isAvailable() {
    return true;
  },
  async generate({ sourcePath, outputPath, preset, job }, onProgress) {
    await onProgress("Lecture du master source…", 15);
    const meta = await probeVideo(sourcePath);
    const filter = buildFilter(preset, job.title, meta.duration);

    await onProgress("Application du grade & motion…", 40);

    const args = [
      "-y",
      "-i",
      sourcePath,
      "-vf",
      filter,
      "-c:v",
      "libx264",
      "-preset",
      "veryfast",
      "-crf",
      "20",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
    ];

    if (meta.hasAudio) {
      if (Math.abs(preset.speed - 1) > 0.01) {
        const tempo = Math.min(2, Math.max(0.5, preset.speed));
        args.push("-af", `atempo=${tempo.toFixed(3)}`);
      }
      args.push("-c:a", "aac", "-b:a", "192k");
    } else {
      args.push("-an");
    }

    if (preset.mode === "extend") {
      // Ping-pong extension: forward + reverse concat for a longer continuum.
      await onProgress("Extension ping-pong de la scène…", 55);
      const tmpDir = path.dirname(outputPath);
      const fwd = path.join(tmpDir, `${job.id}-fwd.mp4`);
      const rev = path.join(tmpDir, `${job.id}-rev.mp4`);
      const list = path.join(tmpDir, `${job.id}-concat.txt`);

      await runFfmpeg([
        "-y",
        "-i",
        sourcePath,
        "-vf",
        filter,
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-crf",
        "20",
        "-an",
        fwd,
      ]);

      await runFfmpeg([
        "-y",
        "-i",
        fwd,
        "-vf",
        "reverse",
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-crf",
        "20",
        "-an",
        rev,
      ]);

      const { writeFile } = await import("fs/promises");
      await writeFile(
        list,
        `file '${fwd.replace(/'/g, "'\\''")}'\nfile '${rev.replace(/'/g, "'\\''")}'\n`,
        "utf8",
      );

      await runFfmpeg([
        "-y",
        "-f",
        "concat",
        "-safe",
        "0",
        "-i",
        list,
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-crf",
        "20",
        "-pix_fmt",
        "yuv420p",
        "-movflags",
        "+faststart",
        "-an",
        outputPath,
      ]);
    } else {
      args.push(outputPath);
      await runFfmpeg(args);
    }

    await onProgress("Encodage finalisé", 92);
  },
};
