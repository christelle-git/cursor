# Perspectives : vers un cadre unifié

<!-- Réorganisation éditoriale : tous les blocs du fichier source sont conservés ; seuls des intertitres de navigation ont été ajoutés. -->

<claude>
## Analyse des redondances — légende des couleurs (ajout éditorial, rien n'a été supprimé)

Ce chapitre agrège plusieurs sources (definition.md, « not merely injecting » 02/2026, « agentic » 06/2026, WM 2018, « tutorial » 06/2026, « survey archi » 05/2026, « definition & roadmap » 07/2026, « robot survey » 04/2026, entrainement.md, misc.md). Chaque source traitant des mêmes questions avec ses propres mots, **12 thèmes reviennent plusieurs fois** dans le texte. Tous les passages redondants sont surlignés ci-dessous par des balises `<font color="...">` — une couleur par thème — et, pour chaque thème, une **formulation unifiée** est proposée dans une balise `<claude>` juste après cette légende. Aucun passage n'a été supprimé ni déplacé.

| Couleur | Thème redondant | Où le retrouve-t-on ? |
|---|---|---|
| <font color="red">■ rouge</font> | Limites des approches « spécifiques à une tâche » vs vocation originelle des World Models (exploration active) | §1 (×3), §12 |
| <font color="green">■ vert</font> | Plausibilité visuelle ≠ fidélité physique (violations des lois du monde réel) | §1 (×4), §3, §5, §7 (×2), §9 (×2), §11 |
| <font color="blue">■ bleu</font> | Mémoire à long terme, cohérence à long horizon, accumulation d'erreurs | §1, §2, §3, §5, §7 (×3), §9 |
| <font color="orange">■ orange</font> | Multimodalité et capteurs au-delà de la vision (tactile, force, proprioception, 3D, audio) | §2, §5 (×4), §7 (×4) |
| <font color="purple">■ violet</font> | Convergence World Models ↔ modèles de fondation, passage à l'échelle | §4 (×6), §5 |
| <font color="brown">■ marron</font> | Coût de calcul et efficacité (entraînement, inférence, temps réel) | §4, §7 (×8) |
| <font color="teal">■ sarcelle</font> | Sécurité, calibration de l'incertitude, robustesse, interprétabilité | §5, §7, §8 (×5) |
| <font color="magenta">■ magenta</font> | Écart sim-to-real / substitut-vers-réalité | §3, §7, §8, §9 (×2), §11 |
| <font color="olive">■ olive</font> | Boucle fermée : interaction active, auto-évaluation, auto-révision (Trinité, niveau L3) | §4, §5 (×3), §6 (×2), §9 (×4), §11, §12 (×2) |
| <font color="navy">■ marine</font> | Substrat de représentation unifié : « un état, plusieurs décodeurs », latent vs symbolique | §3 (×2), §5 (×4), §7 (×2), §9 (×3), §10, §11, §12 (×4) |
| <font color="deeppink">■ rose</font> | Hiérarchie et abstraction multi-échelle (planification hiérarchique) | §3, §4 (×2), §11, §12 |
| <font color="darkgoldenrod">■ doré</font> | Évaluation et benchmarks : fragmentation, au-delà du réalisme visuel | §5 (×2), §7 (×3), §9 (×3), §12 |

Remarque pédagogique : certains paragraphes touchent deux thèmes à la fois ; dans ce cas les balises sont imbriquées (par ex. un passage marron contenant une phrase bleue).
</claude>

<claude>
**Formulation unifiée — Thème 1 (rouge) : du « tâche-spécifique » à l'exploration active**

Qu'il s'agisse de conduite autonome, de robotique ou de génération vidéo, les approches actuelles restent enfermées dans un paradigme « spécifique à la tâche » : elles affinent de grands modèles sur des données sélectionnées par l'humain pour maximiser un score sur une tâche donnée, et atteignent ainsi un plafond de performance fixé par leurs données d'entraînement. Ce faisant, elles s'écartent de la vocation originelle des modèles du monde : doter des agents de la capacité d'**explorer, découvrir et réagir activement** à des environnements complexes, afin d'améliorer leur compréhension du monde par l'interaction elle-même — et non par la seule injection de données.
</claude>

<claude>
**Formulation unifiée — Thème 2 (vert) : plausibilité visuelle ≠ fidélité physique**

Un fossé systématique sépare la plausibilité visuelle de la fidélité physique. Des LLM/VLM à la génération d'images, de vidéos et de 3D, les modèles produisent des sorties convaincantes à l'œil, mais violent les lois du monde réel : éclairages et ombres incohérents, objets qui disparaissent, lois de conservation ignorées (le meilleur des douze modèles testés sur PhyWorldBench n'atteint qu'un taux de réussite de $0{,}262$). La cause est commune : ces systèmes ajustent des motifs au niveau du pixel — des « représentations optiques » — au lieu d'internaliser les lois physiques (masse, frottement, causalité, permanence des objets). En un mot : des modèles « visuellement riches mais physiquement aveugles ».
</claude>

<claude>
**Formulation unifiée — Thème 3 (bleu) : mémoire et cohérence à long horizon**

La mémoire à long terme est un goulot d'étranglement récurrent. Les architectures compressent l'historique dans un état de taille fixe (LSTM, RSSM) — au risque de l'oubli catastrophique — ou paient un coût d'attention en $O(T^2)$ (Transformers) ; dans les deux cas, les déroulements longs accumulent des erreurs et les scènes perdent leur cohérence (objets qui disparaissent au premier retour de caméra). Un module de mémoire digne de ce nom doit stocker, compresser, fusionner et purger dynamiquement l'information pertinente pour la tâche, afin de garantir des prédictions stables sur des horizons étendus.
</claude>

<claude>
**Formulation unifiée — Thème 4 (orange) : au-delà de la vision, la multimodalité**

Les modèles du monde actuels sont presque exclusivement visuels, alors que le monde réel est intrinsèquement multimodal : toucher, force, proprioception, audio, 3D, langage, signaux d'état et d'action. Ces modalités ne sont pas décoratives : le tactile et la force captent le frottement, la rigidité ou la stabilité des contacts, inobservables par la vision ; la 3D apporte une mémoire cohérente selon le point de vue ; les signaux état–action rendent la prédiction contrôlable. Le défi technique central est d'aligner des flux hétérogènes et asynchrones (fréquences, dimensions et bruits différents) sans que la vision domine, afin de corréler l'ensemble de ces signaux avec la manière dont le monde change.
</claude>

<claude>
**Formulation unifiée — Thème 5 (violet) : la convergence avec les modèles de fondation**

Modèles du monde et modèles de fondation convergent : des systèmes comme Cosmos, Genie, V-JEPA 2 ou Gemini Robotics, entraînés sur des corpus vidéo à l'échelle d'internet, visent à devenir des simulateurs généralistes adaptables à des tâches en aval — reproduisant la trajectoire des modèles de langage, passés du spécifique au généraliste. La promesse : un substrat représentationnel partagé pour la robotique, la conduite autonome et la science. Les réserves : les vidéos internet sous-représentent les interactions physiques et les contacts, et il reste à démontrer empiriquement que les lois d'échelle observées pour le langage s'appliquent à la dynamique physique.
</claude>

<claude>
**Formulation unifiée — Thème 6 (marron) : le coût de calcul, frein transversal**

Le coût de calcul freine le domaine à l'entraînement (dizaines de milliers d'heures-GPU pour les modèles de fondation, $\sim 200\,000$ dollars pour reproduire un générateur vidéo de qualité commerciale) comme à l'inférence (débruitage itératif de la diffusion, déroulements répétés du MPC). Les remèdes convergent : distillation et modèles de cohérence (génération en 1 à 4 étapes), réduction du nombre de tokens ($\Delta$-IRIS, STORM), prédiction dans l'espace latent plutôt que génération complète, adaptateurs légers. L'enjeu dépasse l'ingénierie : il conditionne le déploiement temps réel et l'accessibilité de la recherche hors des grands laboratoires industriels.
</claude>

<claude>
**Formulation unifiée — Thème 7 (sarcelle) : sécurité, calibration, interprétabilité**

Le déploiement dans des domaines critiques (conduite autonome, médecine, robotique) exige trois propriétés encore non résolues : la **calibration** (l'incertitude prédite doit refléter la probabilité réelle d'erreur — ni excès de confiance dangereux, ni prudence paralysante), la **robustesse distributionnelle** (face à la longue traîne des événements rares, précisément là où la prédiction compte le plus) et l'**interprétabilité** (pouvoir expliquer le fondement d'une prédiction lourde de conséquences). Aucune garantie formelle de sécurité n'est aujourd'hui disponible pour les modèles du monde appris.
</claude>

<claude>
**Formulation unifiée — Thème 8 (magenta) : l'écart sim-to-real sous tous ses noms**

L'écart entre simulation et réalité réapparaît sous plusieurs noms : transfert de politiques entraînées « en rêve » vers le monde réel (sim2real), randomisation de domaine et, en science, écart « substitut-vers-réalité » — des substituts neuronaux validés en simulation se dégradent sur des mesures expérimentales réelles. La question commune : comment calibrer un modèle appris avec un budget limité d'observations réelles, et comment garantir que les actions générées respectent les contraintes matérielles (limites de couple, singularités articulaires) ?
</claude>

<claude>
**Formulation unifiée — Thème 9 (olive) : la boucle fermée, fil conducteur du chapitre**

L'idée maîtresse revient sous plusieurs habits : passer de modèles statiques, entraînés passivement sur des données historiques, à des **systèmes en boucle fermée qui agissent, s'évaluent et se révisent**. On la retrouve dans les simulateurs interactifs où l'agent teste ses actions avant l'exécution réelle, dans l'architecture Trinité (Agent–Évaluateur–Modèle du monde) avec génération automatique de curriculum, dans le niveau L3 « Évolueur » qui conçoit des expériences et révise ses lois (CAMEO, A-Lab, FunSearch, AlphaEvolve — cités deux fois dans le chapitre), et dans la métacognition (auto-affinage déclenché par l'écart prédiction–observation, formation autonome d'objectifs). Restent ouverts : la détection de la dérive de déploiement et le trilemme stabilité–plasticité–auditabilité des mises à jour.
</claude>

<claude>
**Formulation unifiée — Thème 10 (marine) : quel substrat de représentation ?**

La question transversale du chapitre : quel état interne unique, compact et physiquement ancré peut soutenir à la fois le rendu, la simulation et la planification — le principe « un état, plusieurs décodeurs » ? La qualité de l'état appris $z_t$ fixe le plafond de tout le reste. Les représentations latentes continues excellent pour apprendre les transitions (L1/L2), mais la révision des lois (L3) plaide pour des substrats symboliques ou hybrides neuro-symboliques — programmes, objets et relations, contraintes explicites — directement modifiables, composables et vérifiables, à l'image des lois de Newton ou des équations de Maxwell.
</claude>

<claude>
**Formulation unifiée — Thème 11 (rose) : hiérarchie et abstraction multi-échelle**

L'intelligence opère du contrôle moteur de bas niveau au raisonnement à long terme. Les modèles actuels, performants à court horizon, doivent apprendre des représentations de plus en plus abstraites qui suppriment les détails non pertinents tout en préservant la structure de haut niveau, afin de permettre prédiction multi-échelle, décomposition de tâches et planification hiérarchique — un objectif encore largement inaccompli dans les environnements ouverts.
</claude>

<claude>
**Formulation unifiée — Thème 12 (doré) : évaluer autrement**

L'évaluation est fragmentée et mal orientée : les benchmarks actuels mesurent le réalisme visuel plutôt que l'utilité fonctionnelle. Il faut des protocoles standardisés et centrés sur la décision, vérifiant que les futurs prédits sont causalement cohérents avec les actions, stables sur de longs horizons et prédictifs de l'exécution réelle (cadres de type MREP : packages d'évaluation reproductibles et verrouillés par version).
</claude>

## 1. Point de départ : pourquoi viser un cadre unifié ?

<!-- source: définition · definition.md#99 -->

## Cadre unifié

<!-- source: définition · definition.md#100 -->

Afin de remédier à la fragmentation de la recherche actuelle et de faciliter le développement de systèmes plus robustes, cette section présente les composantes essentielles d'un cadre normatif de modélisation du monde. Comme l'illustre la figure, le cadre unifié proposé comprend les éléments suivants :

<!-- source: définition · definition.md#101 -->

![World knowledge frame](/home/christelle/Freelance/mon_livre/World_Models/figures/world_knowledge_frame.png)

<!-- source: définition · definition.md#102 -->

Les « World Models » originaux (Ha & Schmidhuber, 2018) \cite{ha2018world} se composaient principalement d'un modèle de vision recevant des entrées issues du monde, d'un modèle de mémoire destiné à la prédiction et au traitement dynamiques, ainsi que d'un contrôleur régissant les sorties du modèle. Cela a permis d'établir une architecture fondamentale efficace pour le cadre des modèles du monde. Cependant, compte tenu des avancées dans des domaines tels que les LLM/VLM, les modèles de diffusion et les VLA, ce cadre de base nécessite d'être étendu et affiné.

<!-- ===== AJOUT depuis not merely injecting 02/2026 (sections 3+) — À TRADUIRE ===== -->

<!-- source: not merely injecting 02/2026 | Limitations of Existing Models Incorporating World Knowledge -->

Cette section analyse les limitations inhérentes aux approches actuelles à travers différents domaines, étayant la nécessité du cadre intégré proposé ci-dessus.

<!-- source: not merely injecting 02/2026 | Limitations of Existing Models Incorporating World Knowledge -->

Pour les grands modèles de langage (LLM) et les modèles vision-langage (VLM) les plus largement appliqués, bien que ces modèles semblent posséder une connaissance étendue du monde, ils reposent fondamentalement sur un ajustement statistique de données d'entraînement à grande échelle. <font color="green">Cette limitation devient évidente dans le raisonnement académique complexe, comme l'incapacité à reconnaître précisément des formules chimiques dans des problèmes d'Olympiades de Chimie, ainsi que dans la reconnaissance multimodale contre-intuitive. Comme le montre la Fig.\ref{fig:challenge}(a), lorsqu'une image non naturelle représentant six doigts est fournie en entrée à un grand modèle, celui-ci peut néanmoins affirmer qu'il n'y a que cinq doigts sur l'image. Cela indique que les grands modèles sont fortement influencés par les données d'entraînement à grande échelle et peinent à discerner des scénarios irréguliers ou non naturels. Ces lacunes des LLM et des VLM suggèrent un manque de perception effective de la complexité du monde réel et une compréhension authentique des lois physiques.</font> Nous soutenons qu'une représentation précise des entrées multimodales au sein d'un cadre spatial et physique améliorerait significativement la compréhension du monde par les modèles.

<!-- source: not merely injecting 02/2026 | Limitations of Existing Models Incorporating World Knowledge -->

Concernant la génération et l'édition d'images, les premières méthodes comme AnyEdit~\cite{yu2025anyedit} et EditWorld~\cite{zeng2025editworld} se concentraient principalement sur la sélection de jeux de données spécifiques à une tâche, enrichis de connaissance du monde, pour améliorer la performance d'édition. Cependant, entraîner des modèles de diffusion directement sur de telles données échoue souvent à gérer des instructions complexes et lourdes en logique. À l'inverse, les cadres intégrant des VLM aux processus de diffusion ont démontré des capacités représentationnelles supérieures par rapport aux méthodes centrées sur les données. Cela renforce notre argument selon lequel l'avancement architectural est plus prometteur que la simple injection de données. Les méthodes d'édition actuelles manquent encore d'une interaction effective avec le monde physique et d'une compréhension spatio-temporelle. <font color="green">Comme le montre la Fig.\ref{fig:challenge}(b), bien que le modèle accomplisse avec succès la tâche d'édition, les résultats ne sont pas conformes aux motifs d'éclairage et d'ombre du monde réel. Cela indique que posséder uniquement des capacités de raisonnement logique et de génération d'images est insuffisant pour produire des images alignées sur les dynamiques du monde réel. Capturer efficacement les changements complexes et fondés sur des règles du monde physique demeure crucial pour les modèles.</font> En résumé, développer un cadre de modèle du monde complet représente une stratégie viable pour faire progresser la génération et l'édition d'images.

<!-- source: not merely injecting 02/2026 | Limitations of Existing Models Incorporating World Knowledge -->

Dans la génération vidéo, la synthèse de vidéos de navigation est fréquemment citée comme une capacité clé des modèles du monde~\cite{li2025hunyuan, zhang2025matrix, zhu2025astra, bahmani2025lyra, ding2025kling, wan2025wan}. <font color="blue">Bien que ces modèles visent à fonctionner comme des simulateurs du monde, ils peinent souvent avec la gestion de la mémoire à long terme. Comme illustré à la Fig.\ref{fig:challenge}(c), lorsqu'on se déplace vers la gauche sur une certaine distance puis qu'on revient vers la droite, les objets initialement présents dans la scène disparaissent de manière notable, ce qui viole clairement les lois physiques ; cela indique que ces modèles se concentrent uniquement sur la prédiction de l'image suivante dans la génération vidéo, manquant d'une mémoire à long terme effective et de capacités de compréhension du monde réel.</font> En outre, nous démontrons la performance des modèles génératifs de pointe existants à la Fig.~\ref{fig:challenge}(d) ; <font color="green">malgré leur haute qualité visuelle, leurs sorties ne parviennent pas à s'aligner sur les principes du monde réel lors de la synthèse de vidéos dynamiques complexes et à grande vitesse. Ces approches continuent d'ajuster des motifs au niveau du pixel plutôt que d'internaliser les lois sous-jacentes du monde, conduisant à des incohérences physiques au fil du temps.</font>

<!-- source: not merely injecting 02/2026 | Limitations of Existing Models Incorporating World Knowledge -->

Les méthodes actuelles de génération 3D souffrent d'une dynamique et d'une scalabilité inadéquates. <font color="green">Les sorties 3D résultantes n'atteignent souvent qu'une « plausibilité visuelle » sans posséder de signification physique authentique ni de propriétés interactives.</font> De plus, contraints par des limites de calcul, les espaces 3D générés directement sont fréquemment limités en échelle, conduisant à des environnements fragmentés. Comme illustré à la Fig.\ref{fig:challenge}(e), bien que la qualité globale de la scène 3D générée par les méthodes existantes semble élevée, les détails présentent une fragmentation et une distorsion notables en raison de la capacité représentationnelle limitée des nuages de points 3D~\cite{chen2025sam, huang2025midi}. Cela démontre en outre que les approches actuelles de génération 3D restent au niveau de l'alignement visuel et peinent à gérer des espaces 3D complexes. Améliorer simplement les stratégies de mémoire demeure insuffisant pour capturer les lois du monde physique réel. Par conséquent, en renforçant de manière holistique les composants de mémoire, de génération multimodale et de raisonnement au sein d'un modèle du monde, la synthèse 3D pourrait transcender les limitations spatiales actuelles et mieux s'aligner sur les principes évolutifs du monde complexe.

<!-- source: not merely injecting 02/2026 | Limitations of Existing Models Incorporating World Knowledge -->

Enfin, pour la conduite autonome et l'IA incarnée, bien que l'intégration de connaissance du monde ait produit des gains de performance, ces méthodes restent confinées à des domaines étroits et spécifiques à une tâche. Elles manquent souvent d'une compréhension profonde de contextes multimodaux complexes à long horizon. Comme le montre la Fig.~\ref{fig:embody_limit}(a), la recherche courante en IA incarnée combine typiquement des bras robotiques avec des modèles de reconnaissance et de raisonnement pour accomplir des tâches de planification simples. Cependant, ces tâches restent relativement basiques et n'évaluent pas les capacités du modèle dans des scénarios complexes du monde réel. Par ailleurs, bien que certains efforts aient déployé la conduite autonome et l'intelligence incarnée dans des applications pratiques, ces réalisations présentent des instabilités notables. La Fig.~\ref{fig:embody_limit}(b) illustre des cas où des véhicules autonomes échouent à gérer des conditions routières relativement simples, mettant en évidence l'écart considérable qui subsiste avant que de tels systèmes puissent naviguer habilement dans des environnements réels complexes. De même, la Fig.~\ref{fig:embody_limit}(c) présente un robot qui, bien que capable d'imiter les mouvements humains avec une fidélité raisonnable, blesse involontairement un humain en raison de son incapacité à dévier d'actions pré-programmées. <font color="red">Ces exemples démontrent collectivement que le simple fait d'intégrer des modèles existants à des systèmes incarnés ne permet que l'exécution de tâches basiques et prédéfinies. Nous soutenons que la conduite autonome et les agents incarnés devraient servir de « porteurs » permettant à un modèle du monde d'explorer l'environnement, tandis qu'un contrôle de haute qualité devrait être une capacité émergente du modèle lui-même. Simplement coupler de grands modèles à du matériel physique~\cite{li2025large} pour améliorer les taux de réussite des tâches s'écarte de l'objectif original des modèles du monde : créer des agents capables d'explorer, de découvrir et de répondre activement à des environnements complexes.</font>

<!-- source: not merely injecting 02/2026 | Discussion: Standardization and Feasibility -->

La proposition d'un cadre de modèle du monde unifié invite à une discussion concernant la faisabilité et les compromis avec l'optimisation spécifique à une tâche.

<!-- source: not merely injecting 02/2026 | Discussion: Standardization and Feasibility -->

Une perspective dominante veut que l'affinage de modèles spécialisés pour des tâches spécifiques (par exemple, la saisie robotique) produise une performance optimale avec des voies d'ingénierie claires. En effet, les cadres unifiés peuvent engendrer des coûts d'entraînement et une complexité plus élevés par rapport à des systèmes hautement optimisés et spécifiques à une tâche. Cependant, cette perspective se concentre sur des métriques de performance statiques. <font color="red">Du point de vue de l'interaction dynamique dans des environnements ouverts, les modèles spécifiques à une tâche atteignent souvent un plafond de performance défini par leurs données d'entraînement.</font> Un cadre unifié offre la base structurelle pour le transfert de connaissance entre tâches et l'apprentissage tout au long de la vie, tous deux essentiels à une compréhension générale du monde.

<!-- source: not merely injecting 02/2026 | Discussion: Standardization and Feasibility -->

Une autre considération est de savoir si un cadre unifié pourrait étouffer la diversité technologique. On peut soutenir que des sous-problèmes comme la perception et le raisonnement sont distincts et requièrent des architectures spécialisées. Cependant, l'« unification » proposée ici n'implique pas un réseau rigide et monolithique. Elle prône au contraire des spécifications fonctionnelles modulaires et des interfaces standardisées. En définissant comment les composants centraux (interaction, mémoire, raisonnement) collaborent, un cadre standardisé peut faciliter l'intégration et l'évaluation comparative d'efforts de recherche divers. Cette approche vise à réorienter l'attention des développements redondants de bas niveau vers l'optimisation de système de haut niveau, accélérant potentiellement l'avancement global du domaine.

<!-- source: entrainement · entrainement.md#30 -->

<font color="red">Cependant, ces méthodes existantes visant à intégrer des connaissances du monde réel dans les tâches reposent toujours sur le réglage fin des modèles à l’aide de données spécifiques à la tâche et sélectionnées par des humains. Même les recherches les plus pointues et les plus commentées à l’heure actuelle s’inscrivent dans ce même schéma (OpenAI, 2024; Tongyi, 2025; Sun et al., 2025; Chitta et al., 2025) \cite{openai2024sora, tongyi2025wa, sun2025worldplay, chitta2025gaia2}. Si cela peut améliorer les performances sur des tâches particulières, cela ne rompt pas avec le paradigme inhérent aux tâches en aval. Par conséquent, ces approches restent incapables d’explorer, de découvrir et de réagir activement à des environnements réels complexes, s’écartant ainsi de l’objectif de recherche initial des modèles du monde. L’objectif fondamental d’un modèle du monde est de permettre à de grands modèles et à des agents d’améliorer leur compréhension d’un monde complexe grâce à une interaction active avec celui-ci, afin de produire des analyses et des réponses plus précises.</font>


## 2. Les quatre composants du cadre : interaction, raisonnement, mémoire, environnement

<!-- source: définition · definition.md#103 -->

**Interaction** : La valeur fondamentale d'un modèle du monde réside dans sa capacité à établir des interactions bidirectionnelles et multimodales avec des environnements complexes et des utilisateurs. Par conséquent, son module d'interaction doit évoluer au-delà du « modèle de vision » du cadre initial pour devenir une interface perceptuelle et opérationnelle unifiée. Comme le montre la figure 2(a), cette interface nécessite deux capacités essentielles :

<!-- source: définition · definition.md#104 -->

1. **Une perception généralisée** : <font color="orange">Permettant la compréhension et le traitement d'entrées multimodales telles que le texte, les images, les vidéos, les fichiers audio, les nuages de points 3D et les maillages afin de former une représentation unifiée de l'état du monde.</font>
2. **Une opération généralisée** : Permettant l'analyse et l'exécution d'instructions de tâches diverses. Ces instructions incluent non seulement le langage naturel ou les commandes d'interaction incarnées provenant des utilisateurs (telles que le déplacement, la rotation ou le glissement), mais aussi des signaux de contrôle de mouvement de bas niveau destinés à des agents tels que des robots ou des véhicules.

<!-- source: définition · definition.md#105 -->

Pour parvenir à une interaction en boucle fermée efficace et fiable, le module d'interaction du modèle du monde doit unifier la planification, l'encodage et l'organisation de ces données perceptives hétérogènes et de ces signaux opérationnels, fournissant ainsi des données structurées pour les processus ultérieurs de raisonnement, de mémoire et de génération.

<!-- source: définition · definition.md#106 -->

**Raisonnement** : Pour appréhender la nature complexe et dynamique du monde réel, un modèle du monde doit comporter un composant central dédié au raisonnement sur les dynamiques complexes et les relations de causalité. À l’heure actuelle, les grands modèles de langage (LLM) et les grands modèles vision-langage (VLM) intégrant le raisonnement explicite ont démontré des capacités analytiques remarquables. Une stratégie courante et efficace consiste à les utiliser au sein d'un modèle du monde, comme l'illustre la figure 2(b).

<!-- source: définition · definition.md#107 -->

Le raisonnement explicite transforme les observations multimodales et les informations interactives en descriptions textuelles ou en chaînes de raisonnement, en tirant parti des puissantes capacités de raisonnement symbolique et de planification des LLM pour déduire des lois physiques, prédire des états futurs ou formuler des stratégies de haut niveau. Ce raisonnement véhiculé par le texte offre une grande transparence et est relativement facile à aligner et à vérifier par rapport à l'intuition humaine.

<!-- source: définition · definition.md#108 -->

Cependant, pour les scénarios nécessitant la gestion de détails physiques sous-symboliques et continus, le raisonnement explicite peut entraîner une perte d'information, rendant ainsi l'introduction du raisonnement latent plus appropriée. Cette approche permet de raisonner directement au sein d'un espace latent unifié, en exploitant conjointement les informations multimodales encodées issues de la vision, du langage, de l'action, etc.

<!-- source: définition · definition.md#109 -->

Quelle que soit l'approche algorithmique retenue, le module de raisonnement d'un modèle du monde doit fondamentalement posséder la capacité d'effectuer une inférence rationnelle sur les entrées, générant ainsi un contenu plus structuré et cohérent.

<!-- source: divers · misc.md#22 -->

### Raisonnement fondé sur la connaissance du monde

<!-- source: divers · misc.md#23 -->

Tout d’abord, les grands modèles linguistiques et les modèles vision-langage (LLM/VLM) ayant démontré de puissantes capacités de raisonnement et de généralisation, certaines études se sont appuyées sur ces fondements pour améliorer encore les capacités de raisonnement des modèles concernant des mondes physiques complexes et des concepts logiques difficiles. Cette catégorie de travaux comprend principalement : le raisonnement multimodal général représenté par OpenAI O3 (Wang et al., 2025a; Bai et al., 2025b; Liang et al., 2025) \cite{wang2025simple, bai2025multistep, liang2025multimodal}, les recherches liées au raisonnement spatial (Yang et al., 2025c; Chen et al., 2024a) \cite{yang2025cambrians, chen2024spatialvlm}, ainsi que le raisonnement appliqué à des problèmes de compétition complexes (Chai et al., 2025; Qiu et al., 2025) \cite{chai2025scimaster, qiu2025physics}, et le raisonnement à partir d’entrées multimodales telles que l’audio, la 3D et les vidéos longues (Tian et al., 2025; Xie et al., 2025b; a; Liu et al., 2025a; Shi et al., 2025a; Huang et al., 2025a; Shi et al., 2025c; Wiedemer et al., 2025; Lu et al., 2025; Chen et al., 2025b; An et al., 2024; Lin et al., 2025b; Guo et al., 2025) \cite{tian2025stepaudior1, xie2025miniomnireasoner, xie2025audioreasoner,
liu2025thinksound, shi2025sam, huang2025surprise3d, shi2025mavors,
wiedemer2025video, lu2025see4d, chen2025versavidr1, an2024mcllava,
lin2025perceive, guo2025video}. Parallèlement, grâce aux progrès des capacités de raisonnement des grands modèles et des agents, certaines méthodes (Park et al., 2023; Tan et al., 2025) \cite{park2023generative, tan2025lumine} ont encore renforcé les capacités interactives, permettant aux agents de faire preuve de mémoire à long terme et d’interagir au sein d’environnements virtuels complexes. Cependant, malgré la puissance de raisonnement déjà considérable des grands modèles, ceux-ci sont encore confrontés à des défis importants pour parvenir à une perception précise du monde physique complexe, générer des représentations de sortie dans davantage de modalités et interagir avec le monde physique réel.

<!-- source: définition · definition.md#110 -->

**Mémoire** : <font color="blue">Pour garantir la cohérence et la continuité dans le cadre de tâches physiques complexes et continues, un modèle du monde doit disposer de capacités de mémoire à long terme robustes.</font> Les mécanismes de mémoire ont évolué, passant d'un stockage implicite des états basé sur des réseaux récurrents tels que les LSTM (Hochreiter & Schmidhuber, 1997 ; Beck et al., 2024) \cite{hochreiter1997long, beck2024xlstm} vers une mémoire explicite à grande échelle utilisant l'architecture Transformer avec des fenêtres de contexte longues (Beltagy et al., 2020 ; Dao et al., 2022 ; Dao, 2023 ; Ji et al., 2025) \cite{beltagy2020longformer, dao2022flashat, dao2023flashattention2, ji2025memflow}.

<!-- source: définition · definition.md#111 -->

Comme l'illustre la figure 2(c), confronté à des flux d'interactions multimodaux et à forte concurrence dans un monde ouvert, le module de mémoire d'un modèle du monde doit transcender le simple stockage séquentiel et parvenir à une gestion structurée et dynamique de l'information. Cela exige que le système classe, associe et fusionne efficacement les données d'expérience provenant de différentes modalités et sources, construisant ainsi un système de connaissances interne unifié et interrogeable.

<!-- source: définition · definition.md#112 -->

Parallèlement, compte tenu des contraintes liées aux ressources de calcul, <font color="blue">le système de mémoire doit être capable d'extraire et de compresser les informations clés (Yang et al., 2025c) \cite{yang2025cambrians}, en filtrant et en conservant activement les états et les événements essentiels à la tâche. De plus, la mémoire doit être un processus évoluant de manière dynamique : à mesure que les interactions progressent, le système doit continuellement fusionner, mettre à jour et purger le contenu stocké redondant afin de garantir sa pertinence et sa concision.</font>

<!-- source: définition · definition.md#113 -->

**Environnement** : L'entraînement et la validation d'un modèle du monde sont indissociables d'un support environnemental interactif et contrôlable. Nous soutenons que l'environnement doit englober à la fois le monde physique complexe et des environnements de simulation, tout en constituant simultanément une part intégrante du modèle du monde qui reçoit et actualise ses états à partir des sorties des autres composantes, comme l'illustre la partie gauche de la figure 2.

<!-- source: définition · definition.md#115 -->

Nous plaidons pour que l'architecture environnementale des modèles du monde soit dotée de capacités génératives et extensibles. Plus précisément, des techniques telles que les méthodes de génération 3D (Li et al., 2025c ; Yu et al., 2025a) \cite{li2025flashworld, yu2025wonderworld} et la génération procédurale de contenu devraient être mises à contribution pour synthétiser dynamiquement des scènes virtuelles quasi infinies et de haute fidélité. Un tel environnement génératif ne doit pas seulement faire office de « rendu » de scènes, mais agir en tant que simulateur physiquement cohérent, capable de répondre à des interactions complexes et de produire des évolutions dynamiques conformes aux lois du monde réel. Cela permettrait d'entraîner les modèles du monde sur une distribution de contextes extrêmement riche et réaliste, renforçant ainsi leurs aptitudes de généralisation et d'adaptation face à des scénarios réels, ouverts et inconnus.


## 3. Trajectoire historique : des lois explicites aux modèles neuronaux

<!-- ===== AJOUT depuis agentic 06/2026 (sections 3+) — À TRADUIRE ===== -->

<!-- source: agentic 06/2026 | Trends \& Open Problems -->

Les sections précédentes ont établi L1--L3 comme une échelle de capacités pour les modèles du monde.
Nous situons maintenant cette échelle historiquement (Figure~\ref{fig:historical_timeline}), passons en revue la frontière de recherche qui fait progresser chaque échelon, et recensons les problèmes ouverts dont la résolution déterminera si les modèles du monde mûrissent, passant de démonstrations impressionnantes à des outils scientifiques et d'ingénierie fiables.

<!-- source: agentic 06/2026 | Trends \& Open Problems -->

L'impulsion à construire des modèles prédictifs de la réalité précède de loin l'intelligence artificielle.
Les \emph{Principia} de Newton~\citep{newton1687principia} ont fourni le premier modèle du monde mathématique unifié : à partir de positions et de vitesses initiales, ses lois du mouvement et de la gravitation pouvaient, en principe, prédire des états futurs arbitraires d'un système mécanique.
\citet{laplace1814essai} a distillé cette ambition dans l'expérience de pensée aujourd'hui connue sous le nom de « démon de Laplace », une intelligence qui, disposant d'une connaissance complète du présent, pourrait calculer l'avenir tout entier de l'univers.
\citet{turing1950computing} a ensuite posé la question de savoir si les machines pouvaient penser, établissant le pont conceptuel entre la modélisation mathématique et l'intelligence artificielle.
Ces développements ont établi la tension fondamentale qui persiste aujourd'hui : le compromis entre la fidélité du modèle et l'horizon traitable.
Les fondements philosophiques de cette progression, de l'empirisme de Hume aux a priori structurels de Kant jusqu'à la révision gouvernée de Lakatos, sont discutés à la Section~\ref{sec:philosophy}.

<!-- source: agentic 06/2026 | Trends \& Open Problems -->

Les premières IA tentaient de coder à la main des modèles du monde sous forme de règles et de contraintes logiques. STRIPS~\citep{fikes1971strips} a introduit la première représentation par schémas d'action pour la planification robotique, mais le Problème du Cadre (Frame Problem)~\citep{mccarthy1969some} (voir Section~\ref{subsec:l2_requirements}) a révélé que chaque action requiert des axiomes explicites spécifiant ce qui \emph{ne} change \emph{pas}, un fardeau qui croît de manière combinatoire.
Le rapport Lighthill~\citep{lighthill1973artificial} a catalysé le premier hiver de l'IA (1974-1980) en exposant l'écart entre les démonstrations en laboratoire et la compétence en conditions réelles.
Le second hiver (1987-1993) a suivi la fragilité des systèmes experts et l'effondrement du marché des machines Lisp : des bases de connaissances élaborées à la main comme CYC ne pouvaient pas gérer avec souplesse l'incertitude et les exceptions de sens commun~\citep{lenat1995cyc}.
La leçon générale était claire : les modèles du monde purement symboliques ne passent pas à l'échelle des domaines ouverts.

<!-- source: agentic 06/2026 | Trends \& Open Problems -->

Le renouveau des réseaux de neurones, de la rétropropagation~\citep{rumelhart1986learning} aux réseaux convolutifs profonds~\citep{lecun1998gradient,krizhevsky2012imagenet} et aux Transformeurs~\citep{vaswani2017attention}, a fait basculer le paradigme des règles codées à la main vers des représentations apprises.
Les modèles du monde ont réémergé dans l'apprentissage par renforcement fondé sur des modèles, des modèles de dynamique latente jusqu'au contrôle général fondé sur les pixels (voir Section~\ref{sec:l1} pour les détails).

<!-- source: agentic 06/2026 | Trends \& Open Problems -->

Les modèles de diffusion~\citep{ho2020ddpm} et les grands modèles de langage à grande échelle tels que GPT-3~\citep{brown2020gpt3} ont catalysé un changement qualitatif, en s'appuyant sur l'architecture Transformer établie durant l'ère précédente.
Les modèles de génération vidéo~\citep{brooks2024sora,nvidia2025cosmos,bruce2024genie} et les agents fondés sur les LLM~\citep{hao2023reasoning,wang2023voyager} brouillent la frontière entre prédiction et simulation, <font color="green">bien que des violations systématiques de la physique persistent~\citep{gu2025phyworldbench}</font> (Sections~\ref{sec:l1}--\ref{sec:l2}).
<font color="navy">Plus largement, le domaine converge vers une frontière \emph{neuro-symbolique}~\citep{marra2024neurosymbolic_survey,zhao2026neurosymbolic_synergy} qui combine des modules de dynamique neuronale pour l'apprentissage des fonctions de transition (L1/L2) avec des composants symboliques pour l'application de contraintes et l'expansion de l'espace des hypothèses (L3).</font>

<!-- source: agentic 06/2026 | Trends \& Open Problems -->

<font color="navy">À travers les quatre ères, l'apprentissage de représentation sert d'infrastructure partagée : la qualité de l'état appris $z_t$ détermine le plafond pour la prédiction (L1), la simulation (L2) et la révision (L3) à parts égales. Que la représentation soit un vecteur latent, une séquence de tokens discrets, un nuage de points 3D ou un programme, le régime de lois régissant le domaine détermine quels invariants la représentation doit préserver.</font>

<!-- source: agentic 06/2026 | Trends \& Open Problems -->

Cet arc historique suggère une leçon constante : le progrès de la modélisation du monde n'est pas venu de la seule échelle,
mais du changement de ce qui est représenté, de ce qui est compositionnel sur l'horizon, et de ce qui peut être révisé à partir des
preuves. Les problèmes ouverts ci-dessous sont organisés autour des goulots d'étranglement restants à L1, L2 et L3.

<!-- ===== AJOUT depuis WM 2018 (sections 3+) — À TRADUIRE ===== -->

<!-- source: WM 2018 | Discussion -->

Nous avons démontré la possibilité d'entraîner un agent à accomplir des tâches entièrement à l'intérieur de son monde de rêve simulé en espace latent. Cette approche offre de nombreux avantages pratiques. Par exemple, faire fonctionner des moteurs de jeu intensifs en calcul requiert l'utilisation de ressources de calcul lourdes pour rendre les états du jeu en images, ou pour calculer une physique qui n'est pas immédiatement pertinente pour le jeu. Nous pourrions ne pas vouloir gaspiller des cycles à entraîner un agent dans l'environnement réel, mais plutôt entraîner l'agent autant de fois que nous le souhaitons à l'intérieur de son environnement simulé. Entraîner des agents dans le monde réel est encore plus coûteux, <font color="magenta">si bien que des modèles du monde entraînés de manière incrémentale pour simuler la réalité pourraient s'avérer utiles pour transférer des politiques vers le monde réel. Notre approche pourrait compléter les approches de \textit{sim2real} décrites dans \cite{Bousmalis2017,Higgins2017}.</font>

<!-- source: WM 2018 | Discussion -->

En outre, nous pouvons tirer parti des cadres d'apprentissage profond pour accélérer nos simulations de modèle du monde en utilisant des GPU dans un environnement distribué. L'avantage d'implémenter le modèle du monde comme un graphe de calcul récurrent entièrement différentiable signifie également que nous pourrions être en mesure d'entraîner nos agents dans le rêve directement à l'aide de l'algorithme de rétropropagation, afin d'affiner sa politique pour maximiser une fonction objectif \cite{s05_making_the_world_differentiable,s05a_cm,s05b_rl}.

<!-- source: WM 2018 | Discussion -->

Le choix d'utiliser un VAE pour le modèle V et de l'entraîner comme un modèle autonome comporte également ses limites, car il peut encoder des parties des observations qui ne sont pas pertinentes pour une tâche. Après tout, l'apprentissage non supervisé ne peut, par définition, savoir ce qui sera utile pour la tâche à accomplir. Par exemple, il a reproduit des motifs de carreaux de brique détaillés mais sans importance sur les murs latéraux de l'environnement Doom, mais a échoué à reproduire les marquages pertinents pour la tâche sur la route dans l'environnement Car Racing. En s'entraînant conjointement avec un modèle M qui prédit les récompenses, le VAE peut apprendre à se concentrer sur les zones de l'image pertinentes pour la tâche, mais le compromis ici est que nous pourrions ne pas être en mesure de réutiliser efficacement le VAE pour de nouvelles tâches sans réentraînement.

<!-- source: WM 2018 | Discussion -->

L'apprentissage de caractéristiques pertinentes pour la tâche a également des liens avec les neurosciences. Les neurones sensoriels primaires sont libérés de l'inhibition lorsque des récompenses sont reçues, ce qui suggère qu'ils apprennent généralement des caractéristiques pertinentes pour la tâche, plutôt que des caractéristiques quelconques, du moins à l'âge adulte~\cite{Pi2013}.

<!-- source: WM 2018 | Discussion -->

<font color="blue">Une autre préoccupation concerne la capacité limitée de notre modèle du monde. Alors que les dispositifs de stockage modernes peuvent conserver de grandes quantités de données historiques générées au cours de la procédure d'entraînement itérative, notre modèle du monde fondé sur les LSTM~\cite{lstm,s12_lstm_forget} pourrait ne pas être en mesure de stocker toute l'information enregistrée à l'intérieur de ses connexions pondérées. Alors que le cerveau humain peut conserver des décennies, voire des siècles de souvenirs à une certaine résolution~\cite{brain_capacity}, nos réseaux de neurones entraînés par rétropropagation ont une capacité plus limitée et souffrent de problèmes tels que l'oubli catastrophique~\cite{Ratcliff1990,French1994,Kirkpatrick2016}. Des travaux futurs pourraient explorer le remplacement du petit réseau MDN-RNN par des modèles à plus grande capacité~\cite{outrageously_large_neural_nets,hypernetworks,suarez2017,wavenet,attention}, ou l'incorporation d'un module de mémoire externe~\cite{Gemici2017}, si nous voulons que notre agent apprenne à explorer des mondes plus compliqués.</font>

<!-- source: WM 2018 | Discussion -->

Comme les premiers systèmes C--M fondés sur les RNN~\cite{s05_making_the_world_differentiable,s05a_cm,s05b_rl,s05c_boredom}, le nôtre simule des futurs possibles pas de temps par pas de temps, <font color="deeppink">sans profiter d'une planification hiérarchique ou d'un raisonnement abstrait de type humain, qui ignore souvent des détails spatio-temporels non pertinents.</font> Cependant, l'approche plus générale \textit{Learning To Think}~\cite{learning_to_think} ne se limite pas à cette approche plutôt naïve. Elle permet au contraire à un C récurrent d'apprendre à s'adresser à des \textit{sous-routines} du M récurrent, et de les réutiliser pour résoudre des problèmes de manières calculables arbitraires, par exemple à travers une planification hiérarchique ou d'autres formes d'exploitation de parties de la matrice de poids de M, de type programme. Une extension récente de l'approche C--M, \textit{One Big Net}~\cite{onebignet2018},
fusionne C et M en un seul réseau, et utilise une relecture comportementale de type PowerPlay~\cite{s10_powerplay,s11_powerplay} (où le comportement d'un réseau enseignant est compressé dans un réseau étudiant~\cite{chunker91and92}) pour éviter d'oublier d'anciennes compétences de prédiction et de contrôle en en apprenant de nouvelles. Les expériences avec ces approches plus générales sont laissées pour des travaux futurs.


## 4. Convergence avec les modèles de fondation

<!-- ===== AJOUT depuis tutorial 06/2026 (sections 3+) — À TRADUIRE ===== -->

<!-- source: tutorial 06/2026 | Physical AI › Foundation Models for Physical AI: Toward Generalist Embodied Intelligence -->

<font color="purple">Les modèles fondation sont des modèles à grande échelle entraînés sur des données diverses pour apprendre des représentations généralistes pouvant être adaptées à un large éventail de tâches en aval \cite{Bommasani2021}. Dans le contexte de l'IA physique, ils visent à capturer une large connaissance du monde qui s'étend au-delà des modèles du monde spécifiques à une tâche.</font>

<!-- source: tutorial 06/2026 | Physical AI › Foundation Models for Physical AI: Toward Generalist Embodied Intelligence -->

<font color="purple">Un exemple représentatif est Cosmos, entraîné sur des données vidéo à grande échelle couvrant des domaines divers \cite{Nvidia2025}. En apprenant à partir d'une expérience visuelle étendue, Cosmos capture des schémas généraux de dynamique des objets, d'interactions et de structure environnementale, fournissant un a priori partagé transférable à travers des tâches telles que la robotique et la conduite autonome. En ce sens, il peut être considéré comme un modèle fondation du monde qui généralise le rôle des modèles du monde au-delà des tâches individuelles.</font>

<!-- source: tutorial 06/2026 | Physical AI › Foundation Models for Physical AI: Toward Generalist Embodied Intelligence -->

Une autre direction importante est illustrée par Gemini Robotics, qui s'appuie sur des modèles vision-langage à grande échelle et les étend à des contextes incarnés \cite{GeminiRobotics2025}. Plutôt que d'apprendre la connaissance du monde à partir de zéro, de tels systèmes exploitent des modèles fondation préentraînés et les adaptent à la perception et à l'action grâce à des données multimodales et d'interaction supplémentaires. Cela permet aux robots d'accomplir des tâches complexes en combinant connaissance générale et adaptation spécifique à la tâche.

<!-- source: tutorial 06/2026 | Physical AI › Foundation Models for Physical AI: Toward Generalist Embodied Intelligence -->

<font color="purple">Ces développements suggèrent une progression naturelle des modèles du monde vers les modèles fondation. Alors que les modèles du monde traditionnels sont souvent entraînés pour des environnements ou des tâches spécifiques, les modèles fondation visent à capturer une connaissance du monde généraliste, réutilisable à travers les domaines.</font> Dans cette perspective, les modèles du monde explicites et implicites peuvent être vus comme des blocs de construction complémentaires : les modèles explicites fournissent un raisonnement structuré via la simulation, tandis que les modèles implicites offrent un apprentissage de représentation scalable à partir de grandes données.

<!-- source: tutorial 06/2026 | Physical AI › Foundation Models for Physical AI: Toward Generalist Embodied Intelligence -->

Pour l'avenir, un défi clé consiste à intégrer ces capacités au sein de systèmes unifiés pour l'IA physique. De tels systèmes combineraient la capacité à apprendre une connaissance générale du monde à grande échelle avec la capacité de raisonnement, de prédiction et d'action dans des environnements réels, évoluant vers des formes d'intelligence plus générales et adaptatives.

<!-- source: tutorial 06/2026 | Pathways and Challenges toward AGI -->

Les développements discutés tout au long de ce tutoriel suggèrent que les modèles du monde constituent une base prometteuse pour progresser vers l'intelligence artificielle générale (AGI) \cite{Hendrycks2025}. En permettant aux agents de représenter, prédire et raisonner sur la structure du monde, les modèles du monde explicites et implicites soutiennent une intelligence plus généralisable et efficace en données que les approches purement réactives. Les progrès récents en préentraînement à grande échelle, en apprentissage de représentation prédictive et en IA physique indiquent en outre que la modélisation du monde évolue de la prédiction spécifique à une tâche vers des formes plus larges de compréhension du monde. Cependant, des défis importants demeurent avant que de tels systèmes puissent atteindre une intelligence et une autonomie de niveau humain. Les principales voies et défis vers l'AGI peuvent être résumés comme suit :

<!-- source: tutorial 06/2026 | Pathways and Challenges toward AGI -->

\begin{itemize}
    \item \textbf{Modélisation du monde unifiée.} Une direction centrale vers l'AGI est l'intégration de la modélisation du monde explicite et implicite. Les modèles explicites fournissent une dynamique structurée et soutiennent le raisonnement, la planification et l'évaluation contrefactuelle fondés sur des déroulements. Les modèles implicites, en revanche, encodent une riche connaissance du monde au sein de représentations scalables apprises à partir de données à grande échelle. Les systèmes futurs combineront probablement ces forces complémentaires, intégrant la prédiction structurée à l'apprentissage de représentation pour atteindre à la fois la capacité de raisonnement et la scalabilité. De tels systèmes doivent également rester ancrés dans l'interaction physique et la rétroaction du monde réel, permettant une adaptation robuste à travers des environnements divers.
    \item <font color="deeppink">\textbf{Prédiction et planification hiérarchiques.} L'intelligence humaine opère à travers de multiples niveaux d'abstraction et échelles de temps, allant du contrôle moteur de bas niveau au raisonnement et à la planification à long terme. Les modèles du monde actuels démontrent des capacités prometteuses en prédiction et planification à court horizon, mais restent limités en raisonnement hiérarchique sur des horizons temporels étendus. Alors que la prédiction à court terme peut s'appuyer sur des représentations sensorielles de bas niveau, le raisonnement à long horizon requiert des représentations de plus en plus abstraites qui suppriment les détails non pertinents tout en préservant la structure de haut niveau. Atteindre l'AGI pourrait donc nécessiter des modèles du monde hiérarchiques capables de prédiction multi-échelle, de décomposition de tâches et de planification abstraite à travers différents niveaux d'abstraction et échelles temporelles \cite{LeCun2022}.</font>
    \item <font color="olive">\textbf{Formation d'intentions et d'objectifs.} Enfin, les modèles actuels manquent d'une notion explicite d'intention et de formation d'objectifs, pourtant centrales à l'intelligence humaine. Les systèmes existants peuvent optimiser des objectifs prédéfinis ou suivre des instructions externes, mais ils ne possèdent généralement pas de mécanismes intrinsèques pour générer, sélectionner et adapter des objectifs selon le contexte. L'intelligence humaine se caractérise non seulement par la capacité à prédire et à agir, mais aussi par la capacité à former de manière autonome des intentions, à prioriser des objectifs et à ajuster son comportement de façon flexible face à des environnements changeants. Résoudre cette limitation requiert de dépasser les systèmes réactifs ou guidés de l'extérieur pour aller vers des agents capables de construire et de raisonner en interne sur des objectifs, représentant une étape critique vers l'AGI.</font>
\end{itemize}

<!-- source: tutorial 06/2026 | Conclusions -->

Ce tutoriel a présenté les modèles du monde comme un cadre unificateur pour les systèmes intelligents, distinguant les modèles explicites, qui soutiennent le raisonnement fondé sur des déroulements grâce à une dynamique structurée, des modèles implicites, qui encodent une structure prédictive au sein de représentations apprises scalables. Ensemble, ces paradigmes complémentaires fournissent une base pour l'IA physique, permettant une intelligence pilotée par la prédiction au-delà du contrôle réactif dans des domaines tels que la robotique et la conduite autonome, <font color="purple">tandis que les modèles fondation récents suggèrent une voie vers des systèmes unifiés intégrant perception, prédiction et action.</font>

<!-- source: tutorial 06/2026 | Conclusions -->

Malgré des progrès rapides en modélisation du monde et en modèles fondation, d'importants écarts subsistent entre les systèmes actuels et l'intelligence humaine. <font color="deeppink">Les modèles existants peinent encore à construire des représentations prédictives abstraites à travers de multiples échelles temporelles, à effectuer un raisonnement robuste à long horizon</font>, et <font color="olive">à générer et adapter de manière autonome des objectifs dans des environnements ouverts</font>. Résoudre ces limitations nécessitera des avancées allant au-delà du seul passage à l'échelle, incluant la modélisation du monde hiérarchique, l'interaction incarnée, et des architectures capables d'intégrer prédiction, planification et formation autonome d'objectifs.

<!-- contexte : Discussion and Future Directions -->

<!-- source: survey archi 05/2026 -->

Les sections précédentes ont retracé l'évolution des modèles du monde, depuis les premières représentations symboliques fondées sur des cadres jusqu'à la génération actuelle de simulateurs neuronaux à plusieurs milliards de paramètres, en mettant en évidence les avancées en matière d'architectures, de paradigmes méthodologiques, de stratégies de raisonnement et un éventail toujours plus diversifié de domaines d'application. Dans cette section finale, nous prenons du recul par rapport aux détails techniques pour considérer un ensemble plus large de questions qui, selon nous, sont susceptibles de façonner la trajectoire future du domaine. Plutôt que de revenir sur les défis spécifiques résumés à la Section~\ref{sec:challenges}, nous nous concentrons sur des thèmes transversaux, des tensions non résolues et des directions de recherche émergentes qui transcendent les domaines d'application individuels.

<!-- contexte : Discussion and Future Directions › The Convergence of World Models and Foundation Models -->

<!-- source: survey archi 05/2026 -->

<font color="purple">La tendance la plus lourde de conséquences identifiée dans cette étude est peut-être la convergence en cours entre les modèles du monde et les modèles fondation. Des systèmes tels que Cosmos~\cite{nvidia2025cosmos}, Genie~\cite{bruce2024genie} et V-JEPA 2~\cite{meta2025vjepa2} sont entraînés sur des corpus vidéo à l'échelle d'internet et sont destinés à fonctionner comme des simulateurs généralistes pouvant être adaptés à des tâches en aval par affinage ou par instruction. Cette trajectoire fait étroitement écho à l'évolution des modèles de langage, passés de systèmes spécifiques à une tâche à des moteurs de raisonnement généralistes, et soulève un ensemble comparable de questions conceptuelles et pratiques.</font>

<!-- source: survey archi 05/2026 -->

<font color="purple">Les avantages potentiels de ce basculement sont substantiels. En principe, un unique modèle du monde préentraîné pourrait fournir un substrat représentationnel partagé pour la robotique, la conduite autonome, la modélisation scientifique et la simulation médicale, réduisant ainsi le besoin de collecte de données spécifiques à un domaine et d'ingénierie extensive propre à chaque tâche. Cette promesse doit toutefois être interprétée avec prudence. Les modèles fondation du monde sont entraînés majoritairement sur des vidéos internet, lesquelles présentent un biais marqué en faveur de certains domaines visuels particuliers, tels que les scènes d'intérieur, les images de conduite et le contenu de jeux vidéo, tout en sous-représentant les interactions physiques et la dynamique de contact qui sont particulièrement critiques pour la manipulation robotique. La question de savoir si un préentraînement visuel de large portée peut produire des représentations qui se transfèrent efficacement à des domaines régis par des principes physiques fondamentalement différents, tels que la dynamique moléculaire, la simulation de fluides ou la planification chirurgicale, reste une question empirique ouverte.</font>

<!-- source: survey archi 05/2026 -->

<font color="brown">Par ailleurs, l'ampleur même de ces modèles soulève d'importantes préoccupations quant à l'accessibilité. Lorsque l'entraînement d'un modèle du monde compétitif requiert des dizaines de milliers d'heures-GPU et l'accès à des jeux de données propriétaires, les progrès significatifs tendent à se concentrer au sein d'un petit nombre de laboratoires industriels. Les efforts open source examinés dans cet article, notamment Open-Sora, Oasis et les projets connexes, constituent des développements encourageants, mais l'écart entre systèmes ouverts et fermés demeure substantiel. Garantir que la recherche sur les modèles du monde reste accessible à l'ensemble de la communauté académique n'est donc pas seulement une question d'équité, mais aussi un impératif scientifique, la diversité des approches, des hypothèses et des perspectives ayant historiquement été centrale au progrès de l'apprentissage automatique.</font>


## 5. Feuille de route : multimodalité, représentation physique unifiée, simulateurs interactifs

<!-- ===== AJOUT depuis definition & roadmap 07/2026 (sections 3+) — À TRADUIRE ===== -->

<!-- source: definition & roadmap 07/2026 | Open Challenges and Bottlenecks -->

Les modèles du monde représentent la frontière décisive de l'IA physique, mais leur trajectoire vers une véritable autonomie est fondamentalement bridée par une scission systémique entre la synthèse perceptuelle et l'exécution physique. Alors que les paradigmes actuels passent à l'échelle sans effort sur des données visuelles passives à l'échelle d'internet, ils demeurent profondément fragiles face aux contraintes interactives et critiques pour la sécurité du monde réel. Cette section déconstruit les défis ouverts auxquels sont confrontés les modèles du monde à travers un prisme holistique : depuis l'asymétrie structurelle des données, <font color="green">qui laisse des modèles « visuellement riches mais physiquement aveugles », jusqu'à la divergence entre fidélité superficielle et précision actionnable</font>, en passant par <font color="blue">la dérive cumulative des déroulements en boucle ouverte</font>. Nous soutenons que surmonter ces obstacles requiert un changement de paradigme fondamental — <font color="olive">dépasser la conception des modèles du monde comme de simples moteurs de rendu génératifs pour aller vers des simulateurs physiques ancrés et des planificateurs interactifs en boucle fermée.</font> Cette transition exige non seulement des biais inductifs conscients de la physique et une collecte continue de données ambiantes, mais aussi une refonte radicale <font color="darkgoldenrod">des cadres d'évaluation</font>, <font color="teal">des garanties de sécurité triadiques</font> et des modèles de gouvernance décentralisés capables de concilier intelligence collective et souveraineté physique localisée.

<!-- source: definition & roadmap 07/2026 | Roadmap -->

S'appuyant sur la discussion précédente, le développement d'un futur modèle du monde physique robuste nécessite les trois étapes progressives présentées à la Figure~\ref{fig:roadmap}.
Premièrement, le modèle du monde doit exploiter des modalités multiples et unifiées, intégrant divers signaux échantillonnés de manière asynchrone afin de garantir que les modèles puissent fonctionner dans la plupart des environnements physiques.
<font color="navy">Deuxièmement, ces modalités diverses doivent être distillées en une représentation physique unifiée, c'est-à-dire un état interne unique et hautement compressé à partir duquel le rendu, la simulation et la planification peuvent tous être directement décodés pour diverses tâches en aval.</font>
Troisièmement, en faisant passer à l'échelle ces représentations grâce à des architectures avancées et des données physiquement ancrées, le domaine peut réaliser des simulateurs interactifs à l'échelle de la fondation. <font color="olive">Dans cette étape ultime, les modèles du monde se transforment en environnements réutilisables en boucle fermée, où les agents peuvent explorer, évaluer et affiner leurs actions en toute sécurité avant l'exécution dans le monde réel.</font>

<!-- source: definition & roadmap 07/2026 | Roadmap › Towards Unified Multimodal World Models -->

<font color="orange">La multimodalité unifiée est centrale pour les futurs modèles du monde, car une prédiction précise nécessite que l'apparence, la structure spatiale, l'état, l'action et le raisonnement à long horizon soient représentés conjointement.
La vidéo capture le mouvement, la structure 3D soutient une mémoire cohérente selon le point de vue, les signaux état-action expliquent le changement contrôlable, et le raisonnement sémantique relie les prédictions locales aux objectifs à long terme.
Un modèle du monde unifié devrait donc faire plus que fusionner des modalités : il devrait corréler ces signaux avec la manière dont le monde change.</font> Plusieurs raisons expliquent pourquoi la multimodalité unifiée est essentielle à ce problème.

<!-- source: definition & roadmap 07/2026 | Roadmap › Towards Unified Multimodal World Models -->

Premièrement, le raisonnement à long horizon requiert une information multimodale.
Bien qu'un modèle de diffusion vidéo puisse générer des futurs plausibles, de nombreuses tâches, telles que la manipulation, requièrent une planification à long terme du futur, ce qu'un simple modèle de diffusion vidéo peut avoir du mal à réaliser avec des ressources de calcul limitées.
Le modèle a donc besoin d'une recherche, d'une politique ou d'un signal de valeur pour choisir parmi les branches générées.
Les systèmes de contrôle fondés sur la diffusion associent souvent la génération à une recherche arborescente ou à des politiques d'action~\citep{huang2025forgetree,chi2023diffusionpolicy}. Avec des modalités supplémentaires, le modèle dispose d'un potentiel accru pour passer à l'échelle en matière de perception, de prédiction et de sélection d'action à long terme.

<!-- source: definition & roadmap 07/2026 | Roadmap › Towards Unified Multimodal World Models -->

<font color="orange">Deuxièmement, certaines modalités, comme la 3D, sont des compléments utiles et améliorent la généralisation lorsque les données sont rares.
Les jeux de données robotiques et de conduite couvrent rarement l'ensemble des points de vue caméra, poses d'objets ou configurations spatiales qu'un agent peut rencontrer.
La reconstruction à partir de vues éparses et la génération vidéo ancrée dans la géométrie peuvent synthétiser des vues manquantes, des poses et des exemples cohérents en mouvement pour l'entraînement ou le test de modèles contrôlables~\citep{yu2020pixelnerf,liu2023zero123,kang2026geonvs}.
Cela fait de la multimodalité une voie pratique vers une meilleure généralisation, car aucune modalité unique ne couvre bien les cas spatiaux rares.</font>

<!-- source: definition & roadmap 07/2026 | Roadmap › Towards Unified Multimodal World Models -->

<font color="orange">Troisièmement, les signaux d'action et d'état transforment la prédiction vidéo d'une prévision passive en une prédiction incarnée.
Les observations visuelles seules ne déterminent pas quelle prise réussira, car une même scène peut conduire à des futurs différents après une poussée, une prise, ou l'absence d'action.
Les modèles du monde vidéo-action récents associent le contexte visuel à des entrées explicites d'action et d'état~\citep{zhou2026tau0wm,alradi2026aeroworld}.
Cela suggère que l'échelle visuelle seule ne suffit pas ; le modèle doit également encoder les variables qui rendent le changement contrôlable.</font>

<!-- source: definition & roadmap 07/2026 | Roadmap › Towards Unified Multimodal World Models -->

Une voie pratique consiste à traiter l'unification comme un curriculum plutôt que comme un unique flux de tokens fusionnés.
L'entraînement peut débuter par un apprentissage de représentation statique, où des objectifs fondés sur l'image tels que JEPA construisent des caractéristiques sémantiques~\citep{assran2023ijepa}.
Il peut ensuite ajouter des données vidéo, d'état, d'action et incarnées, tandis que des actions latentes compactes séparent le changement contrôlable de l'apparence de l'arrière-plan~\citep{bruce2024genie,bi2025motus}.

<!-- source: definition & roadmap 07/2026 | Roadmap › Towards a Unified Physical Representation -->

<font color="navy">Comme indiqué précédemment, la compression de l'information est essentielle pour parvenir à un modèle du monde unifié. Pour compresser des observations sensorielles de haute dimension en un état interne partagé qui préserve la structure physique du monde, le choix de la représentation importe davantage que le choix de tel ou tel moteur de rendu, simulateur ou planificateur pris isolément. La plupart des systèmes actuels maintiennent au contraire trois définitions distinctes du monde : des primitives centrées sur l'apparence pour le rendu, telles que les champs de radiance ou les primitives gaussiennes~\citep{mildenhall2020nerf,kerbl20233dgaussians} ; des maillages ou des particules pour la simulation ; et des grilles d'occupation ou des emplacements d'objets pour la planification. La traduction entre ces représentations est à la fois avec perte et ad hoc. Un modèle du monde devant soutenir conjointement la perception, la simulation et le contrôle soulève donc une question préalable que ces décodeurs laissent sans réponse : à partir de quel état interne unique les trois peuvent-ils être décodés ?</font>

<!-- source: definition & roadmap 07/2026 | Roadmap › Towards a Unified Physical Representation -->

<font color="navy">La direction la plus prometteuse à long terme n'est pas simplement un meilleur moteur de rendu, simulateur ou planificateur pris isolément, mais une \emph{représentation physique partagée} à partir de laquelle chacun d'eux serait récupéré comme une opération de décodage. Une telle représentation devrait posséder les propriétés suivantes. Premièrement, elle devrait être physiquement ancrée et prête pour la simulation, de sorte que le même état porte la structure dynamique et de contact requise pour la prédiction directe, et non seulement l'apparence de surface. Deuxièmement, elle devrait être adaptative à la géométrie, accommodant la géométrie hétérogène et irrégulière des scènes réelles sans imposer une grille régulière ni un gabarit fixe. En outre, elle devrait être intrinsèquement compacte, encodant un état structuré plutôt qu'un champ dense, de sorte que la capacité soit consacrée aux facteurs physiques lentement variables et pertinents pour la décision plutôt qu'aux détails au niveau du pixel. Sous une telle représentation, la géométrie, le mouvement, les propriétés des matériaux, l'apparence, l'identité sémantique, l'incertitude et l'état d'interaction seraient encodés conjointement en un seul état persistant, et le rendu, la simulation et la planification cesseraient de nécessiter trois définitions distinctes du monde : ils deviendraient différentes opérations de décodage sur le même état physique compressé — décodé en pixels ou primitives de splatting pour le rendu, en variables de déformation, de contrainte et de contact pour la simulation, ou en structure objet-partie-affordance pour la planification d'action.</font>

<!-- source: definition & roadmap 07/2026 | Roadmap › Towards a Unified Physical Representation -->

<font color="navy">Ce principe « un état, plusieurs décodeurs » possède déjà des précédents partiels : PhysGaussian~\citep{xie2024physgaussian}, par exemple, pilote à la fois la simulation physique et le rendu à partir d'un unique ensemble de noyaux gaussiens. Le défi plus large consiste à concevoir une représentation unifiée qui satisfasse toutes les exigences : 1) elle est décodable en apparence, ancrée dans la simulation, flexible en géométrie, et compacte, 2) elle peut être apprise à partir de données visuelles à l'échelle d'internet et compresser ces données en un état physique persistant, et 3) l'état peut évoluer par dynamique analytique ou apprise, et exposer la prédiction perceptuelle, la simulation contrefactuelle et le contrôle via des interfaces de requête spécifiques à la tâche. Le choix concret du substrat demeure une question ouverte. En définitive, le problème central sur la voie des modèles du monde physiques est le suivant : \textit{quelle structure interne compacte peut préserver une information physique et sémantique suffisante pour soutenir toutes les projections en aval d'une intelligence incarnée ?}</font>

<!-- source: definition & roadmap 07/2026 | Roadmap › Foundation-Scale Interactive Simulators -->

Enfin, un autre usage des modèles du monde consiste à construire des simulateurs interactifs qui soutiennent l'imagination d'actions, la génération de tâches, l'intégration de rétroactions ou l'affinage continu. <font color="olive">Les modèles du monde aident les simulateurs à passer à l'échelle pour fournir un environnement réutilisable dans lequel les agents et les systèmes scientifiques peuvent tester des actions, évaluer des risques et explorer des résultats possibles avant des expériences en conditions réelles.</font>

<!-- source: definition & roadmap 07/2026 | Roadmap › Foundation-Scale Interactive Simulators -->

<font color="purple">Cette vision est motivée par le succès du passage à l'échelle dans les grands modèles de langage et les modèles récents de génération vidéo, où des modèles plus grands, des données plus étendues et un calcul accru ont conduit à des améliorations systématiques du raisonnement et de la généralisation. Cela soulève une question centrale pour les modèles du monde : un comportement de passage à l'échelle similaire peut-il émerger pour la dynamique physique ? Plus précisément, des modèles plus grands, des données plus diversifiées, des jeux de données d'entraînement interactifs scalables et des annotations riches en physique peuvent-ils améliorer la capacité d'un modèle du monde à maintenir la cohérence physique, à prédire des dynamiques à long horizon, à répondre de manière fiable aux actions de l'agent, et à agir comme un simulateur interactif ?</font>

<!-- source: definition & roadmap 07/2026 | Roadmap › Foundation-Scale Interactive Simulators -->

Pour atteindre cet objectif, trois aspects clés doivent être pris en compte. Premièrement, des architectures de modèles scalables sont nécessaires pour soutenir à la fois une prédiction du monde de haute fidélité et une interaction conditionnée par l'action fiable. Les modèles récents de diffusion et de flow-matching offrent une haute qualité pour les futurs visuels, tandis que les architectures autorégressives de type LLM offrent des avantages pour la modélisation et le raisonnement de séquences à contexte long. Des modèles multimodaux unifiés plus récents, tels que Cosmos 3, et des cadres planificateur-moteur de rendu, tels que Bernini, suggèrent en outre que le langage, la vision, la vidéo, l'audio et les actions peuvent être traités ou coordonnés au sein de cadres de modélisation plus unifiés. Pour les simulateurs interactifs à l'échelle de la fondation, la question architecturale clé reste ouverte : quel type de conception de modèle peut passer à l'échelle vers une interaction contrôlable tout en incorporant <font color="orange">des modalités physiques plus riches, telles que la force, la rétroaction tactile, les états de contact et la proprioception</font> ?

<!-- source: definition & roadmap 07/2026 | Roadmap › Foundation-Scale Interactive Simulators -->

Deuxièmement, le développement de simulateurs interactifs à l'échelle de la fondation dépendra à la fois des vidéos internet et de la construction de jeux de données physiques scalables. Les vidéos internet introduisent des a priori visuels et d'action généraux ; les vidéos de manipulation à la première personne les complètent avec des annotations d'action ou de mouvement des mains ; et les trajectoires de robots réels fournissent des signaux de contrôle ancrés. Au-delà de ces sources, <font color="orange">une supervision physique plus riche, incluant les états 3D, le mouvement des objets, les événements de contact, la force, la rétroaction tactile, les signaux thermiques et les propriétés des matériaux, est également importante.</font>

<!-- source: definition & roadmap 07/2026 | Roadmap › Foundation-Scale Interactive Simulators -->

<font color="olive">Troisièmement, un simulateur physique interactif doit être vérifié dans des contextes en boucle fermée. Un simulateur appris peut fournir un environnement d'interaction à faible coût pour l'entraînement et l'évaluation de politiques, mais ses propres prédictions doivent néanmoins être validées par rapport à des résultats du monde réel ou à des contraintes physiques fiables. <font color="darkgoldenrod">Les systèmes futurs ont donc besoin de protocoles d'évaluation qui dépassent la simple plausibilité visuelle, en mesurant si les futurs prédits sont causalement cohérents avec les actions, stables sur de longs horizons, et prédictifs de l'exécution réelle</font> dans des robots ou des environnements de laboratoire humide autonomes pilotés par IA.</font>


## 6. Vers l’AGI physique : boucle Agent–Évaluateur–Modèle du monde

<!-- source: definition & roadmap 07/2026 | Outlook: A Path to Physical AGI -->

\label{sec:path-to-physical-agi}
Les grands modèles de langage (LLM) confèrent aux machines une maîtrise sans précédent de la syntaxe humaine, de la sémantique et des connaissances stockées. Pourtant, si les LLM possèdent une compréhension encyclopédique de la manière dont nous décrivons la réalité, ils manquent d'un ancrage fondamental dans la réalité physique elle-même. Nous approchons rapidement des limites de l'intelligence désincarnée \citep{coveney2025wall}.
La relation entre les modèles de langage et les modèles du monde définit le prochain changement de paradigme majeur du développement de l'IA. Pour tracer la trajectoire plus large vers l'AGI, nous devons reconnaître une vérité fondamentale sur la cognition artificielle : i) le langage a donné aux machines un moyen de parler du monde ; ii) les modèles du monde sont le moyen par lequel elles en viendront à le comprendre, l'imaginer, raisonner à son sujet et agir en son sein. Si l'AGI doit naviguer et manipuler le domaine physique, elle ne peut accomplir ces tâches en se contentant de prédire le mot suivant dans une séquence. Elle doit, nativement, posséder une compréhension intuitive de la physique, de la causalité, du raisonnement spatial et du temps. Elle doit être capable de simuler les conséquences de ses actions avant de les entreprendre — en prédisant le prochain état de la réalité elle-même —, et, plus important encore, elle doit évaluer quelles tâches sont potentiellement réalisables dans le monde réel étant donné l'agent physique actuel.

<!-- source: definition & roadmap 07/2026 | Outlook: A Path to Physical AGI -->

<font color="olive">Pour réaliser cette vision de l'AGI physique, des modèles statiques entraînés passivement sur des données historiques sont insuffisants. L'AGI requiert un système dynamique et auto-évolutif, capable d'interagir en continu avec le monde réel et d'un apprentissage autodirigé.</font> À cette fin, nous conceptualisons ici cette idée à travers une \textbf{Architecture Trinité}, une boucle cognitive en trois parties conçue pour combler de manière autonome l'écart entre le raisonnement numérique et la compétence physique.
Cette architecture se compose de trois composantes interdépendantes :
\begin{itemize}
\item \textbf{Agent : le moteur d'exécution de tâches.} L'Acteur, c'est-à-dire l'agent physique, reçoit une instruction de tâche et tente de l'accomplir physiquement (ou de manière physiquement simulée). Il traduit une intention de haut niveau en actions granulaires et séquentielles au sein de son environnement.
\item \textbf{Évaluateur : le juge de l'achèvement de la tâche.} Pendant que l'Agent opère, l'Évaluateur observe les données de trajectoire. Il évalue avec quelle efficacité et quelle efficience la tâche a été accomplie, fournissant une rétroaction précise sur les échecs, les violations de physique ou les mouvements sous-optimaux.
\item \textbf{Modèle du monde : le simulateur central et concepteur de curriculum.} Le modèle du monde ingère les données de trajectoire générées par l'Agent et notées par l'Évaluateur. En observant ces interactions, il apprend la physique, la dynamique et la causalité sous-jacentes du monde. De manière cruciale, le modèle du monde comprend la \emph{limite} exacte des capacités actuelles de l'Agent. À l'aide de cette simulation interne, il imagine et propose de nouvelles tâches, progressivement plus complexes, qui se situent \textit{juste au-delà} des limites actuelles de l'Agent, agissant comme un générateur automatisé de curriculum.
\end{itemize}
Notons qu'ici, la composante Modèle du monde joue un rôle crucial en ce qu'elle i) internalise la connaissance du monde, ii) connaît la limite des tâches faisables pour l'Acteur actuel, iii) guide l'interaction agent-monde du cycle suivant en proposant de nouvelles tâches. Cela ressemble également à la manière dont nous, humains, apprenons et utilisons notre modèle du monde dans le cerveau \citep{taniguchi2023world,deng2025simura}.
Par ailleurs, les composantes Acteur et Critique peuvent assurément être dotées de LLM, par exemple mises en œuvre via des systèmes multi-agents fondés sur des LLM \citep{yang2025unlocking}, de sorte que les parties planification, raisonnement et prise de décision de ces composantes dépendent naturellement de l'intelligence cognitive issue des LLM. De cette manière, l'Architecture Trinité fournit un protocole de renforcement mutuel entre les LLM et le modèle du monde.

<!-- source: definition & roadmap 07/2026 | Outlook: A Path to Physical AGI -->

<font color="olive">La véritable puissance de cette trinité réside dans son interaction continue avec la réalité. Cette boucle opère à la fois à travers les simulations numériques et le monde physique. Le modèle du monde peut imaginer en toute sécurité des milliers de scénarios et proposer des tâches que l'Acteur doit tenter dans un jumeau numérique de haute fidélité. Une fois que l'Acteur maîtrise ces tâches, le système déploie son intuition apprise dans le monde physique, où le Critique évalue les frictions et le bruit inévitables de la réalité, réinjectant ces nouvelles données dans le modèle du monde.
Grâce à ce cycle incessant d'action, d'évaluation et de mise à jour de sa simulation interne, l'IA cesse de dépendre uniquement de jeux de données sélectionnés par l'humain. Elle commence à apprendre exactement comme le fait l'intelligence biologique : par l'essai physique, l'erreur et l'imagination.</font> Cette Architecture Trinité n'est pas seulement un plan pour une meilleure robotique — c'est le moteur évolutif qui transformera l'IA d'une conversationnaliste passive en une AGI physique active.


## 7. Goulots d’étranglement techniques et scientifiques

<!-- ===== AJOUT depuis survey archi 05/2026 (sections 3+) — À TRADUIRE ===== -->

<!-- contexte : Major Challenges and Limitations -->

<!-- source: survey archi 05/2026 -->

Malgré des progrès rapides, les modèles du monde restent confrontés à plusieurs défis fondamentaux qui traversent les architectures, les familles méthodologiques et les domaines d'application. Il ne s'agit pas simplement de limitations d'ingénierie, mais souvent du reflet de tensions plus profondes entre les modèles de dynamique appris et la complexité des environnements du monde réel. Cette section examine sept défis majeurs : <font color="blue">la cohérence à long horizon et l'accumulation d'erreurs</font>, <font color="brown">la scalabilité et le coût de calcul</font>, <font color="magenta">l'écart de transfert simulation-vers-réel</font>, <font color="darkgoldenrod">la fragmentation de l'évaluation et des référentiels</font>, <font color="navy">l'efficacité des données et l'apprentissage de représentations</font>, <font color="teal">la sécurité et la robustesse dans des contextes à forts enjeux</font>, et <font color="orange">le problème encore non résolu de l'ancrage multimodal</font>.

<!-- contexte : Major Challenges and Limitations › Scalability and Computational Cost -->

<!-- source: survey archi 05/2026 -->

<font color="brown">Les modèles du monde de pointe couvrent un spectre computationnel allant de modèles de dynamique latente légers, entraînables sur un seul GPU, à des systèmes à l'échelle de la fondation nécessitant des milliers d'accélérateurs et des millions d'heures-GPU. GAIA-1~\cite{hu2023gaia1}, un modèle du monde génératif de 9 milliards de paramètres pour la conduite autonome, associe un transformeur autorégressif de 6,5 milliards de paramètres à un décodeur de diffusion vidéo de 2,6 milliards de paramètres, entraîné sur 4 700 heures de données de conduite réelles. Cosmos de NVIDIA~\cite{nvidia2025cosmos} a publié des modèles fondation du monde à poids ouverts de 4, 7, 12 et 14 milliards de paramètres, entraînés sur plus de 20 millions d'heures de vidéo. Genie de DeepMind~\cite{bruce2024genie} atteint 11 milliards de paramètres avec un tokeniseur vidéo spatio-temporel et un modèle de dynamique autorégressif entraîné sur des vidéos internet non étiquetées. Ces échelles rendent l'entraînement prohibitif pour la plupart des groupes de recherche : le projet Open-Sora~\cite{opensora2024} a estimé que reproduire un modèle de génération vidéo de qualité commerciale coûte environ 200 000 dollars en calcul, ce qui représente déjà une réduction substantielle par rapport aux coûts estimés de systèmes propriétaires comme Sora~\cite{liu2024sora}.</font>

<!-- source: survey archi 05/2026 -->

<font color="brown">\textbf{Goulots d'étranglement à l'inférence.}
Pour les applications interactives — robotique, simulation de jeux, conduite autonome — la latence d'inférence est aussi critique que le coût d'entraînement. Les modèles du monde fondés sur la diffusion sont particulièrement affectés, car chaque image prédite nécessite plusieurs itérations de débruitage. DIAMOND~\cite{alonso2024diamond} a démontré que le cadre EDM~\cite{karras2022edm} permet une génération autorégressive stable avec seulement trois étapes de débruitage, mais cela limite encore le débit par rapport aux modèles autorégressifs à passage unique. GameNGen~\cite{valevski2025gamengen} a atteint une simulation DOOM en temps réel à 20 images par seconde sur un seul TPU en affinant Stable Diffusion avec quatre étapes de débruitage, et une distillation supplémentaire a réduit cela à une seule étape à 50 images par seconde. Cependant, l'extension de telles approches à des environnements plus complexes et à plus haute résolution demeure difficile. Oasis~\cite{oasis2024} a démontré une génération de monde en temps réel de type Minecraft à 360p et 20 images par seconde en utilisant une architecture de transformeur de diffusion sur des GPU NVIDIA H100, mais la résolution et la fidélité visuelle restent limitées par rapport aux systèmes de génération hors ligne.</font>

<!-- source: survey archi 05/2026 -->

<font color="brown">\textbf{Approches de cohérence et de distillation.}
Les modèles de cohérence~\cite{song2023consistency} offrent un cadre principiel pour réduire le coût d'échantillonnage des modèles de diffusion, en entraînant des réseaux qui associent directement tout niveau de bruit à la variété des données propres en une seule étape. Les modèles de cohérence latents~\cite{luo2023lcm} ont étendu cette approche à la diffusion latente, obtenant une génération d'images de haute qualité en 2 à 4 étapes avec seulement 32 heures-GPU A100 d'entraînement. Pour la vidéo, DOLLAR~\cite{ding2025dollar} combine la distillation variationnelle de score avec la distillation de cohérence pour une génération vidéo en peu d'étapes, atteignant jusqu'à 278 fois l'accélération de la procédure d'échantillonnage du modèle enseignant. L'application de ces techniques de distillation spécifiquement à l'inférence des modèles du monde — où la qualité de chaque image prédite affecte directement la planification en aval — constitue une direction de recherche active, bien que l'interaction entre les erreurs d'approximation induites par la distillation et <font color="blue">l'accumulation des erreurs de déroulement</font> reste mal comprise.</font>

<!-- source: survey archi 05/2026 -->

<font color="brown">\textbf{Réduction de tokens et architectures efficaces.}
Une stratégie complémentaire consiste à réduire le coût de calcul en minimisant le nombre de tokens traités par pas de temps. $\Delta$-IRIS~\cite{micheli2024deltairis} encode des deltas stochastiques d'une image à l'autre plutôt que des observations complètes, réduisant considérablement le nombre de tokens par pas de temps tout en atteignant des performances de pointe sur Crafter, avec une accélération d'entraînement d'un ordre de grandeur par rapport à l'IRIS original. STORM~\cite{zhang2023storm} fusionne chaque observation en un unique token latent continu (contre 16 tokens discrets par image pour IRIS), permettant une modélisation du monde fondée sur les transformeurs avec un coût d'attention nettement plus faible, et atteignant 126,7 % de performance humaine moyenne sur Atari 100k avec seulement 4,3 heures d'entraînement sur un seul GPU. Ces résultats suggèrent que les innovations en matière d'efficacité architecturale peuvent apporter des réductions de coût disproportionnées sans sacrifier les performances sur les tâches en aval, démocratisant potentiellement la recherche sur les modèles du monde au-delà des laboratoires industriels bien dotés en ressources.</font>

<!-- source: survey archi 05/2026 -->

<font color="brown">\textbf{Compromis au niveau de l'architecture.}
Le choix entre architectures RSSM, transformeur, diffusion et à espace d'états implique des compromis fondamentaux entre coût de calcul, mémoire et capacité prédictive. Les modèles fondés sur RSSM (famille Dreamer) sont les plus efficaces sur le plan computationnel, avec un coût de $O(1)$ par pas indépendant de la longueur de l'historique, <font color="blue">mais ils compressent toute l'information temporelle dans un état caché de taille fixe, ce qui limite la mémoire à long terme.</font> Les modèles fondés sur les transformeurs (IRIS, STORM) offrent une modélisation supérieure des dépendances à longue portée, mais engendrent un coût d'attention de $O(T^2)$ pour une longueur de contexte $T$, ce qui devient prohibitif pour de longs épisodes avec des observations à haute résolution. Les modèles à espace d'états~\cite{po2025longcontext} offrent une complexité de $O(T)$ avec une forte modélisation à longue portée, mais leur application à la modélisation du monde en est encore à ses débuts. Les modèles de diffusion (DIAMOND, GameNGen) atteignent la fidélité visuelle la plus élevée, mais nécessitent plusieurs étapes de débruitage séquentielles par image, ce qui les rend les plus lents à l'inférence à moins d'appliquer une distillation. Aucune architecture unique ne domine actuellement l'ensemble des dimensions d'évaluation, et le choix optimal dépend de manière critique des contraintes de déploiement de l'application cible.</font>

<!-- contexte : Major Challenges and Limitations › Multimodality and Grounding -->

<!-- source: survey archi 05/2026 -->

<font color="orange">Les environnements du monde réel sont intrinsèquement multimodaux : les informations visuelles, auditives, tactiles, proprioceptives et linguistiques sont toutes pertinentes pour construire des modèles du monde précis. Les approches actuelles se concentrent principalement sur les entrées visuelles, avec une intégration limitée des autres modalités.</font> <font color="green">Ancrer les modèles du monde dans la réalité physique — en garantissant que les prédictions respectent les lois physiques, la permanence des objets et les relations causales — demeure un défi ouvert.</font>

<!-- contexte : Discussion and Future Directions › Multimodal Integration and Embodied Intelligence -->

<!-- source: survey archi 05/2026 -->

<font color="orange">Les modèles du monde étudiés dans cet article fonctionnent principalement à partir d'entrées visuelles, occasionnellement augmentées de descriptions langagières ou de signaux proprioceptifs. Les organismes biologiques, en revanche, construisent leurs modèles internes du monde à partir d'un répertoire sensoriel bien plus riche, incluant le toucher, l'ouïe, la proprioception, la rétroaction vestibulaire et l'olfaction. La négligence relative des modalités non visuelles dans la recherche actuelle est en partie une conséquence pratique du fait que la vision est la modalité pour laquelle les jeux de données à grande échelle et les encodeurs préentraînés sont les plus facilement disponibles. Cela révèle cependant aussi une limitation conceptuelle plus profonde dans la manière dont les modèles du monde actuels sont formulés.</font>

<!-- source: survey archi 05/2026 -->

<font color="orange">Pour les agents incarnés agissant dans le monde physique, la rétroaction tactile et proprioceptive est souvent plus informative que la vision pour les tâches riches en contacts telles que la saisie, l'insertion et l'utilisation d'outils. Le nombre limité de systèmes intégrant la détection tactile dans les modèles du monde~\cite{yang2023unisim} illustre déjà la valeur de la modélisation dynamique multimodale. Néanmoins, les méthodes systématiques permettant d'intégrer des flux sensoriels hétérogènes — chacun caractérisé par des fréquences d'échantillonnage, des profils de bruit et un contenu informationnel différents — au sein d'un cadre prédictif unifié en sont encore à un stade précoce de développement. Faire progresser cette ligne de recherche nécessitera vraisemblablement non seulement des innovations architecturales, mais aussi de nouveaux jeux de données et référentiels d'évaluation capables de saisir la richesse de l'interaction incarnée multimodale.</font>

<!-- source: survey archi 05/2026 -->

Le langage occupe une position distinctive dans ce paysage. Comme évoqué à la Section~\ref{sec:methodology}, les modèles du monde augmentés par le langage peuvent ancrer des instructions abstraites dans la dynamique physique tout en offrant une interface naturelle pour spécifier des objectifs, des contraintes et la structure des tâches. Le développement rapide des modèles vision-langage-action, tels que RT-2, OpenVLA et $\pi_0$, suggère que le langage pourrait de plus en plus fonctionner comme une couche universelle de spécification de tâches pour les modèles du monde incarnés. Dans le même temps, les systèmes actuels de ce type s'appuient fortement sur la connaissance implicite du monde encodée dans les modèles de langage préentraînés, et il demeure incertain qu'une telle connaissance implicite puisse se substituer à un modèle de dynamique appris explicitement lorsqu'un raisonnement physique précis est requis.

<!-- ===== AJOUT depuis robot survey 04/2026 (sections 3+) — À TRADUIRE ===== -->

<!-- source: robot survey 04/2026 | Challenges and Future Directions -->

\label{sec:challenges}
\todo[inline, color=mybrown]{Assigned to: Jindou Jia , Jianfei Yang}

<!-- source: robot survey 04/2026 | Challenges and Future Directions -->

Malgré les promesses des modèles du monde pour l'apprentissage robotique, leur déploiement fiable dans des tâches incarnées complexes demeure limité par plusieurs défis fondamentaux qui dépassent le simple passage à l'échelle. Les systèmes actuels doivent résoudre des lacunes de conditionnement causal dans les dynamiques dépendantes de l'action, des goulots d'étranglement d'efficacité à l'entraînement et à l'inférence, une intégration limitée de la rétroaction sensorielle non visuelle, <font color="darkgoldenrod">ainsi que l'absence d'évaluation standardisée centrée sur l'utilité fonctionnelle plutôt que sur le réalisme visuel.</font> <font color="navy">Une autre frontière importante est l'abstraction symbolique et structurée : bien que la prédiction dans l'espace des pixels ou latent soit puissante, le raisonnement à long horizon peut nécessiter une structure centrée sur les objets, relationnelle ou de type règle, offrant une interface plus compacte pour la planification et le contrôle.</font> Dans cette section, nous discutons de ces défis et esquissons des directions futures vers des modèles du monde fiables, efficaces et exploitables pour les agents incarnés.

<!-- source: robot survey 04/2026 | Challenges and Future Directions › Causal Conditioning Gaps -->

Les cadres VLA actuels associent souvent les modèles du monde à la dynamique inverse~\citep{lingbotva,dreamzero,gigabrain}, en utilisant la prédiction d'état futur pour régulariser l'apprentissage de politique. Cependant, un désalignement causal peut survenir lorsque le futur prédit est conditionné plus fortement par le contexte historique ou l'intention de la tâche que par l'action robotique spécifique en attente. <font color="green">Dans de tels cas, le modèle du monde peut générer des futurs sémantiquement plausibles ou cohérents avec l'intention, mais pas nécessairement fidèles aux conséquences physiques de l'action candidate.</font> Cela limite son utilité pour un contrôle en boucle fermée précis, où l'exigence clé n'est pas seulement de prédire un futur probable, mais de prédire comment ce futur change sous l'effet de l'intervention propre du robot.

<!-- source: robot survey 04/2026 | Challenges and Future Directions › Causal Conditioning Gaps -->

Le goulot d'étranglement technique réside dans un conditionnement d'action faible : de nombreux objectifs prédictifs de modèles du monde sont entraînés principalement à partir de l'historique d'observation et de l'intention de tâche, si bien que leurs futurs peuvent être plausibles sans être causalement liés à l'action robotique à exécuter. Pour réduire ce décalage, WorldVLA~\citep{rynnvla002} adopte des stratégies d'entraînement unifiées implicites qui couplent la prédiction d'état futur à la génération d'action, favorisant une dynamique prédictive mieux alignée sur la politique.

<!-- source: robot survey 04/2026 | Challenges and Future Directions › Efficiency Bottlenecks -->

<font color="brown">Les politiques fondées sur des modèles du monde sont bien plus coûteuses en calcul que les modèles VLA, en particulier à la fois pendant l'entraînement et l'inférence. Cette surcharge provient du fait que les modèles prédisent conjointement les vidéos et les actions futures, ou nécessitent un affinage préalable à l'apprentissage de politique, rendant l'adaptation coûteuse en raison de la grande taille des modèles et de la complexité des dynamiques d'environnement. Des stratégies économes en paramètres, telles que des adaptateurs légers, peuvent atténuer ce problème en gardant le modèle de base largement gelé.
Des problèmes d'efficacité apparaissent également à l'inférence, en particulier pour la prédiction vidéo fondée sur la diffusion, où le débruitage itératif engendre une latence élevée. Des approches récentes comme Mimic Video~\citep{mimicvideo} et LingBot-VA~\citep{lingbotva} atténuent ce problème via un débruitage partiel. Ces méthodes privilégient la dynamique du mouvement plutôt que les détails visuels fins, capturant les indices essentiels à la prise de décision sans le coût d'une reconstruction complète.</font>

<!-- source: robot survey 04/2026 | Challenges and Future Directions › Efficiency Bottlenecks -->

<font color="brown">Plus fondamentalement, des approches récentes repensent entièrement les modèles du monde. Les modèles à espace latent, tels que LeWorldModel~\citep{leworldmodel}, réduisent les coûts d'entraînement et d'inférence en se concentrant sur des représentations prédictives plutôt que sur une génération complète de haute dimension. Des paradigmes émergents, comme Fast-WAM~\citep{fastwam}, découplent davantage la modélisation du monde du déploiement, en ne l'utilisant que pour l'entraînement afin d'enrichir les représentations, tout en l'éliminant à l'inférence.</font>

<!-- source: robot survey 04/2026 | Challenges and Future Directions › Multi-Modal Perception Bottlenecks -->

<font color="orange">Les modèles du monde actuels excellent dans la synthèse visuelle mais restent découplés de la dynamique physique de l'interaction réelle. S'appuyer principalement sur la vision et la proprioception ne permet pas de capturer des propriétés inobservables telles que le frottement, la rigidité et la stabilité du contact. Pour y remédier, l'intégration de la détection haptique et de la rétroaction de force~\citep{mode_vla, tactile_vla} est indispensable pour fournir des signaux d'interaction de référence. Des modèles visuo-tactiles récents~\citep{higuera2026vtwm, zheng2026omnivta} ont commencé à traiter ce problème en apprenant des représentations latentes conjointes afin de renforcer la robustesse dans les tâches riches en contacts.</font>

<!-- source: robot survey 04/2026 | Challenges and Future Directions › Multi-Modal Perception Bottlenecks -->

<font color="orange">Un défi architectural important consiste à aligner des signaux asynchrones présentant des fréquences et des dimensions divergentes. Alors que les capteurs tactiles captent des événements transitoires à haute fréquence, leurs signaux de faible dimension sont souvent dilués ou dominés par les caractéristiques visuelles de haute dimension lors de l'optimisation latente conjointe~\citep{chen2025multi}. Équilibrer efficacement ces entrées hétérogènes est essentiel pour éviter la dominance visuelle et garantir que la sémantique visuelle éparse soit fusionnée avec une rétroaction physique dense, une étape critique vers une intelligence robotique consciente de la physique.</font>

<!-- source: robot survey 04/2026 | Challenges and Future Directions › Classical Control Integration -->

Les modèles du monde servent de dynamique directe pour la planification proactive via le MPC (commande prédictive par modèle) \citep{hansen22a, hansen2024tdmpc2, leworldmodel}. En optimisant des séquences d'actions pour minimiser des coûts cumulés, les agents utilisent des déroulements imaginés pour faire le pont entre l'exécution réactive et le raisonnement stratégique. <font color="brown">Cependant, un goulot d'étranglement majeur réside dans la surcharge de calcul massive. Le MPC nécessite des déroulements itératifs du modèle du monde pour l'optimisation de l'action, ce qui limite fortement le déploiement en temps réel de modèles à forte capacité dans des environnements dynamiques.</font>

<!-- source: robot survey 04/2026 | Challenges and Future Directions › Classical Control Integration -->

Contrairement à la cinématique analytique, les modèles du monde capturent l'évolution stochastique conjointe de l'agent et de son environnement. Une frontière critique réside dans la réconciliation de cette expressivité neuronale avec des garanties formelles de contrôle, telles que la stabilité de Lyapunov ou le contrôle robuste~\citep{jia2024feedback}. Fusionner la dynamique apprise avec les principes de contrôle matures existants, au-delà du seul MPC, constitue une voie potentielle vers des systèmes robotiques auto-adaptatifs capables de fonctionner dans des contextes ouverts et non stationnaires.

<!-- source: robot survey 04/2026 | Challenges and Future Directions › Symbolic Structure Integration -->

<font color="navy">Bien que cette étude se soit principalement concentrée sur les modèles du monde visuels et latents, les modèles du monde symboliques constituent une direction complémentaire importante. Plutôt que de prédire des pixels, ils opèrent sur des états structurés, tels que des objets, des relations, des prédicats ou des cartes d'occupation, permettant des prédictions plus stables et compositionnelles. <font color="blue">Une limitation clé des déroulements fondés sur les pixels est l'accumulation d'erreurs à long horizon, qui peut dégrader la fiabilité de la planification.</font> Les représentations symboliques atténuent ce problème en faisant abstraction des détails de bas niveau et en modélisant des transitions discrètes ou fondées sur des règles, permettant un raisonnement plus fiable sur des horizons étendus. Cependant, elles nécessitent souvent des abstractions appropriées et un ancrage perceptuel, et peuvent rencontrer des difficultés lorsque des observations de haute dimension ne peuvent pas être proprement associées à des symboles prédéfinis. Une direction prometteuse consiste donc à construire des modèles du monde hybrides combinant des représentations perceptuelles apprises avec une structure symbolique~\citep{exopredicator,visualpredicator,lamp_symbolicwm}. Cette approche est convaincante car une grande partie du monde réel est intrinsèquement structurée : des abstractions centrées sur les objets ou relationnelles apprises à partir des données, combinées à des contraintes symboliques dans les modèles génératifs, peuvent offrir une voie principielle vers une modélisation du monde à long horizon scalable et fiable.</font>


## 8. Sécurité, robustesse, interprétabilité et déploiement

<!-- contexte : Major Challenges and Limitations › Safety, Robustness, and Interpretability -->

<!-- source: survey archi 05/2026 -->

<font color="teal">Le déploiement de modèles du monde dans des applications critiques pour la sécurité (conduite autonome, prise de décision médicale, robotique) exige que les prédictions du modèle soient fiables, calibrées et interprétables. Des prédictions trop confiantes peuvent conduire à des actions dangereuses ; des prédictions insuffisamment confiantes peuvent conduire à un comportement excessivement conservateur. La vérification formelle des modèles du monde appris et les méthodes permettant de quantifier et de communiquer l'incertitude prédictive aux décideurs en aval sont essentielles pour un déploiement en conditions réelles.</font>

<!-- contexte : Discussion and Future Directions › Safety, Reliability, and Deployment Considerations -->

<!-- source: survey archi 05/2026 -->

<font color="teal">Le déploiement de modèles du monde dans des domaines critiques pour la sécurité — tels que la conduite autonome, la planification chirurgicale et le dosage médicamenteux — soulève des préoccupations qui vont bien au-delà de la précision prédictive. Dans ces contextes, les conséquences d'une défaillance du modèle peuvent être graves et irréversibles, rendant insuffisant pour un usage réel le flux de travail standard de l'apprentissage automatique consistant à entraîner un modèle, à l'évaluer sur un ensemble de test réservé, puis à le déployer.</font>

<!-- source: survey archi 05/2026 -->

<font color="teal">Trois problématiques méritent une attention particulière. Premièrement, la \emph{calibration} : les estimations d'incertitude produites par un modèle du monde doivent refléter fidèlement la probabilité réelle d'erreur. Des prédictions trop confiantes peuvent conduire un véhicule autonome à accélérer dans une situation que le modèle a mal caractérisée, tandis que des prédictions insuffisamment confiantes peuvent rendre un système de planification chirurgicale si conservateur qu'il en devient pratiquement inutilisable. Obtenir une quantification bien calibrée de l'incertitude dans des contextes de prédiction autorégressive de haute dimension reste largement non résolu, et l'interaction entre la calibration et <font color="blue">l'accumulation d'erreurs sur de longs horizons de déroulement</font> demeure mal comprise.</font>

<!-- source: survey archi 05/2026 -->

<font color="teal">Deuxièmement, la \emph{robustesse distributionnelle} : les environnements du monde réel sont intrinsèquement non stationnaires, et tout modèle du monde entraîné sur une distribution rencontrera inévitablement des situations différentes de celles observées durant l'entraînement. La longue traîne des événements rares — telles que des conditions météorologiques inhabituelles, des présentations atypiques de patients, ou des géométries routières inédites — est précisément le domaine où la prédiction précise est la plus critique, mais aussi celui où les modèles pilotés par les données sont les plus vulnérables à l'échec. <font color="magenta">La randomisation de domaine, le transfert simulation-vers-réel et l'apprentissage continu offrent des remèdes partiels</font>, mais aucun ne fournit encore le niveau d'assurance formelle de sécurité requis dans les applications à forts enjeux.</font>

<!-- source: survey archi 05/2026 -->

<font color="teal">Troisièmement, l'\emph{interprétabilité} : lorsque les prédictions d'un modèle du monde éclairent des décisions lourdes de conséquences, les praticiens doivent pouvoir comprendre le fondement de ces prédictions. Les représentations latentes apprises par les modèles du monde actuels sont souvent opaques, et bien que les représentations structurées et centrées sur les objets présentent certains avantages en matière d'interprétabilité, elles n'ont pas encore été démontrées à l'échelle et à la complexité requises pour un déploiement pratique. Développer des méthodes fournissant des explications significatives et dignes de confiance des prédictions des modèles du monde — sans sacrifier substantiellement les performances prédictives — demeure donc une direction importante pour les recherches futures.</font>


## 9. Problèmes ouverts par niveau de capacité et par régime de loi

<!-- source: agentic 06/2026 | Trends \& Open Problems › Open Problems by Capability Level -->

Les sections précédentes révèlent une trajectoire claire : les modèles du monde progressent de prédicteurs isolés à une seule étape vers des simulateurs intégrés, orientés vers les agents, qui doivent respecter des lois régissantes spécifiques au domaine sur des horizons étendus.

<!-- source: agentic 06/2026 | Trends \& Open Problems › Open Problems by Capability Level -->

À travers les quatre régimes, cette progression expose un schéma commun. <font color="green">Dans les domaines incarnés, la plausibilité visuelle devance la fidélité physique : les modèles génèrent des vidéos convaincantes mais violent les lois de conservation et la permanence des objets lors du déroulement, les meilleurs systèmes n'atteignant qu'un taux de réussite de $0{,}262$ sur les tests de cohérence physique~\citep{gu2025phyworldbench,li2025embodied_wm_survey}.</font> Dans les domaines sociaux, les simulations d'agents à grande échelle reproduisent des phénomènes émergents tels que la polarisation des opinions et la formation de gouvernance~\citep{piao2025agentsociety,dai2024artificialleviathan}, mais les agents LLM présentent des biais systématiques vers le consensus qui divergent des schémas comportementaux humains~\citep{taubenfeld2024biases,chuang2024opinion}. Dans les domaines du code, les agents traitent les logiciels comme des machines à états déterministes, alors que les systèmes réels sont partiellement observables, asynchrones et multi-locataires~\citep{xu2025warex}. <font color="magenta">Dans les domaines scientifiques, les substituts neuronaux entraînés sur des données de simulation se dégradent lorsqu'ils sont appliqués à des mesures expérimentales réelles, exposant un écart substitut-vers-réalité analogue au sim-to-real en robotique~\citep{minami2025simtorealsciml}.</font> Le thème général est que le goulot d'étranglement s'est déplacé de la génération de futurs plausibles vers la garantie que ces futurs soient \emph{exploitables pour la décision} : fidèles aux contraintes régissantes, réactifs aux interventions, et calibrés par rapport aux preuves du monde réel.

<!-- source: agentic 06/2026 | Trends \& Open Problems › Open Problems by Capability Level -->

Nous organisons dix problèmes ouverts concrets selon le niveau de capacité auquel ils apparaissent le plus directement.

<!-- source: agentic 06/2026 | Trends \& Open Problems › Open Problems by Capability Level -->

\begin{enumerate}[leftmargin=*]
\item <font color="green">\textbf{Fidélité physique au-delà de la plausibilité visuelle.} Les modèles du monde vidéo et 3D actuels atteignent un réalisme perceptuel mais échouent aux tests de cohérence physique : PhyWorldBench~\citep{gu2025phyworldbench} rapporte que le meilleur de douze modèles de pointe n'atteint qu'un taux de réussite de $0{,}262$ sur les sondes de lois de conservation et de permanence des objets, <font color="blue">l'accumulation d'erreurs à long horizon constituant la faiblesse structurelle centrale</font>.</font>

<!-- source: agentic 06/2026 | Trends \& Open Problems › Open Problems by Capability Level -->

<font color="navy">Combler cet écart requiert des représentations physiquement ancrées qui appliquent des contraintes sous déroulement contrefactuel, et non simplement une fidélité au niveau du pixel,</font> les choix de représentation discutés à la Section~\ref{sec:trends:representation} pouvant offrir une direction possible.

<!-- source: agentic 06/2026 | Trends \& Open Problems › Open Problems by Capability Level -->

Les stratégies d'entraînement guidées spatialement, qui injectent une supervision géométrique dans les modèles vision-langage-action~\citep{ye2026st4vla}, offrent une direction prometteuse.

<!-- source: agentic 06/2026 | Trends \& Open Problems › Open Problems by Capability Level -->

\item \textbf{Modélisation du monde vidéo consciente des métriques.} Étendre l'édition ancrée dans la géométrie des paires d'images à la vidéo temporellement cohérente exige quatre capacités couplées : l'estimation métrique à travers le temps, la composition temporelle de prédictions à courtes étapes, la préservation de l'identité et de l'apparence à travers les images, et l'ancrage d'instructions qui aligne le mouvement prédit sur des spécifications sémantiques~\citep{ho2022videodiffusion,xing2023dynamicrafter}. Le passage à la vidéo fournit une supervision temporelle plus dense et des contraintes d'identité plus fortes que les approches par paires d'images. Les méthodes d'édition contrôlable fidèles au sujet, comme RealCustom++~\citep{mao2026realcustompp}, peuvent fournir des composants d'interface utiles. <font color="darkgoldenrod">L'évaluation doit mesurer directement la contrôlabilité métrique, et non seulement la qualité perceptuelle~\citep{huang2023vbench,ge2024fvdbias}.</font>

<!-- source: agentic 06/2026 | Trends \& Open Problems › Open Problems by Capability Level -->

\item <font color="navy">\textbf{Représentation visuelle programmable.} Les modèles du monde visuels actuels représentent l'état sous forme de pixels bruts ou d'embeddings latents, ni l'un ni l'autre n'étant compositionnel ou précisément éditable. Le code offre une alternative structurée : VCode~\citep{lin2025vcode} reconstruit les images comme des programmes SVG préservant la sémantique symbolique plutôt que la fidélité au pixel, Code2Video~\citep{chen2025code2video} montre que des scripts Manim exécutables surpassent les modèles de génération de pixels sur du contenu structuré en rendant chaque élément spatial et temporel directement adressable, et VIGA~\citep{yin2026vision} étend le paradigme à la 3D en reconstruisant des scènes et en simulant des interactions physiques via du code Blender généré. Le problème ouvert consiste à unifier ces représentations fondées sur le code en une interface unique de modèle du monde pour l'édition compositionnelle à la fois en 2D et en 3D.</font>
\end{enumerate}

<!-- source: agentic 06/2026 | Trends \& Open Problems › Open Problems by Capability Level -->

\begin{enumerate}[leftmargin=*,resume]
\item \textbf{Le logiciel partiellement observable comme POMDP.} Aucun modèle du monde du code existant ne maintient de distributions de croyance sur l'état interne caché (sessions serveur, lignes de base de données, requêtes en cours, processus en arrière-plan), ni ne raisonne sur des transitions asynchrones à latence variable. L'injection de défaillances asynchrones réalistes dans des référentiels standard provoque des chutes significatives du taux de réussite des tâches chez tous les agents de pointe~\citep{xu2025warex}. Résoudre ce problème requiert des architectures de croyance temporelle qui modélisent conjointement ce qui s'est produit, ce qui est en cours, et ce que l'agent ne peut pas encore observer.

<!-- source: agentic 06/2026 | Trends \& Open Problems › Open Problems by Capability Level -->

\item \textbf{État multi-utilisateur concurrent.} Les logiciels réels sont multi-locataires ; les modèles du monde doivent prédire l'état sous un Dec-POMDP où les actions des utilisateurs concurrents sont inobservables~\citep{wang2025decpomdp}. Les types de données répliquées sans conflit~\citep{kleppmann2017crdt} fournissent le substrat formel pour fusionner des mises à jour concurrentes, mais aucun modèle du monde actuel n'intègre la sémantique des systèmes distribués avec un suivi de croyance appris sur des utilisateurs cachés et des écritures en attente. Ce problème se situe à l'intersection des régimes Monde Numérique et Monde Social, nécessitant un raisonnement conjoint sur l'état logiciel et l'intention multi-agents.

<!-- source: agentic 06/2026 | Trends \& Open Problems › Open Problems by Capability Level -->

\item \textbf{Alignement comportemental agent-humain à l'échelle.} Les agents LLM présentent des biais systématiques vers la modération et le consensus~\citep{taubenfeld2024biases,chuang2024opinion}, produisant deux modes de défaillance : l'effondrement de mode, où des populations simulées diverses convergent vers un comportement homogène, et une calibration inadéquate, où l'alignement de persona à un seul tour échoue sous des dynamiques à plusieurs tours. Les a priori linguistiques et culturels peuvent injecter de la diversité, mais cet effet diminue à mesure que la distance culturelle entre populations se réduit. Il manque des méthodes systématiques pour ancrer le comportement simulé dans des distributions comportementales humaines réelles.
\end{enumerate}

<!-- source: agentic 06/2026 | Trends \& Open Problems › Open Problems by Capability Level -->

<font color="olive">Les fleurons existants de la science autonome tels que CAMEO~\citep{kusne2020cameo} et A-Lab~\citep{szymanski2023alab} démontrent que la révision de modèle en boucle fermée est réalisable dans des domaines hautement instrumentés, tandis que des systèmes de découverte algorithmique guidés par évaluateur tels que FunSearch~\citep{romera2024funsearch} et AlphaEvolve~\citep{alphaevolve2025} démontrent des boucles L3 partielles avec une validation solide (Section~\ref{sec:l3}).</font> Plusieurs problèmes ouverts doivent être résolus avant que L3 ne se généralise.

<!-- source: agentic 06/2026 | Trends \& Open Problems › Open Problems by Capability Level -->

\begin{enumerate}[leftmargin=*,resume]
\item \textbf{Apprentissage continu des fonctions de transition sociétales.} Des simulations à grande échelle avec plus de 10 000 agents à travers des millions d'interactions reproduisent des phénomènes émergents tels que la polarisation des opinions et la formation de gouvernance~\citep{piao2025agentsociety,dai2024artificialleviathan}, mais ne peuvent pas détecter de manière autonome quand les dynamiques sociales ont changé. <font color="olive">Le défi central consiste à identifier un modèle de transition obsolète, à acquérir des preuves correctives, et à réviser sans oubli catastrophique des schémas stables~\citep{vandeven2024continuallearning}. Ce problème se rattache à L3, où la révision du modèle doit être déclenchée par des preuves distributionnelles plutôt que par des étiquettes supervisées.</font>

<!-- source: agentic 06/2026 | Trends \& Open Problems › Open Problems by Capability Level -->

\item <font color="magenta">\textbf{Combler l'écart substitut-vers-réalité.} Les substituts scientifiques validés sur des données de simulation se dégradent sur des mesures réelles ; l'erreur de prédiction diminue selon une loi de puissance avec les données computationnelles mais plafonne sans calibration sur données réelles, faisant écho à l'écart sim-to-real en robotique~\citep{minami2025simtorealsciml}. Dans le régime scientifique, cet écart substitut-vers-réalité est l'analogue direct du transfert sim-to-real en robotique ; les mesures d'atténuation côté implémentation discutées à la Section~\ref{subsec:impl_tradeoffs} fournissent donc un modèle utile, même si les goulots d'étranglement de mesure et les budgets de preuves diffèrent. Notamment, les simulateurs scientifiques L2 tels que GraphCast, NeuralGCM et Aurora (Section~\ref{sec:l2}) fournissent le substrat de prédiction sur lequel opère la révision L3 ; leur fidélité fixe le plafond pour le diagnostic en aval fondé sur les preuves. Le cadre OPAL-surrogate~\citep{singh2024opal} fournit des portes de crédibilité bayésiennes hiérarchiques qui formalisent le moment où un substitut est digne de confiance. La question ouverte centrale est de savoir comment allouer de manière optimale les rares observations expérimentales réelles entre la calibration du modèle et la découverte scientifique.</font>

<!-- source: agentic 06/2026 | Trends \& Open Problems › Open Problems by Capability Level -->

\item \textbf{Modéliser des lois qui évoluent elles-mêmes.} En biologie, en écologie et dans le climat, les dynamiques régissantes sont non stationnaires : les paysages de fitness viraux se déplacent~\citep{lassig2017predicting}, le forçage climatique modifie la dynamique atmosphérique~\citep{beucler2024climate}, et les pressions évolutives créent des points de bascule~\citep{evangelou2024coevolving}. Les modèles du monde doivent apprendre des opérateurs de méta-transition de second ordre régissant la manière dont $p_\theta$ lui-même dérive, ainsi que des déclencheurs de révision qui détectent le changement de loi à partir de preuves observationnelles. La découverte causale sous non-stationnarité~\citep{huang2020cdnod,song2023nctrl} fournit des résultats d'identifiabilité mais traite le changement comme une variation au sein d'un méta-modèle fixe plutôt que comme un remplacement structurel de loi.

<!-- source: agentic 06/2026 | Trends \& Open Problems › Open Problems by Capability Level -->

\item \textbf{Conceptions de harnais pour la modélisation du monde agentique.} La performance des agents a évolué à travers trois abstractions successives : l'ingénierie de prompt optimise ce qui est dit au modèle, l'ingénierie de contexte~\cite{anthropic2025context} organise l'état informationnel à travers les tours, et l'ingénierie de harnais conçoit l'environnement exécutable entourant le modèle : outils, mémoire, boucles de rétroaction et topologie inter-agents~\citep{rajasekaran2026harness, pan2026nlah}. Cette progression implique que le comportement de l'agent n'est pas régi par le modèle seul, mais par la dynamique de transition de son environnement d'exécution, faisant de la conception de harnais une forme de modélisation du monde pour les agents logiciels. Le problème est de savoir comment apprendre et synthétiser des harnais à partir de données d'interaction, en traitant l'environnement d'exécution lui-même comme l'objet de la modélisation plutôt que comme une hypothèse d'ingénierie fixe.
\end{enumerate}

<!-- source: agentic 06/2026 | Trends \& Open Problems › Open Problems by Capability Level -->

Malgré la diversité des régimes de lois régissantes, trois problèmes ouverts se retrouvent dans les quatre domaines et constituent les goulots d'étranglement les plus profonds pour la modélisation du monde en IA agentique. \emph{Dérive de déploiement} : les modèles du monde entraînés sur des données hors ligne ou en simulation sous-performent systématiquement lorsque l'environnement dérive. Les mises en page d'interfaces utilisateur changent, les propriétés de contact physique se déplacent, les normes sociales évoluent, et les instruments scientifiques se recalibrent. <font color="olive">Une modélisation du monde robuste requiert des mécanismes en ligne qui détectent précocement la dérive de distribution et déclenchent une révision ciblée plutôt que d'attendre une défaillance catastrophique.</font>

<!-- source: agentic 06/2026 | Trends \& Open Problems › Open Problems by Capability Level -->

\emph{Application de contraintes} : les quatre régimes possèdent des lois régissantes que les trajectoires valides doivent satisfaire (stabilité de contact, cohérence de machine à états, conformité aux normes, validité de la chaîne de preuves), mais les modèles actuels n'appliquent ces contraintes que de manière souple via les objectifs d'entraînement ; <font color="navy">une application stricte au moment de l'inférence, via des couches symboliques, un déroulement contraint ou des portes de vérification, demeure un problème architectural ouvert</font>.

<!-- source: agentic 06/2026 | Trends \& Open Problems › Open Problems by Capability Level -->

<font color="olive">\emph{Gouvernance de mise à jour persistante} : les systèmes L3 qui se révisent eux-mêmes à partir de preuves font face à un trilemme entre stabilité (éviter de régresser sur les capacités passées), plasticité (intégrer rapidement de nouvelles preuves) et auditabilité (retracer chaque mise à jour jusqu'à sa source de preuve) ; aucun système actuel ne résout ces trois exigences simultanément, et l'infrastructure de gouvernance (versionnage, déploiement canari, politiques de retour en arrière et harnais de régression) est sous-spécifiée dans la plupart des architectures publiées.</font> <font color="darkgoldenrod">Le cadre MREP proposé à la Section~\ref{sec:evaluation} offre un point de départ pour standardiser l'évaluation à travers ces défis partagés, en fournissant des packages d'évaluation verrouillés par version et reproductibles qui rendent la comparaison inter-régimes praticable.</font>


## 10. Au-delà de L3 : méta-modélisation du monde

<!-- source: agentic 06/2026 | Trends \& Open Problems › Beyond L3 -->

La hiérarchie L1$\to$L2$\to$L3 (Sections~\ref{sec:l1}--\ref{sec:l3}) suppose que le monde opère sous un ensemble fixe de lois régissantes : L1 apprend des régularités locales, L2 les compose en déroulements cohérents avec les contraintes, et L3 révise le modèle lorsque les preuves contredisent les prédictions.

<!-- source: agentic 06/2026 | Trends \& Open Problems › Beyond L3 -->

À L3, le système peut mettre à jour les lois régissant son modèle du monde, mais ces mises à jour demeurent ancrées dans l'explication d'une seule réalité sous-jacente.

<!-- source: agentic 06/2026 | Trends \& Open Problems › Beyond L3 -->

Une extension naturelle est la \textbf{méta-modélisation du monde} : des systèmes qui raisonnent non seulement sur une fonction de transition particulière, mais sur l'espace des fonctions de transition possibles lui-même. Plutôt que d'affiner un modèle du monde observé, de tels systèmes exploreraient des systèmes de règles alternatifs définissant différents environnements possibles, par exemple en faisant varier, en étendant ou en construisant de nouvelles hypothèses, contraintes ou principes régissants.

<!-- source: agentic 06/2026 | Trends \& Open Problems › Beyond L3 -->

Comme discuté à la Section~\ref{sec:trends:representation}, la capacité à représenter et manipuler explicitement de tels principes devient de plus en plus importante dans ce contexte. <font color="navy">En particulier, les représentations symboliques peuvent offrir une interface plus naturelle pour la méta-modélisation du monde, car elles permettent aux règles régissantes d'être directement modifiées, composées et comparées à travers des mondes alternatifs.</font>

<!-- source: agentic 06/2026 | Trends \& Open Problems › Beyond L3 -->

Les formes que pourrait prendre cette capacité, que ce soit par synthèse de programmes, évolution ouverte, génération procédurale de mondes, ou d'autres mécanismes, demeurent une question ouverte. Plus largement, cela soulève la question de savoir si l'aboutissement de la modélisation du monde réside dans des modèles toujours plus précis d'un monde, ou dans des systèmes capables d'explorer et de raisonner systématiquement sur de multiples mondes définis par différentes lois régissantes. Nous nous attendons à ce que différentes communautés de recherche parviennent à différentes formulations de cette capacité, selon que l'accent porte sur la performance prédictive, la compréhension scientifique ou la modélisation générative, et nous laissons la question de ce qui constitue le modèle du monde ultime comme une invitation ouverte à la communauté élargie.


## 11. Directions futures : représentation, contrôle incarné, auto-révision

<!-- source: not merely injecting 02/2026 | Future Work -->

Après avoir analysé le domaine de recherche actuel des modèles du monde et proposé un cadre normatif unifié, cette section explore plusieurs directions critiques essentielles aux futures percées du domaine.

<!-- source: not merely injecting 02/2026 | Future Work -->

La perception et la reconstruction précises de l'environnement temporo-spatial constituent la pierre angulaire du raisonnement et de la génération au sein des modèles du monde. Cependant, les techniques de représentation 3D et 4D existantes font encore face à des défis redoutables. Bien que des méthodes telles que le maillage 3D, NeRF~\cite{mildenhall2021nerf}, le 3D Gaussian Splatting~\cite{kerbl20233dgs}, et les modèles de représentation 4D~\cite{wu20244dgs, yang2023realtime4dgs} aient réalisé des avancées significatives dans l'ajustement des apparences visuelles, permettant la synthèse d'objets ou de scènes photoréalistes, <font color="green">elles demeurent essentiellement des représentations optiques. Elles manquent d'une expression intrinsèque des propriétés physiques du monde réel, telles que la masse, le frottement, l'élasticité et le volume de collision.</font> En outre, les représentations actuelles peinent à soutenir l'exploration et l'interaction libres avec une faible surcharge de calcul. Par exemple, le 3DGS s'appuie souvent sur des nuages de points massifs pour ajuster de force des effets visuels ; de telles représentations non structurées et discrètes sont difficiles à faire correspondre à des entités physiquement cohérentes, entraînant des erreurs logiques lorsque le modèle traite la déformation d'objets, la dynamique des fluides ou des contacts complexes. <font color="navy">Par conséquent, la recherche future doit transcender la simple reconstruction d'apparence et s'orienter vers une représentation physiquement ancrée. Nous devons explorer de nouvelles structures de données ou représentations implicites neuronales qui intègrent des attributs physiques tout en maintenant des visuels de haute fidélité, réduisant significativement le coût de calcul du rendu et de l'interaction.</font> Cela dotera les modèles du monde d'une représentation spatio-temporelle à la fois librement explorable et strictement conforme aux lois physiques.

<!-- source: not merely injecting 02/2026 | Future Work -->

L'IA incarnée sert de véhicule idéal permettant aux modèles du monde d'explorer et de valider leur compréhension du monde réel. Le goulot d'étranglement actuel réside dans la difficulté de transférer directement les politiques générées par les modèles du monde vers des robots physiques, une limitation enracinée dans la flexibilité opérationnelle, la précision de détection et la plausibilité physique des systèmes incarnés actuels. Le développement futur devrait se concentrer sur le renforcement des capacités de contrôle des modèles du monde au sein d'environnements complexes et dynamiques. Premièrement, les modèles doivent s'adapter à des morphologies robotiques présentant un plus grand nombre de degrés de liberté (DoF), s'étendant des tâches de saisie simples à la manipulation dextre fine. <font color="magenta">Deuxièmement, l'écart sim-to-real doit être comblé, permettant aux modèles du monde de générer des séquences d'action respectant les contraintes matérielles, telles que les limites de couple et les singularités articulaires, permettant ainsi aux agents incarnés de naviguer efficacement dans des scénarios divers du monde réel.</font> <font color="deeppink">En outre, les modèles du monde devraient être dotés de capacités de planification à long horizon, leur permettant de comprendre la logique causale des tâches et de commander à des agents incarnés d'accomplir des missions complexes en plusieurs étapes dans des environnements non structurés.</font> Ultimement, après avoir compris le monde, le modèle devrait être capable d'accomplir des tâches sophistiquées dans le monde réel via des plateformes robotiques physiques.

<!-- source: not merely injecting 02/2026 | Future Work -->

<font color="olive">Au-delà du renforcement de la capacité d'exploration externe, les améliorations du modèle du monde lui-même sont tout aussi cruciales. Les systèmes actuels reposent lourdement sur un entraînement hors ligne à grande échelle et manquent de mécanismes de correction active des erreurs ou d'auto-mise à jour après déploiement. La recherche future devrait s'efforcer de doter les modèles du monde de métacognition et d'autoréflexion. Plus précisément, les modèles devraient posséder la capacité d'estimer l'incertitude concernant leurs propres prédictions. Lorsqu'un écart significatif survient entre une prédiction et une observation réelle, le modèle devrait déclencher de manière autonome un mécanisme de réflexion pour identifier les lacunes de connaissance. Il devrait ensuite effectuer spontanément un affinage ciblé en collectant des données spécifiques ou en rejouant des échantillons à haute valeur, plutôt que d'attendre passivement un cycle complet de réentraînement. Bien que les méthodes actuelles d'apprentissage par renforcement contribuent à la pensée proactive, elles restent attachées à des fonctions de récompense définies par l'humain. Ainsi, parvenir à une exploration autonome au sein du modèle du monde est essentiel. Simultanément, pour répondre à des exigences de tâches évolutives, les modèles du monde doivent présenter une itération modulaire efficace et flexible. Les modules de perception, de mémoire, de raisonnement et de planification devraient soutenir un affinage et des mises à niveau indépendants. Cette conception permet aux chercheurs d'améliorer itérativement des faiblesses spécifiques (par exemple, mettre à niveau le module de raisonnement physique sans nuire aux autres capacités du modèle du monde), réalisant ainsi un apprentissage tout au long de la vie et une évolution agile de l'ensemble du système.</font>


## 12. Conclusion : de la prédiction à l’évolution gouvernée

<!-- source: agentic 06/2026 | Conclusion -->

Cet article a proposé une taxonomie fondée sur les capacités pour la modélisation du monde, organisée selon deux axes : trois niveaux de capacité (Prédicteur, Simulateur, Évolueur) et quatre perspectives (physique, numérique, sociale, scientifique).

<!-- source: agentic 06/2026 | Conclusion -->

Un \textbf{Prédicteur L1} apprend des opérateurs de transition locaux $p_\theta(z_t \mid z_{t-1}, a_t)$ dont la qualité est mesurée par la calibration à une étape, la robustesse et l'identifiabilité (Section~\ref{sec:l1}).
Un \textbf{Simulateur L2} compose ces opérateurs en déroulements à long horizon conditionnés par l'action, qui doivent satisfaire trois conditions limites (cohérence à long horizon, sensibilité aux interventions et cohérence des contraintes) sous les lois régissant le domaine cible (Section~\ref{sec:l2}).
<font color="olive">Un \textbf{Évolueur L3} referme la boucle en concevant de manière autonome des expériences, en collectant des preuves, et en révisant son modèle de dynamique lorsque les prédictions échouent (Section~\ref{sec:l3}). Des systèmes actuels tels que CAMEO~\citep{kusne2020cameo} et A-Lab~\citep{szymanski2023alab} en science autonome fournissent la preuve la plus solide que la révision de modèle en boucle fermée est déjà réalisable dans des domaines bien instrumentés, tandis que des systèmes de découverte algorithmique guidés par évaluateur tels que FunSearch~\citep{romera2024funsearch} et AlphaEvolve~\citep{alphaevolve2025} montrent comment un scoring automatisé et des portes de régression peuvent soutenir des boucles L3 partielles.</font>

<!-- source: agentic 06/2026 | Conclusion -->

Organiser les domaines par régime de \textbf{loi régissante} plutôt que par modalité a révélé à la fois des principes partagés et des différences irréductibles (Section~\ref{sec:l2}). Les systèmes du monde \textit{physique} bénéficient d'a priori géométriques et de lois de conservation ; les systèmes du monde \textit{numérique} exploitent la sémantique déterministe des programmes ; les systèmes du monde \textit{social} exigent des représentations de théorie de l'esprit ; et les systèmes du monde \textit{scientifique} couplent les modèles à des flux de preuves expérimentales. La taxonomie L1$\to$L2$\to$L3 s'applique uniformément à travers ces régimes, mais le contenu de chaque niveau (ce qui constitue un déroulement valide, ce qui compte comme une violation de loi, quelles preuves sont disponibles) varie fondamentalement.

<!-- source: agentic 06/2026 | Conclusion -->

Pour rendre les affirmations de capacité testables, <font color="darkgoldenrod">nous avons proposé des principes d'évaluation centrés sur la décision et un package d'évaluation minimal reproductible (Section~\ref{sec:evaluation})</font>, et fourni une feuille de route architecturale reliant les choix de représentation, de dynamique et de contrôle à chaque niveau de capacité et régime de déploiement (Section~\ref{sec:implementation}). Les problèmes ouverts de la Section~\ref{sec:trends} tracent un programme de recherche : l'apprentissage de représentation causale à L1, le déroulement cohérent avec les lois et la généralisation compositionnelle à L2, et la conception sûre et autonome d'expériences ainsi que la révision de modèle à L3.

<!-- source: agentic 06/2026 | Conclusion -->

<font color="navy">Un thème transversal émergeant de cette étude est la question du substrat de représentation. La progression L1$\to$L2$\to$L3 décrit ce qu'un modèle du monde peut faire, mais laisse ouverte la forme qu'il devrait prendre.</font>

<!-- source: agentic 06/2026 | Conclusion -->

<font color="navy">Les représentations latentes continues se sont avérées indispensables pour apprendre des opérateurs de transition à grande échelle, mais l'histoire de la découverte scientifique suggère que la révision des lois, marque distinctive de L3, s'est typiquement appuyée sur des substrats symboliques : les lois de Newton, les équations de Maxwell et le Modèle Standard sont tous des modèles du monde dont les principes régissants sont explicites, composables et directement révisables.</font>

<!-- source: agentic 06/2026 | Conclusion -->

<font color="navy">Les modèles du monde neuronaux actuels encodent les invariances implicitement via l'architecture et l'entraînement, ce qui convient à L1 et L2 mais devient un handicap à L3, où la tâche consiste à réviser la structure du modèle elle-même.</font>

<!-- source: agentic 06/2026 | Conclusion -->

<font color="navy">Nous considérons donc le développement de modèles du monde capables de découvrir et de manipuler des lois régissantes symboliques à partir des données, plutôt que de simplement les absorber dans des représentations latentes, comme l'un des problèmes ouverts les plus importants du domaine.
La manière d'étendre cela aux mondes physique, numérique, social et scientifique demeure un défi fondamental.</font>

<!-- source: agentic 06/2026 | Conclusion -->

\begin{takeaway}[Point clé]
L'avenir de l'IA agentique ne réside pas dans des prédicteurs plus grands, mais dans des modèles qui internalisent les lois régissant le monde, simulent sa dynamique, et <font color="olive">évoluent continuellement à travers des boucles actives d'essai-erreur</font>, leur permettant de naviguer, d'interpréter et, finalement, de remodeler le monde.
\end{takeaway}

<!-- source: not merely injecting 02/2026 | Conclusion -->

Dans cet article, nous avons analysé l'état actuel de la recherche sur les modèles du monde, <font color="red">notant une prévalence d'intégrations spécifiques à une tâche. Bien que précieuses, ces approches manquent souvent de la cohérence systémique nécessaire à une compréhension générale du monde.</font> Nous avons proposé un Cadre Unifié de Modèle du Monde qui intègre l'interaction, la perception, le raisonnement, la mémoire et la génération dans une conception normative. En discutant des limitations des méthodes existantes et des compromis de la standardisation, nous mettons en évidence le potentiel de ce cadre à favoriser une recherche plus robuste et principielle. Nous espérons que ce travail servira de ligne directrice pour les futurs efforts en matière de représentation physiquement ancrée, de contrôle incarné et d'évolution autonome, faisant ultimement progresser des agents capables d'une interaction active et intelligente avec le monde complexe.

<!-- contexte : Discussion and Future Directions › The Road Ahead -->

<!-- source: survey archi 05/2026 -->

Nous concluons par plusieurs observations spéculatives concernant l'orientation future du domaine. L'intégration du raisonnement latent aux modèles du monde — illustrée par Coconut~\cite{hao2024coconut}, LCDrive~\cite{tan2025lcdrive} et FutureX~\cite{xiang2025futurex} — suggère que les modèles du monde pourraient évoluer de simulateurs passifs vers des moteurs de raisonnement actifs, capables de soutenir une délibération à plusieurs étapes dans l'espace latent. Si cette trajectoire se poursuit, la distinction entre « penser » et « simuler » pourrait devenir de plus en plus floue, les modèles du monde servant de substrat partagé à la fois pour la perception et la cognition.

<!-- source: survey archi 05/2026 -->

<font color="deeppink">Le développement de modèles du monde hiérarchiques et compositionnels — des systèmes qui décomposent des environnements complexes en composants réutilisables et raisonnent à travers plusieurs niveaux d'abstraction temporelle et spatiale — demeure un objectif important mais encore largement inaccompli. Les approches hiérarchiques existantes~\cite{hafner2022director, gumbsch2024thick} ont démontré des résultats prometteurs dans des environnements structurés, mais l'extension de ces idées à des contextes du monde réel ouverts, caractérisés par des objets hétérogènes, des interactions incertaines et une structure de tâches à long horizon, demeure un défi majeur.</font>

<!-- source: survey archi 05/2026 -->

Enfin, la question de ce que signifierait pour un modèle du monde de « comprendre » le monde, plutôt que de simplement le prédire, demeure à la fois philosophiquement significative et lourde de conséquences pratiques. L'écart entre les systèmes actuels et la compréhension causale, robuste et flexible du monde dont font preuve même des organismes biologiques relativement simples reste substantiel. Réduire cet écart nécessitera non seulement des modèles plus grands et davantage de données, mais aussi des avancées conceptuelles sur la manière dont l'intelligence représente, apprend et raisonne sur la structure de la réalité physique et sociale. Cette étude a cherché à cartographier l'état actuel du domaine ; ses chapitres les plus importants restent encore à explorer.

<!-- source: survey archi 05/2026 -->

\newpage
\bibliographystyle{unsrtnat}
\bibliography{ref}

<!-- ===== AJOUT depuis robot survey 04/2026 (sections 3+) — À TRADUIRE ===== -->
