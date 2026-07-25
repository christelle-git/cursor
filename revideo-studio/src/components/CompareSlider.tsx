"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface CompareSliderProps {
  originalUrl: string;
  resultUrl: string;
}

/**
 * Comparateur avant/après : les deux vidéos sont superposées et lues en
 * synchronisation ; une poignée verticale révèle l'original à gauche et le
 * résultat IA à droite.
 */
export default function CompareSlider({ originalUrl, resultUrl }: CompareSliderProps) {
  const originalRef = useRef<HTMLVideoElement>(null);
  const resultRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const [split, setSplit] = useState(50);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const syncAndPlay = useCallback(async () => {
    const a = originalRef.current;
    const b = resultRef.current;
    if (!a || !b) return;
    a.currentTime = b.currentTime;
    try {
      await Promise.all([a.play(), b.play()]);
      setPlaying(true);
    } catch {
      // Lecture bloquée par le navigateur : l'utilisateur devra recliquer.
    }
  }, []);

  const pause = useCallback(() => {
    originalRef.current?.pause();
    resultRef.current?.pause();
    setPlaying(false);
  }, []);

  useEffect(() => {
    // La vidéo résultat sert d'horloge : on recale l'original si besoin.
    const b = resultRef.current;
    if (!b) return;
    const onTime = () => {
      setProgress(b.currentTime);
      const a = originalRef.current;
      if (a && Math.abs(a.currentTime - b.currentTime) > 0.15) {
        a.currentTime = b.currentTime;
      }
    };
    const onMeta = () => setDuration(b.duration || 0);
    const onEnded = () => setPlaying(false);
    b.addEventListener("timeupdate", onTime);
    b.addEventListener("loadedmetadata", onMeta);
    b.addEventListener("ended", onEnded);
    return () => {
      b.removeEventListener("timeupdate", onTime);
      b.removeEventListener("loadedmetadata", onMeta);
      b.removeEventListener("ended", onEnded);
    };
  }, [resultUrl]);

  const updateSplit = useCallback((clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setSplit(Math.min(98, Math.max(2, pct)));
  }, []);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (draggingRef.current) updateSplit(e.clientX);
    };
    const onUp = () => {
      draggingRef.current = false;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [updateSplit]);

  const seek = (t: number) => {
    const a = originalRef.current;
    const b = resultRef.current;
    if (b) b.currentTime = t;
    if (a) a.currentTime = t;
    setProgress(t);
  };

  const fmt = (s: number) => {
    if (!Number.isFinite(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/40">
      <div ref={containerRef} className="relative aspect-video w-full select-none bg-black">
        {/* Résultat IA (couche du dessous, visible à droite) */}
        <video
          ref={resultRef}
          src={resultUrl}
          playsInline
          className="absolute inset-0 h-full w-full object-contain"
        />
        {/* Original (couche du dessus, rognée à gauche de la poignée) */}
        <video
          ref={originalRef}
          src={originalUrl}
          playsInline
          muted
          className="absolute inset-0 h-full w-full object-contain"
          style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}
        />

        <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium tracking-wide text-zinc-200 ring-1 ring-white/15 backdrop-blur">
          Original
        </span>
        <span className="absolute right-3 top-3 rounded-full bg-gradient-to-r from-violet-600/80 to-cyan-600/80 px-2.5 py-1 text-[11px] font-medium tracking-wide text-white ring-1 ring-white/20 backdrop-blur">
          Résultat IA
        </span>

        {/* Poignée de comparaison */}
        <div
          role="slider"
          aria-label="Curseur de comparaison"
          aria-valuenow={Math.round(split)}
          tabIndex={0}
          onPointerDown={(e) => {
            draggingRef.current = true;
            updateSplit(e.clientX);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") setSplit((s) => Math.max(2, s - 3));
            if (e.key === "ArrowRight") setSplit((s) => Math.min(98, s + 3));
          }}
          className="absolute inset-y-0 z-10 w-8 -translate-x-1/2 cursor-ew-resize"
          style={{ left: `${split}%` }}
        >
          <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white/80 shadow-[0_0_12px_rgba(255,255,255,0.6)]" />
          <div className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-zinc-900 shadow-lg">
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden>
              <path
                d="m9 6-4 6 4 6M15 6l4 6-4 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Barre de lecture commune */}
      <div className="flex items-center gap-3 border-t border-white/10 px-4 py-3">
        <button
          type="button"
          onClick={() => (playing ? pause() : syncAndPlay())}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-zinc-900 transition hover:scale-105"
          aria-label={playing ? "Pause" : "Lecture"}
        >
          {playing ? (
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
              <path d="M8 5.5v13a1 1 0 0 0 1.5.87l11-6.5a1 1 0 0 0 0-1.74l-11-6.5A1 1 0 0 0 8 5.5Z" />
            </svg>
          )}
        </button>
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.05}
          value={progress}
          onChange={(e) => seek(Number(e.target.value))}
          className="range-thin flex-1"
          aria-label="Position de lecture"
        />
        <span className="shrink-0 font-mono text-xs text-zinc-400">
          {fmt(progress)} / {fmt(duration)}
        </span>
      </div>
    </div>
  );
}
