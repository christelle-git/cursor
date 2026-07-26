# Analyse des récurrences dans les sommaires

Corpus analysé (7 articles) :

| Sigle | Article |
|---|---|
| **WM18** | World Models (Ha & Schmidhuber, 2018) |
| **ARCHI** | A comprehensive survey of architectures (05/2026) |
| **ROADMAP** | A definition and roadmap for World Models (07/2026) |
| **AGENTIC** | Agentic World Modeling (06/2026) |
| **INJECT** | Research on World Models is not merely injecting… (02/2026) |
| **TUTO** | A tutorial on world models and physical AI (06/2026) |
| **ROBOT** | World Model for robot learning: a comprehensive survey (04/2026) |

## Thèmes récurrents, par fréquence

### 1. Espaces latents et choix de représentation — 7/7

Présent partout : le VAE de WM18, « Role of latent spaces » et toute la
« Classification by representation » d'ARCHI, « Latent-space World Models »
de ROADMAP, « Learning latent World Models » de TUTO, « Policies with
latent-space World Modeling » de ROBOT, le bloc « representation » d'AGENTIC.

À l'intérieur de ce thème, un débat structurant revient dans au moins 3
articles (ARCHI, ROADMAP, TUTO) : **prédire dans l'espace des observations
(pixels, génération vidéo) vs dans un espace latent vs en joint-embedding
(JEPA, sans génération)**. TUTO en fait même son axe principal
(explicite vs implicite).

### 2. Définition et fondements conceptuels — 6/7

ARCHI (« Definition and basic concepts »), ROADMAP (« What is a World
Model ? »), AGENTIC (« Preliminaries », « Definitions of capabilities »),
INJECT (« Unified World Model framework »), TUTO (« Fundamentals »),
ROBOT (« Background »). Chaque article re-propose sa propre définition et
sa propre taxonomie (renderers/simulators/planners chez ROADMAP,
L1/L2/L3 chez AGENTIC, explicite/implicite chez TUTO, 5 axes de
classification chez ARCHI) : **il n'y a pas de définition consensuelle**,
et c'est en soi un point saillant.

### 3. Apprendre et planifier « dans l'imagination » — 6/7

Le fil rouge hérité directement de WM18 (« Learning inside of a dream ») :
« Imagination-based planning » et « Policy learning with a World Model »
(ARCHI), « Policy learning inside World Models » et « Chain-of-imagination »
(ROADMAP), le niveau « L2 Simulator » (AGENTIC), le framework Dreamer (TUTO),
« World Model as simulator » et « Video generation as imagination »
(ROBOT).

### 4. RL basé modèle et planification séquentielle — 6/7

WM18 (contrôleur entraîné dans le rêve), ARCHI (« Online model-based RL »,
« Planning under uncertainty »), ROADMAP (« Model-based RL »,
« Long-horizon and hierarchical planning »), AGENTIC (simulation
« decision-usable »), TUTO (Dreamer, MuZero), ROBOT (« World Model for
reinforcement learning »).

### 5. Robotique et IA physique/incarnée — 5/7

ARCHI (« Robotics and embodied AI », deux fois), ROADMAP (idem +
« physical AGI »), TUTO (section « Physical AI » entière : DayDreamer,
V-JEPA 2), ROBOT (l'article entier), AGENTIC (« Laws of the physical
world »). C'est **le domaine d'application dominant** du corpus, devant
la conduite autonome (ARCHI, TUTO, ROBOT) et la génération vidéo
(ARCHI, TUTO, ROBOT, ROADMAP).

### 6. Évaluation et benchmarks — 5/7

ARCHI (« Evaluation protocols and benchmarks »), ROADMAP (cité comme
défi ouvert), AGENTIC (section entière, avec le glissement
« from prediction-centric to decision-centric evaluation »), ROBOT
(« Benchmarks, datasets, and results », avec la distinction
open-loop / closed-loop). Récurrence notable : **l'évaluation actuelle
mesure la qualité de prédiction (fidélité visuelle) alors qu'il faudrait
mesurer l'utilité pour la décision** (boucle fermée).

### 7. Modèles de fondation, passage à l'échelle, AGI — 5/7

ARCHI (« Foundation model paradigm »), ROADMAP (« Foundation-scale
interactive simulators », « Outlook: a path to physical AGI »), TUTO
(« Foundation models for physical AI », « Pathways and challenges toward
AGI »), ROBOT (« From video backbones to foundation World Models »),
AGENTIC (« Beyond L3 »).

### 8. Multimodalité et unification — 5/7

ARCHI (« Multimodal fusion », « Language-augmented »), ROADMAP
(« omnimodal World Models », « Towards unified multimodal World Models »),
ROBOT (VLA, « Multi-modal perception bottlenecks »), TUTO (VLM comme
World Models implicites), INJECT (raisonnement, génération, agents dans
un cadre unifié).

### 9. Erreurs cumulées et exploitation du modèle — 4/7

WM18 (« Cheating the World Model »), ARCHI (« Compounding errors and
objective mismatch »), ROADMAP (« Compounding prediction errors »),
AGENTIC (« Failure modes »). **Le talon d'Achille identifié dès 2018 et
toujours non résolu en 2026.**

### 10. Raisonnement contrefactuel et causalité — 4/7

ARCHI (section dédiée : pipeline abduction-action-prédiction,
non-identifiabilité ; et l'application business/finance), ROADMAP
(« Counterfactual reasoning »), ROBOT (« Causal conditioning gaps »),
AGENTIC (révision du modèle par l'évidence, L3).

### 11. Au-delà du monde physique — 3/7

ARCHI (santé, éducation, business/finance, « belief-modeling paradigm »),
ROADMAP (« Extending World Models beyond physical environments »),
AGENTIC (lois des mondes digital, social, scientifique). Thème émergent,
avec des verrous propres : non-stationnarité, réflexivité,
identifiabilité.

### 12. Sim-to-real et transfert — 3/7

WM18 (« Transfer policy to actual environment »), ROADMAP
(« Sim-to-real transfer »), ROBOT/TUTO (implicite via DayDreamer et les
politiques réelles).

### 13. Sécurité et sûreté — 2/7

ROADMAP (« Safety, transparency, and sustainability »), AGENTIC
(« Security and safety of World Models »). Peu couvert, mais présent
dans les deux articles les plus récents.

## Points saillants proposés pour l'exposé

1. **Un champ sans définition consensuelle.** Chaque survey redéfinit le
   World Model et propose sa propre taxonomie (fonctionnelle, par niveaux
   de capacité, explicite/implicite, par architecture). Comparer ces
   taxonomies est un bon fil conducteur.
2. **Le débat central de représentation : générer ou comprendre ?**
   Prédiction pixel (génération vidéo, GAIA, Genie) vs latent
   (Dreamer, MuZero) vs joint-embedding sans génération (JEPA). C'est la
   ligne de fracture technique la plus récurrente.
3. **L'imagination comme mécanisme fondateur.** La filiation directe de
   « learning inside a dream » (2018) vers Dreamer, la
   chain-of-imagination et le World Model comme simulateur
   d'entraînement de politiques.
4. **Le talon d'Achille : erreurs cumulées et exploitation du modèle.**
   Du « Cheating the World Model » de 2018 aux « compounding errors »
   de 2026, le problème traverse tout le corpus sans solution définitive.
5. **La crise de l'évaluation.** Glissement revendiqué d'une évaluation
   centrée prédiction (fidélité visuelle, open-loop) vers une évaluation
   centrée décision (utilité en boucle fermée, cohérence physique).
6. **La robotique et l'IA physique comme domaine roi**, avec la conduite
   autonome et la génération vidéo en soutien — et la convergence vers
   des foundation World Models multimodaux présentée comme voie vers
   une « AGI physique ».
7. **Thèmes émergents encore minoritaires** : raisonnement contrefactuel
   et causalité, extension aux mondes non physiques (social, financier),
   sécurité/sûreté des World Models.
