"use client";
import { useState } from "react";

const PRODUCT = "AgentFlow";

const PAL = {
  bg: "#1A1228",
  bg2: "#251A38",
  surface: "rgba(255,255,255,0.045)",
  surfaceHover: "rgba(255,255,255,0.07)",
  border: "rgba(255,255,255,0.10)",
  txt1: "#EFE8FC",
  txt2: "#A898B8",
  txt3: "#706080",
  accent: "#A78BFA",
  accentSoft: "rgba(167,139,250,0.12)",
  accentBorder: "rgba(167,139,250,0.30)",
  accentGlow: "rgba(167,139,250,0.18)",
  navBg: "rgba(26,18,40,0.82)",
};

const EXAMPLES_FR = [
  "Qualifier les leads inbound : enrichir, scorer, router au commercial, prevenir slack si lead chaud",
  "Traiter une note de frais : extraire texte du recu, valider regles, ecrire dans Sage, prevenir manager",
  "Onboarding client SaaS : creer compte, envoyer welcome email, programmer call demo, generer plan",
];
const EXAMPLES_EN = [
  "Qualify inbound leads: enrich, score, route to sales, slack alert if hot",
  "Process expense report: extract receipt text, validate rules, write to Sage, notify manager",
  "SaaS customer onboarding: create account, send welcome email, schedule demo call, generate plan",
];

export default function DemoPage() {
  const [lang, setLang] = useState<"fr" | "en">("fr");
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [brief, setBrief] = useState("");
  const [model, setModel] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [staticMode, setStaticMode] = useState(false);

  const t = lang === "fr" ? {
    back: "Retour", title: "Demo", sub: PRODUCT + " — orchestration multi-agents IA",
    desc: "Decrivez un objectif metier complexe (ex: qualifier des leads, automatiser un onboarding). Le compilateur AgentFlow propose les agents, les modeles, la sequence et les garde-fous. Aucune execution reelle — POC qui illustre la couche d'orchestration.",
    inputLabel: "Objectif metier",
    placeholder: "Ex: traiter une demande de credit client, de la reception du dossier a la decision finale...",
    examplesLabel: "Exemples :",
    generate: "Compiler le workflow", generating: "Compilation en cours...",
    briefTitle: "Workflow compile", emptyHint: "Le workflow s'affiche ici une fois compile.",
    mockN8n: "Exporter vers n8n", mockZapier: "Exporter vers Zapier",
    mockAirflow: "Exporter vers Airflow", mockDeploy: "Deployer sur AgentFlow",
    sentN8n: "Workflow exporte au format n8n (mode demo, pas d'instance reelle)",
    sentZapier: "Workflow exporte au format Zapier (mode demo, pas d'API reelle)",
    sentAirflow: "DAG Airflow genere (mode demo, pas de cluster reel)",
    sentDeploy: "Workflow deploye sur AgentFlow runtime (mode demo, pas de runtime reel)",
    fallback: "Mode statique : la cle LLM sera ajoutee au prochain deploiement.",
    poweredBy: "Modele :",
    note: "DEMO POC — pas d'execution reelle d'agents, pas d'export n8n/Zapier/Airflow. L'IA simule le compilateur d'orchestration.",
  } : {
    back: "Back", title: "Demo", sub: PRODUCT + " — multi-agent AI orchestration",
    desc: "Describe a complex business goal (e.g. qualify leads, automate onboarding). The AgentFlow compiler proposes agents, models, sequence and guardrails. No real execution — POC showing the orchestration layer.",
    inputLabel: "Business goal",
    placeholder: "E.g. process a customer credit request, from intake to final decision...",
    examplesLabel: "Examples:",
    generate: "Compile workflow", generating: "Compiling...",
    briefTitle: "Compiled workflow", emptyHint: "The workflow will appear here once compiled.",
    mockN8n: "Export to n8n", mockZapier: "Export to Zapier",
    mockAirflow: "Export to Airflow", mockDeploy: "Deploy to AgentFlow",
    sentN8n: "Workflow exported in n8n format (demo mode, no real instance)",
    sentZapier: "Workflow exported in Zapier format (demo mode, no real API)",
    sentAirflow: "Airflow DAG generated (demo mode, no real cluster)",
    sentDeploy: "Workflow deployed to AgentFlow runtime (demo mode, no real runtime)",
    fallback: "Static mode: LLM key will be added at next deploy.",
    poweredBy: "Model:",
    note: "DEMO POC — no real agent execution, no n8n/Zapier/Airflow export. The AI simulates the orchestration compiler.",
  };

  const examples = lang === "fr" ? EXAMPLES_FR : EXAMPLES_EN;

  async function generate() {
    setError(""); setBrief(""); setModel(""); setStaticMode(false);
    if (!goal.trim()) {
      setError(lang === "fr" ? "Decrivez un objectif." : "Describe a goal.");
      return;
    }
    setLoading(true);
    try {
      const r = await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal, lang }),
      });
      const j = await r.json();
      if (j.error === "llm_not_configured") {
        setBrief(j.mockBrief || "");
        setStaticMode(true);
      } else if (j.error) {
        setError(j.message || j.error);
      } else {
        setBrief(j.brief || "");
        setModel(j.model || "");
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "unknown_error");
    } finally {
      setLoading(false);
    }
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3200);
  }

  return (
    <div style={{ minHeight: "100vh", background: PAL.bg, color: PAL.txt1, display: "flex", flexDirection: "column" }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; -webkit-font-smoothing: antialiased; overflow-x: hidden; }
        .wk-textarea { width: 100%; padding: 12px 14px; border-radius: 10px; background: ${PAL.surface}; border: 1px solid ${PAL.border}; color: ${PAL.txt1}; font-family: inherit; font-size: 14px; resize: vertical; min-height: 130px; transition: border-color .2s, background .2s; line-height: 1.5; }
        .wk-textarea:focus { outline: none; border-color: ${PAL.accent}; background: ${PAL.surfaceHover}; }
        .wk-btn-primary { background: ${PAL.accent}; color: #04080F; border: none; border-radius: 10px; padding: 13px 22px; font-weight: 700; font-size: 14px; cursor: pointer; font-family: inherit; transition: opacity .2s, transform .2s; display: inline-flex; align-items: center; gap: 8px; }
        .wk-btn-primary:hover { opacity: .9; transform: translateY(-1px); }
        .wk-btn-primary:disabled { opacity: .5; cursor: not-allowed; transform: none; }
        .wk-btn-ghost { background: ${PAL.surface}; color: ${PAL.txt1}; border: 1px solid ${PAL.border}; border-radius: 10px; padding: 9px 14px; font-weight: 600; font-size: 13px; cursor: pointer; font-family: inherit; transition: background .2s, border-color .2s; display: inline-flex; align-items: center; gap: 6px; }
        .wk-btn-ghost:hover { background: ${PAL.surfaceHover}; border-color: ${PAL.accentBorder}; }
        .wk-chip { background: ${PAL.surface}; color: ${PAL.txt2}; border: 1px solid ${PAL.border}; border-radius: 100px; padding: 6px 11px; font-size: 11px; cursor: pointer; font-family: inherit; transition: background .2s, color .2s; }
        .wk-chip:hover { background: ${PAL.accentSoft}; color: ${PAL.txt1}; border-color: ${PAL.accentBorder}; }
        .wk-md p, .wk-md ul { margin: 0 0 10px; }
        .wk-md ul { padding-left: 18px; }
        .wk-md li { margin-bottom: 4px; line-height: 1.65; }
        .wk-md strong { color: ${PAL.accent}; font-weight: 700; display: block; margin-top: 10px; margin-bottom: 4px; font-size: 0.78rem; letter-spacing: 1.5px; text-transform: uppercase; }
        .wk-md li strong { display: inline; font-size: inherit; letter-spacing: 0; text-transform: none; margin: 0; }
        @media (max-width: 768px) {
          .demo-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <nav style={{ padding: "16px 32px", borderBottom: `1px solid ${PAL.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: PAL.navBg, backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 10 }}>
        <a href="/" style={{ color: PAL.accent, textDecoration: "none", fontSize: 14, fontWeight: 600 }}>
          ← {t.back} {PRODUCT}<span style={{ color: PAL.accent }}>.</span>
        </a>
        <div style={{ display: "inline-flex", border: `1px solid ${PAL.border}`, borderRadius: 100, padding: 2, background: PAL.surface }}>
          <button onClick={() => setLang("fr")} style={{ background: lang === "fr" ? PAL.accent : "transparent", color: lang === "fr" ? "#04080F" : PAL.txt2, border: "none", padding: "4px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer", borderRadius: 100, fontFamily: "inherit" }}>FR</button>
          <button onClick={() => setLang("en")} style={{ background: lang === "en" ? PAL.accent : "transparent", color: lang === "en" ? "#04080F" : PAL.txt2, border: "none", padding: "4px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer", borderRadius: 100, fontFamily: "inherit" }}>EN</button>
        </div>
      </nav>

      <main style={{ flex: 1, padding: "32px", maxWidth: 1200, margin: "0 auto", width: "100%" }}>
        <h1 style={{ fontFamily: "'Instrument Serif',Georgia,serif", fontSize: "clamp(1.8rem,3.5vw,2.6rem)", fontWeight: 700, margin: "0 0 6px" }}>
          {t.title} · <em style={{ fontStyle: "italic", color: PAL.accent }}>{PRODUCT}</em>
        </h1>
        <p style={{ color: PAL.txt2, fontSize: "0.95rem", lineHeight: 1.65, maxWidth: 720, margin: "0 0 6px" }}>{t.sub}</p>
        <p style={{ color: PAL.txt3, fontSize: "0.78rem", lineHeight: 1.55, maxWidth: 720, margin: "0 0 28px" }}>{t.desc}</p>

        <div className="demo-grid" style={{ display: "grid", gridTemplateColumns: "400px 1fr", gap: 24 }}>
          <section style={{ background: PAL.surface, border: `1px solid ${PAL.border}`, borderRadius: 16, padding: 22 }}>
            <h2 style={{ fontSize: "0.72rem", color: PAL.txt3, textTransform: "uppercase", letterSpacing: 2, fontWeight: 700, margin: "0 0 14px" }}>{t.inputLabel}</h2>
            <textarea className="wk-textarea" value={goal} onChange={(e) => setGoal(e.target.value)} placeholder={t.placeholder} />
            <p style={{ color: PAL.txt3, fontSize: 11, marginTop: 12, marginBottom: 8 }}>{t.examplesLabel}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
              {examples.map((e, i) => (
                <button key={i} className="wk-chip" onClick={() => setGoal(e)}>{e.length > 48 ? e.slice(0, 45) + "..." : e}</button>
              ))}
            </div>
            <button className="wk-btn-primary" disabled={loading} onClick={generate} style={{ width: "100%", justifyContent: "center" }}>
              {loading ? `⏳ ${t.generating}` : `✨ ${t.generate}`}
            </button>
            {error && <div style={{ marginTop: 12, color: "#F87171", fontSize: 13, padding: "8px 12px", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 8 }}>{error}</div>}
            <p style={{ color: PAL.txt3, fontSize: 11, lineHeight: 1.5, marginTop: 18, marginBottom: 0, paddingTop: 14, borderTop: `1px solid ${PAL.border}` }}>{t.note}</p>
          </section>

          <section style={{ background: PAL.bg2, border: `1px solid ${PAL.border}`, borderRadius: 16, padding: 22, minHeight: 420, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h2 style={{ fontSize: "0.72rem", color: PAL.txt3, textTransform: "uppercase", letterSpacing: 2, fontWeight: 700, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: brief ? "#22C55E" : PAL.txt3 }} />
                {t.briefTitle}
              </h2>
              {model && <span style={{ fontSize: 10, color: PAL.txt3, fontFamily: "monospace" }}>{t.poweredBy} {model}</span>}
            </div>

            {!brief ? (
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: PAL.txt3, fontSize: 14, textAlign: "center", padding: 30 }}>
                {t.emptyHint}
              </div>
            ) : (
              <div className="wk-md" style={{ color: PAL.txt1, fontSize: 14, lineHeight: 1.7, flex: 1 }} dangerouslySetInnerHTML={{ __html: renderMarkdown(brief) }} />
            )}

            {brief && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 18, paddingTop: 18, borderTop: `1px solid ${PAL.border}` }}>
                <button className="wk-btn-ghost" onClick={() => showToast(t.sentN8n)}>🔗 {t.mockN8n}</button>
                <button className="wk-btn-ghost" onClick={() => showToast(t.sentZapier)}>⚡ {t.mockZapier}</button>
                <button className="wk-btn-ghost" onClick={() => showToast(t.sentAirflow)}>🌊 {t.mockAirflow}</button>
                <button className="wk-btn-ghost" onClick={() => showToast(t.sentDeploy)}>🚀 {t.mockDeploy}</button>
              </div>
            )}
            {staticMode && <div style={{ marginTop: 14, color: PAL.txt3, fontSize: 12, fontStyle: "italic" }}>{t.fallback}</div>}
          </section>
        </div>
      </main>

      {toast && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: PAL.surface, border: `1px solid ${PAL.accentBorder}`, borderRadius: 12, padding: "12px 20px", color: PAL.txt1, fontSize: 13, fontWeight: 600, zIndex: 50, backdropFilter: "blur(20px)", boxShadow: "0 8px 28px rgba(0,0,0,0.4)" }}>
          ✓ {toast}
        </div>
      )}
    </div>
  );
}

function renderMarkdown(md: string): string {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const blocks: string[] = [];
  let listBuf: string[] = [];
  const flushList = () => {
    if (listBuf.length) {
      blocks.push("<ul>" + listBuf.map((l) => `<li>${l}</li>`).join("") + "</ul>");
      listBuf = [];
    }
  };
  for (const raw of md.split("\n")) {
    const line = raw.trim();
    if (!line) { flushList(); continue; }
    if (line.startsWith("- ")) {
      listBuf.push(esc(line.slice(2)).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>"));
    } else if (line.startsWith("**") && line.endsWith("**")) {
      flushList();
      blocks.push(`<strong>${esc(line.slice(2, -2))}</strong>`);
    } else {
      flushList();
      blocks.push(`<p>${esc(line).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")}</p>`);
    }
  }
  flushList();
  return blocks.join("");
}
