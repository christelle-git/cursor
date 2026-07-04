# World Models — la masterclass technique
## « Sous le capot » : l'anatomie complète d'un modèle du monde

> **Format : masterclass 2 h à 3 h, comité restreint (10-30 personnes)** · Public : DSI, CTO, directions R&D, équipes data/ML, architectes.
> **Positionnement produit :** ce document rassemble, sans aucune coupe, tout le contenu technique du brouillon d'origine (Actes II et II bis, et tous les encadrés « 🔧 Sous le capot » des autres actes). Il se vend comme un second produit, en complément de la keynote de 45 minutes — typiquement le même jour (keynote en plénière le matin, masterclass en comité l'après-midi).
> Prérequis : aucun formellement, mais le public tirera le maximum s'il connaît les bases des réseaux de neurones. Les passages « 💡 En clair » permettent de suivre sans les équations.

---

## MODULE 1 · Du classifieur à la décision séquentielle *(POMDP)*

Un classifieur apprend une fonction \(f : \text{observation} \rightarrow \text{étiquette}\). C'est une application figée, sans notion de temps ni d'action. Agir dans le monde, c'est tout autre chose : c'est un **processus de décision markovien partiellement observable** (POMDP).

**Qu'est-ce qu'un POMDP ?** *(placeholder du brouillon résolu)* Décomposons le sigle, de droite à gauche :

- **Processus de décision** : à chaque instant, un agent choisit une action, le monde évolue, et l'agent reçoit une récompense (ou une pénalité). Le jeu recommence à l'instant suivant. On modélise donc une **boucle** agent ↔ environnement, pas une question isolée.
- **Markovien** : on suppose que l'état présent du monde résume tout ce qu'il faut savoir pour prédire la suite — le passé n'apporte rien de plus *si l'on connaît vraiment l'état présent*. C'est l'hypothèse qui rend le problème traitable.
- **Partiellement observable** : et voilà la difficulté du monde réel — l'agent ne voit **jamais** cet état vrai. Une caméra ne voit pas ce qui est derrière elle, un capteur est bruité, un piéton masqué par un camion existe toujours. L'agent ne reçoit que des **observations partielles**, et doit reconstituer mentalement le reste.

L'agent ne voit donc jamais l'état vrai du monde \(s_t\) ; il reçoit des observations partielles \(o_t\) et doit maintenir une **croyance** \(b_t = p(s_t \mid o_{1:t}, a_{1:t-1})\) — sa carte interne. Trois objets le distinguent du classifieur :

- un **modèle de transition** \(p(s_{t+1}\mid s_t, a_t)\) : « si j'agis ainsi, comment le monde évolue-t-il ? » ;
- une **récompense** \(r(s_t, a_t)\) : « ce futur est-il souhaitable ? » ;
- une **politique** \(\pi(a_t \mid b_t)\) : « que faire, vu ce que je crois ? ».

Point crucial pour toute la suite : **l'agent n'agit jamais sur le monde, il agit sur sa croyance \(b_t\).** Il décide d'après sa carte, pas d'après le territoire. Un world model, c'est précisément la machinerie qui apprend ce modèle de transition — et donc qui fabrique cette carte.

Rappel du glissement mathématique posé en keynote : reconnaître, c'est apprendre \(y = f_\theta(x)\) : d'une image \(x\), sortir une étiquette \(y\). Anticiper, c'est apprendre \(\hat{s}_{t+1} = f_\theta(s_t, a_t)\) : de l'état courant \(s_t\) et d'une action \(a_t\), prédire l'état futur \(\hat{s}_{t+1}\) (le chapeau rappelle que c'est un futur *prédit*, pas le vrai). Cet ajout — une action, et du temps — change tout.

---

## MODULE 2 · Compresser : l'espace latent, le VAE et le RSSM

### 2.1 — L'espace latent et la carte du métro

Un modèle du monde commence toujours par **compresser**. Quand vous entrez dans une salle, vous ne mémorisez pas chaque pli de tissu, chaque reflet. Votre cerveau retient l'essentiel : la sortie est là, la scène est ici, quelqu'un bouge dans l'allée. Une compression fait pareil : elle transforme des images, des sons, en une représentation numérique compacte qu'on appelle un **espace latent**.

Idée centrale : **une carte n'a pas besoin de ressembler au territoire pour être utile.** Le plan du métro parisien ne respecte pas les distances, ignore les immeubles, déforme la géographie — mais il garde le nécessaire pour décider. Un bon espace latent, c'est exactement ça : pas une copie fidèle du monde, mais une carte qui conserve ce qui permet d'**anticiper et de décider**.

C'est la chaîne centrale de tout world model : \(\text{observer} \rightarrow \text{compresser} \rightarrow \text{prédire} \rightarrow \text{planifier} \rightarrow \text{agir}\).

Sous forme compacte :

\(o_t \rightarrow z_t\) (encoder),

puis \((z_t, a_t) \rightarrow \hat{z}_{t+1}\) (prédire),

puis \(\hat{z}_{t+1} \rightarrow\) valeur, risque, action suivante (décider).

### 2.2 — Qui décide de « ce qui compte » ? La fonction de coût

« Compresser sans perdre ce qui compte » — d'accord, mais **comment** l'algorithme détermine ce qui compte ? Réponse : c'est la **fonction de coût** qui tranche, par descente de gradient, via trois leviers :

- **Un goulot d'étranglement.** L'état latent a peu de dimensions, impossible de tout retenir : l'encodeur est *forcé* de choisir.
- Ce que l'encodeur conserve est dicté par ce que la perte réclame en aval. Si l'objectif est de *prédire le futur*, il garde ce qui est prédictif et jette l'imprévisible ; si l'objectif est de *décider* (récompense, valeur), il ne garde que le décisionnel ; s'il doit *reconstruire l'image*, il garde le visible (souvent trop).
- **« Ce qui compte » n'est donc pas compris, c'est *défini par l'objectif*.** Changez la perte, vous changez ce que la machine retient — et donc ce qu'elle « comprend ».

Formellement, on cherche un \(z\) qui garde le **maximum** d'information utile sur le futur et le **minimum** d'information sur le passé — un compromis *rate–distortion* (information bottleneck). Et l'intuition tient dans le grand maître d'échecs : il ne retient pas les forces en présence parce qu'il *comprend* l'élégance du jeu, mais parce que, partie après partie, c'est ce qui a réduit ses erreurs. La machine, pareil : « ce qui compte », c'est ce qui a fait baisser la perte.

### 2.3 — La métaphore du carnet *(placeholder du brouillon résolu)*

Le world model tient un **carnet**. À chaque instant, il n'y recopie pas le monde — il y consigne un résumé utile, et le RSSM (qu'on va voir tout de suite) tient en réalité **deux carnets** :

- un carnet **mémoire** (la part déterministe \(h\)) : tout ce que le passé permet d'affirmer — « le verre glissait vers le bord, la main s'approchait » ;
- un carnet **incertitude** (la part stochastique \(z\)) : ce que le passé ne suffit pas à trancher — « il peut tomber à gauche, à droite, ou être rattrapé ».

À chaque nouvelle observation, la machine compare ce qu'elle avait écrit *à l'aveugle* dans ses carnets avec ce qu'elle voit réellement, corrige sa façon d'écrire, et recommence. Rêver, c'est continuer à écrire dans les carnets **sans plus regarder le monde**. Toute la suite du module rend cette image rigoureuse.

### 2.4 — Le RSSM : l'architecture canonique

L'architecture canonique d'un world model moderne — le **RSSM** (Recurrent State-Space Model, Hafner et al., PlaNet 2019) — sépare l'état latent en deux : une part **déterministe** \(h_t\) (la mémoire, portée par un réseau récurrent) et une part **stochastique** \(z_t\) (ce qui reste incertain). Les équations tiennent en six modules :

\(h_t = f_\theta(h_{t-1}, z_{t-1}, a_{t-1})\)  (modèle de séquence)

\(z_t \sim q_\theta(z_t \mid h_t, o_t)\)  (encodeur — *posterior*)

\(\hat{z}_t \sim p_\theta(\hat{z}_t \mid h_t)\)  (prédicteur de dynamique — *prior*)

\(\hat{r}_t \sim p_\theta(\hat{r}_t \mid h_t, z_t)\)  (récompense)

\(\hat{c}_t \sim p_\theta(\hat{c}_t \mid h_t, z_t)\)  (signal de continuation. Est-ce fini ?)

\(\hat{o}_t \sim p_\theta(\hat{o}_t \mid h_t, z_t)\)  (décodeur : reconstruction de l'observation)

Les trois dernières sont les **têtes** : récompense, signal de continuation (l'épisode est-il fini ?), et décodeur (reconstruction de l'observation).

L'entraînement minimise une somme pondérée de quatre pertes : reconstruction \(-\log p_\theta(o_t\mid h_t,z_t)\), récompense, continuation, et un terme de **dynamique** \(\mathrm{KL}\big(q_\theta(z_t\mid h_t,o_t)\,\Vert\,p_\theta(\hat z_t\mid h_t)\big)\).

### 2.5 — La divergence KL, calculée à la main

Ce KL (Kullback-Leibler) est le cœur : il force le *prior* (« ce que je prédis sans regarder ») à coller au *posterior* (« ce que je vois vraiment »). C'est un nombre qui mesure l'écart entre deux distributions de probabilités — deux « paris » sur ce qui va arriver. Il vaut 0 si les deux paris sont identiques, et grandit à mesure qu'ils divergent.

L'intuition : \(\mathrm{KL}(q \Vert p)\) répond à la question « si la réalité suit \(q\), à quel point je suis surpris, en moyenne, d'avoir parié \(p\) ? ». C'est le coût de s'être trompé de croyance.

Le calcul, sur un exemple minuscule. Deux paris sur la météo (pluie / soleil) :

- ce que je constate vraiment : \(q = (0{,}8\ ;\ 0{,}2)\) — il pleut 8 fois sur 10 ;
- ce que j'avais prédit à l'aveugle : \(p = (0{,}5\ ;\ 0{,}5)\).

La formule fait la somme, sur chaque issue possible, de : *probabilité réelle × logarithme du rapport (réel / prédit)* :

\(\mathrm{KL}(q \Vert p) = 0{,}8 \times \ln\frac{0{,}8}{0{,}5} + 0{,}2 \times \ln\frac{0{,}2}{0{,}5} \approx 0{,}376 - 0{,}183 = 0{,}19\)

Lecture terme à terme : là où j'ai *sous-estimé* ce qui arrive souvent (pluie : prédit 0,5, réel 0,8), le logarithme est positif → pénalité. Là où j'ai *surestimé* (soleil), il est négatif → petit crédit. Le total est toujours ≥ 0, et nul seulement si \(p = q\) exactement. Détail qui va compter juste après : le KL est asymétrique — \(\mathrm{KL}(q\Vert p) \neq \mathrm{KL}(p\Vert q)\), l'ordre des arguments dit qui est la référence et qui est le pari.

En pratique dans Dreamer, les deux distributions ont une forme mathématique simple (gaussiennes ou catégorielles), et il existe une formule fermée : le KL se calcule d'un coup à partir de leurs paramètres, pas besoin de sommer sur des milliards de cas. Et comme cette formule est dérivable, la rétropropagation la traverse comme n'importe quelle couche.

Dans le RSSM : \(q\) = le posterior (« ce que je calcule en regardant l'image »), \(p\) = le prior (« ce que j'avais prédit les yeux fermés, depuis ma seule mémoire \(h_t\) »). Minimiser \(\mathrm{KL}(q\Vert p)\), c'est punir le modèle chaque fois que son imagination aveugle s'écarte de ce qu'il voit vraiment.

C'est exactement l'objectif d'un **auto-encodeur variationnel (VAE)** déroulé dans le temps : une borne sur la vraisemblance (ELBO) *(en clair : on ne sait pas calculer directement la « vraie » probabilité des données ; on optimise alors une quantité dont on est sûr qu'elle reste toujours **en dessous** d'elle — une **borne inférieure**. En poussant cette borne vers le haut, on pousse la vraie probabilité avec. L'ELBO est cette borne pour les VAE.)*.

Une fois entraîné, on peut **dérouler** \(h_t, \hat z_t\) tout seul, sans observation — c'est le rêve.

> 💡 **En clair (sans les équations).** Un modèle du monde « moderne » (RSSM) tient **deux carnets** sur l'état du monde : un carnet **mémoire** (noté \(h\)) qui résume tout le passé utile et se met à jour pas à pas, et un carnet **incertitude** (noté \(z\)) pour ce qui reste à deviner. À chaque instant il produit **deux versions** de ce qu'il croit : l'une **en regardant** la vraie image (le *posterior*), l'autre **sans regarder**, juste en imaginant (le *prior*). L'entraînement le **récompense quand ces deux versions coïncident** — c'est ce qui lui apprend à deviner juste sans avoir besoin de voir. Une fois entraîné, on le laisse imaginer seul, sans aucune image : c'est ça, **rêver**.

### 2.6 — D'où sort \(z\) ? L'encodeur, couche par couche

![Variational Autoencoder (VAE)](schema_vae_encodeur.png)

L'image entre à gauche, chaque couche convolutive la comprime un peu plus, jusqu'au goulot vert — c'est \(z\), on ne le trouve pas, on le fait émerger. Donc, \(z\) est le résultat d'un empilement de convolutions appliquées à l'image, avec :

**a) Les non-linéarités entre les couches.** Après chaque convolution, on applique une petite fonction de seuil à chaque nombre (par exemple ReLU : « si c'est négatif, mets zéro »). Ce détail a l'air anodin, mais il est vital : composer des convolutions *sans* seuils, c'est comme composer des fonctions affines — mathématiquement, ça s'écrase en une seule opération affine, aussi peu expressive qu'une couche unique. Ce sont les seuils qui permettent au réseau de découper l'espace en régions et de représenter des choses compliquées. Donc la formule exacte est plutôt : convolution → seuil → convolution → seuil → … → petite couche finale qui sort les 32 nombres (celle-là est généralement une couche « dense », pas une convolution, précédée d'une mise à plat).

**b) Les poids entraînés.** L'architecture (l'empilement) ne fait que définir le *type* de calcul possible. Le même empilement avec des poids aléatoires sort un \(z\) inutilisable. Ce qui rend \(z\) significatif, ce n'est pas la composition de convolutions en soi, ce sont les millions de valeurs de poids sculptées par la descente de gradient.

\(\Rightarrow\) Bonne phrase complète : *\(z\) est la sortie d'une composition de convolutions et de non-linéarités, dont les poids ont été optimisés pour que ces 32 nombres suffisent à la tâche en aval (reconstruire ou prédire).*

On construit un encodeur avec une sortie volontairement trop petite (le goulot), on branche une fonction de coût derrière, et la descente de gradient ajuste des millions de poids jusqu'à ce que \(z\) contienne exactement ce qu'il faut pour faire baisser la perte.

Le contenu de \(z\) dépend de la punition choisie :

- Perte de reconstruction → \(z\) garde le visible.
- Perte de prédiction → \(z\) garde le prédictif (positions, vitesses).
- Perte de récompense → \(z\) garde le décisionnel.

Le décodeur tente ensuite de reconstruire l'image, et l'écart entre l'originale et la reconstruction sert de punition pour régler les poids par descente de gradient.

### 2.7 — Le chemin du blâme : la rétropropagation, concrètement

Prenons la perte de reconstruction. Elle est mesurée tout au bout de la chaîne, en comparant l'image reconstruite à l'originale. Puis la règle de dérivation en chaîne (la fameuse *chain rule* de terminale, appliquée en série) remonte le courant :

1. « L'erreur sur ce pixel vient à tant de % de tel neurone du décodeur » → on corrige les poids du décodeur ;
2. « … qui lui-même a mal réagi parce que la case n°17 de \(z\) avait une mauvaise valeur » → le blâme atteint \(z\) ;
3. « … et cette case de \(z\) vaut ce qu'elle vaut à cause de tels poids de la dernière couche de l'encodeur, eux-mêmes nourris par la couche d'avant… » → le blâme redescend convolution par convolution, jusqu'aux poids qui touchent les pixels bruts.

Chaque poids de l'encodeur reçoit ainsi son gradient — « augmente-toi un peu » ou « baisse-toi un peu » — calculé depuis une erreur mesurée à l'autre bout du réseau. Encodeur et décodeur sont entraînés d'un seul tenant, par la même perte : c'est précisément pour ça que l'encodeur apprend à mettre dans \(z\) ce dont le décodeur (ou le prédicteur) a besoin, et rien d'autre. Si on coupait la rétropropagation à la frontière de \(z\), l'encodeur resterait aléatoire pour toujours.

Un obstacle technique élégant au passage. Dans un VAE, \(z\) est *tiré au hasard* autour de \(\mu\) avec un écart \(\sigma\). Or on ne peut pas dériver « à travers » un tirage aléatoire — le hasard n'a pas de pente. L'astuce (dite *de reparamétrisation*) : on écrit le tirage sous la forme

\(z = \mu + \sigma \cdot \varepsilon\)

où \(\varepsilon\) est un bruit tiré *à part*, indépendant du réseau. Sous cette forme, \(z\) redevient une formule ordinaire en \(\mu\) et \(\sigma\), donc dérivable : le gradient traverse le goulot sans encombre et atteint l'encodeur, le bruit étant traité comme une constante extérieure.

Et dans un world model complet, l'encodeur reçoit des leçons de *plusieurs* pertes à la fois par ce même mécanisme : l'erreur de reconstruction, l'erreur de prédiction du futur de la mémoire M, l'erreur de prédiction de la récompense… Tous ces gradients remontent jusqu'aux convolutions et s'additionnent. C'est le sens profond de la phrase : « ce qui compte est défini par l'objectif » — chaque terme de perte branché en aval envoie, via la rétropropagation, sa propre exigence sur ce que \(z\) doit contenir.

![Architecture complète](schema_world_model_boucle.png)

World Model complet : observer → compresser → prédire → agir. On voit les trois réseaux collaborer : V fabrique \(z_t\), M (le RNN, avec sa boucle sur lui-même qui lui sert de mémoire) prédit \(\hat{z}_{t+1}\) à partir de \(z_t\) et de l'action \(a_t\), et C choisit l'action suivante. L'environnement répond, et on recommence.

---

## MODULE 3 · Rêver : Ha & Schmidhuber (2018) et la lignée Dreamer

### 3.1 — La machine qui rêve : Ha & Schmidhuber, 2018

L'histoire moderne commence en 2018. David Ha et Jürgen Schmidhuber posent une question un peu folle : et si on entraînait une IA non pas dans le monde réel, mais **dans son propre rêve** ? Leur recette, en trois briques :

**1) Une brique vision.** Un VAE qui regarde un petit jeu de course et résume chaque image en quelques chiffres. *(en clair : un **VAE**, ou auto-encodeur variationnel, est un réseau qui apprend à résumer une image en quelques chiffres, puis à la reconstruire à partir de ces chiffres. Le « variationnel » signifie qu'il range ces résumés proprement, sans trous, ce qui lui permet d'en inventer de nouveaux.)*

**2) Une brique mémoire.** Un réseau récurrent qui apprend la suite — « si la voiture est là et que je tourne, où sera-t-elle après ? ». *(en clair : un réseau qui traite une séquence **pas à pas en gardant une mémoire** de ce qu'il a déjà vu — comme on lit une phrase mot après mot en se souvenant du début.)*

**3) Une toute petite brique décision.** Un contrôleur minuscule. *(en clair : la partie qui **décide de l'action** — tourner, accélérer — à partir du résumé fourni par la vision et la mémoire. Ici elle est minuscule : quelques centaines de réglages seulement.)*

Puis le tour de magie : on **gèle** la vision et la mémoire, et on entraîne le contrôleur **à l'intérieur** des images générées par la mémoire. Dans le rêve. Des milliers de tours, sans jamais toucher au vrai jeu. À chaque étape, le contrôleur C choisit une action, et c'est M elle-même qui joue le rôle de l'environnement en répondant « voilà la situation suivante, voilà ta récompense ». Aucune vraie partie n'est jouée : toute la trajectoire est hallucinée, un rêve. Et le contrôleur est entraîné dans ce rêve : on regarde combien de récompense imaginaire il a récoltée, et on ajuste ses poids pour qu'il en récolte plus.

C'est exactement un simulateur de vol dans la tête du pilote : plutôt que de crasher de vrais avions pour apprendre, on s'entraîne dans le simulateur — et ici, le simulateur a été appris automatiquement à partir des vraies parties observées.

Le piège à connaître : si le rêve est faux quelque part, le contrôleur apprend à exploiter les bugs du rêve (comme un pilote qui découvre que le simulateur autorise de voler à travers les montagnes). D'où l'alternance : on rêve, on retourne un peu dans le vrai monde collecter des données, on corrige le modèle du monde, on re-rêve.

**🔧 SOUS LE CAPOT** · *V — M — C, et la température du rêve*

L'agent de 2018 a trois composants : **V** (un VAE qui encode l'image en un vecteur latent \(z\)), **M** (un *MDN-RNN* : un réseau récurrent dont la sortie est un **mélange de gaussiennes** prédisant \(p(z_{t+1}\mid z_t, a_t, h_t)\)), et **C** (un contrôleur linéaire si petit — quelques centaines de paramètres — qu'on l'optimise par évolution, CMA-ES, sans rétropropagation).

Détail élégant et lourd de conséquences : un paramètre de **température** \(\tau\) règle l'incertitude des rêves de M. Augmenter \(\tau\) rend le rêve plus bruité, plus difficile — et **empêche le contrôleur de tricher** en exploitant les imperfections du modèle. On retrouvera ce démon (l'agent qui exploite les failles de son propre rêve) au module 6. Filiation à citer : l'idée d'apprendre des comportements dans un modèle remonte à **Dyna** (Sutton, 1991).

Apprendre dans son imagination avant d'agir dans le réel : c'est ce que fait le sportif qui rejoue mentalement son geste, le musicien qui entend les notes avant de les jouer. Pour une machine, ça change l'échelle : **une seconde d'expérience réelle peut engendrer des centaines de scénarios imaginés.**

### 3.2 — Apprendre dans l'imagination : la lignée Dreamer

L'idée de 2018 a été industrialisée par une famille de systèmes appelés **Dreamer**. Le principe : on apprend un world model en latent (le RSSM), puis on entraîne un **acteur-critique entièrement dans des trajectoires imaginées** — la machine ne touche presque plus au monde réel, elle répète l'avenir dans sa tête.

Le résultat le plus parlant : on lâche **DreamerV3** dans Minecraft, ce monde de cubes, avec un défi qui résistait depuis des années — **trouver un diamant**. Pour ça il faut creuser, fabriquer des outils, descendre dans des grottes, survivre : des centaines d'actions, et une récompense qui n'arrive qu'à la toute fin. Une aiguille au fond d'une mine. DreamerV3 y arrive **à partir de zéro, sans aucune démonstration humaine**, en s'entraînant dans son imagination. Publié dans *Nature*, en 2025.

Cette même idée, posée sur un **vrai robot quadrupède** qui ne sait pas marcher : d'habitude, des jours d'essais et de la casse. Là, il agit un peu, il **rêve** beaucoup, il recommence — et il apprend à marcher en **une heure**, dans le monde réel, sans simulateur (les travaux *DayDreamer*, 2022).

**🔧 SOUS LE CAPOT** · *Imaginer, et le gradient analytique*

Une fois le world model appris, Dreamer génère des **rollouts purement latents** *(en clair : un **rollout**, c'est dérouler un scénario imaginé sur plusieurs pas de temps. « Latent » veut dire que ce déroulé se fait dans l'espace compressé — les quelques chiffres — **sans jamais redessiner d'images**.)* : à partir d'un état \((h_t, z_t)\), l'acteur propose \(a_t = \pi_\phi(\cdot\mid h_t, z_t)\) *(c'est la **politique** \(\pi_\phi\) : la règle qui, vu l'état \((h_t,z_t)\), propose l'action \(a_t\) à tenter.)*, la dynamique prédit \((h_{t+1}, \hat z_{t+1})\) *(\(h\) est la **mémoire** du modèle — la part déterministe de l'état latent, portée par le réseau récurrent ; elle résume tout le passé utile.)*, la tête récompense donne \(\hat r\), et on recommence sur un horizon \(H\) (typiquement 15–16 pas) — **sans jamais décoder de pixels**. Tout le rêve se passe dans l'espace des \(z\) — les résumés à 32 nombres. À aucun moment on ne reconstruit d'images. Le décodeur ne sert qu'aux humains, pour visualiser ce que la machine imagine. C'est pour ça que rêver est si bon marché : on manipule des résumés, jamais les 12 000 pixels.

L'acteur est optimisé sur des **\(\lambda\)-returns** *(en clair : une façon de **mélanger** des estimations de gain à court et à long terme pour juger un futur imaginé, en équilibrant précision et stabilité.)*. Pourquoi mélanger ? L'acteur (le contrôleur) a besoin d'une note pour chaque trajectoire rêvée. Deux façons extrêmes de la calculer :

- Tout dérouler soi-même : additionner les récompenses imaginées sur les 15 pas du rêve. Précis sur le court terme… mais le rêve dérive : plus on prédit loin, plus M se trompe, et 15 pas ne disent rien du futur au-delà.
- Demander tout de suite au critique : faire 1 pas, puis prendre son estimation « ça vaut +47 ». Stable, voit loin… mais si le critique se trompe, tout repose sur son erreur.

Le λ-return, c'est le mélange dosé des deux : on calcule la note « après 1 pas + avis du critique », « après 2 pas + avis du critique », « après 3 pas… », etc., et on en fait une moyenne pondérée où chaque horizon plus lointain compte un peu moins (facteur \(\lambda\), typiquement 0,95). Deux cas limites pour ancrer l'intuition :

- \(\lambda = 0\) : on ne fait confiance qu'au critique après un seul pas (stable, mais biaisé par ses erreurs) ;
- \(\lambda = 1\) : on ne fait confiance qu'aux récompenses déroulées soi-même (fidèle, mais bruité et myope au-delà du rêve).

Entre les deux, on gagne le meilleur des deux mondes — c'est le sens de « en équilibrant précision et stabilité ».

Les **\(\lambda\)-returns** sont estimés par le critique *(en clair : le **critique** est un second réseau qui note « combien vaut » une situation. Il fournit les gains attendus le long du futur imaginé, que l'acteur cherche ensuite à maximiser.)*. Le critique est :

- architecturalement banal : un tout petit réseau dense (quelques couches de neurones classiques, pas de convolutions — il ne voit jamais d'images), qui prend en entrée l'état compressé (\(z_t\) plus la mémoire \(h_t\) du RNN) et sort un seul nombre : la valeur estimée de la situation ;
- initialisé au hasard, comme les autres : au début, ses estimations sont n'importe quoi ;
- entraîné en même temps que l'encodeur, la mémoire et l'acteur, sur les propres trajectoires (rêvées) de l'agent.

Mais alors, qui lui apprend les bonnes valeurs, s'il n'y a pas de prof ? C'est l'astuce du *bootstrap* (l'apprentissage par différence temporelle). Le critique est entraîné par régression : sa cible, c'est précisément le λ-return calculé sur les trajectoires rêvées — c'est-à-dire un mélange de récompenses réellement prédites par la mémoire et de ses *propres* estimations futures. Concrètement, la boucle dit en permanence :

> « Tu avais estimé que la situation \(z_t\) valait 30. Or on a déroulé le rêve : on a récolté +5 tout de suite, et la situation d'arrivée, tu l'estimes toi-même à 32. Donc \(z_t\) valait plutôt \(5 + 32 = 37\). Corrige-toi vers 37. »

Ça ressemble à un serpent qui se mord la queue — le critique apprend à partir de lui-même ! — mais ça converge, parce qu'à chaque correction entre un morceau de vérité fraîche (la récompense du pas franchi), qui ancre progressivement toutes les estimations sur la réalité. Analogie : tu estimes un trajet à 2 h. Après 20 min tu es au quart du chemin ; tu révises : « plutôt 1 h 20 ». Personne ne t'a donné la bonne réponse — tu as combiné un fait observé (20 min pour un quart) avec ta propre estimation du reste. En répétant ça sur des millions de trajets, tes estimations initiales deviennent excellentes.

**Astuce de stabilité** : comme apprendre à partir de ses propres estimations peut s'emballer, on utilise souvent une copie figée du critique (mise à jour lentement) pour calculer les cibles — se corriger par rapport à une version calme de soi-même, plutôt que courir après un soi qui bouge sans cesse. Dans DreamerV3 par exemple, ce critique fait quelques centaines de milliers de paramètres — minuscule à côté du modèle du monde. C'est un organe de l'agent, entraîné sur mesure pour *cet* environnement, pas un modèle générique réutilisable : les valeurs qu'il estime n'ont de sens que pour le jeu (et la fonction de récompense) sur lesquels il a grandi.

\(\Rightarrow\) L'acteur choisit des actions dans le rêve ; chaque trajectoire rêvée reçoit une note (le λ-return), fabriquée en mélangeant les récompenses imaginées et les estimations du critique ; l'acteur est ajusté par descente de gradient pour maximiser cette note ; et tout ça sans jamais repasser par des images. Pendant ce temps, le critique lui-même est entraîné à rendre ses estimations cohérentes avec ces mêmes λ-returns — les deux réseaux se raffinent mutuellement.

Avantage décisif sur le RL classique : comme tout le modèle est **différentiable**, on peut propager le gradient de la récompense imaginée *à travers la dynamique* jusqu'à la politique (gradient analytique), au lieu d'estimer bruitamment par échantillonnage. (Développé en Révélation 6, module 5.)

Ce qui a rendu **DreamerV3** universel — un seul jeu d'hyperparamètres pour 150+ tâches, du contrôle continu aux jeux discrets — n'est pas une nouvelle idée mais une collection d'astuces de **robustesse d'échelle** : transformation **symlog** des entrées, perte **two-hot / symexp** pour la récompense et le critique (qui gère des ordres de grandeur très différents), **KL balancing + free bits**, **normalisation des retours par percentiles**, mélange uniforme à 1 % sur les latents catégoriels, et côté archi block-GRU, RMSNorm, SiLU.

> 💡 **En clair.** Tout ce vocabulaire (symlog, two-hot, KL balancing, free bits…) n'est pas une nouvelle idée : ce sont des **astuces de stabilité**. Le défi : faire marcher **un seul réglage** sur 150 tâches très différentes — un jeu vidéo et un bras robotisé n'ont ni les mêmes échelles de récompense, ni les mêmes signaux. Ces astuces servent à **mettre tout le monde à la même échelle** et à **empêcher l'entraînement de s'emballer ou de s'effondrer**, un peu comme régler la suspension d'une voiture pour qu'elle roule aussi bien sur autoroute que sur chemin de terre. L'exploit de DreamerV3, c'est cette **robustesse universelle**, pas une formule magique.

En une phrase : \(z\) n'est pas choisi, c'est la sortie brute de l'encodeur, et c'est l'entraînement des poids qui lui donne peu à peu du sens ; « entraîner dans le rêve » = utiliser M comme simulateur appris pour faire jouer C des millions de parties imaginaires gratuites ; le λ-return = la note d'une trajectoire rêvée, mélange dosé entre « je déroule les récompenses moi-même » (précis, court terme) et « je demande au critique » (stable, long terme).

À noter, tout récemment : **DreamerV4**, 2025, qui pousse le paradigme vers l'apprentissage *hors-ligne*, à partir de données enregistrées.

---

## MODULE 4 · MuZero et la planification

### 4.1 — Modéliser ce qui compte : MuZero

Pensez à un grand maître d'échecs : il ne retient ni la couleur du bois, ni les rayures de la table. Il ne voit que les **forces en présence** — qui menace qui, où est le danger, quel coup change la partie. Il ne garde que ce qui compte **pour décider**.

En 2020, un système fait exactement ça : **MuZero**. On le lâche sur le Go, les échecs, le shogi, des dizaines de jeux Atari. Et le détail vertigineux : **on ne lui donne jamais les règles.** Il les devine en jouant, se construit son propre modèle de « ce qui fait gagner », et atteint un niveau **surhumain**. Publié dans *Nature*.

**🔧 SOUS LE CAPOT** · *h, g, f — et le principe de la « value-equivalence »*

MuZero (Schrittwieser et al., 2020) n'a, comme Dreamer, pas de décodeur d'images. Trois fonctions (réseaux à entraîner) seulement :

\(\text{Représentation : } s^0_t = h_\theta(o_{1:t})\)

\(\text{Dynamique : } s^{k+1}, \hat r^{k+1} = g_\theta(s^{k}, a^{k})\)

\(\text{Prédiction : } \hat p^{k}, \hat v^{k} = f_\theta(s^{k})\)

L'encodeur \(h\) comprime l'historique en un état latent ; la dynamique \(g\) déroule cet état *(« dérouler » = partir d'un état latent, lui **appliquer une action** et calculer l'état latent suivant — un pas d'imagination de plus.)* sous une action (et prédit la récompense) ; la prédiction \(f\) sort une **politique** et une **valeur** *(« sortir une politique » = produire, pour la situation, une **distribution de probabilités sur les coups possibles** : « 60 % jouer ici, 30 % là… ».)*.

On planifie par **MCTS** (recherche arborescente Monte-Carlo) directement dans cet espace latent, et — point essentiel — **rien n'oblige \(s^k\) à correspondre à un vrai état du monde.** *(en clair : l'état imaginé par MuZero n'a **pas besoin de ressembler à la vraie position** sur l'échiquier ; il lui suffit de prédire les bonnes valeurs et les bons coups. Ce point est développé à la **Révélation 4**, module 5.)*

Ces trois réseaux — \(h\), \(g\) et \(f\) (représentation, dynamique, prédiction) — sont entraînés *uniquement* pour que la politique, la valeur et la récompense prédites collent à la réalité. C'est le **principe de value-equivalence** (Grimm et al., 2020 ; lignée Predictron de Silver 2017, Value Prediction Networks de Oh 2017) : *un modèle n'a pas à reconstruire l'observation, seulement à prédire les conséquences qui comptent pour la décision.*

Ce que MuZero nous enseigne tient en une phrase : un bon modèle du monde n'est pas un modèle **complet**, c'est un modèle de **ce qui compte**. Comprendre, c'est savoir **quoi ignorer**, ou savoir sur quoi se focaliser.

Et au passage, gardez en tête ce que MuZero a choisi de prédire : ni les pixels, ni une jolie image — juste **la valeur** des situations. Retenez ce choix. Car d'autres ont fait l'inverse.

### 4.2 — Planifier, c'est comparer des futurs

Supposons qu'un robot doive saisir un verre. Avant de bouger, il peut **simuler dans sa tête** plusieurs trajectoires de son bras. Dans la première, sa main passe trop haut. Dans la deuxième, elle percute le verre. Dans la troisième, elle le saisit proprement. Le robot compare ces futurs imaginés, retient le meilleur, et **seulement alors** il agit.

C'est ça, planifier dans un modèle du monde : imaginer plusieurs futurs, les comparer, puis choisir. Et notez la différence avec Dreamer : Dreamer **apprend** une politique réflexe *(en clair : une politique **« réflexe »** réagit instantanément, sans réfléchir au moment d'agir — comme un geste automatique appris à l'entraînement.)* en s'entraînant dans l'imagination, puis agit vite ; ici, le modèle est utilisé **au moment de décider**, pour chercher activement le bon coup. Deux philosophies — réagir vite, ou réfléchir lentement — que les systèmes modernes combinent.

**🔧 SOUS LE CAPOT** · *Deux grandes façons de planifier dans un modèle appris*

- **Recherche arborescente (MCTS)** — MuZero *(en clair : **MCTS**, recherche arborescente de Monte-Carlo — on construit un arbre des coups possibles, on explore surtout les branches prometteuses, et on remonte les résultats pour choisir le meilleur premier coup. Voir le **schéma plus bas**.)*. On construit un arbre de futurs : chaque nœud est un état latent, qu'on étend avec la dynamique \(g_\theta\), qu'on évalue avec la prédiction \(f_\theta\) (valeur + politique a priori), et dont on **remonte** les valeurs pour concentrer la recherche sur les branches prometteuses. La politique a priori limite la **largeur**, la valeur limite la **profondeur**. C'est adapté aux actions discrètes (jeux). *(voir le schéma de l'arbre MCTS ci-dessous ; exemple en ligne : la figure des 4 étapes sur l'article Wikipédia « Monte Carlo tree search » ou sur GeeksforGeeks.)*
- **Optimisation de trajectoires / MPC** — PlaNet *(en clair : **MPC**, commande prédictive — à chaque instant on simule plusieurs suites d'actions sur un court horizon, on garde la meilleure, on exécute seulement le **premier pas**, puis on recommence.)*. Pour les actions continues (robotique), on échantillonne des centaines de **séquences d'actions**, on les déroule dans le modèle *(en clair : on fait **jouer** chaque suite d'actions dans le modèle appris pour voir le futur qu'elle produirait, sans toucher au monde réel.)*, on garde les meilleures et on resserre la distribution autour d'elles *(en clair : on garde les meilleures suites d'actions, puis on **tire au sort de nouvelles suites autour d'elles** — on rétrécit petit à petit la zone de recherche vers ce qui marche le mieux.)* (méthode de l'**entropie croisée**, CEM). On exécute le premier pas, puis on **replanifie** à chaque instant (horizon glissant, *receding horizon*).

Le compromis fondamental : une **politique amortie** (Dreamer) est rapide à l'exécution mais figée *(« amortie » = on a **payé le coût de réflexion une fois pour toutes** à l'entraînement ; à l'exécution la réponse est immédiate, mais figée.)* ; la **planification à l'inférence** *(« à l'inférence » = **au moment de décider**, en temps réel : la machine prend le temps de simuler plusieurs futurs avant chaque action, au lieu de réagir d'un réflexe appris.)* (MuZero, MPC) est lente mais s'adapte coup par coup et peut corriger une partie des erreurs du modèle en raccourcissant l'horizon. Le choix dépend du budget de calcul et du coût d'une erreur.

![Schéma — arbre de recherche MCTS (à la MuZero)](assets/schema_mcts_muzero.png)

*Figure — L'arbre de recherche de MCTS. On descend vers la branche la plus prometteuse (sélection), on ajoute un nœud (expansion), on note sa valeur avec le réseau \(f_\theta\) (évaluation), puis on remonte cette valeur le long du chemin (remontée). Chez MuZero, l'« évaluation » remplace la simulation au hasard par un réseau de valeur. — Exemple en ligne : figure des 4 étapes sur l'article Wikipédia « Monte Carlo tree search », ou sur GeeksforGeeks (« ML | Monte Carlo Tree Search »).*

Planifier, c'est donc rendre le choix **explicite** : dérouler plusieurs avenirs, et décider lequel on va tenter de faire advenir. Gardez cette image — un agent qui compare des futurs imaginés — parce qu'elle pose, en creux, toute la question de la confiance : *et si le futur qu'il préfère était celui où son modèle se trompe le plus ?*

---

## MODULE 5 · Niveau réseaux — les six révélations

On a posé les briques : l'anatomie, le rêve, MuZero, la planification. Ce module **retourne six intuitions** — y compris pour ceux qui connaissent déjà CNN, Transformers et diffusion. Une seule idée les relie, et c'est le fil de tout ce qui précède : *l'architecture d'un world model est presque entièrement dictée par une question — où place-t-on la perte ?*

### Le squelette commun (rappel express)

Posons la charpente une fois, pour pouvoir la trahir ensuite. Tout world model, de 2018 à 2026, est le **même squelette** :

\(\underbrace{o_t \xrightarrow{\;e_\theta\;} z_t}_{\text{encoder}} \quad\;\; \underbrace{(z_t,a_t) \xrightarrow{\;f_\theta\;} \hat z_{t+1}}_{\text{dynamique}} \quad\;\; \underbrace{z_t \xrightarrow{\;\text{têtes}\;} (\hat r,\hat v,\pi,\hat o\,)}_{\text{sorties}}\)

Les différences entre MuZero, Dreamer, Sora, JEPA **ne sont pas dans le squelette** — elles sont dans *quelles têtes on branche* et *sur quoi on calcule la perte*. Gardez cette idée : **l'architecture est en aval de la fonction de coût.** On va le voir six fois.

### Révélation 1 — Il n'existe pas « un » réseau world model. Il existe un squelette, et trois endroits où couper.

Les world models ne diffèrent pas par leurs réseaux. Ils diffèrent par **l'endroit où vit l'information**. Un encodeur est un **goulot d'étranglement** *(en clair : un passage **étroit** par lequel l'information doit tenir — l'état latent a peu de place, donc l'encodeur est forcé de ne garder que l'essentiel et de jeter le reste.)* : \(z_t = e_\theta(o_t)\) jette de l'information. Ce qu'il garde n'est pas décidé par l'architecture, mais par ce que la perte, en aval, **réclame**.

- Si la perte est une **reconstruction de pixels**, le goulot doit tout garder (même l'inutile). → coûteux, et l'« understanding » est noyé dans la texture.
- Si la perte est une **valeur** (récompense/retour), le goulot ne garde que le décisionnel. → MuZero.
- Si la perte est une **prédiction de représentation**, le goulot ne garde que le *prévisible*. → JEPA.

*(en clair : la **perte** — ou « fonction de coût » — est le score d'erreur que l'entraînement cherche à faire baisser. C'est l'ingénieur qui la choisit, et ce choix décide de ce que la machine apprend à garder.)*

**🔧 SOUS LE CAPOT** · *Le world model comme goulot d'information contrôlé*

Formellement, \(z_t\) doit être une **statistique suffisante minimale** du passé pour prédire le futur utile : maximiser \(I(z_t;\,\text{futur})\) tout en minimisant \(I(z_t;\,\text{passé})\).

C'est un objectif **rate–distortion** (information bottleneck, Tishby) : la « distorsion » qu'on tolère définit ce que la machine ignore. « Comprendre, c'est savoir quoi ignorer » n'est donc pas une métaphore — c'est le terme \(-\beta\, I(z;\,o)\) dans la perte. **Choisissez où vous mettez la perte, et vous avez déjà choisi ce que la machine comprendra.** Le réseau (CNN, ViT…) ne fait qu'implémenter ce choix. *(concrètement : on ajoute au score d'erreur un terme qui **pénalise l'information retenue**, \(-\beta\, I(z;o)\). Plus \(\beta\) est grand, plus on force la machine à oublier les détails inutiles. C'est ce terme — pas l'architecture — qui décide de ce qui est « important ».)*

### Révélation 2 — Le problème central n'est pas de prédire. C'est de prédire sa propre représentation **sans tricher.**

Voici le secret le moins raconté du domaine. Dès qu'un modèle prédit **sa propre** représentation future, il existe une solution parfaite et catastrophique : tout encoder vers une **constante** *(en clair : le réseau pourrait tricher en répondant **toujours le même chiffre**, quoi qu'il voie. Erreur de prédiction nulle… mais il n'a rien appris.)*. Erreur de prédiction : zéro. Compréhension : zéro. C'est l'**effondrement** (collapse). Et alors — révélation — une immense partie de la machinerie « moderne » n'existe que pour **empêcher cette triche**.

> 💡 **En clair.** Quand un modèle doit prédire **sa propre** façon de voir le futur, il existe une triche imparable : **tout résumer par le même chiffre, toujours**. Sa prédiction tombe alors juste à 100 %… parce qu'il n'y a plus rien à prédire. Erreur nulle, compréhension nulle : c'est l'**effondrement** (*collapse*). Une grande partie des techniques « modernes » ne sert qu'à **interdire cette triche** et à forcer le modèle à garder de l'information utile.

Regardez le RSSM de Dreamer. Il maintient deux versions du même état latent :

- un **prior** \(p(\hat z_t \mid h_t)\) — « ce que je prédis sans regarder » —
- et un **posterior** \(q(z_t \mid h_t, o_t)\) — « ce que je calcule en regardant ».

La perte de dynamique est le **KL entre les deux** *(en clair : le **KL** mesure l'écart entre deux distributions de probabilités — « à quel point ma prédiction sans regarder diffère de ce que je vois vraiment ». On entraîne le modèle à réduire cet écart.)*. Autrement dit : *le modèle apprend à prévoir le futur en se faisant punir quand son imagination aveugle s'écarte de ce qu'il voit vraiment.* C'est déjà du « prédire sa propre représentation ».

Et le détail qui tue : il faut que le **prédicteur coure après la cible** *(en clair : deux versions du même état coexistent — une **cible** (calculée en regardant) et une **prédiction** (faite sans regarder). On veut que la prédiction **rattrape** la cible, et non que la cible s'abaisse au niveau de la prédiction ; sinon la cible devient trop facile et tout s'effondre. D'où des astuces qui « gèlent » la cible le temps que la prédiction la rejoigne.)*, jamais l'inverse. Sinon la cible s'aplatit pour devenir facile à prédire → collapse. D'où le **KL balancing** (gradients asymétriques) chez Dreamer, le **stop-gradient + encodeur-cible en moyenne mobile (EMA)** chez JEPA, exactement comme dans BYOL.

**🔧 SOUS LE CAPOT** · *Prior/posterior, KL balancing, et l'anti-collapse universel*

Dynamique RSSM :

- \(h_t = \mathrm{GRU}(h_{t-1}, z_{t-1}, a_{t-1})\),
- prior \(p(\hat z_t\mid h_t)\),
- posterior \(q(z_t\mid h_t,o_t)\).
- Perte de représentation = \(\mathrm{KL}\!\big(q \,\Vert\, p\big)\).

Le RSSM garde deux fils d'état : \(h_t\), la mémoire déterministe, mise à jour par un GRU (un cousin du LSTM : une cellule récurrente qui digère « mémoire précédente + état précédent + action ») ; et \(z_t\), la partie aléatoire qui capture ce que la mémoire ne pouvait pas deviner. À chaque pas, le modèle produit deux versions de \(z_t\) : le prior (deviné depuis \(h_t\) seul, à l'aveugle) et le posterior (calculé en regardant l'image \(o_t\)). La perte KL entre les deux entraîne le devin à rejoindre l'observateur.

Le **KL balancing** la scinde avec stop-gradient :

\(\mathcal{L}_{\text{dyn}} = \alpha\,\mathrm{KL}\big(\mathrm{sg}[q]\,\Vert\,p\big) \;+\; (1-\alpha)\,\mathrm{KL}\big(q\,\Vert\,\mathrm{sg}[p]\big),\quad \alpha\approx 0.8\)

Le problème que résout le KL balancing. Le KL dépend de *deux* choses : la prédiction \(p\) et la cible \(q\). Or la descente de gradient est paresseuse : pour réduire l'écart, elle a deux options :

- l'option honnête : améliorer la prédiction \(p\) pour qu'elle rejoigne ce qui est observé ;
- l'option tricheuse : appauvrir la cible \(q\) — si l'encodeur apprend à sortir toujours à peu près le même \(z\) quelle que soit l'image, alors prédire devient trivial et le KL s'effondre… mais \(z\) ne contient plus rien. Le modèle a « réussi » en rendant l'examen facile au lieu de devenir bon. C'est le fameux effondrement (collapse).

La solution : le stop-gradient, noté sg[·]. C'est une opération toute bête : « utilise cette valeur dans le calcul, mais ne fais passer aucun gradient dedans » — on la traite comme une constante gelée. La perte est alors scindée en deux copies du même KL, gelées chacune d'un côté :

- \(\alpha\,\mathrm{KL}(\mathrm{sg}[q] \,\Vert\, p)\) : ici \(q\) est gelé → ce terme ne corrige que le prédicteur \(p\), tiré vers la cible ;
- \((1-\alpha)\,\mathrm{KL}(q \,\Vert\, \mathrm{sg}[p])\) : ici \(p\) est gelé → ce terme ne corrige que l'encodeur \(q\), tiré doucement vers la prédiction.

Avec \(\alpha \approx 0{,}8\), le premier terme domine : le prédicteur chasse la cible 4 fois plus fort que la cible ne s'adapte au prédicteur. Analogie : un élève (le prior, qui devine) et un correcteur (le posterior, qui voit la vraie copie). On veut surtout que l'élève progresse vers le correcteur ; on autorise le correcteur à simplifier légèrement son barème, mais pas à brader l'examen pour que tout le monde ait 20.

Les free bits. Danger inverse : si on écrase le KL jusqu'à 0, alors \(z\) devient *entièrement* prévisible depuis \(h_t\) — autrement dit l'image n'apporte plus aucune information neuve, autre forme d'effondrement. Les *free bits* posent un plancher : en dessous d'un petit seuil (par ex. 1 nat), le KL n'est plus pénalisé du tout. C'est un forfait gratuit : « tu as droit à ce quota d'imprévisibilité sans amende ». Ça garantit qu'un minimum d'information fraîche venue des observations continue de couler dans \(z\), et qu'on ne sur-régularise pas.

Côté JEPA : la même bataille, d'autres armes. La formule

\(\mathcal{L} = \big\lVert \mathrm{Pred}(\mathrm{Enc}_{ctx}(x), \Delta) - \mathrm{sg}[\mathrm{Enc}_{tgt}(y)]\big\rVert^2\)

dit : « encode le contexte \(x\) (par ex. une image dont on a masqué un morceau), et prédis la représentation du morceau caché \(y\) — pas ses pixels, sa représentation ». \(\Delta\) précise *où* est le morceau à deviner. Le risque d'effondrement est identique : si les deux encodeurs sortaient un vecteur constant, la perte serait nulle sans rien apprendre. Deux verrous l'empêchent :

- le sg sur la cible : le gradient ne corrige que le côté prédiction, jamais la cible — exactement le rôle du KL balancing ;
- la cible est produite par un encodeur cible séparé, dont les poids sont une EMA (*exponential moving average*, moyenne mobile exponentielle) de l'encodeur de contexte : à chaque pas, \(\text{poids}_{tgt} \leftarrow 0{,}99 \times \text{poids}_{tgt} + 0{,}01 \times \text{poids}_{ctx}\). C'est une copie ralentie et lissée de soi-même : elle suit les progrès de l'encodeur principal, mais avec inertie, si bien que la cible reste stable et ne peut pas s'effondrer d'un coup pour complaire au prédicteur.

La phrase qui résume tout : dans les deux architectures, le modèle apprend en prédisant sa propre représentation — le prior devine le \(z\) que le posterior va calculer, le prédicteur JEPA devine l'embedding que l'encodeur cible va produire. Et comme « se prédire soi-même » invite à la triche (rendre la cible triviale), tout l'attirail de la capture — stop-gradient, déséquilibre \(\alpha\), free bits, EMA — sert un seul but : forcer la prédiction à monter vers la cible, et interdire à la cible de descendre vers la prédiction.

On tire le **prior vers le posterior** plus fort que l'inverse (le prédicteur chasse la cible) *(en clair : on corrige surtout la **prédiction** pour qu'elle rejoigne ce qu'on a vu — et non l'inverse — afin que la cible ne « triche » pas en devenant trop simple.)*. Les **free bits** plafonnent ce KL pour ne pas sur-régulariser. Côté JEPA :

\(\mathcal{L} = \big\lVert \mathrm{Pred}(\mathrm{Enc}_\text{ctx}(x),\,\Delta) - \mathrm{sg}\big[\mathrm{Enc}_\text{tgt}(y)\big]\big\rVert^2,\quad \mathrm{Enc}_\text{tgt} = \mathrm{EMA}(\mathrm{Enc}_\text{ctx})\)

Même structure : une cible qu'on **interdit de rendre triviale** (stop-gradient/EMA), parfois renforcée par VICReg (termes de variance/covariance). **La leçon profonde : dans un world model, le verrou d'ingénierie n'est pas la prédiction — c'est l'anti-effondrement.** C'est le même combat qui relie apprentissage auto-supervisé et modèles du monde.

### Révélation 3 — La moyenne de deux futurs est un futur **impossible.**

Voici l'erreur qui explique tout le reste. Le futur **branche** : le verre glisse *ou* il est rattrapé *(« ça branche » = à partir d'ici, **plusieurs futurs différents** sont possibles — il glisse / il est rattrapé — pas un seul.)*. Si on entraîne un réseau à prédire le futur par une simple régression (MSE), il apprend à prédire la **moyenne** des branches. Et la moyenne de deux futurs réels est en général un futur qui **n'existe dans aucun monde** — le flou. C'est *exactement* pourquoi les modèles vidéo bavent, pourquoi les objets se dédoublent, pourquoi « prédire la prochaine image » échoue subtilement.

Et toute l'histoire des architectures de dynamique est une suite de **réponses à cela** :

- **2018, MDN-RNN** (Ha & Schmidhuber) : ne prédire ni un point, ni une moyenne, mais un **mélange de gaussiennes** — « soit ici, soit là ». La récurrence peut enfin dire *plusieurs*.
- **2021, latents catégoriels** (DreamerV2/V3) : remplacer le latent gaussien par des **variables discrètes** (one-hot, gradient straight-through). Surprise contre-intuitive : *le monde est continu, mais la meilleure langue intérieure pour le prédire est discrète* — une catégorielle représente nativement « A ou B » sans les moyenner.
- **2024, diffusion** (Sora, GAIA) : **échantillonner** un futur par débruitage itératif plutôt que de le régresser — on tire *un* mode net au lieu d'une bouillie *(en clair : au lieu de calculer **une moyenne** de tous les futurs possibles — ce qui donne du flou — la diffusion **en tire un seul, net**, en partant d'une image de bruit qu'elle « nettoie » petit à petit.)*.

**🔧 SOUS LE CAPOT** · *Mode-averaging, et trois antidotes*

Le mal : si \(p(z_{t+1}\mid z_t,a_t)\) est multimodal et qu'on minimise un MSE \(\lVert z_{t+1}-\hat z_{t+1}\rVert^2\), l'optimum est \(\hat z_{t+1}=\mathbb{E}[z_{t+1}\mid\cdot]\) — la moyenne des modes, qui ne correspond à aucun échantillon réel. *(en clair : minimiser l'erreur quadratique (MSE) revient mathématiquement à viser la **moyenne** de tous les futurs possibles. Or la moyenne entre « le verre à gauche » et « le verre à droite » place le verre **au milieu** — une situation qui n'arrive jamais en vrai. D'où le flou et les objets fantômes.)*

- **MDN** : \(p(z_{t+1}\mid\cdot)=\sum_k \pi_k\,\mathcal{N}(\mu_k,\sigma_k^2)\) ; une **température** \(\tau\) dilate \(\sigma_k\) et règle l'audace du rêve (et — clé — bride l'agent qui voudrait exploiter les zones surconfiantes du modèle).
- **Catégoriel + straight-through** :
  - \(z\) = vecteur de catégorielles ;
  - gradient passé « tout droit » à travers l'argmax ;
  - KL bien conditionné,
  - multimodalité gratuite.
- **Diffusion** : on apprend le score \(\nabla_{x}\log p_t(x)\) et on **débruite** \(o_{t+1}\) depuis du bruit, conditionné sur le passé — un Diffusion Transformer sur des *patchs spatio-temporels*. *(en clair : la **diffusion** apprend à **enlever du bruit** — on part d'une image entièrement brouillée et on la « nettoie » étape par étape jusqu'à un futur net ; le **score** est la boussole qui indique, à chaque étape, dans quel sens nettoyer. Un **Diffusion Transformer** fait cela sur de **petits cubes d'image-dans-le-temps** (les patchs spatio-temporels). Résultat : **un** futur précis, au lieu d'une moyenne floue.)* On obtient un mode, pas une moyenne.

Trois époques, une seule question : comment représenter un futur qui branche sans l'écraser en une moyenne *(même idée que plus haut : un futur qui branche = plusieurs suites possibles à partir du même instant.)* ? Quand vous le voyez, vous ne « dé-voyez » plus jamais le flou d'une vidéo IA.

### Révélation 4 — MuZero n'a pas de monde. Il a **l'ombre du monde sur la fonction valeur.**

On imagine que le « modèle » de MuZero représente le plateau, les pièces, l'échiquier. Non. Le latent de MuZero **n'a aucune perte d'ancrage** *(en clair : rien ne **« force »** le latent de MuZero à ressembler au vrai plateau — aucune contrainte de reconstruction ne l'ancre à la réalité visible. Il est libre d'inventer une représentation abstraite, du moment qu'elle prédit les bonnes valeurs.)* : pas de reconstruction, aucune contrainte qu'il ressemble à un état réel. Les *seuls* gradients viennent de la récompense, de la valeur et de la politique. Conséquence vertigineuse : **le monde intérieur de MuZero n'est pas le monde — c'est une fiction abstraite qui se trouve prédire les bonnes valeurs.** Deux situations réelles différentes mais *équivalentes en valeur* sont, pour MuZero, **le même état**. Il a le droit d'imaginer dans une représentation qui ne ressemble à rien de réel — et de planifier dedans avec succès.

**🔧 SOUS LE CAPOT** · *Value-equivalence : jeter le monde, garder son ombre*

Trois fonctions :

- représentation \(s^0 = h_\theta(o_{1:t})\) ;
- dynamique \(s^{k+1},\hat r^{k+1} = g_\theta(s^k,a^k)\) ;
- prédiction \(\hat p^k,\hat v^k = f_\theta(s^k)\).

**Aucune perte ne contraint \(s^k\) à correspondre à un état du monde** — on n'optimise que pour que \(\hat r,\hat v,\hat p\) collent à la réalité (cibles fournies par la recherche MCTS). Le **principe de value-equivalence** (Grimm et al., 2020) le formalise : un modèle qui induit les **mêmes mises à jour de Bellman** *(en clair : la règle de base de l'apprentissage par renforcement — **la valeur d'une situation = la récompense immédiate + la valeur de la situation suivante**. On met à jour ses estimations de proche en proche avec cette équation.)* que le vrai environnement, pour un ensemble de politiques et la vraie récompense, **suffit à planifier optimalement — même s'il ne modélise jamais l'observation.** Dit autrement : on peut projeter le monde sur l'espace quotient « même valeur » *(en clair : on **fusionne** toutes les situations qui « valent pareil » en une seule, et on jette les différences inutiles — comme regrouper toutes les pièces de 1 € quelle que soit leur année. Il reste un monde plus petit, suffisant pour décider.)*, jeter le reste, et planifier sur le quotient. C'est la version dure de « comprendre, c'est savoir quoi ignorer ».

### Révélation 5 — On peut **découvrir les verbes d'un monde** sans jamais les observer.

Comment rendre un monde généré **contrôlable** quand on l'a appris sur des vidéos Internet **sans aucune étiquette d'action** ? Genie répond par un **modèle d'actions latentes** : entre deux images consécutives, un réseau *infère* l'action discrète qui explique la transition. Aucune supervision. Le système se construit tout seul un **petit vocabulaire d'actions** (≈ 8) — « gauche », « saute », « avance » émergent comme des symboles, jamais nommés. À l'inférence, on jette l'encodeur d'actions et **c'est l'utilisateur qui fournit le verbe** depuis ce codebook *(en clair : un **petit catalogue** d'actions (≈ 8 cases) que le système s'est construit tout seul. À l'usage, l'utilisateur pioche dedans : « case 3 = avancer », « case 7 = sauter »…)*. On a appris la *grammaire d'action* d'un monde à partir de sa seule observation passive.

**🔧 SOUS LE CAPOT** · *Latent Action Model, tokenisation VQ, et le passage du GRU à l'attention*

**(a) Actions latentes.** Un encodeur \(a^{\text{lat}}_t = \mathrm{LAM}(o_t, o_{t+1})\) infère une action discrète (codebook VQ, \(\leq 8\) entrées) ; la dynamique apprend \(\hat o_{t+1} = D(o_{\leq t}, a^{\text{lat}}_t)\). Comme le codebook est minuscule, les actions deviennent *interprétables et jouables*. (Les actions sont injectées en **embeddings additifs**, pas en concaténation — détail qui améliore la contrôlabilité.)

**(b) Tokenisation = la charnière cachée.** Un **VQ-VAE** discrétise chaque image en tokens *(en clair : on **découpe l'image en petits morceaux** et on remplace chacun par un symbole pris dans un dictionnaire fini — comme transformer une image en suite de « lettres ». Le modèle peut alors traiter la vidéo comme un texte.)* ; dès lors un **Transformer** (ici dynamique MaskGIT, décodeur-only, prédiction parallèle de tokens masqués) peut modéliser le futur comme une séquence. La discrétisation du monde est *ce qui a permis à la révolution Transformer de pouvoir traiter le world modeling* *(en clair : une fois le monde transformé en suite de symboles, les **Transformers** — les réseaux des grands modèles de langage — deviennent applicables tels quels ; ils ont donc « pris le dessus » sur les anciennes architectures pour modéliser les mondes.)* (cf. aussi IRIS, 2023 : VQ + GPT pour un world model d'une efficacité-échantillon remarquable).

**(c) Deux récurrences.** Le RSSM porte la mémoire dans un **vecteur d'état** (GRU) : compact, markovien, mais qui **dérive** à long horizon. Les world models à **attention** (ST-transformer de Genie, attention *spatiale* et *temporelle* entrelacées pour éviter le coût quadratique) gardent l'**historique explicite** : d'où la permanence d'objets sur des minutes là où le GRU s'efface. Le glissement GRU → attention est le vrai sous-texte architectural de 2018 → 2026.

### Révélation 6 — On peut faire de la **descente de gradient à travers un rêve.**

Dernière surprise, et c'est la plus belle. En RL classique, améliorer une politique passe par des estimateurs de gradient **bruités** (score function / REINFORCE) : on tâtonne dans le noir. Mais si votre modèle du monde est **différentiable**, vous pouvez propager le gradient du retour imaginé **à travers la dynamique apprise**, sur tout l'horizon d'imagination, jusqu'aux paramètres de la politique. Vous ne tâtonnez plus : vous faites de la **descente de gradient analytique à travers un simulateur que vous avez vous-même construit.** Dreamer entraîne ainsi son acteur dans des rollouts purement latents — sans jamais décoder un pixel.

**🔧 SOUS LE CAPOT** · *Gradient analytique vs score function*

Acteur Dreamer : on déroule \(H\) pas en latent, on estime des \(\lambda\)-returns \(V^\lambda\) via le critique, et on optimise \(\nabla_\phi \mathbb{E}\big[V^\lambda\big]\) en **rétropropageant à travers** \(f_\theta\) (dynamique reparamétrée ; straight-through pour les latents discrets). À comparer au gradient model-free \(\nabla_\phi \mathbb{E}[R] = \mathbb{E}\big[R\,\nabla_\phi \log\pi_\phi\big]\), à variance élevée. Le world model transforme une **optimisation boîte-noire bruitée** en **optimisation lisse à travers un simulateur appris**. C'est, littéralement, *apprendre en rêvant* — et c'est calculable. La phrase paraît cryptique parce qu'elle condense deux idées : où l'acteur s'entraîne (dans le rêve), et surtout comment le signal d'apprentissage lui-même voyage à travers le rêve. C'est ce deuxième point qui justifie le « littéralement ». Déplions.

Le problème de fond : obtenir une *direction*, pas juste une note.

Pour améliorer l'acteur par descente de gradient, il faut répondre à la question : « dans quel sens modifier chacun de ses poids \(\phi\) pour que la récompense totale monte ? ». Il y a deux façons radicalement différentes d'obtenir cette direction.

**Façon 1 — le monde réel comme boîte noire (model-free).** Dans le vrai jeu, tu ne peux pas dériver la physique : tu joues, et l'environnement te renvoie un score, point. Impossible de demander « et si j'avais braqué 0,01 de plus au 3ᵉ virage, le score aurait changé de combien ? » — le jeu ne fournit pas cette pente. La seule stratégie possible, c'est celle de la formule \(\nabla_\phi \mathbb{E}[R] = \mathbb{E}[R\, \nabla_\phi \log \pi_\phi]\), qui dit en substance : *essaie plein de trajectoires au hasard ; celles qui ont bien scoré, rends leurs actions plus probables ; celles qui ont mal scoré, moins probables*. C'est le jeu du « chaud / froid » : tu n'as jamais la direction, tu la devines statistiquement à force d'essais. Ça marche, mais c'est bruité (« à variance élevée ») : il faut énormément de parties pour que la bonne direction émerge du hasard.

**Façon 2 — le rêve comme formule dérivable.** Et voilà le point clé : le simulateur appris \(f_\theta\) (le RSSM), lui, n'est pas une boîte noire — c'est un réseau de neurones, donc une grande formule mathématique dérivable de bout en bout. Quand on déroule \(H\) pas de rêve :

\(z_0 \xrightarrow{a_0 = \pi_\phi(z_0)} z_1 \xrightarrow{a_1 = \pi_\phi(z_1)} z_2 \to \cdots \to V^\lambda\)

chaque flèche est un calcul explicite. La note finale \(V^\lambda\) est donc une fonction mathématique *composée* des poids \(\phi\) de l'acteur — et la règle de dérivation en chaîne peut remonter toute la trajectoire rêvée : « le retour final dépend de \(z_3\), qui dépend de l'action \(a_2\), qui dépend des poids de l'acteur… ». On obtient pour chaque poids sa pente exacte, calculée, pas devinée. C'est ça, le « gradient analytique » : la question interdite dans le monde réel (« et si j'avais braqué un poil plus ? ») devient *calculable* dans le rêve, parce que le rêve est fait de dérivées.

Pourquoi c'est « littéralement apprendre en rêvant » ?

Compare avec un usage naïf du rêve : on pourrait s'en servir juste comme générateur de parties d'entraînement, puis appliquer dessus la méthode chaud/froid. Le rêve ne serait qu'un décor. Dreamer fait plus fort : le gradient traverse physiquement la machinerie du rêve. La rétropropagation passe *à travers* les équations du GRU, à travers chaque transition imaginée, à travers l'estimation du critique. Le rêve n'est pas le décor de l'apprentissage, il en est le conducteur — le milieu dans lequel le signal d'erreur se propage. L'acteur apprend *par* le rêve, pas seulement *dans* le rêve.

D'où la belle formule *apprendre en rêvant* : le world model transforme une optimisation boîte-noire bruitée (tâtonner dans un monde qu'on ne peut pas dériver) en optimisation lisse à travers un simulateur appris (descendre une pente calculée exactement). Analogie : chercher le point bas d'une vallée. Model-free = y aller de nuit, en jetant des cailloux au hasard et en écoutant où ils roulent. Dreamer = avoir appris une carte en relief de la vallée, et lire la pente directement dessus. La carte peut être légèrement fausse (c'est le prix à payer — on dérive le *modèle*, pas le monde), mais chaque pas est mille fois mieux informé.

Deux obstacles auraient pu bloquer le passage du gradient à travers le rêve — et deux solutions :

- « dynamique reparamétrée » : les transitions du rêve comportent du tirage aléatoire, et on ne dérive pas à travers un dé. Même astuce que pour le VAE : on écrit le tirage sous la forme \(z = \mu + \sigma \cdot \varepsilon\), avec le hasard \(\varepsilon\) sorti à part comme une constante — la formule redevient dérivable.
- « straight-through pour les latents discrets » : dans DreamerV3, \(z\) est fait de choix discrets (des cases cochées, pas des nombres continus), et un choix discret n'a pas de pente du tout. L'astuce *straight-through* : à l'aller, on utilise le vrai choix discret ; au retour, on fait comme si l'opération avait été continue et on laisse passer le gradient tel quel. C'est mathématiquement un petit mensonge, mais un mensonge contrôlé qui marche très bien en pratique.

En une phrase : c'est « apprendre en rêvant » parce que le rêve fournit à la fois l'expérience (les trajectoires imaginées) et le professeur (le gradient exact, calculé en rétropropageant à travers les équations mêmes du rêve) — deux choses que le monde réel, boîte noire non dérivable, ne pourra jamais offrir qu'en version dégradée.

### Synthèse — le tableau qui referme les six révélations

| Système                   | Encodeur                  | Dynamique                        | Ce qu'il **décode**                | Antidote au flou           | Réseau dominant      |
| ------------------------- | ------------------------- | -------------------------------- | ---------------------------------- | -------------------------- | -------------------- |
| **Ha & Schmidhuber 2018** | VAE conv.                 | MDN-RNN                          | rien (contrôleur évolué)           | mélange de gaussiennes     | CNN + LSTM           |
| **Dreamer V3**            | CNN/ViT                   | RSSM (GRU + latents catégoriels) | image + récompense/valeur          | latents discrets           | CNN + GRU + MLP      |
| **MuZero**                | ResNet                    | ResNet latent                    | **rien** (valeur/politique seules) | sans objet (pas de pixels) | ResNets + MCTS       |
| **Sora / GAIA**           | autoencodeur spatio-temp. | Diffusion Transformer            | pixels                             | diffusion                  | VAE + Transformer    |
| **Genie**                 | VQ-VAE (ST-transf.)       | MaskGIT + actions latentes       | tokens d'image                     | tokens discrets            | VQ-VAE + Transformer |
| **V-JEPA 2**              | ViT (+ cible EMA)         | Transformer prédicteur           | **représentation** (pas de pixels) | non génératif              | ViT + Transformer    |

---

## MODULE 6 · Les trois familles au niveau technique, et les limites formelles

### 6.1 — JEPA : prédire dans l'espace de représentation

**🔧 SOUS LE CAPOT** · *JEPA : prédire dans l'espace de représentation*

Le pari de l'architecture **JEPA** (Joint-Embedding Predictive Architecture, LeCun 2022 ; I-JEPA images 2023, V-JEPA vidéo 2024, **V-JEPA 2** 2025) : prédire le futur est plus facile et plus utile **dans l'espace des représentations que dans l'espace des pixels**. Deux encodeurs (contexte et cible), un prédicteur, et une perte *en latent* :

\(\mathcal{L} = \big\lVert \, \mathrm{Pred}\big(\mathrm{Enc}_\text{ctx}(x),\, a\big) - \mathrm{sg}\big[\mathrm{Enc}_\text{tgt}(y)\big] \, \big\rVert^2\)

où \(y\) est la cible future, \(\mathrm{sg}[\cdot]\) un *stop-gradient* et l'encodeur cible une moyenne mobile (EMA) de l'encodeur contexte.

C'est **non génératif** : aucun pixel n'est jamais produit. L'enjeu technique est d'éviter l'**effondrement** des représentations (tout encoder vers un point) — d'où les régularisations type **VICReg** (variance-invariance-covariance) ou l'EMA. Le gain conceptuel : le modèle peut **jeter ce qui est imprévisible** (le scintillement d'un reflet) et ne garder que la structure qui se prédit. V-JEPA 2 a été pré-entraîné sur ~1 million d'heures de vidéo et affiné sur quelques dizaines d'heures de trajectoires de robot, pour atteindre une planification robotique **zero-shot** *(en clair : **« du premier coup »** — le modèle réussit une tâche nouvelle **sans entraînement spécifique** pour elle, en réutilisant ce qu'il a appris ailleurs.)*. Cousin à citer : **DINO-WM** (2025), qui pose un world model sur des features visuelles pré-entraînées.

### 6.2 — Pourquoi prédire chaque pixel est un objectif trompeur

**🔧 SOUS LE CAPOT** · *Pourquoi prédire chaque pixel est un objectif trompeur*

Le problème est dans la **fonction de coût**. Un générateur vidéo optimise une vraisemblance au niveau du pixel (diffusion ou autorégression sur des *patchs* spatio-temporels) *(en clair : **diffusion** = générer une image en partant de bruit qu'on nettoie peu à peu ; **autorégression** = générer morceau par morceau, chacun à partir des précédents, comme un texte ; **patchs spatio-temporels** = petits cubes d'image-dans-le-temps, les « briques » que le modèle assemble.)*. Or l'essentiel de l'information pixel est **imprévisible et non pertinent** : texture, grain, micro-reflets. Maximiser la vraisemblance des pixels force le modèle à **gaspiller sa capacité** sur ce bruit, au détriment de la structure causale. Démonstration empirique classique : une IA qui génère une balle qui tombe a appris une *régularité visuelle* (« dans les vidéos, les balles vont vers le bas »), pas une *théorie de la gravitation*. La différence se révèle hors distribution : balle aimantée, sous l'eau, gravité modifiée, collision rare → le monde intérieur se fissure. C'est l'argument central du camp **représentation** (LeCun) contre le camp **pixels** : prédire dans l'espace latent permet justement d'**ignorer l'imprévisible** et de modéliser le sens. Le camp **valeur** (MuZero) tranche encore plus net : il ne prédit ni pixels ni représentation générale, seulement ce qui change la décision.

### 6.3 — Les trois limites, formulées proprement

**🔧 SOUS LE CAPOT** · *Trois limites, formulées proprement*

1. **Compounding error / shift de distribution.** En déroulant le modèle de façon autorégressive, chaque prédiction devient l'entrée de la suivante. Le modèle quitte la distribution sur laquelle il a été entraîné (*exposure bias*), et l'erreur croît typiquement de façon supra-linéaire avec l'horizon. C'est *la* raison pour laquelle on planifie sur des horizons courts (Dreamer : ~15 pas) et qu'on raccourcit la chaîne par la planification (MCTS) plutôt que par la simulation longue. Lecture imagée : si l'erreur à l'instant \(t\) est \(\varepsilon_t = \lVert z_t - \hat{z}_t \rVert\), elle se propage comme \(\varepsilon_{t+1} \approx L\,\varepsilon_t + \delta_t\) — chaque pas amplifie l'erreur précédente (\(L\)) et en ajoute une nouvelle (\(\delta_t\)).
2. **Observationnel ≠ interventionnel.** Un modèle appris sur des vidéos estime \(p(x_{t+1}\mid x_t)\) — une distribution **observationnelle**. Or agir, c'est **intervenir** : ce qu'il faudrait, c'est \(p(x_{t+1}\mid \mathrm{do}(a_t))\) au sens du *do-calculus* de Pearl *(en clair : le **calcul de Judea Pearl** distingue *observer* et *agir*. \(P(B\mid A)\) = « quand je **vois** \(A\), \(B\) suit souvent » (corrélation) ; \(P(B\mid \mathrm{do}(A))\) = « si **j'impose** \(A\) moi-même, qu'arrive-t-il ? » (cause). Le baromètre qui chute accompagne la tempête, mais **bouger l'aiguille** ne la déclenche pas. Agir exige le second, qu'un modèle entraîné à seulement regarder ne possède pas.)*. Autrement dit, le modèle sait estimer que \(P(B\mid A)\) est élevé (« quand \(A\) arrive, \(B\) suit souvent »), mais pas \(P(B\mid \mathrm{do}(A))\) (« que se passe-t-il si j'interviens pour provoquer \(A\) ? »). Sans variation expérimentale (interventions, contre-factuels), le modèle apprend des **corrélations** qui se brisent dès qu'on agit sur le système. D'où des pistes récentes type interventions latentes (*Causal-JEPA*, 2026).
3. **Incertitude aléatorique vs épistémique.** Le monde est en partie *intrinsèquement* aléatoire (aléatorique), et le modèle est en partie *ignorant* (épistémique). Confondre les deux est dangereux : c'est l'ignorance épistémique — « je n'ai jamais vu ça » — qui devrait déclencher la prudence.

### 6.4 — Model exploitation & objective mismatch

**🔧 SOUS LE CAPOT** · *Model exploitation & objective mismatch*

Quand on optimise une politique **contre** un modèle appris, l'optimiseur cherche le maximum de récompense — y compris là où le modèle se **trompe le plus**. La politique est donc attirée vers les **erreurs du modèle** (*model exploitation*). C'est aussi pourquoi un modèle entraîné à bien prédire n'est pas forcément un bon modèle pour *décider* : c'est l'*objective mismatch* du RL basé modèle (Lambert et al., 2020). Deux familles de parades :

(a) **pénaliser l'incertitude** — n'autoriser l'agent à exploiter le modèle que là où il est fiable (pessimisme sous incertitude, central en RL hors-ligne, donc pertinent pour DreamerV4) ;

(b) **estimer l'incertitude épistémique** par des **ensembles** de modèles et leur **désaccord** comme signal de « zone inconnue ».

La température \(\tau\) de Ha & Schmidhuber était déjà, en 2018, une parade artisanale à ce même démon.

C'est pourquoi un bon modèle du monde ne doit pas seulement imaginer. Il doit aussi savoir **douter** : estimer « ici mes prédictions sont fiables », ou au contraire « je n'ai jamais vu cette situation, plusieurs futurs sont possibles, mon modèle est incertain ». La grande question de la recherche n'est donc pas seulement *comment construire une machine capable d'imaginer ?* — mais : **comment construire une machine capable de reconnaître les limites de son imagination ?**
