import React, { useState } from 'react';

const Settings = () => {
  const [settings, setSettings] = useState({
    theme: 'light',
    notifications: true,
    emailAlerts: true,
    autoSave: true,
    language: 'en'
  });
  const [message, setMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically save to backend
    localStorage.setItem('userSettings', JSON.stringify(settings));
    setMessage('Settings saved successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="container">
      <div className="card">
        <h2>Application Settings</h2>
        
        {message && <div className="success">{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Theme</label>
            <select
              name="theme"
              value={settings.theme}
              onChange={handleInputChange}
              className="form-control"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto</option>
            </select>
          </div>

          <div className="form-group">
            <label>Language</label>
            <select
              name="language"
              value={settings.language}
              onChange={handleInputChange}
              className="form-control"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                name="notifications"
                checked={settings.notifications}
                onChange={handleInputChange}
              />
              Enable Notifications
            </label>
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                name="emailAlerts"
                checked={settings.emailAlerts}
                onChange={handleInputChange}
              />
              Email Alerts
            </label>
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                name="autoSave"
                checked={settings.autoSave}
                onChange={handleInputChange}
              />
              Auto Save
            </label>
          </div>

          <button type="submit" className="btn btn-primary">
            Save Settings
          </button>
        </form>
      </div>
    </div>
  );
};

export default Settings;