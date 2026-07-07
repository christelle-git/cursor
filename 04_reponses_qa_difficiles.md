# Réponses aux 21 questions difficiles — préparation Q&A keynote « L'IA ouvre les yeux »

> **Mode d'emploi.** Pour chaque question : la **réponse modèle** (ce que vous dites sur scène, en 30–60 secondes), le **niveau 2** (si l'interlocuteur creuse), et le **piège à éviter**. Les réponses sont écrites pour être dites à l'oral : phrases courtes, une idée par phrase, et toujours un retour au fil rouge — *« que prédit-il, et pour quoi faire ? »*.

---

## Partie 1 · Fondements formels

### Q1 — « Votre formule utilise s_t, mais l'agent n'observe jamais l'état. Comment survit-elle à l'observabilité partielle ? C'est quoi un état de croyance ? »

**Réponse modèle.**
Vous avez raison : la formule sur scène est la version simplifiée. Le cadre exact, c'est le **POMDP** — processus de décision markovien *partiellement observable*. L'agent ne voit pas l'état du monde \(s_t\), il reçoit une observation \(o_t\) partielle et bruitée : une caméra ne voit pas derrière le camion. La réponse théorique, c'est l'**état de croyance** : au lieu de « le monde est dans l'état X », l'agent maintient une distribution de probabilité sur tous les états possibles — « le piéton est masqué, mais il y a 70 % de chances qu'il soit encore là ». Le résultat classique (Åström, 1965) : un POMDP se ramène à un MDP sur l'espace des croyances. Le problème : cet espace est continu et immense, la mise à jour bayésienne exacte est intraitable. Donc en pratique, on **apprend une approximation** : un réseau récurrent qui compresse tout l'historique observations + actions dans un vecteur \(h_t\). C'est exactement ce que fait le RSSM de Dreamer : \(h_t\) joue le rôle d'une croyance apprise. Mon \(s_t\) sur scène, c'est ce résumé-là.

**Niveau 2.**
Que perd-on avec l'approximation ? Deux choses. Un : aucune garantie que \(h_t\) soit une **statistique suffisante** de l'historique — le réseau peut oublier une information qui comptait. Deux : la croyance apprise n'est pas **calibrée** — le vrai bayésien dit « 70 % », le réseau encode quelque chose qui ressemble à une confiance mais sans sémantique probabiliste garantie. C'est un des chantiers du doute (voir Q2). En contrepartie : ça passe à l'échelle sur des images brutes, ce que le filtrage bayésien exact ne fera jamais.

**Piège.**
Ne pas dire « on ajoute de la mémoire et c'est réglé ». Concéder d'emblée la simplification (« la formule scénique est le cas observé ; le cas réel est le POMDP ») : cela montre que la vulgarisation est un choix, pas une ignorance.

---

### Q2 — « Comment distinguer incertitude aléatorique et épistémique ? Et pourquoi c'est critique pour "douter" ? »

**Réponse modèle.**
Deux incertitudes très différentes se cachent sous le mot « doute ». L'**aléatorique** : le monde est intrinsèquement variable — le dé qui roule, le piéton qui peut tourner à gauche ou à droite. Aucune donnée supplémentaire ne la réduira. L'**épistémique** : *le modèle* ne sait pas — il n'a jamais vu cette situation. Plus de données la réduisent. La distinction est critique parce que la bonne réaction est opposée : face à l'aléatorique, on **planifie sur la distribution** (se préparer aux deux directions du piéton) ; face à l'épistémique, on **se méfie du modèle lui-même** — ralentir, explorer, rendre la main à l'humain. Un système qui confond les deux est dangereux : il peut être très confiant dans une situation qu'il n'a jamais vue, simplement parce que sa tête de prédiction sort une distribution étroite.

**Niveau 2.**
Comment on les capture, techniquement. L'aléatorique : par la **forme de la sortie** — le modèle prédit une distribution, pas un point (gaussienne, mixture MDN chez Ha & Schmidhuber, latents catégoriels chez DreamerV3). L'épistémique : par le **désaccord entre modèles** — on entraîne un ensemble de N modèles de dynamique ; là où ils divergent, le modèle « ne sait pas » (c'est le principe de PETS, de Plan2Explore). Variantes : dropout bayésien, distance aux données en espace latent. Point honnête : la séparation propre des deux reste un sujet de recherche ouvert ; les ensembles capturent un mélange, et la calibration hors distribution n'est garantie par rien.

**Piège.**
Ne pas répondre « le modèle sort des probabilités, donc il doute ». Une distribution de sortie ne capture que l'aléatorique. Le doute qui compte pour la sécurité — « je n'ai jamais vu ça » — exige un mécanisme séparé.

---

### Q3 — « Pourquoi le RSSM sépare-t-il un chemin déterministe et un chemin stochastique ? Que se passe-t-il si tout est stochastique ? Tout déterministe ? »

**Réponse modèle.**
Le RSSM (Recurrent State-Space Model, cœur de Dreamer) maintient deux composantes à chaque pas : un vecteur **déterministe** \(h_t\) porté par un GRU, et un vecteur **stochastique** \(z_t\) échantillonné. Chacune répare le défaut de l'autre. **Tout déterministe** : le modèle ne peut représenter qu'un seul futur — or le monde est multimodal (le piéton traverse ou ne traverse pas). Un modèle déterministe entraîné sur des futurs multiples prédit *la moyenne* des futurs, qui est souvent un futur impossible — le piéton fantôme à moitié engagé. **Tout stochastique** : à chaque pas, on ré-échantillonne tout l'état ; le bruit s'injecte dans la totalité de la mémoire, et l'information de long terme (« il y avait un vélo derrière le camion il y a 3 secondes ») se dégrade de pas en pas — les gradients à travers l'échantillonnage sont aussi beaucoup plus bruités, l'entraînement devient instable. La séparation donne le meilleur des deux : \(h_t\) transporte la mémoire longue sans corruption, \(z_t\) absorbe la variabilité irréductible du monde.

**Niveau 2.**
Le mécanisme d'entraînement qui va avec : deux distributions sur \(z_t\). Le **posterior** \(q(z_t \mid h_t, o_t)\) voit l'observation courante ; le **prior** \(p(z_t \mid h_t)\) doit deviner \(z_t\) *sans* la voir — depuis la seule dynamique. Une perte KL les rapproche. C'est ça qui rend le rêve possible : au moment d'imaginer, il n'y a plus d'observations, on déroule le prior seul. Le KL est littéralement l'entraînement du modèle à se passer de ses yeux. C'est l'ablation qui répond à la question : sans cette structure, les rollouts imaginés divergent en quelques pas.

**Piège.**
Ne pas inverser les rôles (le déterministe = mémoire, le stochastique = multimodalité). Et si on vous pousse sur « pourquoi un GRU et pas un transformer » : les versions récentes (TransDreamer, DreamerV4 et la plupart des world models vidéo) utilisent effectivement de l'attention ; le principe deux-chemins demeure.

---

### Q4 — « Pourquoi DreamerV3 utilise-t-il des latents catégoriels et du free bits ? Qu'est-ce qui casse sans eux ? »

**Réponse modèle.**
Ce sont deux réglages de stabilité, et ils répondent à deux pannes bien identifiées. **Latents catégoriels** (32 variables × 32 classes, échantillonnées en one-hot, gradient par straight-through) plutôt que gaussiens : d'abord, le monde est souvent **discret par nature** — un objet est saisi ou pas, une porte est ouverte ou fermée ; une gaussienne interpole entre les modes et produit des états intermédiaires qui n'existent pas. Ensuite, les catégorielles se sont révélées **plus stables à l'optimisation** que les gaussiennes reparamétrisées, dont les gradients explosent quand la variance s'effondre. **Free bits** : on ne pénalise le KL entre prior et posterior qu'au-delà d'un plancher (~1 nat). Sans ce plancher, l'optimiseur découvre le raccourci dégénéré du **posterior collapse** : il écrase le KL à zéro en rendant le latent non-informatif — le modèle « prédit parfaitement » un résumé qui ne contient plus rien. Le free bits garantit un budget minimal d'information dans le latent, en dessous duquel la pression KL se relâche.

**Niveau 2.**
Ces deux choix font partie d'un ensemble de techniques qui permettent à DreamerV3 de tourner avec **les mêmes hyperparamètres sur tous les domaines** (Atari, contrôle continu, Minecraft) — c'est ça le vrai résultat du papier : la robustesse. Les autres : **KL balancing** (le gradient du KL pousse plus fort sur le prior que sur le posterior — on veut que la dynamique rejoigne la perception, pas l'inverse), **symlog** pour normaliser récompenses et valeurs d'échelles très différentes, retours encodés en **two-hot**, normalisation des retours par percentiles. Message d'ensemble : la différence entre un world model de papier et un world model qui marche partout, c'est cette ingénierie de stabilité.

**Piège.**
Question très pointue : si vous sentez la limite de votre maîtrise, donnez l'intuition (multimodalité + anti-collapse) et renvoyez au papier — « le détail des ablations est dans DreamerV3, Hafner et al., je vous envoie la référence ». Ne jamais improviser une justification mathématique inventée.

---

## Partie 2 · MuZero et planification

### Q5 — « MuZero ne "devine" pas vraiment les règles : le MCTS connaît les coups légaux à la racine, et le modèle n'est que value-equivalent. Que répond-il sur la légalité d'un coup à 10 coups de profondeur ? »

**Réponse modèle.**
Vous avez raison, et je vous remercie de la nuance — elle illustre exactement mon triptyque. Précisons : MuZero reçoit les **coups légaux à la racine** de sa recherche (c'est l'environnement qui les lui donne au moment de jouer) et le **signal de fin de partie**. Ce qu'il n'a jamais : les règles de *transition* — comment l'état évolue. À l'intérieur de son arbre de recherche, à 10 coups de profondeur, il déroule son modèle appris, et ce modèle ne sait **pas** dire si un coup est légal ni reconstruire le plateau. Il est *value-equivalent* : entraîné pour que valeur, politique et récompense prédites soient justes — rien d'autre. Demandez-lui le plateau à 10 coups : il n'a même pas de représentation du plateau, juste un état latent utile à la décision. Et c'est le cœur de mon propos : MuZero est le cas extrême de la famille « prédire la valeur » — un modèle qui ne comprend *que* ce qui sert à gagner, et qui gagne précisément pour ça. Ma formule scénique « on ne lui donne jamais les règles » est la version 15 secondes ; la version exacte est celle que vous venez de dire.

**Niveau 2.**
Conséquence pratique de la value-equivalence : le modèle de MuZero est **inutilisable pour autre chose** que la tâche pour laquelle il a été entraîné. Changez la récompense, il faut tout réapprendre — contrairement à un modèle de dynamique « neutre » réutilisable pour plusieurs objectifs. C'est le trade-off fondamental de la famille 1 : efficacité maximale, transférabilité minimale. À noter aussi : les recherches profondes de l'arbre peuvent sortir du domaine où le modèle est fiable — d'où des variantes qui régularisent la profondeur effective de recherche.

**Piège.**
Ne pas défendre la formulation scénique mot à mot. Concéder vite, requalifier (« règles de transition » vs « coups légaux à la racine »), puis retourner la nuance en illustration de votre thèse. C'est une question où l'on gagne des points en donnant raison à l'interlocuteur.

---

### Q6 — « MCTS versus MPC : pourquoi MuZero utilise un arbre et Dreamer non ? Choix d'implémentation ou conséquence profonde ? »

**Réponse modèle.**
Conséquence profonde, essentiellement de la **nature de l'espace d'actions**. Un arbre (MCTS) énumère des branches : il lui faut des actions **discrètes et peu nombreuses** — aux échecs, ~35 coups possibles par position, ça se branche. En contrôle continu — un bras robotique à 7 articulations, des actions dans \(\mathbb{R}^7\) — il y a une infinité de branches : l'arbre ne peut pas énumérer. D'où les deux autres philosophies. Le **MPC** (model predictive control) : échantillonner des *séquences* d'actions candidates, les dérouler dans le modèle, garder les meilleures, raffiner (méthode CEM), exécuter la première action, recommencer. Et la voie de Dreamer : ne pas planifier au moment d'agir, mais **entraîner un réflexe** (la politique) par gradient *à travers* le rêve — le modèle appris étant un réseau de neurones, il est différentiable, on peut remonter « quelle action aurait amélioré le futur imaginé ». Deuxième facteur : le déterminisme. L'arbre exploite des transitions quasi déterministes ; dans un monde très stochastique, chaque branche devrait porter une distribution, et l'arbre explose (il faut passer à des variantes à échantillonnage type Stochastic MuZero).

**Niveau 2.**
Les systèmes réels combinent les deux : politique apprise comme **prior** qui guide et élague la recherche (c'est déjà le cas dans MuZero : la politique apprise oriente le MCTS), recherche au moment d'agir quand l'enjeu le justifie et que le budget de calcul le permet. Analogie utile en salle : le réflexe, c'est le coup d'œil du grand maître ; la recherche, c'est son calcul de variantes — il a les deux, et il dose selon la position et la pendule.

**Piège.**
Si on pousse sur « pourquoi ne pas différencier à travers un modèle stochastique ? » : on peut (reparamétrisation ou straight-through), c'est ce que fait Dreamer ; le vrai coût est la **variance des gradients** et leur biais quand le modèle est faux — transition parfaite vers Q7.

---

### Q7 — « Dreamer rétropropage à travers un modèle faux. Le gradient d'un modèle faux pointe-t-il dans la bonne direction ? N'est-ce pas votre "exploitation du bug du rêve" au niveau du gradient ? »

**Réponse modèle.**
Si, exactement — c'est la même maladie, et je vous accorde le point. La rétropropagation à travers le rêve dit à l'acteur : « voilà comment modifier ton action pour améliorer le futur *tel que le modèle l'imagine* ». Si le modèle a un bug — un mur traversable, une friction sous-estimée — le gradient pointe **précisément vers le bug** : c'est là que le retour imaginé s'améliore le plus facilement. L'optimisation est un chercheur de failles professionnel. Ce qui empêche l'effondrement en pratique, c'est un système de garde-fous : **un**, horizon d'imagination court (~15 pas chez Dreamer) — on ne laisse pas l'erreur se composer (voir Q8) ; **deux**, **λ-returns avec critique** — le retour imaginé mélange les récompenses rêvées et une fonction de valeur apprise qui, elle, est ancrée sur l'expérience réelle, ce qui dilue les hallucinations du modèle ; **trois**, ré-ancrage permanent — l'agent alterne sans cesse rêve et réel, chaque interaction réelle corrige le modèle là où la politique l'a exploité ; **quatre**, la régularisation en entropie maintient de l'exploration au lieu de laisser la politique se sur-spécialiser sur une faille.

**Niveau 2.**
Version théorique : les bornes de sous-optimalité du RL basé modèle croissent avec l'erreur du modèle **sur la distribution d'états visités par la nouvelle politique** — pas sur celle des données. C'est le serpent qui se mord la queue : la politique optimisée se déplace précisément vers les régions où le modèle n'a pas été validé. Les approches conservatrices (pénaliser le retour imaginé par l'incertitude épistémique du modèle, comme MOPO en offline RL) attaquent ce point : on rêve, mais on se méfie de ses propres rêves proportionnellement à son ignorance. Boucle parfaite avec Q2.

**Piège.**
Ne pas prétendre que le problème est résolu. La bonne posture : « c'est LE problème central du RL basé modèle, voici les quatre mécanismes qui le contiennent en pratique, et voici pourquoi il reste ouvert en théorie ».

---

## Partie 3 · Horizon et erreur composée

### Q8 — « L'erreur croît comment — linéairement, exponentiellement ? Et comment DreamerV3 réussit une tâche de 500 étapes avec un horizon de rêve de 15 pas ? »

**Réponse modèle.**
Sur la croissance : dans le pire cas, **exponentiellement**. Si la dynamique amplifie les écarts (constante de Lipschitz > 1 — tout système avec instabilités ou sensibilité aux conditions initiales), une erreur \(\epsilon\) au pas 1 peut devenir \(\epsilon \cdot L^{H}\) au pas \(H\). En pratique on est entre le linéaire (systèmes contractants) et l'exponentiel (systèmes chaotiques) — d'où la règle : horizon court. Et maintenant le paradoxe apparent, qui est la question la plus importante de la soirée côté technique : Minecraft, c'est des **milliers** de pas, Dreamer ne rêve que **15** pas — comment ? Réponse : le rêve de 15 pas ne se termine pas dans le vide, il se termine **sur une fonction de valeur**. Le critique, appris par bootstrap, résume « tout le futur au-delà » en un seul nombre : « être ici, avec une pioche en fer, près d'une grotte profonde, ça vaut tant ». On ne simule jamais les 500 pas jusqu'au diamant : on simule 15 pas vers un état dont la *valeur* encapsule les 485 suivants. L'horizon **de simulation** est court ; l'horizon **de valeur** est illimité, parce que la valeur s'apprend par récurrence sur elle-même (équation de Bellman), pas par déroulement du modèle. Les λ-returns font l'interpolation entre les deux.

**Niveau 2.**
Où est l'astuce, alors ? La difficulté n'a pas disparu, elle s'est déplacée : apprendre une bonne fonction de valeur avec récompense éparse est dur — c'est précisément pourquoi Minecraft a résisté des années. Ce qui l'a débloqué chez DreamerV3, c'est la robustesse d'entraînement (Q4) plus l'efficacité d'échantillonnage du rêve : chaque expérience réelle est rejouée en centaines de variantes imaginées, ce qui densifie l'apprentissage de la valeur. Et le compromis demeure : la valeur est un résumé *scalaire* — elle dit « ça vaut le coup », pas « voici le plan » ; pour du raisonnement multi-étapes explicite, il faut autre chose (Q9).

**Piège.**
C'est la contradiction interne n°1 de la keynote (séquence 3.2 « tâches longues » vs séquence 7 « horizon court »). L'avoir résolue *proactivement* — idéalement en glissant une phrase dans la séquence 7 : « horizon de rêve court, mais relayé par une mémoire de la valeur qui, elle, voit loin » — désamorce la question avant qu'elle arrive.

---

### Q9 — « La hiérarchie temporelle n'est-elle pas la vraie réponse ? Pourquoi si peu de world models hiérarchiques en production, alors qu'on en parle depuis les options de Sutton (1999) ? »

**Réponse modèle.**
Sur le fond, d'accord : la hiérarchie est probablement la bonne réponse *à terme*. C'est ainsi que nous fonctionnons — vous planifiez « aller à l'aéroport » en trois étapes abstraites, pas en 100 000 commandes musculaires ; chaque niveau prédit à son échelle de temps, et l'erreur composée se compte en pas *abstraits*, beaucoup moins nombreux. Pourquoi si peu en production, alors ? Parce que le problème dur n'est pas d'*empiler* des niveaux, c'est de **découvrir les bonnes abstractions automatiquement**. Les options de Sutton définissent le formalisme (des sous-politiques avec conditions d'entrée et de sortie), pas la méthode pour les trouver. Fixées à la main, elles ne passent pas à l'échelle ; apprises de bout en bout, on se heurte à des problèmes d'optimisation jointe notoirement instables — le niveau haut apprend sur un niveau bas qui change sous ses pieds, et il n'y a pas de signal clair pour dire où « couper » le temps. Pendant ce temps, la solution plate + fonction de valeur (Q8) marchait *assez bien* pour repousser l'urgence.

**Niveau 2.**
Où ça bouge : Director (Hafner, 2022) fait de la hiérarchie *dans le latent d'un world model* — un manager choisit des états-buts, un worker les atteint ; les feature backbones type feudal / HRL reviennent dans la robotique de manipulation longue ; et de facto, les systèmes déployés sont déjà hiérarchiques *par architecture d'ingénierie* : un planificateur d'itinéraire au-dessus d'un planificateur de trajectoire au-dessus d'un contrôleur — la hiérarchie existe, elle est juste conçue à la main plutôt qu'apprise. Le point de bascule à surveiller : quand la découverte d'options apprise battra la décomposition manuelle sur une tâche industrielle réelle.

**Piège.**
Ne pas balayer la question (« la hiérarchie ne marche pas ») ni sur-promettre (« c'est pour demain »). La bonne réponse est : formalisme ancien, verrou = découverte automatique des abstractions, et hiérarchie manuelle déjà omniprésente en production.

---

## Partie 4 · Causalité

### Q10 — « Un world model conditionné sur l'action apprend p(s'|s,a) — c'est interventionnel, pas observationnel. Votre critique "corrélation n'est pas causalité" ne vise-t-elle pas surtout Sora et Genie, pas Dreamer et MuZero ? »

**Réponse modèle.**
Vous mettez le doigt sur la vraie ligne de fracture, et je vous suis à 80 %. Oui : un agent qui **agit** et observe les conséquences de *ses propres* actions fait, de fait, des interventions — au sens de Pearl, il collecte des données sous \(do(a)\). Le baromètre : un agent qui a *bougé l'aiguille* lui-même et constaté que la tempête ne venait pas a appris la bonne structure causale, là où un modèle qui a seulement *regardé* des vidéos ne le peut pas. Donc la critique frappe d'abord la famille « pixels passifs » — entraînée sur de la vidéo sans actions — et beaucoup moins Dreamer ou MuZero. Mais voici mes 20 % de réserve, et ils comptent : l'interaction donne un accès causal **local et biaisé**. Local : l'agent n'apprend la causalité que sur les variables qu'il peut manipuler et dans les régimes qu'il visite. Biaisé : si sa politique de collecte est corrélée à des variables cachées — le robot n'explore que quand la lumière est bonne — des **confondeurs** se réintroduisent dans ses propres données. L'interaction est nécessaire à la causalité ; elle n'est pas suffisante.

**Niveau 2.**
Cas d'école industriel : le véhicule autonome entraîné sur données de conduite *humaine*. Les actions loggées sont celles d'un conducteur qui réagit à des choses que les capteurs ne voient pas toujours — l'intention lue dans un regard de piéton. Le modèle apprend \(p(s' \mid s, a)\) *sous la politique humaine*, pas sous la sienne : c'est le problème du distribution shift de l'apprentissage par imitation, qui est un problème causal déguisé. D'où l'intérêt des mondes appris pour générer des **contrefactuels** (« et si la voiture n'avait pas freiné ? ») — à condition que le modèle lui-même soit causal sur ce point, cercle qu'il faut briser par de la collecte interventionnelle ciblée.

**Piège.**
Question favorable si vous l'anticipez : elle affine votre triptyque au lieu de le contredire. À intégrer en une phrase dans la séquence 7 : « cette limite frappe surtout les modèles qui ont *regardé* le monde sans jamais y *agir* ».

---

### Q11 — « Concrètement, quel test feriez-vous passer à un world model pour vérifier qu'il a une notion de cause, pas seulement de succession ? »

**Réponse modèle.**
Trois tests, du plus simple au plus exigeant. **Un — le test contrefactuel** : même scène, on intervient sur un seul élément, et on compare la prédiction au monde réel ou à un simulateur validé. Je retire l'objet qui soutient la planche : prédit-il la chute ? Je coupe la corrélation habituelle — le baromètre est cassé mais la pression chute : prédit-il quand même la tempête ? Un modèle de succession suit la corrélation ; un modèle causal suit le mécanisme. **Deux — le test d'intervention hors distribution** : on demande des actions jamais vues dans les données, dans des états connus. Pousser l'objet *vers la gauche* quand le dataset ne contient que des poussées vers la droite. La physique est symétrique ; les corrélations du dataset ne le sont pas — un modèle causal généralise, un modèle corrélationnel invente. **Trois — le test d'invariance** : on change ce qui ne devrait rien changer (couleur, texture, fond) et on vérifie que les prédictions de dynamique sont invariantes ; puis on change ce qui devrait tout changer (masse, support) et on vérifie qu'elles bougent. C'est l'esprit des benchmarks de physique intuitive type IntPhys : montrer des scènes possibles et impossibles, mesurer la « surprise » du modèle.

**Niveau 2.**
Le point méthodologique dur : construire ces tests exige de connaître soi-même la vérité causale — facile en physique de laboratoire, difficile en logistique ou en économie. D'où la pratique en entreprise : valider le monde appris sur les interventions *que l'on connaît* (A/B tests passés, incidents documentés, actions de maintenance et leurs suites) avant de lui faire confiance sur celles qu'on ne connaît pas. Vos historiques d'interventions sont votre banc de test causal — encore faut-il les avoir loggés (lien direct avec Q17).

**Piège.**
Ne pas répondre par la théorie (do-calculus) sans exemple opérationnel. La question dit « concrètement » : donner les trois tests, avec un exemple chacun.

---

## Partie 5 · Pixels, JEPA, le débat LeCun

### Q12 — « Les modèles vidéo montrent des capacités physiques émergentes en scalant. Pourquoi la compréhension n'émergerait-elle pas des pixels à plus grande échelle ? N'est-ce pas l'erreur qu'on a faite avec les LLM ? »

**Réponse modèle.**
C'est la meilleure objection du débat, et je vais y répondre en position personnelle plutôt qu'en certitude. D'abord ce que je concède : « prédire le prochain mot ne donnera jamais du raisonnement » était faux, et l'histoire a tranché ; l'humilité s'impose, et les modèles vidéo récents montrent bien des régularités physiques émergentes avec l'échelle. Ma position n'est donc pas « impossible », elle est « **inefficace, et l'inefficacité ne se rattrape pas en scalant** ». L'argument : dans le texte, quasiment chaque bit est porteur de sens — le langage est déjà une compression du monde par des humains. Dans la vidéo, l'écrasante majorité des bits est du **détail imprévisible et sans valeur décisionnelle** : le grain du capteur, le scintillement des feuilles, la texture exacte d'un reflet. Un objectif pixel force le modèle à dépenser sa capacité là-dessus — c'est un impôt permanent, payé à chaque pas d'entraînement, et qui *croît* avec la résolution. Et cette position est **falsifiable**, je vous donne mon critère : à budget de calcul égal, comparez un modèle pixel et un modèle à prédiction latente sur des tâches de physique intuitive et de planification — aujourd'hui, les architectures type JEPA gagnent ce match à calcul égal. Le jour où un modèle pixel gagne ce match, je change d'avis.

**Niveau 2.**
Deux nuances qui renforcent la crédibilité. Un : la frontière se brouille — les modèles vidéo sérieux ne prédisent plus des pixels bruts mais des **tokens latents** (via un autoencodeur) ; le débat réel n'est pas « pixels vs latents » mais « latents optimisés pour *reconstruire* vs latents optimisés pour *prédire* ». Deux : les deux camps peuvent avoir raison sur des créneaux différents — la génération pixel est la bonne réponse quand le *produit* est l'image (données synthétiques, terrains d'entraînement, cas Cosmos/Genie) ; la prédiction latente quand le produit est la *décision* (robot, véhicule). C'est votre question-fil qui arbitre : que prédit-il, pour quoi faire ?

**Piège.**
Ne pas caricaturer le camp scaling ni s'abriter derrière l'autorité de LeCun. Donner un critère falsifiable est ce qui distingue une position scientifique d'une croyance — et c'est très fort sur scène.

---

### Q13 — « JEPA prédit dans l'espace latent. Qu'est-ce qui empêche l'effondrement — une représentation constante, parfaitement prédictible parce que vide ? »

**Réponse modèle.**
Rien ne l'empêche *naturellement* — et c'est la faille structurelle de toute la famille, autant le dire franchement. Si l'on entraîne « prédis ta propre représentation du futur » sans garde-fou, la solution optimale est triviale : représenter tout par zéro ; erreur de prédiction nulle, information nulle. C'est le **collapse**. Un modèle pixel n'a pas ce problème — la cible (l'image vraie) est externe, il ne peut pas tricher dessus ; c'est le prix de la liberté qu'on gagne en abandonnant les pixels. Les remèdes, dans les JEPA actuels, sont architecturaux : l'encodeur **cible** n'est pas entraîné par gradient mais suit une **moyenne mobile exponentielle (EMA)** de l'encodeur en ligne — la cible bouge lentement, le prédicteur lui court après, et cette asymétrie (plus le stop-gradient, plus un prédicteur séparé) empêche la solution dégénérée de s'installer. L'autre famille de remèdes est explicite : des termes de régularisation qui **forcent la variance** des représentations et décorrèlent leurs dimensions — c'est VICReg (variance, invariance, covariance). Honnêtement : ces recettes marchent, mais la compréhension théorique de *pourquoi* l'EMA suffit reste partielle. C'est un des chantiers du domaine.

**Niveau 2.**
Le collapse total est le cas extrême ; le vrai risque en pratique est le **collapse dimensionnel** — la représentation n'utilise qu'un petit sous-espace, et l'information perdue est invisible tant qu'une tâche aval n'en a pas besoin. D'où l'importance de la question suivante (Q14) : sans génération, il faut instrumenter l'évaluation pour détecter ce qui manque. Lien avec votre plan du métro : le risque du résumé, c'est de jeter une station dont on aura besoin — le collapse est ce risque poussé à la limite.

**Piège.**
Vous présentez JEPA comme « la voie la plus profonde » : il faut connaître sa faiblesse n°1 mieux que le contradicteur. Admettre franchement (« rien ne l'empêche naturellement, voici les garde-fous ») est la seule réponse crédible.

---

### Q14 — « Comment évaluez-vous un modèle qui ne génère rien ? Un modèle à pixels, on regarde la vidéo. Un JEPA, on regarde quoi ? »

**Réponse modèle.**
On regarde **ce qu'il permet de faire** — et c'est un renversement sain, car regarder la vidéo est un très mauvais test (une vidéo splendide peut violer la physique, c'est toute ma séquence 4). Trois familles de mesures. **Un — les sondes (probing)** : on gèle la représentation et on entraîne un petit classifieur linéaire par-dessus pour prédire des grandeurs qu'on sait mesurer — positions, vitesses, contacts, « la scène est-elle physiquement possible ? ». Si un classifieur linéaire y arrive, l'information est dans la représentation, et bien organisée. **Deux — la surprise** : sur des benchmarks de physique intuitive (paires de scènes possibles/impossibles, type IntPhys), on mesure si l'erreur de prédiction du modèle est plus grande sur l'impossible ; c'est le protocole des expériences de violation d'attente chez les bébés, appliqué aux machines. **Trois — l'usage en aval, le test roi** : brancher un planificateur sur le modèle et mesurer le succès de la tâche — c'est le résultat V-JEPA 2 en robotique : planification de manipulation zéro-shot, sans entraînement spécifique au robot. Le modèle ne montre pas d'images ; il montre des taux de réussite.

**Niveau 2.**
Concéder l'asymétrie médiatique, qui est réelle et a des effets économiques : une vidéo de Tokyo sous la pluie fait le tour du monde ; « +12 points de probing linéaire sur la détection de contact » ne le fera jamais. Le camp représentation a un déficit structurel de démo — c'est un des ressorts de la géographie des investissements de la séquence 5, et une explication honnête de pourquoi les pixels dominent l'attention publique alors que le débat scientifique est ouvert.

**Piège.**
Ne pas laisser s'installer l'idée que « pas de génération = pas vérifiable ». C'est l'inverse : les métriques d'usage sont *plus* dures que le jugement visuel, qui est précisément le sens de « beau n'est pas vrai ».

---

## Partie 6 · Business, coûts, gouvernance

### Q15 — « Le robot qui marche en une heure : une heure de quoi ? Combien de GPU, combien de resets humains, et quel coût total face à un contrôleur MPC classique qui marche du premier coup ? »

**Réponse modèle.**
Détaillons l'heure, parce que vous avez raison d'exiger la facture complète. Dans DayDreamer (2022) : environ **une heure de temps réel mural**, apprentissage directement sur le robot (quadrupède Unitree A1), entraînement du world model et de la politique en continu sur une station de calcul à côté du robot — pas un datacenter, mais pas zéro non plus. Interventions humaines : oui — remettre le robot en place quand il sort de la zone, le relever au début ; au fil de l'heure, il apprend d'ailleurs à se retourner seul quand on le pousse. Donc l'heure honnête, c'est : une heure de réel, **plus** le calcul qui tourne en parallèle, **plus** une supervision humaine légère, **plus** — et c'est le vrai coût caché — les années-ingénieur de recherche derrière l'algorithme. Face au MPC classique : vous avez raison, pour la marche d'un quadrupède *dont on a le modèle physique*, un contrôleur classique bien réglé marche « du premier coup » — après des semaines d'identification de modèle et de réglage par des ingénieurs spécialisés. La comparaison juste n'est donc pas « 1 heure vs 0 heure », c'est : **où placez-vous le coût — dans l'expertise de modélisation en amont, ou dans l'apprentissage in situ ?** L'apprentissage gagne quand le modèle physique est indisponible, changeant, ou trop cher à écrire : terrain déformable, objet inconnu, usure, flotte hétérogène.

**Niveau 2.**
La grille de lecture à donner à un COMEX : trois postes — (1) coût du réel (temps machine, casse, risque, immobilisation), (2) coût du calcul (GPU, énergie — en chute continue), (3) coût de l'expertise (modélisation physique — rare et chère). Les world models déplacent la dépense de (1) et (3) vers (2). La bascule économique est favorable quand le réel est cher ou le système trop complexe à modéliser à la main — et défavorable pour un système stable, bien connu, déjà modélisé. C'est la réponse à « où commencer » : cherchez vos processus où (1) ou (3) explosent. *(Note régie : ce contenu comble le placeholder « [MOI : ici rajouter les coûts] » de la séquence 7.)*

**Piège.**
Ne jamais laisser « une heure » circuler sans le contexte — un contradicteur qui découvre les resets humains après coup vous coûtera plus cher que de les avoir annoncés vous-même.

---

### Q16 — « Si le monde appris a les mêmes biais de données que le système testé, que vaut un échec démontré dans ce monde ? Et que vaut un non-échec ? »

**Réponse modèle.**
Question de fond, qui touche le cœur de mon principe de gouvernance — prenons les deux moitiés séparément. **Le non-échec ne vaut presque rien**, et c'est précisément mon asymétrie : si le testeur et le testé partagent les mêmes angles morts — mêmes capteurs, mêmes routes, parfois mêmes datasets — le monde appris ne générera jamais la situation que ni l'un ni l'autre n'a apprise. Un blanc-seing signé par un jumeau du candidat n'est pas un blanc-seing. **L'échec, lui, garde de la valeur, mais sous condition de validation du scénario** : quand le monde appris génère une situation où le système échoue, il faut vérifier que cette situation est *plausible* — physiquement possible, pertinente pour le domaine d'exploitation — avant de compter l'échec. Si elle l'est, l'échec est une vraie découverte, quelle que soit la parenté des biais : le système testé a un défaut réel, exhibé sur un cas réel possible. Si elle ne l'est pas (artefact du générateur), on l'écarte. D'où le protocole : la disqualification exige un **scénario validé**, pas seulement un échec constaté. Et la parade structurelle au problème de parenté : **l'indépendance des lignées** — monde de test entraîné sur d'autres données, d'autres capteurs, d'autres architectures que le système testé ; c'est exactement la logique de la diversité redondante en sûreté de fonctionnement classique — on ne fait pas auditer une entreprise par sa propre filiale.

**Niveau 2.**
Formulation statistique pour un profil pointu : la valeur du test dépend de la **corrélation des erreurs** entre testeur et testé. Erreurs indépendantes : chaque échec trouvé est informatif et l'absence d'échec fait monter la confiance. Erreurs corrélées : le test ne couvre que l'intersection des compétences — il peut valider à tort, mais un échec *validé* reste une vraie trouvaille. Conséquence organisationnelle concrète pour la séquence 6 : exiger la **traçabilité des lignées de données** entre vos systèmes et vos bancs de test — question d'audit qui n'existe pas encore dans la plupart des organisations et que l'AI Act va faire émerger (Q18).

**Piège.**
Ne pas défendre « l'échec vaut toujours » : sans validation du scénario, un générateur peut fabriquer des échecs-artefacts en série. La réponse robuste est conditionnelle : échec + scénario validé = disqualification ; non-échec = rien.

---

### Q17 — « Quelle volumétrie et quelle qualité de données pour un jumeau appris ? Nos historiques sont troués, non synchronisés, sans actions loggées. Un world model sans actions, ça donne quoi ? »

**Réponse modèle.**
Je prends la dernière question d'abord, parce qu'elle est décisive : un world model **sans actions dans les logs**, c'est un modèle qui a *regardé* votre usine sans jamais savoir ce qu'on lui a *fait* — exactement la famille « vidéo passive » avec toutes ses limites causales (Q10). Il apprendra à prédire la suite normale des choses ; il ne pourra pas répondre à « que se passe-t-il si je change ce réglage ? », qui est pourtant la seule question qui justifie un jumeau. Il confondra le baromètre et la tempête dans vos propres données : telle alarme précède telle panne, mais supprimer l'alarme ne supprime pas la panne. D'où ma recommandation opérationnelle numéro un, avant tout projet de world model : **auditez vos logs d'actions**. Consignes opérateur, changements de réglage, interventions de maintenance, avec horodatage aligné sur les capteurs. C'est peu coûteux à mettre en place, ça prend de la valeur rétroactivement, et c'est le prérequis de tout le reste. Sur la volumétrie : pas de seuil universel — ce qui compte n'est pas le volume brut mais la **couverture des régimes** : dix ans de fonctionnement nominal apprennent moins qu'un an incluant des démarrages, des dégradations, des changements de produit. Les trous et la désynchronisation, eux, sont gérables — les architectures modernes tolèrent l'irrégularité, et un POMDP gère l'observation manquante par construction (Q1) — c'est un problème d'ingénierie, pas un mur.

**Niveau 2.**
Le chemin pragmatique en trois marches, à donner tel quel à une équipe : (1) **modèle prédictif passif** sur l'existant — utile pour la détection d'anomalies et pour révéler ce qui manque dans les données ; (2) **campagne de logging des actions** et, si possible, quelques excitations contrôlées du système — de petites interventions volontaires qui sont autant de données causales à haute valeur ; (3) **modèle conditionné sur les actions**, validé sur les interventions historiques connues (A/B tests, maintenances documentées — le banc causal de Q11) avant tout usage en aide à la décision. Et l'option hybride souvent optimale : greffer l'apprentissage sur un simulateur physique existant — le simulateur porte la structure causale, l'apprentissage corrige l'écart au réel (sim-to-real, calibration résiduelle).

**Piège.**
Ne pas vendre « vos données dormantes suffisent » — la séquence 6 y frôle. La version honnête : vos données dormantes suffisent *pour commencer* ; elles ne suffisent pas pour décider, tant que les actions n'y sont pas.

---

### Q18 — « L'AI Act : la documentation exigée porte sur le système final ou aussi sur le simulateur qui l'a entraîné ? Un précédent sur la validation de données synthétiques ? »

**Réponse modèle.**
Les obligations portent sur le **système à haut risque mis sur le marché** — mais elles remontent la chaîne jusqu'à ses données d'entraînement, et c'est là que le monde appris entre dans le périmètre. Concrètement : l'article 10 de l'AI Act impose une gouvernance des données d'entraînement, de validation et de test — pertinence, représentativité, examen des biais — et le texte mentionne **explicitement les données synthétiques** parmi les données couvertes ; la documentation technique de l'annexe IV exige de décrire la provenance et les méthodes d'obtention de ces données. Traduction opérationnelle : si votre système de conduite a été entraîné ou éprouvé sur des scénarios générés par un world model, la **provenance, la méthode de génération et la validation de ces scénarios font partie du dossier de conformité**. Le simulateur n'est pas certifié en tant que tel, mais il devient un objet d'audit *par transitivité*. C'est exactement ma question « qui a validé ce que la machine a imaginé ? » — transformée en pièce de dossier réglementaire, avec l'échéance d'août 2026 pour les systèmes à haut risque.

**Niveau 2.**
Sur les précédents : le cadre le plus mûr est l'automobile — les référentiels de sûreté type SOTIF (ISO 21448) et les travaux sur l'homologation par scénarios (UNECE, NCAP) intègrent déjà la validation sur scénarios simulés, avec l'exigence clé de **validité du scénario** (plausibilité physique, pertinence du domaine d'exploitation) — la même condition que ma réponse Q16, ce n'est pas un hasard. En santé, la FDA a publié des lignes directrices sur l'usage de preuves issues de simulation (modeling & simulation) dans les dossiers. Le principe transversal qui émerge partout : la simulation peut *contribuer* à la preuve, jamais la porter seule — accélérer n'est pas valider, version réglementaire.

**Piège.**
Ne pas improviser des numéros d'articles au-delà de ce qui est sûr (article 10 / annexe IV suffisent). Si un juriste pousse plus loin : « je vous mets en relation avec le détail du texte après la session — le principe, lui, est stable : la provenance des données synthétiques entre dans le dossier ».

---

## Partie 7 · Questions de synthèse

### Q19 — « Un LLM est-il un world model ? Il prédit bien le prochain état d'un texte conditionné sur une action. Si non, pourquoi ? Et pourquoi une keynote sans en parler ? »

**Réponse modèle.**
J'applique ma propre question-fil : que prédit-il, pour quoi faire ? Un LLM prédit **le prochain token de texte** — et à ce titre, oui, au sens faible, c'est un modèle du monde : le texte humain encode énormément de régularités du monde, et un bon prédicteur de texte en a forcément absorbé une part — c'est pour ça que les LLM raisonnent aussi bien qu'ils le font. Mais au sens fort de ma définition — représentation compressée, **orientée vers l'action**, permettant de **tester des futurs avant d'agir** — trois choses manquent. **Un**, la boucle d'action : le LLM a *lu* le monde, il n'y a jamais agi — c'est le cas extrême du modèle passif de Q10, avec toutes ses fragilités causales. **Deux**, l'ancrage : ses états sont des états de *texte*, pas des états du monde physique — il prédit ce qu'on *dirait* de la chute du verre, pas la chute du verre. **Trois**, le doute calibré : rien dans l'objectif de prédiction du prochain token ne distingue « le monde est incertain » de « je ne sais pas » (Q2). Pourquoi pas dans la keynote : parce que le sujet de la soirée est précisément ce qui manque aux LLM — et c'est ma lecture de la séquence 5 : si les pères de la vague actuelle investissent des milliards dans les world models, c'est qu'ils pensent que le prochain palier n'est pas dans le texte.

**Niveau 2.**
La convergence est déjà en cours et il faut la nommer pour ne pas paraître daté : les agents LLM qui utilisent des outils et reçoivent des retours d'environnement referment partiellement la boucle d'action ; les modèles vision-langage-action (VLA) en robotique branchent un backbone de type LLM sur de la commande motrice ; et l'hypothèse la plus discutée du moment est le mariage — un LLM pour la couche sémantique et le raisonnement abstrait, un world model pour la physique et la décision incarnée. Position à assumer : les deux sont des modèles prédictifs ; ils diffèrent par *ce qu'ils prédisent* — des tokens ou des conséquences.

**Piège.**
Question quasi certaine en 2026. Ne pas être dédaigneux (« les LLM ne comprennent rien ») : la salle les utilise tous les jours et les LLM marquent des points en raisonnement. La réponse forte est graduée : oui au sens faible, non au sens fort, et voici les trois manques précis.

---

### Q20 — « Votre verre collé prouve l'inverse : votre modèle s'est trompé et ce n'était pas grave, parce que vous n'aviez rien parié dessus. Le vrai sujet n'est-il pas la calibration de la confiance plutôt que la capacité ? Pourquoi la recherche y investit-elle si peu ? »

**Réponse modèle.**
Vous venez de donner la meilleure formulation de ma conclusion, et je vous la prends — vous avez raison sur toute la ligne. Tous les modèles sont faux, le mien comme ceux des machines ; l'erreur n'est un danger que multipliée par **l'enjeu de la décision qu'on pose dessus**. Mon modèle du verre était faux et ça ne coûtait rien, parce que je ne faisais que regarder ; le même écart de modèle, dans un système qui *agit*, devient un accident. Le sujet n'est donc pas d'avoir un modèle vrai — personne n'en aura jamais — mais d'accorder à chaque prédiction une confiance *proportionnée à sa fiabilité réelle* : c'est la **calibration**. Pourquoi la recherche y investit-elle moins qu'en capacité ? Trois raisons honnêtes. **L'économie de l'attention** : une capacité nouvelle fait une démo, un score de calibration ne fait pas de vidéo virale — même asymétrie qu'en Q14, et les incitations académiques comme commerciales suivent les démos. **La difficulté intrinsèque** : la calibration qui compte est la calibration *hors distribution* — être bien calibré là où on n'a pas de données — et c'est un problème plus dur que d'améliorer la moyenne, avec de vrais verrous théoriques (Q2). **Le décalage des coûts** : la capacité rapporte immédiatement, la calibration n'évite que des pertes futures — structure classique de sous-investissement, la sécurité paie en accidents évités, donc en silence. Ma conviction : ça s'inversera comme en aéronautique, où la fiabilité est *devenue* le produit — et le régulateur (Q18) accélérera cette inversion.

**Niveau 2.**
Si l'échange continue : la calibration se mesure (erreur de calibration attendue, scores propres type Brier, couverture des intervalles de prédiction — et la prédiction conforme fournit des garanties de couverture sans hypothèse sur le modèle, à condition que la distribution ne change pas… ce qui est précisément la limite en OOD). Le chaînon manquant côté world models : des benchmarks où le score récompense *savoir qu'on ne sait pas* — dire « plusieurs futurs possibles » sur l'inédit — plutôt que la seule précision moyenne du futur prédit.

**Piège.**
C'est une question cadeau déguisée : elle reformule le message du plan de métro et du verre collé. Le seul échec possible serait de la vivre comme une attaque et de défendre la fidélité des modèles — ce qui contredirait toute la keynote. Acquiescer, s'approprier, approfondir.

---

### Q21 — « Si LeCun a raison, quel est le verrou qui fait qu'on n'y est pas encore ? Données, architecture, objectif ? Donnez-moi votre pari, pas le sien. »

**Réponse modèle.**
Mon pari, en une phrase : **le verrou principal est l'objectif d'entraînement — et son révélateur est l'incapacité des machines à savoir ce qu'elles ignorent.** Je m'explique en écartant les deux autres. Les **données** ne sont pas le verrou : des millions d'heures de vidéo existent, les robots et véhicules en collectent en continu — le goulot n'est pas la matière première, même si les données *interventionnelles* restent rares (Q10) ; ce manque-là découle d'ailleurs du reste. L'**architecture** n'est pas le verrou principal : transformers, RSSM, JEPA — nous avons un zoo d'architectures capables, et l'histoire récente montre que l'architecture suit quand l'objectif est bon. Reste l'**objectif** : nous ne savons pas encore écrire la fonction de coût qui dit « retiens ce qui compte pour agir, jette le reste, et *sache où ton résumé est fiable* ». Les objectifs pixel retiennent trop (Q12) ; les objectifs valeur retiennent trop peu et ne transfèrent pas (Q5) ; les objectifs latents type JEPA sont la piste que je crois juste, mais tenus par des garde-fous encore mal compris (Q13), et aucun n'intègre nativement le doute calibré (Q2, Q20). Mon critère de bascule, pour être falsifiable jusqu'au bout : le jour où un world model, face à une situation construite pour être hors de ses données, répondra « plusieurs futurs possibles, je ne sais pas » *au bon moment* — mesurablement, pas anecdotiquement — le verrou aura sauté. Tant qu'il prédit l'inédit avec l'aplomb du connu, nous n'y sommes pas.

**Niveau 2.**
Assumer le caractère minoritaire du pari : beaucoup répondraient « l'échelle réglera tout » (camp scaling, Q12), d'autres « l'incarnation » — pas d'intelligence du monde physique sans corps qui agit dedans (et ce camp marque des points : DayDreamer, V-JEPA 2 en robotique). Ma réplique : l'incarnation fournit les bonnes *données*, l'échelle fournit la *capacité* — mais sans le bon objectif, l'une et l'autre apprennent plus vite la mauvaise chose. Et refuser de choisir (« un peu des trois ») serait la non-réponse que votre question interdit.

**Piège.**
La question teste la présence d'une pensée personnelle. Peu importe que le pari soit discutable — il doit être **net, argumenté, falsifiable**. « Les trois mon capitaine » est la seule mauvaise réponse.

---

## Annexe · La réponse de repli universelle

Pour toute question au-delà de la profondeur maîtrisée (variantes de Q4, détails d'implémentation, chiffres précis d'un papier) :

> « Le détail exact est dans [le papier / la masterclass], et je préfère vous envoyer la référence précise plutôt que de vous improviser une réponse approximative — mais l'intuition est celle-ci : … » *(puis remonter d'un niveau d'abstraction et raccrocher au fil rouge : que prédit-il, pour quoi faire ?)*

Trois règles en situation :

1. **Concéder vite ce qui est vrai** (Q5, Q7, Q20) : donner raison sur la nuance, puis la retourner en illustration de la thèse. On ne perd jamais un point en l'accordant ; on le perd en le défendant mal.
2. **Jamais d'improvisation technique fausse** : une seule justification mathématique inventée devant quelqu'un qui sait détruit la crédibilité des 45 minutes précédentes.
3. **Toujours raccrocher au fil rouge** : chaque réponse doit se terminer à moins d'une phrase de « que prédit-il, et pour quoi faire ? » — c'est ce qui donne l'impression d'une pensée unifiée plutôt que d'un empilement de fiches.

### Les deux points à blinder en priorité (fragilités internes du script)

| Fragilité | Où elle vit | Parade à intégrer dans le script |
|---|---|---|
| Horizon court (séq. 7) vs tâches longues (séq. 3.2) | Q8 | Une phrase en séquence 7 : « horizon de rêve court, mais relayé par une mémoire de la valeur qui, elle, voit loin » |
| Critique causale trop large (séq. 7) | Q10 | Une phrase en séquence 7 : « cette limite frappe surtout les modèles qui ont *regardé* le monde sans jamais y *agir* » |

Et le placeholder `[MOI : ici rajouter les coûts]` de la séquence 7 est couvert par la grille de coûts de la réponse **Q15, niveau 2** (réel / calcul / expertise).
