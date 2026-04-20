import { useState, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import { fonts } from "../styles/theme";
import { isAdmin } from "../App";
import { useLanguage } from "../context/LanguageContext";

const cardStyleStyle = {
  background: "var(--bg-card)",
  border: "0.5px solid var(--border)",
  borderRadius: 16,
  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
};

const btnPrimaryStyleStyle = {
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

const btnGhostStyleStyle = {
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

const btnDangerStyleStyle = {
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

const inputStyleStyle = {
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
  const { t } = useLanguage();
  const normalized = status?.toUpperCase();
  const map = {
    PUBLISHED: { bg: "rgba(67,199,139,0.12)", border: "rgba(67,199,139,0.3)", color: "var(--green)", label: t("offers.status.published") },
    ACTIVE:    { bg: "rgba(67,199,139,0.12)", border: "rgba(67,199,139,0.3)", color: "var(--green)", label: t("offers.status.published") },
    DRAFT:     { bg: "rgba(240,180,41,0.12)", border: "rgba(240,180,41,0.3)", color: "var(--yellow)", label: t("offers.status.draft") },
    ARCHIVED:  { bg: "rgba(200,212,232,0.06)", border: "rgba(200,212,232,0.18)", color: "var(--text-dim)", label: t("offers.status.inactive") },
    INACTIVE:  { bg: "rgba(200,212,232,0.06)", border: "rgba(200,212,232,0.18)", color: "var(--text-dim)", label: t("offers.status.inactive") },
    RETIRED:   { bg: "rgba(200,212,232,0.06)", border: "rgba(200,212,232,0.18)", color: "var(--text-dim)", label: t("offers.status.inactive") },
  };
  const st = map[normalized] || { bg: "rgba(200,212,232,0.06)", border: "rgba(200,212,232,0.18)", color: "var(--text-dim)", label: status };
  return (
    <span style={{ fontSize: 11, fontWeight: 500, padding: "3px 9px", borderRadius: 6, background: st.bg, border: `0.5px solid ${st.border}`, color: st.color, textTransform: "capitalize" }}>
      {st.label}
    </span>
  );
}

// ─── Segment pill ─────────────────────────────────────────────────────────────
function SegmentPill({ segment }) {
  const map = {
    POSTPAID:  "var(--blue)", PREPAID: "var(--green)",
    BUSINESS:  "var(--orange)", DATA_ONLY: "var(--yellow)",
  };
  const color = map[segment] || "var(--text-dim)";
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
      <label style={{ fontSize: 11, color: "var(--text-dim)", fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" }}>{label}</label>
      <input
        type={type}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        style={{ ...inputStyleStyle, height: 38, fontSize: 13 }}
      />
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function OfferModal({ offer, onClose, onSave }) {
  const { t } = useLanguage();
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
      <div style={{ ...cardStyleStyle, width: "100%", maxWidth: 640, maxHeight: "90vh", overflowY: "auto", padding: 28 }}>
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
           <h3 style={{ fontFamily: fonts.heading, fontSize: 17, fontWeight: 600, color: "var(--text)" }}>
             {offer?.offer_id ? t("offers.editOffer") : t("offers.newOffer")}
           </h3>
         <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-dim)", fontSize: 20, lineHeight: 1 }}>×</button>
       </div>

       <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
         <div style={{ gridColumn: "span 2" }}>
           <FormField label={t("offers.form.offerName")} value={form.name} onChange={v => set("name", v)} placeholder="e.g. POSTPAID PRO 50GB" />
         </div>
         <div>
           <label style={{ fontSize: 11, color: "var(--text-dim)", fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>{t("offers.form.segment")}</label>
           <select value={form.segment} onChange={e => set("segment", e.target.value)} style={{ ...inputStyleStyle, height: 38, fontSize: 13 }}>
             {["PREPAID","POSTPAID","BUSINESS"].map(s => <option key={s} value={s}>{s === "PREPAID" ? t("offers.segment.prepaid") : s === "POSTPAID" ? t("offers.segment.postpaid") : t("offers.segment.business")}</option>)}
           </select>
         </div>
         <div>
           <label style={{ fontSize: 11, color: "var(--text-dim)", fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>{t("offers.form.status")}</label>
            <select value={form.status} onChange={e => set("status", e.target.value)} style={{ ...inputStyleStyle, height: 38, fontSize: 13 }}>
             {["PUBLISHED","DRAFT","RETIRED"].map(s => (
               <option key={s} value={s}>
                 {s === "PUBLISHED" ? t("offers.status.published") : s === "DRAFT" ? t("offers.status.draft") : t("offers.status.inactive")}
               </option>
             ))}
           </select>
         </div>
         <FormField label={t("offers.form.monthlyPrice")} value={form.monthly_price} onChange={v => set("monthly_price", v)} type="number" placeholder="0.00" />
         <FormField label={t("offers.form.validity")} value={form.validity_days} onChange={v => set("validity_days", v)} type="number" placeholder="30" />
         <FormField label={t("offers.form.minutesQuota")} value={form.quota_minutes} onChange={v => set("quota_minutes", v)} type="number" placeholder="0" />
         <FormField label={t("offers.form.smsQuota")} value={form.quota_sms} onChange={v => set("quota_sms", v)} type="number" placeholder="0" />
         <FormField label={t("offers.form.dataQuota")} value={form.quota_data_gb} onChange={v => set("quota_data_gb", v)} type="number" placeholder="e.g. 50" />
         <FormField label={t("offers.form.fairUse")} value={form.fair_use_gb} onChange={v => set("fair_use_gb", v)} type="number" placeholder="0" />
         <FormField label={t("offers.form.overMinute")} value={form.over_minute_price} onChange={v => set("over_minute_price", v)} type="number" placeholder="0.10" />
         <FormField label={t("offers.form.overSms")} value={form.over_sms_price} onChange={v => set("over_sms_price", v)} type="number" placeholder="0.05" />
         <FormField label={t("offers.form.overData")} value={form.over_data_price} onChange={v => set("over_data_price", v)} type="number" placeholder="0.50" />
         <FormField label={t("offers.form.roamingDays")} value={form.roaming_included_days} onChange={v => set("roaming_included_days", v)} type="number" placeholder="0" />
       </div>

{error && <p style={{ marginTop: 12, fontSize: 13, color: "var(--red)" }}>{error}</p>}

        <div style={{ display: "flex", gap: 10, marginTop: 22, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={btnGhostStyleStyle}>{t("common.cancel")}</button>
          <button onClick={handleSave} disabled={saving} style={{ ...btnPrimaryStyleStyle, opacity: saving ? 0.7 : 1 }}>
            {saving ? t("common.loading") : t("offers.newOffer")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Offers() {
  const { t } = useLanguage();
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
          <h2 style={{ fontFamily: fonts.heading, fontSize: 20, fontWeight: 600, color: "var(--text)" }}>{t("offers.title")}</h2>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 3 }}>{t("offers.subtitle")}</p>
        </div>
        {isAdmin() && (
          <button onClick={() => setModal("new")} style={{ ...btnPrimaryStyleStyle, height: 40 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            {t("offers.newOffer")}
          </button>
        )}
      </div>

      {/* Filters */}
      <div style={{ ...cardStyleStyle, padding: "14px 18px", marginBottom: 18, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-dim)" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
<input value={search} onChange={e => setSearch(e.target.value)} placeholder={t("offers.searchPlaceholder")}
            style={{ ...inputStyleStyle, height: 36, paddingLeft: 36, fontSize: 13 }} />
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {SEGMENTS.map(s => (
            <button key={s} onClick={() => setSegment(s)}
              style={{ height: 34, padding: "0 12px", borderRadius: 8, border: `0.5px solid ${segment === s ? "var(--blue)" : "var(--border)"}`,
                background: segment === s ? "var(--blue-dim)" : "transparent", color: segment === s ? "var(--blue)" : "var(--text-muted)",
                cursor: "pointer", fontSize: 12, fontWeight: segment === s ? 500 : 400, transition: "all 0.18s" }}>
              {s === "ALL" ? t("common.all") : s === "PREPAID" ? t("offers.segment.prepaid") : s === "POSTPAID" ? t("offers.segment.postpaid") : s === "BUSINESS" ? t("offers.segment.business") : t("offers.segment.dataOnly")}
            </button>
          ))}
        </div>
         <div style={{ display: "flex", gap: 6 }}>
           {STATUSES.map(s => {
             const label = s === "ALL" ? t("common.all") :
                           s === "PUBLISHED" ? t("offers.status.published") :
                           s === "DRAFT" ? t("offers.status.draft") : t("offers.status.inactive");
             return (
               <button key={s} onClick={() => setStatus(s)}
                 style={{ height: 34, padding: "0 12px", borderRadius: 8, border: `0.5px solid ${status === s ? "var(--green)" : "var(--border)"}`,
                   background: status === s ? "rgba(67,199,139,0.1)" : "transparent", color: status === s ? "var(--green)" : "var(--text-muted)",
                   cursor: "pointer", fontSize: 12, fontWeight: status === s ? 500 : 400, transition: "all 0.18s" }}>
                 {label}
               </button>
             );
           })}
         </div>
        <span style={{ fontSize: 12, color: "var(--text-dim)", whiteSpace: "nowrap" }}>{t("offers.offersFound").replace("{count}", filtered.length)}</span>
      </div>

      {/* Table */}
      <div style={{ ...cardStyleStyle, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: `0.5px solid ${"var(--border)"}` }}>
              {[
                t("offers.table.name"),
                t("offers.table.segment"),
                t("offers.table.price"),
                t("offers.table.data"),
                t("offers.table.minutes"),
                t("offers.table.sms"),
                t("offers.table.validity"),
                t("offers.table.status"),
                t("offers.table.actions")
              ].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 500, color: "var(--text-dim)", letterSpacing: "0.05em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} style={{ padding: 40, textAlign: "center", color: "var(--text-dim)" }}>{t("offers.loading")}</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={9} style={{ padding: 40, textAlign: "center", color: "var(--text-dim)" }}>{t("offers.noOffers")}</td></tr>
            ) : filtered.map((o, i) => (
              <tr key={o.id} style={{ borderBottom: `0.5px solid rgba(26,143,255,0.06)`, background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)", transition: "background 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(26,143,255,0.05)"}
                onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.015)"}>
                <td style={{ padding: "12px 16px", color: "var(--text)", fontWeight: 500 }}>{o.name}</td>
                <td style={{ padding: "12px 16px" }}><SegmentPill segment={o.segment} /></td>
                <td style={{ padding: "12px 16px", color: "var(--blue)", fontWeight: 600 }}>{Number(o.monthly_price).toFixed(2)} TND</td>
                <td style={{ padding: "12px 16px", color: "var(--text-muted)" }}>{o.quota_data ? `${o.quota_data} GB` : t("common.noData")}</td>
                <td style={{ padding: "12px 16px", color: "var(--text-muted)" }}>{o.quota_minutes || t("common.noData")}</td>
                <td style={{ padding: "12px 16px", color: "var(--text-muted)" }}>{o.quota_sms || t("common.noData")}</td>
                <td style={{ padding: "12px 16px", color: "var(--text-muted)" }}>{o.validity_days}d</td>
                <td style={{ padding: "12px 16px" }}><StatusBadge status={o.status} /></td>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    {isAdmin() && (
                      <>
                        <button onClick={() => setModal(o)} style={{ ...btnGhostStyleStyle, height: 30, padding: "0 10px", fontSize: 12 }}>{t("common.edit")}</button>
                        <button onClick={() => handleDelete(o.id)} disabled={deleting === o.id}
                          style={{ ...btnDangerStyleStyle, height: 30, padding: "0 10px", fontSize: 12, opacity: deleting === o.id ? 0.6 : 1 }}>
                          {deleting === o.id ? "…" : t("common.delete")}
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
