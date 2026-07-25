# MotionForge — Génération vidéo IA à partir d'une vidéo existante

MotionForge est un outil **vidéo-à-vidéo** : vous partez d'une vidéo déjà
existante et vous en générez une nouvelle version restylisée (motion design),
en local ou via un vrai modèle génératif distant.

Il combine deux moteurs :

| Moteur | Description | Clé requise |
| --- | --- | --- |
| **Local (ffmpeg)** | Restyling déterministe et **hors-ligne** : bibliothèque de styles (cartoon, néon, cyberpunk, vintage, noir, croquis, glow, thermique, pixel art…) + effets de mouvement (Ken Burns, secousse, glitch), réglages d'intensité, vitesse, FPS et résolution. | ❌ Aucune |
| **Replicate (IA générative)** | Vraie génération vidéo-à-vidéo par modèle de diffusion, guidée par un prompt. | ✅ `REPLICATE_API_TOKEN` |

Le moteur local fonctionne immédiatement, sans compte ni clé d'API. Le moteur
Replicate s'active automatiquement dès qu'un token est fourni.

---

## Aperçu

- Interface web moderne (glisser-déposer, prévisualisation, progression en temps réel, téléchargement du MP4).
- API REST simple (`/api/generate`, `/api/jobs/{id}`…).
- Traitement asynchrone : les rendus tournent en arrière-plan et la progression est remontée à l'UI.

---

## Prérequis

- **Python 3.10+**
- **ffmpeg / ffprobe** installés et accessibles dans le `PATH`
  - Debian/Ubuntu : `sudo apt install ffmpeg`
  - macOS : `brew install ffmpeg`

## Installation

```bash
pip install -r requirements.txt
# (ou, en environnement "externally managed" : pip install --user --break-system-packages -r requirements.txt)
```

## Lancement

```bash
./run.sh
# ou directement :
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Puis ouvrez <http://localhost:8000>.

---

## Configuration (optionnelle)

Copiez `.env.example` en `.env` et ajustez :

```dotenv
MF_DEFAULT_PROVIDER=local          # "local" ou "replicate"
REPLICATE_API_TOKEN=               # requis pour le moteur Replicate
MF_REPLICATE_MODEL=fofr/video-to-video
MF_MAX_UPLOAD_MB=200
MF_STORAGE_DIR=storage
```

> Pour le moteur Replicate, renseignez `REPLICATE_API_TOKEN`
> (voir <https://replicate.com/account/api-tokens>) et, si besoin, un modèle
> vidéo-à-vidéo au format `owner/name` ou `owner/name:version`.

---

## API

| Méthode | Route | Rôle |
| --- | --- | --- |
| `GET` | `/api/health` | État du service (dont disponibilité de ffmpeg). |
| `GET` | `/api/options` | Styles, effets de mouvement et moteurs disponibles. |
| `POST` | `/api/generate` | Lance une génération (multipart : `file` + paramètres). Retourne `job_id`. |
| `GET` | `/api/jobs/{id}` | État/progression du job. |
| `GET` | `/api/jobs/{id}/preview` | Lecture en streaming du résultat. |
| `GET` | `/api/jobs/{id}/download` | Téléchargement du MP4 généré. |

### Exemple (moteur local)

```bash
curl -F "file=@source.mp4" \
     -F "provider=local" \
     -F "style=cyberpunk" \
     -F "motion=zoom" \
     -F "intensity=1.4" \
     -F "speed=1.0" \
     http://localhost:8000/api/generate
# -> {"job_id": "...", "status": "queued"}
```

### Paramètres de `/api/generate`

| Champ | Valeurs | Défaut |
| --- | --- | --- |
| `file` | fichier vidéo (MP4, MOV, WEBM…) | — |
| `provider` | `local`, `replicate` | `MF_DEFAULT_PROVIDER` |
| `prompt` | texte libre (guide créatif ; utilisé par Replicate) | `""` |
| `negative_prompt` | texte (Replicate) | `""` |
| `style` | `none, cartoon, neon, cyberpunk, vintage, noir, sketch, dreamy, thermal, pixel` | `cartoon` |
| `motion` | `none, zoom, shake, glitch` | `none` |
| `intensity` | `0.0`–`2.0` | `1.0` |
| `speed` | `0.25`–`4.0` | `1.0` |
| `fps` | entier (sinon conserve) | — |
| `max_height` | `480`, `720`, `1080`… | — |

---

## Architecture

```
app/
  main.py            # API FastAPI + service de l'UI statique
  config.py          # configuration (.env)
  jobs.py            # gestionnaire de jobs en arrière-plan
  video.py           # moteur ffmpeg : styles, mouvements, rendu
  providers/
    base.py          # interface Provider
    local.py         # moteur local (ffmpeg)
    replicate.py     # moteur Replicate (vidéo-à-vidéo génératif)
  static/            # interface web (HTML/CSS/JS)
tests/               # tests unitaires + intégration (dont rendu bout-en-bout)
```

## Tests

```bash
pip install pytest
python3 -m pytest -q
```

Les tests couvrent la construction des filtergraphs, la validation des
paramètres et un rendu vidéo complet de bout en bout via l'API (nécessite
ffmpeg).

---

## Notes

- Les fichiers uploadés et générés sont stockés dans `storage/` (ignoré par git).
- La génération locale est déterministe : mêmes paramètres → même rendu.
- Pour une transformation réellement « générative » (nouveaux contenus, pas
  seulement un restyling), utilisez le moteur **Replicate**.
