const videoInput = document.querySelector("#videoInput");
const dropzone = document.querySelector("#dropzone");
const videoPreview = document.querySelector("#videoPreview");
const sourceVideo = document.querySelector("#sourceVideo");
const videoName = document.querySelector("#videoName");
const videoMeta = document.querySelector("#videoMeta");
const removeVideo = document.querySelector("#removeVideo");
const playButton = document.querySelector("#playButton");
const promptInput = document.querySelector("#prompt");
const charCount = document.querySelector("#charCount");
const enhancePrompt = document.querySelector("#enhancePrompt");
const intensity = document.querySelector("#intensity");
const intensityValue = document.querySelector("#intensityValue");
const generateButton = document.querySelector("#generateButton");
const generationProgress = document.querySelector("#generationProgress");
const progressTitle = document.querySelector("#progressTitle");
const progressDetail = document.querySelector("#progressDetail");
const progressValue = document.querySelector("#progressValue");
const progressBar = document.querySelector("#progressBar");
const toast = document.querySelector("#toast");

let sourceUrl = null;
let generationTimer = null;

const formatBytes = (bytes) => {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
};

const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remaining = Math.floor(seconds % 60);
  return `${minutes}:${String(remaining).padStart(2, "0")}`;
};

const showToast = (message) => {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2800);
};

const updateGenerateState = () => {
  generateButton.disabled = !sourceUrl || !promptInput.value.trim();
};

const resetVideo = () => {
  sourceVideo.pause();
  sourceVideo.removeAttribute("src");
  sourceVideo.load();
  if (sourceUrl) URL.revokeObjectURL(sourceUrl);
  sourceUrl = null;
  videoInput.value = "";
  videoPreview.classList.add("hidden");
  dropzone.classList.remove("hidden");
  updateGenerateState();
};

const loadVideo = (file) => {
  if (!file || !file.type.startsWith("video/")) {
    showToast("Veuillez sélectionner un fichier vidéo.");
    return;
  }

  if (file.size > 500 * 1024 * 1024) {
    showToast("Cette vidéo dépasse la limite de 500 Mo.");
    return;
  }

  if (sourceUrl) URL.revokeObjectURL(sourceUrl);
  sourceUrl = URL.createObjectURL(file);
  sourceVideo.src = sourceUrl;
  videoName.textContent = file.name;
  videoMeta.textContent = formatBytes(file.size);
  dropzone.classList.add("hidden");
  videoPreview.classList.remove("hidden");

  sourceVideo.addEventListener(
    "loadedmetadata",
    () => {
      if (sourceVideo.duration > 60) {
        showToast("La vidéo dépasse 60 secondes. Elle sera limitée au premier extrait.");
      }
      videoMeta.textContent = `${formatDuration(sourceVideo.duration)} · ${formatBytes(file.size)}`;
    },
    { once: true },
  );

  updateGenerateState();
};

dropzone.addEventListener("click", () => videoInput.click());
videoInput.addEventListener("change", ({ target }) => loadVideo(target.files[0]));

["dragenter", "dragover"].forEach((eventName) => {
  dropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropzone.classList.add("dragging");
  });
});

["dragleave", "drop"].forEach((eventName) => {
  dropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropzone.classList.remove("dragging");
  });
});

dropzone.addEventListener("drop", (event) => loadVideo(event.dataTransfer.files[0]));
removeVideo.addEventListener("click", (event) => {
  event.stopPropagation();
  resetVideo();
  videoInput.click();
});

playButton.addEventListener("click", () => {
  if (sourceVideo.paused) {
    sourceVideo.play();
    playButton.innerHTML = '<svg viewBox="0 0 24 24"><path d="M8 6h3v12H8zm5 0h3v12h-3z"/></svg>';
  } else {
    sourceVideo.pause();
    playButton.innerHTML = '<svg viewBox="0 0 24 24"><path d="m9 6 9 6-9 6Z"/></svg>';
  }
});

sourceVideo.addEventListener("ended", () => {
  playButton.innerHTML = '<svg viewBox="0 0 24 24"><path d="m9 6 9 6-9 6Z"/></svg>';
});

promptInput.addEventListener("input", () => {
  charCount.textContent = `${promptInput.value.length} / 600`;
  updateGenerateState();
});

enhancePrompt.addEventListener("click", () => {
  const current = promptInput.value.trim();
  if (!current) {
    promptInput.value =
      "Transforme cette scène en séquence cinématographique onirique, lumière dorée volumétrique, textures détaillées, profondeur de champ naturelle et mouvements de caméra fluides.";
  } else if (!current.includes("qualité cinématographique")) {
    promptInput.value = `${current.replace(/[.\s]+$/, "")}, qualité cinématographique, lumière cohérente, détails fins, mouvement naturel et continuité parfaite entre les plans.`;
  }
  promptInput.dispatchEvent(new Event("input"));
  showToast("Votre prompt a été enrichi par l’IA.");
});

document.querySelectorAll(".style-card").forEach((card) => {
  card.addEventListener("click", () => {
    document.querySelectorAll(".style-card").forEach((item) => item.classList.remove("selected"));
    card.classList.add("selected");
  });
});

document.querySelectorAll(".format-buttons button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".format-buttons button").forEach((item) => item.classList.remove("selected"));
    button.classList.add("selected");
  });
});

intensity.addEventListener("input", () => {
  intensityValue.textContent = `${intensity.value}%`;
});

const stages = [
  [0, "Analyse de votre vidéo…", "Détection des scènes et des mouvements"],
  [26, "Compréhension du prompt…", "Interprétation de votre direction créative"],
  [48, "Transformation des images…", "Application du style et préservation du mouvement"],
  [79, "Finalisation du rendu…", "Lissage temporel et amélioration des détails"],
  [100, "Votre aperçu est prêt", "La démo de génération est terminée"],
];

generateButton.addEventListener("click", () => {
  if (generateButton.disabled) return;

  generationProgress.classList.remove("hidden");
  generateButton.disabled = true;
  generationProgress.scrollIntoView({ behavior: "smooth", block: "nearest" });
  let progress = 0;

  window.clearInterval(generationTimer);
  generationTimer = window.setInterval(() => {
    progress = Math.min(100, progress + Math.ceil(Math.random() * 5));
    const stage = [...stages].reverse().find(([threshold]) => progress >= threshold);
    progressTitle.textContent = stage[1];
    progressDetail.textContent = stage[2];
    progressValue.textContent = `${progress}%`;
    progressBar.style.width = `${progress}%`;

    if (progress === 100) {
      window.clearInterval(generationTimer);
      showToast("Simulation terminée — connectez une API pour obtenir le rendu final.");
      window.setTimeout(() => {
        generationProgress.classList.add("hidden");
        progressBar.style.width = "0";
        updateGenerateState();
      }, 2800);
    }
  }, 260);
});

window.addEventListener("beforeunload", () => {
  if (sourceUrl) URL.revokeObjectURL(sourceUrl);
  window.clearInterval(generationTimer);
});
