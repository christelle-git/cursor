# L'IA ouvre les yeux
## Quand les machines apprennent à imaginer le futur

> **Format : keynote plénière 45 min + Q&A** · Public : COMEX / CODIR, techniques et non techniques.
> Cette conférence raconte une **bascule** : pendant longtemps, l'IA a surtout appris à **voir** le monde ; aujourd'hui, une partie de la recherche construit des systèmes capables de **le comprendre**.
>
> Un World Model est une représentation mathématique du monde, compressée, orientée vers l'action, qui permet à une machine de tester des futurs possibles avant d'agir.
>
> **Règle d'or de cette version scénique : une seule équation sur scène.** Toute la profondeur technique (RSSM, KL, révélations réseaux…) vit dans `02_masterclass_technique.md` et sert de munitions en Q&A via `03_fiches_qa.md`. Rien n'a été supprimé : tout a été recasé.

---

## SÉQUENCE 1 · Ouverture — le verre au bord de la table *(≈ 4 min · cumul 0:00 → 4:00)*

`[Écran noir. Sur scène, un verre posé près du bord d'une petite table — discrètement fixé au plateau : il ne tombera pas.]`

Imaginez ce verre.

Vous le regardez. Vous voyez sa forme, sa couleur, sa position.

Une intelligence artificielle classique peut faire la même chose. Elle peut vous dire : « c'est un verre », « il est transparent », « il est posé sur une table ».

Maintenant, je pousse lentement ce verre vers le bord.

Vous, vous ne voyez pas seulement un verre. Vous voyez déjà ce qui pourrait arriver. Vous imaginez sa chute. Le bruit du verre qui se brise. Les morceaux sur le sol. Peut-être même le mouvement de votre main pour le rattraper.

Le verre n'est pas encore tombé. Et pourtant, dans votre tête, le futur a déjà commencé.

`» SLIDE : « L'IA ouvre les yeux »`

Ce petit geste mental — anticiper la chute avant qu'elle arrive — c'est l'une des choses les plus extraordinaires que fait votre cerveau. Vous venez de **simuler le futur**. Vous avez, à l'intérieur de votre tête, un petit modèle du monde, et vous l'utilisez en permanence, sans y penser, pour deviner ce qui va se passer avant que ça se passe. Vous le faites sans cesse : en traversant la rue en anticipant la trajectoire des voitures, en ajustant votre main avant même qu'on vous tende un objet.

Pendant longtemps, ça, c'était notre privilège. Les machines, elles, ne savaient pas imaginer. Elles savaient **reconnaître**.

Aujourd'hui, je voudrais vous emmener au moment où l'intelligence artificielle a commencé, elle aussi, à ouvrir les yeux. On appelle ces systèmes des **World Models**, des modèles du monde.

Et je vais vous proposer un seul fil pour traverser tout le sujet, des échecs aux voitures autonomes en passant par les vidéos générées : à chaque fois que vous croiserez un modèle du monde, posez-vous une question : **que prédit-il, exactement — et pour quoi faire ?** Vous allez voir que toute la profondeur du sujet, tous les pièges — et toutes les décisions que vous aurez à prendre — tiennent dans cette question.

---

## SÉQUENCE 2 · Reconnaître n'est pas anticiper *(≈ 5 min · cumul 4:00 → 9:00)*

Pendant une dizaine d'années, on a appris aux machines à répondre à des questions **figées**. Que contient cette image ? Un chat ou un chien ? Cette personne traverse-t-elle ? Cette pièce a-t-elle un défaut ?

`» SLIDE : une image → une étiquette`

Ces systèmes peuvent être prodigieux — parfois meilleurs qu'un expert. Mais regardez ce qu'ils font vraiment : ils répondent à une seule question, « qu'est-ce que c'est ? ».

`» SLIDE : « Qu'est-ce que c'est ? »`

Une question sur le **présent**, sur une image **figée**. Ils regardent le monde comme une succession de photographies.

Or le monde n'est pas une photographie. Le monde bouge. Les objets tombent, les véhicules accélèrent, une action en provoque une autre. Demandez à un classifieur d'images : « si je pousse ce verre, que va-t-il se passer ? » — il n'en a aucune idée. Il sait nommer le verre. Il ne sait pas qu'il peut tomber.

Prenez une voiture autonome. Reconnaître un piéton est indispensable, mais ce n'est que le début. Va-t-il traverser ? Regarde-t-il son téléphone ? Que se passe-t-il si je freine ? Si je maintiens ma trajectoire ? Si un autre véhicule le masque une seconde ? La vraie question n'est plus « qu'est-ce que je vois ? », elle devient : **« parmi tous les futurs possibles, lesquels peuvent advenir — et que dois-je faire maintenant ? »**

Et voici la seule formule de la soirée — je vous la montre parce qu'elle tient sur une ligne, et que tout le reste en découle.

`» SLIDE : les deux lignes, côte à côte`

Reconnaître, c'est apprendre \(y = f(x)\) : d'une image, sortir une étiquette.

Anticiper, c'est apprendre \(\hat{s}_{t+1} = f(s_t, a_t)\) : de la situation présente **et d'une action**, prédire la situation future.

Regardez ce qui a changé entre les deux lignes : on a ajouté **une action, et du temps**. C'est tout. Et cet ajout change tout : on passe d'une IA qui **étiquette le présent** à une IA qui **se représente le monde pour anticiper et agir**.

*(Réserve Q&A si un profil technique creuse : la formulation complète — POMDP, croyance, modèle de transition, récompense, politique — est dans la masterclass, module 1, et la fiche Q&A n°4.)*

Voyons comment, concrètement, on construit une telle machine.

---

## SÉQUENCE 3 · Comment une machine apprend à imaginer *(≈ 9 min · cumul 9:00 → 18:00)*

Trois idées suffisent pour tout comprendre. Trois verbes : **compresser**, **rêver**, **planifier**.

### 3.1 — Compresser : le plan du métro

Un modèle du monde commence toujours par **compresser**. Quand vous entrez dans cette salle, vous ne mémorisez pas chaque pli de tissu, chaque reflet. Votre cerveau retient l'essentiel : la sortie est là, la scène est ici, quelqu'un bouge dans l'allée. Une machine fait pareil : elle transforme des images, des sons, en une représentation compacte — les chercheurs parlent d'**espace latent**, retenez simplement : **un résumé orienté vers l'action**.

`» SLIDE : photo détaillée de Paris VS plan du métro`

Et voici l'idée la plus importante de toute cette partie : **une carte n'a pas besoin de ressembler au territoire pour être utile.** Pensez au plan du métro parisien. Il ne respecte pas les distances, il ignore les immeubles, les rues, les arbres, il déforme même la géographie. Mais il garde le nécessaire pour décider — les lignes, les stations, les correspondances. Pour voyager, ce plan faux mais utile vaut mieux qu'une photo satellite parfaite. Un bon modèle du monde, c'est exactement ça : pas une copie fidèle du monde, mais une carte qui conserve ce qui permet d'**anticiper et de décider**.

`» SLIDE : observer → compresser → prédire → planifier → agir`

C'est la chaîne centrale de tout world model : observer, compresser, prédire, planifier, agir.

Imaginez que la machine tient un **carnet**. À chaque instant, elle n'y recopie pas le monde — elle y note, en quelques lignes, ce qui lui servira pour la suite : où sont les choses, à quelle vitesse elles bougent, ce qui risque d'arriver. Tout l'art est là : qu'écrire dans le carnet, et qu'ignorer ?

Et comment la machine sait-elle **ce qui compte** ? Elle ne le « comprend » pas au sens humain : c'est **l'objectif qu'on lui donne qui tranche**. Entraînez-la à reconstruire l'image, elle retient le visible. Entraînez-la à prédire le futur, elle retient ce qui bouge et ce qui va arriver. Entraînez-la à gagner, elle ne retient que ce qui change la décision. **Choisissez l'objectif, et vous avez déjà choisi ce que la machine comprendra.** — Gardez cette phrase : elle reviendra au moment de parler de vos propres projets.

Pensez au grand maître d'échecs : il ne retient ni la couleur du bois, ni les rayures de la table. Il ne voit que les **forces en présence** — qui menace qui, où est le danger, quel coup change la partie. Il ne garde que ce qui compte **pour décider**. Comprendre, c'est savoir **quoi ignorer**.

En 2020, un système appelé **MuZero** a poussé cette logique au bout : on le lâche sur le Go, les échecs, le shogi, des dizaines de jeux — et, détail vertigineux, **on ne lui donne jamais les règles**. Il les devine en jouant, se construit son propre modèle de « ce qui fait gagner », et atteint un niveau **surhumain**. Publié dans *Nature*. Et gardez en tête ce que MuZero a choisi de prédire : ni les pixels, ni une jolie image — juste **la valeur** des situations. Retenez ce choix. Car d'autres ont fait l'inverse — on y vient.

### 3.2 — Rêver : la machine qui s'entraîne dans son imagination

`» SLIDE : split-screen — « réel » à gauche, « le rêve de la machine » à droite`

L'histoire moderne commence en 2018. Deux chercheurs, David Ha et Jürgen Schmidhuber, posent une question un peu folle : et si on entraînait une IA non pas dans le monde réel, mais **dans son propre rêve** ?

Leur recette : une brique **vision** qui résume chaque image en quelques chiffres, une brique **mémoire** qui apprend la suite — « si la voiture est là et que je tourne, où sera-t-elle après ? » — et une toute petite brique **décision**. Puis le tour de magie : on entraîne la décision **à l'intérieur** des images générées par la mémoire. Dans le rêve. Des milliers de tours de course, sans jamais toucher au vrai jeu.

C'est exactement un simulateur de vol dans la tête du pilote : plutôt que de crasher de vrais avions pour apprendre, on s'entraîne dans le simulateur — et ici, le simulateur a été **appris automatiquement** à partir des vraies parties observées.

Apprendre dans son imagination avant d'agir dans le réel : c'est ce que fait le sportif qui rejoue mentalement son geste, le musicien qui entend les notes avant de les jouer. Pour une machine, ça change l'échelle : **une seconde d'expérience réelle peut engendrer des centaines de scénarios imaginés.**

Un piège à connaître dès maintenant — on y reviendra : si le rêve est faux quelque part, la machine apprend à **exploiter les bugs du rêve**, comme un pilote qui découvre que le simulateur autorise de voler à travers les montagnes.

Cette idée de 2018 a été industrialisée par une famille de systèmes appelés **Dreamer**. Et deux résultats vont vous dire où on en est.

`» SLIDE : Minecraft → un diamant`

**Premier résultat.** On lâche DreamerV3 dans Minecraft, ce monde de cubes, avec un défi qui résistait depuis des années : **trouver un diamant**. Pour ça il faut creuser, fabriquer des outils, descendre dans des grottes, survivre : des centaines d'actions, et une récompense qui n'arrive qu'à la toute fin. Une aiguille au fond d'une mine. DreamerV3 y arrive **à partir de zéro, sans aucune démonstration humaine**, en s'entraînant dans son imagination. Publié dans *Nature*, en 2025.

**Deuxième résultat — et celui-là quitte l'écran.** La même idée, posée sur un **vrai robot quadrupède** qui ne sait pas marcher. D'habitude : des jours d'essais, et de la casse. Là, il agit un peu, il **rêve** beaucoup, il recommence — et il apprend à marcher en **une heure**, dans le monde réel, sans simulateur (les travaux *DayDreamer*, 2022). Une heure. Retenez ce chiffre pour la suite : c'est ce que « apprendre en imagination » change en termes de coût, de délai et de casse.

### 3.3 — Planifier : comparer des futurs avant d'agir

Revenons au verre — mais côté machine. Supposons qu'un robot doive le saisir. Avant de bouger, il peut **simuler dans sa tête** plusieurs trajectoires de son bras. Dans la première, sa main passe trop haut. Dans la deuxième, elle percute le verre. Dans la troisième, elle le saisit proprement. Le robot compare ces futurs imaginés, retient le meilleur, et **seulement alors** il agit.

C'est ça, planifier dans un modèle du monde : imaginer plusieurs futurs, les comparer, puis choisir. Deux philosophies cohabitent — apprendre un **réflexe** à l'entraînement puis agir vite, ou **réfléchir au moment de décider** en déroulant les futurs — et les systèmes modernes combinent les deux.

Planifier, c'est rendre le choix **explicite** : dérouler plusieurs avenirs, et décider lequel on va tenter de faire advenir. Gardez cette image — un agent qui compare des futurs imaginés — parce qu'elle pose, en creux, toute la question de la confiance : *et si le futur qu'il préfère était celui où son modèle se trompe le plus ?*

*(Réserve Q&A / masterclass : l'anatomie complète — espace latent, VAE, RSSM, MDN-RNN, acteur-critique, λ-returns, MCTS vs MPC, gradient analytique « à travers le rêve » — est dans la masterclass, modules 2 à 5.)*

---

## SÉQUENCE 4 · Les beaux menteurs — que prédit-elle, au juste ? *(≈ 6 min · cumul 18:00 → 24:00)*

`» SLIDE : un triptyque — VALEUR · PIXELS · REPRÉSENTATION`

Nous tenons maintenant le fil promis au début. Tous les world models répondent à la même question — « comment le monde va-t-il évoluer si j'agis ? » — mais ils divergent radicalement sur **ce qu'ils prédisent**. Et de ce choix découle presque tout : leurs forces, leurs pièges, et la question de la confiance. Trois familles.

**Première famille — prédire la valeur.** C'est MuZero, c'est Dreamer : un modèle n'a de valeur que s'il améliore la décision. Tout le reste — fidélité visuelle, réalisme physique — est un moyen, pas une fin. On y prédit des conséquences abstraites, parfois sans jamais reconstruire une seule image.

**Deuxième famille — prédire les pixels.** C'est l'ambition la plus spectaculaire, et la plus médiatique : générer directement l'image future.

`» SLIDE : un très beau plan vidéo généré (rue de Tokyo sous la pluie)`

Vous tapez « une rue de Tokyo sous la pluie, la nuit » et apparaît une vidéo sublime, cinématographique. L'entreprise qui a créé le plus célèbre de ces systèmes l'a sous-titré, noir sur blanc, « **simulateur du monde** ». Et la barre monte vite : des systèmes comme **Genie** génèrent désormais des mondes **interactifs en temps réel** — vous vous déplacez dedans, à 24 images par seconde. D'autres, comme **Cosmos**, sont pensés pour fabriquer des **données synthétiques** pour la robotique et la voiture autonome. C'est impressionnant, et c'est utile. On y revient.

**Troisième famille — prédire la représentation.** C'est la voie la plus discrète, et peut-être la plus profonde. Son idée : ne prédire ni la valeur ni les pixels, mais directement **le résumé chargé de sens** de la scène future — le carnet, pas la photo. C'est le pari de Yann LeCun et de son architecture **JEPA** : pour comprendre, une machine n'a pas besoin de peindre chaque détail — elle doit pouvoir **jeter ce qui est imprévisible** (le scintillement d'un reflet) et ne garder que la structure qui se prédit.

Trois familles, trois réponses à notre question-fil. Et maintenant, la question qui pique : laquelle *comprend* le monde ?

`» SLIDE : exemples d'erreurs — flamme figée / objet qui apparaît / chaise qui flotte`

Revenons aux vidéos sublimes. Regardons-les de près. On souffle sur une bougie : la flamme ne bouge pas. Une chaise se met à flotter. Un objet apparaît de nulle part en plein cadre. Une main traverse une surface. Et l'entreprise elle-même l'a reconnu : son système **ne modélise pas correctement la physique** de beaucoup d'interactions de base — le verre qui se brise, par exemple.

**Réalisme n'est pas compréhension.**

Cette machine ne *simule* pas le monde. Elle le *peint*. Comme un peintre de génie qui n'aurait jamais étudié la physique : ses toiles sont si vivantes qu'on les croit vraies — mais demandez-lui où le verre va retomber, et il **invente** une trajectoire plausible. **Beau n'est pas vrai.**

Une IA qui génère une balle qui tombe a appris une *régularité visuelle* — « dans les vidéos, les balles vont vers le bas » — pas une *théorie de la gravitation*. La différence se révèle dès qu'on sort des sentiers battus : balle aimantée, sous l'eau, collision rare → le monde intérieur se fissure.

Et ce n'est pas une querelle d'experts : c'est devenu un **débat scientifique structurant**. D'un côté, « générons des images toujours plus parfaites, la compréhension finira par émerger ». De l'autre, l'un des pères de l'IA moderne : « prédire chaque pixel est une impasse ; pour comprendre, une machine n'a pas besoin de *peindre* chaque détail, mais d'en *saisir le sens* ». Pour raconter un film à un ami, vous ne récitez pas chaque image — vous transmettez le sens des scènes.

La vraie question n'est donc pas : *l'image est-elle belle ?* C'est : **la machine a-t-elle compris ce qui se passe ?** — autrement dit, toujours la même : *que prédit-elle, et pour quoi faire ?*

---

## SÉQUENCE 5 · Pourquoi maintenant — où va l'argent *(≈ 5 min · cumul 24:00 → 29:00)*

Vous vous demandez peut-être : tout ça est-il un sujet de laboratoire, ou un sujet pour votre prochain plan stratégique ? Regardons où va l'argent — et qui bouge.

`» SLIDE : frise 1991 → 2026 (Dyna · World Models 2018 · Dreamer/MuZero · Sora/Genie · JEPA · AMI Labs)`

- **Mars 2026, Paris.** Yann LeCun — prix Turing, l'un des trois « parrains » de l'IA moderne — quitte Meta et lance **AMI Labs**, un laboratoire dédié aux world models. Levée : **plus d'un milliard de dollars**, le plus grand tour d'amorçage de l'histoire européenne, devant Mistral. Quand un des pères du deep learning parie sa fin de carrière — et que Bezos, Schmidt et Niel co-investissent — ce n'est plus un sujet de niche.
- **Google DeepMind** a sorti **Genie 3** : des mondes 3D interactifs générés en temps réel, dans lesquels on entraîne déjà des agents.
- **NVIDIA** a lancé **Cosmos** : une plateforme de world models « fondation » pour l'IA physique — données synthétiques pour la robotique et le véhicule autonome.
- **Fei-Fei Li** — la chercheuse à l'origine d'ImageNet, qui a déclenché la décennie de la reconnaissance d'images — a fondé **World Labs** sur le même pari.

Autrement dit : **les personnes mêmes qui ont lancé la vague précédente de l'IA investissent massivement dans celle-ci.** Les trois familles que je vous ai montrées, longtemps séparées, convergent : les mondes générés deviennent des **terrains d'entraînement** pour des agents ; les modèles de représentation atteignent la **planification robotique du premier coup**, sans entraînement spécifique ; le paradigme de l'imagination passe à l'échelle sur d'immenses archives de données enregistrées.

La question de frontière n'est plus « peut-on générer du beau ? » — c'est résolu. C'est : **peut-on être à la fois un grand peintre et un bon physicien ?** Les architectures hybrides qui émergent parient que oui. Mais — et c'est l'honnêteté du moment — même les systèmes les plus avancés vivent encore sous ce que les chercheurs appellent le **paradoxe de la fiabilité** : un monde appris peut **démontrer** qu'un agent échoue ; il ne peut pas encore **garantir** qu'il réussira. Retenez cette asymétrie : dans dix minutes, elle devient votre principe de gouvernance.

Une précision de calendrier, pour éviter deux erreurs symétriques : ce n'est **ni de la science-fiction, ni du plug-and-play**. Les premiers usages sont déjà en production — j'y viens tout de suite — mais les applications industrielles massives se joueront sur les prochaines années. La fenêtre, pour vous, c'est **maintenant** : comprendre, cartographier vos cas d'usage, expérimenter — avant que le sujet ne devienne aussi encombré que l'IA générative l'est aujourd'hui.

---

## SÉQUENCE 6 · Ce que ça change pour vous *(≈ 8 min · cumul 29:00 → 37:00)*

Pourquoi tout cela devrait intéresser une entreprise, un dirigeant, un décideur public ? Parce que cette technologie transforme la notion même de **simulation**.

Pendant des décennies, pour simuler une usine, un véhicule, un robot, il fallait **programmer les règles** : décrire la géométrie, les forces, les contraintes. Les world models proposent une autre voie — **apprendre les régularités directement à partir des données** : vidéos, trajectoires, capteurs, actions passées. Quatre usages concrets, du plus mûr au plus prospectif — et pour chacun, la question à poser à vos équipes.

`» SLIDE : 4 cas d'usage, 4 questions`

**Cas 1 — Fabriquer les scénarios rares qu'on ne peut pas collecter.** Un chiffre pour mesurer l'enjeu : aux États-Unis, il y a en moyenne un accident tous les ~535 000 km — et seulement 0,064 % impliquent une collision avec un arbre. Comment apprendre à une voiture à éviter un arbre si l'événement est introuvable dans les données ? On le **génère**. C'est exactement l'usage des systèmes comme GAIA (Wayve) dans la conduite ou Cosmos (NVIDIA) en robotique : peupler la **longue traîne** — l'enfant qui surgit, la pièce qui casse d'une façon inhabituelle, le capteur qui lâche. Transposez à votre métier : vos incidents graves sont, par définition, rares dans vos données. *Question pour vos équipes : quels sont nos événements rares et critiques, et combien nous coûte aujourd'hui le fait de ne pas pouvoir les répéter ?*

**Cas 2 — Le jumeau numérique qui s'apprend au lieu de se programmer.** Un simulateur classique de ligne de production ou de chaîne logistique coûte des mois d'ingénierie et se périme dès que le réel change. Un monde appris se construit à partir de vos historiques — capteurs, flux, vidéos — et se met à jour avec eux. On peut alors tester virtuellement une trajectoire de robot, explorer des configurations industrielles, jouer des variantes d'organisation avant de toucher au réel. *Question pour vos équipes : où payons-nous aujourd'hui des simulations écrites à la main — et quelles données dormantes pourraient nourrir un modèle appris ?*

**Cas 3 — Entraîner des agents en imagination : diviser le coût d'apprentissage.** Rappelez-vous le robot qui apprend à marcher en une heure. La logique vaut pour tout système qui apprend par essai-erreur : chaque essai réel coûte — du temps machine, de la casse, du risque. Si une seconde de réel engendre des centaines de scénarios imaginés, l'économique de l'apprentissage change d'ordre de grandeur : robotique d'entrepôt, pilotage énergétique, process industriels. *Question pour vos équipes : dans nos opérations, où l'essai-erreur réel est-il si coûteux qu'on n'ose pas optimiser ?*

**Cas 4 — Éprouver les systèmes avant de leur faire confiance.** Le plus contre-intuitif, et peut-être le plus précieux : on se sert du rêve pour **tester**, pas pour piloter. Dans l'automobile, les mondes appris servent aujourd'hui **en amont** — générer des milliers de situations adverses pour éprouver le système de conduite — et non comme cerveau temps réel certifié. Un scénario imaginé peut **disqualifier** un système : montrer qu'il échoue. C'est déjà énorme : c'est un banc d'essai infini. *Question pour vos équipes : nos systèmes critiques — IA ou pas — contre quoi sont-ils réellement éprouvés aujourd'hui ?*

`» SLIDE : « accélérer » ≠ « valider »`

Mais — et c'est le point que je veux que vous reteniez si vous ne deviez retenir qu'une ligne de cette séquence — **il ne faut jamais confondre accélération et validation.** Un modèle génératif peut **proposer** ; il ne doit pas automatiquement **certifier**. Une vidéo crédible ne remplace pas un calcul de sûreté. Un monde appris ne remplace pas un simulateur physique validé. Et une décision imaginée ne doit jamais devenir une décision réelle sans contrôle — surtout quand des vies, des infrastructures ou des droits sont en jeu.

Il y a là une asymétrie qui mérite de devenir un principe de gouvernance : un monde simulé imparfait ne peut pas **garantir** qu'un agent réussira dans le réel — mais il peut **démontrer** qu'il échoue. On ne peut pas s'en servir pour signer un blanc-seing ; on peut s'en servir pour disqualifier. C'est déjà beaucoup, et c'est la bonne manière de l'utiliser. Et notez que le régulateur arrive sur ce terrain : l'AI Act européen impose dès août 2026 ses obligations aux systèmes à haut risque — la question « qui a validé ce que la machine a imaginé ? » va devenir une question de conformité, pas seulement de prudence.

---

## SÉQUENCE 7 · La carte n'est pas le territoire — les limites *(≈ 5 min · cumul 37:00 → 42:00)*

Pour décider en confiance, il faut connaître les murs. Il y en a trois, et ce ne sont pas des détails d'ingénierie : ce sont des **limites de principe**.

**1) L'erreur qui s'accumule.** Quand la machine imagine trop loin, ses erreurs se composent. Elle se trompe un peu sur la position d'un objet ; elle réutilise cette position fausse pour prédire la suite, un peu plus fausse ; et ainsi de suite. C'est recopier une photocopie d'une photocopie : chaque copie semble acceptable, mais après vingt générations, l'essentiel a disparu. Le rêve dérive. C'est pourquoi ces machines imaginent **à horizon court**.

**2) Corrélation n'est pas causalité.** Un modèle nourri de vidéos apprend « ce qui suit quoi », pas toujours « ce qui cause quoi ». Le baromètre chute avant la tempête — mais bouger l'aiguille du baromètre ne déclenche pas la tempête. Or agir, c'est intervenir : une machine qui n'a fait que *regarder* le monde peut confondre les deux, et ses prédictions se brisent précisément au moment où on agit.

**3) L'imprévu, la longue traîne.** Un événement peut être très rare et pourtant décisif : l'enfant qui surgit entre deux voitures, la pièce qui se rompt d'une façon inhabituelle, le capteur qui lâche au mauvais moment. Or les modèles apprennent surtout ce qu'ils rencontrent souvent ; ils deviennent excellents à représenter la **normalité**. Mais la sécurité se joue précisément dans l'**anormalité**. Le futur le plus probable n'est pas le futur qu'il faut le plus surveiller.

Et il y a un risque plus subtil que tous les autres — je vous l'ai promis tout à l'heure. Quand on entraîne un agent dans un monde simulé, il peut découvrir non pas une stratégie réellement intelligente… mais une **faille de la simulation**. Le pilote qui comprend qu'en traversant un mur virtuel, il gagne la course. Dans le simulateur, stratégie excellente. Dans le réel, catastrophe. L'agent a appris à réussir dans son imagination, pas dans la réalité.

C'est pourquoi un bon modèle du monde ne doit pas seulement imaginer. Il doit aussi savoir **douter** : estimer « ici mes prédictions sont fiables », ou au contraire « je n'ai jamais vu cette situation, plusieurs futurs sont possibles ». La grande question de la recherche n'est pas seulement *comment construire une machine capable d'imaginer ?* — mais : **comment construire une machine capable de reconnaître les limites de son imagination ?**

Idée unificatrice, à rapporter dans vos comités : **la carte n'est pas le territoire.** Un modèle, aussi impressionnant soit-il, n'est jamais le monde. C'est une carte, dessinée par la machine — très utile, et parfois fausse.

---

## SÉQUENCE 8 · Clôture — qui vérifie le rêve ? *(≈ 3 min · cumul 42:00 → 45:00)*

`[Revenir vers le verre.]`

Depuis le début, ce verre n'est pas tombé. Vous avez pourtant imaginé sa chute. Votre expérience du monde vous a permis de prévoir une conséquence avant qu'elle arrive. Et pourtant — regardez : **ce verre est collé à la table.** Il l'était depuis le début. Votre modèle du monde ignorait ce détail que vous ne pouviez pas voir, et le futur que vous aviez si tranquillement simulé n'arrivera jamais.

Un modèle du monde ne voit donc pas le futur. Il **construit des futurs possibles** à partir de son passé. Et toute la question est là : quels futurs est-il capable d'imaginer ? Lesquels oublie-t-il ? Et jusqu'où sommes-nous prêts à le laisser agir sur la base de ses propres projections ?

Car voilà ce qui change tout. Ces machines ne se contentent plus de **regarder** le monde. Elles commencent à **agir** dedans — conduire, piloter des robots, décider. Et quand elles décident, elles ne décident jamais d'après la réalité. Elles décident d'après **leur carte**. D'après ce qu'elles imaginent. Exactement comme vous, tout à l'heure, avec ce verre : nous n'agissons jamais sur le monde directement, nous agissons sur l'**image** que nous nous en faisons.

Alors la vraie question — celle que nous devrons tous nous poser, citoyens, dirigeants, ingénieurs, parents — n'est pas *« est-ce que la machine est intelligente ? »*. C'est : **« quand une machine décide d'après ce qu'elle imagine, qui vérifie que son rêve dit vrai ? »**

À distinguer la machine qui **comprend** de celle qui **peint**. À regarder derrière la beauté de l'image et à demander : *et la physique ? et la cause ? et l'imprévu ?*

Et pour que cette soirée serve à quelque chose dès lundi matin, je vous laisse trois questions à poser à vos équipes :

`» SLIDE : les 3 questions du lundi matin`

1. **Où payons-nous aujourd'hui des simulations programmées à la main** — et quelles données dormantes pourraient nourrir un monde appris ?
2. **Quels sont nos événements rares et critiques** que nous ne savons ni collecter ni répéter — et que pourrions-nous générer pour nous y préparer ?
3. **Qui, chez nous, vérifierait le rêve ?** Quel processus valide ce qu'une machine a imaginé, avant qu'une décision réelle en découle ?

La machine a appris à rêver pour agir.

À nous de rester **éveillés**. Et de vérifier qu'elle ne prend pas ses rêves pour la réalité.

---
---

## ANNEXE RÉGIE — où est passé le reste ?

Aucune information du brouillon d'origine n'a été supprimée. Répartition :

| Contenu d'origine | Nouvel emplacement |
|---|---|
| Encadré POMDP (Acte I) — *placeholder « expliquer ce que c'est » résolu* | Masterclass, module 1 |
| Acte II complet : espace latent, VAE, KL (exemple météo), RSSM, rétropropagation, reparamétrisation | Masterclass, module 2 |
| Ha & Schmidhuber « sous le capot » (V-M-C, MDN-RNN, température, Dyna) | Masterclass, module 3 |
| Lignée Dreamer « sous le capot » (rollouts latents, λ-returns, critique/bootstrap, astuces V3, DreamerV4) | Masterclass, module 3 |
| MuZero « sous le capot » (h, g, f, value-equivalence) + planification (MCTS vs MPC, schéma de l'arbre) | Masterclass, module 4 |
| Acte II bis complet : les six révélations + tableau de synthèse | Masterclass, module 5 |
| JEPA « sous le capot », pixels trompeurs, limites formelles (compounding error, do-calculus, aléatorique/épistémique), model exploitation | Masterclass, module 6 |
| Section 7 ter voiture autonome (complète, avec schéma pipeline) | Fiche Q&A n°1 |
| *Placeholder « métaphore du carnet »* | Résolu ici (séquence 3.1) et développé masterclass module 2 |
| *Placeholder « use cases dirigeants »* | Résolu ici (séquence 6) |
| Brouillon original intégral | `90_brouillon_original_archive.md` |
