# Évaluer

\label{sec:evaluation}

Évaluer un modèle du monde est plus difficile qu'évaluer séparément un modèle génératif, un prédicteur ou une politique. Un modèle du monde doit, en même temps, représenter correctement ce qu'il perçoit, maintenir une dynamique cohérente dans le temps, réagir aux actions, respecter les contraintes de son environnement et fournir des simulations suffisamment fiables pour guider une décision. Aucune métrique ni aucun benchmark unique ne capture toutes ces dimensions à la fois.

Un **benchmark** est un banc d'essai standardisé : un ensemble de tâches, de données et de règles de mesure qui permet de comparer plusieurs systèmes dans les mêmes conditions. Une **métrique** est la grandeur chiffrée que l'on calcule sur ce banc d'essai. La difficulté propre aux modèles du monde est que chaque communauté a construit les siens : l'apprentissage par renforcement, la conduite autonome, la génération vidéo, la robotique, les agents logiciels, la simulation sociale et l'IA pour la science utilisent des métriques et des benchmarks différents. Un score HNS sur Atari, une FVD sur des vidéos, une erreur de trajectoire sur nuScenes et un taux de réussite robotique ne sont pas directement comparables.

Ce chapitre construit donc une grille de lecture commune, organisée en trois niveaux de questionnement :

1. **Le modèle prédit-il correctement ?** On mesure alors la fidélité perceptuelle, la précision locale, la cohérence temporelle ou géométrique.
2. **Le modèle simule-t-il des conséquences fiables ?** On teste les déploiements multi-étapes, la sensibilité aux interventions et le respect des contraintes.
3. **Le modèle améliore-t-il réellement la décision ?** On l'intègre dans une boucle de planification, de contrôle ou d'évaluation de politique, et l'on mesure l'effet sur la réussite, la sécurité et la robustesse.

Cette progression prolonge directement le fil conducteur du livre : elle correspond au passage des niveaux L1 (prédire) à L2 (simuler) puis L3 (évoluer), et elle évite de confondre un **générateur plausible** avec un **simulateur exploitable pour agir**.

# 1. De la prédiction à l'utilité décisionnelle

## 1.1 Le réalisme visuel n'est ni suffisant ni nécessaire

Les métriques génératives standards — FID, FVD, SSIM, PSNR, LPIPS ou perte de reconstruction par pixel, définies au §2 — renseignent principalement sur la fidélité visuelle. Elles ne constituent que des indicateurs faibles de capacité agentique et prédisent mal la qualité des décisions qu'un agent prendra une fois inséré dans un environnement réel \citep{brooks2024sora,deepmind2025genie3}.

Un modèle du monde peut en effet générer des séquences visuellement convaincantes tout en échouant dès qu'un planificateur s'appuie sur elles : dynamique d'objet hallucinée, transition presque insensible à l'action, disparition d'un objet hors champ, violation discrète de la conservation de l'énergie, contact impossible ou trajectoire inexécutable. Ces erreurs restent parfois invisibles pour les métriques distributionnelles — celles qui comparent des ensembles de sorties générées à des ensembles de sorties réelles —, mais elles sont décisives pour la planification et le contrôle.

Le réalisme visuel n'est donc :

- **ni suffisant**, car un déroulé photoréaliste peut conduire à de mauvaises décisions ou briser une boucle de contrôle ;
- **ni nécessaire**, car un modèle latent, abstrait ou peu photoréaliste peut préserver les variables pertinentes pour la décision et très bien planifier.

La question pertinente n'est pas seulement : « Le futur généré semble-t-il réaliste ? », mais :

> **« Une meilleure validité du modèle change-t-elle ce que l'agent choisit, et ce changement améliore-t-il le résultat dans l'environnement réel ? »**

Ce constat, partagé par les communautés vidéo, robotique et conduite autonome, justifie à lui seul le déplacement de tout le chapitre : d'une évaluation centrée sur la prédiction vers une évaluation centrée sur la décision.

## 1.2 L'unité d'évaluation pertinente : la trajectoire

La source du problème est un décalage entre ce qui est facilement mesuré et ce qui compte réellement. Il ne suffit pas d'évaluer isolément une prédiction à un pas,

$$
p_\theta(z_t \mid z_{t-1},a_t),
$$

car un agent raisonne sur des conséquences composées. L'objet d'évaluation pertinent est le déroulé — ou *rollout* — au niveau de la trajectoire :

$$
\hat p(\tau \mid z_0,a_{1:H},c),
\qquad
\tau=(z_1,\ldots,z_H),
$$

où $z_0$ est l'état initial, $a_{1:H}$ la séquence d'actions envisagée, $H$ l'**horizon** — le nombre de pas que l'on cherche à anticiper — et $c$ l'ensemble des contraintes ou lois du domaine. La question devient alors : **ce déroulé demeure-t-il suffisamment fiable pour qu'un planificateur puisse agir sur sa base ?**

Les agrégats trop simples peuvent également masquer le problème. Une moyenne de taux de réussite peut dissimuler une forte variance entre tâches, scénarios ou graines aléatoires — une **graine aléatoire**, ou *seed*, est la valeur qui initialise le hasard d'une expérience ; en changer révèle la variabilité des résultats \citep{agarwal2021statistical,henderson2018deep}. L'évaluation doit donc porter à la fois sur la trajectoire, sur la distribution des performances et sur les cas d'échec.

## 1.3 Trois conditions aux limites pour passer du prédicteur au simulateur

Une évaluation centrée sur la décision peut être structurée autour de trois conditions, valables dans les quatre régimes de lois gouvernantes présentés au chapitre sur les niveaux de capacité — physique, numérique, social et scientifique. Ce sont précisément les conditions qui marquent le passage de L1 à L2 :

1. **Cohérence à long horizon.** Les déroulés doivent rester utilisables lorsque $H$ augmente, sans dériver progressivement vers des états impossibles ou non atteignables.
2. **Sensibilité à l'intervention.** Une modification d'action ou de prémisse doit entraîner une modification stable, directionnelle et pertinente de la trajectoire.
3. **Cohérence des contraintes.** Les futurs générés doivent respecter les lois du régime considéré : contraintes physiques, sémantique d'un programme, normes sociales ou validité expérimentale.

Ces conditions ne sont pas seulement diagnostiques. Elles doivent se traduire par de meilleurs plans, moins d'actions invalides et une meilleure réussite sous décalage de distribution — c'est-à-dire lorsque les situations rencontrées s'écartent de celles vues à l'entraînement.

Deux métriques agrégées relient directement le modèle aux décisions en aval.

Le **taux de réussite d'action** (*Action Success Rate*, ASR) mesure la proportion de tâches réussies dans l'environnement réel lorsque la politique a été dérivée des déroulés du modèle :

$$
\mathrm{ASR}
=
\frac{1}{N}
\sum_{i=1}^{N}
\mathbf{1}
\left[
\text{la tâche}_i\text{ réussit sous la politique dérivée de }\hat p
\right].
$$

Cette écriture se lit simplement : sur $N$ tâches, on compte celles qui réussissent réellement quand l'agent s'appuie sur le modèle, puis on divise par $N$. Le symbole $\mathbf{1}[\cdot]$ vaut 1 si la condition est vraie, 0 sinon.

La **déviation contrefactuelle du résultat** (*Counterfactual Outcome Deviation*, COD) mesure la sensibilité du modèle à une intervention. On part du même état $z_0$ et l'on compare deux séquences d'actions $a_{1:H}^{(1)}$ et $a_{1:H}^{(2)}$ qui ne diffèrent qu'à l'étape $k$ :

$$
\mathrm{COD}(k)
=
\mathbb{E}
\left[
 d\left(\hat z_H^{(1)},\hat z_H^{(2)}\right)
\right],
$$

où $d$ est une distance pertinente pour la tâche : distance à l'état-but en robotique, distance d'édition dans un environnement logiciel, différence de résultat social, etc. Un COD trop faible signale un modèle « sourd » aux actions : quoi que fasse l'agent, le futur prédit reste le même, ce qui rend le modèle inutilisable pour le raisonnement contrefactuel.

> **À retenir.** L'ASR vérifie si le modèle soutient de bonnes décisions ; le COD vérifie s'il répond de manière significative aux interventions. Ce cadre — les trois conditions aux limites, instrumentées par ASR et COD — est défini une seule fois ici ; les sections suivantes l'instancient par domaine sans le redéfinir.

# 2. Les grandes familles de métriques

Les métriques peuvent être regroupées selon la propriété qu'elles cherchent à mesurer. Aucune famille n'est suffisante seule ; leur combinaison doit dépendre de la fonction visée par le modèle du monde.

| Famille                          | Question posée                                    | Exemples                                        |
| -------------------------------- | -------------------------------------------------- | ------------------------------------------------ |
| Fidélité perceptuelle            | La sortie ressemble-t-elle à des données réelles ? | FID, FVD, SSIM, PSNR, LPIPS, JEDi, FVMD          |
| Performance sur la tâche         | L'agent réussit-il mieux ?                          | HNS, driving score, taux de réussite             |
| Cohérence dynamique et causale   | Le futur est-il possible, pas seulement plausible ? | VBench 2.0, WorldBench, sondes physiques         |
| Précision géométrique            | La structure 3D prédite est-elle exacte ?           | distance de Chamfer, IoU d'occupation            |
| Généralisation et fiabilité      | Le modèle sait-il quand il ne sait plus ?           | tests OOD, calibration d'incertitude, latence    |
| Rigueur statistique              | Le résultat est-il reproductible et significatif ?  | IQM, intervalles bootstrap, profils de performance |

## 2.1 Fidélité perceptuelle et reconstruction

La **Fréchet Inception Distance** (FID) compare les distributions de caractéristiques d'images générées et réelles. Les caractéristiques sont extraites par un réseau Inception-v3 entraîné sur ImageNet ; une FID plus faible indique une meilleure similarité distributionnelle \cite{heusel2017fid}.

La **Fréchet Video Distance** (FVD) transpose cette logique à la vidéo en utilisant des caractéristiques issues d'un réseau I3D entraîné sur le jeu de données Kinetics. Elle cherche à capturer la qualité spatiale et une partie de la cohérence temporelle \cite{unterthiner2019fvd}. Devenue le standard de facto de la génération vidéo, elle présente des limites désormais bien documentées :

- elle est fortement influencée par la qualité de chaque image, au détriment du mouvement et de la cohérence temporelle — le « biais de contenu » \cite{ge2024contentdebiased,ge2024contentbias} ; on peut diviser les scores de FVD par deux simplement en sélectionnant des vidéos presque statiques, sans améliorer la dynamique ;
- les distributions de caractéristiques I3D ne sont pas réellement gaussiennes, alors que le calcul de la distance le suppose ;
- elle est peu sensible à certaines distorsions temporelles ;
- elle exige de grands échantillons et peut rester non nulle même lorsque les distributions comparées sont identiques, à cause du bruit d'estimation ;
- pour les générateurs modernes à haute fidélité, elle corrèle imparfaitement avec le jugement humain \cite{luo2025beyondfvd}.

Deux alternatives cherchent à isoler la dynamique. **JEDi** (*JEPA Embedding Distance*) calcule la distance dans des embeddings de type JEPA — un *embedding* est un vecteur numérique représentant une observation — ; elle corrèle mieux avec les jugements de qualité temporelle et ne requiert qu'environ 16 % des échantillons nécessaires à une estimation fiable de la FVD \cite{luo2025beyondfvd}. La **Fréchet Video Motion Distance** (FVMD) évalue la cohérence du mouvement séparément de l'apparence ; elle révèle des cas où la FVD et VBench contredisent le jugement humain, notamment pour les vidéos à mouvement intense \cite{liu2024fvmd}.

À l'échelle de l'image, trois métriques complètent les mesures distributionnelles :

- **SSIM** évalue la luminance, le contraste et la structure entre deux images ; elle corrèle mieux avec la perception humaine qu'une simple erreur quadratique moyenne (MSE) pixel à pixel \cite{wang2004ssim} ;
- **PSNR** mesure la fidélité de reconstruction au niveau du pixel ;
- **LPIPS** calcule une distance dans un espace de caractéristiques profond, généralement construit à partir de VGG, et s'aligne fortement sur les jugements perceptuels humains \cite{zhang2018lpips}.

Ces métriques restent cependant calculées image par image, sans accès au contexte temporel. Elles sont donc aveugles aux ruptures inter-images : identité qui change, objet qui disparaît, causalité inversée ou mouvement physiquement impossible — précisément les propriétés qu'un modèle du monde doit préserver.

> **Le piège de la qualité perceptuelle.** La dépendance du domaine à la FVD comme métrique principale peut orienter systématiquement la recherche vers l'apparence au détriment de la cohérence temporelle et physique. Ce biais collectif est l'une des raisons pour lesquelles ce chapitre organise l'évaluation autour de la décision, et non de l'image.

## 2.2 Performance sur la tâche et utilité en aval

Dans l'apprentissage par renforcement fondé sur un modèle, la métrique centrale est le **retour épisodique cumulé** : la somme des récompenses obtenues au cours d'un épisode. Sur Atari, il est fréquemment normalisé par rapport à une politique aléatoire et à une performance humaine, ce qui donne le **Human-Normalized Score** :

$$
\mathrm{HNS}
=
\frac{R_{\mathrm{agent}}-R_{\mathrm{random}}}
{R_{\mathrm{human}}-R_{\mathrm{random}}},
$$

où $R$ désigne la récompense cumulée. Un HNS de 1 (ou 100 %) signifie « niveau humain ». Moyenne et médiane du HNS ont longtemps constitué les agrégats standards sur Atari 100k \cite{kaiser2020simpl} ; leurs limites statistiques sont traitées au §2.6. Pour le contrôle continu, par exemple sur la DeepMind Control Suite, on rapporte plutôt des retours épisodiques bruts, moyennés sur plusieurs graines et parfois normalisés par une politique experte.

Dans la conduite autonome, les métriques de tâche incluent :

- le **driving score**, un composite combinant l'achèvement de l'itinéraire et des pénalités d'infraction ; le CARLA Leaderboard le rapporte sur une échelle de 0 à 100 \cite{dosovitskiy2017carla} ;
- le taux de réussite et le taux de collision ;
- l'erreur de trajectoire $L_2$ — l'écart géométrique moyen entre la trajectoire prédite et la trajectoire de référence — et l'erreur de déplacement ;
- des scores de compétences de conduite plus fins, comme dans Bench2Drive \cite{jia2024bench2drive}.

En robotique, la norme reste le **taux de réussite** sur des tâches de manipulation, de locomotion ou de navigation, mesuré sur plusieurs essais et conditions initiales aléatoires.

Ces métriques répondent à la question essentielle — le modèle améliore-t-il l'action ? — mais elles doivent être complétées par des diagnostics, car un taux de réussite final n'explique pas pourquoi le système a réussi ou échoué.

## 2.3 Cohérence temporelle, physique et causale

Une troisième famille abandonne le score global au profit de **sondes diagnostiques** : au lieu de résumer toute la sortie par un chiffre, on teste isolément des propriétés précises. Les diagnostics de cohérence incluent notamment :

- la permanence des objets et la continuité spatio-temporelle ;
- le respect des relations de support et l'absence d'interpénétration ;
- la conservation de l'énergie ou de la quantité de mouvement ;
- la cohérence de l'identité et des relations entre objets ;
- la causalité directionnelle ;
- la réponse correcte aux changements d'action ;
- la possibilité de récupérer une action exécutable depuis le futur généré.

VBench illustre ce déplacement : il décompose la qualité de génération vidéo en 16 dimensions distinctes — cohérence du sujet, cohérence de l'arrière-plan, scintillement temporel, fluidité du mouvement, qualité esthétique, alignement texte-vidéo — ce qui permet de diagnostiquer un mode de défaillance précis plutôt que de s'appuyer sur un score agrégé \cite{huang2024vbench}. VBench 2.0 ajoute la **fidélité intrinsèque** : plausibilité physique, raisonnement de sens commun et cohérence de l'anatomie humaine \cite{huang2025vbench2}. WorldBench va plus loin en comparant les prédictions à des simulations physiques de référence, produites avec Kubric ou PyBullet \cite{upadhyay2026worldbench}. Ces benchmarks, ainsi que leurs équivalents par domaine, sont détaillés dans le catalogue du §4.

## 2.4 Précision géométrique et prédiction de dynamique

Pour les modèles 3D, la **distance de Chamfer** mesure l'écart géométrique entre le nuage de points prédit et la vérité terrain : pour chaque point d'un nuage, on cherche le point le plus proche dans l'autre. Copilot4D rapporte une réduction de 65 % de cette distance pour une prédiction LiDAR à une seconde \cite{zhang2024copilot4d}.

Les modèles d'occupation, tels qu'OccWorld, utilisent l'**Intersection-over-Union** (IoU) entre grilles de voxels prédites et réelles — un **voxel** est l'équivalent tridimensionnel d'un pixel, une petite cellule d'espace \cite{wang2024occworld}.

Pour les modèles du monde en RL hors ligne, deux mesures sont complémentaires :

- l'**erreur de prédiction à un pas**, par exemple une MSE dans l'espace latent ou dans l'espace d'observation ;
- la **divergence multi-étapes**, qui mesure l'écart accumulé lorsque le modèle est déroulé récursivement.

La première renseigne sur l'opérateur local ; la seconde sur sa composabilité. Une faible erreur à un pas ne garantit pas un bon déroulé à long horizon — c'est le cœur du §3.2.

## 2.5 Généralisation, incertitude et efficacité d'inférence

La généralisation se mesure souvent en conditions **hors distribution** (*out-of-distribution*, OOD) ou **zéro-coup** (*zero-shot*) : le modèle est confronté à des objets, dynamiques, tâches, incarnations ou environnements qu'il n'a jamais vus, et les mêmes métriques de prédiction ou de tâche sont recalculées sur ces conditions inédites.

Dans les systèmes critiques, l'**incertitude** doit être **calibrée** : lorsque le modèle annonce 80 % de confiance, il doit avoir raison environ 8 fois sur 10. Un agent doit savoir quand ses prédictions ou ses plans ne sont plus fiables, de manière à déclencher une replanification, une vérification supplémentaire ou un arrêt sûr.

L'efficacité d'inférence, enfin, est une dimension fonctionnelle et non un simple coût. Un modèle peut être précis mais inutilisable si son temps de génération dépasse la fréquence de contrôle requise. Dans des environnements physiques rapides, une latence supérieure à la seconde n'est pas seulement une dépense de calcul : le retard d'inférence peut provoquer une instabilité de la boucle de contrôle et devient une exigence de sécurité. Les benchmarks existants négligent encore largement cette dimension.

## 2.6 Rigueur statistique

Les pratiques courantes en RL — rapporter une moyenne ou une médiane de scores normalisés, calculées sur peu de jeux ou de graines — peuvent conduire à des conclusions fragiles. La moyenne du HNS est dominée par les jeux aberrants ; la médiane écarte une grande partie de l'information ; les deux peuvent masquer une forte variance entre instances de tâches \cite{agarwal2021precipice,agarwal2021statistical}.

Agarwal et al. recommandent :

- la **moyenne interquartile** (IQM), qui moyenne les scores après avoir écarté les 25 % les plus bas et les 25 % les plus hauts, et résiste ainsi aux valeurs extrêmes ;
- des **intervalles de confiance bootstrap stratifiés** — le *bootstrap* estime l'incertitude en rééchantillonnant les résultats existants, sans hypothèse forte sur leur distribution ;
- des **profils de performance**, qui montrent toute la distribution des scores plutôt qu'un point unique ;
- l'utilisation d'outils standardisés tels que la bibliothèque `rliable`.

Malgré cette recommandation — et un prix du meilleur article à NeurIPS 2021 —, de nombreux travaux sur les modèles du monde continuent de publier des moyennes ou médianes sans intervalle de confiance. Toute comparaison sérieuse devrait préciser le nombre de graines, la distribution des scénarios, les intervalles d'incertitude et les performances de queue, et non un score ponctuel.

# 3. Les protocoles qui révèlent les capacités réelles

Les métriques du §2 disent *quoi* mesurer. Cette section traite du *comment* : le protocole d'évaluation détermine souvent davantage le résultat que la métrique elle-même.

## 3.1 Boucle ouverte et boucle fermée

La distinction entre boucle ouverte et boucle fermée structure l'ensemble de l'évaluation.

En **boucle ouverte**, le modèle prédit un futur à partir d'une trajectoire enregistrée. Ses sorties n'influencent pas les observations suivantes. Ce cadre est facile à standardiser, à paralléliser et à déployer à grande échelle, mais il peut être trompeur : le modèle n'est jamais confronté aux conséquences de ses propres erreurs.

En **boucle fermée**, les prédictions influencent les actions, les actions modifient l'environnement, et les observations suivantes dépendent de cette interaction. Les erreurs deviennent visibles parce qu'elles s'accumulent et déplacent l'agent vers des états qu'il n'a peut-être jamais vus pendant l'entraînement.

La conduite autonome fournit le cas d'école. nuScenes, le jeu de données dominant, contient 1 000 scènes — environ 5,5 heures de conduite — avec une couverture de capteurs à $360^\circ$ et des annotations 3D \cite{caesar2020nuscenes}. Il a toutefois été conçu pour la perception plutôt que pour la planification, et l'erreur de trajectoire $L_2$ en boucle ouverte y corrèle mal avec la performance de conduite en boucle fermée \cite{jia2024bench2drive}. Pire : certains modèles y obtiennent de bons scores en exploitant surtout l'état du véhicule **ego** — le véhicule porteur des capteurs, dont la vitesse et le cap suffisent souvent à extrapoler la trajectoire — plutôt que la perception de la scène \cite{li2024egostatus}.

La communauté a répondu par des correctifs successifs :

- **CARLA** évalue des agents dans une simulation interactive et produit un driving score composite \cite{dosovitskiy2017carla} ;
- **Bench2Drive** fournit une évaluation multi-aptitudes en boucle fermée — 10 000 clips, soit environ 2 millions d'images annotées, répartis sur 44 scénarios interactifs — et affirme explicitement que l'erreur $L_2$ en boucle ouverte n'est pas un indicateur pertinent \cite{jia2024bench2drive} ;
- **NAVSIM** propose une simulation non réactive sur des données réelles de nuPlan ; il a permis la première comparaison directe entre des familles de modèles évaluées jusque-là exclusivement soit sur CARLA soit sur nuScenes, révélant que des méthodes simples peuvent égaler des architectures à grande échelle sur des scénarios exigeants ; sa compétition CVPR 2024 a attiré 143 équipes et 463 soumissions \cite{dauner2024navsim} ;
- **nuPlan** étend nuScenes avec un simulateur orienté planification en boucle fermée \cite{caesar2021nuplan}.

> **La leçon dépasse la conduite : tout modèle du monde évalué uniquement en boucle ouverte paraîtra meilleur qu'il ne le sera en déploiement**, où chaque prédiction influence les observations futures via les actions de l'agent.

## 3.2 Cohérence à long horizon : la courbe de dégradation

Le mode de défaillance signature des modèles du monde est l'**erreur cumulative** : de petites déviations à chaque pas s'amplifient au fil du déroulé et poussent progressivement la trajectoire imaginée vers des branches inatteignables. Un second mécanisme, plus discret, est l'**aliasing d'états** : deux états réels distincts sont encodés par des représentations trop proches, et le déroulé diverge silencieusement de la réalité.

La mesure opérationnelle n'est donc pas un taux de réussite à horizon fixe, mais une **courbe de dégradation** : on suit une métrique pertinente pour la tâche en fonction de l'horizon $H$. La courbe elle-même est le diagnostic — sa pente indique à quelle vitesse le modèle cesse d'être fiable. La plupart des benchmarks actuels ne la rapportent pas : ils testent à un horizon donné sans caractériser la relation entre performance et horizon.

Le même mécanisme se manifeste dans tous les régimes, ce qui confirme qu'il s'agit d'une propriété structurelle et non d'un artefact de domaine :

- en manipulation, RoboCasa et ManiSkill3 permettent d'observer la chute de réussite lorsque le nombre d'étapes augmente \cite{nasiriany2024robocasa,tao2024maniskill3} ; sur LIBERO, les suites Goal et surtout Long révèlent des chutes plus marquées que les suites Spatial et Object (§6.4) ;
- dans SWE-bench, le taux de résolution multi-fichiers mesure la capacité à conserver un état cohérent du dépôt de code sur plusieurs modifications interdépendantes \cite{jimenez2023swebench} ;
- dans Sotopia, on suit la stabilité des engagements, alliances et variables relationnelles au fil d'une interaction multi-tours, qui peuvent s'éroder silencieusement \cite{zhou2024sotopia} ;
- dans ScienceWorld, les séquences d'actions de laboratoire doivent préserver l'ordre causal — chauffer une substance *avant* d'en mesurer la température, et non après \cite{wang2022scienceworld} ;
- dans WorldBench, le mIoU physique s'effondre après 5 à 9 images de prédiction autorégressive \cite{upadhyay2026worldbench} ;
- MBPO limite volontairement la longueur de ses déroulés à la zone où le modèle reste précis — reconnaissance implicite de la limite de cohérence, rarement évaluée comme métrique à part entière \cite{janner2019mbpo}.

Les environnements ouverts fournissent les tests les plus exigeants, précisément parce qu'ils imposent de composer des compétences sur des centaines de pas : Minecraft, via MCU ou Voyager, peut exiger plus d'un millier d'actions pour collecter des ressources, fabriquer des outils et naviguer \cite{zheng2023mcu,wang2023voyager} ; Crafter condense des exigences comparables dans un cadre plus contrôlé \cite{stanic2023learning} ; NetHack ajoute génération procédurale et complexité symbolique \cite{kurenkov2023katakomba}. Les méthodes de recherche temporelle développées pour la compréhension de vidéos longues suggèrent par ailleurs des pistes pour diagnostiquer la cohérence à grande échelle \cite{ye2025re}.

## 3.3 Sensibilité à l'intervention : le test de divergence contrefactuelle

Un modèle utile à la planification doit répondre aux actions. Produire presque la même trajectoire quelle que soit l'action est incompatible avec la contrôlabilité, même si chaque image est parfaitement réaliste \citep{wu2024ivideogpt,brooks2024sora}.

Le protocole central est le **test de divergence contrefactuelle**, qui opérationnalise le COD défini au §1.3 :

1. partir du même état initial $z_0$ ;
2. exécuter deux séquences d'actions qui ne diffèrent qu'à une seule étape ;
3. comparer les trajectoires obtenues sur des variables pertinentes pour la tâche.

Deux mesures complémentaires en découlent :

- le **ratio de sensibilité à l'action** : la proportion de perturbations d'action qui produisent un changement détectable du résultat ;
- la **divergence contrefactuelle du résultat** : l'amplitude du changement des variables pertinentes, normalisée par l'amplitude de l'intervention.

Le protocole s'instancie dans chaque régime :

- dans OSWorld, injecter une fenêtre surgissante ou une panne réseau et vérifier que l'agent replanifie au lieu de cliquer mécaniquement \cite{xie2024osworld} ;
- dans RoboCasa, déplacer un objet et vérifier que la stratégie de manipulation s'adapte ;
- dans Sotopia, modifier le coup d'ouverture d'un agent et vérifier que l'issue de la négociation évolue de façon cohérente.

Des trois conditions aux limites, la sensibilité à l'intervention est aujourd'hui la moins testée. La plupart des benchmarks mesurent la qualité de sortie ou le succès final, sans faire varier explicitement les actions ni mesurer la divergence des résultats. Combler cette lacune exige des protocoles qui interviennent délibérément, plutôt que d'observer passivement.

## 3.4 Cohérence des contraintes : la vérification par régime

Les contraintes portent souvent sur la trajectoire entière, notée $c(\tau)$, et non sur un état isolé. Une violation peut donc rester invisible à une métrique locale tout en rendant le plan inexécutable. Cette condition est aussi la surface privilégiée de deux modes de défaillance : l'**exploitabilité** — le modèle apprend à satisfaire la métrique sans respecter la règle — et l'échec de calibration sous décalage de distribution \citep{xie2024osworld,zheng2023mcu}.

La manière de vérifier une contrainte dépend du régime de lois, ce qui rejoint la question posée au chapitre sur les niveaux : *comment sait-on qu'une prédiction est fausse ?*

| Régime           | Signaux de vérification                                                     | Benchmarks représentatifs                                                                 |
| ---------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| **Physique**     | profondeur d'interpénétration, conservation de l'énergie, relations de support | VBench (conformité physique), BuilderBench (stabilité sous charge) \cite{huang2023vbench,ghugare2025builderbench} |
| **Numérique**    | correspondance action–reçu d'exécution, types, contrats d'API                | OSWorld, macOSWorld (reçus journalisables) \cite{xie2024osworld,yang2025macosworld}        |
| **Social**       | violations de normes, cohérence des engagements, théorie de l'esprit         | Sotopia (sept dimensions), ExploreToM (sondes adversariales) \cite{zhou2024sotopia,sclar2024exploretom} |
| **Scientifique** | lois de conservation, cohérence du graphe causal, validité de la chaîne de preuves | DiscoveryBench, FutureX \cite{majumder2024discoverybench,zeng2025futurex}                  |

Un **reçu d'exécution** est la trace vérifiable qu'une action numérique a bien produit son effet : code de retour, fichier créé, état d'interface. La **théorie de l'esprit** désigne la capacité à représenter les croyances et intentions d'autrui, y compris lorsqu'elles sont fausses.

Les environnements mobiles et multi-plateformes — AppAgent, AndroidWorld — étendent la vérification des contraintes numériques, et AgentBench apporte une couverture inter-domaines \cite{zhang2025appagent,rawles2024androidworld,liu2023agentbench}. ChemCrow illustre le cas extrême : en synthèse chimique, une seule violation de validité suffit à invalider le plan entier \cite{bran2024augmenting}.

## 3.5 Le même benchmark peut tester L1, L2 ou L3

Le niveau de capacité évalué n'est pas déterminé par le nom du benchmark, mais par ce que le protocole exige :

- **L1 — Prédire** : prédiction locale ou à un pas ;
- **L2 — Simuler** : déroulé multi-étapes exploitable pour décider, soumis aux trois conditions aux limites ;
- **L3 — Évoluer** : révision durable du modèle à partir de nouvelles preuves.

Un exemple par régime rend cette idée concrète.

**Monde physique — manipulation en cuisine.** À L1, le protocole se réduit à prédire la prochaine position de l'effecteur à partir de l'état et de l'action, mesurée par une erreur de position à un pas. À L2, on exécute une tâche complète — saisir, placer, chauffer — sous perturbations en cours de tâche : objet déplacé, tiroir bloqué. Les métriques deviennent la réussite à long horizon, la fraction d'actions catastrophiques et le taux de récupération après perturbation. À L3, après plusieurs échecs sur un agencement inédit, l'agent doit distiller une stratégie persistante — « cette poignée exige une approche par le dessus » — dont le bénéfice se transfère aux essais suivants. En pratique, la plupart des systèmes de manipulation rapportent encore des taux de réussite de style L1, et l'injection de perturbations n'est pas standardisée.

**Monde numérique.** Une prédiction de clic dans OSWorld ou une complétion d'une ligne de code dans SWE-bench relève de L1. La résolution de problèmes multi-fichiers sous pannes injectées — dépassements de délai réseau, fenêtres inattendues, états hors distribution — relève de L2, suivie par la cohérence à long horizon et la fraction d'actions catastrophiques \citep{xie2024osworld,jimenez2023swebench}. L3 exigerait la production d'artefacts durables : un script de reproduction converti en test de régression, ou une procédure d'installation réutilisable distillée d'une tentative échouée. Les systèmes des classements actuels opèrent essentiellement entre L1 et L2 ; la production d'actifs de type L3 n'est rapportée que par anecdotes.

**Monde social.** La « perturbation » y est le changement de stratégie d'un autre agent, non une secousse physique. L1 mesure la prédiction du prochain tour ou la **perplexité** — une mesure de la surprise du modèle face à la suite réelle. L2 modifie la stratégie d'un agent en cours de dialogue — une injection contrefactuelle — et suit l'achèvement du but, la cohérence des engagements et le déplacement approprié du résultat social \cite{zhou2024sotopia}. L3 exigerait qu'après des échecs répétés de négociation, l'agent distille une stratégie sociale ou une règle de gestion des normes qui persiste et se transfère à des scénarios structurellement proches. Les benchmarks sociaux existants injectent rarement de telles perturbations.

**Monde scientifique.** C'est le régime le plus proche d'un véritable paradigme L3. À L1, on prédit le résultat d'une action expérimentale isolée — « que se passe-t-il quand on ajoute un acide à une base ? ». À L2, on conçoit et exécute une séquence expérimentale multi-étapes en maintenant la cohérence causale, mesurée par la validité de la séquence, le taux d'actions cohérentes avec l'hypothèse et la robustesse aux observations trompeuses \citep{wang2022scienceworld,majumder2024discoverybench}. L'étape critique de L3 est la révision d'hypothèse : lorsque l'expérience falsifie une prédiction, le système doit mettre à jour sa structure de croyances et éviter les voies déjà invalidées. Des systèmes en boucle fermée comme CAMEO démontrent déjà cette révision guidée par les preuves en laboratoire.

> **État des lieux.** La grande majorité des systèmes actuels ne sont évalués qu'à L1 — précision à un pas ou réussite de bout en bout, sans injection de perturbation. Les protocoles L2 — injection contrefactuelle, courbes de dégradation, détection de violations — existent et sont démontrés par des benchmarks isolés, mais ne sont pas encore la pratique standard. L'infrastructure L3 — suites de régression, validation d'artefacts, suivi de l'amélioration inter-épisodes — est pratiquement inexistante hors de la science autonome. Combler cet écart est un prérequis à toute affirmation sur la « capacité de modélisation du monde » d'un système.

# 4. Un catalogue de référence des benchmarks

\label{sec:benchmark}

Le choix d'un benchmark détermine les capacités réellement testées, et aucun benchmark ne couvre toutes les lois du monde ni toutes les conditions aux limites. Cette section rassemble donc, en un seul endroit, les bancs d'essai mobilisés dans le reste du chapitre : chaque benchmark n'est décrit en détail qu'ici, et les autres sections s'y réfèrent. Le tableau \ref{tab:benchmark_summary} associe chaque ancre à son régime de lois principal, aux niveaux de capacité couverts et à ses métriques clés.

\input{tables/benchmark_summary}

## 4.1 Apprentissage par renforcement et contrôle

**Atari 100k** restreint l'agent à 100 000 pas d'environnement — environ deux heures de jeu en temps réel — sur 26 jeux de l'Arcade Learning Environment \cite{kaiser2020simpl,kaiser2019simple,bellemare2013ale,bellemare2013arcade}. Cette contrainte en fait le banc d'essai principal de l'efficacité en données des méthodes fondées sur un modèle. EfficientZero a atteint un HNS moyen de 1,94, soit 194 % du niveau humain \cite{ye2021efficientzero} ; DIAMOND détient le record pour des agents entraînés *entièrement* au sein d'un modèle du monde, avec un HNS moyen de 1,46 \cite{alonso2024diamond}.

La **DeepMind Control Suite** propose plus de vingt tâches de contrôle continu à partir de pixels, sous un budget standard de $10^6$ pas, couvrant locomotion et manipulation sous des dynamiques variées \cite{tassa2018dmc,tassa2018deepmind}. DreamerV3 y a démontré une généralité inter-domaines avec des hyperparamètres fixes \cite{hafner2023dreamerv3}.

**Crafter** teste 22 accomplissements dans un monde de survie généré procéduralement \cite{hafner2022crafter,stanic2023learning}. **Minecraft**, via MCU ou Voyager, évalue l'exploration ouverte à récompenses éparses et la composition de compétences à long horizon \cite{zheng2023mcu,wang2023voyager}. **Memory Maze** cible explicitement la mémoire à long terme \cite{samsami2024r2i}. **NetHack** ajoute génération procédurale, exploration et complexité symbolique \cite{kurenkov2023katakomba}.

En RL hors ligne, **D4RL** fournit des jeux de données standardisés de locomotion, navigation et manipulation, pour évaluer des modèles qui apprennent la dynamique sans interaction en ligne \cite{fu2020d4rl} ; des modèles du monde fondés sur la diffusion y ont rapporté une amélioration de 44 % par rapport aux modèles à une étape sur les tâches de locomotion. D4RL étant de plus en plus saturé, **D5RL** propose des tâches robotiques plus réalistes, sur lesquelles les méthodes actuelles peinent encore à dépasser le clonage comportemental — la simple imitation des démonstrations \cite{rafael2024d5rl}.

## 4.2 Conduite autonome et navigation incarnée

Les quatre bancs d'essai de conduite — **nuScenes**, **CARLA**, **Bench2Drive**, **NAVSIM**, complétés par **nuPlan** — ont été présentés au §3.1 avec la distinction boucle ouverte / boucle fermée qui les motive ; leurs chiffres clés n'y sont pas répétés ici.

Pour la navigation incarnée, la série **Habitat** reste le standard de la navigation 3D, du réarrangement d'objets et des interactions humain-agent \cite{savva2019habitat,szot2021habitat20,puig2023habitat3,yokoyama2024hm3d}. **iGibson 2.0** et **BEHAVIOR-1K** étendent l'évaluation à des activités domestiques dépendant de l'état des objets et de longues sémantiques de tâche \cite{li2021igibson2,li2024behavior1k}.

## 4.3 Génération vidéo, mondes 3D/4D et simulation interactive

Le tableau \ref{tab:video_eval_benchmarks} résume les principaux protocoles d'évaluation de la prédiction vidéo et de la compréhension de scène.

**VBench** et **VBench 2.0**, présentés au §2.3, fournissent la décomposition dimensionnelle de référence \cite{huang2023vbench,huang2024vbench,huang2025vbench2,zheng2025vbench}. **EvalCrafter** couvre qualité visuelle, alignement texte-vidéo, qualité du mouvement et cohérence temporelle sur un large éventail de générateurs \cite{liu2024evalcrafter}. **Cosmos-HUE**, introduit avec Cosmos 3, s'appuie sur une évaluation humaine des sorties génératives et omnimodales \cite{nvidia2025cosmos}.

**WorldScore** est le premier benchmark unifié de génération de mondes : plus de 19 modèles évalués sur la contrôlabilité, la qualité et la dynamique, via une décomposition en génération de scène suivante avec trajectoires de caméra \cite{duan2025worldscore}. **4DWorldBench** étend l'évaluation à la cohérence spatio-temporelle et à la dynamique des mondes 4D — trois dimensions d'espace plus le temps \cite{lu20264dworldbench}.

Pour l'évaluation interactive, **WBench** et **WorldMark** testent le suivi d'interactions multi-tours, la cohérence du contrôle et la plausibilité physique \cite{ying2026wbench,xu2026worldmark}. **MBench**, **WorldPrediction** et **WorldReasonBench** évaluent la persistance des états, la planification procédurale et la génération de futurs dont l'évolution reste physiquement, socialement, logiquement et informationnellement cohérente \cite{zhang2026mbench,chen2025worldprediction,wu2026worldreasonbench}.

**CoW-Bench** organise l'évaluation autour d'une « trinité de cohérence » — modale, spatiale et temporelle — testant l'alignement intermodal, la structure spatiale consciente de la 3D, la permanence des objets et l'évolution temporelle physiquement plausible dans des scénarios multimodaux complexes \cite{wei2026trinityconsistencydefiningprinciple}.

## 4.4 Physique, causalité et benchmarks spécifiques aux modèles du monde

**WorldBench** propose une évaluation physique désenchevêtrée, concept par concept, avec des vidéos de vérité terrain simulées physiquement : propriétés de physique intuitive — permanence des objets, cohérence d'échelle — et estimation de paramètres physiques — friction, viscosité. Son constat central est préoccupant : les modèles du monde vidéo de pointe n'atteignent qu'environ 45 % de mIoU d'avant-plan sur les tâches de raisonnement physique, et ce score s'effondre après 5 à 9 images autorégressives \cite{upadhyay2026worldbench}. Le **mIoU** est la moyenne des IoU par catégorie : il mesure le recouvrement entre les régions prédites et les régions correctes.

**Physion** évalue la prédiction physique sur huit scénarios 3D réalistes en comparant modèles et humains ; les représentations centrées sur les objets s'y révèlent nécessaires mais insuffisantes \cite{bear2022physion}. **Physion++** exige en outre d'inférer en ligne des propriétés latentes — masse, friction, élasticité — et montre qu'aucun modèle actuel n'atteint le niveau humain lorsque cette inférence est requise \cite{tung2023physionpp}. **IntPhys** adapte le paradigme de violation d'attente de la psychologie du développement : distinguer des événements physiquement possibles et impossibles ; les modèles actuels y performent près du hasard \cite{riochet2022intphys}. **PhysBench** évalue 75 modèles vision-langage sur plus de 10 000 entrées et constate que l'excellence en sens commun ne garantit pas la compréhension du monde physique \cite{chow2025physbench}.

**PhyGenBench** et **PhyWorldBench** évaluent le respect du sens commun physique et du réalisme physique des vidéos générées \cite{meng2024towards,gu2025phyworldbench}. **WorldModelBench** couvre 7 domaines d'application et 56 sous-domaines, avec 350 prompts et environ 67 000 annotations humaines, mesurant à la fois le suivi d'instructions et le respect de la physique ; il révèle des lacunes de cohérence des contraintes chez les 14 modèles de pointe testés \cite{li2025worldmodelbench,fan2025worldmodelbench,li2026worldmodelbench}.

**WorldSimBench** introduit une évaluation double — perceptuelle explicite et manipulative implicite, mesurant la cohérence vidéo-action — sur des environnements ouverts, la conduite et la manipulation robotique ; il montre que réalisme perceptuel et fidélité conditionnée par l'action peuvent diverger fortement \cite{qin2024worldsimbench,qin2025worldsimbench}.

Deux analyses complètent ces bancs d'essai. Vafa et al. mobilisent le théorème de Myhill-Nerode — un résultat de théorie des langages formels — pour montrer que réussir des tests à un pas ne garantit pas la cohérence à long horizon : un modèle peut entretenir un état interne du monde très incohérent tout en excellant sur les diagnostics standards \cite{vafa2024evaluating}. Kang et al. constatent que certains générateurs vidéo pratiquent une imitation « par cas » — reproduire l'exemple d'entraînement le plus proche — plutôt que d'abstraire des principes physiques généralisables, même à grande échelle \cite{kang2025howfar}.

## 4.5 Robotique incarnée

Pour la manipulation générale : **RLBench** propose 100 tâches conçues manuellement avec observations visuelles et proprioceptives \cite{james2020rlbench} ; **Meta-World** contient 50 tâches de manipulation pour le multi-tâche et le méta-apprentissage \cite{yu2020metaworld} ; **CALVIN** évalue la manipulation à long horizon conditionnée par le langage, à partir de 24 heures de jeu téléopéré et de 20 000 directives linguistiques \cite{mees2022calvin} ; **ManiSkill3** fournit des démonstrations à grande échelle pour la manipulation généralisable \cite{tao2024maniskill3} ; **RoboCasa** et **RoboCasa365** ciblent la manipulation domestique à long horizon et la stabilité physique \cite{nasiriany2024robocasa,nasiriany2026robocasa365} ; **BuilderBench** teste la stabilité structurelle sous charge \cite{ghugare2025builderbench} ; **RoboArena** étend l'évaluation à des politiques robotiques en conditions réelles \cite{atreya2025roboarena}.

Sur matériel réel, DayDreamer a mesuré distance de locomotion et taux de réussite de manipulation à partir d'interactions physiques limitées \cite{wu2023daydreamer}, et DreMa a rapporté un apprentissage de politique en un coup sur un robot Franka Emika Panda \cite{barcellona2025drema}.

Pour l'évaluation spécifique des modèles du monde incarnés — mobilisée au §6 :

- **RBench** mesure cohérence structurelle, plausibilité physique et exhaustivité de l'action à travers tâches et incarnations variées \cite{deng2026rethinking} ;
- **EWMBench** factorise cohérence de scène, justesse du mouvement et alignement sémantique \cite{yue2025ewmbench} ;
- **DreamGen Bench** évalue le suivi d'instructions et l'alignement physique, du point de vue de l'utilité des déroulés comme expérience synthétique \cite{jang2025dreamgen} ;
- **EVA-Bench** insiste sur l'anticipation à long horizon et la robustesse hors domaine — points de vue, agencements, distributions de mouvement \cite{chi2025empowering} ;
- **WorldArena** évalue les rôles fonctionnels : génération de données synthétiques, évaluation de politique, planification d'action \cite{shang2026worldarena} ;
- **WorldEval** teste la préservation du classement relatif entre politiques et checkpoints \cite{li2025worldeval} ;
- **WorldGym** traite le modèle appris comme un environnement interactif pour l'évaluation Monte Carlo de politiques \cite{quevedo2025worldgym} ;
- **World-in-World** intègre des modèles du monde hétérogènes dans une planification en ligne avec replanification \cite{zhang2025world} ;
- **WoW-World-Eval** couvre perception, planification, prédiction, exécution et généralisation, avec un test de Turing fondé sur un modèle de dynamique inverse \cite{fan2026wow} ;
- **WM-ABench** décompose l'évaluation en capacités atomiques : compréhension spatiale et temporelle, perception du mouvement, simulation mécaniste, raisonnement contrefactuel contrôlé \cite{gao2025vision} ;
- **DrivingGen** mesure, pour les modèles de conduite génératifs, la plausibilité de trajectoire, la cohérence temporelle et la contrôlabilité sous conditionnement ego ; il révèle un compromis entre qualité d'apparence et mouvement physiquement fiable \cite{zhou2026drivinggen}.

## 4.6 Mondes numériques, sociaux, scientifiques et ouverts

Dans le monde numérique, **OSWorld** et **macOSWorld** testent l'ancrage dans les interfaces graphiques et la lecture de reçus d'exécution \cite{xie2024osworld,yang2025macosworld} ; **SWE-bench** mesure la résolution de problèmes logiciels inter-fichiers \cite{jimenez2023swebench} ; **WebArena** et **Mind2Web** évaluent l'interaction web \cite{zhou2023webarena,deng2023mind2web} ; **AppAgent** et **AndroidWorld** étendent ces contraintes aux systèmes mobiles \cite{zhang2025appagent,rawles2024androidworld} ; **GameWorld** introduit une évaluation vérifiable d'agents multimodaux \cite{ouyang2026gameworld}.

Dans le monde social, **ToMi** a établi des tests équilibrés de fausse croyance \cite{le2019tomi} ; **BigToM** introduit des gabarits causaux pour l'inférence de croyances \cite{gandhi2023bigtom} ; **OpenToM** étend l'évaluation aux états psychologiques, où les LLM restent nettement en retrait \cite{xu2024opentom} ; **Sotopia** fournit une simulation sociale multidimensionnelle avec négociation et conformité aux normes \cite{zhou2024sotopia} ; **AgentBench** offre une couverture inter-domaines incluant le jeu de rôle \cite{liu2023agentbench} ; les environnements de jeu comme Werewolf et Avalon testent tromperie, confiance et raisonnement social stratégique.

Dans le monde scientifique, **ScienceWorld** teste le raisonnement scientifique élémentaire \cite{wang2022scienceworld} ; **DiscoveryBench** évalue la génération et la vérification d'hypothèses \cite{majumder2024discoverybench} ; **ChemCrow** mesure la synthèse chimique sous contraintes de validité strictes \cite{bran2024augmenting} ; **FutureX** teste la prédiction fondée sur des flux d'information dynamiques \cite{zeng2025futurex}.

Les environnements ouverts — Minecraft, Crafter, NetHack, décrits au §4.1 — combinent plusieurs régimes de lois simultanément : combat physique, économie des ressources et planification à long horizon dans des mondes générés procéduralement. Ils constituent les tests les plus exigeants de composition de compétences.

Des ressources plus générales, telles que **HSSBench** pour le raisonnement en humanités et sciences sociales, peuvent compléter ce paysage, mais elles n'évaluent pas directement des déroulés d'états sociaux utilisables pour la décision \cite{kang2025hssbench}.

# 5. Le modèle du monde comme évaluateur

Un modèle du monde n'est pas seulement un environnement d'entraînement à faible coût. Une fois capable de se substituer à l'environnement, il peut devenir un **évaluateur** : avant toute exécution réelle, il estime quelle action, quelle séquence, quelle politique ou quel **checkpoint** — un instantané des paramètres d'un modèle à un moment de son entraînement — a le plus de chances de réussir. Le rôle d'évaluateur prolonge naturellement celui de simulateur : un modèle qui peut remplacer l'environnement pour entraîner peut aussi le remplacer pour juger.

Trois formes se distinguent, par degré d'engagement croissant.

## 5.1 Classer des actions candidates par déroulé

Dans la forme la plus directe, la politique propose plusieurs séquences d'actions ; le modèle du monde imagine leurs conséquences ; le système retient le candidat dont le futur prédit est le plus favorable.

**GPC** en est un exemple épuré : plutôt que de réentraîner la politique, il augmente au déploiement une politique robotique générative figée avec un modèle du monde conditionné par l'action, et utilise cette anticipation pour classer et affiner les candidats en ligne \cite{gpc}. **IRASim** simule plusieurs trajectoires candidates et sélectionne celle dont la valeur prédite est la plus élevée \cite{Zhu_2025_ICCV}. **World-in-World** ajoute la boucle fermée : les plans candidats sont déroulés en imagination, évalués, révisés puis exécutés \cite{zhang2025world}. **DreamPlan** transforme cette logique de sélection en signal d'entraînement, en construisant des paires de préférences entre actions candidates issues des déroulés \cite{jia2026dreamplanefficientreinforcementfinetuning}.

## 5.2 Optimiser directement dans le modèle : la commande prédictive

La **commande prédictive par modèle** (*Model Predictive Control*, MPC) va plus loin que le classement de quelques candidats prédéfinis : elle optimise activement une séquence d'actions à l'intérieur des trajectoires imaginées, afin de minimiser une fonction de coût.

**TD-MPC2** et **LeWorldModel** montrent qu'une MPC dans l'espace latent améliore considérablement le raisonnement à long horizon des agents incarnés, et qu'une planification fondée sur le gradient à travers le modèle peut découvrir des stratégies absentes des démonstrations d'entraînement \cite{hansen2024tdmpc2,leworldmodel}. Le modèle du monde cesse alors d'être un juge passif des actions : il devient une carte de navigation active pour l'optimisation du contrôle continu.

## 5.3 Évaluer des politiques et des checkpoints en imagination

Une deuxième forme, plus explicite, utilise le modèle comme **proxy** — un substitut moins coûteux — de l'évaluation en conditions réelles. L'objectif n'est plus de choisir la prochaine action, mais de comparer des politiques complètes.

L'évaluation des politiques **Gemini Robotics dans un simulateur Veo** en est un exemple récent à grande échelle : un simulateur vidéo du monde sert à l'évaluation hors ligne de politiques, aux tests hors distribution et aux sondes de sécurité \cite{veorobotics2025}. **WorldEval** examine si un modèle du monde peut classer différentes politiques robotiques — et même différents checkpoints d'une même politique — entièrement en imagination, tout en fonctionnant comme détecteur de sécurité \cite{li2025worldeval}. **WorldArena** identifie l'évaluation de politique comme un usage aval central des modèles du monde incarnés \cite{shang2026worldarena}. **WorldGym** traite le modèle appris comme environnement interactif pour une évaluation Monte Carlo, en vérifiant que les valeurs estimées et les tendances de réussite correspondent à celles du monde réel \cite{quevedo2025worldgym}.

Les critères pertinents deviennent la **cohérence de classement**, la **fidélité des valeurs estimées** et la **capacité à détecter les comportements dangereux** — non la précision pixel à pixel.

## 5.4 Ajouter des têtes de retour explicites

Une troisième forme équipe le simulateur de têtes de sortie qui convertissent directement les déroulés imaginés en signaux d'évaluation : récompense, terminaison, réussite ou progrès.

**World-Env** prédit une récompense continue et la terminaison d'action \cite{xiao2025worldenv}. **VLA-RFT** calcule des récompenses vérifiées sur des trajectoires imaginées dans un simulateur contrôlable \cite{VLARFT}. **World-VLA-Loop** prédit conjointement observations futures et signaux de récompense dans un modèle vidéo sensible à l'état \cite{worldvlaloop}. **RISE** introduit un modèle de valeur de progrès qui évalue les futurs imaginés selon l'avancement de la tâche \cite{RISE}.

Les déroulés imaginés ne sont plus seulement une source de données synthétiques : ils deviennent la base pour décider si un comportement est prometteur, complet ou suffisamment sûr pour être exécuté.

## 5.5 La variante latente : évaluer sans générer de pixels

La lignée JEPA fournit une variante plus légère : prédire et planifier dans l'espace d'embedding, sans générer de futurs visuels explicites.

**V-JEPA 2** et **V-JEPA 2.1** illustrent cette direction ; le second montre qu'un modèle latent conditionné par l'action peut soutenir une planification robotique zéro-coup à partir d'objectifs donnés sous forme d'images \cite{vjepa2,vjepa2_1}. **LeWorldModel** pousse vers une formulation JEPA de bout en bout, plus simple et plus rapide, capable de détecter des événements physiquement implausibles \cite{leworldmodel}.

Ces méthodes sont aujourd'hui davantage des outils de planification prédictive et de vérification de plausibilité que des évaluateurs de politique complets, mais elles confirment un point du §1.1 : le rendu photoréaliste n'est pas une condition nécessaire de l'utilité.

## 5.6 Valider le juge

Un évaluateur n'est utile que si ses futurs imaginés préservent les conséquences causales des actions candidates. **Ctrl-World** rend cette connexion explicite : des déroulés fidèles à l'action peuvent soutenir l'évaluation de politique en imagination \cite{guo2026ctrlworld}. **WoVR** souligne le risque symétrique : les hallucinations et la dérive à long horizon ne dégradent pas seulement la qualité visuelle — elles **corrompent le signal d'évaluation lui-même** \cite{wovr}.

Lorsqu'un modèle sert de juge, il faut donc valider le juge :

- comparer ses classements à ceux obtenus dans le monde réel et mesurer les inversions de classement ;
- tester sa robustesse aux perturbations ;
- calibrer son incertitude ;
- vérifier qu'il n'exploite pas des artefacts propres à son propre simulateur.

> **Pour un décideur.** Avant de confier à un modèle du monde le rôle d'évaluateur — de politiques, de scénarios ou de sécurité —, la question à poser n'est pas « vos simulations sont-elles réalistes ? », mais : « avez-vous vérifié que le classement produit par votre simulateur coïncide avec le classement observé en conditions réelles, y compris sur des interventions absentes de vos données ? »

# 6. Évaluer les modèles du monde incarnés : trois couches

Dans l'intelligence incarnée, la valeur d'un modèle du monde dépend de sa capacité à générer des futurs conditionnés par l'action qui restent cohérents avec la dynamique physique réelle — au-delà du réalisme de surface. L'évaluation s'organise en trois couches complémentaires, qui reprennent les protocoles du §3 et les benchmarks du §4.5.

## 6.1 Couche 1 — Génération conditionnée par l'action, en boucle ouverte

Le modèle reçoit l'observation courante et une séquence d'actions, une instruction en langage naturel ou une spécification de tâche, puis génère les observations futures sans être intégré à un planificateur. La question clé : le futur prédit reste-t-il fidèle au comportement commandé — justesse sémantique, cohérence temporelle, réactivité à l'action — plutôt que simplement plausible visuellement ?

RBench et EWMBench déplacent ainsi l'évaluation du réalisme d'apparence vers la structure de l'interaction incarnée ; DreamGen Bench vérifie que les déroulés sont utiles comme expérience synthétique, et non simplement réalistes ; EVA-Bench ajoute l'anticipation longue et la robustesse hors domaine (§4.5).

Cette couche est facile à standardiser et à passer à l'échelle, mais — conformément au §3.1 — ses résultats doivent être interprétés avec prudence : elle ne prouve pas que le modèle survivra à une boucle de contrôle.

## 6.2 Couche 2 — Utilité en boucle fermée et évaluation de politique

Le modèle est ici intégré dans une boucle de décision interactive : simulateur d'environnement, substrat de planification ou évaluateur de politique, selon les rôles décrits au §5. L'accent se déplace de la plausibilité prédictive vers l'utilité décisionnelle : le modèle préserve-t-il la dynamique nécessaire au classement de politiques, à l'estimation de valeur, à la planification et, finalement, à la réussite de la tâche ?

WorldArena, WorldEval, WorldGym et World-in-World instancient cette couche (§4.5 et §5.3). Elle est plus exigeante que la précédente, car elle expose les erreurs cumulatives qui surviennent quand prédiction et action interagissent dans le temps — et elle répond à la question opérationnelle : **le modèle permet-il de mieux contrôler l'agent ?**

## 6.3 Couche 3 — Diagnostics de contrôlabilité et d'exécutabilité

La troisième couche cherche les causes précises d'un échec, en sondant les propriétés qui déterminent si un déroulé est réellement utilisable pour le contrôle :

- le futur réagit-il aux actions ?
- respecte-t-il la physique et les contraintes de contact ?
- peut-on retrouver une action plausible et exécutable à partir de la trajectoire générée ?
- l'exécution reste-t-elle stable sous perturbation ?
- le modèle préserve-t-il les variables nécessaires au contrôle ?

WorldSimBench combine évaluation perceptuelle et évaluation manipulative ; WoW-World-Eval introduit un test de Turing fondé sur la dynamique inverse — les vidéos générées induisent-elles des actions plausibles et exécutables ? — ; DrivingGen met en évidence le compromis apparence–mouvement en conduite ; WM-ABench isole les capacités atomiques manquantes lorsqu'un système échoue dans les couches précédentes (§4.5).

Les trois couches s'interprètent ensemble : la boucle ouverte vérifie la prédiction conditionnée par l'action ; la boucle fermée vérifie l'utilité décisionnelle ; les diagnostics expliquent la contrôlabilité et l'exécutabilité. Aucune métrique unique ne suffit.

## 6.4 Résultats représentatifs et limites actuelles

Les résultats de manipulation en aval sont le plus souvent synthétisés par taux de réussite et métriques d'achèvement — les indicateurs les plus largement rapportés et les plus directement comparables. Les tableaux \ref{tab:all_libero_total} et \ref{tab:all_other_total} rassemblent des résultats représentatifs, en regroupant les méthodes selon la manière dont la modélisation du monde s'intègre à l'apprentissage de politique : pipelines découplés, troncs communs partagés, architectures à mélanges, formulations vision-langage-action unifiées et modèles latents.

Le tableau \ref{tab:all_libero_total} porte sur le cadre standard à quatre suites de **LIBERO** \cite{liu2023libero}. La répartition en suites Spatial, Object, Goal et Long est conservée à dessein : deux méthodes de moyenne similaire peuvent différer substantiellement selon les sous-ensembles. Le tableau \ref{tab:all_other_total} complète avec **RoboTwin 2.0**, **CALVIN** et les benchmarks de type **SIMPLER**, plus hétérogènes en incarnations et en protocoles — donc moins propices à un classement strict, mais utiles pour révéler la variation entre bancs d'essai \cite{chen2025robotwin,mees2022calvin,li2025evaluating}.

Trois constats se dégagent :

1. **la performance n'est pas liée à un paradigme architectural unique** — des conceptions découplées, partagées, unifiées, à mélanges et latentes obtiennent toutes des résultats compétitifs, ce qui confirme que la génération vidéo photoréaliste n'est pas indispensable au contrôle incarné ;
2. **le long horizon reste le facteur discriminant** — les chutes de réussite se concentrent sur les suites Goal et surtout Long de LIBERO, où le succès dépend d'une cohérence soutenue et ancrée dans l'action (§3.2) ;
3. **la généralisation inter-benchmarks est fragile** — une bonne performance sur un banc d'essai ne se transfère pas nécessairement à un autre : les modèles restent sensibles aux différences d'incarnation, d'espace d'action, de composition de tâche et de protocole, et le compte rendu n'est pas standardisé entre plateformes.

# 7. Fragmentation, biais et standardisation

## 7.1 Cartographier ce que chaque benchmark teste réellement

Aucun benchmark ne couvre les trois conditions aux limites et les quatre régimes de lois. Toute publication devrait donc expliciter la couverture de sa suite d'évaluation, afin d'éviter de transformer une réussite locale en affirmation de généralité.

Une **matrice de couverture** peut utiliser quatre niveaux :

- **Fort (S)** : la capacité est directement et intentionnellement testée par la conception de la tâche et par le score ;
- **Moyen (M)** : la capacité est exercée de manière substantielle mais partielle ou indirecte ;
- **Faible (W)** : le benchmark n'apporte qu'un indice incident ;
- **—** : la capacité n'est pas réellement testée.

Ces étiquettes reposent sur un jugement, mais un jugement discipliné : la conception de la tâche, la visibilité des traces et la possibilité d'identifier sans ambiguïté le type d'échec.

## 7.2 Vers une évaluation consciente de la fonction

Le domaine gagnerait à adopter un protocole commun, indépendant du domaine, mesurant au minimum : la précision de la dynamique, la cohérence temporelle, la plausibilité physique, la contrôlabilité conditionnée par l'action, la sensibilité aux interventions, l'utilité sur la tâche, la calibration de l'incertitude et l'efficacité d'inférence.

Un tel cadre pourrait combiner les sondes physiques désenchevêtrées de WorldBench \cite{upadhyay2026worldbench}, la décomposition perceptuelle de VBench \cite{huang2024vbench} et la normalisation statistique robuste recommandée par Agarwal et al. \cite{agarwal2021precipice}. C'est probablement l'une des contributions méthodologiques les plus utiles que le domaine puisse produire.

L'objectif n'est pas de réduire tous les domaines à un chiffre unique, mais de fournir un **socle comparable** et un profil multidimensionnel. La suite d'évaluation doit être **consciente de la fonction** visée : un modèle destiné à la génération, à la planification, à l'évaluation de politique ou à la sécurité ne doit pas être jugé avec le même poids sur chaque axe. Un ensemble compact de métriques standardisées — réussite de tâche, fidélité du classement de politiques, diagnostics d'exécutabilité — permettrait de distinguer les modèles visuellement plausibles des modèles véritablement actionnables.

## 7.3 Le paquet minimal de reproductibilité (MREP)

L'absence de standardisation favorise des résultats non comparables et le *leaderboard hacking* — l'optimisation d'artefacts propres au classement plutôt que de la capacité visée \cite{henderson2018deep}. Le **Minimal Reproducible Evaluation Package** (MREP) peut servir de standard communautaire, en cinq volets :

1. **Verrouillage des versions.** Hashs exacts des commits de l'environnement et de la définition des tâches.
2. **Journaux de traces.** Observations, actions, états intermédiaires et reçus d'exécution, suffisants pour rejouer l'épisode et attribuer l'échec a posteriori.
3. **Taxonomie des échecs.** Classification automatisée alignée sur les modes de défaillance L2 : dérive, aliasing, insensibilité aux actions, violation de contraintes, mauvaise calibration.
4. **Statistiques de queue.** IQM, intervalles bootstrap stratifiés et profils de performance, plutôt que des estimations ponctuelles \cite{agarwal2021statistical}.
5. **Cartographie des conditions aux limites.** Déclaration explicite des conditions réellement testées.

Une partie de l'outillage existe déjà : journalisation des traces via LangSmith ou W\&B Weave, verrouillage par conteneurisation, statistiques robustes via `rliable`. Les deux briques qui exigent une infrastructure nouvelle sont la taxonomie automatisée des échecs et la cartographie des conditions aux limites.

Le MREP n'est pas seulement une proposition pour comparer des articles. Il constitue l'infrastructure de preuve minimale d'une boucle L3 crédible : les actifs qu'il exige sont précisément ceux dont un gardien de validation a besoin pour décider si une mise à jour du modèle doit être promue ou annulée.

## 7.4 Limites méthodologiques persistantes

Même avec de meilleurs benchmarks et de meilleurs journaux, plusieurs problèmes subsistent :

- **Saturation des benchmarks.** Lorsque les meilleurs systèmes approchent du plafond, le pouvoir discriminant du banc d'essai diminue.
- **Optimisation opportuniste.** Un système peut exploiter les artefacts du benchmark sans acquérir la capacité visée.
- **Coût de l'évaluation humaine.** Elle reste nécessaire pour les scénarios sociaux et ouverts, où les métriques automatiques sont peu fiables, mais elle est coûteuse, variable et difficile à reproduire.
- **Absence de méta-évaluation.** La validité du protocole d'évaluation lui-même — mesure-t-il bien ce qu'il prétend mesurer ? — est rarement testée systématiquement.

Ces limites imposent de publier non seulement les scores, mais aussi les traces, les distributions d'erreurs, les scénarios de rupture et les hypothèses de validité.

# 8. Ancrage réel, sécurité, explicabilité et gouvernance

## 8.1 Le goulot d'étranglement de l'ancrage physique

Le paradigme d'évaluation actuel se heurte à un goulot d'étranglement fondamental : l'absence d'ancrage physique. Les simulateurs virtuels reposent sur des moteurs physiques simplifiés ; un modèle peut y apprendre des raccourcis non causaux qui échouent dans la réalité. Une validation véritable requiert un déploiement en conditions réelles et une interaction physique continue avec des dynamiques stochastiques non modélisées.

Le passage aux plateformes physiques introduit toutefois un compromis critique entre réalisme et rigueur expérimentale. Contrairement à un conteneur logiciel reproductible, une plateforme physique se dégrade avec l'usage, produit des états initiaux difficiles à reproduire et coûte très cher à répliquer. La prochaine frontière méthodologique consiste à normaliser des incarnations robotiques hétérogènes et à isoler le bruit matériel de la capacité propre du modèle.

## 8.2 Sécurité et exploration persistante

Les agents incarnés introduisent des risques physiques bien supérieurs à ceux d'une analyse de données isolée. L'écart entre simulation et réalité ne peut jamais être totalement comblé ; une exploration non testée dans le monde réel reste donc intrinsèquement dangereuse \cite{billard2025roadmap}.

Les modèles du monde atténuent ce risque en servant de simulateurs internes appris : les politiques peuvent être optimisées dans des déploiements imaginés avant tout déploiement effectif, et le modèle fournit à l'inférence des représentations d'état continues et une planification multi-étapes pour anticiper les conséquences. Mais cette atténuation exige des garde-fous :

- des contraintes explicites intégrées au moteur de déroulé ;
- des seuils d'incertitude stricts, qui interrompent l'exécution dès que les prédictions extrapolent vers des régions d'état non sûres ;
- une planification consciente du risque ;
- un apprentissage continu, car environnements, incarnations et tâches évoluent tout au long de la vie opérationnelle de l'agent.

L'exploration sûre n'est donc pas une phase ponctuelle de l'entraînement : c'est une capacité persistante.

## 8.3 Un écosystème triadique : humain, environnement, multi-agents

La sécurité se complexifie encore dans un écosystème dynamique à trois interactions.

**Humain-robot.** La sécurité dépasse l'évitement réactif d'obstacles pour devenir un alignement de type théorie des jeux : les humains modifient leurs contre-actions en fonction de la trajectoire du robot. Les modèles du monde doivent donc intégrer une forme de théorie de l'esprit dans leurs déroulés latents, afin de s'adapter de manière proactive à l'intention humaine implicite — sans transformer cette anticipation en profilage abusif (§8.6).

**Machine-environnement.** La causalité est bidirectionnelle : l'agent modifie son environnement, mais un retour environnemental non stationnaire — fatigue structurelle, déformation thermique — peut à son tour déstabiliser les garanties de contrôle.

**Multi-agents hétérogènes.** Lorsque des agents aux morphologies et modèles internes distincts cohabitent, le risque principal se déplace de la défaillance d'un contrôleur individuel vers une **résonance systémique** : des désalignements asymétriques entre modèles du monde peuvent se propager en collisions distribuées.

## 8.4 Explicabilité et garanties formelles

Pour un déploiement éthique et fiable, l'explicabilité est essentielle à la confiance des opérateurs et à l'attribution des responsabilités. Les modèles du monde offrent une voie plus structurée vers la transparence que les politiques de bout en bout, car ils s'appuient sur une représentation explicite des dynamiques de l'environnement. Cette structure ne rend toutefois pas les réseaux profonds interprétables par elle-même.

Maintenir des dimensions latentes lisibles — vitesse, énergie, contact — pour vérifier des invariants à l'exécution est utile mais insuffisant. Les composants appris doivent être systématiquement intégrés à la théorie du contrôle ou à des cadres de **vérification formelle** — des méthodes mathématiques qui prouvent qu'un système respecte une propriété — afin d'obtenir une stabilité prouvable et la satisfaction des contraintes. L'objectif : que les prédictions héritent de garanties rigoureuses au lieu de rester des extrapolations non contraintes.

## 8.5 Biais d'automatisation et calibration de la confiance

L'explicabilité technique n'élimine pas le risque systémique une fois l'humain dans la boucle. Les sorties très réalistes des modèles du monde peuvent induire un **biais d'automatisation** : la tendance documentée des opérateurs à sur-faire confiance aux prédictions d'un système présenté comme autoritaire, même lorsqu'elles sont erronées ou hors distribution \cite{parasuraman1997humans}.

Cette vulnérabilité tient à la manière dont les explications sont cognitivement reçues, non à la précision du modèle : améliorer l'interprétabilité ne suffit donc pas. Les interfaces destinées aux opérateurs doivent visualiser explicitement l'incertitude épistémique — signaler les déroulés qui s'écartent des distributions validées — afin que la confiance humaine reste calibrée sur la fiabilité objective du système.

## 8.6 Éthique, données et responsabilité

Le déploiement légitime de prédictions centrées sur l'humain impose trois obligations.

1. **Ne pas agir sur des profils biaisés.** Prédire le comportement humain pour planifier une action robotique ne doit pas reposer sur un profilage fondé sur des stéréotypes — contrainte particulièrement difficile à garantir, car ces prédictions alimentent des actions physiques, et non des recommandations que l'on peut rejeter \cite{billard2025roadmap}.
2. **Protéger les données.** Les personnes présentes dans les jeux de données d'interaction physique doivent rester non identifiables ; aucun attribut sensible ne doit être inférable ; les enregistrements ne doivent pas être réutilisés hors de leur finalité initiale. Ces contraintes, nécessaires, restreignent sévèrement la constitution de grands corpus d'interaction humaine \cite{billard2025roadmap}.
3. **Rendre la responsabilité attribuable.** La transparence est une précondition de l'attribution des responsabilités en cas d'accident, mais elle entre en tension directe avec la prévalence commerciale de piles de perception et de contrôle propriétaires, qui résistent à l'audit indépendant \cite{billard2025roadmap}. La responsabilité reste un défi de gouvernance ouvert.

## 8.7 Modèles du monde fédérés et souveraineté des données

Pour agréger des expériences entre institutions sans déplacer les données brutes — et pour composer avec la confidentialité commerciale —, une piste consiste à développer des **modèles du monde fédérés** (*Federated World Models*) : les silos de données locaux restent en place, et les participants n'échangent que des gradients latents ou des poids de réseau.

Ces architectures doivent se protéger contre les attaques par inversion de gradient — qui reconstruisent des données d'entraînement à partir des gradients échangés — au moyen du calcul multipartite sécurisé ou d'**environnements d'exécution de confiance** (TEE), des enclaves matérielles chiffrées. Elles doivent aussi gérer le caractère **non-IID** des institutions — leurs données ne suivent pas la même distribution — en découplant :

- un socle de sens commun physique invariant, appris globalement et partagé ;
- des représentations fortement dépendantes du domaine, conservées localement.

L'équilibre visé : l'intelligence collective sans renoncer à la souveraineté locale des données.

## 8.8 Soutenabilité sur l'ensemble du cycle de vie

Une dernière réserve : les optimisations actuelles se concentrent presque exclusivement sur les coûts énergétiques de la phase opérationnelle — entraînement et inférence — en omettant l'empreinte complète du cycle de vie du matériel : extraction des matériaux, dont les terres rares, synthèse des polymères pour actionneurs souples, fabrication des semi-conducteurs et fin de vie \cite{billard2025designing}.

Le **carbone incorporé** — émis pour fabriquer le matériel — et le **carbone opérationnel** — émis pour le faire fonctionner — sont souvent en tension : optimiser l'un isolément peut amplifier l'autre \cite{lee2025view}. Une affirmation d'efficacité fondée uniquement sur des métriques de calcul reste donc fondamentalement incomplète et doit être interprétée avec prudence.

# 9. Ce qu'une évaluation crédible devrait rapporter

En synthèse du chapitre, une évaluation robuste d'un modèle du monde devrait, au minimum, préciser :

1. **la fonction visée** : génération, planification, contrôle, évaluation de politique, sécurité ou révision du modèle ;
2. **le niveau testé** : L1, L2 ou L3, avec le protocole exact qui justifie cette attribution (§3.5) ;
3. **les conditions aux limites réellement testées** : horizon, interventions et contraintes (§1.3) ;
4. **le cadre d'interaction** : boucle ouverte, boucle fermée ou validation physique (§3.1, §8.1) ;
5. **les métriques complémentaires** : perceptuelles, dynamiques, décisionnelles, statistiques et de latence (§2) ;
6. **les conditions de généralisation** : scénarios hors distribution, objets, tâches, incarnations et dynamiques inédites ;
7. **les traces et distributions d'échec**, et pas seulement un score moyen (§7.3) ;
8. **la calibration de l'incertitude et les règles d'arrêt sûr** (§2.5, §8.2) ;
9. **les versions, graines, intervalles de confiance et ressources de calcul** (§2.6) ;
10. **les limites de validité** : ce que la suite d'évaluation ne teste pas (§7.1).

> La maturité d'un modèle du monde ne se mesure ni à la beauté de ses vidéos, ni même à sa seule précision prédictive. Elle se mesure à la qualité des décisions qu'il rend possibles, à la stabilité de ses simulations sous intervention, à son respect des contraintes — et à sa capacité à reconnaître les situations où il ne sait plus.
