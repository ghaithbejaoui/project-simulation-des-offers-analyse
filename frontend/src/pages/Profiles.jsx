import { useState, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import { useNavigate } from "react-router-dom";
import { colors, fonts, card, btnPrimary, btnGhost, btnDanger, input } from "../styles/theme";
import { isAdmin } from "../App";

const API = "http://localhost:5000/api";
const getHeaders = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` });

const EMPTY_FORM = {
  name: "", segment: "POSTPAID", avg_minutes: "", avg_sms: "", avg_data_gb: "",
  night_usage_pct: 0, roaming_days: 0, budget_max: "", priority: "price",
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
  // Map API fields to display fields
  const displayName = profile.label || profile.name || "Unknown";
  const displayMinutes = profile.minutes_avg ?? profile.avg_minutes ?? 0;
  const displaySms = profile.sms_avg ?? profile.avg_sms ?? 0;
  const displayData = profile.data_avg_gb ?? profile.avg_data_gb ?? 0;
  
  const segColors = { POSTPAID: colors.blue, PREPAID: colors.green, BUSINESS: colors.orange, DATA_ONLY: colors.yellow };
  const color = segColors[profile.segment] || colors.textMuted;
  const initials = displayName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "P";

  return (
    <div style={{ ...card, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14, position: "relative", overflow: "hidden", transition: "border-color 0.2s" }}
      onMouseEnter={e => e.currentTarget.style.borderColor = colors.borderHov}
      onMouseLeave={e => e.currentTarget.style.borderColor = colors.border}>
      <div style={{ position: "absolute", top: 0, left: 0, width: 3, height: "100%", background: color, borderRadius: "0 0 0 0" }} />
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}18`, border: `0.5px solid ${color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 600, color, flexShrink: 0 }}>
          {initials}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 14, fontWeight: 500, color: colors.text }}>{displayName}</p>
          <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 5, background: `${color}15`, color, fontWeight: 500 }}>
            {profile.segment?.replace("_", " ")}
          </span>
        </div>
        <p style={{ fontSize: 16, fontWeight: 600, fontFamily: fonts.heading, color: colors.blue }}>
          {Number(profile.budget_max).toFixed(0)} TND
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: colors.textDim }}>Data</span>
            <span style={{ fontSize: 11, color: colors.textMuted }}>{displayData} GB/mo</span>
          </div>
          <UsageBar value={displayData} max={100} color={colors.blue} />
        </div>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: colors.textDim }}>Voice</span>
            <span style={{ fontSize: 11, color: colors.textMuted }}>{displayMinutes} min/mo</span>
          </div>
          <UsageBar value={displayMinutes} max={1000} color={colors.green} />
        </div>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: colors.textDim }}>SMS</span>
            <span style={{ fontSize: 11, color: colors.textMuted }}>{displaySms} /mo</span>
          </div>
          <UsageBar value={displaySms} max={500} color={colors.yellow} />
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {profile.roaming_days > 0 && (
          <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 4, background: "rgba(240,180,41,0.1)", color: colors.yellow, border: "0.5px solid rgba(240,180,41,0.25)" }}>
            ✈ {profile.roaming_days}d roaming
          </span>
        )}
        {profile.night_usage_pct > 0 && (
          <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 4, background: "rgba(26,143,255,0.1)", color: colors.blue, border: "0.5px solid rgba(26,143,255,0.25)" }}>
            🌙 {profile.night_usage_pct}% night
          </span>
        )}
        <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 4, background: "rgba(200,212,232,0.06)", color: colors.textDim, border: `0.5px solid ${colors.border}` }}>
          Priority: {profile.priority}
        </span>
      </div>

      <div style={{ display: "flex", gap: 8, paddingTop: 4, borderTop: `0.5px solid rgba(26,143,255,0.08)` }}>
        <button onClick={() => onSimulate(profile)} style={{ ...btnPrimary, flex: 1, height: 34, fontSize: 12, justifyContent: "center" }}>
          Simulate
        </button>
        {showActions && (
          <>
            <button onClick={() => onEdit(profile)} style={{ ...btnGhost, height: 34, padding: "0 14px", fontSize: 12 }}>Edit</button>
            <button onClick={() => onDelete(profile.profile_id || profile.id)} style={{ ...btnDanger, height: 34, padding: "0 12px", fontSize: 12 }}>✕</button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function ProfileModal({ profile, onClose, onSave }) {
  const [form, setForm] = useState(profile || EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name || !form.budget_max) { setError("Name and budget are required."); return; }
    setSaving(true);
    try {
      const method = profile?.id ? "PUT" : "POST";
      const url = profile?.id ? `${API}/customer-profiles/${profile.id}` : `${API}/customer-profiles`;
      const res = await fetch(url, { method, headers: getHeaders(), body: JSON.stringify(form) });
      if (!res.ok) throw new Error("Save failed");
      onSave();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const Field = ({ label, k, type = "text", placeholder }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 11, color: colors.textDim, fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" }}>{label}</label>
      <input type={type} value={form[k] ?? ""} placeholder={placeholder} onChange={e => set(k, e.target.value)}
        style={{ ...input, height: 38, fontSize: 13 }} />
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, margin: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ ...card, width: "100%", maxWidth: 580, maxHeight: "90vh", overflowY: "auto", padding: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <h3 style={{ fontFamily: fonts.heading, fontSize: 17, fontWeight: 600, color: colors.text }}>
            {profile?.id ? "Edit Profile" : "New Customer Profile"}
          </h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: colors.textDim, fontSize: 20 }}>×</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={{ gridColumn: "span 2" }}><Field label="Full Name" k="name" placeholder="e.g. Ahmed Bejaoui" /></div>
          <div>
            <label style={{ fontSize: 11, color: colors.textDim, fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>Segment</label>
            <select value={form.segment} onChange={e => set("segment", e.target.value)} style={{ ...input, height: 38, fontSize: 13 }}>
              {["PREPAID","POSTPAID","BUSINESS","DATA_ONLY"].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, color: colors.textDim, fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>Priority</label>
            <select value={form.priority} onChange={e => set("priority", e.target.value)} style={{ ...input, height: 38, fontSize: 13 }}>
              {["price","quality","balanced"].map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <Field label="Avg. Data (GB/mo)" k="avg_data_gb" type="number" placeholder="e.g. 20" />
          <Field label="Avg. Minutes/mo" k="avg_minutes" type="number" placeholder="e.g. 200" />
          <Field label="Avg. SMS/mo" k="avg_sms" type="number" placeholder="e.g. 50" />
          <Field label="Max Budget (TND)" k="budget_max" type="number" placeholder="e.g. 60" />
          <Field label="Night Usage %" k="night_usage_pct" type="number" placeholder="0–100" />
          <Field label="Roaming Days/mo" k="roaming_days" type="number" placeholder="0" />
        </div>
        {error && <p style={{ marginTop: 12, fontSize: 13, color: colors.red }}>{error}</p>}
        <div style={{ display: "flex", gap: 10, marginTop: 22, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={btnGhost}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.7 : 1 }}>
            {saving ? "Saving…" : "Save Profile"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Profiles() {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [segment, setSegment]   = useState("ALL");
  const [modal, setModal]       = useState(null);
  const [view, setView]         = useState("grid"); // "grid" | "table"

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/customer-profiles`, { headers: getHeaders() });
      setProfiles(res.ok ? await res.json() : MOCK_PROFILES);
    } catch { setProfiles(MOCK_PROFILES); }
    finally { setLoading(false); }
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
      const deleteId = id || id; // Handle both profile_id and id
      await fetch(`${API}/customer-profiles/${deleteId}`, { method: "DELETE", headers: getHeaders() });
      setProfiles(p => p.filter(x => (x.profile_id || x.id) !== deleteId));
    } catch {}
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
          <h2 style={{ fontFamily: fonts.heading, fontSize: 20, fontWeight: 600, color: colors.text }}>Customer Profiles</h2>
          <p style={{ fontSize: 13, color: colors.textMuted, marginTop: 3 }}>
            {profiles.length} profiles · Manage usage patterns and budgets
          </p>
        </div>
        {isAdmin() && (
          <button onClick={() => setModal("new")} style={{ ...btnPrimary, height: 40 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Profile
          </button>
        )}
      </div>

      {/* Filters */}
      <div style={{ ...card, padding: "14px 18px", marginBottom: 18, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: colors.textDim }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search profiles…"
            style={{ ...input, height: 36, paddingLeft: 36, fontSize: 13 }} />
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {["ALL","PREPAID","POSTPAID","BUSINESS","DATA_ONLY"].map(s => (
            <button key={s} onClick={() => setSegment(s)}
              style={{ height: 34, padding: "0 12px", borderRadius: 8, border: `0.5px solid ${segment === s ? colors.blue : colors.border}`,
                background: segment === s ? colors.blueDim : "transparent", color: segment === s ? colors.blue : colors.textMuted,
                cursor: "pointer", fontSize: 12, transition: "all 0.18s" }}>
              {s === "ALL" ? "All" : s.replace("_"," ")}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: 3, border: `0.5px solid ${colors.border}` }}>
          {["grid","table"].map(v => (
            <button key={v} onClick={() => setView(v)}
              style={{ height: 28, padding: "0 12px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, transition: "all 0.18s",
                background: view === v ? colors.blueDim : "transparent", color: view === v ? colors.blue : colors.textDim }}>
              {v === "grid" ? "⊞ Grid" : "☰ List"}
            </button>
          ))}
        </div>
        <span style={{ fontSize: 12, color: colors.textDim }}>{filtered.length} results</span>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: colors.textDim }}>Loading profiles…</div>
      ) : view === "grid" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {filtered.map(p => (
            <ProfileCard key={p.id} profile={p} onEdit={setModal} onDelete={handleDelete} onSimulate={handleSimulate} showActions={isAdmin()} />
          ))}
        </div>
      ) : (
        <div style={{ ...card, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: `0.5px solid ${colors.border}` }}>
                {["Name","Segment","Data (GB)","Minutes","SMS","Budget (TND)","Night %","Roaming","Actions"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 500, color: colors.textDim, letterSpacing: "0.05em", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={p.id} style={{ borderBottom: `0.5px solid rgba(26,143,255,0.06)`, background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(26,143,255,0.05)"}
                  onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)"}>
                  <td style={{ padding: "11px 16px", color: colors.text, fontWeight: 500 }}>{p.label || p.name}</td>
                  <td style={{ padding: "11px 16px" }}>
                    <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 5, background: "rgba(26,143,255,0.1)", color: colors.blue }}>{p.segment?.replace("_"," ")}</span>
                  </td>
                  <td style={{ padding: "11px 16px", color: colors.textMuted }}>{p.data_avg_gb ?? p.avg_data_gb}</td>
                  <td style={{ padding: "11px 16px", color: colors.textMuted }}>{p.minutes_avg ?? p.avg_minutes}</td>
                  <td style={{ padding: "11px 16px", color: colors.textMuted }}>{p.sms_avg ?? p.avg_sms}</td>
                  <td style={{ padding: "11px 16px", color: colors.blue, fontWeight: 600 }}>{Number(p.budget_max).toFixed(2)}</td>
                  <td style={{ padding: "11px 16px", color: colors.textMuted }}>{p.night_usage_pct}%</td>
                  <td style={{ padding: "11px 16px", color: colors.textMuted }}>{p.roaming_days}d</td>
                  <td style={{ padding: "11px 16px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => handleSimulate(p)} style={{ ...btnPrimary, height: 30, padding: "0 10px", fontSize: 12 }}>Simulate</button>
                      {isAdmin() && (
                        <>
                          <button onClick={() => setModal(p)} style={{ ...btnGhost, height: 30, padding: "0 10px", fontSize: 12 }}>Edit</button>
                          <button onClick={() => handleDelete(p.id)} style={{ ...btnDanger, height: 30, padding: "0 10px", fontSize: 12 }}>✕</button>
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
    </div>
  );
}

const MOCK_PROFILES = [
  { id: 1, name: "Ahmed Bejaoui", segment: "POSTPAID", avg_data_gb: 22, avg_minutes: 350, avg_sms: 80, budget_max: 65, night_usage_pct: 15, roaming_days: 2, priority: "quality" },
  { id: 2, name: "Sana Trabelsi", segment: "PREPAID", avg_data_gb: 8, avg_minutes: 120, avg_sms: 200, budget_max: 25, night_usage_pct: 30, roaming_days: 0, priority: "price" },
  { id: 3, name: "Mohamed Chaabane", segment: "BUSINESS", avg_data_gb: 45, avg_minutes: 800, avg_sms: 50, budget_max: 150, night_usage_pct: 5, roaming_days: 8, priority: "quality" },
  { id: 4, name: "Yasmine Hamdi", segment: "DATA_ONLY", avg_data_gb: 60, avg_minutes: 0, avg_sms: 0, budget_max: 40, night_usage_pct: 60, roaming_days: 0, priority: "price" },
  { id: 5, name: "Karim Bouaziz", segment: "POSTPAID", avg_data_gb: 35, avg_minutes: 500, avg_sms: 150, budget_max: 90, night_usage_pct: 10, roaming_days: 5, priority: "balanced" },
  { id: 6, name: "Lina Mansour", segment: "PREPAID", avg_data_gb: 5, avg_minutes: 60, avg_sms: 300, budget_max: 18, night_usage_pct: 40, roaming_days: 0, priority: "price" },
];
