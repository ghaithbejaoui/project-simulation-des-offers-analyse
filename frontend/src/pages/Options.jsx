import { useState, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import { colors, fonts, card, btnPrimary, btnGhost, btnDanger, input } from "../styles/theme";
import { isAdmin } from "../App";

const API = "http://localhost:5000/api";
const getHeaders = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` });

const OPTION_TYPES = ["DATA_ADDON", "VOICE_ADDON", "SMS_ADDON", "ROAMING", "LOYALTY"];

const EMPTY_FORM = { name: "", type: "DATA_ADDON", price: "", data_gb: 0, minutes: 0, sms: 0, validity_days: 30 };

// ─── Type badge ────────────────────────────────────────────────────────────────
function TypeBadge({ type }) {
  const map = {
    DATA_ADDON:  { color: colors.blue,   icon: "📶", label: "Data Add-on" },
    VOICE_ADDON: { color: colors.orange, icon: "🎙",  label: "Voice Add-on" },
    SMS_ADDON:   { color: colors.yellow, icon: "💬",  label: "SMS Add-on" },
    ROAMING:     { color: colors.green,  icon: "✈",   label: "Roaming" },
    LOYALTY:     { color: colors.yellow, icon: "⭐",   label: "Loyalty" },
  };
  const s = map[type] || { color: colors.textDim, icon: "📦", label: type };
  return (
    <span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 6, background: `${s.color}15`, border: `0.5px solid ${s.color}35`, color: s.color, fontWeight: 500 }}>
      {s.icon} {s.label}
    </span>
  );
}

// ─── Option card ──────────────────────────────────────────────────────────────
function OptionCard({ option, onEdit, onDelete, showActions }) {
  // option fields: option_id, name, type, price, data_gb, minutes, sms, validity_days
  const stats = [
    { label: "Data", value: option.data_gb > 0 ? `+${Number(option.data_gb).toFixed(1)} GB` : null, color: colors.blue },
    { label: "Minutes", value: option.minutes > 0 ? `+${option.minutes} min` : null, color: colors.green },
    { label: "SMS", value: option.sms > 0 ? `+${option.sms} SMS` : null, color: colors.yellow },
    { label: "Validity", value: `${option.validity_days} days`, color: colors.textMuted },
  ].filter(s => s.value !== null);

  return (
    <div style={{ ...card, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 12, transition: "border-color 0.2s" }}
      onMouseEnter={e => e.currentTarget.style.borderColor = colors.borderHov}
      onMouseLeave={e => e.currentTarget.style.borderColor = colors.border}>
      {/* Header: Type badge + Price */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <TypeBadge type={option.type} />
        <span style={{ fontFamily: fonts.heading, fontSize: 20, fontWeight: 600, color: colors.blue }}>
          {Number(option.price).toFixed(2)} TND
        </span>
      </div>

      {/* Name */}
      <div>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: colors.text, marginBottom: 4, lineHeight: 1.3 }}>{option.name}</h3>
      </div>

      {/* Stats grid - show all stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
        {[
          { label: "Data", value: `${Number(option.data_gb || 0).toFixed(1)} GB`, color: colors.blue, highlight: option.data_gb > 0 },
          { label: "Minutes", value: `${option.minutes || 0} min`, color: colors.green, highlight: option.minutes > 0 },
          { label: "SMS", value: `${option.sms || 0} SMS`, color: colors.yellow, highlight: option.sms > 0 },
          { label: "Validity", value: `${option.validity_days} days`, color: colors.textMuted, highlight: false },
        ].map(stat => (
          <div key={stat.label} style={{
            padding: "8px 10px",
            background: "rgba(255,255,255,0.03)",
            borderRadius: 8,
            border: `0.5px solid ${stat.highlight ? `${stat.color}40` : colors.border}`,
          }}>
            <p style={{ fontSize: 10, color: colors.textDim, textTransform: "uppercase", letterSpacing: "0.03em", marginBottom: 2 }}>{stat.label}</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: stat.color, fontFamily: fonts.heading }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      {showActions && (
        <div style={{ display: "flex", gap: 8, paddingTop: 4, borderTop: `0.5px solid rgba(26,143,255,0.08)` }}>
          <button onClick={() => onEdit(option)} style={{ ...btnGhost, flex: 1, height: 32, fontSize: 12, justifyContent: "center" }}>Edit</button>
          <button onClick={() => onDelete(option.option_id)} style={{ ...btnDanger, height: 32, padding: "0 14px", fontSize: 12 }}>Delete</button>
        </div>
      )}
    </div>
  );
}

// ─── Reusable Form Field ───────────────────────────────────────────────────────
function FormField({ label, value, onChange, type = "text", placeholder }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 11, color: colors.textDim, fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" }}>{label}</label>
      <input type={type} value={value ?? ""} placeholder={placeholder} onChange={e => onChange(e.target.value)}
        style={{ ...input, height: 38, fontSize: 13 }} />
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
      const method = option?.option_id ? "PUT" : "POST";
      const url    = option?.option_id ? `${API}/options/${option.option_id}` : `${API}/options`;
      const res    = await fetch(url, { method, headers: getHeaders(), body: JSON.stringify(form) });
      if (!res.ok) throw new Error("Save failed");
      onSave();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, margin: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ ...card, width: "100%", maxWidth: 520, padding: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
           <h3 style={{ fontFamily: fonts.heading, fontSize: 17, fontWeight: 600, color: colors.text }}>
             {option?.option_id ? "Edit Option" : "New Option"}
           </h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: colors.textDim, fontSize: 20 }}>×</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={{ gridColumn: "span 2" }}><FormField label="Option Name" value={form.name} onChange={v => set("name", v)} placeholder="e.g. Night Data 5GB" /></div>
          <div>
            <label style={{ fontSize: 11, color: colors.textDim, fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>Type</label>
            <select value={form.type} onChange={e => set("type", e.target.value)} style={{ ...input, height: 38, fontSize: 13 }}>
              {OPTION_TYPES.map(t => (
                <option key={t} value={t}>
                  {t === "DATA_ADDON" ? "📶 Data Add-on" :
                   t === "VOICE_ADDON" ? "🎙 Voice Add-on" :
                   t === "SMS_ADDON" ? "💬 SMS Add-on" :
                   t === "ROAMING" ? "✈ Roaming" :
                   t === "LOYALTY" ? "⭐ Loyalty" :
                   t.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
          <FormField label="Price (TND)" value={form.price} onChange={v => set("price", v)} type="number" placeholder="0.00" />
          <FormField label="Data Bonus (GB)" value={form.data_gb} onChange={v => set("data_gb", v)} type="number" placeholder="0" />
          <FormField label="Minutes Bonus" value={form.minutes} onChange={v => set("minutes", v)} type="number" placeholder="0" />
          <FormField label="SMS Bonus" value={form.sms} onChange={v => set("sms", v)} type="number" placeholder="0" />
          <FormField label="Validity (days)" value={form.validity_days} onChange={v => set("validity_days", v)} type="number" placeholder="30" />
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
       await fetch(`${API}/options/${id}`, { method: "DELETE", headers: getHeaders() });
       setOptions(o => o.filter(x => x.option_id !== id));
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
        <button onClick={() => setType("ALL")} style={{ height: 32, padding: "0 12px", borderRadius: 20, border: `0.5px solid ${typeFilter === "ALL" ? colors.blue : colors.border}`,
          background: typeFilter === "ALL" ? colors.blueDim : "rgba(255,255,255,0.02)",
          color: typeFilter === "ALL" ? colors.blue : colors.textMuted, cursor: "pointer", fontSize: 12, transition: "all 0.18s" }}>
          All <span style={{ opacity: 0.6 }}>({options.length})</span>
        </button>
        {OPTION_TYPES.map(type => (
          <button key={type} onClick={() => setType(typeFilter === type ? "ALL" : type)}
            style={{ height: 32, padding: "0 12px", borderRadius: 20, border: `0.5px solid ${typeFilter === type ? colors.blue : colors.border}`,
              background: typeFilter === type ? colors.blueDim : "rgba(255,255,255,0.02)",
              color: typeFilter === type ? colors.blue : colors.textMuted, cursor: "pointer", fontSize: 12, transition: "all 0.18s" }}>
            {type.replace("_", " ")} <span style={{ opacity: 0.6 }}>({typeCounts[type] || 0})</span>
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
         <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
           {filtered.map(o => (
             <OptionCard key={o.option_id} option={o} onEdit={setModal} onDelete={handleDelete} showActions={isAdmin()} />
           ))}
          {filtered.length === 0 && (
            <div style={{ ...card, padding: 40, textAlign: "center", gridColumn: "span 3" }}>
              <p style={{ color: colors.textDim }}>No options found.</p>
            </div>
          )}
        </div>
      )}

       {modal && ReactDOM.createPortal(
         <OptionModal
           option={modal === "new" ? null : modal}
           onClose={() => setModal(null)}
           onSave={() => { setModal(null); load(); }}
         />,
         document.body
       )}
    </div>
  );
}

const MOCK_OPTIONS = [
  { option_id: 1, name: "Night Data 5GB", type: "DATA_ADDON", price: 3.5, data_gb: 5, minutes: 0, sms: 0, validity_days: 30 },
  { option_id: 2, name: "Roaming Pack EU", type: "ROAMING", price: 12, data_gb: 2, minutes: 100, sms: 50, validity_days: 15 },
  { option_id: 3, name: "SMS Pack 500", type: "SMS_ADDON", price: 5, data_gb: 0, minutes: 0, sms: 500, validity_days: 30 },
  { option_id: 4, name: "Loyalty Bonus", type: "LOYALTY", price: 0, data_gb: 2, minutes: 60, sms: 100, validity_days: 30 },
  { option_id: 5, name: "Data Boost 10GB", type: "DATA_ADDON", price: 8, data_gb: 10, minutes: 0, sms: 0, validity_days: 30 },
  { option_id: 6, name: "Voice Extra 200min", type: "VOICE_ADDON", price: 6, data_gb: 0, minutes: 200, sms: 0, validity_days: 30 },
];