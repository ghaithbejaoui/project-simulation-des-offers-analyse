import { useState, useEffect } from "react";
import { fonts } from "../styles/theme";

const API = "http://localhost:5000/api";
const getToken = () => localStorage.getItem("token");
const headers = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` });

const cardStyle = {
  background: "var(--bg-card)",
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

const btnGhostStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "0 20px",
  height: 40,
  background: "var(--bg-card)",
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
  background: "var(--bg-card)",
  border: "0.5px solid var(--border)",
  borderRadius: 10,
  color: "var(--text)",
  fontSize: 13,
  padding: "0 12px",
  outline: "none",
  transition: "border-color 0.2s ease",
};

const ROLES = ["ADMIN", "ANALYST", "GUEST"];

function UserModal({ user, onClose, onSave }) {
  const [form, setForm] = useState(user || { username: "", email: "", password: "", role: "GUEST" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!form.username || !form.email || (!user && !form.password)) {
      setError("Required fields missing");
      return;
    }
    setSaving(true);
    try {
      const method = user?.user_id ? "PUT" : "POST";
      const url = user?.user_id ? `${API}/users/${user.user_id}` : `${API}/users`;
      const res = await fetch(url, { method, headers: headers(), body: JSON.stringify(form) });
      if (!res.ok) throw new Error((await res.json()).message || "Save failed");
      onSave();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ ...cardStyle, width: "100%", maxWidth: 420, padding: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <h3 style={{ fontFamily: fonts.heading, fontSize: 17, fontWeight: 600, color: "var(--text)" }}>
            {user?.user_id ? "Edit User" : "New User"}
          </h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-dim)", fontSize: 20 }}>×</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 11, color: "var(--text-dim)", fontWeight: 500, textTransform: "uppercase" }}>Username</label>
            <input type="text" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} style={{ ...inputStyle, height: 38, fontSize: 13 }} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: "var(--text-dim)", fontWeight: 500, textTransform: "uppercase" }}>Email</label>
            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={{ ...inputStyle, height: 38, fontSize: 13 }} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: "var(--text-dim)", fontWeight: 500, textTransform: "uppercase" }}>Password {!user && "(required)"}</label>
            <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} style={{ ...inputStyle, height: 38, fontSize: 13 }} placeholder={user ? "Leave empty to keep current" : ""} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: "var(--text-dim)", fontWeight: 500, textTransform: "uppercase" }}>Role</label>
            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} style={{ ...inputStyle, height: 38, fontSize: 13 }}>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>

        {error && <div style={{ marginTop: 12, color: "var(--red)", fontSize: 13 }}>{error}</div>}

        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          <button onClick={onClose} style={{ ...btnGhostStyle, flex: 1 }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{ ...btnPrimaryStyle, flex: 1, opacity: saving ? 0.6 : 1 }}>
            {saving ? "Saving..." : "Save User"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/users`, { headers: headers() });
      const data = await res.json();
      setUsers(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this user?")) return;
    try {
      await fetch(`${API}/users/${id}`, { method: "DELETE", headers: headers() });
      showToast("User deleted successfully");
      fetchUsers();
    } catch (e) { showToast(e.message, "error"); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontFamily: fonts.heading, fontSize: 20, fontWeight: 600, color: "var(--text)" }}>User Management</h1>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 3 }}>Manage system users and roles</p>
        </div>
        <button onClick={() => { setSelected(null); setShowModal(true); }} style={{ ...btnPrimaryStyle, height: 40 }}>
          + New User
        </button>
      </div>

      <div style={{ ...cardStyle, overflow: "hidden", padding: 0 }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Loading...</div>
        ) : users.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>No users found</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(0,0,0,0.25)" }}>
                <th style={{ padding: "14px 12px", fontSize: 11, fontWeight: 500, color: "var(--text-dim)", textTransform: "uppercase" }}>Username</th>
                <th style={{ padding: "14px 12px", fontSize: 11, fontWeight: 500, color: "var(--text-dim)", textTransform: "uppercase" }}>Email</th>
                <th style={{ padding: "14px 12px", fontSize: 11, fontWeight: 500, color: "var(--text-dim)", textTransform: "uppercase" }}>Role</th>
                <th style={{ padding: "14px 12px", fontSize: 11, fontWeight: 500, color: "var(--text-dim)", textTransform: "uppercase" }}>Created</th>
                <th style={{ padding: "14px 12px", fontSize: 11, fontWeight: 500, color: "var(--text-dim)", textTransform: "uppercase" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.user_id} style={{ borderBottom: `0.5px solid var(--border)` }}>
                  <td style={{ padding: "12px", fontWeight: 500, color: "var(--text)" }}>{u.username}</td>
                  <td style={{ padding: "12px", color: "var(--text-muted)" }}>{u.email}</td>
                  <td style={{ padding: "12px" }}>
                    <span style={{ 
                      padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 500,
                      background: u.role === "ADMIN" ? "rgba(227,91,91,0.12)" : u.role === "ANALYST" ? "rgba(26,143,255,0.12)" : "rgba(67,199,139,0.12)",
                      color: u.role === "ADMIN" ? "var(--red)" : u.role === "ANALYST" ? "var(--blue)" : "var(--green)"
                    }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: "12px", color: "var(--text-muted)" }}>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: "12px", display: "flex", gap: 8 }}>
                    <button onClick={() => { setSelected(u); setShowModal(true); }} style={{ ...btnGhostStyle, height: 28, fontSize: 12, padding: "0 12px" }}>Edit</button>
                    <button onClick={() => handleDelete(u.user_id)} style={{ ...btnDangerStyle, height: 28, fontSize: 12, padding: "0 12px" }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <UserModal user={selected} onClose={() => { setShowModal(false); setSelected(null); }} onSave={() => { setShowModal(false); setSelected(null); showToast("User saved successfully"); fetchUsers(); }} />
      )}

      {toast && (
        <div style={{
          position: "fixed", bottom: 24, right: 24, padding: "14px 20px", borderRadius: 10,
          background: toast.type === "error" ? "rgba(227,91,91,0.95)" : "rgba(67,199,139,0.95)",
          border: `0.5px solid ${toast.type === "error" ? "rgba(227,91,91,0.5)" : "rgba(67,199,139,0.5)"}`,
          color: "#fff", fontSize: 14, fontWeight: 500, boxShadow: "0 4px 20px rgba(0,0,0,0.3)", zIndex: 10000
        }}>
          {toast.type === "error" ? "⚠ " : "✓ "} {toast.message}
        </div>
      )}
    </div>
  );
}