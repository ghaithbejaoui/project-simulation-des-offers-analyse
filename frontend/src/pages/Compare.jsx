import { useState, useEffect } from "react";
import { fonts } from "../styles/theme";

const cardStyleStyle = {
  background: "var(--bg-cardStyle)",
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

const btnGhostStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "0 20px",
  height: 40,
  background: "var(--bg-cardStyle)",
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
  background: "var(--bg-cardStyle)",
  border: "0.5px solid var(--border)",
  borderRadius: 10,
  color: "var(--text)",
  fontSize: 13,
  padding: "0 12px",
  outline: "none",
  transition: "border-color 0.2s ease",
};

const selectStyle = {
  background: "var(--bg-cardStyle)",
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

// ─── Comparison Row ───────────────────────────────────────────────────────────
function ComparisonRow({ label, values, highlight }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `180px repeat(${values.length}, 1fr)`, borderBottom: `0.5px solid ${"var(--border)"}` }}>
      <div style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-muted)", fontWeight: 500 }}>{label}</div>
      {values.map((v, i) => (
        <div key={i} style={{ padding: "12px 16px", textAlign: "center", fontSize: 13, color: highlight === i ? "var(--green)" : "var(--text)" }}>
          {v}
        </div>
      ))}
    </div>
  );
}

// ─── Winner Badge ──────────────────────────────────────────────────────────────
function WinnerBadge({ type, value }) {
  const badges = {
    price: { label: "Best Price", color: "var(--blue)" },
    satisfaction: { label: "Best Score", color: "var(--green)" },
    data: { label: "Most Data", color: "var(--yellow)" },
  };
  const b = badges[type] || badges.price;
  if (value) {
    return (
      <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: `${b.color}20`, color: b.color, fontWeight: 600, marginLeft: 6 }}>
        {b.label}
      </span>
    );
  }
  return null;
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Compare() {
  const [offers, setOffers] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOffers, setSelectedOffers] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState("");
  const [comparison, setComparison] = useState(null);
  const [comparing, setComparing] = useState(false);

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
      finally { setLoading(false); }
    };
    loadData();
  }, []);

  const toggleOffer = (index) => {
    setSelectedOffers(prev => {
      if (prev.includes(index)) {
        return prev.filter(x => x !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  const isOfferSelected = (index) => selectedOffers.includes(index);

  const runComparison = async () => {
    if (selectedOffers.length < 2 || !selectedProfile) return;
    setComparing(true);
    try {
      const offerIds = selectedOffers.map(index => offers[index].offer_id || offers[index].id);
      console.log("Sending request:", { profile_id: Number(selectedProfile), offer_ids: offerIds });
      console.log("Profile found:", profiles.find(p => String(p.profile_id ?? p.id) === String(selectedProfile)));
      const res = await fetch(`${API}/simulation/compare`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ profile_id: Number(selectedProfile), offer_ids: offerIds }),
      });
      console.log("Response status:", res.status);
      if (res.ok) {
        const data = await res.json();
        console.log("Response data:", data);
        setComparison(data.comparisons || data);
      } else {
        const errorData = await res.json();
        console.error("Error response:", errorData);
      }
    } catch (err) {
      console.error("Comparison error:", err);
    }
    setComparing(false);
  };

  // Find winners
  const getWinner = (key, higher = true) => {
    if (!comparison || comparison.length === 0) return -1;
    let bestIdx = 0;
    for (let i = 1; i < comparison.length; i++) {
      let curr, best;
      if (key === 'total_cost') {
        curr = parseFloat(comparison[i].calculation?.total_cost || comparison[i].total_cost) || 0;
        best = parseFloat(comparison[bestIdx].calculation?.total_cost || comparison[bestIdx].total_cost) || 0;
      } else if (key === 'satisfaction_score') {
        curr = parseFloat(comparison[i].calculation?.satisfaction_score || comparison[i].satisfaction_score) || 0;
        best = parseFloat(comparison[bestIdx].calculation?.satisfaction_score || comparison[bestIdx].satisfaction_score) || 0;
      } else if (key === 'monthly_price') {
        curr = parseFloat(comparison[i].monthly_price || 0);
        best = parseFloat(comparison[bestIdx].monthly_price || 0);
      } else if (key === 'quota_data_gb') {
        curr = parseFloat(comparison[i].offer?.quota_data_gb || 0);
        best = parseFloat(comparison[bestIdx].offer?.quota_data_gb || 0);
      } else {
        continue;
      }
      if (higher ? curr < best : curr > best) bestIdx = i;
    }
    return bestIdx;
  };

  const bestMatchIndex = comparison ? getWinner('satisfaction_score', false) : -1;

  return (
    <div style={{ animation: "fadeUp 0.4s ease both" }}>
      {/* Header */}
      <div style={{ marginBottom: 22 }}>
        <h2 style={{ fontFamily: fonts.heading, fontSize: 20, fontWeight: 600, color: "var(--text)" }}>Offer Comparator</h2>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 3 }}>Compare multiple offers side-by-side for a specific customer profile</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 20, alignItems: "start" }}>
        {/* Left Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Profile Selector */}
          <div style={{ ...cardStyleStyle, padding: "18px 20px" }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text)", marginBottom: 12 }}>Customer Profile</p>
            <select 
              value={selectedProfile} 
              onChange={e => setSelectedProfile(e.target.value)}
              style={{ ...selectStyle, height: 40 }}
            >
              <option value="" style={{ background: "var(--bg-cardStyle)", color: "var(--text)" }}>— Select a profile —</option>
              {profiles.map((p, index) => (
                <option key={index} value={p.profile_id ?? p.id} style={{ background: "var(--bg-cardStyle)", color: "var(--text)" }}>{p.label || p.name}</option>
              ))}
            </select>
          </div>

          {/* Offer Selector */}
          <div style={{ ...cardStyleStyle, padding: "18px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>Select Offers</p>
              <span style={{ fontSize: 12, color: "var(--text-dim)" }}>{selectedOffers.length} selected</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 300, overflowY: "auto" }}>
              {offers.map((o, index) => (
                <label 
                  key={index}
                  style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: 10, 
                    padding: "10px 12px", 
                    borderRadius: 8,
                    background: isOfferSelected(index) ? "var(--blue-dim)" : "rgba(255,255,255,0.02)",
                    border: `0.5px solid ${isOfferSelected(index) ? "var(--blue)" : "var(--border)"}`,
                    cursor: "pointer",
                    transition: "all 0.15s"
                  }}
                >
                  <input 
                    type="checkbox" 
                    checked={isOfferSelected(index)} 
                    onChange={() => toggleOffer(index)}
                    style={{ accentColor: "var(--blue)", flexShrink: 0 }} 
                  />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, color: "var(--text)", fontWeight: 500 }}>{o.name}</p>
                    <p style={{ fontSize: 11, color: "var(--text-dim)" }}>{Number(o.monthly_price).toFixed(2)} TND · {o.segment}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

           {/* Action Button */}
<button
              onClick={runComparison}
              disabled={comparing || selectedOffers.length < 2 || !selectedProfile}
              style={{
                ...btnPrimaryStyleStyle,
                height: 46,
                fontSize: 14,
                justifyContent: "center",
                opacity: (comparing || selectedOffers.length < 2 || !selectedProfile) ? 0.5 : 1
              }}
            >
             {comparing ? (
               <><span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} /> Comparing...</>
             ) : (
               <>Compare {selectedOffers.length} Offers</>
             )}
           </button>

           {/* Clear Selection Button */}
           <button
             onClick={() => {
               setSelectedOffers([]);
               setComparison(null);
             }}
             disabled={selectedOffers.length === 0}
             style={{
               ...btnDangerStyle,
               height: 46,
               fontSize: 14,
               justifyContent: "center",
               opacity: selectedOffers.length === 0 ? 0.4 : 1,
               marginTop: 10
             }}
           >
             Clear Selection
           </button>
        </div>

        {/* Right Panel - Results */}
        <div>
          {!comparison && !comparing && (
            <div style={{ ...cardStyleStyle, padding: 48, textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>⚖️</div>
              <p style={{ fontSize: 15, fontWeight: 500, color: "var(--text)", marginBottom: 8 }}>Ready to compare</p>
              <p style={{ fontSize: 13, color: "var(--text-dim)" }}>Select at least 2 offers and a customer profile, then click Compare.</p>
            </div>
          )}

          {comparing && (
            <div style={{ ...cardStyleStyle, padding: 48, textAlign: "center" }}>
              <div style={{ width: 40, height: 40, border: `3px solid ${"var(--blue-dim)"}`, borderTop: `3px solid ${"var(--blue)"}`, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
              <p style={{ fontSize: 14, color: "var(--text-muted)" }}>Running comparison...</p>
            </div>
          )}

          {comparison && comparison.length > 0 && (
            <div style={{ ...cardStyleStyle, overflow: "hidden" }}>
              {/* Header Row */}
              <div style={{ display: "grid", gridTemplateColumns: `180px repeat(${comparison.length}, 1fr)`, background: "var(--blue-dim)", borderBottom: `0.5px solid ${"var(--border)"}` }}>
                <div style={{ padding: "14px 16px", fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Metric</div>
                {comparison.map((c, i) => (
                  <div key={i} style={{ padding: "14px 16px", textAlign: "center" }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{c.offer_name || c.offer?.name}</p>
                    <p style={{ fontSize: 11, color: "var(--text-dim)" }}>{c.offer?.segment}</p>
                  </div>
                ))}
              </div>

              {/* Data Rows */}
              <ComparisonRow 
                label="Monthly Price" 
                values={comparison.map(c => `${Number(c.monthly_price || c.calculation?.monthly_price || 0).toFixed(2)} TND`)} 
                highlight={getWinner("monthly_price", true)} 
              />
              <ComparisonRow 
                label="Total Cost" 
                values={comparison.map(c => `${Number(c.calculation?.total_cost || c.total_cost || 0).toFixed(2)} TND`)} 
                highlight={getWinner("total_cost", true)} 
              />
              <ComparisonRow 
                label="Satisfaction Score" 
                values={comparison.map(c => `${Math.round(c.calculation?.satisfaction_score || c.satisfaction_score || 0)}/100`)} 
                highlight={getWinner("satisfaction_score", false)} 
              />
              <ComparisonRow 
                label="Data Quota" 
                values={comparison.map(c => `${c.offer?.quota_data_gb || c.quota_data || 0} GB`)} 
                highlight={getWinner("quota_data_gb", false)} 
              />
              <ComparisonRow 
                label="Minutes Quota" 
                values={comparison.map(c => c.offer?.quota_minutes ? `${c.offer.quota_minutes} min` : "Unlimited")} 
              />
              <ComparisonRow 
                label="SMS Quota" 
                values={comparison.map(c => c.offer?.quota_sms ? `${c.offer.quota_sms} SMS` : "Unlimited")} 
              />
              <ComparisonRow 
                label="Voice Overage" 
                values={comparison.map(c => `${Number(c.overage_minutes_cost || 0).toFixed(2)} TND`)} 
              />
              <ComparisonRow 
                label="SMS Overage" 
                values={comparison.map(c => `${Number(c.overage_sms_cost || 0).toFixed(2)} TND`)} 
              />
              <ComparisonRow 
                label="Data Overage" 
                values={comparison.map(c => `${Number(c.overage_data_cost || 0).toFixed(2)} TND`)} 
              />
              <ComparisonRow 
                label="Roaming Cost" 
                values={comparison.map(c => `${Number(c.roaming_cost || 0).toFixed(2)} TND`)} 
              />

              {/* Justification Row */}
              <div style={{ display: "grid", gridTemplateColumns: `180px repeat(${comparison.length}, 1fr)`, borderBottom: `0.5px solid ${"var(--border)"}` }}>
                <div style={{ padding: "12px 16px", fontSize: 13, color: "var(--text-muted)", fontWeight: 500 }}>Recommendation</div>
                {comparison.map((c, i) => (
                  <div key={i} style={{ padding: "12px 16px", textAlign: "center" }}>
                    <p style={{ fontSize: 12, color: "var(--text-muted)", fontStyle: "italic" }}>
                       {c.justification || (i === bestMatchIndex ? "✓ Recommended" : "-")}
                    </p>
                  </div>
                ))}
              </div>

              {/* Winner Summary */}
{bestMatchIndex >= 0 && comparison[bestMatchIndex] && (
  <div style={{ padding: "16px 20px", background: "rgba(67,199,139,0.08)", borderTop: `0.5px solid ${"var(--border)"}` }}>
    <p style={{ fontSize: 13, fontWeight: 500, color: "var(--green)" }}>
      🏆 Best Match: {comparison[bestMatchIndex].offer_name || comparison[bestMatchIndex].offer?.name}
      <span style={{ color: "var(--text-muted)", fontWeight: 400, marginLeft: 8 }}>
        Score: {Math.round(comparison[bestMatchIndex].calculation?.satisfaction_score || comparison[bestMatchIndex].satisfaction_score || 0)}/100 · {Number(comparison[bestMatchIndex].calculation?.total_cost || comparison[bestMatchIndex].total_cost || 0).toFixed(2)} TND
      </span>
    </p>
  </div>
)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
