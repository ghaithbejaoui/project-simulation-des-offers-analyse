import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { fonts } from "../styles/theme";
import { useLanguage } from "../context/LanguageContext";

const NAV_ITEMS = [
  {
    path: "/dashboard",
    labelKey: "nav.dashboard",
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
    labelKey: "nav.offers",
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
    labelKey: "nav.options",
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
    labelKey: "nav.profiles",
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
    labelKey: "nav.compare",
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
    labelKey: "nav.simulation",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
    accent: true,
  },
  {
    path: "/scenarios",
    labelKey: "nav.scenarios",
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
];

const ADMIN_ONLY = [
  {
    path: "/users",
    labelKey: "nav.users",
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
    path: "/audit",
    labelKey: "nav.audit",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
];

export default function Layout({ children, theme = "dark" }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, language, toggleLanguage } = useLanguage();
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

  const getThemeToggle = () => {
    if (!mounted) return null;
    return (
      <button
        onClick={() => {
          const newTheme = theme === "dark" ? "light" : "dark";
          localStorage.setItem("simtelecom-theme", newTheme);
          document.documentElement.setAttribute("data-theme", newTheme);
          window.location.reload();
        }}
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          border: "0.5px solid var(--border)",
          background: "var(--bg-card)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "transform 0.2s ease, background 0.3s ease",
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.08)"}
        onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
        title={theme === "dark" ? t("theme.switchToLight") : t("theme.switchToDark")}
      >
        {theme === "dark" ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--yellow)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        )}
      </button>
    );
  };

  const getLanguageSwitcher = () => (
    <button
      onClick={toggleLanguage}
      style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        border: "0.5px solid var(--border)",
        background: "var(--bg-card)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "transform 0.2s ease, background 0.3s ease",
        fontSize: 14,
        fontWeight: 600,
        color: "var(--text-muted)",
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.08)"}
      onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
      title={t("language.select")}
    >
      {language.toUpperCase()}
    </button>
  );

const isAdmin = user?.role === "ADMIN";
  const allItems = isAdmin ? [...NAV_ITEMS, ...ADMIN_ONLY] : NAV_ITEMS;
  const s = getStyles(theme);

  return (
    <div style={s.root}>
      {/* Background grid */}
      <div style={s.grid} />

      {/* Sidebar */}
      <aside style={{ ...s.sidebar, width: collapsed ? 64 : 220 }}>
        {/* Logo */}
        <div style={s.logoRow}>
          <div style={s.logoIcon}>
            <svg width="26" height="26" viewBox="0 0 48 48" fill="none">
              <polygon points="24,4 44,36 4,36" fill="none" stroke="var(--blue)" strokeWidth="2" opacity="0.7" />
              <circle cx="24" cy="24" r="5" fill="var(--blue)" />
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
                title={collapsed ? t(item.labelKey) : undefined}
              >
                <span style={{ ...s.navIcon, color: active ? "var(--blue)" : item.accent ? "var(--green)" : "inherit" }}>
                  {item.icon}
                </span>
                {!collapsed && <span style={s.navLabel}>{t(item.labelKey)}</span>}
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
             {user?.role?.[0]?.toUpperCase() || "A"}
           </div>
           {!collapsed && (
             <div style={s.userInfo}>
               <p style={s.userName}>
                 {user?.role
                   ? user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase()
                   : "User"}
               </p>
               <p style={s.userRole}>
                 {user?.role
                   ? user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase()
                   : "Analyst"}
               </p>
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
              {t(allItems.find(i => i.path === location.pathname)?.labelKey || "app.name")}
            </h2>
          </div>
          <div style={s.topbarRight}>
            {getLanguageSwitcher()}
            {getThemeToggle()}
            <div style={s.statusBadge}>
              <span style={s.statusDot} />
              <span style={s.statusText}>{t("app.connected")}</span>
            </div>
            <div style={s.userChip}>
              <div style={{ ...s.avatar, width: 30, height: 30, fontSize: 12 }}>
                {user?.role?.[0]?.toUpperCase() || "A"}
              </div>
              <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase() : "Analyst"}
              </span>
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

const getStyles = (theme) => ({
  root: {
    display: "flex",
    minHeight: "100vh",
    background: theme === "light" ? "#f9fafb" : "var(--bg)",
    fontFamily: fonts.body,
    position: "relative",
    overflow: "visible",
    transition: "background 0.3s ease",
  },
  grid: {
    position: "fixed",
    inset: 0,
    backgroundImage: theme === "light" 
      ? "none" 
      : `linear-gradient(rgba(26,143,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(26,143,255,0.04) 1px, transparent 1px)`,
    backgroundSize: "40px 40px",
    animation: theme === "light" ? "none" : "gridScroll 12s linear infinite",
    pointerEvents: "none",
    zIndex: 0,
  },
  sidebar: {
    position: "fixed",
    top: 0,
    left: 0,
    height: "100vh",
    background: theme === "light" ? "#ffffff" : "var(--bg-card)",
    borderRight: theme === "light" ? "1px solid #e5e7eb" : "0.5px solid var(--border)",
    display: "flex",
    flexDirection: "column",
    zIndex: 100,
    transition: "width 0.25s ease, background 0.3s ease, border 0.3s ease",
    overflow: "hidden",
  },
  logoRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "18px 14px 16px",
    borderBottom: theme === "light" ? "1px solid #e5e7eb" : "0.5px solid var(--border)",
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
    color: "var(--text)",
    letterSpacing: "-0.3px",
    flex: 1,
    whiteSpace: "nowrap",
  },
  collapseBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "var(--text-dim)",
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
    color: "var(--text-muted)",
    fontSize: 13,
    fontWeight: 400,
    transition: "all 0.18s",
    textDecoration: "none",
    position: "relative",
    cursor: "pointer",
  },
  navItemActive: {
    background: theme === "light" ? "rgba(37, 99, 235, 0.1)" : "var(--blue-dim)",
    color: "var(--blue)",
    fontWeight: 500,
  },
  navItemAccent: {
    color: "var(--green)",
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
    color: "var(--green)",
    background: theme === "light" ? "rgba(22, 163, 74, 0.1)" : "rgba(67,199,139,0.12)",
    border: theme === "light" ? "1px solid rgba(22, 163, 74, 0.2)" : "0.5px solid rgba(67,199,139,0.3)",
    borderRadius: 4,
    padding: "2px 5px",
  },
  activeDot: {
    position: "absolute",
    right: 8,
    width: 5,
    height: 5,
    borderRadius: "50%",
    background: "var(--blue)",
    boxShadow: "0 0 6px var(--blue)",
  },
  userBox: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    borderTop: theme === "light" ? "1px solid #e5e7eb" : "0.5px solid var(--border)",
    marginTop: "auto",
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    background: theme === "light" ? "rgba(37, 99, 235, 0.1)" : "var(--blue-dim)",
    border: theme === "light" ? "1px solid #e5e7eb" : "0.5px solid var(--border-hov)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 600,
    color: "var(--blue)",
    flexShrink: 0,
  },
  userInfo: {
    flex: 1,
    minWidth: 0,
  },
  userName: {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--text)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  userRole: {
    fontSize: 11,
    color: "var(--text-dim)",
    textTransform: "capitalize",
  },
  logoutBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "var(--text-dim)",
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
    background: theme === "light" ? "#ffffff" : "var(--bg-card)",
    borderBottom: theme === "light" ? "1px solid #e5e7eb" : "0.5px solid var(--border)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 28px",
    zIndex: 50,
    transition: "background 0.3s ease, border 0.3s ease",
  },
  topbarLeft: {},
  pageTitle: {
    fontFamily: fonts.heading,
    fontSize: 17,
    fontWeight: 600,
    color: "var(--text)",
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
    background: theme === "light" ? "rgba(22, 163, 74, 0.1)" : "rgba(67,199,139,0.08)",
    border: theme === "light" ? "1px solid rgba(22, 163, 74, 0.2)" : "0.5px solid rgba(67,199,139,0.25)",
    borderRadius: 20,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "var(--green)",
    boxShadow: "0 0 6px var(--green)",
    animation: "pulse 2s ease-in-out infinite",
  },
  statusText: {
    fontSize: 12,
    color: "var(--green)",
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
});