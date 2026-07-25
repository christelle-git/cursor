interface PromptPanelProps {
  prompt: string;
  strength: number;
  onPromptChange: (value: string) => void;
  onStrengthChange: (value: number) => void;
  onGenerate: () => void;
  canGenerate: boolean;
  generating: boolean;
}

export function PromptPanel({
  prompt,
  strength,
  onPromptChange,
  onStrengthChange,
  onGenerate,
  canGenerate,
  generating,
}: PromptPanelProps) {
  return (
    <div className="space-y-5">
      <div>
        <label className="mb-2 block text-sm font-medium text-white/80" htmlFor="prompt">
          Instruction créative (facultatif)
        </label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(event) => onPromptChange(event.target.value)}
          rows={3}
          placeholder="Ex : ajoute une ambiance pluvieuse, ralentis les mouvements, garde le personnage principal..."
          className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-fuchsia-400/60 focus:outline-none"
        />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-white/80">Intensité de la transformation</span>
          <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-white/60">
            {Math.round(strength * 100)}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={strength}
          onChange={(event) => onStrengthChange(Number(event.target.value))}
          className="w-full accent-fuchsia-500"
        />
        <div className="mt-1 flex justify-between text-[11px] text-white/35">
          <span>Fidèle à l'original</span>
          <span>Réinvention totale</span>
        </div>
      </div>

      <button
        type="button"
        onClick={onGenerate}
        disabled={!canGenerate || generating}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-500 via-purple-500 to-cyan-400 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-900/40 transition disabled:cursor-not-allowed disabled:opacity-40"
      >
        {generating ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            Génération en cours...
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
              <path
                d="M12 3v3m0 12v3m9-9h-3M6 12H3m14.24-6.24-2.12 2.12M8.88 15.12l-2.12 2.12m10.48 0-2.12-2.12M8.88 8.88 6.76 6.76"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
            Générer la vidéo
          </>
        )}
      </button>
    </div>
  );
}
