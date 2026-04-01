import { useState, useEffect } from "react";

const ROLES = {
  admin: { label: "Administrator", color: "#e35b35", icon: "⬡" },
  analyst: { label: "Analyst", color: "#1a8fff", icon: "◈" },
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeRole, setActiveRole] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Invalid credentials.");
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.root}>
      {/* Animated grid background */}
      <div style={styles.gridOverlay} />

      {/* Signal pulse rings */}
      <div style={styles.pulseRing1} />
      <div style={styles.pulseRing2} />
      <div style={styles.pulseRing3} />

      {/* Floating particles */}
      {mounted && (
        <div style={styles.particles}>
          {[...Array(12)].map((_, i) => (
            <div key={i} style={{ ...styles.particle, ...particleStyle(i) }} />
          ))}
        </div>
      )}

      <div style={{ ...styles.card, ...(mounted ? styles.cardVisible : {}) }}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logoWrap}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <polygon points="24,4 44,36 4,36" fill="none" stroke="#1a8fff" strokeWidth="2" opacity="0.6" />
              <polygon points="24,11 38,34 10,34" fill="none" stroke="#1a8fff" strokeWidth="1" opacity="0.35" />
              <circle cx="24" cy="24" r="5" fill="#1a8fff" opacity="0.9" />
              <line x1="24" y1="4" x2="24" y2="19" stroke="#1a8fff" strokeWidth="1.5" opacity="0.5" />
              <line x1="44" y1="36" x2="31" y2="28" stroke="#1a8fff" strokeWidth="1.5" opacity="0.5" />
              <line x1="4" y1="36" x2="17" y2="28" stroke="#1a8fff" strokeWidth="1.5" opacity="0.5" />
            </svg>
          </div>
          <h1 style={styles.brand}>SimTélécom</h1>
          <p style={styles.subtitle}>Telecom Simulation & BI Analytics Platform</p>
          <div style={styles.divider} />
        </div>

        {/* Role selector */}
        <div style={styles.roleRow}>
          {Object.entries(ROLES).map(([key, r]) => (
            <button
              key={key}
              onClick={() => {
                setActiveRole(key === activeRole ? null : key);
                setError("");
              }}
              style={{
                ...styles.roleBtn,
                ...(activeRole === key ? { ...styles.roleBtnActive, borderColor: r.color, color: r.color } : {}),
              }}
              title={r.label}
            >
              <span style={{ fontSize: 16 }}>{r.icon}</span>
              <span style={styles.roleLabel}>{r.label}</span>
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form} noValidate>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Email address</label>
            <div style={styles.inputWrap}>
              <svg style={styles.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="4" width="20" height="16" rx="3" />
                <path d="M2 8l10 6 10-6" />
              </svg>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="name@operator.com"
                style={styles.input}
                autoComplete="email"
              />
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrap}>
              <svg style={styles.inputIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                placeholder="••••••••"
                style={{ ...styles.input, paddingRight: 44 }}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                style={styles.eyeBtn}
                tabIndex={-1}
                aria-label={showPass ? "Hide" : "Show"}
              >
                {showPass ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div style={styles.errorBox}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#e35b35" strokeWidth="2" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div style={styles.forgotRow}>
            <a href="/forgot-password" style={styles.forgot}>Forgot password?</a>
          </div>

          <button type="submit" disabled={loading} style={{ ...styles.submitBtn, ...(loading ? styles.submitBtnLoading : {}) }}>
            {loading ? (
              <span style={styles.spinnerWrap}>
                <span style={styles.spinner} />
                Signing in…
              </span>
            ) : (
              <>
                Sign in
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: 8 }}>
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div style={styles.footer}>
          <span style={styles.footerText}>Don't have an account?</span>
          <a href="/register" style={styles.footerLink}>Create account</a>
        </div>

        {/* Bottom badge */}
        <div style={styles.badge}>
          <span style={styles.badgeDot} />
          <span style={styles.badgeText}>Secured by JWT · Encrypted data</span>
        </div>
      </div>

      {/* Bottom version tag */}
      <p style={styles.version}>SimTélécom v1.0 · PFE 2025</p>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Space+Grotesk:wght@400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes pulse1 {
          0%, 100% { transform: scale(1); opacity: 0.12; }
          50% { transform: scale(1.08); opacity: 0.06; }
        }
        @keyframes pulse2 {
          0%, 100% { transform: scale(1); opacity: 0.08; }
          50% { transform: scale(1.05); opacity: 0.04; }
        }
        @keyframes pulse3 {
          0%, 100% { transform: scale(1); opacity: 0.05; }
          50% { transform: scale(1.03); opacity: 0.02; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.4; }
          33% { transform: translateY(-18px) rotate(120deg); opacity: 0.7; }
          66% { transform: translateY(10px) rotate(240deg); opacity: 0.3; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes gridScroll {
          from { background-position: 0 0; }
          to { background-position: 40px 40px; }
        }

        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0px 1000px #0f1621 inset !important;
          -webkit-text-fill-color: #c8d4e8 !important;
          caret-color: #c8d4e8 !important;
        }
        input:focus {
          outline: none !important;
        }
      `}</style>
    </div>
  );
}

function particleStyle(i) {
  const sizes = [4, 6, 3, 5, 4, 7, 3, 5, 4, 6, 3, 4];
  const delays = [0, 1.2, 2.4, 0.6, 1.8, 3.0, 0.3, 2.1, 1.5, 0.9, 2.7, 1.1];
  const durations = [6, 8, 7, 9, 6.5, 8.5, 7.5, 6.2, 9.5, 7.8, 6.8, 8.2];
  const tops = [10, 20, 65, 80, 35, 15, 75, 45, 90, 30, 55, 5];
  const lefts = [5, 88, 12, 92, 72, 50, 30, 78, 18, 60, 42, 85];
  const colors = ["#1a8fff", "#43c78b", "#1a8fff", "#e35b35", "#1a8fff", "#43c78b"];
  return {
    width: sizes[i],
    height: sizes[i],
    borderRadius: "50%",
    background: colors[i % 6],
    position: "absolute",
    top: `${tops[i]}%`,
    left: `${lefts[i]}%`,
    opacity: 0,
    animation: `float ${durations[i]}s ease-in-out ${delays[i]}s infinite`,
  };
}

const styles = {
  root: {
    minHeight: "100vh",
    width: "100%",
    background: "#070d18",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    padding: "24px 16px",
  },
  gridOverlay: {
    position: "absolute",
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(26,143,255,0.06) 1px, transparent 1px),
      linear-gradient(90deg, rgba(26,143,255,0.06) 1px, transparent 1px)
    `,
    backgroundSize: "40px 40px",
    animation: "gridScroll 8s linear infinite",
    pointerEvents: "none",
  },
  pulseRing1: {
    position: "absolute",
    width: 700,
    height: 700,
    borderRadius: "50%",
    border: "1.5px solid rgba(26,143,255,0.12)",
    top: "50%",
    left: "50%",
    transform: "translate(-50%,-50%)",
    animation: "pulse1 6s ease-in-out infinite",
    pointerEvents: "none",
  },
  pulseRing2: {
    position: "absolute",
    width: 900,
    height: 900,
    borderRadius: "50%",
    border: "1px solid rgba(26,143,255,0.08)",
    top: "50%",
    left: "50%",
    transform: "translate(-50%,-50%)",
    animation: "pulse2 8s ease-in-out infinite 1s",
    pointerEvents: "none",
  },
  pulseRing3: {
    position: "absolute",
    width: 1100,
    height: 1100,
    borderRadius: "50%",
    border: "1px solid rgba(26,143,255,0.05)",
    top: "50%",
    left: "50%",
    transform: "translate(-50%,-50%)",
    animation: "pulse3 10s ease-in-out infinite 2s",
    pointerEvents: "none",
  },
  particles: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
  },
  particle: {},
  card: {
    position: "relative",
    zIndex: 10,
    width: "100%",
    maxWidth: 420,
    background: "rgba(13, 22, 40, 0.85)",
    border: "0.5px solid rgba(26, 143, 255, 0.22)",
    borderRadius: 20,
    padding: "36px 36px 28px",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    boxShadow: "0 0 60px rgba(26, 143, 255, 0.08), 0 24px 48px rgba(0,0,0,0.5)",
    opacity: 0,
    transform: "translateY(24px)",
    transition: "opacity 0.55s ease, transform 0.55s ease",
  },
  cardVisible: {
    opacity: 1,
    transform: "translateY(0)",
  },
  header: {
    textAlign: "center",
    marginBottom: 24,
  },
  logoWrap: {
    display: "flex",
    justifyContent: "center",
    marginBottom: 14,
  },
  brand: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 24,
    fontWeight: 600,
    color: "#e8f0ff",
    letterSpacing: "-0.5px",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 12,
    color: "rgba(200,212,232,0.5)",
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    fontWeight: 400,
    marginBottom: 20,
  },
  divider: {
    height: 1,
    background: "linear-gradient(90deg, transparent, rgba(26,143,255,0.3), transparent)",
  },
  roleRow: {
    display: "flex",
    gap: 8,
    marginBottom: 24,
  },
  roleBtn: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    padding: "8px 4px",
    background: "rgba(255,255,255,0.03)",
    border: "0.5px solid rgba(255,255,255,0.1)",
    borderRadius: 10,
    cursor: "pointer",
    color: "rgba(200,212,232,0.45)",
    fontSize: 10,
    letterSpacing: "0.04em",
    fontFamily: "'DM Sans', sans-serif",
    transition: "all 0.2s ease",
  },
  roleBtnActive: {
    background: "rgba(26,143,255,0.08)",
    color: "#1a8fff",
  },
  roleLabel: {
    fontSize: 10,
    fontWeight: 500,
    letterSpacing: "0.03em",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 7,
  },
  label: {
    fontSize: 12,
    fontWeight: 500,
    color: "rgba(200,212,232,0.6)",
    letterSpacing: "0.03em",
  },
  inputWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  inputIcon: {
    position: "absolute",
    left: 14,
    color: "rgba(200,212,232,0.35)",
    pointerEvents: "none",
    zIndex: 1,
  },
  input: {
    width: "100%",
    height: 44,
    background: "rgba(255,255,255,0.04)",
    border: "0.5px solid rgba(26,143,255,0.2)",
    borderRadius: 10,
    color: "#c8d4e8",
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    paddingLeft: 40,
    paddingRight: 16,
    transition: "border-color 0.2s, background 0.2s",
    letterSpacing: "0.01em",
  },
  eyeBtn: {
    position: "absolute",
    right: 12,
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "rgba(200,212,232,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
    borderRadius: 6,
    transition: "color 0.2s",
  },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 14px",
    background: "rgba(227, 91, 53, 0.08)",
    border: "0.5px solid rgba(227, 91, 53, 0.3)",
    borderRadius: 10,
    color: "#f09070",
    fontSize: 13,
  },
  forgotRow: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: -4,
  },
  forgot: {
    fontSize: 12,
    color: "rgba(26,143,255,0.7)",
    textDecoration: "none",
    transition: "color 0.2s",
  },
  submitBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: 46,
    background: "linear-gradient(135deg, #0d5fd4 0%, #1a8fff 100%)",
    border: "none",
    borderRadius: 10,
    color: "#fff",
    fontSize: 14,
    fontWeight: 500,
    fontFamily: "'DM Sans', sans-serif",
    cursor: "pointer",
    letterSpacing: "0.02em",
    transition: "opacity 0.2s, transform 0.15s",
    marginTop: 4,
    boxShadow: "0 4px 20px rgba(26,143,255,0.3)",
  },
  submitBtnLoading: {
    opacity: 0.7,
    cursor: "not-allowed",
  },
  spinnerWrap: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  spinner: {
    width: 16,
    height: 16,
    border: "2px solid rgba(255,255,255,0.3)",
    borderTop: "2px solid #fff",
    borderRadius: "50%",
    display: "inline-block",
    animation: "spin 0.7s linear infinite",
  },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 20,
    paddingTop: 20,
    borderTop: "0.5px solid rgba(255,255,255,0.07)",
  },
  footerText: {
    fontSize: 13,
    color: "rgba(200,212,232,0.4)",
  },
  footerLink: {
    fontSize: 13,
    color: "#1a8fff",
    textDecoration: "none",
    fontWeight: 500,
  },
  badge: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 16,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#43c78b",
    boxShadow: "0 0 6px #43c78b",
    display: "inline-block",
  },
  badgeText: {
    fontSize: 11,
    color: "rgba(200,212,232,0.3)",
    letterSpacing: "0.04em",
  },
  version: {
    position: "relative",
    zIndex: 10,
    marginTop: 24,
    fontSize: 11,
    color: "rgba(200,212,232,0.2)",
    letterSpacing: "0.04em",
  },
};
