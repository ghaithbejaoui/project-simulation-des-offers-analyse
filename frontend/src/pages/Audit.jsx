import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fonts } from "../styles/theme";

const cardStyleStyle = {
  background: "var(--bg-cardStyle)",
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

const btnGhostStyleStyle = {
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

const inputStyleStyle = {
  background: "var(--bg-cardStyle)",
  border: "0.5px solid var(--border)",
  borderRadius: 10,
  color: "var(--text)",
  fontSize: 13,
  padding: "0 12px",
  outline: "none",
  transition: "border-color 0.2s ease",
};

const selectStyleStyle = {
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

// ─── Single activity row (used by dashboard too) ──────────────────────────────
function ActivityRow({ icon, text, time, user, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: `0.5px solid rgba(26,143,255,0.1)` }}>
      <div style={{ width: 36, height: 36, borderRadius: 9, background: `${color}15`, border: `0.5px solid ${color}35`, display: "flex", alignItems: "center", justifyContent: "center", color, flexShrink: 0, fontSize: 16 }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, color: "var(--text)", fontWeight: 500, lineHeight: 1.4 }}>{text}</p>
        <p style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 2 }}>{user} · {time}</p>
      </div>
    </div>
  );
}

export default function Audit() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    entity: "",
    action: "",
    user_id: "",
    startDate: "",
    endDate: ""
  });
  const [limit, setLimit] = useState(50);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchLogs();
  }, [filters, limit, offset]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      if (filters.entity) params.append("entity", filters.entity);
      if (filters.action) params.append("action", filters.action);
      if (filters.user_id) params.append("user_id", filters.user_id);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      params.append("limit", limit);
      params.append("offset", offset);

      const res = await fetch(`${API}/audit/logs?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
        setTotal(data.pagination?.total || 0);
      }
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action, entity) => {
    if (action === 'LOGIN') return '🔓';
    if (action === 'LOGIN_FAILED') return '🔒';
    if (action.includes('SIMULATE')) return '⚡';
    if (action === 'CREATE') return entity === 'offer' ? '📋' : '👤';
    if (action === 'UPDATE') return '✏️';
    if (action === 'DELETE') return '🗑️';
    if (action === 'LINK' || action === 'UNLINK') return '🔗';
    return '📋';
  };

  const getActionColor = (action) => {
    if (action === 'LOGIN') return '#43c78b';
    if (action === 'LOGIN_FAILED') return '#e35b5b';
    if (action.includes('SIMULATE')) return '#1a8fff';
    if (action === 'CREATE') return '#43c78b';
    if (action === 'UPDATE') return '#f0b429';
    if (action === 'DELETE') return '#e35b5b';
    return "var(--text-muted)";
  };

  const formatDetails = (details, action) => {
    if (!details) return null;
    try {
      const d = typeof details === 'string' ? JSON.parse(details) : details;
      if (action === 'SIMULATE_SINGLE') {
        return `Offer: #${d.offer_id}, Cost: ${d.total_cost} TND, Score: ${d.satisfaction_score}/100`;
      }
      if (action === 'SIMULATE_RECOMMEND') {
        return `Limit: ${d.limit}, Segment: ${d.segment || 'any'}`;
      }
      if (action === 'SIMULATE_COMPARE') {
        return `Offers: ${d.offer_ids?.join(', ')}`;
      }
      if (action === 'SIMULATE_BATCH') {
        return `Offer: #${d.offer_id}, Profiles: ${d.total_profiles}, Good matches: ${d.good_matches}`;
      }
      if (action === 'CREATE') {
        if (d.name) return `Name: ${d.name}${d.segment ? `, Segment: ${d.segment}` : ''}`;
        if (d.label) return `Label: ${d.label}`;
      }
      if (action === 'UPDATE') {
        return JSON.stringify(d);
      }
      return JSON.stringify(d);
    } catch {
      return details;
    }
  };

  return (
    <div style={{ animation: "fadeUp 0.4s ease both" }}>
      <div style={{ marginBottom: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ fontFamily: fonts.heading, fontSize: 20, fontWeight: 600, color: "var(--text)" }}>Audit Trail</h2>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 3 }}>Full system activity log — traceability & compliance</p>
          </div>
          <button onClick={() => navigate("/")} style={{ ...btnGhostStyleStyle, height: 38, fontSize: 13 }}>
            ← Back
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ ...cardStyleStyle, padding: "18px 20px", marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 12 }}>
          <div>
            <label style={{ fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.04em", display: "block", marginBottom: 6 }}>Entity</label>
            <select value={filters.entity} onChange={(e) => setFilters({ ...filters, entity: e.target.value })} style={{ ...selectStyleStyle, height: 36, fontSize: 13 }}>
              <option value="">All entities</option>
              <option value="offer">Offers</option>
              <option value="customer_profile">Profiles</option>
              <option value="option">Options</option>
              <option value="simulation">Simulations</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.04em", display: "block", marginBottom: 6 }}>Action</label>
            <select value={filters.action} onChange={(e) => setFilters({ ...filters, action: e.target.value })} style={{ ...selectStyleStyle, height: 36, fontSize: 13 }}>
              <option value="">All actions</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="SIMULATE_SINGLE">Simulate (Single)</option>
              <option value="SIMULATE_COMPARE">Compare</option>
              <option value="SIMULATE_RECOMMEND">Recommend</option>
              <option value="SIMULATE_BATCH">Batch</option>
              <option value="LOGIN">Login</option>
              <option value="LOGIN_FAILED">Login Failed</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.04em", display: "block", marginBottom: 6 }}>User ID</label>
            <input type="number" value={filters.user_id} onChange={(e) => setFilters({ ...filters, user_id: e.target.value })} placeholder="Filter by user..." style={{ ...inputStyleStyle, height: 36, fontSize: 13 }} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.04em", display: "block", marginBottom: 6 }}>From</label>
            <input type="date" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} style={{ ...inputStyleStyle, height: 36, fontSize: 13 }} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: "0.04em", display: "block", marginBottom: 6 }}>To</label>
            <input type="date" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} style={{ ...inputStyleStyle, height: 36, fontSize: 13 }} />
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "var(--text-dim)" }}>Show:</span>
            {[25, 50, 100].map(n => (
              <button
                key={n}
                onClick={() => setLimit(n)}
                style={{
                  ...btnGhostStyleStyle,
                  height: 28,
                  fontSize: 12,
                  padding: "0 10px",
                  background: limit === n ? "var(--blue-dim)" : "transparent",
                  color: limit === n ? "var(--blue)" : "var(--text-muted)",
                  border: limit === n ? `0.5px solid ${"var(--blue)"}` : `0.5px solid ${"var(--border)"}`
                }}
              >
                {n}
              </button>
            ))}
          </div>
          <span style={{ fontSize: 12, color: "var(--text-dim)" }}>{total} total entries</span>
        </div>
      </div>

      {/* Activity list */}
      <div style={{ ...cardStyleStyle, padding: "20px 22px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-dim)" }}>
            Loading audit logs...
          </div>
        ) : logs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-dim)" }}>
            No audit entries match your filters.
          </div>
        ) : (
          <>
            {logs.map((log) => (
              <div key={log.log_id} style={{ padding: "14px 0", borderBottom: `0.5px solid rgba(26,143,255,0.08)` }}>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ fontSize: 24, flexShrink: 0 }}>
                    {getActionIcon(log.action, log.entity)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                      <p style={{ fontSize: 14, color: "var(--text)", fontWeight: 500 }}>
                        {log.action?.replace(/_/g, ' ')}
                        {log.entity && <span style={{ color: "var(--text-dim)", fontWeight: 400 }}> — {log.entity?.replace('_', ' ')}</span>}
                      </p>
                      <span style={{ fontSize: 12, color: "var(--text-dim)", whiteSpace: "nowrap", flexShrink: 0 }}>
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                    {log.username && (
                      <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>
                        User: {log.username} {log.user_id && `(ID: ${log.user_id})`}
                      </p>
                    )}
                    {log.details && (() => {
                      const detailsText = formatDetails(log.details, log.action);
                      return detailsText ? <p style={{ fontSize: 13, color: "var(--text-dim)", fontFamily: fonts.body, lineHeight: 1.5 }}>{detailsText}</p> : null;
                    })()}
                    <p style={{ fontSize: 11, color: "var(--text-dim)", marginTop: 4, fontFamily: 'monospace' }}>
                      IP: {log.ip_address || 'N/A'} · ID: {log.log_id}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {total > limit && (
              <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 20, paddingTop: 16, borderTop: `0.5px solid ${"var(--border)"}` }}>
                <button disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - limit))} style={{ ...btnGhostStyleStyle, height: 32, fontSize: 12, opacity: offset === 0 ? 0.4 : 1 }}>
                  ← Previous
                </button>
                <span style={{ fontSize: 12, color: "var(--text-dim)", alignSelf: "center", padding: "0 12px" }}>
                  Showing {offset + 1}-{Math.min(offset + limit, total)} of {total}
                </span>
                <button disabled={offset + limit >= total} onClick={() => setOffset(offset + limit)} style={{ ...btnGhostStyleStyle, height: 32, fontSize: 12, opacity: offset + limit >= total ? 0.4 : 1 }}>
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
