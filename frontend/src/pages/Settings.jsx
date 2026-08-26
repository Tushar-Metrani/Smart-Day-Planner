import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import { requestReminderPermission, resyncReminders } from "../utils/notifications.js";

export default function Settings() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || "");
  const [workDayStart, setWorkDayStart] = useState(user?.workDayStart || "07:00");
  const [workDayEnd, setWorkDayEnd] = useState(user?.workDayEnd || "22:00");
  const [profileMsg, setProfileMsg] = useState("");

  const [remindersEnabled, setRemindersEnabled] = useState(user?.remindersEnabled || false);
  const [reminderMsg, setReminderMsg] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");

  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const saveProfile = async (e) => {
    e.preventDefault();
    setProfileMsg("");
    try {
      const { data } = await api.put("/auth/me", { name, workDayStart, workDayEnd });
      updateUser({ name: data.name, workDayStart: data.workDayStart, workDayEnd: data.workDayEnd });
      setProfileMsg("Saved.");
    } catch (err) {
      setProfileMsg(err.response?.data?.message || "Failed to save");
    }
  };

  const toggleReminders = async () => {
    setReminderMsg("");
    const next = !remindersEnabled;

    if (next) {
      const granted = await requestReminderPermission();
      if (!granted) {
        setReminderMsg("Notification permission was denied — enable it in your device settings to use reminders.");
        return;
      }
    }

    setRemindersEnabled(next);
    await api.put("/auth/me", { remindersEnabled: next });
    updateUser({ remindersEnabled: next });
    await resyncReminders(next);
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
      <h2 className="mb-4 page-title">Settings</h2>

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
            <label className="field-label" style={{ display: "block", marginBottom: 6 }}>Working hours</label>
            <p className="text-xs text-muted" style={{ marginTop: 0, marginBottom: 8 }}>
              Used by the AI schedule assistant to know when to suggest free time.
            </p>
            <div className="form-row">
              <div className="field">
                <label className="field-label">Start</label>
                <input type="time" className="input" value={workDayStart} onChange={(e) => setWorkDayStart(e.target.value)} />
              </div>
              <div className="field">
                <label className="field-label">End</label>
                <input type="time" className="input" value={workDayEnd} onChange={(e) => setWorkDayEnd(e.target.value)} />
              </div>
            </div>
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
        <h3 className="section-title">Notifications</h3>
        <div className="card flex-between">
          <div>
            <div style={{ fontWeight: 600 }}>Reminders</div>
            <p className="text-xs text-muted" style={{ margin: "2px 0 0" }}>
              Notify me 10 minutes before each scheduled block starts.
            </p>
          </div>
          <button
            className={`btn btn-sm ${remindersEnabled ? "btn-primary" : ""}`}
            onClick={toggleReminders}
          >
            {remindersEnabled ? "On" : "Off"}
          </button>
        </div>
        {reminderMsg && <p className="error-text" style={{ marginTop: 8 }}>{reminderMsg}</p>}
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