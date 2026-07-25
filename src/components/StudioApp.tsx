"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  MODES,
  STYLE_PRESETS,
  type StylePreset,
  type TransformMode,
} from "@/lib/styles";

type JobMeta = {
  duration: number;
  width: number;
  height: number;
  fps: number;
  codec: string;
  hasAudio: boolean;
  sizeBytes: number;
};

type Job = {
  id: string;
  status: string;
  progress: number;
  logs: string[];
  prompt: string;
  title: string;
  mode: TransformMode;
  presetId: string;
  meta?: JobMeta;
  error?: string;
  provider?: string;
  sourceOriginalName?: string;
};

const modePresets = (mode: TransformMode) =>
  STYLE_PRESETS.filter((p) => p.mode === mode);

export function StudioApp() {
  const [mode, setMode] = useState<TransformMode>("restyle");
  const [presetId, setPresetId] = useState(modePresets("restyle")[0].id);
  const [prompt, setPrompt] = useState(
    "Look pub premium, contraste net, grain fin, énergie contenue",
  );
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [thumbs, setThumbs] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<string>("Prêt");

  const presets = useMemo(() => modePresets(mode), [mode]);
  const activePreset: StylePreset =
    presets.find((p) => p.id === presetId) ?? presets[0];

  useEffect(() => {
    if (!presets.some((p) => p.id === presetId)) {
      setPresetId(presets[0].id);
    }
  }, [presets, presetId]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function onFile(selected: File | null) {
    setError(null);
    setOutputUrl(null);
    setJob(null);
    setThumbs([]);
    setSourceUrl(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(selected);
    setPreviewUrl(selected ? URL.createObjectURL(selected) : null);
  }

  async function runPipeline() {
    if (!file) {
      setError("Importez d’abord une vidéo source.");
      return;
    }

    setBusy(true);
    setError(null);
    setOutputUrl(null);
    setPhase("Upload du master…");

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("mode", mode);
      form.append("presetId", activePreset.id);
      form.append("prompt", prompt);
      if (title.trim()) form.append("title", title.trim());

      const uploadRes = await fetch("/api/upload", { method: "POST", body: form });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || "Upload échoué");

      setJob(uploadData.job);
      setSourceUrl(uploadData.sourceUrl);
      setPhase("Analyse du master…");

      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: uploadData.jobId }),
      });
      const analyzeData = await analyzeRes.json();
      if (!analyzeRes.ok) throw new Error(analyzeData.error || "Analyse échouée");

      setJob(analyzeData.job);
      setThumbs(analyzeData.thumbnails || []);
      setPhase("Génération en cours…");

      const genRes = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: uploadData.jobId,
          prompt,
          title: title.trim() || undefined,
          presetId: activePreset.id,
          mode,
        }),
      });
      const genData = await genRes.json();
      if (!genRes.ok) throw new Error(genData.error || "Génération échouée");

      setJob(genData.job);
      setOutputUrl(genData.outputUrl);
      setPhase("Export prêt");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inattendue";
      setError(message);
      setPhase("Erreur");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen pb-20">
      <header className="section-space flex items-center justify-between py-6">
        <Link href="/" className="font-display text-2xl font-bold text-ink">
          FrameShift
        </Link>
        <p className="text-sm text-slate">{phase}</p>
      </header>

      <div className="section-space grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <section>
          <h1 className="font-display text-4xl font-bold tracking-tight text-ink md:text-5xl">
            Studio
          </h1>
          <p className="mt-3 max-w-xl text-slate">
            Importez une vidéo existante, choisissez la direction, générez une nouvelle version.
          </p>

          <label
            className="mt-8 flex min-h-52 cursor-pointer flex-col items-center justify-center border border-dashed border-ink/20 bg-white/50 px-6 py-10 text-center transition hover:border-tide/50 hover:bg-white/80"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const dropped = e.dataTransfer.files?.[0];
              if (dropped) onFile(dropped);
            }}
          >
            <input
              type="file"
              accept="video/mp4,video/quicktime,video/webm,video/x-matroska,.mp4,.mov,.webm,.mkv"
              className="hidden"
              onChange={(e) => onFile(e.target.files?.[0] ?? null)}
            />
            <span className="font-display text-xl font-semibold text-ink">
              {file ? file.name : "Déposez votre master vidéo"}
            </span>
            <span className="mt-2 text-sm text-slate">
              MP4, MOV, WEBM ou MKV · max 80 Mo
            </span>
          </label>

          {(previewUrl || sourceUrl) && (
            <div className="mt-5 overflow-hidden bg-ink">
              <video
                key={outputUrl || previewUrl || sourceUrl || "video"}
                src={outputUrl || previewUrl || sourceUrl || undefined}
                controls
                className="aspect-video w-full bg-black object-contain"
              />
              <div className="flex items-center justify-between px-4 py-3 text-sm text-white/70">
                <span>{outputUrl ? "Résultat généré" : "Aperçu source"}</span>
                {outputUrl && (
                  <a href={outputUrl} download className="text-teal-300 hover:text-white">
                    Télécharger
                  </a>
                )}
              </div>
            </div>
          )}

          {thumbs.length > 0 && (
            <div className="mt-4 grid grid-cols-4 gap-2">
              {thumbs.map((src) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={src}
                  src={src}
                  alt="Vignette analysée"
                  className="aspect-video w-full object-cover"
                />
              ))}
            </div>
          )}
        </section>

        <section className="space-y-6">
          <div>
            <h2 className="font-display text-lg font-semibold text-ink">Mode</h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {MODES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMode(m.id)}
                  className={`border px-4 py-3 text-left transition ${
                    mode === m.id
                      ? "border-tide bg-tide/10"
                      : "border-ink/10 bg-white/40 hover:border-ink/25"
                  }`}
                >
                  <span className="block font-semibold text-ink">{m.label}</span>
                  <span className="mt-1 block text-xs text-slate">{m.blurb}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold text-ink">Preset</h2>
            <div className="mt-3 space-y-2">
              {presets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setPresetId(preset.id)}
                  className={`flex w-full items-start justify-between border px-4 py-3 text-left transition ${
                    activePreset.id === preset.id
                      ? "border-ember/50 bg-ember/10"
                      : "border-ink/10 bg-white/40 hover:border-ink/25"
                  }`}
                >
                  <span>
                    <span className="block font-semibold text-ink">{preset.label}</span>
                    <span className="mt-1 block text-xs text-slate">
                      {preset.description}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-display text-lg font-semibold text-ink" htmlFor="prompt">
              Intention
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className="mt-3 w-full border border-ink/10 bg-white/70 px-4 py-3 text-ink outline-none ring-tide/30 focus:ring"
              placeholder="Décrivez le look, le rythme, le ton…"
            />
          </div>

          <div>
            <label className="font-display text-lg font-semibold text-ink" htmlFor="title">
              Titre / lower third
            </label>
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-3 w-full border border-ink/10 bg-white/70 px-4 py-3 text-ink outline-none ring-tide/30 focus:ring"
              placeholder="Optionnel — sinon dérivé du prompt"
            />
          </div>

          <button
            type="button"
            disabled={busy || !file}
            onClick={runPipeline}
            className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? "Génération…" : "Générer à partir de cette vidéo"}
          </button>

          {error && (
            <p className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          {job && (
            <div className="border border-ink/10 bg-white/60 px-4 py-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-ink">Job {job.status}</span>
                <span className="text-slate">{job.progress}%</span>
              </div>
              <div className="progress-track mt-3 h-2 overflow-hidden">
                <div
                  className="h-full bg-tide transition-all duration-500"
                  style={{ width: `${job.progress}%` }}
                />
              </div>
              {job.meta && (
                <p className="mt-3 text-xs text-slate">
                  {job.meta.width}×{job.meta.height} · {job.meta.duration.toFixed(1)}s ·{" "}
                  {job.meta.fps} fps
                  {job.provider ? ` · ${job.provider}` : ""}
                </p>
              )}
              <ul className="mt-3 max-h-36 space-y-1 overflow-auto text-xs text-slate">
                {job.logs?.slice(-8).map((log, i) => (
                  <li key={`${log}-${i}`}>• {log}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
