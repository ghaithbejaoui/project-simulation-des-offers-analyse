import { useState, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import { useNavigate } from "react-router-dom";
import { fonts } from "../styles/theme";
import { isAdmin } from "../App";
import { useLanguage } from "../context/LanguageContext";
import ConfirmModal from "../components/ConfirmModal";

const cardStyle = {
  background: "var(--bg-card)",
  border: "0.5px solid var(--border)",
  borderRadius: 16,
  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
};

const btnPrimaryStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "0 20px",
  height: 40,
  background: "linear-gradient(135deg, #0d5fd4 0%, #1a8fff 100%)",
  border: "none",
  borderRadius: 10,
  color: "#fff",
  fontSize: 13,
  fontWeight: 500,
  cursor: "pointer",
  boxShadow: "0 4px 16px rgba(26,143,255,0.28)",
  transition: "all 0.2s ease",
};

const btnGhostStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "0 20px",
  height: 40,
  background: "var(--bg-card)",
  border: "0.5px solid var(--border)",
  borderRadius: 10,
  color: "var(--text-muted)",
  fontSize: 13,
  fontWeight: 500,
  cursor: "pointer",
  transition: "all 0.2s ease",
};

const btnDangerStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "0 20px",
  height: 40,
  background: "linear-gradient(135deg, #e35b5b 0%, #c0392b 100%)",
  border: "none",
  borderRadius: 10,
  color: "#fff",
  fontSize: 13,
  fontWeight: 500,
  cursor: "pointer",
  boxShadow: "0 4px 16px rgba(227,91,91,0.28)",
  transition: "all 0.2s ease",
};

const inputStyle = {
  background: "var(--bg-card)",
  border: "0.5px solid var(--border)",
  borderRadius: 10,
  color: "var(--text)",
  fontSize: 13,
  padding: "0 12px",
  outline: "none",
  transition: "border-color 0.2s ease",
};

const API = "http://localhost:5000/api";
const getHeaders = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` });

const EMPTY_FORM = {
  label: "", minutes_avg: "", sms_avg: "", data_avg_gb: "",
  night_usage_pct: 0, roaming_days: 0, budget_max: "", priority: "BALANCED",
};

// ─── Usage bar ────────────────────────────────────────────────────────────────
function UsageBar({ value, max, color }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div style={{ height: 4, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 3, transition: "width 0.6s ease" }} />
    </div>
  );
}

// ─── Profile card ─────────────────────────────────────────────────────────────
function ProfileCard({ profile, onEdit, onDelete, onSimulate, showActions }) {
  const { t } = useLanguage();
  const displayName = profile.label || profile.name || "Unknown";
  const displayMinutes = profile.minutes_avg ?? profile.avg_minutes ?? 0;
  const displaySms = profile.sms_avg ?? profile.avg_sms ?? 0;
  const displayData = profile.data_avg_gb ?? profile.avg_data_gb ?? 0;
  
  const segColors = { POSTPAID: "var(--blue)", PREPAID: "var(--green)", BUSINESS: "var(--orange)", DATA_ONLY: "var(--yellow)" };
  const color = segColors[profile.segment] || "var(--text-muted)";
  const initials = displayName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "P";

  return (
    <div style={{ ...cardStyle, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14, position: "relative", overflow: "hidden", transition: "border-color 0.2s" }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "var(--border-hover)"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}>
      <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: color, borderRadius: "0 0 0 0" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color.replace('var(--', '').replace(')', '')}18`, border: `0.5px solid ${color.replace('var(--', '').replace(')', '')}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 600, color, flexShrink: 0 }}>
          {initials}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text)" }}>{displayName}</p>
          <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 5, background: `${color.replace('var(--', '').replace(')', '')}15`, color, fontWeight: 500 }}>
            {profile.segment?.replace("_", " ")}
          </span>
        </div>
        <p style={{ fontSize: 16, fontWeight: 600, fontFamily: fonts.heading, color: "var(--blue)" }}>
          {Number(profile.budget_max).toFixed(0)} TND
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: "var(--text-dim)" }}>Data</span>
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{displayData} GB/mo</span>
          </div>
          <UsageBar value={displayData} max={100} color="var(--blue)" />
        </div>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: "var(--text-dim)" }}>Voice</span>
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{displayMinutes} min/mo</span>
          </div>
          <UsageBar value={displayMinutes} max={1000} color="var(--green)" />
        </div>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: "var(--text-dim)" }}>SMS</span>
            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{displaySms} /mo</span>
          </div>
          <UsageBar value={displaySms} max={500} color="var(--yellow)" />
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {profile.roaming_days > 0 && (
          <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 4, background: "rgba(240,180,41,0.1)", color: "var(--yellow)", border: "0.5px solid rgba(240,180,41,0.25)" }}>
            ✈ {profile.roaming_days}d roaming
          </span>
        )}
        {profile.night_usage_pct > 0 && (
          <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 4, background: "rgba(26,143,255,0.1)", color: "var(--blue)", border: "0.5px solid rgba(26,143,255,0.25)" }}>
            🌙 {profile.night_usage_pct}% night
          </span>
        )}
        <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 4, background: "rgba(200,212,232,0.06)", color: "var(--text-dim)", border: `0.5px solid var(--border)` }}>
          Priority: {profile.priority}
        </span>
      </div>

      <div style={{ display: "flex", gap: 8, paddingTop: 4, borderTop: `0.5px solid rgba(26,143,255,0.08)` }}>
        <button onClick={() => onSimulate(profile)} style={{ ...btnPrimaryStyle, flex: 1, height: 34, fontSize: 12, justifyContent: "center" }}>
          {t("profiles.card.simulate")}
        </button>
        {showActions && (
          <>
            <button onClick={() => onEdit(profile)} style={{ ...btnGhostStyle, height: 34, padding: "0 14px", fontSize: 12 }}>{t("common.edit")}</button>
            <button onClick={() => onDelete(profile.profile_id || profile.id)} style={{ ...btnDangerStyle, height: 34, padding: "0 12px", fontSize: 12 }}>✕</button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Reusable Form Field ───────────────────────────────────────────────────────
function FormField({ label, value, onChange, type = "text", placeholder }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 11, color: "var(--text-dim)", fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" }}>{label}</label>
      <input type={type} value={value ?? ""} placeholder={placeholder} onChange={e => onChange(e.target.value)}
        style={{ ...inputStyle, height: 38, fontSize: 13 }} />
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function ProfileModal({ profile, onClose, onSave }) {
  const { t } = useLanguage();
  const [form, setForm] = useState(profile || EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.label || !form.budget_max) { setError("Label and budget are required."); return; }
    setSaving(true);
    try {
      const profileId = profile?.profile_id;
      const method = profileId ? "PUT" : "POST";
      const url = profileId ? `${API}/customer-profiles/${profileId}` : `${API}/customer-profiles`;
      const { label, minutes_avg, sms_avg, data_avg_gb, night_usage_pct, roaming_days, budget_max, priority } = form;
      const payload = { label, minutes_avg, sms_avg, data_avg_gb, night_usage_pct, roaming_days, budget_max, priority };
      const res = await fetch(url, { method, headers: getHeaders(), body: JSON.stringify(payload) });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || body.message || "Save failed");
      }
      onSave();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

return (
    <div style={{ position: "fixed", inset: 0, margin: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ ...cardStyle, width: "100%", maxWidth: 580, maxHeight: "90vh", overflowY: "auto", padding: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
           <h3 style={{ fontFamily: fonts.heading, fontSize: 17, fontWeight: 600, color: "var(--text)" }}>
             {profile?.profile_id ? t("profiles.editProfile") : t("profiles.newProfile")}
           </h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-dim)", fontSize: 20 }}>×</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={{ gridColumn: "span 2" }}><FormField label={t("profiles.form.profileLabel")} value={form.label} onChange={v => set("label", v)} placeholder="e.g. Ahmed Bejaoui" /></div>
          <div>
            <label style={{ fontSize: 11, color: "var(--text-dim)", fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>{t("profiles.form.priority")}</label>
            <select value={form.priority} onChange={e => set("priority", e.target.value)} style={{ ...inputStyle, height: 38, fontSize: 13 }}>
              {["BALANCED","PRICE","QUALITY"].map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <FormField label={t("profiles.form.avgData")} value={form.data_avg_gb} onChange={v => set("data_avg_gb", v)} type="number" placeholder="e.g. 20" />
          <FormField label={t("profiles.form.avgMinutes")} value={form.minutes_avg} onChange={v => set("minutes_avg", v)} type="number" placeholder="e.g. 200" />
          <FormField label={t("profiles.form.avgSms")} value={form.sms_avg} onChange={v => set("sms_avg", v)} type="number" placeholder="e.g. 50" />
          <FormField label={t("profiles.form.maxBudget")} value={form.budget_max} onChange={v => set("budget_max", v)} type="number" placeholder="e.g. 60" />
          <FormField label={t("profiles.form.nightUsage")} value={form.night_usage_pct} onChange={v => set("night_usage_pct", v)} type="number" placeholder="0–100" />
          <FormField label={t("profiles.form.roamingDays")} value={form.roaming_days} onChange={v => set("roaming_days", v)} type="number" placeholder="0" />
        </div>
        {error && <p style={{ marginTop: 12, fontSize: 13, color: "var(--red)" }}>{error}</p>}
        <div style={{ display: "flex", gap: 10, marginTop: 22, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={btnGhostStyle}>{t("common.cancel")}</button>
          <button onClick={handleSave} disabled={saving} style={{ ...btnPrimaryStyle, opacity: saving ? 0.7 : 1 }}>
            {saving ? t("common.saving") : t("common.save")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Profiles() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [search, setSearch]     = useState("");
  const [segment, setSegment]   = useState("ALL");
  const [modal, setModal]       = useState(null);
  const [view, setView]         = useState("grid"); // "grid" | "table"
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch(`${API}/customer-profiles`, { headers: getHeaders() });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `Server error ${res.status}`);
      }
      setProfiles(await res.json());
    } catch (e) {
      setFetchError(e.message);
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  }, []);

   useEffect(() => { load(); }, [load]);

   // Disable body scroll when modal is open
   useEffect(() => {
     if (modal) {
       document.body.style.overflow = "hidden";
     } else {
       document.body.style.overflow = "";
     }
     return () => { document.body.style.overflow = ""; };
   }, [modal]);

   const handleDelete = async (id) => {
    try {
      await fetch(`${API}/customer-profiles/${id}`, { method: "DELETE", headers: getHeaders() });
      setProfiles(p => p.filter(x => (x.profile_id || x.id) !== id));
    } catch {}
    finally { setConfirmDelete(null); }
  };

  const handleSimulate = (profile) => {
    localStorage.setItem("sim_profile", JSON.stringify(profile));
    navigate("/simulation");
  };

  const filtered = profiles.filter(p => {
    const displayName = p.label || p.name || "";
    const matchSearch = displayName.toLowerCase().includes(search.toLowerCase());
    const matchSeg    = segment === "ALL" || p.segment === segment;
    return matchSearch && matchSeg;
  });

  return (
    <div style={{ animation: "fadeUp 0.4s ease both" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
        <div>
          <h2 style={{ fontFamily: fonts.heading, fontSize: 20, fontWeight: 600, color: "var(--text)" }}>{t("profiles.title")}</h2>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 3 }}>
            {t("profiles.subtitle").replace("{count}", profiles.length)}
          </p>
        </div>
        {isAdmin() && (
          <button onClick={() => setModal("new")} style={{ ...btnPrimaryStyle, height: 40 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            {t("profiles.newProfile")}
          </button>
        )}
      </div>

      {/* Filters */}
      <div style={{ ...cardStyle, padding: "14px 18px", marginBottom: 18, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-dim)" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t("profiles.searchPlaceholder")}
            style={{ ...inputStyle, height: 36, paddingLeft: 36, fontSize: 13 }} />
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {["ALL","PREPAID","POSTPAID","BUSINESS","DATA_ONLY"].map(s => (
            <button key={s} onClick={() => setSegment(s)}
              style={{ height: 34, padding: "0 12px", borderRadius: 8, border: `0.5px solid ${segment === s ? "var(--blue)" : "var(--border)"}`,
                background: segment === s ? "rgba(26,143,255,0.15)" : "transparent", color: segment === s ? "var(--blue)" : "var(--text-muted)",
                cursor: "pointer", fontSize: 12, transition: "all 0.18s" }}>
              {s === "ALL" ? t("common.all") : s.replace("_"," ")}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: 3, border: `0.5px solid var(--border)` }}>
          {["grid","table"].map(v => (
            <button key={v} onClick={() => setView(v)}
              style={{ height: 28, padding: "0 12px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, transition: "all 0.18s",
                background: view === v ? "rgba(26,143,255,0.15)" : "transparent", color: view === v ? "var(--blue)" : "var(--text-dim)" }}>
              {v === "grid" ? `⊞ ${t("profiles.view.grid")}` : `☰ ${t("profiles.view.list")}`}
            </button>
          ))}
        </div>
        <span style={{ fontSize: 12, color: "var(--text-dim)" }}>{t("profiles.results").replace("{count}", filtered.length)}</span>
      </div>

      {fetchError && (
        <div style={{ ...cardStyle, padding: "20px 24px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between", borderColor: "rgba(227,91,91,0.4)" }}>
          <span style={{ fontSize: 13, color: "var(--red, #e35b5b)" }}>Connection error: {fetchError}</span>
          <button onClick={load} style={{ ...btnPrimaryStyle, height: 32, fontSize: 12 }}>Retry</button>
        </div>
      )}
      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-dim)" }}>{t("profiles.loading")}</div>
      ) : view === "grid" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {filtered.map(p => (
            <ProfileCard key={p.id} profile={p} onEdit={setModal} onDelete={(id) => setConfirmDelete(id)} onSimulate={handleSimulate} showActions={isAdmin()} />
          ))}
        </div>
      ) : (
        <div style={{ ...cardStyle, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `0.5px solid var(--border)` }}>
                {[t("profiles.table.name"),t("profiles.table.segment"),t("profiles.table.data"),t("profiles.table.minutes"),t("profiles.table.sms"),t("profiles.table.budget"),t("profiles.table.nightPercent"),t("profiles.table.roaming"),t("profiles.table.actions")].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 500, color: "var(--text-dim)", letterSpacing: "0.05em", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={p.id} style={{ borderBottom: `0.5px solid rgba(26,143,255,0.06)`, background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(26,143,255,0.05)"}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)"}>
                  <td style={{ padding: "11px 16px", color: "var(--text)", fontWeight: 500 }}>{p.label || p.name}</td>
                  <td style={{ padding: "11px 16px" }}>
                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 5, background: "rgba(26,143,255,0.1)", color: "var(--blue)" }}>{p.segment?.replace("_"," ")}</span>
                  </td>
                  <td style={{ padding: "11px 16px", color: "var(--text-muted)" }}>{p.data_avg_gb ?? p.avg_data_gb}</td>
                  <td style={{ padding: "11px 16px", color: "var(--text-muted)" }}>{p.minutes_avg ?? p.avg_minutes}</td>
                  <td style={{ padding: "11px 16px", color: "var(--text-muted)" }}>{p.sms_avg ?? p.avg_sms}</td>
                  <td style={{ padding: "11px 16px", color: "var(--blue)", fontWeight: 600 }}>{Number(p.budget_max).toFixed(2)}</td>
                  <td style={{ padding: "11px 16px", color: "var(--text-muted)" }}>{p.night_usage_pct}%</td>
                  <td style={{ padding: "11px 16px", color: "var(--text-muted)" }}>{p.roaming_days}d</td>
                  <td style={{ padding: "11px 16px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => handleSimulate(p)} style={{ ...btnPrimaryStyle, height: 30, padding: "0 10px", fontSize: 12 }}>{t("profiles.card.simulate")}</button>
                      {isAdmin() && (
                        <>
                          <button onClick={() => setModal(p)} style={{ ...btnGhostStyle, height: 30, padding: "0 10px", fontSize: 12 }}>{t("common.edit")}</button>
                          <button onClick={() => setConfirmDelete(p.id)} style={{ ...btnDangerStyle, height: 30, padding: "0 10px", fontSize: 12 }}>✕</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

       {modal && ReactDOM.createPortal(
         <ProfileModal
           profile={modal === "new" ? null : modal}
           onClose={() => setModal(null)}
           onSave={() => { setModal(null); load(); }}
         />,
         document.body
       )}

       {confirmDelete && (
         <ConfirmModal
           title={t("profiles.confirmDeleteTitle")}
           message={t("profiles.confirmDeleteMessage")}
           onConfirm={() => handleDelete(confirmDelete)}
           onCancel={() => setConfirmDelete(null)}
         />
       )}
    </div>
  );
}

