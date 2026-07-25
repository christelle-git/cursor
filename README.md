# ClipForge AI

Un outil de génération vidéo par IA qui part **d'une vidéo déjà existante**
(vidéo-à-vidéo) : tu importes un clip, tu choisis un style de motion design
(cinématique, anime, cyberpunk, VHS rétro...), tu ajoutes une instruction
créative facultative, et l'outil génère une nouvelle version de la vidéo qui
conserve le mouvement d'origine tout en appliquant le style demandé.

## Architecture

```
backend/    API FastAPI (Python) : upload, styles, jobs de génération
frontend/   Interface React + TypeScript + Tailwind CSS
```

Le backend expose une **abstraction de fournisseur** (`app/providers/`) qui
permet de brancher n'importe quel moteur de génération vidéo-à-vidéo sans
toucher au reste de l'application :

- **`mock`** (par défaut) : traite la vidéo localement avec `ffmpeg`
  (étalonnage, grain, flou...) selon le style choisi. Aucune clé API requise,
  fonctionne entièrement hors ligne. Idéal pour développer/tester le produit
  de bout en bout, ou comme filet de sécurité.
- **`replicate`** : appelle un vrai modèle de génération vidéo-à-vidéo par IA
  hébergé sur [Replicate](https://replicate.com) (ex. `luma/modify-video`,
  `kwaivgi/kling-v3-omni-video`), qui restylise la vidéo tout en préservant sa
  structure et son mouvement.

## Démarrage rapide

### Backend

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # ajuster VIDEO_PROVIDER / REPLICATE_API_TOKEN si besoin
uvicorn app.main:app --reload --port 8000
```

Nécessite `ffmpeg` installé sur la machine (mode `mock`, mais aussi pour
encoder/valider les fichiers en général).

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Le serveur de dev Vite (port 5173) proxifie automatiquement `/api` et
`/media` vers le backend (port 8000) — voir `frontend/vite.config.ts`.

### Activer la génération IA réelle (Replicate)

1. Créer un jeton sur <https://replicate.com/account/api-tokens>.
2. Définir en secret (Cursor Dashboard > Cloud Agents > Secrets, ou `.env`
   local) :
   ```
   VIDEO_PROVIDER=replicate
   REPLICATE_API_TOKEN=r8_xxx...
   REPLICATE_MODEL=luma/modify-video
   ```
3. Redémarrer le backend. Les modèles pris en charge nativement par
   `app/providers/replicate_provider.py` sont `luma/modify-video` et
   `kwaivgi/kling-v3-omni-video` ; on peut en ajouter d'autres en complétant
   le dictionnaire `_INPUT_BUILDERS` de ce fichier.

## Tests

```bash
cd backend
source .venv/bin/activate
pytest tests/ -v
```

Les tests couvrent le catalogue de styles, le fournisseur `mock` (génération
réelle via `ffmpeg` sur une vidéo de test synthétique), et le flux API complet
(upload → génération → téléchargement du résultat).

## Fonctionnement du pipeline

1. **Upload** (`POST /api/uploads`) : la vidéo source est sauvegardée sur
   disque et un `video_id` est renvoyé.
2. **Génération** (`POST /api/generations`) : crée un job (style, prompt
   optionnel, intensité 0–1) et lance le traitement en arrière-plan via le
   fournisseur configuré.
3. **Suivi** (`GET /api/generations/{job_id}`) : le frontend interroge
   périodiquement le statut (`queued` → `processing` → `succeeded`/`failed`)
   jusqu'à obtenir l'URL de la vidéo générée.

## Styles disponibles

Cinématique, Anime, Cyberpunk, Claymation, VHS Rétro, Aquarelle, Film Noir,
Dreamcore — voir `backend/app/styles.py` pour les prompts et réglages exacts
de chacun (facilement extensible).
