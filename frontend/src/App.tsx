import { useCallback, useEffect, useState } from "react";
import { createGeneration, fetchStyles, pollGeneration, uploadVideo } from "./api";
import { Dropzone } from "./components/Dropzone";
import { Header } from "./components/Header";
import { JobHistory } from "./components/JobHistory";
import { PromptPanel } from "./components/PromptPanel";
import { ResultViewer } from "./components/ResultViewer";
import { StylePicker } from "./components/StylePicker";
import type { GenerationJob, StylePreset, UploadedVideo } from "./types";

function App() {
  const [styles, setStyles] = useState<StylePreset[]>([]);
  const [uploadedVideo, setUploadedVideo] = useState<UploadedVideo | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedStyleId, setSelectedStyleId] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [strength, setStrength] = useState(0.5);
  const [currentJob, setCurrentJob] = useState<GenerationJob | null>(null);
  const [jobs, setJobs] = useState<GenerationJob[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchStyles()
      .then((result) => {
        setStyles(result);
        if (result.length > 0) setSelectedStyleId(result[0].id);
      })
      .catch(() => setErrorMessage("Impossible de charger les styles disponibles."));
  }, []);

  const handleFileSelected = useCallback(async (file: File) => {
    setErrorMessage(null);
    setUploading(true);
    setUploadProgress(0);
    setCurrentJob(null);
    try {
      const result = await uploadVideo(file, setUploadProgress);
      setUploadedVideo(result);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Échec de l'upload.");
    } finally {
      setUploading(false);
    }
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!uploadedVideo || !selectedStyleId) return;
    setErrorMessage(null);
    try {
      const job = await createGeneration({
        video_id: uploadedVideo.video_id,
        style_id: selectedStyleId,
        prompt: prompt.trim() ? prompt.trim() : undefined,
        strength,
      });
      setCurrentJob(job);
      setJobs((previous) => [job, ...previous]);

      pollGeneration(job.job_id, (updated) => {
        setCurrentJob((current) => (current?.job_id === updated.job_id ? updated : current));
        setJobs((previous) =>
          previous.map((existing) => (existing.job_id === updated.job_id ? updated : existing)),
        );
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Échec de la génération.");
    }
  }, [uploadedVideo, selectedStyleId, prompt, strength]);

  const generating = currentJob?.status === "queued" || currentJob?.status === "processing";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#1a0b2e,_#05050a_60%)] text-white">
      <Header provider={currentJob?.provider ?? null} />

      <main className="mx-auto max-w-6xl px-6 pb-16 sm:px-10">
        <section className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Réinvente n'importe quelle vidéo avec l'IA
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-sm text-white/50">
            Importe une vidéo existante, choisis un style de motion design, et laisse
            l'IA générer une nouvelle version tout en conservant le mouvement d'origine.
          </p>
        </section>

        {errorMessage && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div className="space-y-6">
            <Dropzone
              uploadedVideo={uploadedVideo}
              uploading={uploading}
              uploadProgress={uploadProgress}
              onFileSelected={handleFileSelected}
              onReset={() => {
                setUploadedVideo(null);
                setCurrentJob(null);
              }}
            />

            {styles.length > 0 && (
              <StylePicker
                styles={styles}
                selectedStyleId={selectedStyleId}
                onSelect={setSelectedStyleId}
              />
            )}

            <PromptPanel
              prompt={prompt}
              strength={strength}
              onPromptChange={setPrompt}
              onStrengthChange={setStrength}
              onGenerate={handleGenerate}
              canGenerate={Boolean(uploadedVideo && selectedStyleId)}
              generating={Boolean(generating)}
            />
          </div>

          <div className="space-y-6">
            <ResultViewer job={currentJob} />

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <p className="mb-3 text-sm font-medium text-white/80">Historique</p>
              <JobHistory
                jobs={jobs}
                styles={styles}
                activeJobId={currentJob?.job_id ?? null}
                onSelect={setCurrentJob}
              />
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/5 py-6 text-center text-xs text-white/30">
        ClipForge AI — vidéo-à-vidéo propulsé par des modèles génératifs (Replicate) ou un
        aperçu local via ffmpeg.
      </footer>
    </div>
  );
}

export default App;
