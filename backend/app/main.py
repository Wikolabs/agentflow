"""AgentFlow demo backend — production-ready POC.

In production: this service would actually compile and execute multi-agent
workflows on Temporal / LangGraph with real tool calls, retries, HITL approvals
and per-run budgets. For the demo: it only invokes the LLM and returns a
plausible orchestration plan as markdown.
"""
from datetime import datetime, timezone
from typing import Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .llm import chat, is_configured

app = FastAPI(
    title="AgentFlow Demo Backend",
    description="POC backend — Groq/Gemini LLM. No real agent execution.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────────────────────────────────────
# Prompts
# ─────────────────────────────────────────────────────────────────────────────
SYSTEM_PROMPT_FR = """Tu es AgentFlow, une plateforme d'orchestration multi-agents IA. A partir d'un objectif metier en langage naturel, tu decomposes le workflow en agents specialises, definis les modeles utilises, dependances, outils externes et points de controle.

Format de sortie exact en MARKDOWN :
**🎯 Objectif decompose**
- [1-2 puces resumant l'objectif final et le livrable attendu]

**🤖 Agents orchestres**
- **Agent 1 : [Nom]** — Modele: [GPT-4 / Claude 3.5 / Mistral / Llama-70B] · Tools: [API, DB, etc.] — [1 ligne sur sa mission]
- **Agent 2 : [Nom]** — Modele: ... — ...
- **Agent 3 : [Nom]** — Modele: ... — ...
- **Agent 4 : [Nom]** — Modele: ... — ...

**🔀 Sequence d'execution**
- Etape 1 : [Agent X] -> output -> [Agent Y] (parallel / sequential)
- Etape 2 : [Agent Y + Z] -> merge -> [Agent W]
- Etape 3 : ...

**🛡️ Garde-fous**
- [1-2 puces : retry policy, validation humaine, budget cost cap, fallback]

**📊 Metriques estimees**
- Latence end-to-end : [X-Y minutes / secondes]
- Cout estime par execution : [Z USD]
- Fiabilite cible : 99.X%

Tu DOIS inventer une orchestration concrete et coherente (jamais "je ne peux pas executer"). Tu joues le role d'un compilateur de workflow. Sois technique, evite le marketing. Maximum 380 mots."""

SYSTEM_PROMPT_EN = """You are AgentFlow, a multi-agent AI orchestration platform. From a business goal in natural language, you decompose the workflow into specialized agents, define models used, dependencies, external tools and checkpoints.

Exact MARKDOWN output format:
**🎯 Decomposed goal**
- [1-2 bullets summarizing final goal and expected deliverable]

**🤖 Orchestrated agents**
- **Agent 1: [Name]** — Model: [GPT-4 / Claude 3.5 / Mistral / Llama-70B] · Tools: [API, DB, etc.] — [1 line on its mission]
- **Agent 2: [Name]** — Model: ... — ...
- **Agent 3: [Name]** — Model: ... — ...
- **Agent 4: [Name]** — Model: ... — ...

**🔀 Execution sequence**
- Step 1: [Agent X] -> output -> [Agent Y] (parallel / sequential)
- Step 2: [Agent Y + Z] -> merge -> [Agent W]
- Step 3: ...

**🛡️ Guardrails**
- [1-2 bullets: retry policy, human validation, cost budget cap, fallback]

**📊 Estimated metrics**
- End-to-end latency: [X-Y minutes / seconds]
- Estimated cost per run: [Z USD]
- Reliability target: 99.X%

You MUST invent a concrete and coherent orchestration (never "I can't execute"). You play a workflow compiler. Be technical, avoid marketing. Maximum 380 words."""


# ─────────────────────────────────────────────────────────────────────────────
# Models
# ─────────────────────────────────────────────────────────────────────────────
class GenerateRequest(BaseModel):
    goal: str = Field(..., min_length=1, max_length=700)
    lang: Literal["fr", "en"] = "fr"


class GenerateResponse(BaseModel):
    brief: str
    model: str
    generated_at: str
    static_mode: bool = False


# ─────────────────────────────────────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "agentflow-backend",
        "llm_configured": is_configured(),
    }


@app.post("/process", response_model=GenerateResponse)
async def process(req: GenerateRequest) -> GenerateResponse:
    goal = req.goal.strip()
    if not goal:
        raise HTTPException(status_code=400, detail="empty_goal")

    now_iso = datetime.now(timezone.utc).isoformat()
    user_msg = (
        f"Objectif metier a orchestrer : \"{goal}\". "
        f"Compile le workflow multi-agents avec modeles, sequences et garde-fous."
        if req.lang == "fr"
        else f"Business goal to orchestrate: \"{goal}\". "
             f"Compile the multi-agent workflow with models, sequence and guardrails."
    )

    if not is_configured():
        return GenerateResponse(
            brief=_build_mock_brief(goal, req.lang),
            model="static-mock",
            generated_at=now_iso,
            static_mode=True,
        )

    try:
        text, model = await chat(
            [
                {"role": "system", "content": SYSTEM_PROMPT_FR if req.lang == "fr" else SYSTEM_PROMPT_EN},
                {"role": "user", "content": user_msg},
            ],
            max_tokens=1000,
        )
    except Exception:
        return GenerateResponse(
            brief=_build_mock_brief(goal, req.lang),
            model="static-mock",
            generated_at=now_iso,
            static_mode=True,
        )

    return GenerateResponse(brief=text, model=model, generated_at=now_iso)


# ─────────────────────────────────────────────────────────────────────────────
# Mock brief
# ─────────────────────────────────────────────────────────────────────────────
def _build_mock_brief(goal: str, lang: str) -> str:
    if lang == "en":
        return (
            f"**🎯 Decomposed goal**\n"
            f"- \"{goal}\"\n"
            f"- Deliverable: structured output sent to CRM + summary in Slack #ops within 12 minutes\n\n"
            f"**🤖 Orchestrated agents**\n"
            f"- **Agent 1: Intake parser** — Model: Llama-70B · Tools: webhook in — Validate input payload schema and route by intent\n"
            f"- **Agent 2: Data enrichment** — Model: GPT-4 · Tools: Clearbit API, internal CRM — Pull firmographics and existing context\n"
            f"- **Agent 3: Decision engine** — Model: Claude 3.5 · Tools: rules DB — Apply business policy and produce structured decision\n"
            f"- **Agent 4: Notifier** — Model: Llama-70B · Tools: Slack API, CRM API — Format and dispatch outputs\n\n"
            f"**🔀 Execution sequence**\n"
            f"- Step 1: Agent 1 -> Agent 2 (sequential)\n"
            f"- Step 2: Agent 2 -> Agent 3 (sequential)\n"
            f"- Step 3: Agent 3 -> Agent 4 (parallel: Slack + CRM)\n\n"
            f"**🛡️ Guardrails**\n"
            f"- Retry 3x with exponential backoff on Agents 2 & 3; human-in-the-loop if decision confidence < 70%\n"
            f"- Cost cap: 0.40 USD per run; circuit-breaker after 3 consecutive failures\n\n"
            f"**📊 Estimated metrics**\n"
            f"- End-to-end latency: 8-12 minutes\n"
            f"- Estimated cost per run: 0.28 USD\n"
            f"- Reliability target: 99.7%"
        )
    return (
        f"**🎯 Objectif decompose**\n"
        f"- \"{goal}\"\n"
        f"- Livrable : output structure pousse au CRM + resume Slack #ops sous 12 minutes\n\n"
        f"**🤖 Agents orchestres**\n"
        f"- **Agent 1 : Intake parser** — Modele: Llama-70B · Tools: webhook in — Valide le schema du payload et route par intention\n"
        f"- **Agent 2 : Enrichissement** — Modele: GPT-4 · Tools: Clearbit API, CRM interne — Recupere firmographics et contexte existant\n"
        f"- **Agent 3 : Decision engine** — Modele: Claude 3.5 · Tools: regles DB — Applique politique metier et produit decision structuree\n"
        f"- **Agent 4 : Notifier** — Modele: Llama-70B · Tools: Slack API, CRM API — Formate et dispatche les outputs\n\n"
        f"**🔀 Sequence d'execution**\n"
        f"- Etape 1 : Agent 1 -> Agent 2 (sequential)\n"
        f"- Etape 2 : Agent 2 -> Agent 3 (sequential)\n"
        f"- Etape 3 : Agent 3 -> Agent 4 (parallel: Slack + CRM)\n\n"
        f"**🛡️ Garde-fous**\n"
        f"- Retry 3x backoff exponentiel sur Agents 2 et 3 ; HITL si confiance decision < 70%\n"
        f"- Cost cap : 0.40 USD par run ; circuit-breaker apres 3 echecs consecutifs\n\n"
        f"**📊 Metriques estimees**\n"
        f"- Latence end-to-end : 8-12 minutes\n"
        f"- Cout estime par run : 0.28 USD\n"
        f"- Fiabilite cible : 99.7%"
    )
