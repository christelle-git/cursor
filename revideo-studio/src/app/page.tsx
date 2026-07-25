import Studio from "@/components/Studio";

export default function Home() {
  return (
    <main className="relative flex-1">
      {/* Fond décoratif */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-violet-600/15 blur-[120px]" />
        <div className="absolute -top-20 right-0 h-[300px] w-[400px] rounded-full bg-cyan-500/10 blur-[100px]" />
        <div className="bg-grid absolute inset-0 opacity-40" />
      </div>

      <header className="mx-auto w-full max-w-6xl px-4 pb-10 pt-14 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-zinc-300 backdrop-blur">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
          Video-to-video par IA — Luma Ray 2 & Kling O3
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          ReVidéo{" "}
          <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
            Studio
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-balance text-sm leading-relaxed text-zinc-400 sm:text-base">
          Partez d’une vidéo existante et transformez-la par IA : restylisation complète
          (anime, aquarelle, cyberpunk…) ou édition guidée (changer le décor, la météo,
          un personnage) — en préservant le mouvement et la structure d’origine.
        </p>
      </header>

      <Studio />

      <footer className="border-t border-white/5 py-6 text-center text-xs text-zinc-600">
        ReVidéo Studio — propulsé par les modèles video-to-video de fal.ai
      </footer>
    </main>
  );
}
