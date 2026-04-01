import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { globalStyles } from "./styles/theme";

import Login            from "./pages/Login";
import Layout           from "./components/Layout";
import Dashboard        from "./pages/Dashboard";
import Offers           from "./pages/Offers";
import Options          from "./pages/Options";
import CustomerProfiles from "./pages/CustomerProfiles";
import Simulation       from "./pages/Simulation";

// ─── Route guard ──────────────────────────────────────────────────────────────
function Protected({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
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

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
