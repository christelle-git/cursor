# La « bible » du petit robot — kit d'identité pour reproduction à l'identique

> **Référence officielle validée : `assets/illustrations/robot_v4_FINAL_fiche_personnage.png`** (le 04/07/2026).
> Ce document répond à la question : *« Comment faire pour qu'un générateur sache reproduire ce robot à l'identique, dans toutes les situations ? »*

---

## 1. Le principe : un personnage cohérent = référence visuelle + description verrouillée + (idéalement) modèle personnalisé

Aucun générateur ne garantit l'identité parfaite à partir du seul texte : le texte est ambigu, l'image de référence ne l'est pas. La cohérence se construit en trois niveaux, du plus simple au plus robuste.

### Niveau 1 — La référence d'image systématique *(ce que nous faisons déjà)*

À **chaque** génération, joindre la fiche personnage officielle (`robot_v4_FINAL_fiche_personnage.png`) comme image de référence, ET coller le bloc de description verrouillé (§3 ci-dessous). Ne jamais décrire le robot de mémoire ou avec des mots différents d'une fois sur l'autre : toute variation de vocabulaire est une invitation à la dérive.

- Outil le mieux classé en 2026 pour cet usage : **Nano Banana Pro / 2** (Google, via Gemini) — n°1 en cohérence de personnage par référence d'image.
- Limite : de petites dérives subsistent (nombre de rivets, proportion du ventre, position des voyants). Acceptable pour des brouillons, pas pour une série de 18 planches parfaitement homogènes.

### Niveau 2 — Le kit d'identité complet *(à constituer, 30 minutes)*

Plus les références couvrent d'angles et de détails, moins le générateur invente. Le kit idéal :

1. **La fiche 6 poses** (faite : v4).
2. **Un tour complet du personnage** : face / trois-quarts / profil gauche (trappe visible) / profil droit / dos — à générer une fois, puis à réutiliser partout.
3. **Des gros plans des détails critiques** : la trappe d'entretien à charnières, la jauge à aiguille, les deux voyants, la plaque ventrale vissée, l'antenne. C'est ce qui empêche le générateur de « simplifier » les détails en petit format.
4. **La palette codifiée** (§4).

### Niveau 3 — La solution professionnelle : entraîner un modèle personnalisé (LoRA)

C'est la vraie réponse à « à l'identique, dans toutes les situations ». On **entraîne une petite extension de modèle** (un *LoRA*) sur 20 à 40 images du robot (les poses de la fiche, le tour complet, les gros plans, quelques mises en situation). Le personnage devient alors un **mot du vocabulaire du modèle** (ex. `<robot_conf>`), invocable dans n'importe quelle scène sans joindre de référence — c'est exactement ainsi que les studios gèrent leurs mascottes.

- **Plateformes no-code (2026)** : Scenario (spécialiste personnages/assets), Leonardo.ai (« Elements »), fal.ai ou Replicate (entraînement LoRA sur Flux 2, le meilleur modèle ouvert). Comptez ~20-30 min d'entraînement et quelques euros.
- **Recette** : uploader les 20-40 images du kit → étiqueter chacune avec le même mot-clé → entraîner → générer « `<robot_conf>` en mineur avec une pioche brandissant un diamant, style feutre BD » et le robot revient identique, sous tous les angles.
- **Bonus cohérence de style** : on peut entraîner un **second LoRA sur votre propre style de dessin** (vos illustrations existantes) et cumuler les deux : votre trait + votre personnage, systématiquement.

### Alternative rapide : Midjourney `--cref`

Midjourney V7 propose la référence de personnage (`--cref` + `--cw` pour doser, `--sref` pour le style). Efficace, mais dérive documentée sur les longues séries — moins strict qu'un LoRA.

---

## 2. Le workflow recommandé pour les 18 illustrations

1. Compléter le kit d'identité (tour complet + gros plans) avec la v4 en référence.
2. Entraîner le LoRA (niveau 3) — ou, à défaut, rester en niveau 1+2 rigoureux : v4 en référence + bloc verrouillé à chaque image.
3. Générer chaque illustration de la liste (`04_liste_illustrations.md`) en réutilisant TOUJOURS le même bloc de description du robot, en ne changeant QUE la scène.
4. Retouches finales à la main — et signature « CL » sur chaque planche.

---

## 3. Le bloc de description verrouillé (à copier-coller tel quel dans chaque prompt)

> Petit robot mascotte rondouillard et mécanique, dessiné à la main au feutre à alcool et crayons de couleur, trait noir net de bande dessinée, couleurs saturées joyeuses. Corps-tonneau bombé bleu ciel aux angles très arrondis, gros ventre rebondi avec plaque ventrale blanche boulonnée par 4 vis cruciformes, jauge à aiguille orange sur la poitrine, deux petits voyants LED (un vert, un rouge) sous la plaque, rivets le long des coutures de tôle. Sur le flanc gauche, une trappe d'entretien carrée en tôle bleue aux coins arrondis, bordée de rivets, avec deux charnières visibles (PAS de clé ni d'outil). Tête écran carrée aux coins arrondis, grille d'aération sur la tempe, immenses yeux brillants à reflets étoilés, grand sourire attachant, deux antennes métalliques segmentées terminées par des boules oranges. Bras et jambes courts et potelés, segmentés, articulations sphériques boulonnées, pinces à trois doigts, semelles à crampons avec liseré orange.

*(Puis décrire uniquement la scène : décor, action, accessoires, émotion.)*

---

## 4. La palette codifiée

| Élément | Couleur |
|---|---|
| Corps, tête, trappe | Bleu ciel franc (feutre), ombres bleu moyen |
| Plaque ventrale, écran-visage | Blanc cassé |
| Boules d'antennes, jauge, semelles (liseré) | Orange vif |
| Voyants | Vert vif + rouge vif |
| Articulations, rivets, grilles | Gris métal |
| Trait | Noir, épaisseur constante |
| Yeux | Iris sombre à reflets étoilés blancs |

---

## 5. Historique des versions

| Version | Fichier | Statut |
|---|---|---|
| v1 (rond, lisse) | `robot_mascotte_fiche_personnage.png` | abandonné (trop rond, pas assez mécanique) |
| v2-A (boîtier mécanique) | `robot_v2_variante_A_mecanique.png` | base retenue |
| v2-B (rétro, clé de remontage) | `robot_v2_variante_B_retro_mecanique.png` | abandonné |
| v3 (rondouillard + mécanique) | `robot_v3_rondouillard_mecanique.png` | corrigé (clé sur le flanc → trappe) |
| **v4 (trappe d'entretien flanc gauche)** | `robot_v4_FINAL_fiche_personnage.png` | **VALIDÉ — référence officielle** |
