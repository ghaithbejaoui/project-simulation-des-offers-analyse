import { useState, useEffect } from "react";
import { colors, fonts, card, btnPrimary, btnGhost, btnDanger, input } from "../styles/theme";

const API = "http://localhost:5000/api";
const getHeaders = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` });

// ─── Score ring ───────────────────────────────────────────────────────────────
function ScoreRing({ score, size = 80 }) {
  const radius = (size - 10) / 2;
  const circ   = 2 * Math.PI * radius;
  const dash   = (score / 100) * circ;
  const color  = score >= 75 ? colors.green : score >= 50 ? colors.yellow : colors.red;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={6} />
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth={6}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1s ease", filter: `drop-shadow(0 0 4px ${color})` }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: size > 70 ? 18 : 13, fontWeight: 600, fontFamily: fonts.heading, color }}>{Math.round(score)}</span>
        {size > 70 && <span style={{ fontSize: 9, color: colors.textDim, letterSpacing: "0.04em" }}>/ 100</span>}
      </div>
    </div>
  );
}

// ─── Result card ──────────────────────────────────────────────────────────────
function ResultCard({ result, rank }) {
  const rankColors = ["#f0b429", "#c0c0c0", "#cd7f32", colors.textDim];
  const rankColor  = rankColors[rank] || colors.textDim;
  const rankLabel  = ["🥇 Best", "🥈 2nd", "🥉 3rd"][rank] || `#${rank + 1}`;

  return (
    <div style={{ ...card, padding: "20px 22px", position: "relative", overflow: "hidden", borderColor: rank === 0 ? "rgba(240,180,41,0.35)" : colors.border, transition: "border-color 0.2s" }}
      onMouseEnter={e => e.currentTarget.style.borderColor = colors.borderHov}
      onMouseLeave={e => e.currentTarget.style.borderColor = rank === 0 ? "rgba(240,180,41,0.35)" : colors.border}>
      {rank === 0 && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, #f0b429, transparent)" }} />}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <span style={{ fontSize: 11, fontWeight: 600, color: rankColor, letterSpacing: "0.05em" }}>{rankLabel}</span>
          <h3 style={{ fontSize: 16, fontWeight: 600, fontFamily: fonts.heading, color: colors.text, marginTop: 4, letterSpacing: "-0.3px" }}>
            {result.offer_name || result.offer?.name || "Offer"}
          </h3>
          <p style={{ fontSize: 12, color: colors.textDim, marginTop: 2 }}>
            {result.offer?.segment?.replace("_"," ")}
          </p>
        </div>
        <ScoreRing score={result.satisfaction_score || 0} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        {[
          { label: "Base Price", value: `${Number(result.base_cost || 0).toFixed(2)} TND`, color: colors.blue },
          { label: "Total Cost", value: `${Number(result.total_cost || 0).toFixed(2)} TND`, color: colors.text },
          { label: "Voice Overage", value: `${Number(result.overage_minutes_cost || 0).toFixed(2)} TND`, color: result.overage_minutes_cost > 0 ? colors.red : colors.textDim },
          { label: "Data Overage",  value: `${Number(result.overage_data_cost || 0).toFixed(2)} TND`, color: result.overage_data_cost > 0 ? colors.red : colors.textDim },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: "10px 12px", background: "rgba(255,255,255,0.03)", borderRadius: 8, border: `0.5px solid rgba(26,143,255,0.08)` }}>
            <p style={{ fontSize: 11, color: colors.textDim, marginBottom: 3 }}>{label}</p>
            <p style={{ fontSize: 14, fontWeight: 600, color }}>{value}</p>
          </div>
        ))}
      </div>

      {result.justification && (
        <div style={{ padding: "10px 12px", background: "rgba(26,143,255,0.06)", borderRadius: 8, border: `0.5px solid rgba(26,143,255,0.15)` }}>
          <p style={{ fontSize: 12, color: colors.textMuted, fontStyle: "italic" }}>💡 {result.justification}</p>
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function Simulation() {
  const [mode, setMode]           = useState("recommend"); // "single" | "compare" | "recommend" | "batch"
  const [offers, setOffers]       = useState([]);
  const [profiles, setProfiles]   = useState([]);
  const [results, setResults]     = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [selectedProfile, setSelectedProfile] = useState("");
  const [selectedOffers, setSelectedOffers]   = useState([]);
  const [batchOfferId, setBatchOfferId]        = useState("");

  // Form state for custom profile
  const [useCustom, setUseCustom] = useState(false);
  const [customProfile, setCustomProfile] = useState({
    avg_minutes: 200, avg_sms: 50, avg_data_gb: 20, night_usage_pct: 10,
    roaming_days: 0, budget_max: 60, priority: "balanced", segment: "POSTPAID",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [oRes, pRes] = await Promise.all([
          fetch(`${API}/offers`, { headers: getHeaders() }),
          fetch(`${API}/customer-profiles`, { headers: getHeaders() }),
        ]);
        if (oRes.ok) setOffers(await oRes.json());
        if (pRes.ok) setProfiles(await pRes.json());
      } catch {}
    };
    loadData();
    // Pre-fill from profile navigation
    const stored = localStorage.getItem("sim_profile");
    if (stored) { setSelectedProfile(JSON.parse(stored).id); localStorage.removeItem("sim_profile"); }
  }, []);

  const getProfile = () => {
    if (useCustom) return customProfile;
    return profiles.find(p => String(p.profile_id || p.id) === String(selectedProfile));
  };

   const run = async () => {
      const profile = getProfile();
      if (!profile && mode !== "batch") { setError("Select a customer profile."); setLoading(false); return; }
      setLoading(true); setError(""); setResults(null);
     try {
       let url = "", body = {};

       // Helper to build profile data for custom profiles
       const buildProfileData = (p) => ({
         minutes_avg: p.minutes_avg || p.avg_minutes || 0,
         sms_avg: p.sms_avg || p.avg_sms || 0,
         data_avg_gb: p.data_avg_gb || p.avg_data_gb || 0,
         roaming_days: p.roaming_days || 0,
         budget_max: p.budget_max || 100,
         priority: (p.priority || 'balanced').toUpperCase()
       });

       if (mode === "single") {
         if (!selectedOffers[0]) { setError("Select an offer."); setLoading(false); return; }
         url = `${API}/simulation`;
         if (profile.profile_id || profile.id) {
           body = { profile_id: profile.profile_id || profile.id, offer_id: selectedOffers[0] };
         } else {
           body = { ...buildProfileData(profile), offer_id: selectedOffers[0] };
         }
       } else if (mode === "compare") {
         if (selectedOffers.length < 2) { setError("Select at least 2 offers."); setLoading(false); return; }
         url = `${API}/simulation/compare`;
         if (profile.profile_id || profile.id) {
           body = { profile_id: profile.profile_id || profile.id, offer_ids: selectedOffers };
         } else {
           body = { ...buildProfileData(profile), offer_ids: selectedOffers };
         }
       } else if (mode === "recommend") {
         url = `${API}/simulation/recommend`;
         if (profile.profile_id || profile.id) {
           body = { profile_id: profile.profile_id || profile.id, limit: 5 };
         } else {
           body = { ...buildProfileData(profile), limit: 5 };
         }
        } else if (mode === "batch") {
          if (!batchOfferId) { setError("Select an offer for batch analysis."); setLoading(false); return; }
          url = `${API}/simulation/batch`;
          body = { offer_id: batchOfferId };
        }

       const res  = await fetch(url, { method: "POST", headers: getHeaders(), body: JSON.stringify(body) });
       const data = await res.json();
       if (!res.ok) throw new Error(data.message || "Simulation failed");
       setResults(data);
     } catch (e) {
       setError(e.message);
       // Demo fallback results
       if (mode === "recommend") setResults(MOCK_RESULTS);
     } finally { setLoading(false); }
   };

  const toggleOffer = (id) => {
    setSelectedOffers(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : (mode === "single" ? [id] : [...prev, id])
    );
  };

  const CpField = ({ label, k, type = "number", options }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 11, color: colors.textDim, textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</label>
      {options ? (
        <select value={customProfile[k]} onChange={e => setCustomProfile(p => ({ ...p, [k]: e.target.value }))} style={{ ...input, height: 36, fontSize: 13 }}>
          {options.map(o => <option key={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} value={customProfile[k]} onChange={e => setCustomProfile(p => ({ ...p, [k]: e.target.value }))}
          style={{ ...input, height: 36, fontSize: 13 }} />
      )}
    </div>
  );

  const resultsArray = results
    ? Array.isArray(results) ? results
    : results.recommendations ? results.recommendations
    : results.comparisons ? results.comparisons
    : results.calculation ? [results]
    : []
    : [];

  return (
    <div style={{ animation: "fadeUp 0.4s ease both" }}>
      <div style={{ marginBottom: 22 }}>
        <h2 style={{ fontFamily: fonts.heading, fontSize: 20, fontWeight: 600, color: colors.text }}>Simulation Engine</h2>
        <p style={{ fontSize: 13, color: colors.textMuted, marginTop: 3 }}>Run cost simulations and compare offers for customer profiles</p>
      </div>

      {/* Mode tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 22, padding: 4, background: "rgba(255,255,255,0.03)", borderRadius: 12, border: `0.5px solid ${colors.border}`, width: "fit-content" }}>
        {[
          { key: "recommend", label: "🎯 Recommend" },
          { key: "compare",   label: "⚡ Compare" },
          { key: "single",    label: "🔎 Single" },
          { key: "batch",     label: "📊 Batch" },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => { setMode(key); setResults(null); setSelectedOffers([]); }}
            style={{ height: 36, padding: "0 18px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: mode === key ? 500 : 400,
              background: mode === key ? colors.blueDim : "transparent",
              color: mode === key ? colors.blue : colors.textMuted,
              transition: "all 0.18s" }}>
            {label}
          </button>
        ))}
      </div>

       <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 20, alignItems: "start" }}>
         {/* Left panel: configuration */}
         <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
           {/* Profile selector - hidden in batch mode */}
           {mode !== "batch" && (
           <div style={{ ...card, padding: "18px 20px" }}>
             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
               <p style={{ fontSize: 13, fontWeight: 500, color: colors.text }}>Customer Profile</p>
               <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: colors.textMuted, cursor: "pointer" }}>
                 <input type="checkbox" checked={useCustom} onChange={e => setUseCustom(e.target.checked)} style={{ accentColor: colors.blue }} />
                 Custom
               </label>
             </div>

             {useCustom ? (
               <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                 <CpField label="Data (GB)" k="avg_data_gb" />
                 <CpField label="Minutes" k="avg_minutes" />
                 <CpField label="SMS" k="avg_sms" />
                 <CpField label="Budget (TND)" k="budget_max" />
                 <CpField label="Night %" k="night_usage_pct" />
                 <CpField label="Roaming (d)" k="roaming_days" />
                 <CpField label="Priority" k="priority" options={["price","quality","balanced"]} />
                 <CpField label="Segment" k="segment" options={["PREPAID","POSTPAID","BUSINESS","DATA_ONLY"]} />
               </div>
             ) : (
               <select value={selectedProfile} onChange={e => setSelectedProfile(e.target.value)}
                 style={{ ...input, height: 40, fontSize: 13 }}>
                 <option value="">— Select a profile —</option>
                 {profiles.map(p => (
                   <option key={p.profile_id || p.id} value={p.profile_id || p.id}>{p.name || p.label || "Profile " + (p.profile_id || p.id)} ({p.segment?.replace("_"," ")})</option>
                 ))}
               </select>
             )}
           </div>
           )}

           {/* Offer selector (for single/compare/batch) */}
           {(mode === "single" || mode === "compare") && (
             <div style={{ ...card, padding: "18px 20px" }}>
               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                 <p style={{ fontSize: 13, fontWeight: 500, color: colors.text }}>
                   {mode === "single" ? "Select Offer" : "Select Offers to Compare"}
                 </p>
                 <span style={{ fontSize: 12, color: colors.textDim }}>{selectedOffers.length} selected</span>
               </div>
               <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 280, overflowY: "auto" }}>
                 {offers.map(o => (
                   <label key={o.offer_id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 8,
                     background: selectedOffers.includes(o.offer_id) ? colors.blueDim : "rgba(255,255,255,0.02)",
                     border: `0.5px solid ${selectedOffers.includes(o.offer_id) ? colors.blue : colors.border}`,
                     cursor: "pointer", transition: "all 0.15s" }}>
                     <input type={mode === "single" ? "radio" : "checkbox"} name="offer"
                       checked={selectedOffers.includes(o.offer_id)} onChange={() => toggleOffer(o.offer_id)}
                       style={{ accentColor: colors.blue, flexShrink: 0 }} />
                     <div style={{ flex: 1 }}>
                       <p style={{ fontSize: 13, color: colors.text, fontWeight: 500 }}>{o.name}</p>
                       <p style={{ fontSize: 11, color: colors.textDim }}>{Number(o.monthly_price).toFixed(2)} TND · {o.segment?.replace("_"," ")}</p>
                     </div>
                   </label>
                 ))}
               </div>
               {mode === "compare" && selectedOffers.length > 0 && (
                 <button
                   onClick={() => setSelectedOffers([])}
                   style={{
                     ...btnDanger,
                     height: 38,
                     fontSize: 13,
                     marginTop: 12,
                     opacity: 1,
                     justifyContent: 'center'
                   }}
                 >
                   Clear Selection
                 </button>
               )}
             </div>
           )}

           {mode === "batch" && (
             <div style={{ ...card, padding: "18px 20px" }}>
               <p style={{ fontSize: 13, fontWeight: 500, color: colors.text, marginBottom: 12 }}>Offer to Analyze</p>
               <select value={batchOfferId} onChange={e => setBatchOfferId(e.target.value)} style={{ ...input, height: 40, fontSize: 13 }}>
                 <option value="">— Select offer —</option>
                 {offers.map(o => <option key={o.offer_id} value={o.offer_id}>{o.name}</option>)}
               </select>
               <p style={{ fontSize: 12, color: colors.textDim, marginTop: 10 }}>
                 Will run across {profiles.length} profiles in database.
               </p>
             </div>
           )}

          {error && (
            <div style={{ padding: "12px 16px", background: "rgba(227,91,91,0.1)", border: "0.5px solid rgba(227,91,91,0.3)", borderRadius: 10, fontSize: 13, color: "#f09070" }}>
              {error}
            </div>
          )}

          <button onClick={run} disabled={loading} style={{ ...btnPrimary, height: 46, fontSize: 14, justifyContent: "center", opacity: loading ? 0.7 : 1 }}>
            {loading ? (
              <><span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} /> Running…</>
            ) : (
              <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              {mode === "recommend" ? "Get Recommendations" : mode === "batch" ? "Run Batch Analysis" : "Run Simulation"}</>
            )}
          </button>
        </div>

        {/* Right panel: results */}
        <div>
          {!results && !loading && (
            <div style={{ ...card, padding: 48, textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>⚡</div>
              <p style={{ fontSize: 15, fontWeight: 500, color: colors.text, marginBottom: 8 }}>Ready to simulate</p>
              <p style={{ fontSize: 13, color: colors.textDim }}>Configure a profile and click Run to see cost analysis and offer comparisons.</p>
            </div>
          )}

          {loading && (
            <div style={{ ...card, padding: 48, textAlign: "center" }}>
              <div style={{ width: 40, height: 40, border: `3px solid ${colors.blueDim}`, borderTop: `3px solid ${colors.blue}`, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
              <p style={{ fontSize: 14, color: colors.textMuted }}>Running simulation…</p>
            </div>
          )}

          {results && !loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Summary bar */}
              {resultsArray.length > 0 && (
                <div style={{ ...card, padding: "14px 20px", display: "flex", gap: 24, alignItems: "center", borderColor: "rgba(26,143,255,0.3)" }}>
                  <div>
                    <p style={{ fontSize: 11, color: colors.textDim, textTransform: "uppercase", letterSpacing: "0.05em" }}>Offers Analyzed</p>
                    <p style={{ fontSize: 22, fontWeight: 600, fontFamily: fonts.heading, color: colors.text }}>{resultsArray.length}</p>
                  </div>
                  {resultsArray[0] && (
                    <>
                      <div style={{ width: 1, height: 36, background: colors.border }} />
                      <div>
                        <p style={{ fontSize: 11, color: colors.textDim, textTransform: "uppercase", letterSpacing: "0.05em" }}>Best Score</p>
                        <p style={{ fontSize: 22, fontWeight: 600, fontFamily: fonts.heading, color: colors.green }}>
                          {Math.round(resultsArray[0].satisfaction_score || 0)}/100
                        </p>
                      </div>
                      <div style={{ width: 1, height: 36, background: colors.border }} />
                      <div>
                        <p style={{ fontSize: 11, color: colors.textDim, textTransform: "uppercase", letterSpacing: "0.05em" }}>Best Price</p>
                        <p style={{ fontSize: 22, fontWeight: 600, fontFamily: fonts.heading, color: colors.blue }}>
                          {Number(resultsArray[0].total_cost || 0).toFixed(2)} TND
                        </p>
                      </div>
                    </>
                  )}
                  <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                    <button style={{ ...btnGhost, height: 34, fontSize: 12 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      Export CSV
                    </button>
                  </div>
                </div>
              )}

              {/* Result cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
                {resultsArray.map((r, i) => <ResultCard key={i} result={r} rank={i} />)}
              </div>

              {/* Batch table */}
              {mode === "batch" && results.summary && (
                <div style={{ ...card, padding: "18px 20px" }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: colors.text, marginBottom: 14 }}>Batch Summary</p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                    {[
                      { label: "Avg Total Cost", value: `${Number(results.summary.avg_total_cost || 0).toFixed(2)} TND` },
                      { label: "Avg Satisfaction", value: `${Math.round(results.summary.avg_satisfaction || 0)}/100` },
                      { label: "Profiles Over Budget", value: results.summary.profiles_over_budget || 0 },
                      { label: "Avg Overage Cost", value: `${Number(results.summary.avg_overage || 0).toFixed(2)} TND` },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ padding: "12px", background: "rgba(255,255,255,0.03)", borderRadius: 8, border: `0.5px solid ${colors.border}` }}>
                        <p style={{ fontSize: 11, color: colors.textDim, marginBottom: 4 }}>{label}</p>
                        <p style={{ fontSize: 18, fontWeight: 600, fontFamily: fonts.heading, color: colors.blue }}>{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Mock results for demo
const MOCK_RESULTS = {
  recommendations: [
    { offer_name: "POSTPAID PRO 50GB", offer: { segment: "POSTPAID" }, satisfaction_score: 87, base_cost: 69, total_cost: 69, overage_minutes_cost: 0, overage_data_cost: 0, justification: "Unlimited minutes match your 350 min/mo usage. Data quota fits well within budget." },
    { offer_name: "POSTPAID CLASSIC", offer: { segment: "POSTPAID" }, satisfaction_score: 71, base_cost: 39, total_cost: 54.5, overage_minutes_cost: 12.5, overage_data_cost: 3, justification: "Affordable base price but overage costs add up with your usage pattern." },
    { offer_name: "BUSINESS UNLIMITED", offer: { segment: "BUSINESS" }, satisfaction_score: 62, base_cost: 149, total_cost: 149, overage_minutes_cost: 0, overage_data_cost: 0, justification: "Exceeds budget by 89 TND — over-provisioned for personal use." },
  ],
};
