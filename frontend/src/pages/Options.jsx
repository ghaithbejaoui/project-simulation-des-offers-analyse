import { useState, useEffect, useCallback } from "react";
import { colors, fonts, card, btnPrimary, btnGhost, btnDanger, input } from "../styles/theme";
import { isAdmin } from "../App";

const API = "http://localhost:5000/api";
const getHeaders = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` });

const OPTION_TYPES = ["roaming", "night_data", "social_pack", "loyalty", "data_boost", "voice_boost", "sms_pack", "other"];

const EMPTY_FORM = { name: "", type: "data_boost", price: "", data_bonus_gb: 0, minutes_bonus: 0, sms_bonus: 0, validity_days: 30, description: "" };

// ─── Type badge ────────────────────────────────────────────────────────────────
function TypeBadge({ type }) {
  const map = {
    roaming:    { color: colors.yellow, icon: "✈" },
    night_data: { color: colors.blue,   icon: "🌙" },
    social_pack:{ color: "#a855f7",     icon: "📱" },
    loyalty:    { color: colors.green,  icon: "⭐" },
    data_boost: { color: colors.blue,   icon: "📶" },
    voice_boost:{ color: colors.orange, icon: "🎙" },
    sms_pack:   { color: colors.yellow, icon: "💬" },
    other:      { color: colors.textDim,icon: "📦" },
  };
  const s = map[type] || map.other;
  return (
    <span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 6, background: `${s.color}15`, border: `0.5px solid ${s.color}35`, color: s.color, fontWeight: 500 }}>
      {s.icon} {type?.replace("_", " ")}
    </span>
  );
}

// ─── Option card ──────────────────────────────────────────────────────────────
function OptionCard({ option, onEdit, onDelete, showActions }) {
  const perks = [];
  if (option.data_bonus_gb > 0)  perks.push(`+${option.data_bonus_gb} GB data`);
  if (option.minutes_bonus > 0)  perks.push(`+${option.minutes_bonus} min`);
  if (option.sms_bonus > 0)      perks.push(`+${option.sms_bonus} SMS`);

  return (
    <div style={{ ...card, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 12, transition: "border-color 0.2s" }}
      onMouseEnter={e => e.currentTarget.style.borderColor = colors.borderHov}
      onMouseLeave={e => e.currentTarget.style.borderColor = colors.border}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <TypeBadge type={option.type} />
        <span style={{ fontFamily: fonts.heading, fontSize: 18, fontWeight: 600, color: colors.blue }}>
          {Number(option.price).toFixed(2)} TND
        </span>
      </div>
      <div>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: colors.text, marginBottom: 4 }}>{option.name}</h3>
        {option.description && <p style={{ fontSize: 12, color: colors.textDim, lineHeight: 1.5 }}>{option.description}</p>}
      </div>

      {perks.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {perks.map(p => (
            <span key={p} style={{ fontSize: 11, padding: "3px 9px", borderRadius: 6, background: "rgba(67,199,139,0.1)", color: colors.green, border: "0.5px solid rgba(67,199,139,0.25)" }}>
              ✓ {p}
            </span>
          ))}
          <span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 6, background: "rgba(255,255,255,0.04)", color: colors.textDim, border: `0.5px solid ${colors.border}` }}>
            {option.validity_days}d validity
          </span>
        </div>
      )}

      {showActions && (
        <div style={{ display: "flex", gap: 8, paddingTop: 4, borderTop: `0.5px solid rgba(26,143,255,0.08)` }}>
          <button onClick={() => onEdit(option)} style={{ ...btnGhost, flex: 1, height: 32, fontSize: 12, justifyContent: "center" }}>Edit</button>
          <button onClick={() => onDelete(option.id)} style={{ ...btnDanger, height: 32, padding: "0 14px", fontSize: 12 }}>Delete</button>
        </div>
      )}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function OptionModal({ option, onClose, onSave }) {
  const [form, setForm]     = useState(option || EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name || !form.price) { setError("Name and price required."); return; }
    setSaving(true);
    try {
      const method = option?.id ? "PUT" : "POST";
      const url    = option?.id ? `${API}/options/${option.id}` : `${API}/options`;
      const res    = await fetch(url, { method, headers: getHeaders(), body: JSON.stringify(form) });
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
    <div style={{ position: "fixed", inset: 0, margin: "auto", background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ ...card, width: "100%", maxWidth: 520, padding: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <h3 style={{ fontFamily: fonts.heading, fontSize: 17, fontWeight: 600, color: colors.text }}>
            {option?.id ? "Edit Option" : "New Option"}
          </h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: colors.textDim, fontSize: 20 }}>×</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={{ gridColumn: "span 2" }}><Field label="Option Name" k="name" placeholder="e.g. Night Data 5GB" /></div>
          <div>
            <label style={{ fontSize: 11, color: colors.textDim, fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>Type</label>
            <select value={form.type} onChange={e => set("type", e.target.value)} style={{ ...input, height: 38, fontSize: 13 }}>
              {OPTION_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <Field label="Price (TND)" k="price" type="number" placeholder="0.00" />
          <Field label="Data Bonus (GB)" k="data_bonus_gb" type="number" placeholder="0" />
          <Field label="Minutes Bonus" k="minutes_bonus" type="number" placeholder="0" />
          <Field label="SMS Bonus" k="sms_bonus" type="number" placeholder="0" />
          <Field label="Validity (days)" k="validity_days" type="number" placeholder="30" />
          <div style={{ gridColumn: "span 2" }}>
            <label style={{ fontSize: 11, color: colors.textDim, fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>Description</label>
            <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={2} placeholder="Optional description…"
              style={{ ...input, height: "auto", padding: "10px 14px", resize: "vertical", fontSize: 13 }} />
          </div>
        </div>
        {error && <p style={{ marginTop: 12, fontSize: 13, color: colors.red }}>{error}</p>}
        <div style={{ display: "flex", gap: 10, marginTop: 22, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={btnGhost}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.7 : 1 }}>
            {saving ? "Saving…" : "Save Option"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Options() {
  const [options, setOptions]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [typeFilter, setType]   = useState("ALL");
  const [modal, setModal]       = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/options`, { headers: getHeaders() });
      setOptions(res.ok ? await res.json() : MOCK_OPTIONS);
    } catch { setOptions(MOCK_OPTIONS); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id) => {
    try {
      await fetch(`${API}/options/${id}`, { method: "DELETE", headers: getHeaders() });
      setOptions(o => o.filter(x => x.id !== id));
    } catch {}
  };

  const filtered = options.filter(o => {
    const matchSearch = o.name?.toLowerCase().includes(search.toLowerCase());
    const matchType   = typeFilter === "ALL" || o.type === typeFilter;
    return matchSearch && matchType;
  });

  // Group by type for summary
  const typeCounts = options.reduce((acc, o) => { acc[o.type] = (acc[o.type] || 0) + 1; return acc; }, {});

  return (
    <div style={{ animation: "fadeUp 0.4s ease both" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
        <div>
          <h2 style={{ fontFamily: fonts.heading, fontSize: 20, fontWeight: 600, color: colors.text }}>Options & Add-ons</h2>
          <p style={{ fontSize: 13, color: colors.textMuted, marginTop: 3 }}>Supplementary services that can be bundled with any offer</p>
        </div>
        {isAdmin() && (
          <button onClick={() => setModal("new")} style={{ ...btnPrimary, height: 40 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Option
          </button>
        )}
      </div>

      {/* Type summary pills */}
      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        {Object.entries(typeCounts).map(([type, count]) => (
          <button key={type} onClick={() => setType(typeFilter === type ? "ALL" : type)}
            style={{ height: 32, padding: "0 12px", borderRadius: 20, border: `0.5px solid ${typeFilter === type ? colors.blue : colors.border}`,
              background: typeFilter === type ? colors.blueDim : "rgba(255,255,255,0.02)",
              color: typeFilter === type ? colors.blue : colors.textMuted, cursor: "pointer", fontSize: 12, transition: "all 0.18s" }}>
            {type.replace("_", " ")} <span style={{ opacity: 0.6 }}>({count})</span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div style={{ ...card, padding: "14px 18px", marginBottom: 18, display: "flex", gap: 12, alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: colors.textDim }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search options…"
            style={{ ...input, height: 36, paddingLeft: 36, fontSize: 13 }} />
        </div>
        <span style={{ fontSize: 12, color: colors.textDim, whiteSpace: "nowrap" }}>{filtered.length} options</span>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: colors.textDim }}>Loading options…</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 14 }}>
          {filtered.map(o => (
            <OptionCard key={o.id} option={o} onEdit={setModal} onDelete={handleDelete} showActions={isAdmin()} />
          ))}
          {filtered.length === 0 && (
            <div style={{ ...card, padding: 40, textAlign: "center", gridColumn: "span 3" }}>
              <p style={{ color: colors.textDim }}>No options found.</p>
            </div>
          )}
        </div>
      )}

      {modal && (
        <OptionModal
          option={modal === "new" ? null : modal}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); load(); }}
        />
      )}
    </div>
  );
}

const MOCK_OPTIONS = [
  { id: 1, name: "Night Data 5GB", type: "night_data", price: 3.5, data_bonus_gb: 5, minutes_bonus: 0, sms_bonus: 0, validity_days: 30, description: "Extra 5GB active between 00:00 and 07:00" },
  { id: 2, name: "Roaming Pack EU", type: "roaming", price: 12, data_bonus_gb: 2, minutes_bonus: 100, sms_bonus: 50, validity_days: 15, description: "Valid in EU zone countries" },
  { id: 3, name: "Social Media Pack", type: "social_pack", price: 5, data_bonus_gb: 3, minutes_bonus: 0, sms_bonus: 0, validity_days: 30, description: "Unlimited data for WhatsApp, Facebook, Instagram" },
  { id: 4, name: "Loyalty Bonus", type: "loyalty", price: 0, data_bonus_gb: 2, minutes_bonus: 60, sms_bonus: 100, validity_days: 30, description: "Free bonus for loyal subscribers (+12 months)" },
  { id: 5, name: "Data Boost 10GB", type: "data_boost", price: 8, data_bonus_gb: 10, minutes_bonus: 0, sms_bonus: 0, validity_days: 30, description: "Top-up your data when running low" },
  { id: 6, name: "Voice Extra 200min", type: "voice_boost", price: 6, data_bonus_gb: 0, minutes_bonus: 200, sms_bonus: 0, validity_days: 30, description: "Extra voice minutes for heavy callers" },
];