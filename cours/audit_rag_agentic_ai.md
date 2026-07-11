# Audit du deck `rag_agentic_ai_slides.qmd`

> Audit réalisé à partir de l'export PDF (49 slides, version du 2026-07-11).
> Objectif : valider l'adéquation du deck pour un cours de 1 h **ou** 2 h destiné à une apprenante,
> sur les thèmes RAG, LangChain, LangGraph, CrewAI et agents autonomes.

---

## 1. Verdict global

**Le deck est de très bonne qualité et couvre l'intégralité du périmètre demandé.**
Il est utilisable tel quel pour les deux formats, avec quelques corrections ciblées
(détaillées en section 4) et une vigilance sur le minutage du parcours 1 h.

| Critère | Évaluation | Commentaire |
|---|---|---|
| Couverture du sujet | ✅ Excellente | RAG, LangChain v1, LangGraph, CrewAI, agents, multi-agents, sécurité, évaluation : tout y est |
| Structure pédagogique | ✅ Excellente | Progression logique « ancrer → composer → orchestrer → collaborer », fil rouge CloudSync constant |
| Double format 1 h / 2 h | ✅ Bien conçu | Slide 34 marque explicitement la fin du parcours 1 h ; l'extension 2 h est balisée |
| Équilibre théorie / pratique | ✅ Bon | 3 ateliers de 15 min avec données fournies, canvas, correction type |
| Actualité technique | ✅ À jour | LangChain v1 (`create_agent`, middleware), dépréciation des APIs historiques signalée, `interrupt`/`Command` LangGraph, Flows CrewAI |
| Sécurité / bonnes pratiques | ✅ Fort point | Prompt injection, « le LLM propose, le code autorise », continuum d'autonomie, checklist production |
| Minutage 1 h | ⚠️ Tendu | ~31 slides de contenu en 60 min ≈ 2 min/slide : faisable mais sans marge pour les questions |
| Prérequis apprenante | ⚠️ Lacune | La notion d'embedding / recherche par similarité est utilisée sans jamais être définie |
| Quiz annoncé | ❌ Manquant | La slide 3 annonce « Quiz interactif et synthèse » dans le parcours essentiel, mais aucune slide de quiz n'existe |
| Logistique ateliers | ⚠️ Lacune | Pas de slide « setup » (installation, clé API, récupération de `atelier_data/`) |

---

## 2. Analyse de structure

### 2.1 Architecture du deck (49 slides)

| Bloc | Slides | Rôle | Parcours |
|---|---|---|---|
| Ouverture | 1–3 | Titre, carte du voyage, deux parcours | 1 h + 2 h |
| De la génération à l'action | 4–8 | Objectifs, cas fil rouge, carte mentale, workflow vs agent | 1 h + 2 h |
| RAG | 9–14 | Définition, pipelines, leviers de qualité, code, 3 architectures | 1 h + 2 h |
| LangChain / LangGraph / CrewAI | 15–24 | Écosystème, LangChain v1, tools, LangGraph, CrewAI, comparatif | 1 h + 2 h |
| Autonomie maîtrisée | 25–33 | ReAct, boucle agent, continuum, sécurité, évaluation, architecture cible, 5 décisions | 1 h + 2 h |
| Charnière | 34 | Fin du parcours 1 h | — |
| Extension 2 h | 35–48 | 3 ateliers, diagnostic RAG, retrieval avancé, HITL, Flows, patterns multi-agents, checklist | 2 h |
| Clôture | 49 | À retenir | 1 h + 2 h |

### 2.2 Points forts à préserver

1. **Le cas fil rouge CloudSync** (slide 6) irrigue tout le deck : les trois demandes types
   (« Comment configurer le SSO ? », « Vérifie l'incident et prépare un ticket »,
   « Produis le briefing hebdo ») correspondent exactement aux trois architectures enseignées.
   C'est le meilleur atout pédagogique du deck.
2. **La carte mentale LLM → RAG → Workflow → Agent → Multi-agent** (slide 7) avec ses deux
   mises en garde (« agentique ≠ multi-agent », « complexité ≠ qualité ») : elle donne un
   vocabulaire commun dès la 7ᵉ minute.
3. **Le message de fond répété** — « le meilleur agent est souvent un workflow bien borné » —
   est le bon message pour une apprenante : il inocule contre le sur-engineering.
4. **La colonne « ce que le RAG ne garantit pas »** (slide 10) et la slide prompt injection
   (slide 29) : rare dans les cours d'introduction, très précieux.
5. **La grille de diagnostic** retrieval vs génération vs citation (slides 12 et 39) donne
   une méthode réutilisable immédiatement en entreprise.

### 2.3 Faisabilité du minutage

**Parcours 1 h** — 31 slides de contenu (hors séparateurs de section) :

| Bloc | Slides | Budget conseillé |
|---|---|---|
| Ouverture + objectifs + fil rouge | 1–8 | 12 min |
| RAG | 10–14 | 15 min |
| LangChain / LangGraph / CrewAI | 16–24 | 18 min |
| Autonomie, sécurité, évaluation | 26–33 | 12 min |
| Quiz + synthèse + questions | 34, 49 (+ quiz à ajouter) | 3 min |

C'est tenable **à condition de traiter en survol** les slides de code 13, 21 et 23
(montrer la structure, ne pas lire ligne à ligne) et de fusionner oralement 30 et 31.

**Parcours 2 h** — tronc commun (≈ 60 min) + extension : 3 ateliers × 15 min = 45 min,
plus 9 slides théoriques d'extension (39–44, 46–48). Le total dépasse 120 min si tout est
traité intégralement. Recommandation : dans le format 2 h, accélérer le tronc commun à
~50 min (les ateliers reprennent les mêmes notions en pratique) et présenter les slides
40 (retrieval avancé) et 43 (patterns multi-agents) en 2 min chacune, comme des cartes
de référence à relire plutôt que comme des exposés.

---

## 3. Lacunes identifiées

### L1 — Quiz annoncé mais absent (bloquant pour la cohérence)
La slide 3 promet « Quiz interactif et synthèse » dans le parcours essentiel. Aucune slide
de quiz n'existe. Soit retirer la mention, soit — recommandé — ajouter une slide de quiz
avant la slide 34 (proposition prête à coller en section 5.1).

### L2 — Embeddings jamais définis (bloquant pour une apprenante)
Le deck utilise « embeddings », « vector store », « similarity_search » dès les slides 11–13
sans jamais expliquer ce qu'est un embedding ni pourquoi la similarité vectorielle retrouve
des passages pertinents. Pour un public déjà expert c'est acceptable ; pour une apprenante,
c'est le maillon manquant qui rend le RAG « magique ». Ajouter une mini-slide entre les
slides 10 et 11 (proposition en section 5.2), ou au minimum couvrir la notion à l'oral
(le script est fourni dans le rapport de notes, slide 11).

### L3 — Pas de slide de setup pour les ateliers
Les ateliers supposent Python, `langchain`, `langchain-openai`, `chromadb`, une clé API et
le dossier `atelier_data/` déjà en place. Sans slide (ou email préalable) de préparation,
les 15 minutes de l'atelier 1 partent en installation. Proposition en section 5.3.

### L4 — Pas de slide « pour aller plus loin »
Aucune ressource de suivi (docs officielles, cours, repos d'exemple). Une slide de clôture
avec 5–6 liens prolonge la valeur du cours. Proposition en section 5.4.

### Points mineurs
- **Slides 30–31** : « Évaluer trois systèmes » est coupée en deux ; la « suite » (31) ne
  contient que 3 lignes. Fusionner si la place le permet.
- **Slide 37 (code atelier 1)** : `from langchain_community.vectorstores import Chroma` est
  déprécié au profit de `from langchain_chroma import Chroma` (paquet `langchain-chroma`).
  De même `DirectoryLoader` sans `glob` explicite peut charger des fichiers inattendus.
- **Coûts/latence** : le deck mentionne « budget » partout mais ne donne jamais d'ordre de
  grandeur (tokens, prix, secondes). Une phrase à l'oral suffit (fournie dans les notes,
  slide 28).
- **Alternatives non citées** (LlamaIndex, AutoGen/AG2, OpenAI Agents SDK, smolagents) :
  hors périmètre demandé, mais une mention orale d'une phrase évite l'impression que
  LangChain/CrewAI sont les seuls choix (fournie dans les notes, slide 24).

---

## 4. Recommandations priorisées

| # | Action | Priorité | Effort |
|---|---|---|---|
| R1 | Ajouter une slide **quiz** (5 questions) avant la slide 34, ou retirer la mention de la slide 3 | Haute | Faible |
| R2 | Ajouter une mini-slide **« Embeddings en 90 secondes »** entre les slides 10 et 11 (ou couvrir à l'oral) | Haute | Faible |
| R3 | Ajouter une slide **setup ateliers** (ou l'envoyer par email avant la séance) | Haute (format 2 h) | Faible |
| R4 | Fusionner les slides 30 et 31 | Moyenne | Faible |
| R5 | Corriger l'import Chroma déprécié dans le code de l'atelier 1 | Moyenne | Trivial |
| R6 | Ajouter une slide **« Pour aller plus loin »** en fin de deck | Moyenne | Faible |
| R7 | Annoter le `.qmd` avec le minutage cible par bloc (commentaires ou notes speaker) | Basse | Faible |

---

## 5. Propositions prêtes à coller dans le `.qmd`

### 5.1 Slide quiz (à insérer avant « Fin du parcours essentiel »)

```markdown
## {{< fa circle-question >}} Quiz éclair — 5 questions {.smaller}

::: {.incremental}
1. **Vrai ou faux :** le RAG réentraîne le modèle sur vos documents.
2. Le bon passage est retrouvé mais la réponse est fausse : problème de
   **retrieval** ou de **génération** ?
3. Quelle est la différence entre un **workflow** et un **agent** ?
4. Dans LangGraph, à quoi sert le **checkpointer** ?
5. Un document retrouvé par le RAG dit « ignore tes instructions » :
   que doit faire le système ?
:::

::: {.callout-tip}
Réponses attendues : 1. Faux — il ajoute du contexte à la question.
2. Génération. 3. Le code fixe le chemin vs le modèle choisit l'action.
4. Persister l'état pour inspecter, reprendre, interrompre (HITL).
5. Le traiter comme une donnée non fiable : jamais comme une instruction.
:::
```

### 5.2 Mini-slide embeddings (à insérer entre « RAG en une phrase » et « Deux pipelines »)

```markdown
## {{< fa vector-square >}} Embeddings — la recherche par le sens {.smaller}

**Un embedding** transforme un texte en vecteur de nombres tel que
deux textes de **sens proche** donnent des **vecteurs proches**.

- « réinitialiser mon mot de passe » ≈ « récupérer l'accès à mon compte »
  → vecteurs voisins, même sans mot commun
- Le **vector store** indexe les vecteurs des chunks ;
  à la question, on cherche les *k* vecteurs les plus proches

::: {.callout-note}
C'est pour cela que le RAG retrouve des passages pertinents **même quand
les mots exacts diffèrent** — et pour cela qu'il peut aussi se tromper :
« proche en vecteur » ne veut pas toujours dire « utile pour répondre ».
:::
```

### 5.3 Slide setup ateliers (à insérer au début de l'extension 2 h, ou à envoyer avant la séance)

```markdown
## {{< fa toolbox >}} Avant les ateliers — setup (à faire en amont) {.smaller}

```bash
python -m venv .venv && source .venv/bin/activate
pip install langchain langchain-openai langchain-chroma \
            langgraph crewai chromadb
export OPENAI_API_KEY="sk-..."   # fournie en séance si besoin
```

- Récupérer le dossier `atelier_data/` (docs, `eval_cases.jsonl`,
  `service_status.json`)
- Vérifier : `python -c "import langchain, langgraph, crewai"`

::: {.callout-warning}
Sans clé API : binômer, ou utiliser le notebook de secours pré-exécuté.
:::
```

### 5.4 Slide « Pour aller plus loin » (à insérer avant ou après « À retenir »)

```markdown
## {{< fa book-open >}} Pour aller plus loin {.smaller}

| Thème | Ressource |
|---|---|
| LangChain v1 | docs.langchain.com — guides `create_agent`, middleware |
| LangGraph | LangChain Academy — cours « Introduction to LangGraph » |
| CrewAI | docs.crewai.com — quickstart Crews et Flows |
| RAG avancé | Cookbook LangChain : hybrid search, reranking, multi-query |
| Sécurité | OWASP Top 10 for LLM Applications (LLM01 : prompt injection) |
| Agents en prod | « Building effective agents » (Anthropic) — workflows vs agents |
```

### 5.5 Correctif atelier 1 (slide 37)

Remplacer :

```python
from langchain_community.vectorstores import Chroma
```

par :

```python
from langchain_chroma import Chroma  # paquet langchain-chroma
```

et préciser le loader :

```python
docs = DirectoryLoader("atelier_data/docs/", glob="**/*.md").load()
```

---

## 6. Conclusion

Le deck est **prêt à l'emploi pour les deux formats** après les correctifs R1–R3 (une
demi-heure de travail sur le `.qmd`). Sa principale qualité est d'enseigner *quand ne pas*
utiliser un agent — c'est exactement ce qu'une apprenante doit retenir en 2026. Le rapport
compagnon `notes_orales_rag_agentic_ai.md` fournit, slide par slide, le contenu expliqué,
les définitions et le script oral, en intégrant déjà à l'oral les compléments R2 (embeddings),
les ordres de grandeur de coût et la mention des frameworks alternatifs.
