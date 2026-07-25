"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Dropzone from "@/components/Dropzone";
import CompareSlider from "@/components/CompareSlider";
import HistoryPanel, { type HistoryEntry } from "@/components/HistoryPanel";
import { LUMA_MODES, MODEL_LIST, MODELS, type ModelId } from "@/lib/models";
import { STYLE_PRESETS } from "@/lib/presets";

type Phase = "idle" | "uploading" | "generating" | "done" | "error";

const HISTORY_KEY = "revideo-history-v1";
const POLL_INTERVAL_MS = 3000;

function uploadWithProgress(file: File, onProgress: (pct: number) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && data.url) resolve(data.url);
        else reject(new Error(data.error ?? `Erreur d'upload (${xhr.status})`));
      } catch {
        reject(new Error(`Erreur d'upload (${xhr.status})`));
      }
    };
    xhr.onerror = () => reject(new Error("Erreur réseau pendant le téléversement."));
    const formData = new FormData();
    formData.append("file", file);
    xhr.send(formData);
  });
}

export default function Studio() {
  const [file, setFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const [modelId, setModelId] = useState<ModelId>("luma-ray2-modify");
  const [prompt, setPrompt] = useState("");
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [strengthIdx, setStrengthIdx] = useState(3); // flex_1 par défaut
  const [keepAudio, setKeepAudio] = useState(true);

  const [phase, setPhase] = useState<Phase>("idle");
  const [uploadPct, setUploadPct] = useState(0);
  const [statusLabel, setStatusLabel] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);

  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [compareInputUrl, setCompareInputUrl] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const cancelledRef = useRef(false);
  const model = MODELS[modelId];
  const busy = phase === "uploading" || phase === "generating";

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      // Chargé après le montage pour rester cohérent avec le rendu serveur (hydratation).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setHistory(JSON.parse(raw));
    } catch {
      // Historique corrompu : on repart de zéro.
    }
    return () => {
      cancelledRef.current = true;
    };
  }, []);

  useEffect(() => {
    if (!busy) return;
    const start = Date.now();
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(timer);
  }, [busy]);

  const saveHistory = useCallback((entries: HistoryEntry[]) => {
    setHistory(entries);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(entries));
    } catch {
      // Quota localStorage atteint : tant pis pour la persistance.
    }
  }, []);

  const handleFile = useCallback(
    (f: File) => {
      if (localPreview) URL.revokeObjectURL(localPreview);
      setFile(f);
      setLocalPreview(URL.createObjectURL(f));
      setUploadedUrl(null);
      setResultUrl(null);
      setError(null);
      setPhase("idle");
    },
    [localPreview],
  );

  const handleClear = useCallback(() => {
    if (localPreview) URL.revokeObjectURL(localPreview);
    setFile(null);
    setLocalPreview(null);
    setUploadedUrl(null);
    setResultUrl(null);
    setError(null);
    setPhase("idle");
  }, [localPreview]);

  const applyPreset = (presetId: string) => {
    const preset = STYLE_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    if (activePreset === presetId) {
      setActivePreset(null);
      setPrompt("");
    } else {
      setActivePreset(presetId);
      setPrompt(preset.prompt);
    }
  };

  const generate = async () => {
    if (!file || busy) return;
    if (model.promptRequired && !prompt.trim()) {
      setError(`Le modèle ${model.label} nécessite un prompt : décrivez la transformation souhaitée.`);
      setPhase("error");
      return;
    }
    if (file.size > model.maxSizeMB * 1024 * 1024) {
      setError(`Vidéo trop lourde pour ${model.label} (${model.maxSizeMB} Mo max).`);
      setPhase("error");
      return;
    }

    setError(null);
    setResultUrl(null);
    setLogs([]);
    setElapsed(0);

    try {
      // 1. Téléversement (réutilisé si déjà fait pour ce fichier)
      let sourceUrl = uploadedUrl;
      if (!sourceUrl) {
        setPhase("uploading");
        setUploadPct(0);
        sourceUrl = await uploadWithProgress(file, setUploadPct);
        setUploadedUrl(sourceUrl);
      }

      // 2. Soumission du job
      setPhase("generating");
      setStatusLabel("Envoi au modèle…");
      const genRes = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modelId,
          videoUrl: sourceUrl,
          prompt: prompt.trim() || undefined,
          mode: LUMA_MODES[strengthIdx].value,
          keepAudio,
        }),
      });
      const genData = await genRes.json();
      if (!genRes.ok) throw new Error(genData.error ?? "La soumission a échoué.");

      // 3. Suivi du job jusqu'à complétion
      const params = new URLSearchParams({ modelId, requestId: genData.requestId });
      for (;;) {
        if (cancelledRef.current) return;
        await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
        const stRes = await fetch(`/api/status?${params.toString()}`);
        const st = await stRes.json();
        if (st.status === "COMPLETED" && st.videoUrl) {
          setResultUrl(st.videoUrl);
          setCompareInputUrl(localPreview);
          setPhase("done");
          const entry: HistoryEntry = {
            id: genData.requestId,
            date: new Date().toISOString(),
            modelId,
            prompt: prompt.trim(),
            inputUrl: sourceUrl,
            outputUrl: st.videoUrl,
          };
          saveHistory([entry, ...history].slice(0, 20));
          return;
        }
        if (!stRes.ok || st.status === "FAILED") {
          throw new Error(st.error ?? "La génération a échoué.");
        }
        setStatusLabel(
          st.status === "IN_QUEUE"
            ? `En file d'attente${typeof st.queuePosition === "number" ? ` (position ${st.queuePosition + 1})` : ""}…`
            : "Génération en cours…",
        );
        if (Array.isArray(st.logs) && st.logs.length) setLogs(st.logs);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur inattendue s'est produite.");
      setPhase("error");
    }
  };

  const restoreFromHistory = (entry: HistoryEntry) => {
    setCompareInputUrl(entry.inputUrl);
    setResultUrl(entry.outputUrl);
    setPhase("done");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-20">
      <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
        {/* Colonne gauche : source + réglages */}
        <div className="space-y-6">
          <section>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-zinc-400">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-500/20 text-[11px] font-bold text-violet-300">
                1
              </span>
              Vidéo de départ
            </h2>
            <Dropzone
              previewUrl={localPreview}
              fileName={file?.name ?? null}
              disabled={busy}
              onFile={handleFile}
              onClear={handleClear}
            />
            <p className="mt-2 text-xs text-zinc-500">{model.formatsHint}</p>
          </section>

          <section>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-zinc-400">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-500/20 text-[11px] font-bold text-violet-300">
                2
              </span>
              Modèle IA
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {MODEL_LIST.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  disabled={busy}
                  onClick={() => setModelId(m.id)}
                  className={`rounded-xl border p-4 text-left transition ${
                    modelId === m.id
                      ? "border-violet-400/60 bg-violet-500/10 ring-1 ring-violet-400/40"
                      : "border-white/10 bg-white/[0.03] hover:border-white/25"
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  <span className="block text-sm font-semibold text-white">{m.label}</span>
                  <span className="mt-1 block text-xs leading-relaxed text-zinc-400">
                    {m.description}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-zinc-400">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-500/20 text-[11px] font-bold text-violet-300">
                3
              </span>
              Transformation
            </h2>

            <div className="mb-3 flex flex-wrap gap-2">
              {STYLE_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  disabled={busy}
                  onClick={() => applyPreset(p.id)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    activePreset === p.id
                      ? "border-cyan-400/60 bg-cyan-500/15 text-cyan-200"
                      : "border-white/10 bg-white/[0.03] text-zinc-300 hover:border-white/30 hover:text-white"
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <textarea
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value);
                setActivePreset(null);
              }}
              disabled={busy}
              rows={3}
              placeholder={
                model.promptRequired
                  ? "Décrivez la transformation (obligatoire pour ce modèle)…"
                  : "Décrivez la transformation souhaitée, ou choisissez un style ci-dessus…"
              }
              className="w-full resize-y rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-violet-400/60 focus:outline-none focus:ring-1 focus:ring-violet-400/40 disabled:opacity-60"
            />

            {model.supportsStrength && (
              <div className="mt-4">
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="font-medium text-zinc-300">Intensité de la transformation</span>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 font-medium text-violet-200">
                    {LUMA_MODES[strengthIdx].label}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={LUMA_MODES.length - 1}
                  step={1}
                  value={strengthIdx}
                  disabled={busy}
                  onChange={(e) => setStrengthIdx(Number(e.target.value))}
                  className="range-thin w-full"
                  aria-label="Intensité de la transformation"
                />
                <div className="mt-1 flex justify-between text-[10px] text-zinc-600">
                  <span>Fidèle à l’original</span>
                  <span>Réinvention totale</span>
                </div>
              </div>
            )}

            {model.supportsKeepAudio && (
              <label className="mt-4 flex cursor-pointer items-center gap-2.5 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  checked={keepAudio}
                  disabled={busy}
                  onChange={(e) => setKeepAudio(e.target.checked)}
                  className="h-4 w-4 rounded border-white/20 bg-white/10 accent-violet-500"
                />
                Conserver la bande son d’origine
              </label>
            )}
          </section>

          <button
            type="button"
            onClick={generate}
            disabled={!file || busy}
            className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/40 transition hover:shadow-violet-800/50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span className="relative z-10">
              {phase === "uploading"
                ? `Téléversement… ${uploadPct}%`
                : phase === "generating"
                  ? "Génération en cours…"
                  : "Générer la vidéo"}
            </span>
            {busy && (
              <span className="absolute inset-0 animate-pulse bg-gradient-to-r from-cyan-600 to-violet-600" />
            )}
          </button>
        </div>

        {/* Colonne droite : résultat */}
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-zinc-400">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500/20 text-[11px] font-bold text-cyan-300">
              4
            </span>
            Résultat
          </h2>

          {phase === "done" && resultUrl ? (
            <div className="space-y-4">
              {compareInputUrl ? (
                <CompareSlider originalUrl={compareInputUrl} resultUrl={resultUrl} />
              ) : (
                <video
                  src={resultUrl}
                  controls
                  playsInline
                  className="aspect-video w-full rounded-2xl border border-white/10 bg-black object-contain"
                />
              )}
              <div className="flex gap-3">
                <a
                  href={resultUrl}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="flex-1 rounded-xl bg-white px-4 py-2.5 text-center text-sm font-semibold text-zinc-900 transition hover:bg-zinc-200"
                >
                  Télécharger la vidéo
                </a>
                <button
                  type="button"
                  onClick={generate}
                  disabled={!file || busy}
                  className="flex-1 rounded-xl border border-white/15 px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-white/35 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Régénérer
                </button>
              </div>
            </div>
          ) : busy ? (
            <div className="flex aspect-video w-full flex-col items-center justify-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-6">
              <div className="relative h-14 w-14">
                <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-violet-400 border-r-cyan-400" />
                <div className="absolute inset-2 animate-pulse rounded-full bg-gradient-to-br from-violet-500/30 to-cyan-500/30" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-zinc-200">
                  {phase === "uploading" ? `Téléversement de la vidéo… ${uploadPct}%` : statusLabel}
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  {elapsed}s écoulées — la génération vidéo prend généralement 1 à 5 minutes
                </p>
              </div>
              {logs.length > 0 && (
                <pre className="max-h-24 w-full overflow-auto rounded-lg bg-black/50 p-3 font-mono text-[10px] leading-relaxed text-zinc-500">
                  {logs.join("\n")}
                </pre>
              )}
            </div>
          ) : (
            <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 text-center">
              <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-zinc-600" aria-hidden>
                <path
                  d="m15 10 5-3v10l-5-3m-11 4h9a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="text-sm text-zinc-500">
                Votre vidéo transformée apparaîtra ici, avec un comparateur avant / après.
              </p>
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm leading-relaxed text-red-200">
              {error}
            </div>
          )}
        </div>
      </div>

      <HistoryPanel entries={history} onRestore={restoreFromHistory} onClear={() => saveHistory([])} />
    </div>
  );
}
