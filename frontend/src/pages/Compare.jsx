import { useState, useEffect } from "react";
import { colors, fonts, card, btnPrimary, btnGhost, input } from "../styles/theme";

const API = "http://localhost:5000/api";
const getHeaders = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` });

// ─── Comparison Row ───────────────────────────────────────────────────────────
function ComparisonRow({ label, values, highlight }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `180px repeat(${values.length}, 1fr)`, borderBottom: `0.5px solid ${colors.border}` }}>
      <div style={{ padding: "12px 16px", fontSize: 13, color: colors.textMuted, fontWeight: 500 }}>{label}</div>
      {values.map((v, i) => (
        <div key={i} style={{ padding: "12px 16px", textAlign: "center", fontSize: 13, color: highlight === i ? colors.green : colors.text }}>
          {v}
        </div>
      ))}
    </div>
  );
}

// ─── Winner Badge ──────────────────────────────────────────────────────────────
function WinnerBadge({ type, value }) {
  const badges = {
    price: { label: "Best Price", color: colors.blue },
    satisfaction: { label: "Best Score", color: colors.green },
    data: { label: "Most Data", color: colors.yellow },
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

  const toggleOffer = (id) => {
    setSelectedOffers(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const runComparison = async () => {
    if (selectedOffers.length < 2 || !selectedProfile) return;
    setComparing(true);
    try {
      const profile = profiles.find(p => String(p.id) === String(selectedProfile));
      const res = await fetch(`${API}/simulation/compare`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ offer_ids: selectedOffers, customer_profile: profile }),
      });
      if (res.ok) {
        const data = await res.json();
        setComparison(data.comparisons || data);
      }
    } catch {}
    setComparing(false);
  };

  // Find winners
  const getWinner = (key, higher = true) => {
    if (!comparison || comparison.length === 0) return -1;
    let bestIdx = 0;
    for (let i = 1; i < comparison.length; i++) {
      const curr = parseFloat(comparison[i][key]) || 0;
      const best = parseFloat(comparison[bestIdx][key]) || 0;
      if (higher ? curr < best : curr > best) bestIdx = i;
    }
    return bestIdx;
  };

  return (
    <div style={{ animation: "fadeUp 0.4s ease both" }}>
      {/* Header */}
      <div style={{ marginBottom: 22 }}>
        <h2 style={{ fontFamily: fonts.heading, fontSize: 20, fontWeight: 600, color: colors.text }}>Offer Comparator</h2>
        <p style={{ fontSize: 13, color: colors.textMuted, marginTop: 3 }}>Compare multiple offers side-by-side for a specific customer profile</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 20, alignItems: "start" }}>
        {/* Left Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Profile Selector */}
          <div style={{ ...card, padding: "18px 20px" }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: colors.text, marginBottom: 12 }}>Customer Profile</p>
            <select 
              value={selectedProfile} 
              onChange={e => setSelectedProfile(e.target.value)}
              style={{ ...input, height: 40, fontSize: 13 }}
            >
              <option value="">— Select a profile —</option>
              {profiles.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Offer Selector */}
          <div style={{ ...card, padding: "18px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <p style={{ fontSize: 13, fontWeight: 500, color: colors.text }}>Select Offers</p>
              <span style={{ fontSize: 12, color: colors.textDim }}>{selectedOffers.length} selected</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 300, overflowY: "auto" }}>
              {offers.map(o => (
                <label 
                  key={o.id} 
                  style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: 10, 
                    padding: "10px 12px", 
                    borderRadius: 8,
                    background: selectedOffers.includes(o.id) ? colors.blueDim : "rgba(255,255,255,0.02)",
                    border: `0.5px solid ${selectedOffers.includes(o.id) ? colors.blue : colors.border}`,
                    cursor: "pointer",
                    transition: "all 0.15s"
                  }}
                >
                  <input 
                    type="checkbox" 
                    checked={selectedOffers.includes(o.id)} 
                    onChange={() => toggleOffer(o.id)}
                    style={{ accentColor: colors.blue, flexShrink: 0 }} 
                  />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, color: colors.text, fontWeight: 500 }}>{o.name}</p>
                    <p style={{ fontSize: 11, color: colors.textDim }}>{Number(o.monthly_price).toFixed(2)} TND · {o.segment}</p>
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
              ...btnPrimary, 
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
        </div>

        {/* Right Panel - Results */}
        <div>
          {!comparison && !comparing && (
            <div style={{ ...card, padding: 48, textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>⚖️</div>
              <p style={{ fontSize: 15, fontWeight: 500, color: colors.text, marginBottom: 8 }}>Ready to compare</p>
              <p style={{ fontSize: 13, color: colors.textDim }}>Select at least 2 offers and a customer profile, then click Compare.</p>
            </div>
          )}

          {comparing && (
            <div style={{ ...card, padding: 48, textAlign: "center" }}>
              <div style={{ width: 40, height: 40, border: `3px solid ${colors.blueDim}`, borderTop: `3px solid ${colors.blue}`, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
              <p style={{ fontSize: 14, color: colors.textMuted }}>Running comparison...</p>
            </div>
          )}

          {comparison && comparison.length > 0 && (
            <div style={{ ...card, overflow: "hidden" }}>
              {/* Header Row */}
              <div style={{ display: "grid", gridTemplateColumns: `180px repeat(${comparison.length}, 1fr)`, background: colors.blueDim, borderBottom: `0.5px solid ${colors.border}` }}>
                <div style={{ padding: "14px 16px", fontSize: 12, fontWeight: 600, color: colors.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Metric</div>
                {comparison.map((c, i) => (
                  <div key={i} style={{ padding: "14px 16px", textAlign: "center" }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: colors.text }}>{c.offer_name || c.offer?.name}</p>
                    <p style={{ fontSize: 11, color: colors.textDim }}>{c.offer?.segment}</p>
                  </div>
                ))}
              </div>

              {/* Data Rows */}
              <ComparisonRow 
                label="Monthly Price" 
                values={comparison.map(c => `${Number(c.base_cost || c.monthly_price || 0).toFixed(2)} TND`)} 
                highlight={getWinner("base_cost", true)} 
              />
              <ComparisonRow 
                label="Total Cost" 
                values={comparison.map(c => `${Number(c.total_cost || 0).toFixed(2)} TND`)} 
                highlight={getWinner("total_cost", true)} 
              />
              <ComparisonRow 
                label="Satisfaction Score" 
                values={comparison.map(c => `${Math.round(c.satisfaction_score || 0)}/100`)} 
                highlight={getWinner("satisfaction_score", false)} 
              />
              <ComparisonRow 
                label="Data Quota" 
                values={comparison.map(c => `${c.offer?.quota_data_gb || c.quota_data || 0} GB`)} 
                highlight={getWinner("quota_data_gb", false)} 
              />
              <ComparisonRow 
                label="Minutes Quota" 
                values={comparison.map(c => c.offer?.quota_minutes || c.quota_minutes || "Unlimited")} 
              />
              <ComparisonRow 
                label="SMS Quota" 
                values={comparison.map(c => c.offer?.quota_sms || c.quota_sms || "Unlimited")} 
              />
              <ComparisonRow 
                label="Voice Overage" 
                values={comparison.map(c => `${Number(c.overage_minutes_cost || 0).toFixed(2)} TND`)} 
              />
              <ComparisonRow 
                label="Data Overage" 
                values={comparison.map(c => `${Number(c.overage_data_cost || 0).toFixed(2)} TND`)} 
              />

              {/* Justification Row */}
              <div style={{ display: "grid", gridTemplateColumns: `180px repeat(${comparison.length}, 1fr)`, borderBottom: `0.5px solid ${colors.border}` }}>
                <div style={{ padding: "12px 16px", fontSize: 13, color: colors.textMuted, fontWeight: 500 }}>Recommendation</div>
                {comparison.map((c, i) => (
                  <div key={i} style={{ padding: "12px 16px", textAlign: "center" }}>
                    <p style={{ fontSize: 12, color: colors.textMuted, fontStyle: "italic" }}>
                      {c.justification || (i === 0 ? "✓ Recommended" : "-")}
                    </p>
                  </div>
                ))}
              </div>

              {/* Winner Summary */}
              {comparison[0] && (
                <div style={{ padding: "16px 20px", background: "rgba(67,199,139,0.08)", borderTop: `0.5px solid ${colors.border}` }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: colors.green }}>
                    🏆 Best Match: {comparison[0].offer_name || comparison[0].offer?.name} 
                    <span style={{ color: colors.textMuted, fontWeight: 400, marginLeft: 8 }}>
                      Score: {Math.round(comparison[0].satisfaction_score || 0)}/100 · {Number(comparison[0].total_cost || 0).toFixed(2)} TND
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
