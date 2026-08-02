# Extension au-delà du physique, éthique & gouvernance

<!-- ============================================================= -->
<!-- RELECTURE PÉDAGOGIQUE — AUCUN PASSAGE SUPPRIMÉ                -->
<!-- Les passages redondants sont regroupés par thème et signalés  -->
<!-- par des balises <font color="...">.                           -->
<!-- Les propositions de formulation unifiée sont dans des balises -->
<!-- <claude> ... </claude>, insérées à l'endroit où la version    -->
<!-- fusionnée aurait naturellement sa place.                      -->
<!-- Le LaTeX (citations, références, nombres) est balisé avec $.  -->
<!-- ============================================================= -->

> **Légende des redondances détectées (8 thèmes)**
>
> | Couleur | Thème redondant | Occurrences |
> |---|---|---|
> | <font color="red">Rouge</font> | Restriction du périmètre social & garde-fou terminologique (« pas les nations / populations ») | §2 (misc.md#34, #33, #35, #37) et §3 (misc.md#36) |
> | <font color="green">Vert</font> | Triade définitoire état / observation / action (transitions, interventions, prédictions) | §1 (misc.md#30, #32) et §2 (misc.md#33, #37) |
> | <font color="blue">Bleu</font> | Boucle prédiction–action incomplète (modèle « agissant ») | §1 (misc.md#31 ×2, #32) |
> | <font color="orange">Orange</font> | Quantifier l'incertitude & documenter les hypothèses | §1 (misc.md#32) et §3 (misc.md#36) |
> | <font color="purple">Violet</font> | Réflexivité / performativité des systèmes sociaux | §2 (misc.md#35 ×2) et §3 (misc.md#36) |
> | <font color="brown">Marron</font> | Caractère préliminaire des résultats (prépublications non répliquées) | §4 et §5 |
> | <font color="magenta">Magenta</font> | Les quatre régimes de lois (physique, numérique, social, scientifique) | §4 et §5 |
> | <font color="teal">Sarcelle</font> | Double usage de la machinerie générative (défense ↔ attaque) | §5 (×2) |

<!-- Réorganisation éditoriale : tous les blocs du fichier source sont conservés ; seuls des intertitres de navigation ont été ajoutés. -->

## 1. Extension au-delà du physique : domaines scientifiques

<!-- source: divers · misc.md#28 -->

### Elargir les World Models au delà des environnements physiques

<!-- source: divers · misc.md#29 -->

La discussion précédente est encore largement confinée à des environnements macroscopiques quotidiens, incluant des scènes, des robots, des véhicules et des objets manipulables. Un agenda de recherche plus large devrait poser la question de savoir si des modèles du monde analogues peuvent être construits pour les domaines scientifiques.

<!-- source: divers · misc.md#30 -->

En chimie, selon la tâche, <font color="green">l'état peut englober des espèces et des structures moléculaires, l'avancement des réactions ainsi que des variables cinétiques ou thermodynamiques pertinentes ; les observations peuvent inclure des spectres, des chromatogrammes ou des rendements mesurés ; et les actions peuvent correspondre à des interventions contrôlées expérimentalement</font>. En biologie, <font color="green">les états pertinents peuvent s'étendre à des réseaux moléculaires, des phénotypes cellulaires, des tissus et des processus à l'échelle de l'organisme, potentiellement par le biais de représentations hiérarchiques ou multi-échelles, tandis que les interventions peuvent impliquer des perturbations génétiques, l'administration de médicaments et d'autres manipulations contrôlées</font>. En astronomie, <font color="green">les états astrophysiques latents sont observés indirectement par le biais d'instruments, alors que la planification peut consister à sélectionner des cibles, des instruments et des programmes d'observation en s'appuyant sur des modèles de dynamique astrophysique et sur des observations dépendantes des instruments</font>.

<!-- source: divers · misc.md#31 -->

Des modèles scientifiques existants illustrent déjà des pans de cette formulation. En météorologie, **GraphCast** apprend un modèle de transition autorégressif sur les états atmosphériques mondiaux et génère des prévisions à moyen terme en répétant de manière itérative la propagation de centaines de variables atmosphériques au fil du temps (Lam et al., 2023a) $\cite{lam2023learning}$. Dans le cadre de notre taxinomie, il peut être interprété comme un simulateur scientifique structuré, <font color="blue">bien qu'il ne constitue pas un modèle du monde agissant, dans la mesure où il ne sélectionne pas d'interventions et ne boucle pas la rétroaction entre prédiction et action</font>. À l'échelle moléculaire, **MDGen** apprend un modèle génératif des trajectoires de dynamique moléculaire et peut être conditionné pour la simulation prospective (*forward*), la génération de chemins de transition et le rééchantillonnage de trajectoires (Jing et al., 2024) $\cite{jing2024generative}$. Il illustre de la même manière un modèle scientifique de dynamique apprise, <font color="blue">sans former pour autant un système complet de planification expérimentale</font>.

<!-- source: divers · misc.md#32 -->

Ces exemples démontrent que les composantes individuelles de la modélisation du monde — à savoir <font color="green">la représentation des états, la propagation temporelle, la génération consciente de l'incertitude et la prédiction conditionnelle</font> — émergent déjà dans divers domaines scientifiques, même si elles n'y sont pas explicitement qualifiées de « modèles du monde ». Dans ces disciplines, un modèle scientifique du monde ne doit pas se borner à générer des mesures plausibles : il doit capturer une structure mécanique ou scientifiquement significative, respecter les contraintes et les invariants physiques connus le cas échéant, <font color="orange">quantifier l'incertitude</font>, prendre en charge des interventions contrefactuelles et aider à sélectionner des expériences informatives ou maximisant l'utilité sous des contraintes pratiques. <font color="blue">Un modèle scientifique agissant complet relierait l'ensemble de ces capacités à une boucle expérimentale au sein de laquelle des hypothèses ou des interventions sont proposées, les résultats sont prédits, les expériences sont menées et l'état interne du modèle est actualisé à la lumière de nouvelles données empiriques.</font>

<claude>
**Formulation unifiée proposée — thème <font color="blue">BLEU</font> (boucle prédiction–action incomplète).**
Ce constat, énoncé séparément pour GraphCast, pour MDGen puis en conclusion, peut être fusionné en une seule idée :
« GraphCast comme MDGen illustrent d'excellents modèles de dynamique apprise, mais ni l'un ni l'autre ne referme la boucle entre prédiction et action : aucun ne sélectionne d'interventions. Un modèle du monde scientifique *agissant* articulerait ces capacités prédictives au sein d'une boucle expérimentale complète — proposer des hypothèses ou des interventions, prédire leurs résultats, mener les expériences, puis actualiser l'état interne du modèle à la lumière des nouvelles données empiriques. »
</claude>

## 2. Modèles sociaux restreints : périmètre et limites

<!-- source: divers · misc.md#34 -->

<font color="red">Avant de procéder, nous soulignons que l'objectif principal de cet article porte sur les modèles du monde physique plutôt que sur les systèmes sociaux. La discussion des domaines sociaux ici est destinée uniquement comme une extension conceptuelle pour clarifier le périmètre et les potentiels limites, et ne doit pas être interprétée comme l'objet d'étude central.</font>

<!-- source: divers · misc.md#33 -->

Une extension encore plus large, et considérablement plus spéculative, concerne les systèmes sociaux limités (Zhou et al., 2025b) $\cite{zhou2025social}$. <font color="red">Nous restreignons cette notion aux systèmes dotés de participants clairement définis, de règles d'interaction, de canaux d'observation, d'espaces d'intervention et d'horizons temporels clairs, tels que de petites équipes, de petites organisations ou des processus institutionnels spécifiquement définis.</font> Ces systèmes peuvent être modélisés comme des processus dynamiques multi-agents partiellement observables. <font color="green">Les variables latentes candidates peuvent inclure les incitations, les croyances, les structures organisationnelles, les contraintes de ressources et les réseaux d'interaction ; les observations peuvent comprendre les communications, les transactions et les traces de performance ; et les interventions peuvent concerner l'allocation des tâches, la redéfinition organisationnelle ou les actions négociées.</font> Dans ces limites, les modèles du monde social pourraient soutenir l'analyse de scénarios pour la coordination d'équipes et les opérations organisationnelles.

<!-- source: divers · misc.md#35 -->

<font color="red">Cette formulation ne saurait être étendue sans réserves aux nations, aux populations ou à la prédiction à l'échelle de la société entière.</font> Les systèmes sociaux à grande échelle sont ouverts, réflexifs, non stationnaires et normativement contestés : <font color="purple">les prédictions et les interventions peuvent altérer le comportement modélisé, les agents peuvent réagir de manière stratégique face au modèle</font>, et différents groupes peuvent poursuivre des objectifs incompatibles. De surcroît, des variables telles que les croyances, les préférences et les intentions ne sont que partiellement observables et peuvent dépendre de postulats théoriques discutables. <font color="purple">Par conséquent, la précision prédictive historique ne garantit pas la fiabilité des effets d'intervention en cas d'évolution des institutions ou de prise de conscience publique de la prédiction.</font>

<!-- source: divers · misc.md#37 -->

<font color="red">Afin d'éviter toute dilution terminologique, l'appellation de « modèle du monde » doit être réservée</font> <font color="green">aux systèmes qui maintiennent une représentation interne de l'état, modélisent les transitions temporelles (et, le cas échéant, conditionnées par les interventions), et génèrent des prédictions testables</font>. <font color="red">Sous réserve de ces restrictions, le cadre bidimensionnel demeure applicable à des domaines sociaux restreints et opérationnellement définis. Un modèle non contraint d'une nation entière ou d'une société ne saurait être considéré comme un modèle du monde du seul fait de son envergure ou de son ambition prédictive.</font>

<claude>
**Formulation unifiée proposée — thème <font color="red">ROUGE</font> (périmètre des modèles sociaux & garde-fou terminologique).**
Ce garde-fou est répété quatre fois (misc.md#34, #33, #35, #37) et réapparaît en §3. Une seule formulation, placée en tête de section, suffit :
« Précisons d'emblée le périmètre : cet ouvrage porte avant tout sur les modèles du monde physique. L'extension aux systèmes sociaux n'est envisagée qu'à titre conceptuel, et uniquement pour des systèmes restreints et opérationnellement définis — petites équipes, organisations ou processus institutionnels dont les participants, les règles d'interaction, les canaux d'observation, les espaces d'intervention et les horizons temporels sont clairement délimités. Cette formulation ne s'étend pas aux nations, aux populations ni à la société entière : ni l'envergure ni l'ambition prédictive ne suffisent à qualifier un système de "modèle du monde". »

**Formulation unifiée proposée — thème <font color="green">VERT</font> (triade définitoire état / observation / action).**
La même structure définitoire est réénoncée en §1 (chimie, biologie, astronomie, misc.md#30 et #32) puis en §2 (misc.md#33 et #37). Elle gagnerait à être posée une seule fois, en amont, comme définition de travail :
« Quel que soit le domaine — chimie, biologie, astronomie ou systèmes sociaux restreints — un modèle du monde se décrit par la même triade : un *état* (éventuellement latent), des *observations* qui ne le révèlent que partiellement, et des *actions* ou interventions qui le modifient. Mérite l'appellation de "modèle du monde" tout système qui maintient une représentation interne de cet état, modélise ses transitions temporelles (le cas échéant conditionnées par les interventions) et produit des prédictions testables. Les exemples par domaine deviennent alors de simples instanciations de cette triade, sans qu'il soit nécessaire de la redéfinir à chaque fois. »
</claude>

## 3. Risques éthiques et gouvernance des modèles sociaux

<!-- source: divers · misc.md#36 -->

Les risques éthiques et de gouvernance sont considérables. L'inférence d'états latents à partir de communications et de traces comportementales risque de favoriser une surveillance intrusive, tandis que des données historiquement biaisées peuvent perpétuer des discriminations ou une allocation inéquitable des risques. <font color="purple">Les sorties du modèle peuvent également devenir performatives lorsqu'elles sont employées pour répartir des opportunités, faire appliquer des politiques ou façonner les comportements, engendrant ainsi des boucles de rétroaction auto-réparatrices ou auto-renforçantes (Perdomo et al., 2020) $\cite{perdomo2020performative}$.</font> Les modèles du monde social doivent par conséquent <font color="orange">expliciter l'incertitude, documenter leurs hypothèses causales et normatives</font>, et être soumis à une protection de la vie privée, à des audits de biais, à des tests de dérivation de distribution (*distribution-shift testing*) ainsi qu'à une supervision humaine. Ils doivent être appréhendés comme des outils bornés d'aide à la décision plutôt que comme des oracles sociaux, et <font color="red">ne sauraient être utilisés pour des prévisions démesurées à l'échelle d'une population, du profilage de masse, d'une gouvernance automatisée ou pour des décisions à fort enjeu concernant des individus et des groupes sociaux</font>.

<claude>
**Formulation unifiée proposée — thème <font color="purple">VIOLET</font> (réflexivité / performativité).**
L'idée « la prédiction modifie ce qu'elle prédit » apparaît deux fois en §2 (misc.md#35) puis à nouveau ici. Une seule formulation, à conserver de préférence en §2 avec un simple renvoi ici :
« Les systèmes sociaux sont réflexifs : la prédiction y modifie ce qu'elle prédit. Les agents peuvent réagir stratégiquement au modèle, et ses sorties deviennent *performatives* dès qu'elles servent à répartir des opportunités, à appliquer des politiques ou à façonner des comportements, engendrant des boucles de rétroaction auto-renforçantes (Perdomo et al., 2020) $\cite{perdomo2020performative}$. C'est pourquoi la précision prédictive historique ne garantit en rien la fiabilité des effets d'intervention. »

**Formulation unifiée proposée — thème <font color="orange">ORANGE</font> (incertitude & hypothèses).**
Exigence énoncée en §1 (misc.md#32) pour le scientifique et ici pour le social ; elle peut être posée une fois, de manière transverse :
« Qu'il soit scientifique ou social, un modèle du monde digne de confiance doit quantifier et expliciter son incertitude, et documenter ses hypothèses — mécanistes et causales dans le cas scientifique, causales et normatives dans le cas social. »
</claude>

## 4. Sécurité des modèles du monde : surface d’attaque

<!-- ===== AJOUT depuis agentic 06/2026 (sections 3+) — À TRADUIRE ===== -->

<!-- source: agentic 06/2026 | Trends \& Open Problems › Security and Safety of World Models -->

L'axe des lois régissantes de l'étude offre un prisme unificateur sur la sécurité des modèles du monde : une faille de sécurité constitue, au fond, une violation de l'une des lois qu'un modèle du monde devrait respecter, <font color="magenta">qu'elle soit physique, numérique, sociale ou scientifique</font> ; et parce que les agents agissent sur la base des trajectoires $\emph{imaginées}$ du modèle, corrompre celui-ci peut se propager aux décisions régies par ces lois qui dépendent de ses trajectoires simulées, faisant du modèle du monde lui-même une surface d'attaque potentiellement à fort effet de levier. $\citet{zeng2024wmsafety}$ passent en revue les modèles du monde sous l'angle de la fiabilité et de la sécurité, tandis que $\citet{li2026embodiedsafety}$ synthétisent plus de 500 travaux en une taxinomie multi-niveaux des attaques adverses, par porte dérobée (*backdoor*) et par contournement (*jailbreak*), ainsi que de leurs défenses, à travers l'ensemble du pipeline incarné. Concrètement, PhysCond-WMA $\citep{guo2026physcond}$ perturbe des entrées de conditions physiques telles que les cartes HD et les caractéristiques de boîtes 3D d'un modèle du monde de conduite, atteignant un taux de réussite d'attaque ciblée rapporté de $55\,\%$ tout en préservant la fidélité perceptuelle ; CtrlAttack $\citep{xu2026ctrlattack}$ injecte un champ de vitesse de faible dimension dans les dynamiques de diffusion image-vers-vidéo, avec un taux de réussite d'attaque élevé aussi bien en boîte blanche qu'en boîte noire ; et la porte dérobée TRAP $\citep{duan2026trap}$ réordonne quelques trajectoires imaginées critiques pour la décision afin de détourner la planification sur DreamerV3 et TD-MPC2 tout en laissant les entrées saines intactes, WMAttack $\citep{guo2026wmattack}$ automatisant une telle évaluation adverse sous la forme d'une recherche d'attaque à budget fini. <font color="brown">Ces études d'attaque sont des prépublications récentes émanant d'un petit ensemble de groupes d'auteurs se recoupant, dont les résultats attendent encore une réplication indépendante</font> ; des sondages analogues ciblent le régime social au moyen de tests de résistance adverses de théorie de l'esprit et de persona $\citep{sclar2024exploretom,samuel2024personagym}$, et JailWAM $\citep{liu2026jailwam}$ contourne les modèles monde-action dans le contrôle robotique (un taux de réussite d'attaque de $84{,}2\,\%$ sur LingBot-VA), où une brèche numérique s'étend à la sécurité personnelle, matérielle et environnementale que son benchmark associé JailWAM-Bench est conçu pour quantifier, la forte capacité d'interaction physique constituant elle-même un puissant levier d'attaque.

## 5. Défenses, vérification et gouvernance L3

<!-- source: agentic 06/2026 | Trends \& Open Problems › Security and Safety of World Models -->

Sur le plan défensif, <font color="teal">cette même machinerie générative est à double usage</font> : SafeDream $\citep{yan2026safedream}$ fait tourner un modèle du monde léger d'état de sécurité qui imagine de façon contrastive des futurs relevant de l'attaque ou de la bénignité afin de signaler les contournements multi-tours avant que le modèle ne s'y conforme, tandis que CounterScene $\citep{jing2026counterscene}$ utilise un modèle du monde contrefactuel en vue en plongée (*BEV*) pour faire émerger des scénarios de conduite critiques pour la sécurité (faisant passer le taux de collision à long horizon de $12{,}3\,\%$ à $22{,}7\,\%$ par rapport à la référence la plus forte) — <font color="teal">la même machinerie pouvant tout aussi bien fabriquer des cas adverses</font>. Ces moniteurs et générateurs complètent une application plus stricte de contraintes au moment de l'inférence, des couches symboliques et des portes de vérification qui rejettent les trajectoires simulées enfreignant les lois avant qu'elles n'atteignent un planificateur, et se rattachent à la gouvernance de niveau L3 (Section $\ref{subsec:l3_context}$), où des boucles de révision ingérant des preuves construites de manière adverse menacent la loi scientifique par contamination des connaissances. <font color="brown">Globalement, l'évaluation de la sécurité des agents modèles du monde demeure naissante et repose en grande partie sur des prépublications non encore évaluées par les pairs ; les chiffres rapportés doivent donc être lus comme préliminaires.</font> Les progrès nécessiteront des modèles de menace et des benchmarks spécifiques à chaque régime plutôt qu'une notion unique de robustesse supposée valoir uniformément <font color="magenta">à travers les régimes physique, numérique, social et scientifique, qui échouent chacun de manière distincte</font>.

<claude>
**Formulation unifiée proposée — thème <font color="brown">MARRON</font> (caractère préliminaire des résultats).**
La mise en garde apparaît au milieu du §4 puis à nouveau au §5. Une seule occurrence, en clôture des deux sections sécurité, est plus efficace :
« Une mise en garde vaut pour l'ensemble de cette littérature de sécurité : il s'agit pour l'essentiel de prépublications récentes, non encore évaluées par les pairs et émanant d'un petit nombre de groupes d'auteurs qui se recoupent. Les taux de réussite d'attaque et autres chiffres rapportés doivent donc être lus comme préliminaires, dans l'attente de réplications indépendantes. »

**Formulation unifiée proposée — thème <font color="magenta">MAGENTA</font> (les quatre régimes de lois).**
L'énumération « physique, numérique, social, scientifique » ouvre le §4 et referme le §5. À poser une fois en ouverture, puis à rappeler par un simple « les quatre régimes » :
« La sécurité des modèles du monde se décline selon quatre régimes de lois — physique, numérique, social et scientifique — qui échouent chacun de manière distincte et appellent des modèles de menace et des benchmarks spécifiques, plutôt qu'une notion unique de robustesse. »

**Formulation unifiée proposée — thème <font color="teal">SARCELLE</font> (double usage de la machinerie générative).**
L'idée est énoncée deux fois dans le même paragraphe ; une seule phrase-cadre suffit :
« La machinerie générative des modèles du monde est intrinsèquement à double usage : la capacité à imaginer des futurs sert aussi bien à faire émerger des scénarios critiques pour la sécurité (SafeDream, CounterScene) qu'à fabriquer des cas adverses. »
</claude>
