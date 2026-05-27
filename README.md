# AgentFlow — Orchestration multi-agents IA pour l'automatisation de workflows

> Concevez visuellement vos workflows IA. Exécutez-les automatiquement avec des agents LLM.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat&logo=next.js)](https://nextjs.org)
[![LangChain](https://img.shields.io/badge/LangChain-0.2-1C3C3C?style=flat)](https://langchain.com)
[![React Flow](https://img.shields.io/badge/React_Flow-11-7c3aed?style=flat)](https://reactflow.dev)
[![Groq](https://img.shields.io/badge/Groq-LLM-F55036?style=flat)](https://groq.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat&logo=postgresql)](https://postgresql.org)

---

## Table des matières
1. [Vue d'ensemble](#vue-densemble)
2. [Stack technique](#stack-technique)
3. [Architecture mono-repo](#architecture-mono-repo)
4. [Diagrammes UML](#diagrammes-uml)
5. [PRD](#prd)
6. [User Stories](#user-stories)
7. [Règles métier](#règles-métier)
8. [Spécification API](#spécification-api)
9. [Simulation UI](#simulation-ui)
10. [Déploiement](#déploiement)
11. [CI/CD](#cicd)
12. [Roadmap](#roadmap)

---

## Vue d'ensemble

AgentFlow est une plateforme d'orchestration multi-agents IA. Les utilisateurs conçoivent des workflows sous forme de graphes orientés acycliques (DAG) via un éditeur visuel drag-and-drop (React Flow). Chaque nœud est un agent IA avec un rôle (Researcher, Analyzer, Writer, Reviewer), un accès à des outils (web_search, code_exec, send_email) et un prompt configurable. L'exécution est gérée par LangChain avec les LLMs Groq (llama-3.1-70b).

**Domaine :** Automation / AI Agents / No-Code IA  
**Port VM :** 3037 | **Sous-domaine :** agentflow.wikolabs.com

---

## Stack technique

| Couche | Technologie | Rôle |
|--------|------------|------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, **React Flow 11** | Éditeur DAG drag-and-drop, monitoring exécution |
| Backend | FastAPI (Python 3.11), asyncio, SSE | API REST + Server-Sent Events (exécution streaming) |
| Agent Engine | LangChain 0.2 (AgentExecutor), LangGraph | Orchestration agents + outil calling |
| LLM | **Groq API** (llama-3.1-70b-versatile) — 100k tok/min free | Raisonnement agents |
| Tool Registry | Python functions (web_search, read_file, write_file, http_request) | Outils disponibles pour les agents |
| Base de données | PostgreSQL 16 (workflows, exécutions, logs) | Persistance |
| Job Queue | Redis 7 (Celery) | Exécutions asynchrones + retry |
| Infra | Docker Compose, Nginx | VM mono-repo (port 3037) |

### backend/requirements.txt
```
fastapi==0.111.0
uvicorn[standard]==0.29.0
langchain==0.2.0
langchain-groq==0.1.6
langgraph==0.1.0
langchain-community==0.2.0
celery==5.4.0
redis==5.0.4
asyncpg==0.29.0
sqlalchemy[asyncio]==2.0.30
pydantic==2.7.1
httpx==0.27.0
```

---

## Architecture mono-repo

```
agentflow/
├── frontend/
│   ├── src/app/
│   │   ├── page.tsx             # Bibliothèque de workflows
│   │   ├── editor/[id]/         # Éditeur DAG (React Flow)
│   │   └── runs/[id]/           # Monitoring exécution live
│   └── src/components/
│       ├── WorkflowCanvas.tsx   # React Flow canvas
│       ├── AgentNode.tsx        # Node agent configurable
│       ├── ToolBadge.tsx        # Badge outil (search, email...)
│       ├── ExecutionLog.tsx     # Log streaming SSE
│       └── ApprovalGate.tsx     # Human-in-the-loop
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── routers/
│   │   │   ├── workflows.py     # CRUD workflows
│   │   │   ├── runs.py          # POST /run, GET /runs/{id}
│   │   │   └── sse.py           # GET /runs/{id}/stream (SSE)
│   │   ├── services/
│   │   │   ├── dag_executor.py  # LangGraph DAG runner
│   │   │   ├── agent_factory.py # Crée agents depuis config
│   │   │   ├── tool_registry.py # web_search, http_request...
│   │   │   └── cost_tracker.py  # Token counting + coût estimé
│   │   └── models/
│   │       ├── workflow.py
│   │       └── run.py
│   ├── requirements.txt
│   └── Dockerfile
├── docker-compose.yml
└── .github/workflows/deploy.yml
```

---

## Diagrammes UML

### Architecture système

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#7c3aed', 'primaryTextColor': '#fff', 'primaryBorderColor': '#5b21b6', 'lineColor': '#374151', 'secondaryColor': '#f5f3ff'}}}%%
flowchart TB
    subgraph USER["👤 Utilisateur"]
        EDITOR["Éditeur DAG\n(React Flow)"]
        MONITOR["Monitoring\nexécution live"]
    end

    subgraph VM["🖥️ VM — Docker Compose (port 3037)"]
        NEXT["Next.js 14"]
        API["FastAPI\nREST + SSE"]
        EXECUTOR["LangGraph\nDAG Executor"]
        FACTORY["Agent Factory\n(LangChain)"]
        GROQ["Groq API\nllama-3.1-70b"]
        TOOLS["Tool Registry\n(search, email, http)"]
        CELERY["Celery\nJob Queue"]
        PG[("PostgreSQL\nWorkflows + Runs")]
        REDIS[("Redis\nJob queue + results")]
    end

    EDITOR --> NEXT --> API
    MONITOR --> API
    API --> CELERY --> EXECUTOR
    EXECUTOR --> FACTORY
    FACTORY --> GROQ
    FACTORY --> TOOLS
    EXECUTOR --> PG
    API -->|"SSE stream"| MONITOR
    CELERY --> REDIS
```

### Séquence — Exécution d'un workflow

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#7c3aed', 'primaryTextColor': '#fff', 'lineColor': '#374151'}}}%%
sequenceDiagram
    participant U as Utilisateur
    participant API as FastAPI
    participant CEL as Celery
    participant EXE as LangGraph Executor
    participant AG1 as Agent: Researcher
    participant AG2 as Agent: Analyzer
    participant GROQ as Groq LLM
    participant SSE as SSE Stream

    U->>API: POST /runs {workflow_id, inputs}
    API->>CEL: enqueue_run(run_id, workflow_def)
    API-->>U: {run_id, status: "PENDING"}
    U->>SSE: GET /runs/{run_id}/stream

    CEL->>EXE: execute_dag(workflow)

    EXE->>AG1: run(role=Researcher, tools=[web_search])
    AG1->>GROQ: chat_completion(prompt + tools)
    GROQ-->>AG1: tool_call: web_search("AI trends 2025")
    AG1->>AG1: execute web_search
    AG1-->>EXE: output: "Recherche terminée: ..."
    SSE-->>U: {node:"Researcher", status:"done", output:"..."}

    EXE->>AG2: run(role=Analyzer, input=AG1.output)
    AG2->>GROQ: chat_completion(analysis_prompt + AG1_output)
    GROQ-->>AG2: analysis_result
    AG2-->>EXE: output: "Analyse: ..."
    SSE-->>U: {node:"Analyzer", status:"done", output:"..."}

    Note over EXE: Nœud "Require Approval" détecté
    EXE-->>SSE: {node:"ApprovalGate", status:"waiting"}
    SSE-->>U: {type:"approval_required", message:"Valider l'envoi email?"}
    U->>API: POST /runs/{run_id}/approve
    EXE->>EXE: continue après approbation

    EXE-->>API: run_completed
    SSE-->>U: {type:"completed", total_tokens:4823, cost_usd:0.012}
```

### Modèle de données (ER)

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#7c3aed', 'primaryTextColor': '#fff', 'lineColor': '#374151'}}}%%
erDiagram
    WORKFLOW {
        uuid id PK
        string name
        string description
        jsonb dag_definition
        string status
        uuid created_by FK
        timestamp created_at
        timestamp updated_at
        int run_count
    }
    WORKFLOW_NODE {
        uuid id PK
        uuid workflow_id FK
        string node_id
        string role
        string[] tools
        text prompt_template
        jsonb input_schema
        jsonb output_schema
        boolean require_approval
        int timeout_seconds
    }
    RUN {
        uuid id PK
        uuid workflow_id FK
        jsonb inputs
        string status
        int total_tokens
        float cost_usd
        timestamp started_at
        timestamp completed_at
    }
    RUN_LOG {
        uuid id PK
        uuid run_id FK
        string node_id
        string status
        text input_data
        text output_data
        int tokens_used
        int latency_ms
        timestamp created_at
    }

    WORKFLOW ||--o{ WORKFLOW_NODE : "contient"
    WORKFLOW ||--o{ RUN : "exécuté en"
    RUN ||--o{ RUN_LOG : "génère"
```

### Machine à états — Exécution d'un run

```mermaid
%%{init: {'theme': 'base', 'themeVariables': {'primaryColor': '#7c3aed', 'primaryTextColor': '#fff', 'lineColor': '#374151'}}}%%
stateDiagram-v2
    [*] --> PENDING : POST /runs
    PENDING --> RUNNING : Celery worker picks up
    RUNNING --> WAITING_APPROVAL : Nœud ApprovalGate atteint
    WAITING_APPROVAL --> RUNNING : Utilisateur approuve
    WAITING_APPROVAL --> CANCELLED : Timeout ou refus
    RUNNING --> COMPLETED : Tous nœuds terminés
    RUNNING --> FAILED : Erreur / timeout / retry épuisé
    FAILED --> RUNNING : Retry automatique (max 3)
    COMPLETED --> [*]
    CANCELLED --> [*]
    FAILED --> [*]
```

---

## PRD

### Problème
Les équipes perdent des heures sur des workflows répétitifs : rechercher des informations, analyser, rédiger, réviser, envoyer. Les solutions no-code actuelles (Zapier, n8n) sont limitées pour les tâches nécessitant du raisonnement. LangChain est trop technique pour les non-développeurs.

### Solution
Un éditeur visuel DAG où chaque nœud est un agent IA configurable (rôle, outils, prompt). L'utilisateur conçoit le workflow sans code, le système l'exécute avec LangChain + Groq. Le monitoring en temps réel (SSE) montre chaque étape s'exécuter.

### Utilisateurs cibles
| Persona | Besoin |
|---------|--------|
| Ops / Revenue Ops | Automatiser la recherche prospects, la génération de rapports |
| Content Manager | Workflow recherche → rédaction → révision automatisé |
| Data Analyst | Pipelines d'analyse automatisés sans code Python |

### OKRs
- 80% des workflows créés par des non-développeurs
- Temps d'exécution moyen < 2 min pour un workflow de 3 nœuds
- Coût tokens moyen < 0.05$/run
- Human-in-the-loop disponible sur tout nœud

---

## User Stories

```
US-01 [Ops] En tant que Revenue Ops,
      je veux créer un workflow "Recherche prospect → Email personnalisé"
      sans écrire une ligne de code
      afin d'automatiser la prospection outbound.

US-02 [Système] En tant qu'executor,
      je veux respecter la limite de profondeur max (10 nœuds)
      afin d'éviter les boucles infinies.

US-03 [Manager] En tant que manager,
      je veux un nœud "Validation humaine" dans mon workflow
      afin que l'agent ne fasse pas d'action irréversible sans mon accord.

US-04 [Dev] En tant que développeur,
      je veux créer des outils personnalisés (fonctions Python)
      et les ajouter au registre d'outils disponibles
      afin d'étendre les capacités des agents.

US-05 [Ops] En tant qu'utilisateur,
      je veux voir le coût en tokens et en euros pour chaque run
      afin de contrôler les dépenses API.

US-06 [Manager] En tant que manager,
      je veux des templates de workflows pré-configurés
      (lead research, report generation, customer follow-up)
      afin de démarrer rapidement.
```

---

## Règles métier

Simulables dans l'UI avec exécution mock (sans Groq API).

| # | Règle | Description | Simulable UI |
|---|-------|-------------|-------------|
| R1 | Max nœuds par workflow | 10 nœuds max (prévention boucles) | ✅ Compteur canvas |
| R2 | Timeout par nœud | 30s max par step agent | ✅ Config nœud |
| R3 | Timeout workflow total | 5 min max par run | ✅ |
| R4 | Retry policy | Échec → retry 3× avec backoff exponentiel | ✅ Log visible |
| R5 | Human-in-the-loop | Flag "require_approval" sur tout nœud → pause run | ✅ ApprovalGate UI |
| R6 | Branchement conditionnel | Nœud IF/ELSE basé sur output précédent (JSON path) | ✅ Condition editor |
| R7 | Parallélisme | Nœuds sans dépendance → exécution simultanée | ✅ DAG visualization |
| R8 | Audit log | Chaque action loggée : timestamp, input, output, tokens | ✅ Run log panel |
| R9 | Cost tracking | Total tokens × prix Groq → coût affiché | ✅ Cost badge |
| R10 | Templates | Bibliothèque de workflows pré-configurés | ✅ Template gallery |

---

## Spécification API

**Base URL :** `http://agentflow.wikolabs.com/api/v1`

### POST /workflows
```json
{
  "name": "Prospect Research Pipeline",
  "dag_definition": {
    "nodes": [
      {"id": "n1", "role": "Researcher", "tools": ["web_search"], "prompt": "Recherche les informations sur {{company}}"},
      {"id": "n2", "role": "Writer", "tools": [], "prompt": "Rédige un email de prospection basé sur: {{n1.output}}"}
    ],
    "edges": [{"source": "n1", "target": "n2"}]
  }
}
```

### POST /runs
```json
{"workflow_id": "wf_uuid", "inputs": {"company": "Acme Corp, Paris"}}
// Response: {"run_id": "run_uuid", "status": "PENDING"}
```

### GET /runs/{id}/stream (SSE)
```
event: node_started
data: {"node_id": "n1", "role": "Researcher"}

event: node_completed
data: {"node_id": "n1", "output": "...", "tokens": 847, "latency_ms": 2340}

event: approval_required
data: {"node_id": "n2", "message": "Valider l'envoi de l'email ?"}

event: run_completed
data: {"total_tokens": 2847, "cost_usd": 0.0071, "duration_ms": 8420}
```

### GET /templates
Retourne la bibliothèque de workflows pré-configurés.

---

## Simulation UI

Mode démo **sans Groq API** — exécution simulée avec délais réalistes.

| Composant | Description |
|-----------|-------------|
| **React Flow Canvas** | Drag-and-drop nœuds (Researcher, Analyzer, Writer, Reviewer) |
| **Mock Executor** | Simule l'exécution avec `setTimeout` + outputs pré-écrits |
| **SSE Stream Mock** | Flux de logs simulé : nœud démarré → output → suivant |
| **ApprovalGate Demo** | Pause l'exécution simulée → bouton "Approuver" → reprend |
| **Cost Estimator** | Calcule le coût estimé en tokens avant exécution |
| **Template Gallery** | 5 workflows pré-configurés (prospection, résumé, rapport...) |

---

## Déploiement

```yaml
version: "3.9"
services:
  postgres:
    image: postgres:16-alpine
    environment: {POSTGRES_DB: agentflow, POSTGRES_USER: af_user, POSTGRES_PASSWORD: "${POSTGRES_PASSWORD}"}
    volumes: [pg_data:/var/lib/postgresql/data]

  redis:
    image: redis:7-alpine

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql+asyncpg://af_user:${POSTGRES_PASSWORD}@postgres/agentflow
      REDIS_URL: redis://redis:6379
      GROQ_API_KEY: ${GROQ_API_KEY}
      CELERY_BROKER_URL: redis://redis:6379/0
    depends_on: [postgres, redis]
    expose: ["8000"]

  celery_worker:
    build: ./backend
    command: celery -A app.celery_app worker --concurrency=4
    environment:
      GROQ_API_KEY: ${GROQ_API_KEY}
      CELERY_BROKER_URL: redis://redis:6379/0
    depends_on: [redis, postgres]

  frontend:
    build: ./frontend
    expose: ["3000"]

  nginx:
    image: nginx:alpine
    ports: ["3037:80"]
    volumes: ["./nginx.conf:/etc/nginx/nginx.conf:ro"]

volumes:
  pg_data:
```

---

## CI/CD

```yaml
name: Deploy AgentFlow
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.VM_HOST }}
          username: ${{ secrets.VM_USER }}
          key: ${{ secrets.VM_SSH_KEY }}
          script: |
            cd /opt/agentflow && git pull origin main
            docker compose up -d --build
```

---

## Roadmap

### Phase 1 — MVP (Semaines 1–4)
- [ ] Éditeur DAG React Flow (add/remove nœuds, connect edges)
- [ ] Agent Factory + Tool Registry (web_search, http_request)
- [ ] Exécution Celery + SSE streaming
- [ ] Mode démo sans Groq (mock executor)

### Phase 2 — Fonctionnalités (Semaines 5–8)
- [ ] Human-in-the-loop (ApprovalGate)
- [ ] Branchement conditionnel IF/ELSE
- [ ] Template gallery (5 workflows pré-configurés)
- [ ] Cost tracking + history des runs

### Phase 3 — Avancé (Semaines 9–12)
- [ ] Parallel execution des nœuds indépendants (LangGraph parallel)
- [ ] Custom tools (upload Python function)
- [ ] Scheduled workflows (cron)
- [ ] Integration Slack / Gmail / Notion comme outils

---

*Un produit [Wikolabs](https://wikolabs.com) — Intelligence artificielle appliquée aux métiers*
