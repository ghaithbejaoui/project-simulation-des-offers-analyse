import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { colors, fonts, card, btnPrimary, btnGhost } from "../styles/theme";

// ─── Metric Card ─────────────────────────────────────────────────────────────
function KPICard({ label, value, sub, color, icon, trend }) {
  return (
    <div style={{ ...card, padding: "20px 22px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: `${color}18`, border: `0.5px solid ${color}40`, display: "flex", alignItems: "center", justifyContent: "center", color }}>
          {icon}
        </div>
        {trend !== undefined && (
          <span style={{ fontSize: 12, fontWeight: 500, color: trend >= 0 ? colors.green : colors.red, background: trend >= 0 ? "rgba(67,199,139,0.1)" : "rgba(227,91,91,0.1)", padding: "3px 8px", borderRadius: 6 }}>
            {trend >= 0 ? "+" : ""}{trend}%
          </span>
        )}
      </div>
      <p style={{ fontSize: 11, color: colors.textDim, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 6 }}>{label}</p>
      <p style={{ fontSize: 26, fontWeight: 600, fontFamily: fonts.heading, color: colors.text, letterSpacing: "-0.5px" }}>{value}</p>
      {sub && <p style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}>{sub}</p>}
    </div>
  );
}

// ─── Mini bar chart (pure CSS) ────────────────────────────────────────────────
function MiniBarChart({ data, color }) {
  const max = Math.max(...data.map(d => d.value));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 48 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{ width: "100%", height: `${(d.value / max) * 44}px`, background: color, borderRadius: 3, opacity: 0.7 + (i / data.length) * 0.3, transition: "height 0.6s ease" }} />
        </div>
      ))}
    </div>
  );
}

// ─── Recent activity item ─────────────────────────────────────────────────────
function ActivityItem({ icon, text, time, color }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `0.5px solid rgba(26,143,255,0.08)` }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}15`, border: `0.5px solid ${color}35`, display: "flex", alignItems: "center", justifyContent: "center", color, flexShrink: 0, fontSize: 14 }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 13, color: colors.text }}>{text}</p>
      </div>
      <span style={{ fontSize: 11, color: colors.textDim, whiteSpace: "nowrap" }}>{time}</span>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ offers: 0, profiles: 0, simulations: 0, options: 0 });
  const [loading, setLoading] = useState(true);
  const [costData] = useState([
    { label: "Jan", value: 42 }, { label: "Feb", value: 58 }, { label: "Mar", value: 51 },
    { label: "Apr", value: 74 }, { label: "May", value: 63 }, { label: "Jun", value: 89 },
    { label: "Jul", value: 78 },
  ]);
  const [satisfactionData] = useState([
    { label: "Mon", value: 72 }, { label: "Tue", value: 85 }, { label: "Wed", value: 68 },
    { label: "Thu", value: 91 }, { label: "Fri", value: 79 }, { label: "Sat", value: 55 }, { label: "Sun", value: 60 },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const [offersRes, profilesRes, optionsRes] = await Promise.allSettled([
          fetch("http://localhost:5000/api/offers", { headers }),
          fetch("http://localhost:5000/api/customer-profiles", { headers }),
          fetch("http://localhost:5000/api/options", { headers }),
        ]);
        const offers   = offersRes.status   === "fulfilled" && offersRes.value.ok   ? (await offersRes.value.json()).length   : 12;
        const profiles = profilesRes.status === "fulfilled" && profilesRes.value.ok ? (await profilesRes.value.json()).length : 47;
        const options  = optionsRes.status  === "fulfilled" && optionsRes.value.ok  ? (await optionsRes.value.json()).length  : 8;
        setStats({ offers, profiles, options, simulations: 134 });
      } catch {
        setStats({ offers: 12, profiles: 47, options: 8, simulations: 134 });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div style={{ animation: "fadeUp 0.4s ease both" }}>
      {/* Welcome banner */}
      <div style={{ ...card, padding: "22px 28px", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", borderColor: "rgba(26,143,255,0.28)", background: "linear-gradient(135deg, rgba(13,95,212,0.15) 0%, rgba(13,22,40,0.9) 60%)" }}>
        <div>
          <h1 style={{ fontFamily: fonts.heading, fontSize: 22, fontWeight: 600, color: colors.text, marginBottom: 6 }}>
            Good morning 👋
          </h1>
          <p style={{ fontSize: 14, color: colors.textMuted }}>Here's your telecom simulation overview for today.</p>
        </div>
        <button onClick={() => navigate("/simulation")} style={{ ...btnPrimary, height: 44, fontSize: 14, padding: "0 24px" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          Run Simulation
        </button>
      </div>

      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        <KPICard
          label="Active Offers"
          value={loading ? "—" : stats.offers}
          sub="2 added this week"
          color={colors.blue}
          trend={+16}
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>}
        />
        <KPICard
          label="Customer Profiles"
          value={loading ? "—" : stats.profiles}
          sub="300 in database"
          color={colors.green}
          trend={+8}
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
        />
        <KPICard
          label="Simulations Run"
          value={loading ? "—" : stats.simulations}
          sub="This month"
          color={colors.yellow}
          trend={+23}
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>}
        />
        <KPICard
          label="Avg. Satisfaction"
          value="78.4"
          sub="Score / 100"
          color={colors.orange}
          trend={+4}
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>}
        />
      </div>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
        {/* Cost trend */}
        <div style={{ ...card, padding: "20px 22px", gridColumn: "span 2" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 500, color: colors.text }}>Simulated Cost Trend</p>
              <p style={{ fontSize: 12, color: colors.textDim }}>Average monthly cost across profiles (TND)</p>
            </div>
            <span style={{ fontSize: 22, fontWeight: 600, fontFamily: fonts.heading, color: colors.blue }}>89.3 TND</span>
          </div>
          <MiniBarChart data={costData} color={colors.blue} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            {costData.map(d => (
              <span key={d.label} style={{ fontSize: 10, color: colors.textDim, flex: 1, textAlign: "center" }}>{d.label}</span>
            ))}
          </div>
        </div>

        {/* Satisfaction */}
        <div style={{ ...card, padding: "20px 22px" }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: colors.text, marginBottom: 4 }}>Satisfaction Scores</p>
          <p style={{ fontSize: 12, color: colors.textDim, marginBottom: 16 }}>Daily average this week</p>
          <MiniBarChart data={satisfactionData} color={colors.green} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            {satisfactionData.map(d => (
              <span key={d.label} style={{ fontSize: 10, color: colors.textDim, flex: 1, textAlign: "center" }}>{d.label}</span>
            ))}
          </div>
          <div style={{ marginTop: 16, padding: "10px 14px", background: "rgba(67,199,139,0.08)", borderRadius: 8, border: "0.5px solid rgba(67,199,139,0.2)" }}>
            <p style={{ fontSize: 12, color: colors.green, fontWeight: 500 }}>↑ +4.2pts vs last week</p>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Offer breakdown */}
        <div style={{ ...card, padding: "20px 22px" }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: colors.text, marginBottom: 16 }}>Offers by Segment</p>
          {[
            { label: "Postpaid", pct: 42, color: colors.blue },
            { label: "Prepaid", pct: 33, color: colors.green },
            { label: "Business", pct: 18, color: colors.orange },
            { label: "Data-Only", pct: 7, color: colors.yellow },
          ].map(({ label, pct, color }) => (
            <div key={label} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontSize: 12, color: colors.textMuted }}>{label}</span>
                <span style={{ fontSize: 12, fontWeight: 500, color }}>{pct}%</span>
              </div>
              <div style={{ height: 5, borderRadius: 4, background: "rgba(255,255,255,0.05)" }}>
                <div style={{ height: "100%", width: `${pct}%`, borderRadius: 4, background: color, opacity: 0.8, transition: "width 0.8s ease" }} />
              </div>
            </div>
          ))}
        </div>

        {/* Recent activity */}
        <div style={{ ...card, padding: "20px 22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <p style={{ fontSize: 13, fontWeight: 500, color: colors.text }}>Recent Activity</p>
            <button style={{ ...btnGhost, height: 30, padding: "0 12px", fontSize: 12 }}>View all</button>
          </div>
          <ActivityItem icon="⚡" text="Simulation ran for Profile #42 — 3 offers compared" time="2m ago" color={colors.blue} />
          <ActivityItem icon="📋" text="New offer 'POSTPAID PRO 50GB' created" time="18m ago" color={colors.green} />
          <ActivityItem icon="👤" text="Customer profile updated — avg data: 18GB" time="1h ago" color={colors.yellow} />
          <ActivityItem icon="📦" text="Option 'Night Data 5GB' added to 4 offers" time="3h ago" color={colors.orange} />
          <ActivityItem icon="📊" text="Batch analysis completed — 300 profiles" time="5h ago" color={colors.textMuted} />
        </div>
      </div>
    </div>
  );
}
