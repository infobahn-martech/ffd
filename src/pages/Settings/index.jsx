import { useState } from "react";
import useAuthReducer from "../../store/AuthReducer";
import { notify } from "../../components/Toaster";
import "../../design/scss/dashboard.scss";
import "../../design/scss/pages/settings/settings-content.scss";

const DEFAULT_PREFERENCES = {
  email_notifications: true,
  in_app_alerts: true,
  weekly_summary: false,
};

const PREFERENCE_LABELS = {
  email_notifications: "Email notifications for new inquiries and approvals",
  in_app_alerts: "In-app alerts for job status changes",
  weekly_summary: "Weekly summary digest",
};

const Settings = () => {
  const profileData = useAuthReducer((state) => state.profileData);
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);

  const togglePreference = (key) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    notify("Preferences saved.", "success");
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2 className="dashboard-title">Settings</h2>
        <p className="dashboard-subtitle">Your profile and notification preferences.</p>
      </div>

      <div className="settings-section">
        <h3 className="settings-section-title">Profile</h3>
        <div className="settings-profile-grid">
          <div className="settings-field">
            <span className="settings-field-label">Name</span>
            <span className="settings-field-value">{profileData?.name || "—"}</span>
          </div>
          <div className="settings-field">
            <span className="settings-field-label">Email</span>
            <span className="settings-field-value">{profileData?.email || "—"}</span>
          </div>
          <div className="settings-field">
            <span className="settings-field-label">Role</span>
            <span className="settings-field-value">{profileData?.role?.role_name || "—"}</span>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h3 className="settings-section-title">Notification Preferences</h3>
        <div className="settings-toggle-list">
          {Object.entries(PREFERENCE_LABELS).map(([key, label]) => (
            <label key={key} className="settings-toggle-row">
              <input
                type="checkbox"
                checked={preferences[key]}
                onChange={() => togglePreference(key)}
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
        <button type="button" className="settings-save-btn" onClick={handleSave}>
          Save Preferences
        </button>
      </div>
    </div>
  );
};

export default Settings;
