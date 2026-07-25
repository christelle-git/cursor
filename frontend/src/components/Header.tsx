interface HeaderProps {
  provider: string | null;
}

export function Header({ provider }: HeaderProps) {
  return (
    <header className="flex items-center justify-between gap-4 px-6 py-5 sm:px-10">
      <div className="flex items-center gap-3">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500 via-purple-500 to-cyan-400 shadow-lg shadow-purple-900/40">
          <span className="animate-glow absolute inset-0 rounded-xl bg-gradient-to-br from-fuchsia-500 via-purple-500 to-cyan-400 blur-md" />
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="relative h-5 w-5 text-white"
          >
            <path
              d="M4 6.5A2.5 2.5 0 0 1 6.5 4h7A2.5 2.5 0 0 1 16 6.5v11A2.5 2.5 0 0 1 13.5 20h-7A2.5 2.5 0 0 1 4 17.5v-11Z"
              stroke="currentColor"
              strokeWidth="1.6"
            />
            <path d="M16 9.5 20 7v10l-4-2.5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="text-left">
          <p className="text-lg font-semibold leading-tight text-white">ClipForge AI</p>
          <p className="text-xs text-white/50">Régénère tes vidéos avec l'IA</p>
        </div>
      </div>

      {provider && (
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70">
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              provider === "replicate" ? "bg-emerald-400" : "bg-amber-400"
            }`}
          />
          {provider === "replicate" ? "Moteur IA : Replicate" : "Mode démo local (ffmpeg)"}
        </div>
      )}
    </header>
  );
}
