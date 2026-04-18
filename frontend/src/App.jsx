import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { globalStyles } from "./styles/theme";

import Login            from "./pages/Login";
import Layout           from "./components/Layout";
import Dashboard        from "./pages/Dashboard";
import Offers           from "./pages/Offers";
import Options          from "./pages/Options";
import CustomerProfiles from "./pages/Profiles";
import Simulation       from "./pages/Simulation";
import Compare          from "./pages/Compare";
import Scenarios        from "./pages/Scenarios";
import Audit            from "./pages/Audit";

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

 // ─── Route guard ──────────────────────────────────────────────────────────────
 function Protected({ children }) {
   const token = localStorage.getItem("token");
   return token ? children : <Navigate to="/login" replace />;
 }

 // ─── Admin-only route guard ───────────────────────────────────────────────────
 function AdminOnly({ children }) {
   const token = localStorage.getItem("token");
   const userStr = localStorage.getItem("user");
   const isAdmin = userStr && (() => {
     try { return JSON.parse(userStr).role === "ADMIN"; }
     catch { return false; }
   })();
   return token && isAdmin ? children : <Navigate to="/dashboard" replace />;
 }

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <style>{globalStyles}</style>
      <Routes>
        {/* Public */}
        <Route path="/login"    element={<Login />} />
        <Route path="/"         element={<Navigate to="/dashboard" replace />} />

         {/* Protected — wrapped in shared Layout */}
         <Route path="/dashboard" element={<Protected><Layout><Dashboard /></Layout></Protected>} />
         <Route path="/offers"    element={<Protected><Layout><Offers /></Layout></Protected>} />
         <Route path="/options"   element={<Protected><Layout><Options /></Layout></Protected>} />
         <Route path="/profiles"  element={<Protected><Layout><CustomerProfiles /></Layout></Protected>} />
         <Route path="/simulation"element={<Protected><Layout><Simulation /></Layout></Protected>} />
<Route path="/compare"    element={<Protected><Layout><Compare /></Layout></Protected>} />
          <Route path="/scenarios" element={<Protected><Layout><Scenarios /></Layout></Protected>} />
          <Route path="/audit"      element={<AdminOnly><Layout><Audit /></Layout></AdminOnly>} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
