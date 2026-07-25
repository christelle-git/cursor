import type { GenerationJob } from "../types";

interface ResultViewerProps {
  job: GenerationJob | null;
}

const STATUS_LABEL: Record<string, string> = {
  queued: "En file d'attente...",
  processing: "Génération en cours...",
  succeeded: "Terminé",
  failed: "Échec",
};

export function ResultViewer({ job }: ResultViewerProps) {
  if (!job) {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.02] text-center">
        <p className="text-sm text-white/40">
          Le résultat de la génération apparaîtra ici.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium text-white/80">Résultat</p>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            job.status === "succeeded"
              ? "bg-emerald-500/15 text-emerald-300"
              : job.status === "failed"
                ? "bg-red-500/15 text-red-300"
                : "bg-amber-500/15 text-amber-300"
          }`}
        >
          {STATUS_LABEL[job.status] ?? job.status}
        </span>
      </div>

      {job.status === "succeeded" && job.output_url ? (
        <>
          <video
            key={job.output_url}
            src={job.output_url}
            controls
            autoPlay
            loop
            className="aspect-video w-full rounded-xl bg-black object-contain"
          />
          <a
            href={job.output_url}
            download
            className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/85 transition hover:bg-white/10"
          >
            Télécharger la vidéo générée
          </a>
        </>
      ) : job.status === "failed" ? (
        <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-center">
          <p className="text-sm text-red-300">La génération a échoué.</p>
          {job.error && <p className="max-w-md text-xs text-red-300/70">{job.error}</p>}
        </div>
      ) : (
        <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-xl border border-white/10 bg-black/30 p-6">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-white/15 border-t-fuchsia-400" />
          <div className="progress-track h-1.5 w-56 overflow-hidden rounded-full">
            <div
              className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 transition-all"
              style={{ width: `${Math.max(6, job.progress * 100)}%` }}
            />
          </div>
          <p className="text-xs text-white/40">Cela peut prendre quelques instants...</p>
        </div>
      )}
    </div>
  );
}
