"use client";

import { useCallback, useRef, useState } from "react";

interface DropzoneProps {
  previewUrl: string | null;
  fileName: string | null;
  disabled: boolean;
  onFile: (file: File) => void;
  onClear: () => void;
}

export default function Dropzone({ previewUrl, fileName, disabled, onFile, onClear }: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (disabled || !files || files.length === 0) return;
      const file = files[0];
      if (!file.type.startsWith("video/")) return;
      onFile(file);
    },
    [disabled, onFile],
  );

  if (previewUrl) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40">
        <video
          src={previewUrl}
          controls
          playsInline
          className="aspect-video w-full bg-black object-contain"
        />
        <div className="flex items-center justify-between gap-3 border-t border-white/10 px-4 py-2.5">
          <span className="truncate text-sm text-zinc-400">{fileName}</span>
          <button
            type="button"
            onClick={onClear}
            disabled={disabled}
            className="shrink-0 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-white/25 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Changer de vidéo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Déposer une vidéo"
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !disabled) inputRef.current?.click();
      }}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={`flex aspect-video w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed transition-all ${
        dragOver
          ? "border-violet-400 bg-violet-500/10 shadow-[0_0_40px_-10px_rgba(139,92,246,0.5)]"
          : "border-white/15 bg-white/[0.03] hover:border-white/30 hover:bg-white/[0.05]"
      } ${disabled ? "pointer-events-none opacity-50" : ""}`}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/25 to-cyan-500/25 ring-1 ring-white/10">
        <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7 text-violet-300" aria-hidden>
          <path
            d="M12 16V4m0 0-4 4m4-4 4 4M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-zinc-200">
          Glissez votre vidéo ici <span className="text-zinc-500">ou</span>{" "}
          <span className="text-violet-300 underline underline-offset-4">parcourez</span>
        </p>
        <p className="mt-1 text-xs text-zinc-500">MP4 ou MOV — c’est votre point de départ</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/quicktime,video/*"
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
