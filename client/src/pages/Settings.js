import React, { useState } from 'react';
import {
  HiOutlineCog,
  HiOutlineBell,
  HiOutlineGlobe,
  HiOutlineLockClosed,
  HiOutlineShieldCheck,
  HiOutlineColorSwatch,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineCheck,
  HiOutlineDesktopComputer,
} from 'react-icons/hi';
import toast from 'react-hot-toast';
import './Settings.css';

const Settings = () => {
  const [settings, setSettings] = useState({
    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    taskReminders: true,
    projectUpdates: true,
    weeklyDigest: false,
    
    // Appearance
    compactMode: false,
    showAnimations: true,
    
    // Privacy
    profileVisibility: 'team',
    activityStatus: true,
    
    // Language & Region
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    timezone: 'America/Los_Angeles',
  });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    toast.success('Setting updated!');
  };

  const handleSelect = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    toast.success('Setting updated!');
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      toast.error('Passwords do not match!');
      return;
    }
    if (passwords.new.length < 8) {
      toast.error('Password must be at least 8 characters!');
      return;
    }
    toast.success('Password changed successfully!');
    setShowPasswordModal(false);
    setPasswords({ current: '', new: '', confirm: '' });
  };

  return (
    <div className="settings-page">
      {/* Header */}
      <div className="page-header">
        <h1><HiOutlineCog /> Settings</h1>
        <p>Manage your account settings and preferences</p>
      </div>

      {/* Settings Content */}
      <div className="settings-content">
        {/* Appearance */}
        <div className="settings-card">
          <div className="settings-card-header">
            <HiOutlineColorSwatch className="section-icon" />
            <div>
              <h3>Appearance</h3>
              <p>Customize how the app looks</p>
            </div>
          </div>
          <div className="settings-list">
            {/* Dark mode setting removed - using light theme only */}

            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-icon-wrapper">
                  <HiOutlineDesktopComputer />
                </div>
                <div>
                  <span className="setting-label">Compact Mode</span>
                  <span className="setting-description">Reduce spacing for more content</span>
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.compactMode}
                  onChange={() => handleToggle('compactMode')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-icon-wrapper">
                  <HiOutlineColorSwatch />
                </div>
                <div>
                  <span className="setting-label">Show Animations</span>
                  <span className="setting-description">Enable UI animations and transitions</span>
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.showAnimations}
                  onChange={() => handleToggle('showAnimations')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="settings-card">
          <div className="settings-card-header">
            <HiOutlineBell className="section-icon" />
            <div>
              <h3>Notifications</h3>
              <p>Manage your notification preferences</p>
            </div>
          </div>
          <div className="settings-list">
            <div className="setting-item">
              <div className="setting-info">
                <div>
                  <span className="setting-label">Email Notifications</span>
                  <span className="setting-description">Receive notifications via email</span>
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={() => handleToggle('emailNotifications')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div>
                  <span className="setting-label">Push Notifications</span>
                  <span className="setting-description">Receive push notifications in browser</span>
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.pushNotifications}
                  onChange={() => handleToggle('pushNotifications')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div>
                  <span className="setting-label">Task Reminders</span>
                  <span className="setting-description">Get reminded about upcoming tasks</span>
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.taskReminders}
                  onChange={() => handleToggle('taskReminders')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div>
                  <span className="setting-label">Project Updates</span>
                  <span className="setting-description">Notifications about project changes</span>
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.projectUpdates}
                  onChange={() => handleToggle('projectUpdates')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div>
                  <span className="setting-label">Weekly Digest</span>
                  <span className="setting-description">Receive weekly summary email</span>
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.weeklyDigest}
                  onChange={() => handleToggle('weeklyDigest')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Language & Region */}
        <div className="settings-card">
          <div className="settings-card-header">
            <HiOutlineGlobe className="section-icon" />
            <div>
              <h3>Language & Region</h3>
              <p>Set your language and regional preferences</p>
            </div>
          </div>
          <div className="settings-list">
            <div className="setting-item">
              <div className="setting-info">
                <div>
                  <span className="setting-label">Language</span>
                  <span className="setting-description">Select your preferred language</span>
                </div>
              </div>
              <select
                value={settings.language}
                onChange={(e) => handleSelect('language', e.target.value)}
                className="setting-select"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="ja">日本語</option>
              </select>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div>
                  <span className="setting-label">Date Format</span>
                  <span className="setting-description">Choose how dates are displayed</span>
                </div>
              </div>
              <select
                value={settings.dateFormat}
                onChange={(e) => handleSelect('dateFormat', e.target.value)}
                className="setting-select"
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div>
                  <span className="setting-label">Time Format</span>
                  <span className="setting-description">12-hour or 24-hour clock</span>
                </div>
              </div>
              <select
                value={settings.timeFormat}
                onChange={(e) => handleSelect('timeFormat', e.target.value)}
                className="setting-select"
              >
                <option value="12h">12-hour (AM/PM)</option>
                <option value="24h">24-hour</option>
              </select>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div>
                  <span className="setting-label">Timezone</span>
                  <span className="setting-description">Your local timezone</span>
                </div>
              </div>
              <select
                value={settings.timezone}
                onChange={(e) => handleSelect('timezone', e.target.value)}
                className="setting-select"
              >
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="Europe/London">London (GMT)</option>
                <option value="Europe/Paris">Paris (CET)</option>
                <option value="Asia/Tokyo">Tokyo (JST)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Privacy & Security */}
        <div className="settings-card">
          <div className="settings-card-header">
            <HiOutlineShieldCheck className="section-icon" />
            <div>
              <h3>Privacy & Security</h3>
              <p>Control your privacy and security settings</p>
            </div>
          </div>
          <div className="settings-list">
            <div className="setting-item">
              <div className="setting-info">
                <div>
                  <span className="setting-label">Profile Visibility</span>
                  <span className="setting-description">Who can see your profile</span>
                </div>
              </div>
              <select
                value={settings.profileVisibility}
                onChange={(e) => handleSelect('profileVisibility', e.target.value)}
                className="setting-select"
              >
                <option value="everyone">Everyone</option>
                <option value="team">Team Only</option>
                <option value="private">Private</option>
              </select>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div>
                  <span className="setting-label">Activity Status</span>
                  <span className="setting-description">Show when you're online</span>
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.activityStatus}
                  onChange={() => handleToggle('activityStatus')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>

            <div className="setting-item">
              <div className="setting-info">
                <div className="setting-icon-wrapper">
                  <HiOutlineLockClosed />
                </div>
                <div>
                  <span className="setting-label">Change Password</span>
                  <span className="setting-description">Update your account password</span>
                </div>
              </div>
              <button
                className="btn btn-secondary"
                onClick={() => setShowPasswordModal(true)}
              >
                Change
              </button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="settings-card danger-zone">
          <div className="settings-card-header">
            <HiOutlineShieldCheck className="section-icon danger" />
            <div>
              <h3>Danger Zone</h3>
              <p>Irreversible actions</p>
            </div>
          </div>
          <div className="settings-list">
            <div className="setting-item">
              <div className="setting-info">
                <div>
                  <span className="setting-label">Delete Account</span>
                  <span className="setting-description">Permanently delete your account and all data</span>
                </div>
              </div>
              <button
                className="btn btn-danger"
                onClick={() => toast.error('Account deletion is disabled in demo mode')}
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3><HiOutlineLockClosed /> Change Password</h3>
              <button className="modal-close" onClick={() => setShowPasswordModal(false)}>×</button>
            </div>
            <form onSubmit={handlePasswordChange}>
              <div className="form-group">
                <label>Current Password</label>
                <div className="password-input">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwords.current}
                    onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                  >
                    {showPasswords.current ? <HiOutlineEyeOff /> : <HiOutlineEye />}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>New Password</label>
                <div className="password-input">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwords.new}
                    onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                  >
                    {showPasswords.new ? <HiOutlineEyeOff /> : <HiOutlineEye />}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <div className="password-input">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwords.confirm}
                    onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                  >
                    {showPasswords.confirm ? <HiOutlineEyeOff /> : <HiOutlineEye />}
                  </button>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowPasswordModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <HiOutlineCheck /> Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
