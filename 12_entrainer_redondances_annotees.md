# Entraîner

<!-- Réorganisation éditoriale : tous les blocs du fichier source sont conservés ; seuls des intertitres de navigation ont été ajoutés. -->

<!-- ============================================================= -->
<!-- ANALYSE CLAUDE — CARTOGRAPHIE DES REDONDANCES (aucune suppression) -->
<!-- ============================================================= -->

## Synthèse — cartographie des redondances du chapitre

<claude>
**Mode d'emploi.** Rien n'a été supprimé dans ce fichier. Les passages redondants sont regroupés visuellement par couleur : tous les passages traitant d'un même thème portent la même balise `<font color="…">`. Pour chacun des 13 thèmes, une **formulation unifiée** est proposée ci-dessous dans une balise `<claude>` : elle est conçue pour remplacer, à terme, l'ensemble des passages de la couleur correspondante (les détails d'expériences pouvant être conservés comme exemples ou encadrés). Deux remarques transversales :

1. Les intertitres en gras répétés (« Apprentissage par renforcement basé sur un modèle en ligne » en §7, « Apprentissage hors ligne par lots » trois fois en §9, « Discussion et défis ouverts » sept fois en §15) sont des artefacts de fusion des sources : n'en conserver qu'un par section.
2. Les environnements `$$ … $$` ont été convertis en `$$ … $$` conformément à la consigne LaTeX ; le contenu mathématique est inchangé.

| Couleur | Thème redondant | Principales occurrences |
|---|---|---|
| `red` (rouge) | Le pipeline fondateur en 3 étapes : représentation (V) → dynamique (M) → contrôleur (C) | §1 (VMC, « Apprendre », « Trois entraînements »), §2 (procédure Car Racing), §3 (fin), §4 (SSL par reconstruction) |
| `green` (vert) | Entraîner l'agent « dans le rêve » : environnement halluciné, rollouts imaginés | §1, §2 (Take Cover/VizDoom), §7 (Dreamer, DayDreamer), §8, §14 |
| `blue` (bleu) | Définition récurrente : modèle interne des dynamiques → trajectoires sans interaction réelle ; distinction model-based / model-free | §1, §3 (×5), §8 |
| `orange` | Efficacité d'échantillonnage ; coût / lenteur / danger de l'interaction réelle | §3, §7, §8, §9, §15 |
| `purple` (violet) | Biais du modèle, erreur cumulative, décalage de distribution, exploitation du modèle | §3, §7, §8, §9, §14 |
| `brown` (marron) | Reconstruction pixel ≠ utilité décisionnelle : *objective mismatch*, équivalence de valeur, JEPA | §4, §5, §7, §8, §9, §13, §15 |
| `teal` (sarcelle) | Découplage tâche / dynamique ; « pré-entraîner puis adapter » ; transfert (V-JEPA 2-AC, constat DreamerV3) | §3, §4, §8, §10, §12, §15 |
| `magenta` | Curiosité, motivation intrinsèque, exploration guidée par l'erreur du modèle | §2, §8 |
| `olive` | La boucle itérative : collecte → modèle → politique → recollecte (Dyna, MBRL en ligne) | §2, §7, §8 |
| `gray` (gris) | Formalisation MDP et objectif du RL (tuple, retour cumulé) | §3, §8 |
| `navy` (marine) | Grand modèle du monde + petit contrôleur ; attribution de crédit ; CMA-ES | §1, §3 |
| `crimson` (cramoisi) | Planification en arrière-plan vs au moment de la décision (MPC/CEM, recherche arborescente, MuZero) | §2, §3, §7, §8, §14 |
| `gold` (or) | L'échelle produit-elle une compréhension physique authentique ? (appariement de motifs vs causalité) | §10, §15 |
</claude>

### Formulations unifiées proposées (une par thème)

<font color="red">**Thème rouge — Le pipeline fondateur en trois étapes (V → M → C)**</font>

<claude>
Entraîner un World Model, c'est presque toujours enchaîner trois apprentissages distincts, illustrés dès le papier fondateur de Ha & Schmidhuber (2018) par le triptyque V–M–C :

1. **Apprendre une représentation** (le modèle V, un VAE en 2018) : compresser chaque observation brute $x_t$ — image, capteurs, tokens — en un vecteur latent compact $z_t$. Cet apprentissage est non supervisé : aucune récompense, aucune étiquette.
2. **Apprendre la dynamique** (le modèle M, un MDN-RNN en 2018) : prédire comment le monde évolue sous l'effet des actions, c'est-à-dire modéliser $P(z_{t+1} \mid a_t, z_t, h_t)$, où $h_t$ est la mémoire du réseau récurrent.
3. **Entraîner le contrôleur / la politique** (le modèle C) : apprendre à agir à partir des représentations produites par V et M — en 2018, un simple contrôleur linéaire $a_t = W_c \, [z_t \; h_t] + b_c$, optimisé par CMA-ES.

Concrètement, la recette de 2018 tient en cinq étapes : collecter environ 10 000 rollouts avec une politique aléatoire ; entraîner V ; entraîner M ; définir C ; optimiser C pour maximiser la récompense cumulée. Une quatrième phase, optionnelle mais spectaculaire, consiste à entraîner C entièrement dans le « rêve » du modèle (voir thème vert). Ce découpage se retrouve, généralisé, dans toutes les architectures récentes : pré-entraînement auto-supervisé de la représentation, apprentissage du modèle de transition, puis *policy learning* dans ou avec le modèle.
</claude>

<font color="green">**Thème vert — Entraîner l'agent « dans le rêve » (rollouts imaginés)**</font>

<claude>
Dès lors que M sait prédire l'observation suivante (et, si on le lui apprend, la fin d'épisode $d_t$), il constitue à lui seul un environnement d'entraînement complet : un simulateur appris. L'agent peut alors s'entraîner entièrement « dans son rêve » : on enveloppe M dans une interface d'environnement standard, la politique est optimisée sur des trajectoires imaginées dans l'espace latent — sans jamais toucher à l'environnement réel — puis elle est transférée telle quelle dans le monde réel. C'est le principe démontré par l'expérience VizDoom *Take Cover* de 2018 (l'agent entraîné dans son hallucination, plus bruitée et plus difficile, survit d'autant mieux dans le vrai jeu), puis industrialisé par la famille Dreamer : les trajectoires latentes imaginées servent à entraîner un acteur-critique par rétropropagation à travers la dynamique apprise, jusqu'aux robots physiques avec DayDreamer.
</claude>

<font color="blue">**Thème bleu — La définition : un modèle interne des dynamiques, et la frontière avec le model-free**</font>

<claude>
Définition à ne donner qu'une seule fois : un World Model apprend une **approximation interne des dynamiques de l'environnement** — transition, observation, récompense — ce qui permet à l'agent de générer et d'évaluer des trajectoires **sans interaction directe avec l'environnement réel**. C'est ce qui le distingue du RL *model-free*, qui apprend directement une politique ou une fonction de valeur à partir des interactions, sans simulateur interne. La frontière n'est toutefois pas absolue : le paysage contemporain forme un continuum, et les agents les plus performants (Dreamer, MBPO, TD-MPC…) sont hybrides. Toutes les conséquences détaillées dans le chapitre découlent de cette unique définition : capacité de planification, efficacité d'échantillonnage, biais du modèle, transfert, raisonnement contrefactuel, gestion de l'incertitude.
</claude>

<font color="orange">**Thème orange — Efficacité d'échantillonnage et coût de l'interaction réelle**</font>

<claude>
L'argument économique central, à énoncer une seule fois : interagir avec le monde réel est coûteux, lent, parfois dangereux, voire éthiquement inacceptable (robotique, conduite autonome, santé, contrôle industriel). Un modèle de dynamique appris permet de réutiliser chaque interaction réelle beaucoup plus intensément — par prédiction, imagination ou planification — d'où une bien meilleure **efficacité d'échantillonnage** : PILCO en est l'exemple classique, PlaNet a montré des gains d'environ $50\times$ par rapport aux méthodes sans modèle, MBPO et Dreamer confirment le constat en contrôle continu et visuel. À l'extrême, on renonce à toute interaction : le modèle est alors entraîné **hors ligne**, sur des jeux de données statiques préalablement collectés.
</claude>

<font color="purple">**Thème violet — Biais du modèle, erreur cumulative, exploitation du modèle**</font>

<claude>
Le revers de la médaille, à centraliser dans une seule sous-section : un modèle appris est imparfait, et un agent qui s'y fie hérite de ses erreurs. Trois mécanismes reviennent partout dans la littérature : (1) l'**erreur cumulative** — en déroulant le modèle sur ses propres prédictions, les imprécisions s'accumulent et la trajectoire imaginée dérive de tout ce qui a été observé à l'entraînement ; (2) le **décalage de distribution** — au déploiement, la politique visite des états jamais vus pendant l'apprentissage du modèle, qui extrapole alors de manière peu fiable ; (3) l'**exploitation du modèle** — le planificateur, consommateur adversarial de son propre modèle, découvre et exploite systématiquement ses erreurs optimistes. Les parades standard : dynamiques probabilistes et planification sensible à l'incertitude (PILCO, PETS, STEVE), rollouts courts (MBPO), replanification fréquente (MPC), pénalités d'incertitude ou arrêt hors support des données (MOPO, MOReL), et dégradation gracieuse déclenchée par le désaccord d'ensemble.
</claude>

<font color="brown">**Thème marron — Prédire fidèlement n'est pas décider utilement (*objective mismatch*)**</font>

<claude>
Une même tension traverse tout le chapitre et mérite un encadré unique : **la précision prédictive ne garantit pas l'utilité décisionnelle**. Un modèle entraîné à reconstruire les pixels gaspille sa capacité sur des détails visuellement saillants mais inutiles à la décision (textures, éclairage, arrière-plan) ; le photoréalisme n'est ni nécessaire ni suffisant pour une compréhension physique contrôlable. Deux réponses de principe s'imposent : l'**équivalence de valeur** — MuZero n'apprend du monde que ce qui sert à prédire récompenses, valeurs et politiques — et la **prédiction dans l'espace des représentations** — JEPA, I-JEPA, V-JEPA prédisent de futures représentations plutôt que des pixels, en écartant délibérément les détails imprévisibles et non pertinents. C'est le basculement de l'auto-supervision « générative » vers l'auto-supervision « prédictive ».
</claude>

<font color="teal">**Thème sarcelle — Découpler la dynamique de la tâche : « pré-entraîner puis adapter »**</font>

<claude>
L'idée-force à ne formuler qu'une fois : un World Model **découple la connaissance des dynamiques de l'objectif de la tâche**. En RL classique, chaque nouvelle tâche impose de redéfinir le MDP et de réapprendre de zéro ; avec un modèle du monde, la dynamique apprise est réutilisable — on change la récompense, l'objectif ou le planificateur sans jeter la connaissance acquise. Cette séparation entre « comprendre comment le monde fonctionne » et « décider quoi faire » débouche naturellement sur la recette « **pré-entraîner puis adapter** » venue du NLP et de la vision : pré-entraînement agnostique à la tâche sur de vastes données non étiquetées — le constat DreamerV3 (les représentations sont façonnées par l'objectif de reconstruction, non par la récompense) en fournit la justification — puis affinage léger ou transfert zero-shot : WPT, SimDist, Open X-Embodiment pour l'inter-incarnations, et V-JEPA 2-AC, qui atteint une planification robotique zero-shot après post-entraînement sur moins de 62 h de vidéo robotique non étiquetée.
</claude>

<font color="magenta">**Thème magenta — Curiosité et récompense intrinsèque**</font>

<claude>
Un modèle du monde offre une réponse de principe au problème de l'exploration : aller chercher l'expérience là où le modèle se trompe. L'erreur (ou l'incertitude) de prédiction est convertie en **récompense intrinsèque** — c'est la curiosité artificielle. Dès 2018 : inverser le signe de la perte de M pousse l'agent vers les régions du monde qu'il maîtrise mal, et les données ainsi collectées améliorent le modèle. Versions modernes : ICM (surprise du modèle direct), RND (nouveauté d'état), VIME (gain d'information espéré) et Plan2Explore, où l'agent utilise son modèle pour « planifier d'être surpris » en ciblant les états où un ensemble de modèles est en désaccord.
</claude>

<font color="olive">**Thème olive — La boucle itérative d'entraînement (Dyna, MBRL en ligne)**</font>

<claude>
La boucle du MBRL en ligne, décrite une seule fois, recouvre à la fois la « procédure itérative » de 2018 et l'architecture Dyna de Sutton (1990) : (1) interagir avec l'environnement réel et enregistrer actions et observations ; (2) mettre à jour le modèle du monde sur ces données ; (3) améliorer la politique à l'aide du modèle (données synthétiques, imagination ou planification) ; (4) recommencer. Une seule itération suffit pour des tâches simples ; les environnements difficiles exigent de boucler, car certaines parties du monde ne deviennent accessibles qu'à un agent déjà compétent.
</claude>

<font color="gray">**Thème gris — Le formalisme MDP et l'objectif du RL**</font>

<claude>
Le formalisme n'a besoin d'être posé qu'une fois : un MDP est un tuple $(\mathcal{S}, \mathcal{A}, P, R, \gamma)$ — états, actions, transition $P(s_{t+1} \mid s_t, a_t)$, récompense, facteur d'actualisation — et l'objectif du RL est de trouver la politique $\pi^*$ qui maximise le retour cumulé espéré $\mathbb{E}\!\left[\sum_{t} \gamma^t r_t\right]$. Le MBRL s'y greffe en apprenant une transition approchée $\widehat{P}_\theta \approx P^\star$ par maximum de vraisemblance sur un tampon de données. La section 8 peut renvoyer à cette définition (posée en section 3) au lieu de la redonner intégralement.
</claude>

<font color="navy">**Thème marine — Grand modèle du monde, petit contrôleur**</font>

<claude>
Argument architectural récurrent, à énoncer une fois : les algorithmes de RL butent sur l'attribution de crédit et peinent à entraîner des millions de poids ; on place donc **la capacité dans le modèle du monde (V et M, entraînés efficacement par rétropropagation sur GPU) et la parcimonie dans le contrôleur C**. Ce petit C (linéaire en 2018) concentre la recherche de politique dans un espace minuscule — ce qui autorise même des optimiseurs non différentiables comme les stratégies d'évolution (CMA-ES) — sans sacrifier l'expressivité, portée par le grand modèle du monde.
</claude>

<font color="crimson">**Thème cramoisi — Planifier en arrière-plan ou au moment de la décision**</font>

<claude>
Deux régimes d'utilisation du modèle, à distinguer une seule fois (Sutton & Barto) : la **planification en arrière-plan** — le modèle génère de l'expérience pour entraîner une politique amortie, qui agit ensuite de façon réactive et instinctive (Dyna, MBPO, Dreamer ; c'est aussi le mode « pilote de F1 » de 2018 : interroger $h_t$ sans dérouler de scénarios hypothétiques) — et la **planification au moment de la décision** — le modèle est interrogé à chaque pas pour simuler des futurs candidats : contrôle prédictif (MPC) avec optimisation de trajectoire de type CEM en continu (PETS, MPPI, TD-MPC), recherche arborescente de Monte-Carlo en discret (MuZero, EfficientZero). La première paie le calcul à l'entraînement ; la seconde le paie à l'inférence mais s'adapte instantanément à de nouveaux objectifs. Les deux se combinent (MuZero propose avec sa politique et affine par la recherche), en écho à la distinction Système 1 / Système 2.
</claude>

<font color="gold">**Thème or — L'échelle suffit-elle à comprendre la physique ?**</font>

<claude>
Question ouverte récurrente, à poser une seule fois : l'échelle produit-elle une compréhension physique authentique ? Sora et Cosmos montrent que plus de données et de paramètres améliorent la qualité de génération, mais les analyses contrôlées (Kang et al.) suggèrent une généralisation au cas par cas — un appariement de motifs sophistiqué, corrélationnel plutôt que causal — et non un raisonnement physique abstrait. D'où le besoin de protocoles d'évaluation capables de distinguer la régularité statistique de la compréhension causale.
</claude>

<!-- ============================================================= -->
<!-- FIN DE LA SYNTHÈSE — DÉBUT DU CHAPITRE ORIGINAL (INTÉGRAL, BALISÉ) -->
<!-- ============================================================= -->

## 1. Vue d’ensemble : qu’entraîne-t-on exactement ?

<!-- source: intro/histoire · intro_histoire.md#71 -->

Dans de nombreux problèmes d'apprentissage par renforcement (RL) (Kaelbling et al., 1996; Sutton & Barto, 1998; Wiering & van Otterlo, 2012), un agent artificiel bénéficie également d'une bonne représentation des états passés et présents, ainsi que d'un bon modèle prédictif du futur (Werbos, 1987; Silver, 2017), idéalement un puissant modèle prédictif implémenté sur un ordinateur général comme un réseau de neurones récurrent (RNN) (Schmidhuber, 1990a; b; 1991a).

<!-- source: définition · definition.md#26 -->

### VMC

<!-- source: définition · definition.md#27 -->

<font color="red">Nous présentons un modèle simple inspiré de notre propre système cognitif. Dans ce modèle, notre agent possède une composante sensorielle visuelle qui compresse ce qu'il perçoit en un code représentatif compact. Il dispose également d'une composante de mémoire qui formule des prédictions sur les codes futurs en se basant sur des informations historiques. Enfin, notre agent intègre une composante de prise de décision qui détermine les actions à entreprendre en s'appuyant exclusivement sur les représentations élaborées par ses modules de vision et de mémoire.</font>

<!-- source: définition · definition.md#28 -->

![VMC](/home/christelle/Freelance/mon_livre/World_Models/figures/VMC.png)

<!-- source: définition · definition.md#46 -->

### Regroupement VMC

<!-- source: définition · definition.md#47 -->

Le diagramme de flux suivant illustre comment V, M et C interagissent avec l'environnement :

<!-- source: définition · definition.md#48 -->

![VMC diagram](/home/christelle/Freelance/mon_livre/World_Models/figures/VMC_diagram.png)

<!-- source: définition · definition.md#49 -->

Fig. 8. Diagramme de flux de notre modèle d'agent. L'observation brute est d'abord traitée par $V$ à chaque pas de temps $t$ pour produire $z_t$. L'entrée dans $C$ est ce vecteur latent $z_t$ concaténé avec l'état caché de $M$, $h_t$, à chaque étape. $C$ produit alors un vecteur d'action $a_t$ pour le contrôle moteur, qui affecte l'environnement. $M$ prend ensuite le $z_t$ actuel et l'action $a_t$ comme entrées pour mettre à jour son propre état caché afin de produire $h_{t+1}$ à utiliser à l'étape $t+1$. Ce modèle agent est utilisé dans l'environnement OpenAI Gym \cite{brockman2016openai}

<!-- source: définition · definition.md#50 -->

<font color="navy">Cette conception minimale pour $C$ offre également des avantages pratiques importants. Les avancées en apprentissage profond nous ont fourni les outils pour entraîner des modèles larges et complexes efficacement, à condition que nous puissions définir une fonction de perte bien comportée et différentiable. Nos modèles $V$ et $M$ sont conçus pour être entraînés efficacement avec l'algorithme de rétropropagation en utilisant des accélérateurs GPU modernes, de sorte que nous souhaitons que la majorité de la complexité et des paramètres du modèle résident dans $V$ et $M$. Le nombre de paramètres de $C$, un modèle linéaire, est minimal en comparaison. Ce choix nous permet d'explorer des manières plus non conventionnelles d'entraîner $C$ — par exemple, en utilisant des stratégies d'évolution (ES) (Rechenberg, 1973; Schwefel, 1977) \cite{rechenberg1973evolutionsstrategie, schwefel1977numerical} pour aborder des tâches de renforcement (RL) plus difficiles où le problème du crédit d'attribution est complexe.</font>

<!-- source: définition · definition.md#51 -->

<font color="navy">Pour optimiser les paramètres de $C$, nous avons choisi la Stratégie d'Évolution par Adaptation de la Matrice de Covariance (CMA-ES) (Hansen, 2016; Hansen & Ostermeier, 2001) \cite{hansen2016cma, hansen2001completely} comme algorithme d'optimisation, car il est reconnu pour bien fonctionner dans des espaces de solutions comportant plusieurs milliers de paramètres. Nous faisons évoluer les paramètres de $C$ sur un seul ordinateur doté de plusieurs cœurs de processeur (CPU) exécutant plusieurs rollouts de l'environnement en parallèle.</font>

<!-- source: définition · definition.md#52 -->

Pour plus de détails sur les modèles, les procédures d'entraînement et les environnements utilisés dans nos expériences, veuillez vous référer à la section Annexe (voir réseau Autoencodeur variational - ConvVAE, MDN-RNN).

<!-- source: entrainement · entrainement.md#0 -->

# Apprendre

<!-- source: entrainement · entrainement.md#1 -->

<font color="red">

- 1 **apprendre une représentation** du monde ;
- 2 **apprendre la dynamique** : comment cette représentation évolue sous action ;
- 3 **entraîner une policy / un contrôleur** à partir de ce modèle ;
- 4 parfois **entraîner l’agent dans le modèle lui-même**, c’est-à-dire dans des rollouts imaginés.

</font>

<!-- source: entrainement · entrainement.md#3 -->

<font color="red">Le papier fondateur 2018 le dit très clairement : le World Model est entraîné de manière non supervisée pour apprendre une représentation spatiale et temporelle compressée ; ensuite on utilise ses features pour entraîner une policy compacte ;</font> <font color="green">et l’agent peut même être entraîné entièrement dans son propre “rêve” halluciné avant transfert dans l’environnement réel.</font>

<!-- source: entrainement · entrainement.md#4 -->

<font color="red">Dans Ha & Schmidhuber, on collecte d’abord des rollouts aléatoires, on entraîne le VAE à encoder les images, puis on entraîne le MDN-RNN à modéliser :</font>

<!-- source: entrainement · entrainement.md#5 -->

$P(z_t+1​∣a_t​,z_t​,h_t​)$

<!-- source: entrainement · entrainement.md#6 -->

<claude>Correction LaTeX suggérée pour la formule ci-dessus : $P(z_{t+1} \mid a_t, z_t, h_t)$ — la version actuelle contient des caractères Unicode parasites et un indice mal placé.</claude>

<font color="red">Autrement dit : le modèle apprend d’abord à transformer les observations en états latents, puis apprend comment ces états latents changent dans le temps sous l’effet des actions.</font>

<!-- source: entrainement · entrainement.md#7 -->

<font color="blue">Le tutorial 2026 confirme aussi cette logique : les World Models apprennent une approximation interne des dynamiques de l’environnement, ce qui permet ensuite de générer des trajectoires sans interaction directe avec l’environnement réel.</font>

<!-- source: entrainement · entrainement.md#8 -->

<font color="red">Trois entrainements différents</font>

<!-- source: entrainement · entrainement.md#9 -->

### <font color="red">1. Entraîner le modèle de représentation</font>

<!-- source: entrainement · entrainement.md#10 -->

<font color="red">L’agent apprend à compresser les observations : images, vidéos, états, capteurs, tokens, etc.</font>

<!-- source: entrainement · entrainement.md#11 -->

<font color="red">Dans le papier fondateur de 2018 \cite{ha2018world}, c’est le rôle du VAE : apprendre une représentation latente z.</font>

<!-- source: entrainement · entrainement.md#12 -->

### <font color="red">2. Entraîner le modèle de dynamique</font>

<!-- source: entrainement · entrainement.md#13 -->

<font color="red">L’agent apprend comment le monde évolue :</font>

<!-- source: entrainement · entrainement.md#14 -->

z_t​,a_t​,h_t​→z_t+1​

<!-- source: entrainement · entrainement.md#15 -->

<claude>Écriture mathématique suggérée pour la ligne ci-dessus : $(z_t, a_t, h_t) \to z_{t+1}$.</claude>

<font color="red">C’est le rôle du MDN-RNN dans 2018, ou plus généralement du dynamics model / transition predictor dans les architectures récentes.</font> <font color="blue">Le survey large rappelle que les World Models apprennent une structure prédictive — transition, observation, récompense — pour pouvoir imaginer ou évaluer des trajectoires futures.</font>

<!-- source: entrainement · entrainement.md#16 -->

### <font color="red">3. Entraîner la policy dans ou avec le World Model</font>

<!-- source: entrainement · entrainement.md#17 -->

<font color="red">C’est l’étape souvent oubliée : le World Model ne sert pas seulement à prédire, il sert à **entraîner l’action**.</font>

<!-- source: entrainement · entrainement.md#18 -->

<font color="green">Dans 2018, le contrôleur est entraîné à partir des représentations produites par le World Model, et peut même être entraîné dans un environnement halluciné.</font>

<!-- source: entrainement · entrainement.md#19 -->

<font color="red">Dans les approches plus modernes, le survey robotique montre que les World Models servent au **policy learning**, à la simulation, à l’évaluation et à la génération de données ; ils deviennent donc un élément du pipeline d’entraînement des politiques robotiques.</font>

<!-- source: entrainement · entrainement.md#20 -->

### <font color="red">L'entrainement est présent à plusieurs étapes:</font>

<!-- source: entrainement · entrainement.md#21 -->

<font color="red">

- 2. Représenter → pretraining auto-supervisé / génératif
- 3. Prédire/Simuler → apprentissage de la dynamique (MBRL, offline)
- 4. Planifier/Agir → policy learning *dans* le modèle, imitation
- 7. Réviser → apprentissage continu / adaptation

</font>

## 2. Exemple fondateur : entraîner V, M puis C dans *World Models* 2018

<!-- ===== AJOUT depuis WM 2018 (sections 3+) — À TRADUIRE ===== -->

<!-- source: WM 2018 | Car Racing Experiment -->

Dans cette section, nous décrivons comment nous pouvons entraîner le modèle d'Agent décrit précédemment à résoudre une tâche de course automobile. À notre connaissance, notre agent est la première solution connue à atteindre le score requis pour résoudre cette tâche.\footnote{Nous trouvons cette tâche intéressante car, bien qu'il ne soit pas difficile d'entraîner un agent à osciller sur des pistes générées aléatoirement et à obtenir un score médiocre, \texttt{CarRacing-v0} définit la \textit{résolution} comme l'obtention d'une récompense moyenne de 900 sur 100 essais consécutifs, ce qui signifie que l'agent ne peut se permettre que très peu d'erreurs de conduite.}

<!-- source: WM 2018 | Car Racing Experiment › Procedure -->

<font color="red">Pour résumer l'expérience de Car Racing, voici les étapes suivies :

<!-- source: WM 2018 | Car Racing Experiment › Procedure -->

\begin{enumerate}
  \item Collecter 10 000 déploiements à partir d'une politique aléatoire.
  \item  Entraîner le VAE (V) à encoder les images en $z \in \mathcal{R}^{32}$.
  \item  Entraîner le MDN-RNN (M) à modéliser $P(z_{t+1} \; | \; a_t, z_t, h_t)$.
  \item  Définir le Contrôleur (C) comme $a_t = W_c \; [z_t \; h_t]\; + \; b_c$.
  \item  Utiliser CMA-ES pour résoudre un $W_c$ et un $b_c$ qui maximisent la récompense cumulée espérée.
\end{enumerate}

</font>

<!-- source: WM 2018 | Car Racing Experiment › Experiment Results -->

\medskip
\textit{Modèle V seul}

<!-- source: WM 2018 | Car Racing Experiment › Experiment Results -->

Entraîner un agent à conduire n'est pas une tâche difficile si nous disposons d'une bonne représentation de l'observation. Des travaux antérieurs~\cite{browser_car,mar_io_kart,keras_car} ont montré qu'avec un bon ensemble d'informations conçues à la main sur l'observation, telles que les informations LIDAR, les angles, positions et vitesses, on peut facilement entraîner un petit réseau à propagation avant à prendre cette entrée conçue à la main et à produire une politique de navigation satisfaisante. Pour cette raison, nous voulons d'abord tester notre agent en handicapant C pour qu'il n'ait accès qu'à V mais pas à M, définissant donc notre contrôleur comme $a_t = W_c \; z_t \;+ \; b_c$.

<!-- source: WM 2018 | Car Racing Experiment › Experiment Results -->

Bien que l'agent soit encore capable de naviguer sur le circuit dans ce cadre, nous observons qu'il oscille et manque la piste dans les virages plus serrés. Cet agent handicapé a atteint un score moyen de 632 $\pm$ 251 sur 100 essais aléatoires, en ligne avec la performance d'autres agents sur le classement d'OpenAI Gym~\cite{carracing_v0} et des méthodes de RL profond traditionnelles telles que A3C~\cite{carracing_cs221,carracing_cs234}. L'ajout d'une couche cachée au réseau de politique de C aide à améliorer les résultats à 788 $\pm$ 141, mais cela ne suffit pas tout à fait à résoudre cet environnement.

<!-- source: WM 2018 | Car Racing Experiment › Experiment Results -->

\medskip

<!-- source: WM 2018 | Car Racing Experiment › Experiment Results -->

\textit{Modèle du monde complet (V et M)}

<!-- source: WM 2018 | Car Racing Experiment › Experiment Results -->

La représentation $z_t$ fournie par notre modèle V ne capture qu'une représentation à un instant donné et n'a pas beaucoup de pouvoir prédictif. En revanche, M est entraîné à faire une seule chose, et à la faire vraiment bien, à savoir prédire $z_{t+1}$. Comme la prédiction de $z_{t+1}$ par M est produite à partir de l'état caché $h_t$ du RNN à l'instant $t$, ce vecteur est un bon candidat pour l'ensemble des caractéristiques apprises que nous pouvons donner à notre agent. Combiner $z_t$ avec $h_t$ donne à notre contrôleur C une bonne représentation à la fois de l'observation actuelle et de ce à quoi s'attendre dans le futur.

<!-- source: WM 2018 | Car Racing Experiment › Experiment Results -->

Nous constatons que permettre à l'agent d'accéder à la fois à $z_t$ et à $h_t$ améliore grandement sa capacité de conduite. La conduite est plus stable, et l'agent semble capable d'attaquer efficacement les virages serrés. <font color="crimson">Par ailleurs, nous observons que, pour prendre ces décisions de conduite réflexes et rapides lors d'une course, l'agent n'a pas besoin de \textit{planifier à l'avance} et de dérouler des scénarios hypothétiques du futur. Puisque $h_t$ contient des informations sur la distribution de probabilité du futur, l'agent peut simplement interroger le RNN de manière instinctive pour guider ses décisions d'action. Tel un pilote de Formule 1 chevronné ou le joueur de baseball évoqué précédemment, l'agent peut prédire instinctivement quand et où naviguer dans le feu de l'action.</font>

<!-- source: WM 2018 | Car Racing Experiment › Experiment Results -->

Notre agent parvient à atteindre un score de 906 $\pm$ 21 sur 100 essais aléatoires, résolvant effectivement la tâche et obtenant de nouveaux résultats à l'état de l'art. Les tentatives antérieures~\cite{carracing_cs221,carracing_cs234} utilisant des méthodes de RL profond ont obtenu des scores moyens dans la plage 591-652, et la meilleure solution rapportée sur le classement a obtenu un score moyen de 838 $\pm$ 11 sur 100 essais aléatoires. Les méthodes de RL profond traditionnelles requièrent souvent un prétraitement de chaque image, comme l'emploi de la détection de contours~\cite{carracing_cs234}, en plus de l'empilement de quelques images récentes~\cite{carracing_cs221,carracing_cs234} dans l'entrée. En revanche, notre modèle du monde prend en entrée un flux d'images RGB brutes en pixels et apprend directement une représentation spatio-temporelle. À notre connaissance, notre méthode est la première solution rapportée à résoudre cette tâche.

<!-- source: WM 2018 | Car Racing Experiment › Procedure -->

<font color="green">La configuration de notre expérience VizDoom est largement la même que la tâche Car Racing, à quelques différences clés près. Dans la tâche Car Racing, M est entraîné uniquement à modéliser le $z_{t}$ suivant. Puisque nous voulons construire un modèle du monde dans lequel entraîner notre agent, notre modèle M ici prédira également si l'agent meurt à l'image suivante (comme un événement binaire $done_t$, ou $d_t$ en abrégé), en plus de l'image suivante $z_t$.</font>

<!-- source: WM 2018 | Car Racing Experiment › Procedure -->

<font color="green">Puisque le modèle M peut prédire l'état $done$ en plus de l'observation suivante, nous disposons désormais de tous les ingrédients nécessaires pour constituer un environnement de RL complet. Nous construisons d'abord une interface d'environnement OpenAI Gym en enveloppant M dans une interface \texttt{gym.Env}, comme s'il s'agissait d'un véritable environnement Gym, puis nous entraînons notre agent au sein de cet environnement \textit{virtuel} plutôt que d'utiliser l'environnement réel.</font>

<!-- source: WM 2018 | Car Racing Experiment › Procedure -->

<font color="green">Dans cette simulation, nous n'avons pas besoin que le modèle V encode de véritables images en pixels durant le processus d'hallucination, de sorte que notre agent s'entraînera donc entièrement dans un environnement en espace latent. Cela présente de nombreux avantages, comme nous le verrons.</font>

<!-- source: WM 2018 | Car Racing Experiment › Procedure -->

<font color="green">Cet environnement virtuel possède une interface identique à celle de l'environnement réel, de sorte qu'une fois que l'agent a appris une politique satisfaisante dans l'environnement virtuel, nous pouvons facilement redéployer cette politique dans l'environnement réel pour voir dans quelle mesure la politique se transfère.</font>

<!-- source: WM 2018 | Car Racing Experiment › Procedure -->

<font color="green">Pour résumer l'expérience \textit{Take Cover}, voici les étapes suivies :

<!-- source: WM 2018 | Car Racing Experiment › Procedure -->

\begin{enumerate}
  \item Collecter 10 000 déploiements à partir d'une politique aléatoire.
  \item Entraîner le VAE (V) à encoder chaque image en un vecteur latent $z \in \mathcal{R}^{64}$, et utiliser V pour convertir les images collectées à l'étape (1) en représentation d'espace latent.
  \item  Entraîner le MDN-RNN (M) à modéliser \\ $P(z_{t+1}, d_{t+1} \; | \; a_t, z_t, h_t)$.
  \item  Définir le Contrôleur (C) comme $a_t = W_c \; [z_t \; h_t]$.
  \item  Utiliser CMA-ES pour résoudre un $W_c$ qui maximise le temps de survie espéré au sein de l'environnement virtuel.
  \item Utiliser la politique apprise à l'étape (5) sur l'environnement réel.
\end{enumerate}

</font>

<!-- source: WM 2018 | Car Racing Experiment › Transfer Policy to Actual Environment -->

<font color="green">Nous avons pris l'agent entraîné dans l'environnement virtuel et testé sa performance sur le scénario VizDoom original. Le score sur 100 essais consécutifs aléatoires est d'environ 1100 pas de temps, bien au-delà du score requis de 750 pas de temps, et également bien supérieur au score obtenu dans l'environnement virtuel, plus difficile.</font>

<!-- source: WM 2018 | Car Racing Experiment › Transfer Policy to Actual Environment -->

<font color="green">Nous constatons que même si le modèle V n'est pas capable de capturer correctement tous les détails de chaque image, par exemple d'obtenir le bon nombre de monstres, l'agent est tout de même capable d'utiliser la politique apprise pour naviguer dans l'environnement réel. Comme l'environnement virtuel n'est même pas en mesure de suivre le nombre exact de monstres au départ, un agent capable de survivre dans l'environnement cauchemardesque virtuel, plus bruyant et incertain, prospérera dans l'environnement original, plus propre.</font>

<!-- source: WM 2018 | Iterative Training Procedure -->

<font color="olive">Dans nos expériences, les tâches sont relativement simples, de sorte qu'un modèle du monde raisonnable peut être entraîné à l'aide d'un jeu de données collecté à partir d'une politique aléatoire. Mais qu'en est-il si nos environnements deviennent plus sophistiqués ? Dans tout environnement difficile, seules certaines parties du monde sont rendues disponibles à l'agent, et seulement une fois qu'il a appris à naviguer stratégiquement à travers son monde.</font>

<!-- source: WM 2018 | Iterative Training Procedure -->

<font color="olive">Pour des tâches plus compliquées, une procédure d'entraînement itérative est requise. Nous avons besoin que notre agent soit capable d'explorer son monde et de collecter constamment de nouvelles observations, afin que son modèle du monde puisse être amélioré et affiné au fil du temps. Une procédure d'entraînement itérative~\cite{learning_to_think} se présente comme suit :

<!-- source: WM 2018 | Iterative Training Procedure -->

\begin{enumerate}
  \item Initialiser M, C avec des paramètres de modèle aléatoires.
  \item Déployer $N$ fois dans l'environnement réel. Enregistrer toutes les actions $a_t$ et observations $x_t$ durant les déploiements en mémoire.
  \item Entraîner M à modéliser $P(x_{t+1}, r_{t+1}, a_{t+1}, d_{t+1} | x_t, a_t, h_t)$ et entraîner C à optimiser les récompenses espérées au sein de M.
  \item Retourner à (2) si la tâche n'est pas terminée.
\end{enumerate}

</font>

<!-- source: WM 2018 | Iterative Training Procedure -->

<font color="olive">Nous avons montré qu'une itération de cette boucle d'entraînement suffisait à résoudre des tâches simples. Pour des tâches plus difficiles, nous avons besoin que notre contrôleur, à l'étape 2, explore activement les parties de l'environnement bénéfiques pour améliorer son modèle du monde.</font> <font color="magenta">Une direction de recherche passionnante consiste à examiner des moyens d'incorporer la curiosité artificielle et la motivation intrinsèque~\cite{schmidhuber_creativity,s07_intrinsic,s08_curiousity,pathak2017,intrinsic_motivation}, ainsi que des capacités de recherche d'information~\cite{SchmidhuberStorck:94,Gottlieb2013}, chez un agent afin d'encourager une exploration nouvelle~\cite{Lehman2011}. En particulier, nous pouvons augmenter la fonction de récompense en nous fondant sur l'amélioration de la qualité de compression~\cite{schmidhuber_creativity,s07_intrinsic,s08_curiousity,learning_to_think}.</font>

<!-- source: WM 2018 | Iterative Training Procedure -->

<font color="magenta">Dans l'approche présente, puisque M est un MDN-RNN qui modélise une distribution de probabilité pour l'image suivante, s'il fait un mauvais travail, cela signifie que l'agent a rencontré des parties du monde qui ne lui sont pas familières. Nous pouvons donc adapter et réutiliser la fonction de perte d'entraînement de M pour encourager la curiosité. En inversant le signe de la fonction de perte de M dans l'environnement réel, l'agent sera encouragé à explorer les parties du monde qui ne lui sont pas familières. Les nouvelles données qu'il collecte peuvent améliorer le modèle du monde.</font>

<!-- source: WM 2018 | Iterative Training Procedure -->

La procédure d'entraînement itérative exige que le modèle M prédise non seulement l'observation suivante $x$ et $done$, mais aussi l'action et la récompense pour le pas de temps suivant. Cela peut être requis pour des tâches plus difficiles. Par exemple, si notre agent doit apprendre des compétences motrices complexes pour se déplacer dans son environnement, le modèle du monde apprendra à imiter son propre modèle C qui a déjà appris à marcher. Une fois que des compétences motrices difficiles, telles que la marche, sont absorbées dans un grand modèle du monde disposant d'une large capacité, le modèle C, plus petit, peut s'appuyer sur les compétences motrices déjà absorbées par le modèle du monde et se concentrer sur l'apprentissage de compétences de plus haut niveau pour se diriger lui-même en utilisant les compétences motrices qu'il a déjà apprises.

<!-- source: WM 2018 | Iterative Training Procedure -->

Un lien intéressant avec la littérature en neurosciences est le travail sur le rejeu hippocampique, qui examine comment le cerveau rejoue des expériences récentes lorsqu'un animal se repose ou dort. Le rejeu d'expériences récentes joue un rôle important dans la consolidation de la mémoire~\cite{Foster2017} -- où les souvenirs dépendants de l'hippocampe deviennent indépendants de celui-ci au fil du temps. Comme le formule \cite{Foster2017}, le rejeu ressemble \textit{moins à du rêve et davantage à de la pensée}. Nous invitons les lecteurs à lire \textit{Replay Comes of Age}~\cite{Foster2017} pour un aperçu détaillé du rejeu du point de vue des neurosciences, avec des connexions à l'apprentissage par renforcement théorique.

<!-- source: WM 2018 | Iterative Training Procedure -->

L'entraînement itératif pourrait permettre au modèle C--M de développer une manière hiérarchique naturelle d'apprendre. Des travaux récents sur le self-play en RL~\cite{asymmetric_self_play,competitive_self_play,continuous_adaptation_via_meta_learning} et sur PowerPlay~\cite{s10_powerplay,s11_powerplay} explorent également des méthodes qui conduisent à un apprentissage par curriculum naturel~\cite{s09_optimal_order}, et nous estimons qu'il s'agit là de l'un des domaines de recherche les plus passionnants de l'apprentissage par renforcement.

## 3. Cadre RL : trajectoires, MDP et distinction avec le model-free RL

<!-- source: entrainement · entrainement.md#38 -->

### Apprentissage par renforcement et prise de décision séquentielle

<!-- source: entrainement · entrainement.md#39 -->

<font color="gray">L'RL formalise les problèmes de décision séquentielle en utilisant le cadre du processus de décision de Markov (MDP) [39] \cite{sutton2018reinforcement}. Un MDP fournit une description mathématique de la manière dont un agent interagit avec un environnement au fil du temps et de la manière dont ses actions influencent les états futurs et les récompenses. Cette formulation sert de cadre fondamental pour définir et étudier les modèles du monde.</font>

<!-- source: entrainement · entrainement.md#40 -->

<font color="gray">Un MDP est défini par un tuple $(S, A, P, R, \gamma)$ où $S$ désigne l'espace d'état, $A$ l'espace d'action, $P(s_{t+1} | s_t, a_t)$ la fonction de transition, $R(s_t, a_t, s_{t+1})$ la fonction de récompense, et $\gamma \in [0, 1]$ le facteur de dégressivité. À chaque pas de temps $t$, l'agent observe un état $s_t \in S$, sélectionne une action $a_t \in A$ selon une politique $\pi(a_t | s_t)$, et l'environnement passe à un nouvel état $s_{t+1}$ en émettant une récompense $r_t$. La figure 3(a) illustre ce processus. La transition d'état est gouvernée par les dynamiques de l'environnement, qui définissent la distribution de probabilité $p(s_{t+1} | s_t, a_t)$.</font>

<!-- source: entrainement · entrainement.md#41 -->

![MDP vs WM](/home/christelle/Freelance/mon_livre/World_Models/figures/MDP_vs_WM.png)

<!-- source: entrainement · entrainement.md#42 -->

La figure est une comparaison entre (a) un MDP standard, dans lequel l'agent interagit directement avec l'environnement externe, et (b) un agent équipé d'un modèle du monde, où les dynamiques de l'environnement sont partiellement internalisées par des composants appris $(E, H, F, D)$, permettant une simulation interne et des lancements imaginés.

<!-- source: entrainement · entrainement.md#43 -->

Un concept clé en RL est la trajectoire, qui représente une séquence d'interactions entre l'agent et l'environnement : $\tau = (s_0, a_0, r_0, s_1, a_1, r_1, \dots, a_{T-1}, r_{T-1}, s_T)$. Une trajectoire est générée par échantillonnage répété des actions de la politique et des états des dynamiques de l'environnement jusqu'à ce qu'un état terminal soit atteint.

<!-- source: entrainement · entrainement.md#44 -->

Partant d'un état initial samplé de l'environnement, l'agent alterne entre sélectionner des actions en utilisant la politique actuelle et recevoir des transitions d'état.

<!-- source: entrainement · entrainement.md#45 -->

<font color="gray">L'objectif de l'apprentissage par renforcement est de trouver une politique optimale $\pi_\theta^*$ qui maximise la récompense cumulative sur les trajectoires. La récompense cumulative attendue est généralement exprimée comme $\mathbb{E}_{\tau \sim \pi_\theta} \left[ \sum_{t=0}^{T-1} \gamma^t r_t \right]$ où $T$ représente la longueur de la trajectoire. L'agent génère de manière répétée des trajectoires en utilisant la politique actuelle, évalue les performances en utilisant les données collectées, et met à jour les paramètres de la politique en conséquence.</font>

<!-- source: entrainement · entrainement.md#46 -->

<font color="blue">Les modèles du monde apprenent une approximation interne des dynamiques de l'environnement et permettent aux agents de générer des trajectoires sans interaction directe avec l'environnement réel.</font>

<!-- source: entrainement · entrainement.md#47 -->

<font color="teal">Bien que le processus de génération de trajectoires soit général, sa plus grande limitation est que le processus d'apprentissage est intrinsèquement lié à une tâche spécifique. Lorsqu'une nouvelle tâche est introduite, l'MDP doit être redéfini avec une nouvelle fonction de récompense et potentiellement un nouvel espace d'état ou d'action, et la politique doit être apprise à nouveau à partir de zéro. Les connaissances acquises à partir des tâches précédentes ne sont pas explicitement préservées ou réutilisées, ce qui rend difficile le soutien à l'adaptation flexible, au transfert ou à la généralisation compositionnelle. Dans ce contexte, l'apprentissage par renforcement basé uniquement sur l'interaction n'est pas suffisant pour la notion d'intelligence générale, dans laquelle les agents sont attendus de s'appuyer sur la connaissance préalable pour gérer efficacement des tâches nouvelles.</font> <font color="orange">En outre, l'apprentissage par renforcement pour la politique optimale seul repose sur des interactions répétées avec l'environnement réel pour accumuler de l'expérience. Cette dépendance impacte directement l'efficacité des données, car de nombreuses trajectoires peuvent être nécessaires avant d'atteindre une amélioration significative. Dans de nombreux contextes pratiques — tels que la robotique ou la conduite autonome — l'interaction avec le monde réel peut être coûteuse, lente ou dangereuse, limitant davantage l'applicabilité de l'apprentissage purement guidé par l'interaction.</font>

<!-- source: entrainement · entrainement.md#48 -->

<font color="teal">Les modèles du monde adressent ces limitations en découplant la représentation des dynamiques de l'environnement des objectifs spécifiques à la tâche. Au lieu d'apprendre le comportement uniquement par l'interaction guidée par les récompenses, un agent apprend d'abord un modèle prédictif de la manière dont l'environnement évolue en réponse aux actions. Une fois acquis, ce modèle peut être réutilisé pour différentes tâches en redéfinissant les objectifs ou les fonctions de récompense sans réapprendre les dynamiques sous-jacentes à partir de zéro. Dans ce sens, les modèles du monde permettent une forme d'accumulation de connaissances dans laquelle l'expérience des interactions passées contribue à l'apprentissage et à l'adaptation futurs. Cette séparation entre apprendre comment le monde fonctionne et décider de quoi faire est une étape clé vers une intelligence plus générale et flexible.</font>

<!-- source: entrainement · entrainement.md#50 -->

Idéalement, nous aimerions être capables d'entraîner efficacement de grands agents basés sur des RNN. L'algorithme de rétropropagation (Linnainmaa, 1970; Kelley, 1960; Werbos, 1982) peut être utilisé pour entraîner efficacement de grands réseaux de neurones. <font color="navy">Dans ce travail, nous examinons l'entraînement d'un grand réseau de neurones pour aborder des tâches de RL, en divisant l'agent en un grand modèle du monde et un petit modèle contrôleur.</font> <font color="red">Nous entraînons d'abord un grand réseau de neurones pour apprendre un modèle du monde de l'agent de manière non supervisée, puis nous entraînons le plus petit modèle contrôleur pour apprendre à réaliser une tâche en utilisant ce modèle du monde.</font> <font color="navy">Un petit contrôleur permet à l'algorithme d'entraînement de se concentrer sur le problème d'attribution de crédit dans un petit espace de recherche, sans sacrifier la capacité et l'expressivité via le plus grand modèle du monde. En entraînant l'agent à travers le prisme de son modèle du monde, nous montrons que celui-ci peut apprendre une politique très compacte pour réaliser cette tâche.</font>

<!-- source: entrainement · entrainement.md#51 -->

![POMDP graph](/home/christelle/Freelance/mon_livre/World_Models/figures/POMDP_graph.png)

<!-- source: entrainement · entrainement.md#52 -->

Fig. 7. Modèle graphique unifié POMDP de L1–L3. Les cercles pointillés indiquent les états cachés de l'environnement $x$ ; les cercles doubles indiquent les états latents appris $z$ ; les cercles ombragés indiquent les observations $o$ ; les carrés indiquent les actions $a$. Les flèches pleines bleues indiquent le modèle appris (inférence $q_\phi$ et dynamique $p_\theta$) ; les flèches pointillées grises indiquent la transition environnementale $T$ et l'émission d'observation. Le bloc supérieur montre le POMDP de l'agent sous l'environnement actuel $E \sim X$ avec le modèle $M_t$ ; le bloc inférieur montre la même structure sous un environnement révisé $E' \sim X'$ avec le modèle $M_{t+1}$, obtenu via la flèche rouge de réflexion. Les boîtes pointillées colorées marquent le périmètre de chaque niveau : $L1$ couvre la transition latente à un seul pas $p_\theta(z_t \mid z_{t-1}, a_{t-1})$ ; $L2$ couvre la mise en œuvre complète de la trajectoire $\hat{p}(\tau \mid z_0, a_{1:H}, c)$ sous un modèle fixe ; $L3$ couvre la révision du modèle guidée par des preuves $M_t \to M_{t+1}$, qui correspond à passer de $X$ à un environnement révisé $X'$ quand le modèle actuel échoue systématiquement. []()

<!-- source: entrainement · entrainement.md#53 -->

### Distinctions fondamentales entre modèles du monde et apprentissage par renforcement sans modele (model-free RL)

<!-- source: entrainement · entrainement.md#54 -->

<font color="blue">Une distinction fondamentale en apprentissage par renforcement réside dans le fait que l'agent apprend un modèle explicite des dynamiques de l'environnement ou apprend directement le comportement à partir d'interactions guidées par les récompenses. Cette division sépare les approches fondées sur les modèles du monde de l'apprentissage par renforcement sans modèle (*model-free RL*), ce qui engendre des conséquences majeures pour la planification, l'efficacité d'échantillonnage, le transfert, la gestion de l'incertitude et l'interprétabilité [33, 41] \cite{ha2018world, moerland2023modelbased}.</font>

<!-- source: entrainement · entrainement.md#55 -->

<font color="blue">Au niveau le plus fondamental, les deux paradigmes diffèrent par ce qui est effectivement appris. Les méthodes fondées sur les modèles du monde apprennent une structure prédictive — par exemple, les dynamiques de transition, d'observation et de récompense, que ce soit dans l'espace d'observation ou dans un espace d'états latents —, ce qui permet d'imaginer ou d'évaluer en interne les trajectoires futures [31, 32, 33] \cite{hafner2019dream, hafner2020dream, ha2018world}. En revanche, l'apprentissage par renforcement sans modèle apprend généralement une politique, une fonction de valeur ou les deux directement à partir des données d'interaction, sans nécessiter de modèle prédictif explicite de l'environnement [42–44] \cite{mnih2015humanlevel, schulman2017proximal, haarnoja2018soft}. En ce sens, les modèles du monde privilégient l'apprentissage de l'évolution de l'environnement, tandis que les méthodes sans modèle se concentrent sur l'apprentissage direct des actions maximisant le retour.</font>

<!-- source: entrainement · entrainement.md#56 -->

<font color="crimson">Cette différence induit naturellement une seconde distinction : la planification par opposition à l'exécution directe de la politique. Les modèles du monde appris peuvent être mobilisés pour soutenir la planification en ligne ou l'imagination latente :

<!-- source: entrainement · entrainement.md#57 -->

* **PlaNet** réalise une planification en ligne dans l'espace latent.
* **PETS** utilise les dynamiques apprises pour le contrôle prédictif fondé sur un modèle (*Model Predictive Control*).
* **Dreamer** améliore les comportements en imaginant des trajectoires au sein d'un modèle latent appris.
* **TD-MPC** associe un modèle dynamique latent à une optimisation de trajectoire au moment de la décision [31, 32, 45, 46] \cite{bruce2024genie, hafner2020dream, chua2018deep, hansen2022temporal}.

<!-- source: entrainement · entrainement.md#58 -->

À l'inverse, les méthodes sans modèle canoniques telles que **DQN**, **PPO** et **SAC** procèdent généralement par un passage direct en avant (*forward pass*) d'une politique apprise ou d'une règle de décision fondée sur la valeur, plutôt que par une recherche explicite à travers des futurs hypothétiques [42–44] \cite{mnih2015humanlevel, schulman2017proximal, haarnoja2018soft}.</font>

<!-- source: entrainement · entrainement.md#59 -->

<font color="orange">Une troisième distinction concerne l'efficacité d'échantillonnage (sample efficiency). Une motivation récurrente en faveur des approches fondées sur les modèles du monde est qu'un modèle de dynamique appris permet à l'agent de réutiliser l'expérience réelle de manière plus efficiente par le biais de la prédiction, de l'imagination ou de la planification. PILCO constitue un exemple classique d'efficacité extrême en matière de données pour le contrôle fondé sur un modèle, tandis que PETS, MBPO et Dreamer démontrent que les modèles appris peuvent améliorer considérablement les performances par étape d'environnement réel dans les contextes modernes de contrôle continu et visuel [32, 45, 47, 48] \cite{hafner2020dream, chua2018deep, deisenroth2011pilco, janner2019when}. Les méthodes sans modèle, par construction, n'exploitent pas explicitement un simulateur appris ; elles améliorent plutôt les politiques ou les fonctions de valeur uniquement à partir de transitions réelles ou rejouées [42–44] \cite{mnih2015humanlevel, schulman2017proximal, haarnoja2018soft}.</font>

<!-- source: entrainement · entrainement.md#60 -->

<font color="purple">Cependant, les avantages des modèles du monde s'accompagnent d'une responsabilité inhérente : le **biais du modèle** (*model bias*). Si la dynamique apprise s'avère inexacte, les longs déploiements imaginés peuvent s'écarter de la réalité de l'environnement et inciter la politique à exploiter ces erreurs de modélisation. PILCO identifie explicitement le biais du modèle comme un enjeu crucial et le traite au moyen d'une dynamique probabiliste et d'une planification tenant compte de l'incertitude, tandis que MBPO montre que des déploiements imaginés de courte durée permettent d'atténuer les effets néfastes de l'exploitation du modèle en pratique [47, 48] \cite{deisenroth2011pilco, janner2019when}. L'apprentissage par renforcement sans modèle échappe à ce mode de défaillance particulier dans la mesure où il ne repose pas sur des prédictions autorégressives multi-étapes des dynamiques de l'environnement, bien qu'il sacrifie au passage une partie du levier structurel accessible aux systèmes fondés sur les modèles [42, 44] \cite{mnih2015humanlevel, haarnoja2018soft}.</font>

<!-- source: entrainement · entrainement.md#61 -->

<font color="teal">Les deux paradigmes diffèrent également en matière d'apprentissage de représentation. Dans les architectures modernes des modèles du monde, les états latents sont entraînés non seulement pour soutenir la sélection des actions, mais aussi pour résumer les dynamiques cachées de l'environnement au fil du temps. Les modèles du monde, PlaNet et Dreamer reposent tous sur des représentations latentes compactes qui favorisent la prédiction et l'imagination, plutôt que sur un contrôle purement réactif [31–33] \cite{hafner2019dream, hafner2020dream, ha2018world}. En revanche, dans l'apprentissage par renforcement sans modèle (*model-free RL*) standard, les représentations apprises sont généralement optimisées uniquement dans la mesure où elles améliorent l'estimation de la politique ou de la valeur pour la tâche en cours [42–44] \cite{mnih2015humanlevel, schulman2017proximal, haarnoja2018soft}. Cette différence rend souvent les représentations issues des modèles du monde plus naturellement réutilisables en vue d'une planification ou d'une adaptation ultérieure.</font>

<!-- source: entrainement · entrainement.md#62 -->

<font color="teal">Cette distinction revêt une importance particulière pour la généralisation et le transfert. **DARLA** a ainsi démontré que des représentations désentravées (*disentangled representations*) peuvent améliorer le transfert sans échantillon (*zero-shot transfer*) en RL, tandis que les **Schema Networks** ont prouvé qu'un modèle génératif et causal des dynamiques environnementales permet un transfert plus robuste ainsi qu'une généralisation combinatoire supérieure à celle des méthodes de référence réactives sur des tâches structurées [49, 50] \cite{higgins2017darla, kansky2017schema}. Plus largement, un modèle du monde appris peut en principe être associé à de nouvelles récompenses, de nouveaux objectifs ou de nouveaux planificateurs sans qu'il soit nécessaire de rejeter l'ensemble des connaissances préalables sur les dynamiques de l'environnement. Les politiques sans modèle, à l'inverse, demeurent généralement plus étroitement inféodées à la structure de récompense sous laquelle elles ont été entraînées [42, 43] \cite{mnih2015humanlevel, schulman2017proximal}.</font>

<!-- source: entrainement · entrainement.md#63 -->

Une autre différence clé réside dans le support offert pour le raisonnement contrefactuel et hypothétique. Étant donné que les modèles du monde explicitent la manière dont l'environnement évoluerait sous l'effet d'actions alternatives, ils se prêtent naturellement à l'analyse contrefactuelle (*« What if ? »*). Des travaux comme *Woulda, Coulda, Shoulda* ont formalisé cette idée en exploitant des modèles causaux structurels pour la recherche de politiques contrefactuelles à partir d'expériences enregistrées, et les *Schema Networks* ont également mis en avant l'importance d'une structure causale générative pour appréhender des situations inédites [50, 51] \cite{kansky2017schema, buesing2019woulda}. Le RL sans modèle standard ne fournit pas nativement de simulateur explicite pour évaluer des avenirs alternatifs ; toute velléité de réflexion de ce type doit y être adjointe de manière externe ou approximée indirectement par le biais de l'estimation de la valeur [42, 43] \cite{mnih2015humanlevel, schulman2017proximal}.

<!-- source: entrainement · entrainement.md#64 -->

Les modèles du monde peuvent également offrir une transparence accrue quant à leurs prédictions internes. Dans *World Models* et *Dreamer*, les chercheurs peuvent inspecter les reconstructions, les déploiements latents (*latents rollouts*) ou les trajectoires imaginées, tandis que les *Schema Networks* exposent un modèle génératif explicitement structuré des interactions entre objets et de leurs conséquences [32, 33, 50] \cite{hafner2020dream, ha2018world, kansky2017schema}. Les politiques sans modèle telles que *DQN* ou *SAC*, en revanche, encodent généralement leurs connaissances de manière plus implicite au sein des paramètres de la politique et de la fonction de valeur, ce qui peut rendre l'interprétation a posteriori plus ardue [42, 44] \cite{mnih2015humanlevel, haarnoja2018soft}.

<!-- source: entrainement · entrainement.md#65 -->

Une distinction supplémentaire concerne la gestion de l'incertitude. *PETS* utilise des ensembles probabilistes (*probabilistic ensembles*) pour capturer l'incertitude dans les dynamiques apprises, et *PILCO* modélise l'incertitude directement par le biais de processus gaussiens dynamiques ; plus généralement, des techniques bayésiennes approximatives telles que le *Monte Carlo dropout* offrent une voie pratique pour estimer l'incertitude prédictive dans les modèles profonds [45, 47, 52] \cite{chua2018deep, deisenroth2011pilco, gal2016dropout}. L'apprentissage par renforcement sans modèle (*model-free RL*) peut également raisonner sur l'incertitude, mais celle-ci porte généralement sur l'estimation de la valeur plutôt que sur les trajectoires futures de l'environnement ; des exemples incluent le *DQN* boostrapé pour l'exploration profonde et le RL distributionnel pour l'apprentissage des distributions de retours [53, 54] \cite{osband2016deep, bellemare2017distributional}. Par conséquent, l'incertitude dans les modèles du monde se trouve plus directement liée aux tâches de prévision et de planification.

<!-- source: entrainement · entrainement.md#66 -->

<font color="blue">Malgré ces contrastes, la frontière séparant les modèles du monde du RL sans modèle n'a rien d'absolu. De nombreux agents modernes performants adoptent une approche hybride :

<!-- source: entrainement · entrainement.md#67 -->

* **Dreamer** associe un modèle du monde appris à un apprentissage de type *actor-critic* au sein de l'imagination latente.
* **MBPO** exploite un modèle appris pour générer des données synthétiques destinées à un algorithme d'apprentissage hors politique (*off-policy*).
* **TD-MPC** combine des dynamiques latentes et l'apprentissage de la valeur pour le contrôle.
* **SPR** démontre comment des objectifs prédictifs latents peuvent considérablement renforcer des agents par ailleurs dépourvus de modèles [32, 46, 48, 55] \cite{hafner2020dream, hansen2022temporal, janner2019when, schwarzer2021dataefficient}.</font>

<!-- source: entrainement · entrainement.md#68 -->

<font color="blue">Le paysage contemporain s'interprete donc mieux comme un continuum : les approches fondées sur les modèles du monde placent la prédiction et la simulation interne au cœur du contrôle, tandis que les méthodes sans modèle privilégient l'optimisation directe de la valeur.</font>

<!-- source: entrainement · entrainement.md#69 -->

<font color="blue">En résumé, la distinction fondamentale réside dans le fait que les modèles du monde apprennent une description prédictive interne de l'environnement qu'ils mobilisent pour l'imagination, la planification ou le raisonnement, alors que le RL sans modèle apprend à agir efficacement sans nécessiter de simulation explicite de l'environnement. Cette différence se propage à travers de multiples propriétés en aval, incluant la capacité de planification, l'efficacité d'échantillonnage, la vulnérabilité au biais du modèle, le potentiel de transfert, le raisonnement contrefactuel et la gestion de l'incertitude [32, 33, 41, 42] \cite{hafner2020dream, ha2018world, moerland2023modelbased, mnih2015humanlevel}.</font>

<!-- source: divers · misc.md#6 -->

<font color="navy">Les grands RNN sont des modèles très expressifs qui peuvent apprendre de riches représentations spatiales et temporelles des données. Cependant, de nombreux algorithmes de RL sans modèle dans la littérature utilisent souvent seulement de petits réseaux de neurones avec peu de paramètres. L'algorithme de RL est souvent limité par le problème d'attribution de crédit, ce qui rend difficile pour les algorithmes traditionnels d'apprendre des millions de poids d'un grand modèle. Par conséquent, en pratique, des réseaux plus petits sont utilisés car ils atteignent plus rapidement une bonne politique pendant l'entraînement.</font>

## 4. Apprentissage auto-supervisé : apprendre sans récompense explicite

<!-- ===== AJOUT depuis survey archi 05/2026 (sections 3+) — À TRADUIRE ===== -->

<!-- contexte : Categorization of World Models by Architecture › Classification by learning paradigms -->

<!-- source: survey archi 05/2026 -->

Le paradigme d'apprentissage — \emph{comment} un modèle du monde acquiert la connaissance de la dynamique environnementale — constitue un axe de classification fondamental, orthogonal au type de représentation (section 3.1), à l'architecture de la dynamique (section 3.2) et à la modalité d'entrée (section 3.3). Une même architecture de base, telle que le RSSM sous-jacent à la famille Dreamer, peut être entraînée par apprentissage par renforcement en ligne~\cite{hafner2019dream}, par apprentissage hors ligne par lots, ou par pré-entraînement auto-supervisé à grande échelle, donnant naissance à des modèles aux exigences de données, aux capacités de généralisation et aux caractéristiques de déploiement très différentes. Cette section organise les modèles du monde existants en six grandes catégories de paradigmes d'apprentissage — apprentissage auto-supervisé et non supervisé, apprentissage par renforcement basé sur un modèle en ligne, apprentissage hors ligne par lots, pré-entraînement et adaptation de modèles de fondation, apprentissage supervisé et par imitation, et paradigmes hybrides multi-étapes — et analyse les compromis qu'implique chacun d'eux. Le tableau~\ref{tab:learning_paradigms} propose une synthèse de modèles représentatifs classés selon cet axe.

**Apprentissage auto-supervisé et non supervisé**

<!-- source: survey archi 05/2026 -->

Le paradigme d'apprentissage dominant pour les modèles du monde modernes est l'apprentissage auto-supervisé (SSL), dans lequel les modèles apprennent des représentations spatio-temporelles compactes à partir d'observations brutes et non étiquetées, en optimisant des objectifs prétextes qui exploitent la structure inhérente des données sensorielles. Ce paradigme élimine le besoin de signaux de récompense ou d'étiquettes de vérité terrain, permettant un entraînement sur des jeux de données à grande échelle collectés sans annotation spécifique à la tâche.

<!-- source: survey archi 05/2026 -->

<font color="red">La stratégie SSL la plus ancienne et la plus largement adoptée pour les modèles du monde est l'apprentissage par reconstruction des observations. Ha et Schmidhuber~\cite{ha2018world} ont été les pionniers de cette approche en entraînant un VAE de manière non supervisée pour compresser des observations d'images en vecteurs latents compacts, couplé à un RNN prédisant les distributions latentes futures. L'ensemble du modèle du monde était appris sans aucune récompense de tâche, en s'appuyant uniquement sur l'objectif de reconstruction du VAE et la perte prédictive du RNN.</font> La série Dreamer~\cite{hafner2019dream, hafner2020mastering, hafner2025mastering} a étendu ce paradigme via le RSSM, où le modèle du monde est entraîné à reconstruire les observations, à prédire les récompenses et à prédire les fins d'épisode à partir des états latents. <font color="teal">Une conclusion majeure de DreamerV3~\cite{hafner2025mastering} est que les représentations du modèle du monde sont façonnées principalement par son \emph{objectif de reconstruction agnostique à la tâche} plutôt que par des gradients de récompense spécifiques à la tâche, ce qui suggère que l'apprentissage non supervisé de la dynamique constitue le substrat représentationnel principal sur lequel les signaux spécifiques à la tâche ne font qu'affiner le comportement.</font>

<!-- source: survey archi 05/2026 -->

L'auto-supervision fondée sur la reconstruction sous-tend également les approches de prédiction vidéo. Les modèles de prédiction vidéo stochastiques tels que SV2P~\cite{babaeizadeh2018sv2p} et SVG~\cite{denton2018svg} apprennent à prédire les images vidéo futures en introduisant des variables latentes variationnelles pour capturer l'incertitude inhérente aux résultats futurs. Plus récemment, les modèles du monde fondés sur la diffusion — dont DIAMOND~\cite{alonso2024diamond} et GameNGen~\cite{valevski2024gamengen} — reformulent la prédiction de la prochaine observation comme un processus de débruitage, où le modèle apprend à inverser une procédure progressive de corruption par bruit. L'objectif d'appariement de score par débruitage est lui-même une forme d'auto-supervision : aucune étiquette n'est requise au-delà des observations elles-mêmes.

<!-- source: survey archi 05/2026 -->

<font color="brown">Bien que les approches fondées sur la reconstruction se soient révélées remarquablement efficaces, elles présentent une limite fondamentale : la reconstruction au niveau du pixel contraint les modèles à allouer leur capacité représentationnelle à des détails visuels non pertinents pour la tâche, tels que les textures, les variations d'éclairage ou l'encombrement de l'arrière-plan, potentiellement au détriment de la capture de la dynamique pertinente pour la décision.</font>

<!-- source: survey archi 05/2026 -->

Une stratégie SSL alternative évite entièrement la reconstruction au niveau du pixel, en apprenant à la place des représentations structurées via des objectifs contrastifs ou non contrastifs. Les Contrastive Structured World Models (C-SWM)~\cite{kipf2020cswm} apprennent des représentations d'état centrées sur les objets en opposant des paires de transitions d'état temporellement adjacentes à des négatifs échantillonnés aléatoirement, produisant des espaces latents physiquement significatifs qui permettent une prédiction précise à plusieurs pas sans aucun décodeur de reconstruction. Les Self-Predictive Representations (SPR)~\cite{schwarzer2020spr} favorisent une cohérence latente pertinente pour la tâche en entraînant les représentations à prédire leurs propres états latents futurs sous un modèle de transition appris, obtenant des améliorations substantielles de l'efficacité en données sur le benchmark Atari 100k.

<!-- source: survey archi 05/2026 -->

Les méthodes non contrastives, qui évitent le besoin d'échantillons négatifs explicites, ont également gagné en popularité. Les approches inspirées de BYOL~\cite{grill2020bootstrap} et VICReg~\cite{bardes2021vicreg} apprennent des représentations en imposant un accord entre différentes vues augmentées d'une même observation, tout en utilisant des mécanismes de régularisation — tels que des cibles à moyenne mobile exponentielle, des contraintes de variance-invariance-covariance, ou des opérations d'arrêt de gradient — pour éviter l'effondrement représentationnel. DINO-WM~\cite{zhou2025dinowm} construit des modèles de dynamique du monde sur des plongements de patchs DINOv2 compacts plutôt que sur des pixels bruts, prédisant les caractéristiques futures des patchs à partir de trajectoires comportementales hors ligne et permettant une planification en zero-shot à travers des environnements variés, sans modèle de récompense ni démonstration experte. Cela démontre que des représentations visuelles préentraînées encodant une structure sémantique riche peuvent servir de biais inductifs puissants pour l'apprentissage de la dynamique.

<!-- source: survey archi 05/2026 -->

<font color="brown">Le paradigme SSL sans doute le plus rigoureux sur le plan théorique pour la modélisation du monde est la Joint-Embedding Predictive Architecture (JEPA), proposée par LeCun~\cite{lecun2022path}. Contrairement aux approches génératives qui prédisent des observations brutes, JEPA apprend à prédire de futures \emph{représentations} dans un espace latent appris, en écartant délibérément les détails perceptifs imprévisibles et non pertinents pour la tâche. Ce choix de conception reflète une intuition fondamentale : la représentation optimale pour la dynamique du monde ne coïncide pas nécessairement avec une modalité sensorielle brute, et forcer une prédiction au niveau du pixel gaspille la capacité du modèle sur des informations non pertinentes pour la prise de décision en aval.</font>

<!-- source: survey archi 05/2026 -->

<font color="brown">I-JEPA~\cite{assran2023ijepa} a instancié ce principe pour les images statiques, en prédisant les représentations de régions d'image masquées à partir du contexte visible, entièrement dans l'espace latent, et en atteignant des performances compétitives avec une efficacité de calcul nettement supérieure à celle des autoencodeurs masqués et des références contrastives. V-JEPA~\cite{bardes2024vjepa} a étendu ce principe au domaine temporel en prédisant des régions spatio-temporelles masquées dans des vidéos, apprenant des représentations sensibles au mouvement sans reconstruction de pixels. V-JEPA 2~\cite{assran2025vjepa2}, préentraîné sur plus d'un million d'heures de vidéo issue d'internet, a démontré que la mise à l'échelle du pré-entraînement JEPA produit des représentations vidéo dotées de capacités de compréhension et de prédiction à l'état de l'art — atteignant 77,3 % de précision top-1 sur Something-Something v2 pour la compréhension du mouvement et un rappel à 5 de 39,7 sur Epic-Kitchens-100 pour l'anticipation d'action. Fait crucial, V-JEPA 2 peut être post-entraîné en un modèle du monde conditionné par l'action (V-JEPA 2-AC) en utilisant moins de 62 heures de vidéo robotique non étiquetée, permettant une planification robotique en zero-shot sur des bras Franka physiques sans aucun entraînement ni récompense spécifique à la tâche. Le paradigme JEPA représente ainsi un basculement de l'apprentissage auto-supervisé « génératif » vers l'apprentissage « prédictif », où le modèle apprend quels aspects du futur sont prévisibles et pertinents plutôt que de tenter de reconstruire chaque détail.</font>

## 5. Pré-entraînement génératif et prédictif à grande échelle

<!-- ===== AJOUT depuis definition & roadmap 07/2026 (sections 3+) — À TRADUIRE ===== -->

<!-- source: definition & roadmap 07/2026 | None › Self-Supervised and Generative Pretraining -->

Le pré-entraînement auto-supervisé et génératif est devenu le point d'entrée naturel des modèles du monde, car il transforme l'expérience non étiquetée en une supervision dense avant même que les récompenses de tâche ou des étiquettes expertes denses soient disponibles. Notons $\mathbf{x}_{1:T}$ les observations au niveau du pixel ou les images vidéo, $\mathbf{a}_{1:T}$ les actions, $\mathbf{c}$ les conditions optionnelles, et $u_{1:T}$ les tokens discrets. L'objectif commun n'est pas la reconstruction pour elle-même, mais l'acquisition d'un état de croyance compact et d'un a priori de transition en prédisant des éléments retenus, futurs, ou suivants de l'expérience.

<!-- source: definition & roadmap 07/2026 | None › Self-Supervised and Generative Pretraining -->

La prédiction vidéo est la formulation la plus directe :
$$
    p_{\theta}\!\left(
    \mathbf{x}_{t+1:t+K}
    \mid
    \mathbf{x}_{\le t},
    \mathbf{a}_{t:t+K-1},
    \mathbf{c}
    \right).
$$
Elle ancre l'apprentissage de représentation dans le temps : la persistance, l'occlusion, le contact, le mouvement et le changement de scène deviennent une supervision à chaque image. Cependant, la prédiction sans action apprend une dynamique observationnelle, tandis que la prédiction conditionnée par l'action commence à approximer une dynamique interventionnelle — la distinction qui compte pour la planification. <font color="brown">La prédiction au niveau du pixel est également un proxy fragile : le photoréalisme n'est ni nécessaire ni suffisant pour une compréhension physique contrôlable. Les systèmes modernes prédisent donc de plus en plus des latents stochastiques, tokenisés ou de diffusion, déplaçant l'objectif du rendu de futurs plausibles vers la préservation de la dynamique pertinente pour l'action~\citep{finn2016unsupervised,ha2018worldmodels}.</font>

<!-- source: definition & roadmap 07/2026 | None › Self-Supervised and Generative Pretraining -->

L'autoencodage masqué fournit une voie complémentaire. Les objectifs de type MAE reconstruisent des patchs masqués à partir du contexte visible, tandis que les variantes vidéo exploitent la redondance temporelle par masquage en tubes et des taux de masquage très élevés~\citep{he2022mae,tong2022videomae}. L'effet utile est la compression : l'encodeur ne peut pas simplement copier les pixels, et doit inférer la structure à partir du contexte. <font color="brown">Mais la reconstruction n'est qu'un proxy. Pour les modèles du monde, les meilleurs objectifs masqués sont ceux dont les espaces latents restent prédictifs sous intervention ; ceci motive la prédiction de représentation de type JEPA, qui écarte l'apparence parasite tout en préservant les invariants sémantiques et dynamiques utiles à la planification~\citep{bardes2024vjepa,assran2025vjepa2}.</font>

<!-- source: definition & roadmap 07/2026 | None › Self-Supervised and Generative Pretraining -->

La prédiction du prochain token fournit l'interface générative la plus scalable. Une fois que la vidéo, les actions, le langage, les cartes, la proprioception et les récompenses sont tokenisés ou plongés, le pré-entraînement peut minimiser
$$
\mathcal{L}_{\mathrm{NTP}}
=
-\sum_{t=1}^{T}
\log p_\theta\!\left(
u_t \mid u_{<t}, \mathbf{a}_{\le t}, \mathbf{c}
\right).
$$
Cela aligne la modélisation du monde sur la mise à l'échelle des Transformers et permet le prompting multimodal. GAIA-1 formule la modélisation du monde pour la conduite autonome comme une prédiction de séquence de tokens discrets, tandis que Genie combine un tokeniseur vidéo spatio-temporel, un modèle de dynamique autorégressif, et un modèle d'action latente entraîné à partir de vidéos non étiquetées~\citep{hu2023gaia1,bruce2024genie}. Le goulot d'étranglement caché est la tokenisation : les tokens définissent l'ontologie du modèle, et la géométrie, le contact ou la contrôlabilité écartés par le tokeniseur ne peuvent être récupérés par la seule échelle.

<!-- source: definition & roadmap 07/2026 | None › Self-Supervised and Generative Pretraining -->

Les lois d'échelle transforment ces objectifs en un problème de systèmes. Une abstraction utile est
$$
\mathcal{L}(N,D)
\approx
\mathcal{L}_{\infty}
+
A N^{-\alpha}
+
B D^{-\beta},
\qquad
C \approx \kappa N D,
$$
où $N$ est la taille du modèle, $D$ les données d'entraînement, et $C$ le calcul. Les résultats sur les modèles de langage montrent des améliorations prévisibles en loi de puissance avec l'échelle, tandis qu'un entraînement optimal en calcul requiert d'équilibrer paramètres et tokens~\citep{kaplan2020scaling,hoffmann2022training}. Pour les modèles du monde, cependant, $D$ doit être lu non pas simplement comme un nombre de tokens, mais comme une couverture des états, actions, incarnations, points de vue, contacts, événements rares et horizons. Les premières études du pré-entraînement incarné constatent un comportement de mise à l'échelle analogue, mais avec des coefficients façonnés par le tokeniseur, la tâche et l'architecture~\citep{pearce2024scaling}. Ainsi, la vraisemblance est insuffisante : les modèles du monde scalables doivent aussi être jugés sur la cohérence en boucle fermée, la contrôlabilité, la stabilité à long horizon, et la robustesse aux régimes rares.

<!-- source: definition & roadmap 07/2026 | None › Self-Supervised and Generative Pretraining -->

Les données synthétiques constituent donc un levier de mise à l'échelle pratique. Des plateformes telles qu'Omniverse Replicator et Isaac Sim permettent la génération de données synthétiques physiquement fondées, tandis que des pipelines récents tels que Cosmos-Drive-Dreams et GR00T-Dreams utilisent des modèles de fondation du monde pour générer des scénarios de conduite contrôlables ou des trajectoires robotiques synthétiques~\citep{nvidia2022replicator,nvidia2025cosmos,nvidia2025grootdreams}. Leur rôle le plus fort n'est pas de remplacer la réalité, mais de l'amplifier : les données réelles ancrent la distribution, tandis que la simulation et la génération de données synthétiques (SDG) exposent les régimes de queue longue, dangereux et contrefactuels. Le problème central est celui de la calibration — comment mélanger données réelles, simulées et générées afin qu'une couverture plus large améliore la généralisation physique plutôt que d'enseigner les artefacts du simulateur. Dans cette perspective, le pré-entraînement n'apprend pas à un modèle à rendre le monde ; il lui apprend les variables par lesquelles un agent peut le changer.

## 6. Modèles implicites : apprendre la cohérence du monde dans les représentations

<!-- ===== AJOUT depuis tutorial 06/2026 (sections 3+) — À TRADUIRE ===== -->

<!-- source: tutorial 06/2026 | Implicit World Models › Learning Paradigms for Implicit World Models -->

Les modèles du monde implicites sont appris par apprentissage prédictif et auto-supervisé à grande échelle. Plutôt que d'ajuster une fonction de transition qui simule l'évolution de l'environnement, ces modèles apprennent des représentations qui encodent les régularités du monde en imposant une cohérence prédictive à travers les observations.

<!-- source: tutorial 06/2026 | Implicit World Models › Learning Paradigms for Implicit World Models -->

Le mécanisme central sous-tendant ce paradigme est l'apprentissage prédictif. En exigeant du modèle qu'il prédise des vues manquantes, futures ou alternatives des données, l'entraînement contraint implicitement les représentations à capturer une structure stable qui rend les observations cohérentes. Bien que les objectifs prédictifs varient — de la prédiction du prochain token dans les modèles de langage à la modélisation masquée dans les systèmes multimodaux et la prédiction d'images futures en vidéo — ils partagent un principe commun : une prédiction précise exige une sensibilité aux régularités persistantes telles que la continuité des objets, les relations spatiales et les dépendances causales.

<!-- source: tutorial 06/2026 | Implicit World Models › Learning Paradigms for Implicit World Models -->

Une manière utile de comprendre ce processus passe par la notion de cohérence. Les objectifs prédictifs imposent de multiples formes de cohérence à travers les observations, ce qui contraint la géométrie de l'espace de représentation. La cohérence temporelle impose la continuité des événements dans le temps, la cohérence contextuelle stabilise les interprétations à travers des entrées variées, et la cohérence intermodale aligne les représentations dérivées de modalités différentes. Ensemble, ces contraintes intègrent la connaissance du monde sous forme de régularités structurelles plutôt que de transitions explicites.

<!-- source: tutorial 06/2026 | Implicit World Models › Learning Paradigms for Implicit World Models -->

L'apprentissage auto-supervisé à grande échelle est essentiel à ce processus. Parce que les signaux d'entraînement sont dérivés directement des données, les modèles peuvent être exposés à des corpus vastes et diversifiés couvrant texte, images, vidéo et entrées multimodales. Cette diversité permet aux représentations d'internaliser de larges régularités du monde, donnant souvent naissance à des capacités émergentes telles que le raisonnement spatial, l'inférence temporelle, et la compréhension du sens commun sans supervision explicite \cite{Zong2025}.

<!-- source: tutorial 06/2026 | Implicit World Models › Learning Paradigms for Implicit World Models -->

Les architectures Transformer, introduites dans \cite{Vaswani2017}, fournissent le fondement computationnel de ce paradigme. Leur structure fondée sur l'attention permet de modéliser des dépendances à longue portée et soutient une intégration flexible d'entrées multimodales au sein d'un espace de représentation unifié. Combinée à la scalabilité en données comme en taille de modèle, l'architecture Transformer est devenue l'architecture dominante pour les modèles du monde implicites, incluant les grands modèles de langage, les systèmes vision-langage, et les modèles génératifs vidéo récents.

<!-- source: tutorial 06/2026 | Implicit World Models › Learning Paradigms for Implicit World Models -->

Pris ensemble, l'apprentissage prédictif, les contraintes de cohérence, l'entraînement auto-supervisé à grande échelle et les architectures Transformer définissent le paradigme d'apprentissage central des modèles du monde implicites. Les sections suivantes examinent comment ces principes se réalisent dans des classes de modèles représentatives.

## 7. Apprentissage par renforcement basé sur un modèle en ligne

**Apprentissage par renforcement basé sur un modèle en ligne**

<claude>Intertitre en double avec le titre de la section 7 (artefact de fusion) — n'en conserver qu'un.</claude>

<!-- source: survey archi 05/2026 -->

<font color="olive">Dans l'apprentissage par renforcement basé sur un modèle en ligne (MBRL), le modèle du monde est appris simultanément à la politique de l'agent par interaction itérative avec l'environnement. L'agent alterne entre la collecte d'expérience réelle, la mise à jour de son modèle interne de l'environnement, et l'utilisation de ce modèle pour améliorer son comportement — soit par génération de données synthétiques, soit par planification directe.</font>

<!-- source: survey archi 05/2026 -->

<font color="olive">Les racines conceptuelles de ce paradigme remontent à l'architecture Dyna de Sutton~\cite{sutton1990dyna}, qui entrelaçait l'interaction réelle avec l'environnement et des mises à jour basées sur un modèle, en utilisant la dynamique apprise pour générer des transitions synthétiques destinées à l'entraînement de la fonction de valeur.</font> <font color="purple">Dans le MBRL moderne, cette stratégie a été affinée pour équilibrer les bénéfices des données générées par le modèle et les risques d'accumulation des erreurs de modèle. MBPO~\cite{janner2019mbpo} limite les déploiements du modèle à de courts horizons initiés à partir d'états réels échantillonnés dans un tampon de rejeu, offrant une garantie théorique d'amélioration monotone tout en améliorant substantiellement l'efficacité en données. STEVE~\cite{buckman2018sample} a exploré plus avant comment des déploiements de modèle sensibles à l'incertitude peuvent être intégrés dans l'estimation de la valeur, en utilisant des ensembles pour quantifier l'incertitude épistémique et éviter l'exploitation de régions mal modélisées.</font>

<!-- source: survey archi 05/2026 -->

Un usage plus ambitieux des modèles du monde en ligne place les trajectoires latentes imaginées au centre de l'optimisation de politique. <font color="orange">PlaNet~\cite{hafner2019planet} a démontré que des modèles de dynamique latente compacts peuvent soutenir la planification directement à partir d'observations d'images, obtenant des gains d'efficacité en données de 50\(\times\) par rapport aux méthodes sans modèle grâce à la méthode d'entropie croisée pour l'optimisation de trajectoire en ligne.</font> <font color="green">La famille Dreamer~\cite{hafner2019dream, hafner2020mastering, hafner2025mastering} a étendu cette approche en combinant une dynamique latente apprise avec un apprentissage acteur-critique entièrement au sein de déploiements imaginés : après avoir ajusté un modèle du monde à partir de l'expérience réelle, l'agent déroule des trajectoires latentes imaginées et les utilise pour entraîner des réseaux de valeur et de politique par rétropropagation à travers la dynamique différentiable. Comme la dynamique de transition est implémentée sous forme de réseaux de neurones différentiables, les gradients des estimations de valeur à long terme peuvent être propagés à travers les trajectoires imaginées, transformant de fait l'imagination en un graphe de calcul différentiable. DayDreamer~\cite{wu2023daydreamer} a validé ce paradigme sur des robots physiques, démontrant qu'un quadrupède pouvait apprendre des démarches de locomotion entièrement à partir d'interactions réelles, sans aucune simulation.</font>

<!-- source: survey archi 05/2026 -->

<font color="crimson">Un paradigme en ligne alternatif effectue une planification explicite au moment de l'inférence via des procédures de recherche. MuZero~\cite{schrittwieser2020mastering} apprend un modèle de dynamique latente suffisant pour prédire uniquement les quantités pertinentes pour la planification — récompenses, valeurs et logits de politique — et le combine avec une recherche arborescente de Monte-Carlo pour atteindre des performances surhumaines au go, aux échecs, au shogi et sur Atari, sans accès aux règles de l'environnement. </font> <font color="brown">Cette approche incarne le principe d'\emph{équivalence de valeur}~\cite{grimm2020value} : l'espace latent est façonné pour préserver la structure pertinente pour la décision plutôt que pour reconstruire fidèlement les observations.</font> <font color="crimson">EfficientZero~\cite{ye2021efficientzero} a amélioré l'efficacité en données en incorporant des objectifs de cohérence auto-supervisés, tandis que TD-MPC~\cite{hansen2022tdmpc} a intégré une dynamique latente apprise avec une optimisation de trajectoire pour le contrôle continu. Contrairement aux approches amorties qui encodent la planification dans une politique paramétrique, les méthodes fondées sur la recherche recalculent explicitement les actions optimales pour chaque état, échangeant un coût de calcul accru à l'inférence contre une flexibilité et une robustesse améliorées face aux états hors distribution.</font>

## 8. Formalisation MBRL et exploitation du modèle

<!-- source: definition & roadmap 07/2026 | None › Model-Based Reinforcement Learning -->

\label{sec:mbrl}
<font color="blue">L'apprentissage par renforcement basé sur un modèle (MBRL)~\citep{moerland2022modelbasedreinforcementlearningsurvey} est un paradigme d'apprentissage dans lequel les modèles du monde ont d'abord reçu une définition centrée sur la décision : un modèle du monde est un modèle interne utilisé pour améliorer une politique en prédisant les conséquences des actions de manière suffisamment fiable.
</font> <font color="olive">Le pipeline typique du MBRL se déroule en deux étapes entrelacées : 1) un agent interagit avec l'environnement et ajuste un modèle de dynamique, c'est-à-dire un modèle de transition appris $\widehat P_\theta$, souvent accompagné de fonctions de valeur apprises ; 2) l'agent exploite ce modèle comme un substitut peu coûteux, différentiable et réinitialisable de la réalité, soit en planifiant des séquences d'actions directement en son sein, soit en entraînant une politique sur des déploiements imaginés, amortissant ainsi le coût de l'interaction réelle.</font>

<!-- source: definition & roadmap 07/2026 | None › Model-Based Reinforcement Learning -->

<font color="gray">Formellement, le MBRL est défini comme un tuple $\mathcal{M}_{\mathrm{MDP}} = (\mathcal{S}, \mathcal{A}, P^\star, R, \gamma, \rho_0)$,
où $\mathcal{S}$ est l'espace d'états, $\mathcal{A}$ l'espace d'actions, $P^\star(\mathbf{s}_{t+1} \mid \mathbf{s}_t, \mathbf{a}_t)$ désigne la dynamique de transition véritable, $R: \mathcal{S} \times \mathcal{A} \to \mathbb{R}$ la fonction de récompense, $\gamma \in [0,1)$ le facteur d'actualisation, et $\rho_0$ la distribution des états initiaux.
Pour l'objectif d'apprentissage, l'agent recherche une politique $\pi_\phi: \mathcal{S} \to \Delta(\mathcal{A})$ qui maximise le retour cumulé espéré, soit
$$
    J(\pi_\phi)
    =
    \mathbb{E}_{\pi_\phi,P^\star}
    \left[
    \sum_{t=0}^{H-1}\gamma^t r_t
    \right],
    \qquad
    r_t = R(\mathbf{s}_t,\mathbf{a}_t).
$$

</font>
La distinction clé réside dans l'apprentissage d'une \textbf{fonction de transition approximée} $\widehat P_\theta$, paramétrée par $\theta$, pour approximer l'oracle $P^\star$ :
$$
    \widehat P_\theta:
    \mathcal{S}\times\mathcal{A}\to\Delta(\mathcal{S}),
    \qquad
    \widehat{\mathbf{s}}_{t+1}
    \sim
    \widehat P_\theta(\cdot\mid\mathbf{s}_t,\mathbf{a}_t),
$$
où $\widehat P_\theta$ est entraîné en minimisant la log-vraisemblance négative sur un tampon de rejeu $\mathcal{D} = \{(\mathbf{s}_t, \mathbf{a}_t, \mathbf{s}_{t+1})\}$, soit
$$
\label{eq:learn_dynamic_mbrl}
    \mathcal{L}_{\mathrm{dyn}}(\theta)
    =
    -\mathbb{E}_{(\mathbf{s},\mathbf{a},\mathbf{s}')\sim\mathcal{D}}
    \left[
    \log \widehat P_\theta(\mathbf{s}'\mid\mathbf{s},\mathbf{a})
    \right].
$$
<font color="orange">En apprenant $\widehat P_\theta$, l'agent peut effectuer l'optimisation
de politique entièrement au sein du modèle, améliorant substantiellement 
l'\textbf{efficacité d'échantillonnage} par rapport aux méthodes sans modèle.</font>

<!-- source: definition & roadmap 07/2026 | None › Model-Based Reinforcement Learning -->

La recherche existante en MBRL se concentre sur deux axes : l'\textit{apprentissage du modèle} et l'\textit{exploitation du modèle}.
Pour l'apprentissage du modèle, les premiers travaux tels que PILCO~\citep{deisenroth2011pilco} employaient des processus gaussiens pour capturer l'incertitude épistémique dans la dynamique, tandis que les approches ultérieures ont adopté des DNN pour une plus grande expressivité — notamment des réseaux déterministes~\citep{nagabandi2018mbmf}, des ensembles probabilistes~\citep{chua2018pets, janner2019mbpo}, et des modèles du monde en espace latent qui apprennent conjointement des représentations d'état compactes et la dynamique~\citep{hafner2019dreamer, hafner2020dreamerv2, hafner2023dreamerv3}.
Pour l'exploitation du modèle, les méthodes divergent dans la manière 
dont elles tirent parti du modèle appris : les approches de type Dyna~\citep{sutton1990dyna, 
janner2019mbpo} utilisent le modèle comme générateur pour augmenter le 
tampon de rejeu en vue d'une optimisation de politique hors-politique ; les méthodes fondées sur la planification telles que PETS~\citep{chua2018pets} et MPPI~\citep{williams2017mppi} effectuent 
une \textit{optimisation de trajectoire en ligne} via le contrôle prédictif par modèle (MPC) ; 
tandis que les méthodes de gradient de politique basées sur un modèle~\citep{heess2015svg, clavera2020mbmpo} rétropropagent les gradients \textit{à travers les déploiements du modèle} pour optimiser directement la politique.
Ensemble, ces deux axes de travail mettent en lumière le défi central du MBRL : apprendre un modèle suffisamment précis tout en l'exploitant efficacement pour l'optimisation de politique en aval. Les procédures de raisonnement et de prise de décision décrites ensuite doivent donc être comprises comme des formes concrètes d'exploitation du modèle : elles diffèrent principalement selon que le modèle est utilisé pendant l'entraînement en arrière-plan, la planification au moment de la décision, ou le diagnostic causal.

<!-- source: definition & roadmap 07/2026 | None › Model-Based Reinforcement Learning -->

<font color="crimson">Posséder un modèle du monde n'équivaut pas à bien l'utiliser. La littérature divise l'usage du modèle en deux régimes que \citet{sutton2018rl} distinguent comme la \emph{planification en arrière-plan} et la \emph{planification au moment de la décision}. Dans la planification en arrière-plan, le modèle sert de générateur de données : les trajectoires imaginées sont traitées comme une expérience supplémentaire pour l'amélioration de la politique, comme dans les mises à jour de type Dyna \citep{sutton1991dyna}, les courts déploiements basés sur le modèle de MBPO délibérément tronqués pour borner l'erreur du modèle \citep{janner2019mbpo}, et l'apprentissage acteur-critique de Dreamer dans l'imagination latente \citep{hafner2019dreamer}. Le coût de calcul est payé pendant l'entraînement, et au déploiement l'agent agit de manière réactive via sa politique amortie. Dans la recherche prospective, en revanche, le modèle est interrogé au moment de la décision : étant donné l'état courant, l'agent simule des futurs candidats et sélectionne l'action dont les conséquences imaginées obtiennent le meilleur score. La planification au moment de la décision s'adapte instantanément à des objectifs modifiés et exploite du calcul supplémentaire à l'inférence, mais hérite à nouveau des erreurs du modèle à chaque étape. Les deux régimes sont complémentaires plutôt que concurrents — des systèmes modernes tels que MuZero utilisent une politique apprise pour proposer des actions et la recherche pour les affiner — et le compromis entre réaction amortie et recherche délibérative est de plus en plus lu comme un analogue de la distinction Système 1/Système 2 en cognition \citep{kahneman2011thinking}.</font>

<!-- source: definition & roadmap 07/2026 | None › Model-Based Reinforcement Learning -->

<font color="crimson">La recherche prospective elle-même relève de deux traditions méthodologiques. En contrôle continu, la planification est posée comme une optimisation de trajectoire sur des séquences d'actions, typiquement intégrée dans le contrôle prédictif par modèle (MPC) : l'agent optimise une séquence d'actions à $H$ pas par rapport au modèle, n'exécute que la première action, et replanifie à l'étape suivante, de sorte qu'une rétroaction fréquente corrige la dérive du modèle. L'optimisation interne est souvent réalisée avec la méthode d'entropie croisée (CEM), un échantillonneur sans dérivée qui réajuste itérativement une distribution d'échantillonnage à la fraction élite des trajectoires imaginées, comme dans PETS \citep{chua2018pets}, avec des raffinements tels que le contrôle par intégrale de chemin prédictif par modèle \citep{williams2017mppi} et des schémas hybrides qui amorcent l'échantillonnage avec une politique et une fonction de valeur apprises, comme dans TD-MPC \citep{hansen2022tdmpc}. Dans les domaines discrets, l'outil dominant est la recherche arborescente de Monte-Carlo, qui construit incrémentalement un arbre de recherche guidé par des a priori de politique appris et des estimations de valeur \citep{silver2016alphago, silver2017alphagozero} ; MuZero a démontré que la recherche peut s'exécuter entièrement à l'intérieur d'un modèle implicite appris, et Stochastic MuZero et Sampled MuZero étendent cette recette à la dynamique stochastique et aux espaces d'action larges ou continus \citep{antonoglou2022stochasticmuzero, hubert2021sampledmuzero}.</font>

<!-- source: definition & roadmap 07/2026 | None › Model-Based Reinforcement Learning -->

<font color="purple">Trois modes de défaillance récurrents apparaissent chaque fois qu'un modèle imparfait est mis au service de la prise de décision, et ils motivent une grande partie du programme de recherche à court terme. Le premier est l'\emph{erreur cumulative} : les déploiements autorégressifs alimentent le modèle avec ses propres prédictions, de sorte que les imprécisions à un pas s'accumulent et que la distribution d'états imaginée dérive de tout ce qui a été observé à l'entraînement, l'erreur croissant de façon superlinéaire avec l'horizon \citep{talvitie2017selfcorrecting, lambert2022compounding}. Les systèmes pratiques répondent à ce problème en maintenant des déploiements courts \citep{janner2019mbpo}, en replanifiant fréquemment sous MPC, en pondérant les retours imaginés par des estimations multi-horizons de type $\lambda$, ou en pénalisant les trajectoires par le désaccord d'ensemble — mais la stabilité de principe des déploiements à long horizon reste une question ouverte, et nous la traitons comme un goulot d'étranglement de premier plan également pour les modèles du monde fondés sur la génération vidéo. </font> <font color="brown">Le deuxième est le \emph{décalage d'objectif} : le modèle est entraîné pour maximiser la vraisemblance prédictive, mais il est évalué par le retour de la politique ou du plan qu'il soutient, et les deux objectifs ne sont pas alignés — un modèle qui consacre sa capacité à des détails visuellement saillants mais non pertinents pour la décision peut constituer un pire substrat de planification qu'un modèle moins précis mais pertinent pour la décision \citep{lambert2020objectivemismatch}. L'apprentissage de modèle équivalent en valeur et conscient de la décision \citep{grimm2020valueequivalence, farahmand2017vaml} répond à ce problème en entraînant le modèle directement sur les quantités que le planificateur consomme, ce qui est précisément la philosophie de conception qu'incarne MuZero. </font> <font color="purple">Le troisième est le \emph{biais optimisme-pessimisme} : un planificateur est un consommateur adversarial de son propre modèle, recherchant activement des séquences d'actions au retour prédit élevé, et découvrira donc systématiquement et exploitera les erreurs optimistes du modèle — un effet parfois décrit comme une exploitation du modèle ou, dans le cadre hors ligne, comme le planificateur « hallucinant » de la valeur dans des régions sans support de données. En apprentissage en ligne, un optimisme calibré face à l'incertitude est une caractéristique souhaitable, favorisant l'exploration \citep{curi2020hucrl} ; dans les cadres hors ligne ou critiques pour la sécurité, c'est un handicap, et des méthodes conservatrices telles que MOPO et MOReL soustraient une pénalité d'incertitude aux récompenses imaginées ou terminent les déploiements qui quittent la variété des données \citep{yu2020mopo, kidambi2020morel}. Choisir où un système doit se situer sur ce spectre optimisme-pessimisme n'est pas un détail d'hyperparamètre mais un énoncé sur le degré de confiance que l'agent accorde à son modèle du monde — et, comme nous l'argumentons dans les sections suivantes, la question se généralise mot pour mot du MBRL aux modèles du monde à l'échelle des modèles de fondation déployés dans des environnements physiques.</font>

<!-- source: definition & roadmap 07/2026 | None › Model-Based Reinforcement Learning -->

<font color="crimson">Deux paradigmes représentatifs instancient ces formes d'exploitation du modèle. MuZero~\citep{schrittwieser2020muzero}, à la différence des méthodes MBRL conventionnelles qui approximent explicitement la fonction de transition $\widehat P_\theta$ sur des états physiques, apprend un modèle de dynamique latente équivalent en valeur et effectue une recherche arborescente de Monte-Carlo entièrement au sein de l'espace latent, atteignant des performances surhumaines dans les jeux sans nécessiter d'a priori explicites sur l'environnement.
</font> <font color="green">Par ailleurs, la famille Dreamer~\citep{hafner2019dreamer, hafner2020dreamerv2, hafner2023dreamerv3} adopte un RSSM (modèle d'espace d'état récurrent) pour imaginer des déploiements latents et optimise une politique via l'apprentissage acteur-critique, démontrant une grande efficacité d'échantillonnage en contrôle continu visuel.
</font> <font color="teal">Bien que ces deux paradigmes aient significativement fait progresser le MBRL, leurs modèles du monde restent spécifiques à une tâche et limités à des situations contrôlables, nécessitant un entraînement à partir de zéro pour chaque nouvelle tâche.
Des travaux récents explorent donc des modèles du monde généralistes préentraînés sur des données hétérogènes à grande échelle.
DreamZero~\citep{ye2026dreamzero}, par exemple, construit un World-Actor-Model (WAM) sur la base d'un backbone de diffusion vidéo préentraîné, prédisant conjointement les images vidéo futures et les actions du robot.
Il traite la vidéo comme une représentation dense de la dynamique physique, apprend des compétences diverses sans démonstrations répétitives, et atteint une généralisation en zero-shot des tâches ainsi qu'une adaptation d'incarnation en few-shot dans des situations physiques, tout en maintenant un contrôle en boucle fermée en temps réel à 7 Hz.
Cette ligne de travaux étend le MBRL de l'apprentissage de modèle spécifique à un environnement vers des modèles du monde généralistes préentraînés, positionnant le modèle du monde non plus simplement comme un proxy pour l'amélioration de la politique, mais comme une fondation encapsulant de larges a priori physiques.</font>

<!-- source: definition & roadmap 07/2026 | None › Model-Based Reinforcement Learning -->

Un obstacle fondamental au déploiement des méthodes MBRL dans des systèmes incarnés du monde réel est l'écart sim2real, c'est-à-dire l'écart entre la dynamique apprise par $\widehat P_\theta$ et la dynamique physique véritable $P^\star$ de l'environnement cible.
<font color="purple">En MBRL, cet écart se manifeste à deux niveaux : (i) le \textit{biais de modèle}, dû à un apprentissage imparfait de $\widehat P_\theta$, qui introduit des erreurs de prédiction systématiques même au sein de la distribution d'entraînement ; et (ii) le \textit{décalage de distribution}, où les états visités par la politique $\pi_\phi$ au déploiement divergent de ceux rencontrés lors de l'entraînement du modèle, amenant le modèle appris à extrapoler de manière peu fiable~\citep{janner2019mbpo,ross2011dagger}.</font>
Nous pouvons formuler ce problème sous l'angle de l'écart de modèle et du déploiement de la politique.

<!-- source: definition & roadmap 07/2026 | None › Model-Based Reinforcement Learning -->

Nous résumons les approches visant à réduire cet écart comme consistant à améliorer la fidélité pendant l'exploitation du modèle ou la robustesse pendant l'exécution de la politique.
DreamZero~\citep{ye2026dreamzero} adopte l'approche la plus directe face à ce problème. En construisant le modèle du monde sur la base d'un backbone de diffusion vidéo préentraîné sur des données vidéo du monde réel à grande échelle, l'a priori de dynamique de DreamZero est ancré dans des observations physiques authentiques plutôt que simulées.
Cependant, DreamZero ne résout pas réellement le décalage covariant et l'erreur cumulative d'un point de vue théorique, mais celui-ci a été atténué par des moyens techniques.
Toutefois, ce paradigme présente également ses propres limites sous certains aspects :

1) une charge de calcul supplémentaire pendant le pré-entraînement, bien qu'elle reste largement inférieure aux fréquences de contrôle élevées requises pour les tâches de manipulation dynamique ou dextre ; 2) une forte dépendance aux données au niveau de l'incarnation, puisqu'il repose sur l'apprentissage à partir de données du monde réel complètes ; 3) la qualité de la prédiction d'action est fondamentalement liée à la qualité de la génération vidéo ; 4) le cadre actuel ne prend pas en charge l'entraînement conjoint multi-incarnation, ce qui limite la scalabilité de sa généralisation inter-incarnations.

<!-- source: definition & roadmap 07/2026 | None › Model-Based Reinforcement Learning -->

<font color="magenta">Parce que les agents MBRL possèdent un modèle prédictif explicite, ils admettent également une réponse de principe au problème de l'exploration : rechercher l'expérience là où le modèle se trompe. L'exploration guidée par la curiosité opérationnalise cette idée en convertissant l'erreur ou l'incertitude du modèle en une \emph{récompense intrinsèque}. Les méthodes fondées sur l'erreur de prédiction, telles que le module de curiosité intrinsèque, récompensent l'agent proportionnellement à sa surprise du modèle direct dans un espace de caractéristiques appris \citep{pathak2017curiosity}, tandis que la distillation de réseau aléatoire fournit un proxy robuste pour la nouveauté d'état \citep{burda2019rnd}. Les formulations théorico-informationnelles refondent l'exploration comme un apprentissage actif de la dynamique, récompensant le gain d'information espéré sur les paramètres du modèle \citep{houthooft2016vime}, et Plan2Explore montre qu'un agent peut utiliser son modèle du monde pour \emph{planifier d'être surpris}, en recherchant des états où un ensemble de modèles de dynamique latente est en désaccord, apprenant ainsi un modèle du monde agnostique à la tâche qui se transfère en zero-shot à des récompenses en aval \citep{sekar2020plan2explore}. Les récompenses intrinsèques jouent ainsi un double rôle dans le programme de recherche sur les modèles du monde : elles constituent à la fois un mécanisme d'acquisition des données d'interaction incarnée rares que la vidéo internet ne peut fournir, et un exemple précoce du modèle lui-même orientant la collecte de données qui l'améliore — une boucle d'auto-amélioration à laquelle nous revenons tout au long de cet article.</font>

## 9. Apprentissage hors ligne par lots

**Apprentissage hors ligne par lots**

<!-- source: survey archi 05/2026 -->

<claude>Intertitre « Apprentissage hors ligne par lots » répété trois fois dans cette section (artefact de fusion) — n'en conserver qu'un.</claude>

<font color="orange">Dans les domaines critiques pour la sécurité tels que la santé, la conduite autonome ou le contrôle industriel, l'exploration en ligne peut se révéler prohibitivement coûteuse, dangereuse, ou éthiquement inacceptable. L'apprentissage hors ligne de modèles du monde répond à cette contrainte en entraînant le modèle entièrement à partir de jeux de données statiques préalablement collectés, sans aucune interaction supplémentaire avec l'environnement.</font>

**Apprentissage hors ligne par lots**

<!-- source: survey archi 05/2026 -->

<font color="purple">Le défi central de ce cadre est le \emph{décalage de distribution} : lorsque le modèle du monde appris est utilisé pour simuler des trajectoires au-delà du support des données d'entraînement, les erreurs de prédiction peuvent s'accumuler rapidement, conduisant potentiellement à une « exploitation du modèle » — où la politique découvre des trajectoires à récompense irréaliste qui n'existent que comme artefacts des imprécisions du modèle. MOPO~\cite{yu2020mopo} répond à ce problème en apprenant un ensemble de modèles de dynamique et en pénalisant les estimations de retour de la politique par le désaccord de l'ensemble, fournissant une borne inférieure conservatrice du retour espéré réel.</font> Le Diffusion World Model (DWM)~\cite{ding2025dwm} s'écarte du paradigme autorégressif standard à un pas en prédisant simultanément des états futurs et des récompenses à plusieurs pas via la diffusion, obtenant un gain de performance de 44 % par rapport aux modèles à un pas sur les benchmarks D4RL. Plus récemment, RLVR-World~\cite{chen2025rlvr} a proposé d'utiliser l'apprentissage par renforcement avec récompenses vérifiables comme paradigme de post-entraînement pour les modèles du monde, optimisant directement des métriques de prédiction de transition plutôt que la vraisemblance maximale, démontrant des gains substantiels sur les jeux textuels, la navigation web et la manipulation robotique.

**Apprentissage hors ligne par lots**

<!-- source: survey archi 05/2026 -->

<font color="brown">Un enseignement essentiel de la littérature sur l'apprentissage hors ligne est la tension entre \emph{précision prédictive} et \emph{utilité décisionnelle} : un modèle du monde qui atteint une faible erreur de reconstruction ne fournit pas nécessairement la représentation la plus utile pour l'optimisation de politique~\cite{lambert2020objective}. Les modèles peuvent préserver des détails visuellement riches mais non pertinents pour la tâche, tout en échouant à représenter la structure critique pour la récompense, ce qui contribue à expliquer pourquoi la performance de la politique ne corrèle pas toujours avec la qualité de la prédiction. Cette observation a suscité un intérêt croissant pour les modèles du monde \emph{orientés décision}, explicitement optimisés pour l'utilité de contrôle en aval.</font>

## 10. Modèles de fondation : pré-entraînement puis adaptation

**Paradigme des modèles de fondation : pré-entraînement à grande échelle et adaptation**

<!-- source: survey archi 05/2026 -->

<font color="teal">Inspirée par le succès transformateur du paradigme « pré-entraîner puis affiner » en traitement du langage naturel et en vision par ordinateur, une classe émergente de modèles du monde est entraînée à l'échelle industrielle sur des jeux de données massifs et hétérogènes, avant d'être adaptée à des tâches en aval spécifiques par un affinage léger ou un transfert en zero-shot.</font>

<!-- source: survey archi 05/2026 -->

À l'échelle la plus large, les World Foundation Models (WFM) sont préentraînés sur des données diverses à l'échelle d'internet pour apprendre des a priori de dynamique généraux. Sora, d'OpenAI~\cite{liu2024sora}, a démontré que l'entraînement d'un transformeur de diffusion sur de la vidéo internet à grande échelle produit des séquences visuelles temporellement cohérentes qui semblent respecter certaines contraintes physiques, bien qu'une analyse ultérieure ait révélé que ces propriétés étaient incohérentes~\cite{ding2025understanding, kang2025howfar}. Cosmos, de NVIDIA~\cite{nvidia2025cosmos}, a publié des WFM à poids ouverts de 7 et 14 milliards de paramètres entraînés sur plus de 20 millions d'heures de vidéo du monde réel, son successeur Cosmos-Predict2.5~\cite{nvidia2025cosmos25} passant à l'appariement de flux (flow-matching) avec un post-entraînement par RL sur 200 millions de clips. La série Genie de DeepMind~\cite{bruce2024genie, parkerholder2024genie2, deepmind2026genie3} a progressivement fait passer la génération interactive de modèles du monde d'environnements 2D à des mondes 3D navigables générés à partir de textes, à 720p et 24 images par seconde. Le Large World Model (LWM)~\cite{liu2024lwm} a poursuivi un axe de mise à l'échelle orthogonal en étendant la longueur de contexte à un million de tokens via RingAttention, permettant une modélisation conjointe de longues séquences vidéo et textuelles. <font color="gold">Ces travaux représentent la convergence de la génération vidéo et de la simulation du monde à l'échelle industrielle, bien que la question de savoir si l'échelle seule peut produire une compréhension physique authentique — par opposition à un appariement de motifs sophistiqué — reste activement débattue.</font>

<!-- source: survey archi 05/2026 -->

<font color="teal">En deçà de l'échelle des modèles de fondation, le paradigme « pré-entraîner puis affiner » a été adopté pour améliorer l'efficacité en données de l'entraînement de modèles du monde spécifiques à une tâche. WPT~\cite{xu2025wpt} préentraîne un modèle du monde généraliste sur des données hors ligne sans récompense et non expertes issues de tâches diverses, puis l'affine en ligne pour des tâches en aval spécifiques, démontrant des améliorations nettes de l'efficacité d'échantillonnage — en particulier sur les tâches d'exploration difficile où l'apprentissage à partir de zéro échoue entièrement. MOTO~\cite{rafailov2023moto} explore le pré-entraînement hors ligne suivi d'un affinage en ligne pour l'apprentissage robotique basé sur un modèle, tandis que Vid2Act~\cite{pan2024model} utilise un modèle du monde de type mélange préentraîné sur des trajectoires hors ligne multi-tâches, et transfère de manière adaptative la connaissance de la dynamique vers de nouvelles tâches par distillation sélective de domaine.</font>

<!-- source: survey archi 05/2026 -->

<font color="teal">Une promesse essentielle des modèles du monde préentraînés est leur capacité à transférer des connaissances entre domaines, incarnations et environnements. SimDist~\cite{levy2026simulation} préentraîne les composants du modèle du monde en simulation et n'affine que le modèle de dynamique pour le déploiement en conditions réelles, exploitant la structure modulaire des modèles du monde pour cibler directement l'écart de dynamique simulation-réel. V-JEPA 2-AC~\cite{assran2025vjepa2} atteint une planification robotique en zero-shot sur des robots physiques en utilisant un modèle du monde post-entraîné sur moins de 62 heures de vidéo robotique non étiquetée — sans collecter la moindre donnée dans l'environnement cible ni effectuer d'entraînement spécifique à la tâche. L'initiative Open X-Embodiment~\cite{openxembodiment2024} a démontré que des politiques entraînées sur un mélange de plus d'un million de trajectoires issues de 22 incarnations robotiques atteignent des taux de succès supérieurs de 50 % à ceux de politiques mono-domaine, établissant la viabilité à grande échelle du transfert inter-incarnations.</font>

## 11. Apprentissage supervisé et imitation

**Apprentissage supervisé et par imitation**

<!-- source: survey archi 05/2026 -->

Si les paradigmes d'apprentissage auto-supervisé et par renforcement dominent la littérature sur les modèles du monde, l'apprentissage supervisé et par imitation demeurent importants dans les contextes où des étiquettes de vérité terrain, des démonstrations expertes ou des connaissances structurées a priori sont disponibles.

<!-- source: survey archi 05/2026 -->

En manipulation robotique, les modèles du monde sont fréquemment entraînés sur des démonstrations téléopérées à grande échelle. RT-1~\cite{brohan2023rt1} a entraîné un transformeur passant à l'échelle sur plus de 130 000 épisodes de robots réels couvrant plus de 700 tâches, atteignant un taux de succès de 97 % sur les tâches d'entraînement. Bien que RT-1 et ses successeurs (RT-2~\cite{zitkovich2023rt2}, OpenVLA~\cite{kim2024openvla}) soient principalement présentés comme des politiques vision-langage-action plutôt que comme des modèles du monde explicites, leur paradigme d'entraînement — la prédiction supervisée de la prochaine action à partir de paires observation-action — est structurellement analogue à l'entraînement d'un modèle du monde, et la connaissance implicite de la dynamique qu'ils acquièrent par apprentissage à partir de démonstrations à grande échelle recoupe de plus en plus les capacités des modèles du monde explicites.

<!-- source: survey archi 05/2026 -->

Le langage fournit une forme riche de supervision faible pour l'apprentissage des modèles du monde. GAIA-1~\cite{hu2023gaia1} conditionne conjointement la génération vidéo sur des descriptions textuelles et des entrées de contrôle structurées, le texte servant de signal de supervision spécifiant la composition de la scène et le comportement du véhicule ego. WorldLLM~\cite{levy2025worldllm} induit des hypothèses explicites en langage naturel sur les régularités de transition via une inférence bayésienne sur l'expérience de l'agent, produisant un modèle du monde interprétable guidé par la structure linguistique. Les modèles de dynamique latente conditionnés par le langage tels que Dynalang~\cite{lin2024dynalang} traitent la compréhension du langage elle-même comme émergeant de l'objectif d'apprentissage de la dynamique : le modèle apprend à associer différents types de langage — descriptions, instructions, corrections — à leurs conséquences environnementales par prédiction supervisée.

<!-- source: survey archi 05/2026 -->

Une forme distincte de supervision apparaît lorsque les modèles du monde sont entraînés sur des données générées par des simulateurs physiques dont la dynamique de vérité terrain est connue. Le RL basé sur un modèle informé par la physique~\cite{ramesh2023pimbrl} incorpore des équations physiques connues comme contraintes souples ou strictes au sein de la boucle d'entraînement du modèle du monde. Les potentiels interatomiques d'apprentissage automatique tels que SchNet~\cite{schutt2017schnet} et NequIP~\cite{batzner2022nequip} sont entraînés sur des calculs de mécanique quantique pour approximer des surfaces d'énergie potentielle, fonctionnant comme des modèles du monde supervisés de la dynamique moléculaire. Ces approches échangent la généralité contre la précision physique et sont discutées plus en détail en section 4.5.

## 12. Paradigmes hybrides et multi-étapes

**Paradigmes d'apprentissage hybrides et multi-étapes**

<!-- source: survey archi 05/2026 -->

En pratique, les systèmes de modèles du monde les plus performants combinent de plus en plus plusieurs paradigmes d'apprentissage au sein de pipelines d'entraînement en étapes ou entrelacés, tirant parti des forces complémentaires de chaque approche.

<!-- source: survey archi 05/2026 -->

<font color="teal">Le paradigme hybride le plus marquant combine le pré-entraînement auto-supervisé à grande échelle avec l'apprentissage par renforcement spécifique à une tâche. V-JEPA 2~\cite{assran2025vjepa2} illustre cette approche en deux étapes : un encodeur vidéo de 1,2 milliard de paramètres est d'abord préentraîné par prédiction masquée auto-supervisée sur plus d'un million d'heures de vidéo internet, puis post-entraîné en modèle du monde conditionné par l'action (V-JEPA 2-AC) à l'aide d'une petite quantité de données d'interaction robotique, la planification étant effectuée via la méthode d'entropie croisée au déploiement. Cosmos-Predict2.5~\cite{nvidia2025cosmos25} suit une trajectoire similaire : un pré-entraînement auto-supervisé par appariement de flux est suivi d'un post-entraînement par RL destiné à améliorer la plausibilité physique. La conclusion de DreamerV3~\cite{hafner2025mastering}, selon laquelle les représentations des modèles du monde sont façonnées principalement par des objectifs de reconstruction non supervisés, renforce la motivation de ce paradigme, suggérant qu'un pré-entraînement agnostique à la tâche sur de vastes jeux de données non étiquetées pourrait réduire substantiellement le budget d'interaction en ligne requis pour l'apprentissage de tâches en aval.</font>

<!-- source: survey archi 05/2026 -->

<font color="teal">Une approche hybride complémentaire exploite l'abondance des données disponibles en simulation pour préentraîner des modèles du monde ensuite adaptés au monde réel. DayDreamer~\cite{wu2023daydreamer} a démontré que les modèles du monde peuvent combler cet écart en apprenant directement sur des robots physiques, tandis que SimDist~\cite{levy2026simulation} adopte une approche modulaire — en préentraînant l'ensemble de la pile du modèle du monde en simulation et en n'affinant que la composante de dynamique à l'aide d'un petit nombre de trajectoires du monde réel. Les stratégies de randomisation de domaine et d'apprentissage par curriculum soutiennent également ce paradigme en entraînant les modèles du monde sur des distributions d'environnements simulés pour améliorer la robustesse à la variation du monde réel.</font>

<!-- source: survey archi 05/2026 -->

Le Unified World Model (UWM)~\cite{he2025uwm} couple la prédiction vidéo et la génération d'action via un processus de diffusion partagé lors du pré-entraînement sur des jeux de données robotiques à grande échelle, permettant à un modèle unique de servir simultanément de simulateur et de politique. Motus~\cite{motus2024} introduit une architecture Mixture-of-Transformer intégrant trois experts spécialisés — pour la compréhension, la génération vidéo et la prédiction d'action — avec un basculement de mode flexible au sein d'un cadre unique, obtenant une amélioration absolue de 45 % par rapport aux références vision-langage-action antérieures, en préentraînant sur de la vidéo non étiquetée avec le flux optique comme proxy d'action agnostique à l'incarnation.

## 13. Apprentissage informé par la physique et contraintes

<!-- source: definition & roadmap 07/2026 | None › Physics-Informed and Constrained Learning -->

Une direction complémentaire à l'apprentissage de modèles du monde purement fondé sur les données consiste à injecter directement une structure physique dans le processus d'apprentissage. La motivation est simple : un modèle du monde ne devrait pas seulement générer des futurs qui paraissent plausibles, mais aussi produire des trajectoires qui restent admissibles au regard des régularités du monde physique. Ces régularités peuvent prendre la forme d'équations différentielles, de lois de conservation, de conditions aux limites, de permanence des objets, de contraintes de contact, d'exigences de stabilité, ou de mécanismes causaux connus. En ce sens, l'apprentissage informé par la physique fournit un biais inductif qui restreint l'espace des hypothèses de tous les futurs statistiquement probables aux futurs qui sont également physiquement cohérents.

<!-- source: definition & roadmap 07/2026 | None › Physics-Informed and Constrained Learning -->

La manière dont la connaissance physique est intégrée varie toutefois considérablement dans la force de la garantie qu'elle offre et dans l'endroit où elle agit au sein du modèle. Il est utile d'organiser les approches existantes selon trois niveaux d'engagement structurel croissant : les \emph{contraintes fondées sur la pénalité (souples)}, qui encodent la physique sous forme de termes de perte auxiliaires ; les \emph{contraintes fondées sur l'architecture (strictes)}, qui intègrent les lois physiques dans le modèle de sorte qu'elles soient satisfaites par construction ; et les \emph{schémas hybrides physique-apprentissage}, qui couplent un moteur physique différentiable avec des composantes apprises dans une conception à double voie. Ces niveaux échangent la flexibilité contre la fiabilité et le comportement hors distribution du modèle résultant.

<!-- source: definition & roadmap 07/2026 | None › Physics-Informed and Constrained Learning -->

L'approche la plus courante et la moins intrusive consiste à ajouter des résidus physiques sous forme de pénalités souples dans l'objectif d'entraînement. Un objectif générique peut s'écrire
$$
    \mathcal{L}
    =
    \mathcal{L}_{\mathrm{pred}}
    +
    \lambda_{\mathrm{dyn}}\mathcal{L}_{\mathrm{dyn}}
    +
    \lambda_{\mathrm{cons}}\mathcal{L}_{\mathrm{cons}}
    +
    \lambda_{\mathrm{bc}}\mathcal{L}_{\mathrm{bc}},
$$
où $\mathcal{L}_{\mathrm{pred}}$ mesure l'erreur de prédiction dans l'espace des observations ou l'espace latent, $\mathcal{L}_{\mathrm{dyn}}$ pénalise les violations des équations de mouvement connues, $\mathcal{L}_{\mathrm{cons}}$ impose des propriétés de conservation ou d'invariance, et $\mathcal{L}_{\mathrm{bc}}$ encode des contraintes de bord, de contact ou de faisabilité. Cette formulation est étroitement liée aux réseaux de neurones informés par la physique (PINN), qui utilisent des approximateurs de fonction neuronaux tout en les régularisant par des équations gouvernantes et des conditions aux limites \citep{raissi2019physics}. Pour les modèles du monde, la même idée peut s'appliquer non seulement à des champs physiques continus, mais aussi à des transitions d'état latent, des trajectoires d'objets, des événements de contact, et des déploiements conditionnés par l'action. Comme la physique n'entre que sous forme de pénalité pondérée, la contrainte est \emph{encouragée plutôt que garantie} : l'approche est facile à greffer sur presque n'importe quel modèle différentiable, mais les trajectoires prédites peuvent encore violer la loi visée lorsque la pénalité est surpassée par le terme de données, et l'équilibrage des multiplicateurs $\lambda$ entre des termes d'échelle et de rigidité d'optimisation différentes est souvent délicat.

<!-- source: definition & roadmap 07/2026 | None › Physics-Informed and Constrained Learning -->

Une forme plus forte d'apprentissage informé par la physique intègre la contrainte dans l'architecture plutôt que de la traiter comme une perte additionnelle, de sorte que la loi physique pertinente soit satisfaite par construction. Plutôt que de prédire directement des mises à jour d'état arbitraires, les réseaux de neurones hamiltoniens, lagrangiens, symplectiques et port-hamiltoniens paramétrisent une fonction d'énergie ou un système dynamique structuré à partir duquel la loi d'évolution est dérivée, conservant l'énergie ou la quantité de mouvement exactement, à l'erreur d'intégration près \citep{greydanus2019hamiltonian,cranmer2020lagrangian,zhong2020symplectic}. De même, les simulateurs neuronaux fondés sur des graphes encodent la localité et l'interaction relationnelle en représentant particules, maillages ou objets comme des nœuds et les interactions physiques comme des arêtes, intégrant l'invariance par translation et la structure d'interaction par paires dans le modèle \citep{sanchez2020learning,pfaff2021learning}. De telles conceptions préservant la structure sont particulièrement attractives pour la prédiction à long horizon, car les erreurs de déploiement non contraintes s'accumulent souvent en états physiquement impossibles, tandis que l'encodage de l'invariant dans l'architecture réduit la dérive d'énergie, améliore la stabilité, et généralise mieux hors de la distribution d'entraînement. Le coût en est une flexibilité réduite et une dépendance à la justesse de la structure supposée : une contrainte stricte qui encode le mauvais invariant biaise le modèle d'une manière qu'une pénalité souple ne ferait pas.

<!-- source: definition & roadmap 07/2026 | None › Physics-Informed and Constrained Learning -->

Une troisième voie couple un moteur physique explicite et différentiable avec des composantes neuronales apprises dans une conception à double voie, combinant les forces des deux niveaux précédents. Lorsqu'une partie de la physique sous-jacente est connue, un simulateur différentiable peut être intégré au sein du modèle du monde, permettant aux gradients de circuler à travers les mises à jour d'état physique, la gestion des collisions, ou les objectifs de contrôle \citep{de2018end,hu2020difftaichi,freeman2021brax}. L'apprentissage se concentre alors sur les composantes inconnues ou difficiles à modéliser, telles que le frottement, la traînée, le délai d'actionneur, le contact déformable, les paramètres matériels, ou les écarts résiduels sim-to-real. Cette stratégie hybride est souvent plus efficace en données que d'apprendre l'intégralité de la fonction de transition à partir de zéro : la physique analytique fournit une charpente causale grossière, tandis que les composantes neuronales compensent les inadéquations du modèle. Dans les contextes incarnés, cela est particulièrement précieux car les données d'interaction réelle sont coûteuses, et de petites erreurs de prédiction peuvent conduire à des plans dangereux ou inefficaces. La frontière entre ce niveau et le précédent n'est pas nette en pratique : des composantes fondées sur l'architecture telles que les réseaux lagrangiens et hamiltoniens peuvent servir de voie analytique dans un schéma hybride lorsque la forme gouvernante n'est que partiellement connue.

<!-- source: definition & roadmap 07/2026 | None › Physics-Informed and Constrained Learning -->

Pour les modèles du monde visuels, cependant, la physique est informative mais incomplète. Les observations brutes contiennent l'éclairage, la texture, l'occlusion, le mouvement de caméra, l'encombrement de l'arrière-plan et d'autres facteurs qui ne font pas eux-mêmes partie de l'état physique. Par conséquent, imposer directement des lois physiques dans l'espace des pixels peut se révéler trop restrictif. Une stratégie plus adaptée consiste à contraindre les variables latentes correspondant aux quantités physiques pertinentes pour l'action, tout en laissant les facteurs liés à l'apparence à des composantes génératives plus flexibles. Cela suggère une conception en couches : des modules de perception infèrent des états physiques compacts à partir des observations ; des modules de dynamique structurée font évoluer ces états sous l'effet des actions ; des modules de rendu ou de décodage projettent les états latents de retour vers des observations. Dans une telle conception, les contraintes physiques n'ont pas besoin d'expliquer chaque pixel, mais elles doivent discipliner les variables qui comptent pour la prédiction, l'intervention et le contrôle.

<!-- source: definition & roadmap 07/2026 | None › Physics-Informed and Constrained Learning -->

<font color="brown">L'apprentissage informé par la physique clarifie également une distinction importante entre plausibilité visuelle et correction physique. Un modèle de prédiction vidéo peut générer des images d'apparence réaliste tout en violant la permanence des objets, la quantité de mouvement, la cohérence des contacts, ou la réponse causale à l'action. Inversement, un modèle structuré physiquement peut prédire des trajectoires grossières avec précision tout en produisant des images visuellement imparfaites. Cette tension est centrale pour les modèles du monde : le modèle doit finalement soutenir à la fois une perception haute fidélité et un raisonnement physique fiable. L'apprentissage informé par la physique et contraint doit donc être vu non pas comme un remplacement de l'auto-supervision à grande échelle, mais comme un mécanisme permettant d'aligner les représentations apprises avec les invariants nécessaires à la planification et à la prise de décision.</font>

<!-- source: definition & roadmap 07/2026 | None › Physics-Informed and Constrained Learning -->

Malgré ses promesses, l'apprentissage contraint introduit ses propres difficultés. Les pénalités physiques souples peuvent être difficiles à équilibrer face aux pertes de reconstruction ou de prédiction, en particulier lorsque différents termes présentent des échelles ou des rigidités d'optimisation différentes. Les contraintes strictes peuvent améliorer l'extrapolation lorsque la structure supposée est correcte, mais peuvent biaiser le modèle lorsque l'a priori est incomplet ou erroné. Les systèmes du monde réel impliquent également une observabilité partielle, des contacts discontinus, des propriétés matérielles cachées, de la dissipation, un couplage multi-physique, et des perturbations externes stochastiques, autant d'éléments qui rendent difficile une modélisation physique exacte. En conséquence, la question centrale n'est pas de savoir si les modèles du monde devraient être purement fondés sur les données ou sur la physique, mais où et avec quelle force la structure physique devrait être imposée.

<!-- source: definition & roadmap 07/2026 | None › Physics-Informed and Constrained Learning -->

La voie la plus plausible pour l'avenir est donc hybride. Les futurs modèles du monde apprendront vraisemblablement à partir de larges données observationnelles et interactionnelles, tout en imposant sélectivement des contraintes physiques aux niveaux où la fiabilité importe le plus : la représentation d'état latent, la dynamique de transition, l'intégration numérique, la gestion des contacts, et la faisabilité au moment de la planification. Dans cette perspective, l'apprentissage informé par la physique n'est pas simplement une technique d'amélioration de la précision prédictive ; c'est un moyen de rendre les modèles du monde plus causaux, plus interprétables, et plus dignes de confiance lorsqu'ils sont déployés dans le monde physique.

## 14. Implémentation, architecture et efficacité au déploiement

<!-- ===== AJOUT depuis agentic 06/2026 (sections 3+) — À TRADUIRE ===== -->

<!-- source: agentic 06/2026 | Architectural and Computational Considerations -->

La valeur d'une taxonomie ne réside pas dans la catégorisation pour elle-même, mais dans le fait de guider la conception des systèmes. Cette section décompose les implémentations de modèles du monde selon trois axes architecturaux, à savoir la représentation, la dynamique et l'interface de contrôle (section~\ref{subsec:impl_blocks}), et examine comment le régime de loi gouvernante contraint les combinaisons viables en pratique (section~\ref{subsec:impl_tradeoffs}). Le déploiement de ces systèmes soulève des défis d'ingénierie transversaux : le choix entre entraînement de bout en bout et modulaire, les compromis latence-calcul, le transfert sim-to-real, et la dégradation gracieuse sous incertitude du modèle. Un modèle du monde appris amortit le coût de la simulation dans un graphe de calcul fixe au moment de l'inférence, tandis que la simulation explicite passe typiquement à l'échelle plus directement avec le nombre d'entités, d'interactions, de pas de résolution, ou la longueur de l'horizon. Cela ne signifie pas que l'inférence neuronale est littéralement en $O(1)$ pour chaque variable pertinente : son coût dépend toujours de la taille du modèle, de la résolution d'entrée, de la longueur de séquence, et de la profondeur de déploiement. L'avantage pratique est plutôt que la dynamique apprise peut offrir des approximations à coût quasi constant vis-à-vis des aspects de complexité du système qui exigeraient sinon une simulation explicite de plus en plus coûteuse. Les techniques d'efficacité comptent ici non pas comme des astuces génériques de déploiement, mais parce qu'elles interagissent différemment avec les trois niveaux de capacité. Pour les systèmes L1, la compression se négocie principalement contre la précision prédictive à un pas. Pour les systèmes L2, l'efficacité mémoire et de déploiement affecte directement l'horizon atteignable, la ramification contrefactuelle, et donc la cohérence à long horizon. Pour les systèmes L3, les mêmes choix d'efficacité déterminent si les boucles de mise à jour conditionnées par régression sont assez peu coûteuses pour s'exécuter en continu en déploiement. La mise à l'échelle exige en outre des techniques d'efficacité : la distillation en peu d'étapes pour la planification en temps réel, la quantification et l'élagage sous la contrainte que les erreurs cumulatives amplifient même une dégradation mineure à chaque pas, et la compression du cache KV pour la dynamique autorégressive à long horizon. Un traitement plus détaillé de ces sujets de déploiement et d'efficacité, ainsi que des mesures concrètes de calcul et de latence, figure en annexe~\ref{app:impl_extended}.

<!-- source: agentic 06/2026 | Architectural and Computational Considerations › Architectural building blocks: representation, dynamics, and control -->

Construire un système de modèle du monde nécessite de choisir des composants selon trois axes (tableau~\ref{tab:arch_building_blocks}).
Chaque choix comporte des compromis distincts qui déterminent le niveau de capacité (L1/L2/L3) que le système résultant peut atteindre, et dans quel régime de loi gouvernante la conception résultante sera la plus efficace le long de chacun de ces trois axes.

<!-- source: agentic 06/2026 | Architectural and Computational Considerations › Architectural building blocks: representation, dynamics, and control -->

À une extrémité, les états symboliques ou programmatiques (par exemple, VirtualHome~\citep{puig2018virtualhome}) offrent une interprétabilité et permettent l'application de contraintes strictes, mais exigent une ingénierie manuelle lourde et ne couvrent que des espaces d'états prédéfinis ; ils sont mieux évalués par le taux de succès et la couverture des branches d'erreur.
À l'autre extrémité, les représentations latentes continues, telles que le RSSM dans DreamerV3~\citep{hafner2023dreamerv3} et V-JEPA2~\citep{meta2025vjepa2}, traitent des entrées multimodales de haute dimension avec relativement peu de structure conçue à la main. Leur faiblesse est que, sur de longs horizons, elles sont plus sujettes à la dérive sémantique et à l'aliasing d'état, rendant la cohérence à long horizon et l'attribution des défaillances particulièrement importantes pour l'évaluation.
VL-JEPA~\cite{chen2025vl} développe une architecture prédictive à plongement conjoint qui prédit les plongements continus du texte cible.
VLog~\citep{lin2025vlog} utilise un token apprenable pour récupérer la narration, qui sert ensuite de vocabulaire centré sur la vidéo dans la compréhension de vidéos longues.
Entre ces deux extrêmes se trouvent les représentations 3D structurées, notamment les modèles d'occupation tels que RoboOccWorld~\citep{zhang2025robooccworld} et les modèles de flux de points tels que PointWorld~\citep{huang2026pointworld}. Ils sont attrayants car ils s'accordent plus naturellement avec les contraintes physiques, mais cet avantage s'accompagne souvent de goulots d'étranglement en reconstruction et en calcul. En conséquence, l'atteignabilité et la stabilité deviennent particulièrement importantes dans l'évaluation.
Enfin, les représentations à tokens discrets (par exemple, les codebooks VQ-VAE dans IRIS~\citep{micheli2023iris}) imposent la compositionnalité et permettent un entraînement par vraisemblance exacte via l'entropie croisée, faisant le pont entre perception continue et dynamique autorégressive.

<!-- source: agentic 06/2026 | Architectural and Computational Considerations › Architectural building blocks: representation, dynamics, and control -->

La dynamique latente stochastique, illustrée par DreamerV3~\citep{hafner2023dreamerv3}, exprime l'incertitude et la multimodalité via un entraînement ELBO rigoureux et des déploiements sensibles à l'incertitude, mais peut se dégrader ou devenir mal calibrée sur de longs horizons.
Là où la modélisation de l'incertitude est moins critique, la dynamique déterministe consciente de la valeur (MuZero~\citep{schrittwieser2020muzero}, TD-MPC2~\citep{hansen2024tdmpc2}) optimise directement la fonction de transition pour la prédiction de valeur en aval, échangeant la flexibilité générative contre une intégration plus étroite avec l'objectif de contrôle.
La dynamique à tokens autorégressive (iVideoGPT~\citep{wu2024ivideogpt}, LWM~\citep{liu2024lwm}) offre une interface unifiée et scalable qui gère plusieurs modalités via un vocabulaire partagé, bien que la cohérence logique à long horizon reste un point faible.
La dynamique fondée sur la diffusion (la lignée technique de Sora~\citep{brooks2024sora}, DIAMOND~\citep{alonso2024diamond}, et des environnements interactifs tels que Genie~\citep{deepmind2025genie3}) fournit des transitions photoréalistes au niveau de l'observation, mais le débruitage multi-étapes qu'elle exige à l'inférence s'accompagne souvent d'une faible contrôlabilité de l'action.

<!-- source: agentic 06/2026 | Architectural and Computational Considerations › Architectural building blocks: representation, dynamics, and control -->

<font color="crimson">Les approches en ligne de type MPC (TD-MPC2~\citep{hansen2024tdmpc2}, PETS~\citep{chua2018pets}) replanifient à chaque étape en utilisant des déploiements à court horizon, offrant une correction rapide au prix d'une pression de calcul et de latence.</font>
<font color="crimson">La recherche arborescente et l'expansion (MuZero~\citep{schrittwieser2020muzero}, EfficientZero~\citep{ye2021efficientzero}) permettent la ramification contrefactuelle et l'anticipation systématique, bien qu'elles amplifient les erreurs du modèle et puissent exploiter des failles de benchmark.</font>
<font color="green">Plutôt que de planifier dans l'environnement, l'optimisation de politique par déploiement imaginé (la famille Dreamer~\citep{hafner2019dreamer,hafner2020dreamerv2,hafner2023dreamerv3}) entraîne une politique entièrement sur des trajectoires générées par le modèle, évitant l'interaction réelle pendant l'apprentissage mais exigeant une dynamique très précise.</font>
Du côté du déploiement, la distillation de politique hors ligne (GR-1~\citep{wu2023gr1}) permet une inférence peu coûteuse mais reste fragile face au décalage de distribution, motivant des tests de robustesse hors distribution.
Selon une stratégie tout à fait distincte, les interfaces d'environnement rejouable (OSWorld~\citep{xie2024osworld}, SWE-agent~\citep{yang2024sweagent}) contournent entièrement la dynamique apprise, en traitant l'environnement réel comme son propre simulateur et en s'appuyant sur l'analyse de reçus et l'empreinte d'état. Plus largement, une partie du problème de contrôle consiste à décider quand invoquer un calcul externe, plutôt que de traiter l'usage d'outils comme obligatoire ou absent ; les travaux sur l'intégration adaptative d'outils fournissent un exemple utile, côté planificateur, de cette distinction \citep{wang2025tocode}.

<!-- source: agentic 06/2026 | Architectural and Computational Considerations › Architectural building blocks: representation, dynamics, and control -->

\input{tables/arch_building_blocks}

<!-- source: agentic 06/2026 | Architectural and Computational Considerations › Implementation Roadmap -->

Le tableau~\ref{tab:impl_roadmap} condense les orientations architecturales des sections précédentes en une feuille de route concise organisée par niveau de capacité et régime de loi gouvernante. Pour chaque cellule, nous indiquons le format de représentation qui préserve le mieux la structure critique pour le planificateur du régime, la classe de modèle de dynamique la plus tractable à ce niveau de capacité, et le principal goulot d'étranglement d'ingénierie devant être résolu pour atteindre le niveau suivant.

<!-- source: agentic 06/2026 | Architectural and Computational Considerations › Implementation Roadmap -->

\input{tables/impl_roadmap}

<!-- source: agentic 06/2026 | Architectural and Computational Considerations › Implementation Roadmap -->

Trois principes d'ingénierie transversaux valent pour toutes les cellules. Premièrement, \textbf{séparer ce qui est appris de ce qui est imposé} : les couches de contrainte stricte (vérificateurs de collision, validateurs de machine à états, portes de régression) devraient être appliquées au moment de l'inférence plutôt qu'apprises implicitement, car l'imposition souple via la perte d'entraînement ne peut garantir des déploiements sans violation. Deuxièmement, \textbf{instrumenter avant d'itérer} : l'infrastructure de journalisation, de rejeu et d'attribution des défaillances devrait être intégrée au système dès le départ ; sans rejeu, la révision L3 devient anecdotique et ingouvernable. Troisièmement, \textbf{adapter la représentation à la requête du planificateur} : une représentation qui paraît réaliste mais n'expose pas les variables dont le planificateur a besoin (espace libre, état de permission, taux de réaction) est pire qu'une représentation de moindre fidélité qui les expose.

<!-- source: agentic 06/2026 | Implementation Details and Efficient Deployment -->

Cette annexe fournit des détails étendus sur les considérations pratiques d'implémentation et les techniques d'efficacité pour les systèmes de modèles du monde, résumées dans la section~\ref{sec:implementation} du texte principal.

<!-- source: agentic 06/2026 | Implementation Details and Efficient Deployment -->

Deux stratégies dominantes existent. Dans l'entraînement \emph{de bout en bout}, l'encodeur, le modèle de dynamique, le décodeur et la politique sont optimisés conjointement via un objectif partagé tel que l'ELBO ou une perte consciente de la valeur. La famille Dreamer~\citep{hafner2019dreamer,hafner2020dreamerv2,hafner2023dreamerv3} illustre cette approche : tous les composants partagent les gradients, et la politique s'entraîne entièrement sur des déploiements latents imaginés. Dans l'entraînement \emph{modulaire}, chaque composant est entraîné avec son propre objectif : la représentation via l'apprentissage auto-supervisé~\citep{assran2023ijepa,bardes2024vjepa}, la dynamique via des objectifs de vraisemblance maximale ou de type TD~\citep{hansen2024tdmpc2}, et la politique via le RL sans modèle ou la planification. Des cadres de développement modulaires tels que StarVLA~\citep{starvla2025} fournissent des bases de code composables pour une ablation et une recombinaison systématiques. L'approche de bout en bout évite la propagation d'erreurs entre modules mais reste instable ; les systèmes modulaires sont plus faciles à déboguer mais risquent des interfaces mal appariées.

<!-- source: agentic 06/2026 | Implementation Details and Efficient Deployment -->

Le choix du modèle de dynamique est étroitement contraint par le budget de latence. Les boucles de contrôle robotique nécessitent typiquement une inférence inférieure à 100 ms, favorisant une dynamique latente légère avec des déploiements à court horizon~\citep{hansen2024tdmpc2,chua2018pets}. Les agents web et OS tolèrent une latence à l'échelle de la seconde, permettant une recherche plus riche et l'analyse de reçus. Les modèles génératifs haute fidélité~\citep{brooks2024sora} peuvent prendre plusieurs minutes par déploiement, les limitant à la planification hors ligne ou à l'augmentation de données.

<!-- source: agentic 06/2026 | Implementation Details and Efficient Deployment -->

Un argument computationnel fondamental sous-tend l'attrait des modèles du monde appris : une passe avant neuronale s'exécute en temps $O(1)$ par rapport à la complexité du système simulé, tandis que la simulation explicite passe à l'échelle en $O(N)$ ou pire. Cette propriété $O(1)$ rend les modèles du monde appris viables là où la simulation analytique est intraitable. Cependant, le facteur constant compte : la passe avant en $O(1)$ d'un grand modèle de diffusion peut encore être plus lente que la passe en $O(N)$ d'un moteur physique léger pour un $N$ modeste.

<!-- source: agentic 06/2026 | Implementation Details and Efficient Deployment -->

Les lois d'échelle des modèles du monde diffèrent également de celles des LLM. Les modèles de langage doivent mémoriser une vaste connaissance factuelle ; les modèles du monde ont principalement besoin de capturer la structure de transition. Ce rôle de filtrage et d'organisation suggère un régime d'optimalité de calcul différent, où les biais inductifs architecturaux peuvent se substituer au nombre brut de paramètres plus efficacement qu'en modélisation du langage.

<!-- source: agentic 06/2026 | Implementation Details and Efficient Deployment -->

Pour les systèmes incarnés, l'écart entre le simulateur d'entraînement et le déploiement demeure un goulot d'étranglement persistant. La randomisation de domaine~\citep{tobin2017domain} reste largement utilisée. Les stratégies complémentaires incluent l'identification de système, le transfert progressif, et les approches hybrides combinant une dynamique résiduelle apprise avec des modèles physiques analytiques~\citep{nagabandi2018mbmf}. <font color="green">DayDreamer~\citep{wu2023daydreamer} a démontré que l'imagination latente de type Dreamer peut se transférer à des robots physiques en s'entraînant sur des données de capteurs réels collectées en ligne, contournant l'écart sim-to-real au prix d'une collecte de données plus lente.</font>

<!-- source: agentic 06/2026 | Implementation Details and Efficient Deployment -->

<font color="purple">Un système de modèle du monde mature doit se dégrader gracieusement lorsque les prédictions deviennent peu fiables. MBPO~\citep{janner2019mbpo} limite la longueur du déploiement au régime précis, en recourant aux données réelles pour les horizons plus longs. Le désaccord d'ensemble~\citep{chua2018pets} fournit un signal pratique pour déclencher une replanification ou une escalade. Dans les environnements logiciels, l'analyse de reçus joue un rôle analogue : des codes d'erreur inattendus signalent que des hypothèses peuvent être violées~\citep{xie2024osworld}.</font>

<!-- source: agentic 06/2026 | Implementation Details and Efficient Deployment › Few-Step Distillation for Generative Dynamics -->

Les systèmes de simulation générative pilotés par des cadres de diffusion et d'appariement de flux sont intrinsèquement contraints par la latence du débruitage itératif. Les premiers efforts se sont appuyés sur des solveurs d'EDO d'ordre élevé sans entraînement~\citep{dockhorn2022genie, karras2022elucidating, lu2022dpm, lu2025dpm, sabour2024align, zhang2022fast, zheng2023dpm}, mais ceux-ci restent en deçà des budgets à faible nombre d'étapes exigés par les agents en temps réel.

<!-- source: agentic 06/2026 | Implementation Details and Efficient Deployment › Few-Step Distillation for Generative Dynamics -->

Le domaine s'est réorienté vers la distillation en peu d'étapes. Les premières stratégies se concentraient sur la compression des trajectoires du modèle enseignant en faisant correspondre des transitions à grand pas~\citep{lipman2022flow, salimans2022progressive}. Ce paradigme a évolué vers les Consistency Models~\citep{geng2024consistency, lu2024simplifying, song2023improved, song2023consistency}, qui contournent l'échantillonnage itératif en apprenant une correspondance directe de type PF-ODE entre le bruit et les données propres. Les modèles flow-map généralisent davantage ce concept~\citep{boffi2024flow, frans2024one, heek2024multistep, kim2023consistency, wang2024phased}. Des initiatives de pré-entraînement à grande échelle telles que TiM~\citep{wang2025transition} et MeanFlow~\citep{geng2025mean} ont fait progresser cette approche. La distillation par appariement de distribution~\citep{salimans2024multistep, sauer2024adversarial,sauer2024fast,yin2024improved,zhou2024score, yu2025self} est apparue comme une alternative, alignant la sortie de l'élève sur les distributions cibles de l'enseignant.

<!-- source: agentic 06/2026 | Implementation Details and Efficient Deployment › Few-Step Distillation for Generative Dynamics -->

Les modèles du monde s'appuyant de plus en plus sur la génération vidéo, les coûts d'échantillonnage plus élevés de la vidéo ont catalysé l'adaptation des techniques d'accélération au domaine spatio-temporel~\citep{ding2025dollar, lin2025diffusion, zhang2024sf,zheng2025large, nie2026transition, yang2025longlive}. Ces gains d'efficacité transforment les modèles génératifs de simulateurs hors ligne en moteurs viables pour la planification en temps réel.

<!-- source: agentic 06/2026 | Implementation Details and Efficient Deployment › Model Compression: Quantization and Pruning -->

La quantification transforme des poids de haute précision en formats de plus faible précision binaire (par exemple, INT/FP-8, INT/FP-4), réduisant les contraintes de bande passante mémoire. L'élagage supprime les paramètres ou blocs structurels redondants. Pour la modélisation du monde, le principal défi est d'atténuer les erreurs cumulatives : même un bruit de quantification mineur ou une dégradation induite par l'élagage peut conduire à une dérive sémantique sévère sur de longs horizons.

<!-- source: agentic 06/2026 | Implementation Details and Efficient Deployment › Model Compression: Quantization and Pruning -->

Les techniques fondatrices de quantification post-entraînement~\citep{frantar2023gptq,lin2024awq,huang2026mcsharp,huang2024billm,dettmers2022gpt3int8,huang2024mixture} ont été conçues pour les LLM mais s'appliquent à la fois aux transformeurs LLM et aux DiT. SqueezeLLM~\citep{kim2024squeezellm} combine une quantification non uniforme fondée sur la sensibilité avec une décomposition dense-et-parcimonieuse pour une précision ultra-faible. Côté service, une gestion efficace de la mémoire est tout aussi critique : vLLM~\citep{kwon2023vllm} a introduit PagedAttention, qui gère la mémoire du cache KV en blocs non contigus, analogue à la mémoire virtuelle des systèmes d'exploitation, améliorant considérablement le débit pour l'inférence de grands modèles. Pour les modèles de diffusion, des méthodes QAT telles que QDM~\citep{li2024q} et TerDiT~\citep{lu2024terdit} maintiennent la performance à une précision de 1-2 bits mais exigent une charge d'entraînement substantielle. Les approches PTQ pour les modèles de diffusion fondés sur UNet incluent QDiffusion~\citep{li2023q}, PTQ4DM~\citep{shang2023post}, et EfficientDM~\citep{he2023efficientdm}. Pour les backbones à base de transformeurs, Q-DiT~\citep{chen2025q}, PTQ4DiT~\citep{wu2024ptq4dit}, SVDQuant~\citep{li2024svdquant}, et ViDiTQ~\citep{zhao2024vidit} prennent en compte les distributions d'activation particulières des transformeurs de diffusion via une calibration sensible à l'attention.

<!-- source: agentic 06/2026 | Implementation Details and Efficient Deployment › Model Compression: Quantization and Pruning -->

L'élagage de réseau comprend des approches non structurées~\citep{dong2017learning,park2020lookahead,sanh2020movement,lee2019signal} et un élagage structuré~\citep{ding2019centripetal,liu2021group}. La fusion de tokens~\citep{bolya2023token, bolya2022token} fournit des alternatives sans entraînement. Pour les modèles du monde, l'élagage sensible au déploiement constitue une frontière prometteuse : les critères d'élagage doivent préserver les paramètres critiques pour la cohérence à long horizon, en accord avec la condition limite L2 de cohérence temporelle définie en section~\ref{subsec:l2_requirements}.

<!-- source: agentic 06/2026 | Implementation Details and Efficient Deployment › Memory and KV Cache Compression -->

La dynamique à tokens autorégressive est sévèrement limitée par la mémoire durant les déploiements à long horizon, car le cache KV croît linéairement. Les principales stratégies de compression incluent :
\begin{enumerate}[leftmargin=*,nosep]
  \item \textbf{Éviction de tokens :} la rétention des entrées les plus fréquentes~\citep{zhang2023h2o} et la préservation des puits d'attention~\citep{xiao2024streamingllm} écartent les entrées de faible saillance pour borner la taille du cache.
  \item \textbf{Génération autorégressive par blocs :} les modèles vidéo modernes génèrent par blocs~\citep{yin2025slow, huang2025selfforcing, feng2025streamdiffusionv2}, bien que les contraintes matérielles limitent souvent la sortie à environ 60 secondes.
  \item \textbf{Quantification du KV :} des schémas tels que KIVI~\citep{liu2024kivi}, KVQuant~\citep{hooper2024kvquant}, QuaRot~\citep{ashkboos2024quarot}, et RotateKV~\citep{su2025rotatekv} sont matures pour le service des LLM, mais leur portage vers la diffusion vidéo entraîne une perte de qualité sévère en raison de statistiques d'activation différentes.
  \item \textbf{Compression sensible à l'espace-temps :} une compression KV vidéo efficace nécessite des cadres exploitant explicitement la redondance spatio-temporelle propre à la vidéo~\citep{yang2025sparse}.
\end{enumerate}

## 15. Discussion : convergence, alignement, échelle et apprentissage continu

**Discussion et défis ouverts**

<!-- source: survey archi 05/2026 -->

<claude>Intertitre « Discussion et défis ouverts » répété sept fois dans cette section (artefact de fusion) — n'en conserver qu'un.</claude>

Le tableau~\ref{tab:learning_paradigms} présente des modèles du monde représentatifs classés selon leur paradigme d'apprentissage, où « Besoin en données » indique l'échelle typique des données d'entraînement, « Étiquettes » précise si une supervision spécifique à la tâche est requise, et « Généralisation » caractérise l'étendue de la capacité de transfert.

**Discussion et défis ouverts**

<!-- source: survey archi 05/2026 -->

Les six paradigmes d'apprentissage passés en revue ci-dessus révèlent plusieurs tendances transversales importantes et des tensions non résolues.

**Discussion et défis ouverts**

<!-- source: survey archi 05/2026 -->

<font color="teal">Premièrement, on observe une trajectoire claire vers une \textit{convergence des paradigmes} : les modèles du monde les plus performants combinent de plus en plus le pré-entraînement auto-supervisé avec l'apprentissage par renforcement spécifique à une tâche ou l'affinage supervisé, reflétant la recette « pré-entraîner puis adapter » qui s'est révélée transformatrice en TAL et en vision par ordinateur. Le constat selon lequel les représentations de DreamerV3 sont dominées par des objectifs non supervisés~\cite{hafner2025mastering} fournit une motivation théorique à cette trajectoire, suggérant que l'essentiel de la connaissance du monde peut être acquis à partir de données non étiquetées.</font>

**Discussion et défis ouverts**

<!-- source: survey archi 05/2026 -->

<font color="brown">Deuxièmement, la question de l'\textit{alignement des objectifs} demeure largement non résolue. Les objectifs auto-supervisés tels que la reconstruction de pixels et le débruitage ne sont pas nécessairement alignés avec les exigences de la prise de décision en aval~\cite{lambert2020objective}. Les approches orientées décision — illustrées par le principe d'équivalence de valeur de MuZero~\cite{grimm2020value} et par la prédiction sélective dans l'espace de représentation de JEPA~\cite{lecun2022path} — offrent des alternatives fondées en principe, mais un cadre unifié équilibrant systématiquement précision prédictive et utilité décisionnelle fait encore défaut.</font>

**Discussion et défis ouverts**

<!-- source: survey archi 05/2026 -->

<font color="gold">Troisièmement, l'émergence de \textit{lois d'échelle pour les modèles du monde} représente une question ouverte cruciale. Les modèles de fondation tels que Cosmos et Sora démontrent que des modèles plus grands entraînés sur davantage de données produisent une qualité de génération améliorée, mais la question de savoir si cette amélioration se traduit par une compréhension physique authentique — plutôt que par un appariement de motifs plus sophistiqué — reste contestée. Les expériences contrôlées de Kang et al.~\cite{kang2025howfar} suggèrent que les modèles de génération vidéo présentent une généralisation par cas plutôt qu'un raisonnement physique abstrait, soulignant le besoin de protocoles d'évaluation permettant de distinguer la régularité statistique de la compréhension causale.</font>

**Discussion et défis ouverts**

<!-- source: survey archi 05/2026 -->

<font color="orange">Quatrièmement, l'\textit{efficacité et l'échelle des données} présentent une tension fondamentale. Les paradigmes JEPA et modèles de fondation atteignent une forte généralisation inter-domaines mais nécessitent des millions d'heures de données vidéo pour le pré-entraînement. Les méthodes MBRL en ligne atteignent une efficacité en données remarquable — PlaNet a démontré des améliorations de 50\(\times\) par rapport aux méthodes sans modèle — mais généralisent mal au-delà de leur distribution d'entraînement. Combler cet écart par un transfert efficace en échantillons depuis des représentations préentraînées vers de nouveaux environnements figure parmi les problèmes ouverts les plus importants.</font>

**Discussion et défis ouverts**

<!-- source: survey archi 05/2026 -->

Cinquièmement, l'\textit{apprentissage continu et tout au long de la vie} des modèles du monde a reçu relativement peu d'attention. Les modèles du monde déployés doivent s'adapter à des environnements évolutifs, à de nouveaux objets et à des dynamiques changeantes sans oublier catastrophiquement les connaissances acquises précédemment. Les systèmes actuels sont presque universellement entraînés en une seule phase puis figés au déploiement, une limitation qui contraint fondamentalement leur applicabilité au monde réel.

**Discussion et défis ouverts**

<!-- source: survey archi 05/2026 -->

<font color="gold">Enfin, l'interaction entre paradigme d'apprentissage et \textit{compréhension causale} mérite une investigation plus approfondie. La plupart des modèles du monde auto-supervisés apprennent des modèles de dynamique corrélationnels plutôt que causaux, comme le démontrent les modes de défaillance identifiés dans les simulateurs du monde fondés sur des LLM~\cite{wang2024bytesized32} et les modèles de génération vidéo~\cite{kang2025howfar}. La question de savoir si des innovations architecturales, des objectifs d'entraînement ou des stratégies de curation de données peuvent permettre aux modèles du monde d'acquérir une compréhension causale authentique, quel que soit le paradigme d'apprentissage, demeure l'une des questions ouvertes les plus fondamentales du domaine.</font>

<!-- contexte : Major Challenges and Limitations › Data Efficiency and Representation Learning -->

<!-- source: survey archi 05/2026 -->

<font color="orange">Si les modèles du monde améliorent l'efficacité en données par rapport aux méthodes sans modèle, ils nécessitent encore des quantités de données substantielles — en particulier dans les espaces d'observation de haute dimension.</font> <font color="teal">Les approches auto-supervisées et de modèles de fondation (JEPA~\cite{lecun2022path}, V-JEPA~\cite{bardes2024vjepa}) répondent à ce problème en préentraînant sur de vastes jeux de données non étiquetées, mais le transfert efficace de ces représentations vers des tâches en aval avec des données d'affinage limitées reste un défi.</font>
