import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { globalStyles, colors, fonts } from "../styles/theme";

const NAV_ITEMS = [
  {
    path: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    path: "/offers",
    label: "Offers",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    path: "/options",
    label: "Options",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07M8.46 8.46a5 5 0 0 0 0 7.07" />
      </svg>
    ),
  },
  {
    path: "/profiles",
    label: "Customer Profiles",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    path: "/compare",
    label: "Compare",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    path: "/simulation",
    label: "Simulation",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    accent: true,
  },
];

const ADMIN_ONLY = [
  {
    path: "/scenarios",
    label: "Scenarios",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    path: "/audit",
    label: "Audit Log",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
];

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const isAdmin = user?.role === "admin";
  const allItems = isAdmin ? [...NAV_ITEMS, ...ADMIN_ONLY] : NAV_ITEMS;

  return (
    <div style={s.root}>
      <style>{globalStyles}</style>

      {/* Background grid */}
      <div style={s.grid} />

      {/* Sidebar */}
      <aside style={{ ...s.sidebar, width: collapsed ? 64 : 220 }}>
        {/* Logo */}
        <div style={s.logoRow}>
          <div style={s.logoIcon}>
            <svg width="26" height="26" viewBox="0 0 48 48" fill="none">
              <polygon points="24,4 44,36 4,36" fill="none" stroke="#1a8fff" strokeWidth="2" opacity="0.7" />
              <circle cx="24" cy="24" r="5" fill="#1a8fff" />
            </svg>
          </div>
          {!collapsed && (
            <span style={s.logoText}>SimTelecom</span>
          )}
          <button onClick={() => setCollapsed(c => !c)} style={s.collapseBtn} title={collapsed ? "Expand" : "Collapse"}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {collapsed
                ? <polyline points="9 18 15 12 9 6" />
                : <polyline points="15 18 9 12 15 6" />}
            </svg>
          </button>
        </div>

        {/* Nav */}
        <nav style={s.nav}>
          {allItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  ...s.navItem,
                  ...(active ? s.navItemActive : {}),
                  ...(item.accent && !active ? s.navItemAccent : {}),
                  justifyContent: collapsed ? "center" : "flex-start",
                  padding: collapsed ? "10px 0" : "10px 14px",
                }}
                title={collapsed ? item.label : undefined}
              >
                <span style={{ ...s.navIcon, color: active ? colors.blue : item.accent ? colors.green : "inherit" }}>
                  {item.icon}
                </span>
                {!collapsed && <span style={s.navLabel}>{item.label}</span>}
                {!collapsed && item.accent && (
                  <span style={s.badge}>RUN</span>
                )}
                {active && <span style={s.activeDot} />}
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        <div style={{ ...s.userBox, padding: collapsed ? "12px 8px" : "12px 14px" }}>
          <div style={s.avatar}>
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          {!collapsed && (
            <div style={s.userInfo}>
              <p style={s.userName}>{user?.name || "User"}</p>
              <p style={s.userRole}>{user?.role || "analyst"}</p>
            </div>
          )}
          {!collapsed && (
            <button onClick={handleLogout} style={s.logoutBtn} title="Sign out">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main style={{ ...s.main, marginLeft: collapsed ? 64 : 220 }}>
        {/* Top bar */}
        <header style={s.topbar}>
          <div style={s.topbarLeft}>
            <h2 style={s.pageTitle}>
              {allItems.find(i => i.path === location.pathname)?.label || "SimTelecom"}
            </h2>
          </div>
          <div style={s.topbarRight}>
            <div style={s.statusBadge}>
              <span style={s.statusDot} />
              <span style={s.statusText}>API Connected</span>
            </div>
            <div style={s.userChip}>
              <div style={{ ...s.avatar, width: 30, height: 30, fontSize: 12 }}>
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <span style={{ fontSize: 13, color: colors.textMuted }}>{user?.name || "User"}</span>
            </div>
          </div>
        </header>

        {/* Page body */}
        <div style={s.content}>
          {children}
        </div>
      </main>
    </div>
  );
}

const s = {
  root: {
    display: "flex",
    minHeight: "100vh",
    background: colors.bg,
    fontFamily: fonts.body,
    position: "relative",
    overflow: "visible",
  },
  grid: {
    position: "fixed",
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(26,143,255,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(26,143,255,0.04) 1px, transparent 1px)
    `,
    backgroundSize: "40px 40px",
    animation: "gridScroll 12s linear infinite",
    pointerEvents: "none",
    zIndex: 0,
  },
  sidebar: {
    position: "fixed",
    top: 0,
    left: 0,
    height: "100vh",
    background: "rgba(8, 15, 30, 0.95)",
    borderRight: `0.5px solid ${colors.border}`,
    backdropFilter: "blur(20px)",
    display: "flex",
    flexDirection: "column",
    zIndex: 100,
    transition: "width 0.25s ease",
    overflow: "hidden",
  },
  logoRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "18px 14px 16px",
    borderBottom: `0.5px solid ${colors.border}`,
    minHeight: 64,
  },
  logoIcon: {
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
  },
  logoText: {
    fontFamily: fonts.heading,
    fontSize: 16,
    fontWeight: 600,
    color: colors.text,
    letterSpacing: "-0.3px",
    flex: 1,
    whiteSpace: "nowrap",
  },
  collapseBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: colors.textDim,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 4,
    borderRadius: 6,
    flexShrink: 0,
    transition: "color 0.2s",
  },
  nav: {
    flex: 1,
    padding: "12px 8px",
    display: "flex",
    flexDirection: "column",
    gap: 2,
    overflowY: "auto",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    borderRadius: 10,
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: 400,
    transition: "all 0.18s",
    textDecoration: "none",
    position: "relative",
    cursor: "pointer",
  },
  navItemActive: {
    background: colors.blueDim,
    color: colors.blue,
    fontWeight: 500,
  },
  navItemAccent: {
    color: colors.green,
  },
  navIcon: {
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    transition: "color 0.18s",
  },
  navLabel: {
    flex: 1,
    whiteSpace: "nowrap",
  },
  badge: {
    fontSize: 9,
    fontWeight: 600,
    letterSpacing: "0.08em",
    color: colors.green,
    background: "rgba(67,199,139,0.12)",
    border: "0.5px solid rgba(67,199,139,0.3)",
    borderRadius: 4,
    padding: "2px 5px",
  },
  activeDot: {
    position: "absolute",
    right: 8,
    width: 5,
    height: 5,
    borderRadius: "50%",
    background: colors.blue,
    boxShadow: `0 0 6px ${colors.blue}`,
  },
  userBox: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    borderTop: `0.5px solid ${colors.border}`,
    marginTop: "auto",
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    background: colors.blueDim,
    border: `0.5px solid ${colors.borderHov}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 600,
    color: colors.blue,
    flexShrink: 0,
  },
  userInfo: {
    flex: 1,
    minWidth: 0,
  },
  userName: {
    fontSize: 13,
    fontWeight: 500,
    color: colors.text,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  userRole: {
    fontSize: 11,
    color: colors.textDim,
    textTransform: "capitalize",
  },
  logoutBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: colors.textDim,
    display: "flex",
    padding: 4,
    borderRadius: 6,
    flexShrink: 0,
    transition: "color 0.2s",
  },
  main: {
    flex: 1,
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    transition: "margin-left 0.25s ease",
    position: "relative",
    zIndex: 1,
    overflow: "visible",
  },
  topbar: {
    position: "sticky",
    top: 0,
    height: 60,
    background: "rgba(7,13,24,0.92)",
    borderBottom: `0.5px solid ${colors.border}`,
    backdropFilter: "blur(16px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 28px",
    zIndex: 50,
  },
  topbarLeft: {},
  pageTitle: {
    fontFamily: fonts.heading,
    fontSize: 17,
    fontWeight: 600,
    color: colors.text,
    letterSpacing: "-0.3px",
  },
  topbarRight: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  statusBadge: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "5px 12px",
    background: "rgba(67,199,139,0.08)",
    border: "0.5px solid rgba(67,199,139,0.25)",
    borderRadius: 20,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: colors.green,
    boxShadow: `0 0 6px ${colors.green}`,
    animation: "pulse 2s ease-in-out infinite",
  },
  statusText: {
    fontSize: 12,
    color: colors.green,
    fontWeight: 500,
  },
  userChip: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  content: {
    flex: 1,
    padding: "28px",
    animation: "fadeUp 0.35s ease both",
    zIndex: 60,
    position: "relative",
    overflowY: "auto",
    overflowX: "hidden",
  },
};