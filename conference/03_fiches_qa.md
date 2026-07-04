# Fiches Q&A — munitions pour la séance de questions

> **Usage :** ces fiches ne sont pas jouées sur scène. Elles servent pendant la séance de questions (et en couloir). Chaque fiche donne : la **réponse express** (15-30 secondes), puis le **développement** si la personne creuse. La profondeur en réserve est votre meilleur atout de crédibilité : ne l'étalez pas, dégainez-la.

---

## FICHE 1 · « Mais une voiture autonome, elle fait déjà ça, non ? »

*La question arrivera presque à coup sûr. C'est l'occasion parfaite de mettre la grille de lecture de la conférence à l'épreuve. La réponse honnête est : oui… et non.*

> 🛠 **Réponse express** : « La voiture autonome a un modèle *du* monde — structuré, lisible, fait main — et oui, elle anticipe. Les World Models, eux, *apprennent* le monde et l'imaginent dans un espace latent. Et pour l'instant, dans l'automobile, on se sert surtout des seconds pour **entraîner et tester** les premiers, pas pour conduire. »

**Développement complet** (section 7 ter du brouillon d'origine, intégralement conservée) :

`» SLIDE de réserve : pipeline voiture — percevoir → prédire → planifier → contrôler`

![Schéma : pipeline modulaire (voiture autonome) vs World Model appris](assets/pipeline_voiture_vs_world_model.png)

*Schéma — Anticiper la route : pipeline modulaire (voiture autonome déployée) vs World Model appris. Dans l'automobile, le world model appris sert surtout en amont (scénarios rares, ex. GAIA-2 ; entraînement / test), pas comme cerveau temps réel certifié.*

**Oui, elle anticipe.** Sous le capot d'un système déployé, on trouve une chaîne bien rodée : percevoir, suivre les objets, **prédire leurs trajectoires**, planifier, contrôler. Le module de prédiction fait exactement ce dont on parle : il regarde le piéton et estime « va-t-il traverser ? », il anticipe la trajectoire des autres véhicules. Donc oui, il y a un modèle du monde, et il y a de l'anticipation. Sur ce point, la personne qui pose la question a raison.

**Mais ce n'est pas le même genre de modèle.** Le modèle d'une voiture déployée est un modèle **fabriqué à la main** : une scène structurée — des voies, des objets (voitures, piétons, cyclistes) avec leur position et leur vitesse, des feux, une carte HD — sur laquelle s'appliquent des règles, une physique connue du véhicule, et un prédicteur de trajectoires *(en clair : des ingénieurs **écrivent eux-mêmes** la liste des objets à reconnaître, les règles de circulation et les équations du mouvement, au lieu de laisser le réseau tout apprendre seul à partir des données.)*. C'est **interprétable** : un ingénieur peut ouvrir le capot et lire « le système a vu un piéton ici, lui a attribué cette trajectoire, a décidé de freiner ». La dynamique vient surtout de **règles et d'équations connues** *(par exemple : des **équations de physique connues** — vitesse = distance ÷ temps, lois du freinage, trajectoire d'un mobile (cinématique) — et des règles de priorité codées en dur, et non « devinées » par un réseau.)*, pas d'un latent appris dans lequel la machine *imaginerait* librement la suite. Les World Models de cette conférence font l'inverse : ils **apprennent** la dynamique à partir des données, dans un espace latent, et ils **déroulent** des futurs — y compris des choses qui ne figurent dans aucune liste d'objets prévue à l'avance.

**🔧 SOUS LE CAPOT** · *Le stack modulaire vs le world model appris*

Le stack déployé classique enchaîne quatre étages : **perception** (détection, segmentation, vue de dessus « BEV »), **prédiction** (trajectoires multimodales des agents — VectorNet, Wayformer…), **planification** (longtemps à base de règles et de fonctions de coût écrites à la main), **contrôle** (souvent un **MPC**, *Model Predictive Control*, qui optimise la commande sur un horizon court avec un modèle cinématique *connu* du véhicule). Représentation **symbolique et géométrique**, dynamique **largement programmée** : interprétable et corrigeable en quelques heures, mais sujette aux **erreurs en cascade** entre modules et à une couverture limitée de scénarios. Les approches **end-to-end** *(en clair : **« de bout en bout »** — un **seul** réseau qui va directement des caméras à la commande du volant, sans étages séparés. Plus puissant et plus fluide, mais une « boîte noire » difficile à inspecter.)* (pionnier : Wayve ; ou les planificateurs guidés par *occupancy*) remplacent ces étages par un seul réseau **différentiable**, optimisé pour la décision — au prix de l'interprétabilité.

Pont intéressant à signaler : le **MPC** du contrôle fait déjà, en tout petit et avec un modèle *donné*, ce qu'un world model fait en grand avec un modèle *appris* — dérouler plusieurs futurs à horizon court et choisir le meilleur. La différence de fond n'est donc pas la philosophie (imaginer pour décider), c'est **d'où vient le modèle** : écrit à la main, ou appris des données.

**Où est la voiture dans notre grille ?** Reprenons les trois familles.

- Le stack déployé classique forme presque une **quatrième catégorie** : prédire des **trajectoires d'objets structurés**, dans une ontologie fixée, avec une planification souvent codée et un contrôle par MPC. Lisible, certifiable… mais fragile dès qu'apparaît ce qui n'était pas dans la liste.
- Les modèles génératifs de conduite — comme **GAIA** (Wayve) — relèvent de la famille **pixels** : ils génèrent des vidéos de conduite. Et voici le détail capital : **on ne les met pas dans la voiture pour conduire.** On les utilise **à côté, hors-ligne**, pour fabriquer des scénarios — surtout des scénarios **rares et dangereux** qu'on ne peut pas filmer dans la vraie vie. Un chiffre pour mesurer l'enjeu : aux États-Unis, il y a en moyenne un accident tous les ~535 000 km, et seulement 0,064 % impliquent une collision avec un arbre. Comment apprendre à une voiture à éviter un arbre si l'événement est si rare ? On le **génère**. Le world model sert à peupler la longue traîne.
- Et le front — end-to-end, *occupancy world models* — pousse justement vers une voiture qui apprend sa représentation et même sa dynamique, en se rapprochant des familles **valeur** et **représentation**.

**Et c'est là que la boucle se referme.** Regardez où vit le world model *appris* dans la conduite, aujourd'hui : surtout **en amont**, pour **entraîner et tester** la voiture — pas (encore) pour **être** son cerveau temps réel certifié. Pourquoi ? Exactement pour la raison qui traverse toute la conférence : on ne sait pas encore certifier une boîte qui imagine librement. On se sert du rêve pour **éprouver** la voiture, pas pour la **conduire**. Une vidéo de conduite générée, même parfaite, ne prouve pas que la physique est juste — *réalisme n'est pas compréhension*. Et un scénario imaginé peut **disqualifier** un système (montrer qu'il échoue), jamais **garantir** qu'il réussira. C'est, en miniature, toute l'histoire de la conférence : la machine apprend à rêver la route — à nous de vérifier le rêve avant de lui confier le volant.

---

## FICHE 2 · « Et les LLM, ChatGPT, dans tout ça ? Les world models les remplacent ? »

> 🛠 **Réponse express** : « Non — ils se complètent. Un LLM prédit le prochain *mot* ; un world model prédit le prochain *état du monde*. Le premier excelle sur le texte, le code, la connaissance ; le second devient indispensable dès qu'il faut simuler le réel : robots, logistique, opérations industrielles, mobilité, énergie. La tendance est à l'hybridation : le langage comme interface, le world model comme moteur de compréhension du réel. »

**Si la personne creuse** : c'est exactement le repositionnement défendu par Yann LeCun — faire des world models le cœur de l'intelligence machine, et reléguer le langage au rang d'interface parmi d'autres (au même titre que la vision ou l'action). Les domaines où les LLM échouent le plus visiblement — la robotique, l'industrie physique, tout ce qui exige de prévoir les conséquences d'une action — sont précisément ceux où les world models ont les arguments les plus solides. NVIDIA Cosmos illustre déjà l'hybridation : un world model pour simuler et prédire le monde physique, couplé à un composant vision-langage pour interpréter les instructions.

---

## FICHE 3 · « Pourquoi les vidéos générées par IA ont-elles ces défauts bizarres — objets qui se dédoublent, flou, mains fantômes ? »

> 🛠 **Réponse express** : « Parce que le futur *branche* : à partir du même instant, plusieurs suites sont possibles. Un modèle entraîné naïvement prédit la *moyenne* de ces futurs — et la moyenne de deux futurs réels est un futur qui n'existe dans aucun monde. Le verre à gauche ou à droite, moyenné, donne un verre au milieu, flou. Toute l'histoire des architectures récentes est une suite de parades à ce problème. »

**Si la personne creuse** : trois époques de parades — le mélange de gaussiennes (2018), les latents discrets (DreamerV2/V3, 2021), la diffusion qui *tire un* futur net au lieu de moyenner (Sora, GAIA, 2024). Détail complet : masterclass, module 5, Révélation 3.

---

## FICHE 4 · « Vous pouvez préciser la formulation mathématique complète ? » *(profil technique)*

> 🛠 **Réponse express** : « Le cadre exact est le POMDP — processus de décision markovien partiellement observable. L'agent ne voit jamais l'état vrai du monde : il maintient une croyance à partir d'observations partielles, et c'est sur cette croyance qu'il décide. Un world model, c'est la machinerie qui apprend le modèle de transition de ce POMDP. »

**Si la personne creuse** : croyance \(b_t = p(s_t \mid o_{1:t}, a_{1:t-1})\), modèle de transition, récompense, politique — détail complet : masterclass, module 1. Et pour l'architecture : RSSM, prior/posterior, KL — masterclass, module 2.

---

## FICHE 5 · « Sora se présente comme un "simulateur du monde". C'est vrai ou c'est du marketing ? »

> 🛠 **Réponse express** : « Les deux. C'est un système spectaculaire de la famille "pixels" : il peint des futurs plausibles, et c'est déjà très utile — données synthétiques, scénarios, création. Mais l'entreprise elle-même reconnaît qu'il ne modélise pas correctement la physique de beaucoup d'interactions de base. Réalisme n'est pas compréhension : c'est un grand peintre, pas encore un physicien. La question à poser à n'importe quel "simulateur du monde" : que prédit-il exactement, et dans quel espace — pixels, valeur, ou représentation ? »

**Si la personne creuse** : l'argument technique (la vraisemblance pixel gaspille la capacité du modèle sur du bruit imprévisible, au détriment de la structure causale) est dans la masterclass, module 6.2.

---

## FICHE 6 · « Quel horizon de temps pour des applications concrètes chez nous ? »

> 🛠 **Réponse express** : « Trois horizons. Déjà en production : la génération de données synthétiques et de scénarios rares pour entraîner et tester des systèmes (conduite, robotique). En déploiement rapide : les robots entraînés en imagination et la planification robotique à partir de pré-entraînement vidéo massif. Plus prospectif : le world model comme cerveau temps réel de systèmes critiques — bloqué non par la performance, mais par la certification. D'où le principe : un monde appris peut *démontrer* qu'un système échoue, pas *garantir* qu'il réussira. Commencez par les usages où cette asymétrie n'est pas bloquante : tester, éprouver, explorer. »
