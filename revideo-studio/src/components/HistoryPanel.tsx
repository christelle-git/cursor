"use client";

import type { ModelId } from "@/lib/models";
import { MODELS } from "@/lib/models";

export interface HistoryEntry {
  id: string;
  date: string;
  modelId: ModelId;
  prompt: string;
  inputUrl: string;
  outputUrl: string;
}

interface HistoryPanelProps {
  entries: HistoryEntry[];
  onRestore: (entry: HistoryEntry) => void;
  onClear: () => void;
}

export default function HistoryPanel({ entries, onRestore, onClear }: HistoryPanelProps) {
  if (entries.length === 0) return null;

  return (
    <section className="mt-12">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-zinc-400">
          Générations récentes
        </h2>
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-zinc-500 underline underline-offset-4 transition hover:text-zinc-300"
        >
          Effacer l’historique
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map((entry) => (
          <article
            key={entry.id}
            className="group overflow-hidden rounded-xl border border-white/10 bg-white/[0.03] transition hover:border-white/25"
          >
            <video
              src={entry.outputUrl}
              muted
              loop
              playsInline
              preload="metadata"
              className="aspect-video w-full bg-black object-contain"
              onMouseEnter={(e) => e.currentTarget.play().catch(() => undefined)}
              onMouseLeave={(e) => {
                e.currentTarget.pause();
                e.currentTarget.currentTime = 0;
              }}
            />
            <div className="space-y-2 p-3">
              <p className="line-clamp-2 min-h-[2.2rem] text-xs leading-snug text-zinc-300">
                {entry.prompt || "(sans prompt — restylisation automatique)"}
              </p>
              <div className="flex items-center justify-between text-[11px] text-zinc-500">
                <span>{MODELS[entry.modelId]?.label ?? entry.modelId}</span>
                <span>{new Date(entry.date).toLocaleString("fr-FR")}</span>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onRestore(entry)}
                  className="flex-1 rounded-lg bg-white/10 px-2 py-1.5 text-xs font-medium text-white transition hover:bg-white/20"
                >
                  Comparer
                </button>
                <a
                  href={entry.outputUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 rounded-lg border border-white/10 px-2 py-1.5 text-center text-xs font-medium text-zinc-300 transition hover:border-white/25 hover:text-white"
                >
                  Ouvrir
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
