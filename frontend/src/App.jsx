import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { globalStyles } from "./styles/theme";
import { LanguageProvider } from "./context/LanguageContext";

import Login            from "./pages/Login";
import Layout           from "./components/Layout";
import Dashboard        from "./pages/Dashboard";
import Offers           from "./pages/Offers";
import Options          from "./pages/Options";
import CustomerProfiles from "./pages/Profiles";
import Simulation       from "./pages/Simulation";
import Compare          from "./pages/Compare";
import Scenarios        from "./pages/Scenarios";
import Users            from "./pages/Users";
import Audit            from "./pages/Audit";

const THEME_KEY = "simtelecom-theme";

export const isAdmin = () => {
  const userStr = localStorage.getItem("user");
  if (!userStr) return false;
  try {
    const user = JSON.parse(userStr);
    return user.role === "ADMIN";
  } catch {
    return false;
  }
};

export const isAnalyst = () => {
  const userStr = localStorage.getItem("user");
  if (!userStr) return false;
  try {
    const user = JSON.parse(userStr);
    return user.role === "ANALYST";
  } catch {
    return false;
  }
};

export const canEdit = () => isAdmin() || isAnalyst();

export const canManage = () => {
  const userStr = localStorage.getItem("user");
  if (!userStr) return false;
  try {
    const user = JSON.parse(userStr);
    return user.role === "ADMIN" || user.role === "ANALYST";
  } catch {
    return false;
  }
};

function Protected({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

function AdminOnly({ children }) {
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");
  const isAdmin = userStr && (() => {
    try { return JSON.parse(userStr).role === "ADMIN"; }
    catch { return false; }
  })();
  return token && isAdmin ? children : <Navigate to="/dashboard" replace />;
}

export default function App() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem(THEME_KEY) || "dark";
  });

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

return (
    <LanguageProvider>
      <BrowserRouter>
        <style dangerouslySetInnerHTML={{ __html: globalStyles(theme) }} />
        <Routes>
          {/* Public */}
          <Route path="/login"    element={<Login />} />
          <Route path="/"         element={<Navigate to="/dashboard" replace />} />

           {/* Protected — wrapped in shared Layout */}
  <Route path="/dashboard" element={<Protected><Layout theme={theme}><Dashboard /></Layout></Protected>} />
            <Route path="/offers"    element={<Protected><Layout theme={theme}><Offers /></Layout></Protected>} />
            <Route path="/options"   element={<Protected><Layout theme={theme}><Options /></Layout></Protected>} />
            <Route path="/profiles"  element={<Protected><Layout theme={theme}><CustomerProfiles /></Layout></Protected>} />
            <Route path="/simulation"element={<Protected><Layout theme={theme}><Simulation /></Layout></Protected>} />
            <Route path="/compare"    element={<Protected><Layout theme={theme}><Compare /></Layout></Protected>} />
            <Route path="/scenarios" element={<Protected><Layout theme={theme}><Scenarios /></Layout></Protected>} />
            <Route path="/users"      element={<AdminOnly><Layout theme={theme}><Users /></Layout></AdminOnly>} />
            <Route path="/audit"      element={<AdminOnly><Layout theme={theme}><Audit /></Layout></AdminOnly>} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  );
}
