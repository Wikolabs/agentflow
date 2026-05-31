import { NextResponse } from "next/server";
import { chat, isConfigured } from "@/lib/llm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM_PROMPT_FR = `Tu es AgentFlow, une plateforme d'orchestration multi-agents IA. A partir d'un objectif metier en langage naturel, tu decomposes le workflow en agents specialises, definis les modeles utilises, dependances, outils externes et points de controle.

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

Tu DOIS inventer une orchestration concrete et coherente (jamais "je ne peux pas executer"). Tu joues le role d'un compilateur de workflow. Sois technique, evite le marketing. Maximum 380 mots.`;

const SYSTEM_PROMPT_EN = `You are AgentFlow, a multi-agent AI orchestration platform. From a business goal in natural language, you decompose the workflow into specialized agents, define models used, dependencies, external tools and checkpoints.

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

You MUST invent a concrete and coherent orchestration (never "I can't execute"). You play a workflow compiler. Be technical, avoid marketing. Maximum 380 words.`;

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const goal: string = typeof body.goal === "string" ? body.goal.slice(0, 700) : "";
    const lang: "fr" | "en" = body.lang === "en" ? "en" : "fr";

    if (!goal.trim()) {
      return NextResponse.json(
        { error: lang === "fr" ? "Decrivez un objectif metier." : "Describe a business goal." },
        { status: 400 }
      );
    }

    if (!isConfigured()) {
      return NextResponse.json(
        {
          error: "llm_not_configured",
          message: lang === "fr"
            ? "Demo en mode statique — la cle LLM sera configuree au prochain deploiement."
            : "Static demo mode — LLM key will be configured at next deploy.",
          mockBrief: buildMock(goal, lang),
        },
        { status: 200 }
      );
    }

    const userMsg = lang === "fr"
      ? `Objectif metier a orchestrer : "${goal}". Compile le workflow multi-agents avec modeles, sequences et garde-fous.`
      : `Business goal to orchestrate: "${goal}". Compile the multi-agent workflow with models, sequence and guardrails.`;

    const { text, model } = await chat(
      [
        { role: "system", content: lang === "fr" ? SYSTEM_PROMPT_FR : SYSTEM_PROMPT_EN },
        { role: "user", content: userMsg },
      ],
      1000
    );

    return NextResponse.json({ brief: text, model, generatedAt: new Date().toISOString() });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "unknown";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

function buildMock(goal: string, lang: "fr" | "en"): string {
  if (lang === "en") {
    return `**🎯 Decomposed goal**\n- "${goal}"\n- Deliverable: structured output sent to CRM + summary in Slack #ops within 12 minutes\n\n**🤖 Orchestrated agents**\n- **Agent 1: Intake parser** — Model: Llama-70B · Tools: webhook in — Validate input payload schema and route by intent\n- **Agent 2: Data enrichment** — Model: GPT-4 · Tools: Clearbit API, internal CRM — Pull firmographics and existing context\n- **Agent 3: Decision engine** — Model: Claude 3.5 · Tools: rules DB — Apply business policy and produce structured decision\n- **Agent 4: Notifier** — Model: Llama-70B · Tools: Slack API, CRM API — Format and dispatch outputs\n\n**🔀 Execution sequence**\n- Step 1: Agent 1 -> Agent 2 (sequential)\n- Step 2: Agent 2 -> Agent 3 (sequential)\n- Step 3: Agent 3 -> Agent 4 (parallel: Slack + CRM)\n\n**🛡️ Guardrails**\n- Retry 3x with exponential backoff on Agents 2 & 3; human-in-the-loop if decision confidence < 70%\n- Cost cap: 0.40 USD per run; circuit-breaker after 3 consecutive failures\n\n**📊 Estimated metrics**\n- End-to-end latency: 8-12 minutes\n- Estimated cost per run: 0.28 USD\n- Reliability target: 99.7%`;
  }
  return `**🎯 Objectif decompose**\n- "${goal}"\n- Livrable : output structure pousse au CRM + resume Slack #ops sous 12 minutes\n\n**🤖 Agents orchestres**\n- **Agent 1 : Intake parser** — Modele: Llama-70B · Tools: webhook in — Valide le schema du payload et route par intention\n- **Agent 2 : Enrichissement** — Modele: GPT-4 · Tools: Clearbit API, CRM interne — Recupere firmographics et contexte existant\n- **Agent 3 : Decision engine** — Modele: Claude 3.5 · Tools: regles DB — Applique politique metier et produit decision structuree\n- **Agent 4 : Notifier** — Modele: Llama-70B · Tools: Slack API, CRM API — Formate et dispatche les outputs\n\n**🔀 Sequence d'execution**\n- Etape 1 : Agent 1 -> Agent 2 (sequential)\n- Etape 2 : Agent 2 -> Agent 3 (sequential)\n- Etape 3 : Agent 3 -> Agent 4 (parallel: Slack + CRM)\n\n**🛡️ Garde-fous**\n- Retry 3x backoff exponentiel sur Agents 2 et 3 ; HITL si confiance decision < 70%\n- Cost cap : 0.40 USD par run ; circuit-breaker apres 3 echecs consecutifs\n\n**📊 Metriques estimees**\n- Latence end-to-end : 8-12 minutes\n- Cout estime par run : 0.28 USD\n- Fiabilite cible : 99.7%`;
}
