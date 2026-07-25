# FrameShift

Outil de **génération vidéo IA à partir d’une vidéo existante**.

Uploadez un master, choisissez un mode (restyle, motion design, remix rythme, extension), décrivez l’intention, et exportez une nouvelle version.

## Fonctionnalités

- Upload d’un rush existant (MP4 / MOV / WEBM / MKV)
- Analyse technique (`ffprobe`) + vignettes
- Modes :
  - **Restyle** — grades cinématiques, grain, vignette
  - **Motion design** — titres cinétiques, lower thirds, end cards
  - **Remix rythme** — speed ramps / pacing
  - **Étendre** — prolongation ping-pong de la scène
- Pipeline **local director** via `ffmpeg` (prêt hors-ligne)
- Hook optionnel **Replicate** pour du vrai video-to-video cloud

## Démarrage

Prérequis : Node.js 20+, `ffmpeg` et `ffprobe` dans le PATH.

```bash
npm install
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) puis le **Studio**.

## Replicate (optionnel)

```bash
export REPLICATE_API_TOKEN=r8_xxx
export REPLICATE_MODEL=<version-id-video-to-video>
npm run dev
```

Sans ces variables, FrameShift utilise le pipeline local.

## Scripts

- `npm run dev` — serveur de développement
- `npm run build` — build production
- `npm run start` — serveur production
- `npm run lint` — ESLint

## Architecture

```
src/app          UI + routes API
src/components   Landing & Studio
src/lib          jobs, ffmpeg, styles, providers
data/            uploads, thumbs, outputs, jobs (gitignore)
```
