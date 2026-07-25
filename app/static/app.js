const $ = (id) => document.getElementById(id);

const state = {
  file: null,
  style: "cartoon",
  options: null,
  pollTimer: null,
};

// --- Initialisation -------------------------------------------------------
async function init() {
  try {
    const [health, opts] = await Promise.all([
      fetch("/api/health").then((r) => r.json()),
      fetch("/api/options").then((r) => r.json()),
    ]);
    state.options = opts;
    renderEngineStatus(health, opts);
    renderProviders(opts);
    renderStyles(opts.styles);
    renderMotions(opts.motions);
  } catch (e) {
    $("engineStatus").textContent = "Erreur de chargement de l'API";
    $("engineStatus").classList.add("warn");
  }
  bindEvents();
}

function renderEngineStatus(health, opts) {
  const el = $("engineStatus");
  if (health.ffmpeg) {
    el.textContent = "Moteur prêt · ffmpeg OK";
    el.classList.add("ok");
  } else {
    el.textContent = "ffmpeg introuvable — moteur local indisponible";
    el.classList.add("warn");
  }
}

function renderProviders(opts) {
  const sel = $("provider");
  sel.innerHTML = "";
  opts.providers.forEach((p) => {
    const o = document.createElement("option");
    o.value = p.key;
    o.textContent = p.label + (p.available ? "" : " (indisponible)");
    o.disabled = !p.available;
    if (p.key === opts.default_provider && p.available) o.selected = true;
    sel.appendChild(o);
  });
  updateProviderHint();
}

function updateProviderHint() {
  const p = state.options.providers.find((x) => x.key === $("provider").value);
  $("providerHint").textContent = p ? p.description : "";
  // Le prompt négatif ne sert qu'à Replicate.
  $("negField").style.display = $("provider").value === "replicate" ? "" : "none";
}

function renderStyles(styles) {
  const wrap = $("styleChips");
  wrap.innerHTML = "";
  styles.forEach((s) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip" + (s.key === state.style ? " active" : "");
    chip.textContent = s.label;
    chip.dataset.key = s.key;
    chip.dataset.desc = s.description;
    chip.onclick = () => selectStyle(s.key);
    wrap.appendChild(chip);
  });
  const cur = styles.find((s) => s.key === state.style);
  if (cur) $("styleDesc").textContent = cur.description;
}

function selectStyle(key) {
  state.style = key;
  document.querySelectorAll(".chip").forEach((c) => {
    c.classList.toggle("active", c.dataset.key === key);
    if (c.dataset.key === key) $("styleDesc").textContent = c.dataset.desc;
  });
}

function renderMotions(motions) {
  const sel = $("motion");
  sel.innerHTML = "";
  motions.forEach((m) => {
    const o = document.createElement("option");
    o.value = m.key;
    o.textContent = m.label;
    sel.appendChild(o);
  });
}

// --- Événements ------------------------------------------------------------
function bindEvents() {
  const dz = $("dropzone");
  const input = $("fileInput");
  input.addEventListener("change", (e) => onFile(e.target.files[0]));
  ["dragenter", "dragover"].forEach((ev) =>
    dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.add("drag"); })
  );
  ["dragleave", "drop"].forEach((ev) =>
    dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.remove("drag"); })
  );
  dz.addEventListener("drop", (e) => onFile(e.dataTransfer.files[0]));

  $("provider").addEventListener("change", updateProviderHint);
  $("intensity").addEventListener("input", (e) => ($("intensityVal").textContent = Number(e.target.value).toFixed(1)));
  $("speed").addEventListener("input", (e) => ($("speedVal").textContent = Number(e.target.value).toFixed(2) + "×"));
  $("generateBtn").addEventListener("click", startGeneration);
  $("againBtn").addEventListener("click", resetStage);
}

function onFile(file) {
  if (!file) return;
  if (!file.type.startsWith("video/")) {
    alert("Veuillez sélectionner un fichier vidéo.");
    return;
  }
  const maxMb = state.options?.max_upload_mb || 200;
  if (file.size > maxMb * 1024 * 1024) {
    alert(`Fichier trop volumineux (max ${maxMb} Mo).`);
    return;
  }
  state.file = file;
  const url = URL.createObjectURL(file);
  const preview = $("srcPreview");
  preview.src = url;
  preview.hidden = false;
  $("dzEmpty").hidden = true;
  $("fileMeta").textContent = `${file.name} · ${(file.size / 1024 / 1024).toFixed(1)} Mo`;
  $("generateBtn").disabled = false;
  $("formHint").textContent = "Prêt à générer.";
}

// --- Génération ------------------------------------------------------------
async function startGeneration() {
  if (!state.file) return;
  const btn = $("generateBtn");
  btn.disabled = true;

  const fd = new FormData();
  fd.append("file", state.file);
  fd.append("provider", $("provider").value);
  fd.append("prompt", $("prompt").value);
  fd.append("negative_prompt", $("negativePrompt").value);
  fd.append("style", state.style);
  fd.append("motion", $("motion").value);
  fd.append("intensity", $("intensity").value);
  fd.append("speed", $("speed").value);
  if ($("fps").value) fd.append("fps", $("fps").value);
  if ($("maxHeight").value) fd.append("max_height", $("maxHeight").value);

  showProgress(0, "Envoi de la vidéo…");

  try {
    const res = await fetch("/api/generate", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Erreur serveur");
    pollJob(data.job_id);
  } catch (e) {
    showError(e.message);
    btn.disabled = false;
  }
}

function pollJob(jobId) {
  clearInterval(state.pollTimer);
  state.pollTimer = setInterval(async () => {
    try {
      const res = await fetch(`/api/jobs/${jobId}`);
      const job = await res.json();
      if (job.status === "running" || job.status === "queued") {
        showProgress(job.progress || 0, job.message || "Traitement…");
      } else if (job.status === "done") {
        clearInterval(state.pollTimer);
        showResult(job);
      } else if (job.status === "error") {
        clearInterval(state.pollTimer);
        showError(job.error || "Échec de la génération.");
        $("generateBtn").disabled = false;
      }
    } catch (e) {
      // On tolère les erreurs réseau transitoires pendant le polling.
    }
  }, 1200);
}

// --- Rendu du "stage" ------------------------------------------------------
function hideAllStage() {
  ["stageIdle", "stageProgress", "resultVideo", "stageError"].forEach((id) => ($(id).hidden = true));
  $("resultActions").hidden = true;
}

function showProgress(p, msg) {
  hideAllStage();
  $("stageProgress").hidden = false;
  const pct = Math.round(p * 100);
  $("progressPct").textContent = pct + "%";
  $("progressMsg").textContent = msg;
  $("barFill").style.width = pct + "%";
  document.querySelector(".ring").style.setProperty("--p", pct + "%");
}

function showResult(job) {
  hideAllStage();
  const v = $("resultVideo");
  v.src = job.preview_url + "?t=" + Date.now();
  v.hidden = false;
  $("resultActions").hidden = false;
  $("downloadLink").href = job.download_url;
  $("generateBtn").disabled = false;
}

function showError(msg) {
  hideAllStage();
  $("stageError").hidden = false;
  $("errorMsg").textContent = msg;
}

function resetStage() {
  hideAllStage();
  $("stageIdle").hidden = false;
}

init();
