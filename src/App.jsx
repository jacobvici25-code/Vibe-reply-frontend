import { useState, useEffect, useRef } from "react";

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const BACKEND_URL = "https://vibe-reply-backend.onrender.com";
const ADSENSE_ID = "YOUR_ADSENSE_ID";

const STYLES_CONFIG = [
  { id: "Casual", label: "Casual", emoji: "😎", desc: "Chill & relaxed" },
  { id: "Business", label: "Business", emoji: "💼", desc: "Pro & sharp" },
  { id: "Flirty", label: "Flirty", emoji: "💜", desc: "Playful & warm" },
  { id: "Aura", label: "Aura", emoji: "✨", desc: "Mysterious & cool" },
];

function LoadingDots() {
  const [dots, setDots] = useState("");
  useEffect(() => {
    const iv = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "."));
    }, 420);
    return () => clearInterval(iv);
  }, []);
  return (
    <div style={s.loadingWrap}>
      <div style={s.loadingOrb} />
      <p style={s.loadingText}>
        Vibe Reply is thinking<span style={s.dots}>{dots}</span>
      </p>
    </div>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button style={{ ...s.copyBtn, ...(copied ? s.copyBtnDone : {}) }} onClick={copy}>
      {copied ? "✓ Copied!" : "Copy Reply"}
    </button>
  );
}

export default function App() {
  const [message, setMessage] = useState("");
  const [vibe, setVibe] = useState("");
  const [style, setStyle] = useState("Casual");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const replyRef = useRef(null);

  const vibeWords = vibe.trim() === "" ? 0 : vibe.trim().split(/\s+/).length;
  const vibeOver = vibeWords > 50;

  const generate = async () => {
    if (!message.trim()) { setError("Please paste a message first."); return; }
    if (vibeOver) { setError("Vibe description must be 50 words or less."); return; }
    setError("");
    setReply("");
    setLoading(true);

    const delay = (ms) => new Promise((r) => setTimeout(r, ms));
    const minDelay = delay(5500 + Math.random() * 1500);

    try {
      const [res] = await Promise.all([
        fetch(`${BACKEND_URL}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message, vibe, style }),
        }),
        minDelay,
      ]);

      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setReply(data.reply || "No reply received.");
      setTimeout(() => {
        replyRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 100);
    } catch (err) {
      setError("Could not reach the backend. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.root}>
      <div style={s.orb1} />
      <div style={s.orb2} />
      <div style={s.orb3} />

      <div style={s.shell}>
        <header style={s.header}>
          <img
            src="/logo.png"
            alt="Vibe Reply AI Logo"
            style={s.logo}
            onError={(e) => { e.target.style.display = "none"; }}
          />
          <div>
            <h1 style={s.title}>Vibe Reply AI</h1>
            <p style={s.subtitle}>Demo · AI-powered smart replies</p>
          </div>
        </header>

        <main style={s.card}>
          <section style={s.section}>
            <label style={s.label}>
              <span style={s.labelIcon}>💬</span> Message Received
            </label>
            <textarea
              style={s.textarea}
              rows={5}
              placeholder="Paste the message you received..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </section>

          <section style={s.section}>
            <label style={s.label}>
              <span style={s.labelIcon}>🎯</span> Your Vibe Instruction
              <span style={{ ...s.wordCount, color: vibeOver ? "#ff4d6d" : "#8b8fa8" }}>
                {vibeWords}/50 words
              </span>
            </label>
            <textarea
              style={{ ...s.textareaSmall, ...(vibeOver ? s.textareaError : {}) }}
              rows={2}
              placeholder="Describe how you want the reply (max 50 words)..."
              value={vibe}
              onChange={(e) => setVibe(e.target.value)}
            />
            {vibeOver && <p style={s.errorInline}>Trim your vibe to 50 words ✂️</p>}
          </section>

          <section style={s.section}>
            <label style={s.label}>
              <span style={s.labelIcon}>🎨</span> Reply Style
            </label>
            <div style={s.stylesGrid}>
              {STYLES_CONFIG.map((st) => (
                <button
                  key={st.id}
                  style={{ ...s.styleBtn, ...(style === st.id ? s.styleBtnActive : {}) }}
                  onClick={() => setStyle(st.id)}
                >
                  <span style={s.styleBtnEmoji}>{st.emoji}</span>
                  <span style={s.styleBtnLabel}>{st.label}</span>
                  <span style={s.styleBtnDesc}>{st.desc}</span>
                </button>
              ))}
            </div>
          </section>

          {error && <p style={s.errorBanner}>⚠️ {error}</p>}

          <button
            style={{ ...s.genBtn, ...(loading ? s.genBtnDisabled : {}) }}
            onClick={generate}
            disabled={loading}
          >
            {loading ? "Generating…" : "Generate Reply ✦"}
          </button>

          {loading && <LoadingDots />}

          {reply && !loading && (
            <div ref={replyRef} style={s.replyBox}>
              <div style={s.replyHeader}>
                <span style={s.replyTag}>✦ AI Reply · {style}</span>
                <CopyButton text={reply} />
              </div>
              <p style={s.replyText}>{reply}</p>
            </div>
          )}
        </main>

        <div style={{ height: 64 }} />
      </div>

      <div style={s.adBanner}>
        <span style={s.adLabel}>Ad</span>
        <span style={s.adText}>Your AdSense ad will appear here</span>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080b1a; font-family: 'DM Sans', sans-serif; }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-orb {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50% { opacity: 0.55; transform: scale(1.08); }
        }
        @keyframes loading-pulse {
          0%, 100% { box-shadow: 0 0 18px 6px #c026d3, 0 0 40px 12px #7c3aed44; }
          50% { box-shadow: 0 0 30px 12px #e879f9, 0 0 60px 20px #7c3aed66; }
        }
        textarea::placeholder { color: #4a4f6a; }
        textarea { outline: none; resize: vertical; }
        textarea:focus {
          border-color: #7c3aed !important;
          box-shadow: 0 0 0 3px #7c3aed28 !important;
        }
        button { cursor: pointer; border: none; }
      `}</style>
    </div>
  );
}

const s = {
  root: {
    minHeight: "100vh",
    background: "linear-gradient(145deg, #080b1a 0%, #0e0f2a 50%, #110820 100%)",
    position: "relative", overflowX: "hidden", paddingBottom: 80,
  },
  orb1: {
    position: "fixed", top: -120, left: -80, width: 400, height: 400,
    borderRadius: "50%", background: "radial-gradient(circle, #7c3aed55 0%, transparent 70%)",
    animation: "pulse-orb 6s ease-in-out infinite", pointerEvents: "none",
  },
  orb2: {
    position: "fixed", top: "30%", right: -100, width: 350, height: 350,
    borderRadius: "50%", background: "radial-gradient(circle, #c026d344 0%, transparent 70%)",
    animation: "pulse-orb 8s ease-in-out infinite 2s", pointerEvents: "none",
  },
  orb3: {
    position: "fixed", bottom: 80, left: "20%", width: 280, height: 280,
    borderRadius: "50%", background: "radial-gradient(circle, #2563eb33 0%, transparent 70%)",
    animation: "pulse-orb 10s ease-in-out infinite 4s", pointerEvents: "none",
  },
  shell: { maxWidth: 520, margin: "0 auto", padding: "0 16px", position: "relative", zIndex: 1 },
  header: { display: "flex", alignItems: "center", gap: 14, padding: "28px 0 20px" },
  logo: {
    width: 56, height: 56, borderRadius: 14, objectFit: "cover", flexShrink: 0,
    filter: "drop-shadow(0 0 10px #c026d388)",
  },
  title: {
    fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 24,
    letterSpacing: "-0.5px", lineHeight: 1.1,
    background: "linear-gradient(135deg, #e879f9, #818cf8, #38bdf8)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
  },
  subtitle: { fontSize: 12, color: "#6b7280", fontWeight: 400, marginTop: 2, letterSpacing: "0.5px", textTransform: "uppercase" },
  card: {
    background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 20, padding: "24px 20px", backdropFilter: "blur(20px)",
    boxShadow: "0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
    display: "flex", flexDirection: "column", gap: 20,
  },
  section: { display: "flex", flexDirection: "column", gap: 8 },
  label: { fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 600, color: "#a5b4fc", letterSpacing: "0.3px", display: "flex", alignItems: "center", gap: 6 },
  labelIcon: { fontSize: 14 },
  wordCount: { marginLeft: "auto", fontSize: 11, fontFamily: "'DM Sans', sans-serif", fontWeight: 400, transition: "color 0.2s" },
  textarea: { width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#e2e8f0", fontSize: 14, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6, padding: "12px 14px", transition: "border-color 0.2s, box-shadow 0.2s" },
  textareaSmall: { width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#e2e8f0", fontSize: 13, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.6, padding: "10px 14px", transition: "border-color 0.2s, box-shadow 0.2s" },
  textareaError: { borderColor: "#ff4d6d", boxShadow: "0 0 0 3px #ff4d6d22" },
  errorInline: { fontSize: 12, color: "#ff6b85", marginTop: -2 },
  stylesGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
  styleBtn: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "12px 10px", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, transition: "all 0.2s ease", color: "#94a3b8" },
  styleBtnActive: { background: "linear-gradient(135deg, rgba(124,58,237,0.25), rgba(192,38,211,0.2))", border: "1px solid rgba(168,85,247,0.5)", boxShadow: "0 0 16px rgba(168,85,247,0.2)", color: "#e879f9" },
  styleBtnEmoji: { fontSize: 20, lineHeight: 1 },
  styleBtnLabel: { fontFamily: "'Syne', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: "0.2px" },
  styleBtnDesc: { fontSize: 10, opacity: 0.65, fontFamily: "'DM Sans', sans-serif" },
  errorBanner: { background: "rgba(255,77,109,0.12)", border: "1px solid rgba(255,77,109,0.3)", borderRadius: 10, padding: "10px 14px", color: "#ff6b85", fontSize: 13 },
  genBtn: { width: "100%", padding: "15px", borderRadius: 14, background: "linear-gradient(135deg, #7c3aed, #c026d3, #7c3aed)", backgroundSize: "200% 100%", color: "#fff", fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, letterSpacing: "0.3px", boxShadow: "0 4px 24px rgba(124,58,237,0.45)", transition: "all 0.25s ease" },
  genBtnDisabled: { opacity: 0.6, cursor: "not-allowed", boxShadow: "none" },
  loadingWrap: { display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: "16px 0 4px" },
  loadingOrb: { width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #c026d3, #7c3aed)", animation: "loading-pulse 1.4s ease-in-out infinite" },
  loadingText: { color: "#a78bfa", fontSize: 14, fontFamily: "'DM Sans', sans-serif", fontWeight: 500, letterSpacing: "0.3px" },
  dots: { display: "inline-block", width: 20, textAlign: "left", color: "#e879f9" },
  replyBox: { background: "linear-gradient(135deg, rgba(124,58,237,0.12), rgba(192,38,211,0.08))", border: "1px solid rgba(168,85,247,0.3)", borderRadius: 14, padding: "16px", boxShadow: "0 0 30px rgba(124,58,237,0.1)", animation: "fadeSlideUp 0.5s ease forwards" },
  replyHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, gap: 8 },
  replyTag: { fontFamily: "'Syne', sans-serif", fontSize: 11, fontWeight: 700, color: "#a78bfa", textTransform: "uppercase", letterSpacing: "0.8px" },
  replyText: { color: "#e2e8f0", fontSize: 14, lineHeight: 1.75, fontFamily: "'DM Sans', sans-serif", whiteSpace: "pre-wrap" },
  copyBtn: { background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)", borderRadius: 8, color: "#c084fc", fontSize: 12, fontFamily: "'Syne', sans-serif", fontWeight: 600, padding: "6px 12px", transition: "all 0.2s", whiteSpace: "nowrap", flexShrink: 0 },
  copyBtnDone: { background: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.3)", color: "#34d399" },
  adBanner: { position: "fixed", bottom: 0, left: 0, right: 0, height: 48, background: "rgba(8,11,26,0.92)", borderTop: "1px solid rgba(255,255,255,0.07)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, zIndex: 100, padding: "0 16px" },
  adLabel: { background: "rgba(168,85,247,0.2)", border: "1px solid rgba(168,85,247,0.4)", borderRadius: 4, color: "#a78bfa", fontSize: 10, fontFamily: "'Syne', sans-serif", fontWeight: 700, padding: "2px 6px", letterSpacing: "0.5px", flexShrink: 0 },
  adText: { color: "#4b5563", fontSize: 12, fontFamily: "'DM Sans', sans-serif", textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
};

      
