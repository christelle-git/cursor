# MORPH — AI Video Studio

Prototype d’une interface de transformation vidéo par IA à partir d’une vidéo existante.

## Lancer le projet

Le projet ne requiert aucune dépendance :

```bash
python3 -m http.server 8000
```

Puis ouvrir `http://localhost:8000`.

## Fonctionnalités

- Import MP4, MOV ou WebM par sélection ou glisser-déposer
- Aperçu et lecture de la vidéo source
- Prompt créatif avec enrichissement assisté
- Choix du style, de l’intensité et du format de sortie
- Simulation du processus de génération
- Interface responsive

> La génération finale est simulée. Une API vidéo-vers-vidéo (Runway, Luma, Kling ou modèle auto-hébergé) doit être connectée pour produire les rendus.
