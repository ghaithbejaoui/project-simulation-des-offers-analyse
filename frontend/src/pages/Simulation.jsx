import { useState, useEffect } from "react";
import { fonts } from "../styles/theme";

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

// ─── Score ring ───────────────────────────────────────────────────────────────
function ScoreRing({ score, size = 80 }) {
  const radius = (size - 10) / 2;
  const circ   = 2 * Math.PI * radius;
  const dash   = (score / 100) * circ;
  const color  = score >= 75 ? "var(--green)" : score >= 50 ? "var(--yellow)" : "var(--red)";
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
        {size > 70 && <span style={{ fontSize: 9, color: "var(--text-dim)", letterSpacing: "0.04em" }}>/ 100</span>}
      </div>
    </div>
  );
}

// ─── Result card ──────────────────────────────────────────────────────────────
function ResultCard({ result, rank }) {
  const rankColors = ["#f0b429", "#c0c0c0", "#cd7f32", "var(--text-dim)"];
  const rankColor  = rankColors[rank] || "var(--text-dim)";
  const rankLabel  = ["🥇 Best", "🥈 2nd", "🥉 3rd"][rank] || `#${rank + 1}`;

  return (
    <div style={{ ...cardStyle, padding: "20px 22px", position: "relative", overflow: "hidden", borderColor: rank === 0 ? "rgba(240,180,41,0.35)" : "var(--border)", transition: "border-color 0.2s" }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "var(--border-hover)"}
      onMouseLeave={e => e.currentTarget.style.borderColor = rank === 0 ? "rgba(240,180,41,0.35)" : "var(--border)"}>
      {rank === 0 && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, #f0b429, transparent)" }} />}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <span style={{ fontSize: 11, fontWeight: 600, color: rankColor, letterSpacing: "0.05em" }}>{rankLabel}</span>
          <h3 style={{ fontSize: 16, fontWeight: 600, fontFamily: fonts.heading, color: "var(--text)", marginTop: 4, letterSpacing: "-0.3px" }}>
            {result.offer_name || result.offer?.name || "Offer"}
          </h3>
          <p style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 2 }}>
            {result.offer?.segment?.replace("_"," ")}
          </p>
        </div>
        <ScoreRing score={result.satisfaction_score || 0} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
        {[
          { label: "Base Price", value: `${Number(result.base_cost || 0).toFixed(2)} TND`, color: "var(--blue)" },
          { label: "Total Cost", value: `${Number(result.total_cost || 0).toFixed(2)} TND`, color: "var(--text)" },
          { label: "Voice Overage", value: `${Number(result.overage_minutes_cost || 0).toFixed(2)} TND`, color: result.overage_minutes_cost > 0 ? "var(--red)" : "var(--text-dim)" },
          { label: "Data Overage",  value: `${Number(result.overage_data_cost || 0).toFixed(2)} TND`, color: result.overage_data_cost > 0 ? "var(--red)" : "var(--text-dim)" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ padding: "10px 12px", background: "rgba(255,255,255,0.03)", borderRadius: 8, border: `0.5px solid rgba(26,143,255,0.08)` }}>
            <p style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 3 }}>{label}</p>
            <p style={{ fontSize: 14, fontWeight: 600, color }}>{value}</p>
          </div>
        ))}
      </div>

      {result.justification && (
        <div style={{ padding: "10px 12px", background: "rgba(26,143,255,0.06)", borderRadius: 8, border: `0.5px solid rgba(26,143,255,0.15)` }}>
          <p style={{ fontSize: 12, color: "var(--text-muted)", fontStyle: "italic" }}>💡 {result.justification}</p>
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
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Save to scenario handler
  const handleSaveToScenario = async () => {
    setSaveError("");
    setSaveSuccess(false);
    if (!saveName.trim()) { setSaveError("Please enter a scenario name"); return; }
    try {
      const profileId = selectedProfile || (customProfile ? null : null);
      const offerIds = mode === "compare" ? selectedOffers : (mode === "single" ? selectedOffers : []);
      
      // Create scenario
      const createRes = await fetch(`${API}/scenarios`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          name: saveName,
          description: `Simulation: ${mode} mode`,
          profile_id: profileId ? parseInt(profileId) : null,
          offer_ids: offerIds,
        }),
      });
      if (!createRes.ok) throw new Error("Failed to create scenario");
      const { scenario_id } = await createRes.json();
      
      // Prepare results for saving
      const resultsToSave = resultsArray.map((r, idx) => ({
        profile_id: profileId ? parseInt(profileId) : null,
        offer_id: r.offer_id,
        base_cost: r.base_cost,
        overage_cost: (r.overage_minutes_cost || 0) + (r.overage_sms_cost || 0) + (r.overage_data_cost || 0),
        roaming_cost: r.roaming_cost,
        total_cost: r.total_cost,
        satisfaction_score: r.satisfaction_score,
        recommendation: r.satisfaction_score >= 70 ? "good_match" : r.satisfaction_score >= 50 ? "okay_match" : "not_recommended",
        rank_by_cost: r.rank_by_cost || null,
        rank_by_score: idx + 1,
      }));
      
      // Save results
      const saveRes = await fetch(`${API}/scenarios/${scenario_id}/results`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ results: resultsToSave }),
      });
      if (!saveRes.ok) throw new Error("Failed to save results");
      
      setSaveSuccess(true);
      setSaveName("");
      setTimeout(() => { setShowSaveModal(false); setSaveSuccess(false); }, 1500);
    } catch (e) { setSaveError(e.message); }
  };

  // Export results as CSV
  const handleExportCSV = () => {
    if (!resultsArray.length) return;
    
    // Get profile info
    const profileName = selectedProfile ? profiles.find(p => p.profile_id == selectedProfile)?.label || `Profile ${selectedProfile}` : (useCustom ? 'Custom Profile' : 'Unknown');
    const profileData = useCustom ? customProfile : (selectedProfile ? profiles.find(p => p.profile_id == selectedProfile) : {});
    
    let csv = 'Simulation Info\n';
    csv += `Profile,${profileName}\n`;
    csv += `Mode,${mode}\n`;
    csv += `Date,${new Date().toISOString()}\n`;
    csv += `Minutes (avg),${profileData?.minutes_avg || customProfile?.avg_minutes || 0}\n`;
    csv += `SMS (avg),${profileData?.sms_avg || customProfile?.avg_sms || 0}\n`;
    csv += `Data GB (avg),${profileData?.data_avg_gb || customProfile?.avg_data_gb || 0}\n`;
    csv += `Budget Max,${profileData?.budget_max || customProfile?.budget_max || 0}\n`;
    csv += `Priority,${profileData?.priority || customProfile?.priority || 'BALANCED'}\n`;
    csv += `Roaming Days,${profileData?.roaming_days || customProfile?.roaming_days || 0}\n`;
    csv += '\nResults\n';
    csv += 'Rank,Offer,Segment,Base Cost,Overage Cost,Roaming Cost,Total Cost,Satisfaction Score,Recommendation\n';
    resultsArray.forEach((r, i) => {
      const offerName = r.offer_name || r.offer?.name || `Offer ${r.offer_id}`;
      const segment = r.offer?.segment || '';
      const rec = r.satisfaction_score >= 70 ? 'Good Match' : r.satisfaction_score >= 50 ? 'Okay' : 'Not Recommended';
      csv += `${i + 1},"${offerName}","${segment}",${r.base_cost || 0},${Number(r.overage_minutes_cost || 0) + Number(r.overage_sms_cost || 0) + Number(r.overage_data_cost || 0)},${r.roaming_cost || 0},${r.total_cost || 0},${r.satisfaction_score || 0},${rec}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `simulation_${profileName.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Export results as PDF using browser print
  const handleExportPDF = () => {
    if (!resultsArray.length) return;
    
    const profileName = selectedProfile ? profiles.find(p => p.profile_id == selectedProfile)?.label || `Profile ${selectedProfile}` : (useCustom ? 'Custom Profile' : 'Unknown');
    const profileData = useCustom ? customProfile : (selectedProfile ? profiles.find(p => p.profile_id == selectedProfile) : {});
    
    // Create print-friendly HTML
    const printWindow = window.open('', '_blank');
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Simulation Report - ${profileName}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1a1a1a; }
          h1 { font-size: 24px; margin-bottom: 8px; color: #1a1a1a; }
          h2 { font-size: 18px; margin: 24px 0 12px; color: #333; border-bottom: 2px solid #1a8fff; padding-bottom: 8px; }
          .header { margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #ddd; }
          .meta { color: #666; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; margin: 16px 0; }
          th { background: #f5f7fa; padding: 12px 8px; text-align: left; font-size: 12px; text-transform: uppercase; color: #666; border-bottom: 2px solid #ddd; }
          td { padding: 12px 8px; border-bottom: 1px solid #eee; }
          tr:first-child td { font-weight: 600; }
          .badge { display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 500; }
          .green { background: #e6f7f0; color: #1a8f4d; }
          .yellow { background: #fef7e6; color: #b38600; }
          .red { background: #fce8e6; color: #c0392b; }
          .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #ddd; font-size: 12px; color: #999; text-align: center; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>SimTélécom - Simulation Report</h1>
          <p class="meta">Profile: ${profileName} | Mode: ${mode} | Date: ${new Date().toLocaleDateString()}</p>
        </div>
        
        <h2>Customer Profile</h2>
        <table>
          <tr><th>Metric</th><th>Value</th></tr>
          <tr><td>Minutes (avg)</td><td>${profileData?.minutes_avg || customProfile?.avg_minutes || 0}</td></tr>
          <tr><td>SMS (avg)</td><td>${profileData?.sms_avg || customProfile?.avg_sms || 0}</td></tr>
          <tr><td>Data GB (avg)</td><td>${profileData?.data_avg_gb || customProfile?.avg_data_gb || 0}</td></tr>
          <tr><td>Budget Max</td><td>${profileData?.budget_max || customProfile?.budget_max || 0} TND</td></tr>
          <tr><td>Priority</td><td>${profileData?.priority || customProfile?.priority || 'BALANCED'}</td></tr>
        </table>
        
        <h2>Simulation Results</h2>
        <table>
          <tr>
            <th>#</th>
            <th>Offer</th>
            <th>Segment</th>
            <th>Base Cost</th>
            <th>Overage</th>
            <th>Total</th>
            <th>Score</th>
            <th>Recommendation</th>
          </tr>
          ${resultsArray.map((r, i) => {
            const offerName = r.offer_name || r.offer?.name || 'Offer ' + r.offer_id;
            const segment = r.offer?.segment || '';
            const rec = r.satisfaction_score >= 70 ? 'Good Match' : r.satisfaction_score >= 50 ? 'Okay' : 'Not Recommended';
            const recClass = r.satisfaction_score >= 70 ? 'green' : r.satisfaction_score >= 50 ? 'yellow' : 'red';
            return `<tr>
              <td>${i + 1}</td>
              <td>${offerName}</td>
              <td>${segment}</td>
              <td>${Number(r.base_cost || 0).toFixed(2)} TND</td>
              <td>${(Number(r.overage_minutes_cost || 0) + Number(r.overage_sms_cost || 0) + Number(r.overage_data_cost || 0)).toFixed(2)} TND</td>
              <td><strong>${Number(r.total_cost || 0).toFixed(2)} TND</strong></td>
              <td><strong>${r.satisfaction_score || 0}</strong></td>
              <td><span class="badge ${recClass}">${rec}</span></td>
            </tr>`;
          }).join('')}
        </table>
        
        <div class="footer">
          SimTélécom · PFE 2026 | Generated on ${new Date().toLocaleString()}
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  // Form state for custom profile
  const [useCustom, setUseCustom] = useState(false);
   const [customProfile, setCustomProfile] = useState({
     avg_minutes: 200, avg_sms: 50, avg_data_gb: 20, night_usage_pct: 10,
     roaming_days: 0, budget_max: 60, priority: "quality", segment: "POSTPAID",
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
             body = { profile_id: profile.profile_id || profile.id, offer_id: selectedOffers[0], priority: customProfile.priority };
           } else {
            body = { ...buildProfileData(profile), offer_id: selectedOffers[0] };
          }
       } else if (mode === "compare") {
         if (selectedOffers.length < 2) { setError("Select at least 2 offers."); setLoading(false); return; }
          url = `${API}/simulation/compare`;
           if (profile.profile_id || profile.id) {
             body = { profile_id: profile.profile_id || profile.id, offer_ids: selectedOffers, priority: customProfile.priority };
           } else {
            body = { ...buildProfileData(profile), offer_ids: selectedOffers };
          }
       } else if (mode === "recommend") {
          url = `${API}/simulation/recommend`;
           if (profile.profile_id || profile.id) {
             body = { profile_id: profile.profile_id || profile.id, limit: 5, priority: customProfile.priority };
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
      <label style={{ fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.04em" }}>{label}</label>
      {options ? (
        <select value={customProfile[k]} onChange={e => setCustomProfile(p => ({ ...p, [k]: e.target.value }))} style={{ ...inputStyle, height: 36, fontSize: 13 }}>
          {options.map(o => <option key={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} value={customProfile[k]} onChange={e => setCustomProfile(p => ({ ...p, [k]: e.target.value }))}
          style={{ ...inputStyle, height: 36, fontSize: 13 }} />
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
        <h2 style={{ fontFamily: fonts.heading, fontSize: 20, fontWeight: 600, color: "var(--text)" }}>Simulation Engine</h2>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 3 }}>Run cost simulations and compare offers for customer profiles</p>
      </div>

      {/* Mode tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 22, padding: 4, background: "rgba(255,255,255,0.03)", borderRadius: 12, border: `0.5px solid var(--border)`, width: "fit-content" }}>
        {[
          { key: "recommend", label: "🎯 Recommend" },
          { key: "compare",   label: "⚡ Compare" },
          { key: "single",    label: "🔎 Single" },
          { key: "batch",     label: "📊 Batch" },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => { setMode(key); setResults(null); setSelectedOffers([]); }}
            style={{ height: 36, padding: "0 18px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: mode === key ? 500 : 400,
              background: mode === key ? "rgba(26,143,255,0.15)" : "transparent",
              color: mode === key ? "var(--blue)" : "var(--text-muted)",
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
            <div style={{ ...cardStyle, padding: "18px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>Customer Profile</p>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-muted)", cursor: "pointer" }}>
                  <input type="checkbox" checked={useCustom} onChange={e => setUseCustom(e.target.checked)} style={{ accentColor: "var(--blue)" }} />
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
                  style={{ ...inputStyle, height: 40, fontSize: 13 }}>
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
              <div style={{ ...cardStyle, padding: "18px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>
                    {mode === "single" ? "Select Offer" : "Select Offers to Compare"}
                  </p>
                  <span style={{ fontSize: 12, color: "var(--text-dim)" }}>{selectedOffers.length} selected</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 6, maxHeight: 300, overflowY: "auto", padding: 2 }}>
                  {offers.map(o => (
                    <label key={o.offer_id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 8px", borderRadius: 6,
                      background: selectedOffers.includes(o.offer_id) ? "rgba(26,143,255,0.15)" : "rgba(255,255,255,0.02)",
                      border: `0.5px solid ${selectedOffers.includes(o.offer_id) ? "var(--blue)" : "var(--border)"}`,
                      cursor: "pointer", transition: "all 0.15s" }}>
                      <input type={mode === "single" ? "radio" : "checkbox"} name="offer"
                        checked={selectedOffers.includes(o.offer_id)} onChange={() => toggleOffer(o.offer_id)}
                        style={{ accentColor: "var(--blue)", flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 11, color: "var(--text)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.name}</p>
                        <p style={{ fontSize: 10, color: "var(--text-dim)" }}>{Number(o.monthly_price).toFixed(2)} TND · {o.segment?.replace("_"," ")}</p>
                      </div>
                    </label>
                  ))}
                </div>
                {mode === "compare" && selectedOffers.length > 0 && (
                  <button
                    onClick={() => setSelectedOffers([])}
                    style={{
                      ...btnDangerStyle,
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
              <div style={{ ...cardStyle, padding: "18px 20px" }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", marginBottom: 12 }}>Offer to Analyze</p>
                <select value={batchOfferId} onChange={e => setBatchOfferId(e.target.value)} style={{ ...inputStyle, height: 40, fontSize: 13 }}>
                  <option value="">— Select offer —</option>
                  {offers.map(o => <option key={o.offer_id} value={o.offer_id}>{o.name}</option>)}
                </select>
                <p style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 10 }}>
                  Will run across {profiles.length} profiles in database.
                </p>
              </div>
            )}

           {error && (
             <div style={{ padding: "12px 16px", background: "rgba(227,91,91,0.1)", border: "0.5px solid rgba(227,91,91,0.3)", borderRadius: 10, fontSize: 13, color: "#f09070" }}>
               {error}
             </div>
           )}

           <button onClick={run} disabled={loading} style={{ ...btnPrimaryStyle, height: 46, fontSize: 14, justifyContent: "center", opacity: loading ? 0.7 : 1 }}>
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
            <div style={{ ...cardStyle, padding: 48, textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>⚡</div>
              <p style={{ fontSize: 15, fontWeight: 500, color: "var(--text)", marginBottom: 8 }}>Ready to simulate</p>
              <p style={{ fontSize: 13, color: "var(--text-dim)" }}>Configure a profile and click Run to see cost analysis and offer comparisons.</p>
            </div>
          )}

          {loading && (
            <div style={{ ...cardStyle, padding: 48, textAlign: "center" }}>
              <div style={{ width: 40, height: 40, border: `3px solid rgba(26,143,255,0.15)`, borderTop: `3px solid var(--blue)`, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
              <p style={{ fontSize: 14, color: "var(--text-muted)" }}>Running simulation…</p>
            </div>
          )}

          {results && !loading && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Summary bar */}
              {resultsArray.length > 0 && (
                <div style={{ ...cardStyle, padding: "14px 20px", display: "flex", gap: 24, alignItems: "center", borderColor: "rgba(26,143,255,0.3)" }}>
                  <div>
                    <p style={{ fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Offers Analyzed</p>
                    <p style={{ fontSize: 22, fontWeight: 600, fontFamily: fonts.heading, color: "var(--text)" }}>{resultsArray.length}</p>
                  </div>
                  {resultsArray[0] && (
                    <>
                      <div style={{ width: 1, height: 36, background: "var(--border)" }} />
                      <div>
                        <p style={{ fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Best Score</p>
                        <p style={{ fontSize: 22, fontWeight: 600, fontFamily: fonts.heading, color: "var(--green)" }}>
                          {Math.round(resultsArray[0].satisfaction_score || 0)}/100
                        </p>
                      </div>
                      <div style={{ width: 1, height: 36, background: "var(--border)" }} />
                      <div>
                        <p style={{ fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Best Price</p>
                        <p style={{ fontSize: 22, fontWeight: 600, fontFamily: fonts.heading, color: "var(--blue)" }}>
                          {Number(resultsArray[0].total_cost || 0).toFixed(2)} TND
                        </p>
                      </div>
                    </>
                  )}
                  <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                    <button onClick={() => setShowSaveModal(true)} style={{ ...btnPrimaryStyle, height: 34, fontSize: 12 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                      Save to Scenario
                    </button>
                    <button onClick={handleExportCSV} style={{ ...btnGhostStyle, height: 34, fontSize: 12 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      CSV
                    </button>
                    <button onClick={handleExportPDF} style={{ ...btnGhostStyle, height: 34, fontSize: 12 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      PDF
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
                <div style={{ ...cardStyle, padding: "18px 20px" }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", marginBottom: 14 }}>Batch Summary</p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                    {[
                      { label: "Avg Total Cost", value: `${Number(results.summary.avg_total_cost || 0).toFixed(2)} TND` },
                      { label: "Avg Satisfaction", value: `${Math.round(results.summary.avg_satisfaction || 0)}/100` },
                      { label: "Profiles Over Budget", value: results.summary.profiles_over_budget || 0 },
                      { label: "Avg Overage Cost", value: `${Number(results.summary.avg_overage || 0).toFixed(2)} TND` },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ padding: "12px", background: "rgba(255,255,255,0.03)", borderRadius: 8, border: `0.5px solid var(--border)` }}>
                        <p style={{ fontSize: 11, color: "var(--text-dim)", marginBottom: 4 }}>{label}</p>
                        <p style={{ fontSize: 18, fontWeight: 600, fontFamily: fonts.heading, color: "var(--blue)" }}>{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Save to Scenario Modal */}
      {showSaveModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ ...cardStyle, width: "100%", maxWidth: 420, padding: 28 }}>
            {saveSuccess ? (
              <>
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(67,199,139,0.15)", border: "1px solid rgba(67,199,139,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <h3 style={{ fontFamily: fonts.heading, fontSize: 18, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>Scenario Saved</h3>
                  <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Your simulation results have been saved successfully.</p>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
                  <h3 style={{ fontFamily: fonts.heading, fontSize: 17, fontWeight: 600, color: "var(--text)" }}>Save to Scenario</h3>
                  <button onClick={() => { setShowSaveModal(false); setSaveError(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-dim)", fontSize: 20 }}>×</button>
                </div>
                
                <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
                  This will save your simulation results to a new scenario that you can view later.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 20 }}>
                  <label style={{ fontSize: 11, color: "var(--text-dim)", fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" }}>Scenario Name</label>
                  <input
                    type="text"
                    value={saveName}
                    onChange={e => { setSaveName(e.target.value); setSaveError(""); }}
                    placeholder="My Comparison Scenario"
                    style={{ ...inputStyle, height: 40, fontSize: 13, borderColor: saveError ? "rgba(227,91,91,0.5)" : undefined }}
                    onKeyDown={e => e.key === "Enter" && handleSaveToScenario()}
                  />
                  {saveError && <p style={{ fontSize: 12, color: "var(--red)", marginTop: 4 }}>{saveError}</p>}
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => { setShowSaveModal(false); setSaveError(""); }} style={{ ...btnGhostStyle, flex: 1 }}>Cancel</button>
                  <button onClick={handleSaveToScenario} style={{ ...btnPrimaryStyle, flex: 1 }}>
                    Save Scenario
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
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
