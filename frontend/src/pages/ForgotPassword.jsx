import { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email) {
      setError(t("common.error"));
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send reset email");
      setSuccess(true);
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
                disabled={loading || success}
              />
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

          {success ? (
            <div style={styles.successBox}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#43c78b" strokeWidth="2" style={{ flexShrink: 0 }}>
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <span>If your email exists in our system, a password reset link has been sent. Please check your inbox (and spam folder).</span>
            </div>
          ) : (
            <button type="submit" disabled={loading} style={{ ...styles.submitBtn, ...(loading ? styles.submitBtnLoading : {}) }}>
              {loading ? (
                <span style={styles.spinnerWrap}>
                  <span style={styles.spinner} />
                  Sending...
                </span>
              ) : (
                "Send Reset Link"
              )}
            </button>
          )}

          <div style={styles.footer}>
            <span style={styles.footerText}>Remembered your password?</span>
            <a href="/login" style={styles.footerLink}>Login</a>
          </div>
        </form>

        {/* Bottom badge */}
        <div style={styles.badge}>
          <span style={styles.badgeDot} />
          <span style={styles.badgeText}>Secured by JWT · Encrypted data</span>
        </div>
      </div>

      {/* Bottom version tag */}
      <p style={styles.version}>SimTélécom · PFE 2026</p>

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

        @keyframes rolePulse {
            0%, 60% { 
                background: rgba(13, 22, 40, 0.6); 
                border-color: rgba(227,91,91,0.12); 
                color: rgba(200,212,232,0.25);
                box-shadow: none;
            }
            80% { 
                background: rgba(227,91,91,0.25); 
                border-color: #e35b5b; 
                color: #ffffff;
                box-shadow: 0 0 40px rgba(227,91,91,0.5), 0 0 80px rgba(227,91,91,0.25);
            }
            100% { 
                background: rgba(13, 22, 40, 0.6); 
                border-color: rgba(227,91,91,0.12); 
                color: rgba(200,212,232,0.25);
                box-shadow: none;
            }
        }

        @keyframes rolePulseAnalyst {
            0%, 60% { 
                background: rgba(13, 22, 40, 0.6); 
                border-color: rgba(26,143,255,0.12); 
                color: rgba(200,212,232,0.25);
                box-shadow: none;
            }
            80% { 
                background: rgba(26,143,255,0.25); 
                border-color: #1a8fff; 
                color: #ffffff;
                box-shadow: 0 0 40px rgba(26,143,255,0.5), 0 0 80px rgba(26,143,255,0.25);
            }
            100% { 
                background: rgba(13, 22, 40, 0.6); 
                border-color: rgba(26,143,255,0.12); 
                color: rgba(200,212,232,0.25);
                box-shadow: none;
            }
        }

        @keyframes rolePulseGuest {
            0%, 60% { 
                background: rgba(13, 22, 40, 0.6); 
                border-color: rgba(67,199,139,0.12); 
                color: rgba(200,212,232,0.25);
                box-shadow: none;
            }
            80% { 
                background: rgba(67,199,139,0.25); 
                border-color: #43c78b; 
                color: #ffffff;
                box-shadow: 0 0 40px rgba(67,199,139,0.5), 0 0 80px rgba(67,199,139,0.25);
            }
            100% { 
                background: rgba(13, 22, 40, 0.6); 
                border-color: rgba(67,199,139,0.12); 
                color: rgba(200,212,232,0.25);
                box-shadow: none;
            }
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
  successBox: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 14px",
    background: "rgba(67,199,139,0.08)",
    border: "0.5px solid rgba(67,199,139,0.3)",
    borderRadius: 10,
    color: "#43c78b",
    fontSize: 13,
  },
  submitBtn: {
    width: "100%",
    height: 46,
    background: "linear-gradient(135deg, #0d5fd4 0%, #1a8fff 100%)",
    border: "none",
    borderRadius: 10,
    color: "#fff",
    fontSize: 14,
    fontWeight: 500,
    fontFamily: "'DM Sans', sans-serif",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    boxShadow: "0 4px 16px rgba(26,143,255,0.28)",
    transition: "opacity 0.2s, transform 0.15s",
    marginTop: 8,
  },
  submitBtnLoading: {
    opacity: 0.7,
  },
  spinnerWrap: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  spinner: {
    width: 16,
    height: 16,
    border: "2px solid rgba(255,255,255,0.3)",
    borderTop: "2px solid #fff",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
  },
  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 24,
  },
  footerText: {
    fontSize: 12,
    color: "rgba(200,212,232,0.5)",
  },
  footerLink: {
    fontSize: 12,
    color: "#1a8fff",
    textDecoration: "none",
    fontWeight: 500,
  },
  badge: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 20,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#43c78b",
    boxShadow: "0 0 6px #43c78b",
  },
  badgeText: {
    fontSize: 10,
    color: "rgba(200,212,232,0.4)",
    letterSpacing: "0.04em",
  },
  version: {
    position: "absolute",
    bottom: 20,
    fontSize: 11,
    color: "rgba(200,212,232,0.25)",
    letterSpacing: "0.02em",
  },
};