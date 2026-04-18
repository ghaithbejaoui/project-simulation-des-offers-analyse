import { useState, useEffect } from "react";
import { colors, fonts, card, btnPrimary, btnGhost, btnDanger, input } from "../styles/theme";

const API = "http://localhost:5000/api";
const getToken = () => localStorage.getItem("token");
const headers = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` });

const STATUSES = ["ALL", "DRAFT", "ACTIVE", "ARCHIVED"];

const EMPTY_FORM = {
  name: "",
  description: "",
  profile_id: "",
  offer_ids: ""
};

function StatusBadge({ status }) {
  const map = {
    ACTIVE: { bg: "rgba(67,199,139,0.12)", border: "rgba(67,199,139,0.3)", color: colors.green, label: "Active" },
    DRAFT: { bg: "rgba(240,180,41,0.12)", border: "rgba(240,180,41,0.3)", color: colors.yellow, label: "Draft" },
    ARCHIVED: { bg: "rgba(200,212,232,0.06)", border: "rgba(200,212,232,0.18)", color: colors.textDim, label: "Archived" },
  };
  const st = map[status] || { bg: "rgba(200,212,232,0.06)", border: "rgba(200,212,232,0.18)", color: colors.textDim, label: status };
  return (
    <span style={{ fontSize: 11, fontWeight: 500, padding: "3px 9px", borderRadius: 6, background: st.bg, border: `0.5px solid ${st.border}`, color: st.color, textTransform: "capitalize" }}>
      {st.label}
    </span>
  );
}

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

function ScenarioModal({ scenario, profiles, onClose, onSave }) {
  const [form, setForm] = useState(scenario ? {
    ...scenario,
    offer_ids: scenario.offer_ids?.join(", ") || ""
  } : EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name) { setError("Name is required."); return; }
    setSaving(true);
    try {
      const offerIdsArray = form.offer_ids 
        ? form.offer_ids.split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n))
        : [];
      
      const payload = {
        name: form.name,
        description: form.description,
        profile_id: form.profile_id ? parseInt(form.profile_id) : null,
        offer_ids: offerIdsArray,
        status: form.status || "DRAFT"
      };

      const scenarioId = scenario?.scenario_id;
      const method = scenarioId ? "PUT" : "POST";
      const url = scenarioId ? `${API}/scenarios/${scenarioId}` : `${API}/scenarios`;
      
      const res = await fetch(url, { method, headers: headers(), body: JSON.stringify(payload) });
      if (!res.ok) throw new Error((await res.json()).message || "Save failed");
      onSave();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, margin: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ ...card, width: "100%", maxWidth: 500, padding: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <h3 style={{ fontFamily: fonts.heading, fontSize: 17, fontWeight: 600, color: colors.text }}>
            {scenario?.scenario_id ? "Edit Scenario" : "New Scenario"}
          </h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: colors.textDim, fontSize: 20, lineHeight: 1 }}>×</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <FormField label="Name" value={form.name} onChange={v => set("name", v)} placeholder="My Scenario" />
          <FormField label="Description" value={form.description} onChange={v => set("description", v)} placeholder="Optional description" />
          
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={{ fontSize: 11, color: colors.textDim, fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" }}>Customer Profile</label>
            <select
              value={form.profile_id || ""}
              onChange={e => set("profile_id", e.target.value)}
              style={{ ...input, height: 38, fontSize: 13 }}
            >
              <option value="">Select a profile...</option>
              {profiles.map(p => (
                <option key={p.profile_id} value={p.profile_id}>{p.label}</option>
              ))}
            </select>
          </div>

          <FormField label="Offer IDs" value={form.offer_ids} onChange={v => set("offer_ids", v)} placeholder="1, 2, 3 (comma separated)" />

          {scenario && (
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <label style={{ fontSize: 11, color: colors.textDim, fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" }}>Status</label>
              <select
                value={form.status || "DRAFT"}
                onChange={e => set("status", e.target.value)}
                style={{ ...input, height: 38, fontSize: 13 }}
              >
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          )}
        </div>

        {error && <div style={{ marginTop: 12, color: colors.red, fontSize: 13 }}>{error}</div>}

        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          <button onClick={onClose} style={{ ...btnGhost, flex: 1 }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{ ...btnPrimary, flex: 1, opacity: saving ? 0.6 : 1 }}>
            {saving ? "Saving..." : "Save Scenario"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ResultsModal({ scenario, onClose, onSave }) {
  const [results, setResults] = useState(scenario?.results || []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/scenarios/${scenario.scenario_id}/results`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ results })
      });
      if (!res.ok) throw new Error((await res.json()).message || "Save failed");
      onSave();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, margin: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ ...card, width: "100%", maxWidth: 700, maxHeight: "80vh", overflowY: "auto", padding: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <h3 style={{ fontFamily: fonts.heading, fontSize: 17, fontWeight: 600, color: colors.text }}>
            Results: {scenario?.name}
          </h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: colors.textDim, fontSize: 20, lineHeight: 1 }}>×</button>
        </div>

        {results.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: colors.textDim }}>
            No results saved. Run a comparison from the Simulation page to generate results.
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `0.5px solid ${colors.border}` }}>
                <th style={{ ...th, textAlign: "left" }}>Offer</th>
                <th style={{ ...th, textAlign: "right" }}>Cost</th>
                <th style={{ ...th, textAlign: "right" }}>Score</th>
                <th style={{ ...th, textAlign: "center" }}>Rank</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i} style={{ borderBottom: `0.5px solid ${colors.border}` }}>
                  <td style={{ ...td }}>Offer #{r.offer_id}</td>
                  <td style={{ ...td, textAlign: "right", color: colors.text }}>{Number(r.total_cost || 0).toFixed(2)} TND</td>
                  <td style={{ ...td, textAlign: "right", color: Number(r.satisfaction_score || 0) >= 70 ? colors.green : Number(r.satisfaction_score || 0) >= 50 ? colors.yellow : colors.red }}>
                    {r.satisfaction_score}/100
                  </td>
                  <td style={{ ...td, textAlign: "center" }}>#{r.rank_by_score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {error && <div style={{ marginTop: 12, color: colors.red, fontSize: 13 }}>{error}</div>}

        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          <button onClick={onClose} style={{ ...btnGhost, flex: 1 }}>Close</button>
        </div>
      </div>
    </div>
  );
}

const th = { padding: "14px 12px", fontSize: 11, fontWeight: 500, color: colors.textDim, textTransform: "uppercase", letterSpacing: "0.04em", textAlign: "left", verticalAlign: "middle", borderBottom: `0.5px solid ${colors.border}` };
const td = { padding: "12px", fontSize: 13, color: colors.textMuted, verticalAlign: "middle" };

export default function Scenarios() {
  const [scenarios, setScenarios] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [showModal, setShowModal] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selected, setSelected] = useState(null);
  const [pagination, setPagination] = useState({ total: 0, limit: 50, offset: 0 });
  const [toast, setToast] = useState(null);
  const [runningId, setRunningId] = useState(null);

  // Show toast message (success or error)
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchScenarios = async () => {
    setLoading(true);
    try {
      const url = filter === "ALL" 
        ? `${API}/scenarios?limit=${pagination.limit}&offset=${pagination.offset}`
        : `${API}/scenarios?status=${filter}&limit=${pagination.limit}&offset=${pagination.offset}`;
      const res = await fetch(url, { headers: headers() });
      const data = await res.json();
      setScenarios(data.scenarios || []);
      setPagination(p => ({ ...p, total: data.pagination?.total || 0 }));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchProfiles = async () => {
    try {
      const res = await fetch(`${API}/customer-profiles?limit=300`, { headers: headers() });
      const data = await res.json();
      // Handle both array response and {profiles: [...]} object response
      const profiles = Array.isArray(data) ? data : (data.profiles || []);
      setProfiles(profiles);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchScenarios(); }, [filter, pagination.limit, pagination.offset]);
  useEffect(() => { fetchProfiles(); }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this scenario?")) return;
    try {
      await fetch(`${API}/scenarios/${id}`, { method: "DELETE", headers: headers() });
      showToast("Scenario deleted");
      fetchScenarios();
    } catch (e) { showToast(e.message, "error"); }
  };

  const handleDuplicate = async (id) => {
    try {
      await fetch(`${API}/scenarios/${id}/duplicate`, { 
        method: "POST", 
        headers: headers(),
        body: JSON.stringify({})
      });
      showToast("Scenario duplicated");
      fetchScenarios();
    } catch (e) { showToast(e.message, "error"); }
  };

  // Run simulation and update results for existing scenario
  const runAndUpdateResults = async (scenario) => {
    if (!scenario.profile_id && !scenario.offer_ids?.length) {
      showToast("This scenario needs a profile and offers to run a simulation.", "error");
      return;
    }
    const profileId = scenario.profile_id;
    const offerIds = scenario.offer_ids;
    
    if (!offerIds?.length) {
      showToast("This scenario doesn't have any offers selected.", "error");
      return;
    }
    
    setRunningId(scenario.scenario_id);
    
    try {
      // Run comparison
      const compareRes = await fetch(`${API}/simulation/compare`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ profile_id: profileId, offer_ids: offerIds })
      });
      
      if (!compareRes.ok) throw new Error("Simulation failed");
      const compareData = await compareRes.json();
      
      if (!compareData.comparisons?.length) {
        showToast("No comparison results returned.", "error");
        setRunningId(null);
        return;
      }
      
      // Prepare results
      const resultsToSave = compareData.comparisons.map((r, idx) => ({
        profile_id: profileId,
        offer_id: r.offer_id,
        base_cost: Number(r.base_cost) || 0,
        overage_cost: Number(r.overage_minutes_cost || 0) + Number(r.overage_sms_cost || 0) + Number(r.overage_data_cost || 0),
        roaming_cost: Number(r.roaming_cost) || 0,
        total_cost: Number(r.total_cost) || 0,
        satisfaction_score: Number(r.satisfaction_score) || 0,
        recommendation: r.satisfaction_score >= 70 ? "good_match" : r.satisfaction_score >= 50 ? "okay_match" : "not_recommended",
        rank_by_cost: r.rank_by_cost || null,
        rank_by_score: r.rank_by_score || (idx + 1),
      }));
      
      // Save results
      const saveRes = await fetch(`${API}/scenarios/${scenario.scenario_id}/results`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ results: resultsToSave })
      });
      
      if (!saveRes.ok) throw new Error("Failed to save results");
      
      setRunningId(null);
      showToast(`${resultsToSave.length} offers saved to "${scenario.name}"`);
      fetchScenarios();
    } catch (e) { 
      setRunningId(null);
      showToast(e.message, "error"); 
    }
  };

  const openScenario = async (scenario) => {
    try {
      const res = await fetch(`${API}/scenarios/${scenario.scenario_id}`, { headers: headers() });
      const data = await res.json();
      setSelected(data);
      setShowResults(true);
    } catch (e) { console.error(e); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <h1 style={{ fontFamily: fonts.heading, fontSize: 20, fontWeight: 600, color: colors.text }}>Scenarios</h1>
          <span style={{ fontSize: 13, color: colors.textDim }}>{pagination.total} total</span>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <select value={filter} onChange={e => setFilter(e.target.value)} style={{ ...input, height: 36, fontSize: 13 }}>
            {STATUSES.map(s => <option key={s} value={s}>{s === "ALL" ? "All Status" : s}</option>)}
          </select>
          <button onClick={() => { setSelected(null); setShowModal(true); }} style={{ ...btnPrimary, height: 36 }}>
            + New Scenario
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ ...card, overflow: "hidden", padding: 0 }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: colors.textMuted }}>Loading...</div>
        ) : scenarios.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: colors.textMuted }}>
            No scenarios yet. Create one to save your simulation comparisons.
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(0,0,0,0.25)" }}>
                <th style={{ ...th, width: "35%" }}>Name</th>
                <th style={{ ...th, width: "15%", textAlign: "center" }}>Status</th>
                <th style={{ ...th, width: "15%" }}>Updated</th>
                <th style={{ ...th, width: "35%", textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map(s => (
                <tr key={s.scenario_id} style={{ borderBottom: `0.5px solid ${colors.border}` }}>
                  <td style={{ ...td, fontWeight: 500, color: colors.text, verticalAlign: "middle" }}>
                    <div style={{ fontWeight: 500, color: colors.text }}>{s.name}</div>
                    {s.description && <div style={{ fontSize: 11, color: colors.textDim, fontWeight: 400, marginTop: 4 }}>{s.description}</div>}
                  </td>
                  <td style={{ ...td, textAlign: "center" }}><StatusBadge status={s.status} /></td>
                  <td style={{ ...td, color: colors.textMuted }}>{new Date(s.updated_at).toLocaleDateString()}</td>
                  <td style={{ ...td, textAlign: "center", display: "flex", gap: 8, justifyContent: "center" }}>
                    <button onClick={() => openScenario(s)} style={{ ...btnGhost, height: 28, fontSize: 12, padding: "0 12px" }}>View</button>
                    <button onClick={() => { setSelected(s); setShowModal(true); }} style={{ ...btnGhost, height: 28, fontSize: 12, padding: "0 12px" }}>Edit</button>
                    <button onClick={() => runAndUpdateResults(s)} disabled={runningId === s.scenario_id} style={{ ...btnPrimary, height: 28, fontSize: 12, padding: "0 12px", opacity: runningId === s.scenario_id ? 0.6 : 1 }}>
                      {runningId === s.scenario_id ? "Running..." : "Run & Save"}
                    </button>
                    <button onClick={() => handleDuplicate(s.scenario_id)} style={{ ...btnGhost, height: 28, fontSize: 12, padding: "0 12px" }}>Copy</button>
                    <button onClick={() => handleDelete(s.scenario_id)} style={{ ...btnDanger, height: 28, fontSize: 12, padding: "0 12px" }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modals */}
      {showModal && (
        <ScenarioModal 
          scenario={selected} 
          profiles={profiles}
          onClose={() => { setShowModal(false); setSelected(null); }}
          onSave={() => { setShowModal(false); setSelected(null); fetchScenarios(); }}
        />
      )}

      {showResults && selected && (
        <ResultsModal
          scenario={selected}
          onClose={() => { setShowResults(false); setSelected(null); }}
          onSave={() => { setShowResults(false); setSelected(null); fetchScenarios(); }}
        />
      )}

      {/* Toast notification */}
      {toast && (
        <div style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          padding: "14px 20px",
          borderRadius: 10,
          background: toast.type === "error" ? "rgba(227,91,91,0.95)" : "rgba(67,199,139,0.95)",
          border: `0.5px solid ${toast.type === "error" ? "rgba(227,91,91,0.5)" : "rgba(67,199,139,0.5)"}`,
          color: "#fff",
          fontSize: 14,
          fontWeight: 500,
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          zIndex: 10000,
          animation: "fadeUp 0.3s ease"
        }}>
          {toast.type === "error" ? "⚠ " : "✓ "} {toast.message}
        </div>
      )}
    </div>
  );
}