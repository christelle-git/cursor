# ReVidéo Studio

Outil de génération vidéo IA qui **part d'une vidéo existante** (video-to-video) : téléversez un clip, décrivez la transformation souhaitée, et l'IA restyle ou réédite la vidéo en préservant le mouvement et la structure d'origine.

## Fonctionnalités

- **Téléversement par glisser-déposer** avec prévisualisation et suivi de progression.
- **Deux modèles IA** au choix :
  - **Luma Ray 2 Modify** — transfert de style (anime, aquarelle, cyberpunk…) avec 9 niveaux d'intensité, de « Subtil » à « Réinvention totale » (30 s / 100 Mo max).
  - **Kling O3 Edit** — édition guidée par instructions : changer un personnage, la météo, le décor… avec conservation optionnelle de la bande son (3–15 s / 200 Mo max).
- **8 styles prédéfinis** en un clic (anime, aquarelle, cyberpunk, pâte à modeler, film noir, pixel art, hiver, cinéma épique) ou prompt libre.
- **Comparateur avant / après** : les deux vidéos sont lues en synchronisation, une poignée glissante révèle l'original et le résultat.
- **Historique local** des générations (localStorage) avec restauration et téléchargement.
- Suivi en temps réel du job (file d'attente, logs, temps écoulé) et messages d'erreur explicites.

## Démarrage

```bash
cd revideo-studio
npm install
cp .env.example .env.local   # puis renseignez FAL_KEY
npm run dev
```

Ouvrez ensuite [http://localhost:3000](http://localhost:3000).

### Clé API

L'outil s'appuie sur [fal.ai](https://fal.ai) pour l'inférence. Créez une clé sur [fal.ai/dashboard/keys](https://fal.ai/dashboard/keys) et placez-la dans `.env.local` :

```
FAL_KEY=votre-clé
```

Sans clé, l'interface fonctionne mais les routes API renvoient une erreur explicite. La facturation est à l'usage (par seconde de vidéo générée).

## Architecture

```
src/
├── app/
│   ├── page.tsx                  # Page principale
│   └── api/
│       ├── upload/route.ts       # Téléversement de la vidéo source vers fal.storage
│       ├── generate/route.ts     # Soumission du job video-to-video (queue fal.ai)
│       └── status/route.ts       # Suivi du job + récupération du résultat
├── components/
│   ├── Studio.tsx                # Orchestration du flux (upload → génération → résultat)
│   ├── Dropzone.tsx              # Zone de dépôt avec prévisualisation
│   ├── CompareSlider.tsx         # Comparateur avant/après synchronisé
│   └── HistoryPanel.tsx          # Historique des générations
└── lib/
    ├── models.ts                 # Catalogue des modèles video-to-video
    ├── presets.ts                # Styles prédéfinis
    └── fal-server.ts             # Client fal.ai (serveur uniquement)
```

La clé API ne quitte jamais le serveur : le navigateur ne parle qu'aux routes API Next.js, qui relaient vers fal.ai.

## Ajouter un modèle

Ajoutez une entrée dans `src/lib/models.ts` (endpoint fal.ai + capacités), puis adaptez la construction de l'input dans `src/app/api/generate/route.ts` si le schéma diffère. L'interface s'adapte automatiquement aux capacités déclarées (`supportsStrength`, `supportsKeepAudio`, `promptRequired`).

## Stack

- [Next.js 16](https://nextjs.org) (App Router, TypeScript)
- [Tailwind CSS 4](https://tailwindcss.com)
- [@fal-ai/client](https://docs.fal.ai/clients/javascript) — file d'attente + stockage fal.ai
