import { useState, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import { colors, fonts, card, btnPrimary, btnGhost, btnDanger, input } from "../styles/theme";
import { isAdmin } from "../App";

const API = "http://localhost:5000/api";
const getToken = () => localStorage.getItem("token");
const headers = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` });

const SEGMENTS = ["ALL", "PREPAID", "POSTPAID", "BUSINESS", "DATA_ONLY"];
const STATUSES  = ["ALL", "PUBLISHED", "DRAFT", "ARCHIVED"];

const EMPTY_FORM = {
  name: "", segment: "POSTPAID", monthly_price: "", quota_minutes: "", quota_sms: "",
  quota_data_gb: "", validity_days: 30, fair_use_gb: "", over_minute_price: "",
  over_sms_price: "", over_data_price: "", roaming_included_days: 0, status: "PUBLISHED",
};

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  // Normalize status to uppercase for consistent mapping
  const normalized = status?.toUpperCase();
  const map = {
    PUBLISHED: { bg: "rgba(67,199,139,0.12)", border: "rgba(67,199,139,0.3)", color: colors.green, label: "Active" },
    ACTIVE:    { bg: "rgba(67,199,139,0.12)", border: "rgba(67,199,139,0.3)", color: colors.green, label: "Active" },
    DRAFT:     { bg: "rgba(240,180,41,0.12)", border: "rgba(240,180,41,0.3)", color: colors.yellow, label: "Draft" },
    ARCHIVED:  { bg: "rgba(200,212,232,0.06)", border: "rgba(200,212,232,0.18)", color: colors.textDim, label: "Inactive" },
    INACTIVE:  { bg: "rgba(200,212,232,0.06)", border: "rgba(200,212,232,0.18)", color: colors.textDim, label: "Inactive" },
  };
  const st = map[normalized] || { bg: "rgba(200,212,232,0.06)", border: "rgba(200,212,232,0.18)", color: colors.textDim, label: status };
  return (
    <span style={{ fontSize: 11, fontWeight: 500, padding: "3px 9px", borderRadius: 6, background: st.bg, border: `0.5px solid ${st.border}`, color: st.color, textTransform: "capitalize" }}>
      {st.label}
    </span>
  );
}

// ─── Segment pill ─────────────────────────────────────────────────────────────
function SegmentPill({ segment }) {
  const map = {
    POSTPAID:  colors.blue, PREPAID: colors.green,
    BUSINESS:  colors.orange, DATA_ONLY: colors.yellow,
  };
  const color = map[segment] || colors.textDim;
  return (
    <span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 6, background: `${color}15`, border: `0.5px solid ${color}35`, color, fontWeight: 500 }}>
      {segment?.replace("_", " ")}
    </span>
  );
}

// ─── Reusable Form Field ───────────────────────────────────────────────────────
function FormField({ label, value, onChange, type = "text", placeholder }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 11, color: colors.textDim, fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" }}>{label}</label>
      <input
        type={type}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        style={{ ...input, height: 38, fontSize: 13 }}
      />
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function OfferModal({ offer, onClose, onSave }) {
  const [form, setForm] = useState(offer || EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name || !form.monthly_price) { setError("Name and price are required."); return; }
    setSaving(true);
    try {
      const offerId = offer?.offer_id;
      const method = offerId ? "PUT" : "POST";
      const url    = offerId ? `${API}/offers/${offerId}` : `${API}/offers`;
      const res    = await fetch(url, { method, headers: headers(), body: JSON.stringify(form) });
      if (!res.ok) throw new Error((await res.json()).message || "Save failed");
      onSave();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, margin: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ ...card, width: "100%", maxWidth: 640, maxHeight: "90vh", overflowY: "auto", padding: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
           <h3 style={{ fontFamily: fonts.heading, fontSize: 17, fontWeight: 600, color: colors.text }}>
             {offer?.offer_id ? "Edit Offer" : "New Offer"}
           </h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: colors.textDim, fontSize: 20, lineHeight: 1 }}>×</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={{ gridColumn: "span 2" }}>
            <FormField label="Offer Name" value={form.name} onChange={v => set("name", v)} placeholder="e.g. POSTPAID PRO 50GB" />
          </div>
          <div>
            <label style={{ fontSize: 11, color: colors.textDim, fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>Segment</label>
            <select value={form.segment} onChange={e => set("segment", e.target.value)} style={{ ...input, height: 38, fontSize: 13 }}>
              {["PREPAID","POSTPAID","BUSINESS"].map(s => <option key={s} value={s}>{s.replace("_"," ")}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, color: colors.textDim, fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>Status</label>
             <select value={form.status} onChange={e => set("status", e.target.value)} style={{ ...input, height: 38, fontSize: 13 }}>
               {["PUBLISHED","DRAFT","RETIRED"].map(s => (
                 <option key={s} value={s}>
                   {s === "PUBLISHED" ? "Active" : s === "DRAFT" ? "Draft" : "Inactive"}
                 </option>
               ))}
             </select>
          </div>
          <FormField label="Monthly Price (TND)" value={form.monthly_price} onChange={v => set("monthly_price", v)} type="number" placeholder="0.00" />
          <FormField label="Validity (days)" value={form.validity_days} onChange={v => set("validity_days", v)} type="number" placeholder="30" />
          <FormField label="Minutes Quota" value={form.quota_minutes} onChange={v => set("quota_minutes", v)} type="number" placeholder="Unlimited = 0" />
          <FormField label="SMS Quota" value={form.quota_sms} onChange={v => set("quota_sms", v)} type="number" placeholder="Unlimited = 0" />
          <FormField label="Data Quota (GB)" value={form.quota_data_gb} onChange={v => set("quota_data_gb", v)} type="number" placeholder="e.g. 50" />
          <FormField label="Fair Use (GB)" value={form.fair_use_gb} onChange={v => set("fair_use_gb", v)} type="number" placeholder="0" />
          <FormField label="Cost/min overage (TND)" value={form.over_minute_price} onChange={v => set("over_minute_price", v)} type="number" placeholder="0.10" />
          <FormField label="Cost/SMS overage (TND)" value={form.over_sms_price} onChange={v => set("over_sms_price", v)} type="number" placeholder="0.05" />
          <FormField label="Cost/GB overage (TND)" value={form.over_data_price} onChange={v => set("over_data_price", v)} type="number" placeholder="0.50" />
          <FormField label="Roaming Days" value={form.roaming_included_days} onChange={v => set("roaming_included_days", v)} type="number" placeholder="0" />
        </div>

        {error && <p style={{ marginTop: 12, fontSize: 13, color: colors.red }}>{error}</p>}

        <div style={{ display: "flex", gap: 10, marginTop: 22, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={btnGhost}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.7 : 1 }}>
            {saving ? "Saving…" : "Save Offer"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Offers() {
  const [offers, setOffers]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [segment, setSegment]   = useState("ALL");
  const [status, setStatus]     = useState("ALL");
  const [modal, setModal]       = useState(null); // null | "new" | offer obj
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/offers`, { headers: headers() });
      const data = res.ok ? await res.json() : MOCK_OFFERS;
      setOffers(data);
    } catch { setOffers(MOCK_OFFERS); }
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
    setDeleting(id);
    try {
      await fetch(`${API}/offers/${id}`, { method: "DELETE", headers: headers() });
      setOffers(o => o.filter(x => x.id !== id));
    } catch {}
    finally { setDeleting(null); }
  };

  const filtered = offers.filter(o => {
    const matchSearch = o.name?.toLowerCase().includes(search.toLowerCase());
    const matchSeg    = segment === "ALL" || o.segment === segment;
    const matchSt     = status  === "ALL" || o.status  === status;
    return matchSearch && matchSeg && matchSt;
  });

  return (
    <div style={{ animation: "fadeUp 0.4s ease both" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
        <div>
          <h2 style={{ fontFamily: fonts.heading, fontSize: 20, fontWeight: 600, color: colors.text }}>Offers Catalog</h2>
          <p style={{ fontSize: 13, color: colors.textMuted, marginTop: 3 }}>Manage telecom offer definitions, pricing and quotas</p>
        </div>
        {isAdmin() && (
          <button onClick={() => setModal("new")} style={{ ...btnPrimary, height: 40 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Offer
          </button>
        )}
      </div>

      {/* Filters */}
      <div style={{ ...card, padding: "14px 18px", marginBottom: 18, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: colors.textDim }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search offers…"
            style={{ ...input, height: 36, paddingLeft: 36, fontSize: 13 }} />
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {SEGMENTS.map(s => (
            <button key={s} onClick={() => setSegment(s)}
              style={{ height: 34, padding: "0 12px", borderRadius: 8, border: `0.5px solid ${segment === s ? colors.blue : colors.border}`,
                background: segment === s ? colors.blueDim : "transparent", color: segment === s ? colors.blue : colors.textMuted,
                cursor: "pointer", fontSize: 12, fontWeight: segment === s ? 500 : 400, transition: "all 0.18s" }}>
              {s === "ALL" ? "All" : s.replace("_"," ")}
            </button>
          ))}
        </div>
         <div style={{ display: "flex", gap: 6 }}>
           {STATUSES.map(s => {
             const label = s === "ALL" ? "All Status" :
                           s === "PUBLISHED" ? "Active" :
                           s === "DRAFT" ? "Draft" : "Inactive";
             return (
               <button key={s} onClick={() => setStatus(s)}
                 style={{ height: 34, padding: "0 12px", borderRadius: 8, border: `0.5px solid ${status === s ? colors.green : colors.border}`,
                   background: status === s ? "rgba(67,199,139,0.1)" : "transparent", color: status === s ? colors.green : colors.textMuted,
                   cursor: "pointer", fontSize: 12, fontWeight: status === s ? 500 : 400, transition: "all 0.18s" }}>
                 {label}
               </button>
             );
           })}
         </div>
        <span style={{ fontSize: 12, color: colors.textDim, whiteSpace: "nowrap" }}>{filtered.length} offers</span>
      </div>

      {/* Table */}
      <div style={{ ...card, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: `0.5px solid ${colors.border}` }}>
              {["Name", "Segment", "Price", "Data", "Minutes", "SMS", "Validity", "Status", "Actions"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 500, color: colors.textDim, letterSpacing: "0.05em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} style={{ padding: 40, textAlign: "center", color: colors.textDim }}>Loading offers…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={9} style={{ padding: 40, textAlign: "center", color: colors.textDim }}>No offers found.</td></tr>
            ) : filtered.map((o, i) => (
              <tr key={o.id} style={{ borderBottom: `0.5px solid rgba(26,143,255,0.06)`, background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)", transition: "background 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(26,143,255,0.05)"}
                onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)"}>
                <td style={{ padding: "12px 16px", color: colors.text, fontWeight: 500 }}>{o.name}</td>
                <td style={{ padding: "12px 16px" }}><SegmentPill segment={o.segment} /></td>
                <td style={{ padding: "12px 16px", color: colors.blue, fontWeight: 600 }}>{Number(o.monthly_price).toFixed(2)} TND</td>
                <td style={{ padding: "12px 16px", color: colors.textMuted }}>{o.quota_data ? `${o.quota_data} GB` : "Unlimited"}</td>
                <td style={{ padding: "12px 16px", color: colors.textMuted }}>{o.quota_minutes || "Unlimited"}</td>
                <td style={{ padding: "12px 16px", color: colors.textMuted }}>{o.quota_sms || "Unlimited"}</td>
                <td style={{ padding: "12px 16px", color: colors.textMuted }}>{o.validity_days}d</td>
                <td style={{ padding: "12px 16px" }}><StatusBadge status={o.status} /></td>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    {isAdmin() && (
                      <>
                        <button onClick={() => setModal(o)} style={{ ...btnGhost, height: 30, padding: "0 10px", fontSize: 12 }}>Edit</button>
                        <button onClick={() => handleDelete(o.id)} disabled={deleting === o.id}
                          style={{ ...btnDanger, height: 30, padding: "0 10px", fontSize: 12, opacity: deleting === o.id ? 0.6 : 1 }}>
                          {deleting === o.id ? "…" : "Delete"}
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
       </div>

       {/* Modal (rendered via portal to viewport) */}
       {modal && ReactDOM.createPortal(
         <OfferModal
           offer={modal === "new" ? null : modal}
           onClose={() => setModal(null)}
           onSave={() => { setModal(null); load(); }}
         />,
         document.body
       )}
     </div>
   );
}

// Fallback mock data
const MOCK_OFFERS = [
  { id: 1, name: "PREPAID STARTER", segment: "PREPAID", monthly_price: 15, quota_data: 5, quota_minutes: 60, quota_sms: 100, validity_days: 30, status: "PUBLISHED" },
  { id: 2, name: "POSTPAID CLASSIC", segment: "POSTPAID", monthly_price: 39, quota_data: 20, quota_minutes: 300, quota_sms: 500, validity_days: 30, status: "PUBLISHED" },
  { id: 3, name: "POSTPAID PRO 50GB", segment: "POSTPAID", monthly_price: 69, quota_data: 50, quota_minutes: 0, quota_sms: 0, validity_days: 30, status: "PUBLISHED" },
  { id: 4, name: "BUSINESS UNLIMITED", segment: "BUSINESS", monthly_price: 149, quota_data: 100, quota_minutes: 0, quota_sms: 0, validity_days: 30, status: "PUBLISHED" },
  { id: 5, name: "DATA ONLY 30GB", segment: "DATA_ONLY", monthly_price: 29, quota_data: 30, quota_minutes: 0, quota_sms: 0, validity_days: 30, status: "PUBLISHED" },
  { id: 6, name: "PREPAID NIGHT", segment: "PREPAID", monthly_price: 8, quota_data: 10, quota_minutes: 30, quota_sms: 50, validity_days: 15, status: "DRAFT" },
];
