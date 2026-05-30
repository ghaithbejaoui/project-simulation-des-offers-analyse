import ReactDOM from "react-dom";
import { useLanguage } from "../context/LanguageContext";

export default function ConfirmModal({ title, message, onConfirm, onCancel, confirmLabel }) {
  const { t } = useLanguage();

  return ReactDOM.createPortal(
    <div
      onClick={onCancel}
      style={{
        position: "fixed", inset: 0, zIndex: 9000,
        background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "var(--bg-card)",
          border: "0.5px solid var(--border)",
          borderRadius: 16,
          padding: "28px 32px",
          width: 420,
          maxWidth: "90vw",
          boxShadow: "0 8px 40px rgba(0,0,0,0.35)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
            background: "rgba(227,91,91,0.12)", border: "0.5px solid rgba(227,91,91,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, color: "var(--red, #e35b5b)",
          }}>
            ⚠
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", margin: 0 }}>{title}</h3>
        </div>

        <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.65, margin: "0 0 24px 0" }}>
          {message}
        </p>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              display: "inline-flex", alignItems: "center",
              padding: "0 20px", height: 38,
              background: "var(--bg-card)", border: "0.5px solid var(--border)",
              borderRadius: 10, color: "var(--text-muted)", fontSize: 13, fontWeight: 500,
              cursor: "pointer", transition: "all 0.2s ease",
            }}
          >
            {t("common.cancel")}
          </button>
          <button
            onClick={onConfirm}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "0 20px", height: 38,
              background: "linear-gradient(135deg, #e35b5b 0%, #c0392b 100%)",
              border: "none", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 500,
              cursor: "pointer", boxShadow: "0 4px 16px rgba(227,91,91,0.28)",
              transition: "all 0.2s ease",
            }}
          >
            {confirmLabel || t("common.delete")}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
