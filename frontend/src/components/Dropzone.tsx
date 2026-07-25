import { useCallback, useRef, useState } from "react";
import type { UploadedVideo } from "../types";

interface DropzoneProps {
  uploadedVideo: UploadedVideo | null;
  uploading: boolean;
  uploadProgress: number;
  onFileSelected: (file: File) => void;
  onReset: () => void;
}

export function Dropzone({
  uploadedVideo,
  uploading,
  uploadProgress,
  onFileSelected,
  onReset,
}: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);
      const file = event.dataTransfer.files?.[0];
      if (file) onFileSelected(file);
    },
    [onFileSelected],
  );

  if (uploadedVideo && !uploading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-white/80">Vidéo source</p>
          <button
            onClick={onReset}
            className="text-xs text-white/50 transition hover:text-white"
          >
            Changer de vidéo
          </button>
        </div>
        <video
          key={uploadedVideo.url}
          src={uploadedVideo.url}
          controls
          className="mt-3 aspect-video w-full rounded-xl bg-black object-contain"
        />
        <p className="mt-2 truncate text-xs text-white/40">
          {uploadedVideo.filename} · {(uploadedVideo.size_bytes / (1024 * 1024)).toFixed(1)} Mo
        </p>
      </div>
    );
  }

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`flex aspect-video w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 text-center transition ${
        isDragging
          ? "border-fuchsia-400 bg-fuchsia-500/10"
          : "border-white/15 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.04]"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onFileSelected(file);
        }}
      />

      {uploading ? (
        <>
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-fuchsia-400" />
          <p className="text-sm text-white/70">Envoi de la vidéo... {Math.round(uploadProgress * 100)}%</p>
          <div className="progress-track h-1.5 w-48 overflow-hidden rounded-full">
            <div
              className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 transition-all"
              style={{ width: `${uploadProgress * 100}%` }}
            />
          </div>
        </>
      ) : (
        <>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-white/60">
              <path
                d="M12 16V4m0 0-4 4m4-4 4 4M5 16v2.5A2.5 2.5 0 0 0 7.5 21h9a2.5 2.5 0 0 0 2.5-2.5V16"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="text-sm font-medium text-white/80">
            Dépose ta vidéo ici, ou clique pour la sélectionner
          </p>
          <p className="text-xs text-white/40">MP4, MOV, WEBM, MKV — 500 Mo max</p>
        </>
      )}
    </div>
  );
}
