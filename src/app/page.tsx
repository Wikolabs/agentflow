export default function Home() {
  const color = "#6366f1";
  const colorLight = "#eef2ff";
  const colorDark = "#4338ca";

  return (
    <main style={{ fontFamily: "var(--font-body)" }}>
      {/* NAVBAR */}
      <nav style={{ background: "#fff", borderBottom: "1px solid #e0e7ff", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color }}>AgentFlow</span>
          <div style={{ display: "flex", gap: 12 }}>
            <button data-cal-link="wikolabs-team/30min" data-cal-namespace="wk30min" data-cal-config='{"layout":"month_view"}' type="button" target="_blank" rel="noopener noreferrer"
              style={{ background: color, color: "#fff", padding: "8px 20px", borderRadius: 8, fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
              Réserver une démo
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ background: `linear-gradient(135deg, ${colorLight} 0%, #fff 60%)`, padding: "80px 24px 64px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <span style={{ display: "inline-block", background: "#e0e7ff", color, padding: "6px 16px", borderRadius: 20, fontSize: 13, fontWeight: 600, marginBottom: 24 }}>
            Orchestration d&apos;agents IA
          </span>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(36px, 6vw, 60px)", fontWeight: 800, color: "#1e1b4b", lineHeight: 1.15, marginBottom: 24 }}>
            Orchestrez vos agents IA.<br />
            <span style={{ color }}>De l&apos;idée au déploiement en 10 minutes.</span>
          </h1>
          <p style={{ fontSize: 18, color: "#4b5563", marginBottom: 40, lineHeight: 1.7 }}>
            Pipelines d&apos;agents IA visuels — connectez, testez et déployez vos workflows IA sans code en 10 minutes.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 56 }}>
            <button data-cal-link="wikolabs-team/30min" data-cal-namespace="wk30min" data-cal-config='{"layout":"month_view"}' type="button" target="_blank" rel="noopener noreferrer"
              style={{ background: color, color: "#fff", padding: "14px 28px", borderRadius: 10, fontWeight: 700, fontSize: 16, textDecoration: "none" }}>
              Réserver une démo
            </button>
            <a href="https://wa.me/261386626100?text=Bonjour%2C%20je%20souhaite%20discuter%20de%20AgentFlow%20avec%20Wikolabs." target="_blank" rel="noopener noreferrer"
              style={{ background: "#25d366", color: "#fff", padding: "14px 28px", borderRadius: 10, fontWeight: 700, fontSize: 16, textDecoration: "none" }}>
              WhatsApp
            </a>
          </div>
          {/* Metrics */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 16 }}>
            {[
              { value: "<10min", label: "déploiement" },
              { value: "50+", label: "connecteurs" },
              { value: "99.9%", label: "uptime" },
              { value: "100%", label: "observable" },
            ].map((m) => (
              <div key={m.label} style={{ background: "#fff", borderRadius: 12, padding: "20px 16px", boxShadow: "0 1px 4px rgba(99,102,241,0.1)" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color }}>{m.value}</div>
                <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ background: "#fff", padding: "72px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 800, color: "#1e1b4b", textAlign: "center", marginBottom: 48 }}>
            Tout pour orchestrer vos agents IA
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
            {[
              {
                icon: "🎨",
                title: "Visual workflow builder",
                desc: "Glissez-déposez vos agents, connectez les étapes, définissez les conditions de branchement. Aucune ligne de code requise pour les workflows standards.",
              },
              {
                icon: "🤖",
                title: "Multi-agent coordination",
                desc: "Séquençage, parallélisme, retry automatique, fallback handlers — AgentFlow gère la coordination complexe entre agents de façon fiable.",
              },
              {
                icon: "📊",
                title: "Monitoring & observabilité",
                desc: "Chaque run est loggé, tracé et analysable : latence par étape, taux d'erreur, coût token, drift de qualité — tableau de bord temps réel.",
              },
            ].map((f) => (
              <div key={f.title} style={{ background: colorLight, borderRadius: 16, padding: 32, border: `1px solid #e0e7ff` }}>
                <div style={{ fontSize: 36, marginBottom: 16 }}>{f.icon}</div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "#1e1b4b", marginBottom: 12 }}>{f.title}</h3>
                <p style={{ color: "#4b5563", lineHeight: 1.7, fontSize: 15 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ background: colorLight, padding: "72px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 800, color: "#1e1b4b", textAlign: "center", marginBottom: 48 }}>
            Comment ça marche ?
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {[
              {
                step: "01",
                title: "Dessinez votre workflow",
                desc: "Interface drag-and-drop pour assembler vos agents LLM, outils API, transformations de données et logique conditionnelle.",
              },
              {
                step: "02",
                title: "Connectez vos agents",
                desc: "50+ connecteurs prêts : OpenAI, Anthropic, outils internes, bases de données, APIs REST, webhooks Slack/email.",
              },
              {
                step: "03",
                title: "Déployez et monitorez",
                desc: "Un clic pour passer en production. Logs structurés, alertes sur anomalie, rollback instantané si besoin.",
              },
            ].map((s) => (
              <div key={s.step} style={{ display: "flex", gap: 24, alignItems: "flex-start", background: "#fff", borderRadius: 16, padding: 28 }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 40, fontWeight: 900, color: "#e0e7ff", minWidth: 56 }}>{s.step}</div>
                <div>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "#1e1b4b", marginBottom: 8 }}>{s.title}</h3>
                  <p style={{ color: "#4b5563", lineHeight: 1.7, fontSize: 15 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: color, padding: "72px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 800, color: "#fff", marginBottom: 16 }}>
            Votre premier pipeline IA en 10 minutes
          </h2>
          <p style={{ color: "#c7d2fe", fontSize: 18, marginBottom: 36 }}>Démo guidée incluse. Sans carte bancaire.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button data-cal-link="wikolabs-team/30min" data-cal-namespace="wk30min" data-cal-config='{"layout":"month_view"}' type="button" target="_blank" rel="noopener noreferrer"
              style={{ background: "#fff", color, padding: "14px 28px", borderRadius: 10, fontWeight: 700, fontSize: 16, textDecoration: "none" }}>
              Réserver une démo
            </button>
            <a href="https://wa.me/261386626100?text=Bonjour%2C%20je%20souhaite%20discuter%20de%20AgentFlow%20avec%20Wikolabs." target="_blank" rel="noopener noreferrer"
              style={{ background: "#25d366", color: "#fff", padding: "14px 28px", borderRadius: 10, fontWeight: 700, fontSize: 16, textDecoration: "none" }}>
              WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: "#1e1b4b", color: "#a5b4fc", padding: "32px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 8 }}>AgentFlow</div>
          <p style={{ fontSize: 14, marginBottom: 4 }}>
            <a href="mailto:team@wikolabs.com" style={{ color: "#a5b4fc", textDecoration: "none" }}>team@wikolabs.com</a>
            {" · "}
            <a href="https://wikolabs.com" target="_blank" rel="noopener noreferrer" style={{ color: "#a5b4fc", textDecoration: "none" }}>wikolabs.com</a>
          </p>
          <p style={{ color: "#a5b4fc", marginTop: 8, fontSize: 13, display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="mailto:team@wikolabs.com" style={{ color: "#a5b4fc", textDecoration: "none" }}>team@wikolabs.com</a>
            <span>·</span>
            <a href="tel:+261386626100" style={{ color: "#a5b4fc", textDecoration: "none" }}>+261 38 66 261 00</a>
            <span>·</span>
            <button data-cal-link="wikolabs-team/30min" data-cal-namespace="wk30min" data-cal-config='{"layout":"month_view"}' type="button" target="_blank" rel="noopener noreferrer" style={{ color: "#a5b4fc", textDecoration: "none" }}>Prendre RDV</button>
          </p>
          <p style={{ fontSize: 13, color: "#6366f1" }}>© 2026 Wikolabs. Tous droits réservés.</p>
        </div>
      </footer>
    </main>
  );
}
