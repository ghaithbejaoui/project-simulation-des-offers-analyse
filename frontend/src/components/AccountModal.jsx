import { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { fonts } from "../styles/theme";
import { useLanguage } from "../context/LanguageContext";

const API = "http://localhost:5000/api";
const getToken = () => localStorage.getItem("token");

const inputStyle = {
  background: "var(--bg-card)",
  border: "0.5px solid var(--border)",
  borderRadius: 10,
  color: "var(--text)",
  fontSize: 13,
  padding: "0 12px",
  outline: "none",
  width: "100%",
  height: 38,
  boxSizing: "border-box",
};

const labelStyle = {
  display: "block",
  fontSize: 11,
  color: "var(--text-dim)",
  fontWeight: 500,
  textTransform: "uppercase",
  marginBottom: 6,
  letterSpacing: "0.05em",
};

export default function AccountModal({ onClose, onSave }) {
  const { t } = useLanguage();
  const [form, setForm] = useState({ username: "", email: "", password: "", confirmPassword: "", currentPassword: "" });
  const [originalEmail, setOriginalEmail] = useState("");
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const mouseDownOnBackdrop = useRef(false);

  useEffect(() => {
    fetch(`${API}/users/me`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then(r => r.json())
      .then(data => {
        setForm(f => ({ ...f, username: data.username || "", email: data.email || "" }));
        setOriginalEmail(data.email || "");
        setFetching(false);
      })
      .catch(() => setFetching(false));
  }, []);

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError("");
    setSuccess("");
  };

  const emailChanged = form.email.trim() !== originalEmail;

  const handleSave = async () => {
    if (!form.username.trim() || !form.email.trim()) {
      setError(t("account.requiredFields"));
      return;
    }
    if (emailChanged && !form.currentPassword) {
      setError(t("account.currentPasswordRequired"));
      return;
    }
    if (form.password && !form.confirmPassword) {
      setError(t("account.confirmPasswordRequired"));
      return;
    }
    if (form.password && form.password !== form.confirmPassword) {
      setError(t("account.passwordMismatch"));
      return;
    }

    setSaving(true);
    setError("");
    try {
      const body = { username: form.username.trim(), email: form.email.trim() };
      if (form.password) body.password = form.password;
      if (emailChanged) body.currentPassword = form.currentPassword;

      const res = await fetch(`${API}/users/me`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || t("account.updateFailed"));

      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      const updated = { ...stored, username: form.username.trim() };
      localStorage.setItem("user", JSON.stringify(updated));

      setSuccess(t("account.updateSuccess"));
      onSave && onSave(updated);
      setTimeout(onClose, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return ReactDOM.createPortal(
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onMouseDown={e => { mouseDownOnBackdrop.current = e.target === e.currentTarget; }}
      onClick={e => { if (mouseDownOnBackdrop.current && e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)", borderRadius: 16, boxShadow: "0 8px 32px rgba(0,0,0,0.3)", width: "100%", maxWidth: 420, padding: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--blue-dim)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="1.8">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <h3 style={{ fontFamily: fonts.heading, fontSize: 17, fontWeight: 600, color: "var(--text)", margin: 0 }}>
              {t("account.title")}
            </h3>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-dim)", fontSize: 22, lineHeight: 1, padding: 4 }}>×</button>
        </div>

        {fetching ? (
          <div style={{ textAlign: "center", padding: "24px 0", color: "var(--text-muted)" }}>{t("common.loading")}</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={labelStyle}>{t("account.username")}</label>
              <input name="username" type="text" value={form.username} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>{t("account.email")}</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} style={inputStyle} />
            </div>
            {emailChanged && (
              <div style={{ padding: "12px 14px", background: "rgba(26,143,255,0.06)", border: "0.5px solid rgba(26,143,255,0.25)", borderRadius: 10 }}>
                <label style={{ ...labelStyle, color: "var(--blue)" }}>{t("account.currentPassword")}</label>
                <input name="currentPassword" type="password" value={form.currentPassword} onChange={handleChange} placeholder={t("account.currentPasswordPlaceholder")} style={inputStyle} autoFocus />
              </div>
            )}
            <div style={{ borderTop: "0.5px solid var(--border)", paddingTop: 16 }}>
              <label style={labelStyle}>
                {t("account.newPassword")}&nbsp;
                <span style={{ fontWeight: 400, textTransform: "none", fontSize: 10 }}>({t("account.optional")})</span>
              </label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder={t("account.passwordPlaceholder")}
                style={inputStyle}
                autoComplete="new-password"
              />
            </div>
            {form.password && (
              <div>
                <label style={labelStyle}>{t("account.confirmPassword")}</label>
                <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} style={inputStyle} />
              </div>
            )}
          </div>
        )}

        {error && (
          <div style={{ marginTop: 14, padding: "10px 14px", background: "rgba(227,91,91,0.08)", border: "0.5px solid rgba(227,91,91,0.3)", borderRadius: 8, color: "var(--red)", fontSize: 13 }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ marginTop: 14, padding: "10px 14px", background: "rgba(67,199,139,0.08)", border: "0.5px solid rgba(67,199,139,0.3)", borderRadius: 8, color: "var(--green)", fontSize: 13 }}>
            {success}
          </div>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          <button
            onClick={onClose}
            style={{ flex: 1, height: 40, background: "var(--bg-card)", border: "0.5px solid var(--border)", borderRadius: 10, color: "var(--text-muted)", fontSize: 13, fontWeight: 500, cursor: "pointer" }}
          >
            {t("common.cancel")}
          </button>
          <button
            onClick={handleSave}
            disabled={saving || fetching}
            style={{ flex: 1, height: 40, background: "linear-gradient(135deg, #0d5fd4 0%, #1a8fff 100%)", border: "none", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 500, cursor: (saving || fetching) ? "not-allowed" : "pointer", opacity: (saving || fetching) ? 0.6 : 1, boxShadow: "0 4px 16px rgba(26,143,255,0.28)", transition: "all 0.2s ease" }}
          >
            {saving ? t("common.saving") : t("common.save")}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
