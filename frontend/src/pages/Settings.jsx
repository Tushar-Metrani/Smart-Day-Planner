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
    <div className="page">
      <h2 className="mb-4">Settings</h2>

      <div className="section">
        <h3 className="section-title">Profile</h3>
        <form onSubmit={saveProfile} className="card" style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          <div className="field">
            <label className="field-label">Name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="field">
            <label className="field-label">Email</label>
            <input className="input" value={user?.email || ""} disabled />
          </div>
          <div>
            <button type="submit" className="btn btn-primary">Save profile</button>
          </div>
          {profileMsg && (
            <p className={profileMsg === "Saved." ? "success-text" : "error-text"}>{profileMsg}</p>
          )}
        </form>
      </div>

      <div className="section">
        <h3 className="section-title">Change password</h3>
        <form onSubmit={savePassword} className="card" style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          <div className="field">
            <label className="field-label">Current password</label>
            <input type="password" className="input" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          </div>
          <div className="field">
            <label className="field-label">New password</label>
            <input type="password" className="input" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </div>
          <div>
            <button type="submit" className="btn btn-primary">Update password</button>
          </div>
          {passwordMsg && (
            <p className={passwordMsg === "Password updated." ? "success-text" : "error-text"}>{passwordMsg}</p>
          )}
        </form>
      </div>

      <div className="section" style={{ marginBottom: 0 }}>
        <h3 className="section-title" style={{ color: "var(--color-danger)" }}>Danger zone</h3>
        <div className="card" style={{ borderColor: "var(--color-danger-soft)" }}>
          <p className="text-sm text-muted mb-3">
            This permanently deletes your account and all schedule blocks and goals. This cannot be undone.
          </p>
          <input
            placeholder='Type "DELETE" to confirm'
            className="input mb-2"
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
          />
          {deleteError && <p className="error-text mb-2">{deleteError}</p>}
          <button onClick={handleDeleteAccount} className="btn btn-danger-solid">
            Delete my account
          </button>
        </div>
      </div>
    </div>
  );
}