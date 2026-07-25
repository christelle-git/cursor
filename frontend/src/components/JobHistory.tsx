import type { GenerationJob, StylePreset } from "../types";

interface JobHistoryProps {
  jobs: GenerationJob[];
  styles: StylePreset[];
  activeJobId: string | null;
  onSelect: (job: GenerationJob) => void;
}

export function JobHistory({ jobs, styles, activeJobId, onSelect }: JobHistoryProps) {
  if (jobs.length === 0) {
    return (
      <p className="text-xs text-white/35">
        Ton historique de générations apparaîtra ici.
      </p>
    );
  }

  const styleLabel = (id: string) => styles.find((s) => s.id === id)?.label ?? id;

  return (
    <div className="space-y-2">
      {jobs.map((job) => (
        <button
          key={job.job_id}
          onClick={() => onSelect(job)}
          className={`flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left transition ${
            job.job_id === activeJobId
              ? "border-white/30 bg-white/[0.07]"
              : "border-white/5 bg-white/[0.015] hover:bg-white/[0.05]"
          }`}
        >
          <div className="min-w-0">
            <p className="truncate text-sm text-white/85">{styleLabel(job.style_id)}</p>
            <p className="truncate text-[11px] text-white/40">
              {job.prompt ? job.prompt : "Sans instruction supplémentaire"}
            </p>
          </div>
          <span
            className={`h-2 w-2 shrink-0 rounded-full ${
              job.status === "succeeded"
                ? "bg-emerald-400"
                : job.status === "failed"
                  ? "bg-red-400"
                  : "bg-amber-400"
            }`}
          />
        </button>
      ))}
    </div>
  );
}
