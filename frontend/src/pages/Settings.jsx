import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Settings() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || "");
  const [profileMsg, setProfileMsg] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");

  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const saveProfile = async (e) => {
    e.preventDefault();
    setProfileMsg("");
    try {
      const { data } = await api.put("/auth/me", { name });
      updateUser({ name: data.name });
      setProfileMsg("Saved.");
    } catch (err) {
      setProfileMsg(err.response?.data?.message || "Failed to save");
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg("");
    try {
      await api.put("/auth/password", { currentPassword, newPassword });
      setPasswordMsg("Password updated.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setPasswordMsg(err.response?.data?.message || "Failed to update password");
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteError("");
    if (deleteConfirm !== "DELETE") {
      setDeleteError('Type "DELETE" to confirm.');
      return;
    }
    try {
      await api.delete("/auth/me");
      logout();
      navigate("/login");
    } catch (err) {
      setDeleteError(err.response?.data?.message || "Failed to delete account");
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: "20px auto", padding: "0 16px" }}>
      <h2>Settings</h2>

      <section style={{ marginBottom: 32 }}>
        <h3>Profile</h3>
        <form onSubmit={saveProfile} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <label>
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} style={{ width: "100%" }} />
          </label>
          <label>
            Email
            <input value={user?.email || ""} disabled style={{ width: "100%", background: "#f5f5f5" }} />
          </label>
          <button type="submit" style={{ alignSelf: "flex-start" }}>Save profile</button>
          {profileMsg && <p style={{ fontSize: 13, color: profileMsg === "Saved." ? "#16a34a" : "#dc2626" }}>{profileMsg}</p>}
        </form>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h3>Change password</h3>
        <form onSubmit={savePassword} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <label>
            Current password
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} style={{ width: "100%" }} />
          </label>
          <label>
            New password
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={{ width: "100%" }} />
          </label>
          <button type="submit" style={{ alignSelf: "flex-start" }}>Update password</button>
          {passwordMsg && <p style={{ fontSize: 13, color: passwordMsg === "Password updated." ? "#16a34a" : "#dc2626" }}>{passwordMsg}</p>}
        </form>
      </section>

      <section style={{ border: "1px solid #fca5a5", borderRadius: 8, padding: 16 }}>
        <h3 style={{ color: "#dc2626", marginTop: 0 }}>Danger zone</h3>
        <p style={{ fontSize: 13, color: "#666" }}>
          This permanently deletes your account and all schedule blocks and goals. This cannot be undone.
        </p>
        <input
          placeholder='Type "DELETE" to confirm'
          value={deleteConfirm}
          onChange={(e) => setDeleteConfirm(e.target.value)}
          style={{ width: "100%", marginBottom: 8 }}
        />
        {deleteError && <p style={{ fontSize: 13, color: "#dc2626" }}>{deleteError}</p>}
        <button onClick={handleDeleteAccount} style={{ background: "#dc2626", color: "white", border: "none", padding: "8px 14px", borderRadius: 6 }}>
          Delete my account
        </button>
      </section>
    </div>
  );
}