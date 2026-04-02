import React, { useState } from 'react'

// --- SVG Icons ---
const SaveIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
);

const UpdateIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18"/><path d="m5 10 7-7 7 7"/></svg>
);

const BellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
);

const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
);

const DisplayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
);

export default function Settings({ theme, setTheme }) {
  const [settings, setSettings] = useState({
    autoScan: false,
    scanInterval: 'daily',
    notifications: true,
    autoUpdate: false,
    includePreRelease: false,
  })

  const [loading, setLoading] = useState(false)

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const saveSettings = async () => {
    setLoading(true)
    try {
      // TODO: Implement settings persistence
      console.log('Saving settings:', settings)
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (err) {
      console.error('Failed to save settings:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Settings</div>
          <div className="page-subtitle">Configure UpdateHub behavior</div>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={saveSettings}
          disabled={loading}
        >
          {loading ? <span className="spinner" /> : <SaveIcon />} Save Settings
        </button>
      </div>

      <div className="settings-grid">
        
        {/* Theme Settings */}
        <div className="settings-section">
          <h3 className="section-title"><DisplayIcon /> Appearance</h3>
          
          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-label">Light Mode</div>
              <div className="setting-description">Use a bright interface theme</div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={theme === 'light'}
                onChange={(e) => {
                  setTheme(e.target.checked ? 'light' : 'dark')
                }}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h3 className="section-title"><SearchIcon /> Scanning</h3>
          
          <div className="setting-item" style={{display: 'flex'}}>
            <div className="setting-info">
              <div className="setting-label">Automatic Scanning</div>
              <div className="setting-description">Periodically scan for new applications</div>
            </div>
            <label className="toggle-switch" style={{marginTop:'4px'}}>
              <input
                type="checkbox"
                checked={settings.autoScan}
                onChange={(e) => handleSettingChange('autoScan', e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item" style={{display: 'flex'}}>
            <div className="setting-info">
              <div className="setting-label">Scan Interval</div>
              <div className="setting-description">How often to check for new apps</div>
            </div>
            <select
              className="select-input"
              value={settings.scanInterval}
              onChange={(e) => handleSettingChange('scanInterval', e.target.value)}
              disabled={!settings.autoScan}
              style={{marginTop:'4px'}}
            >
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>

        <div className="settings-section">
          <h3 className="section-title"><UpdateIcon /> Updates</h3>
          
          <div className="setting-item" style={{display: 'flex'}}>
            <div className="setting-info">
              <div className="setting-label">Auto Update</div>
              <div className="setting-description">Automatically update applications</div>
            </div>
            <label className="toggle-switch" style={{marginTop:'4px'}}>
              <input
                type="checkbox"
                checked={settings.autoUpdate}
                onChange={(e) => handleSettingChange('autoUpdate', e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item" style={{display: 'flex'}}>
            <div className="setting-info">
              <div className="setting-label">Include Pre-release</div>
              <div className="setting-description">Show beta and preview versions</div>
            </div>
            <label className="toggle-switch" style={{marginTop:'4px'}}>
              <input
                type="checkbox"
                checked={settings.includePreRelease}
                onChange={(e) => handleSettingChange('includePreRelease', e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h3 className="section-title"><BellIcon /> Notifications</h3>
          
          <div className="setting-item" style={{display: 'flex'}}>
            <div className="setting-info">
              <div className="setting-label">Desktop Notifications</div>
              <div className="setting-description">Show notifications for updates</div>
            </div>
            <label className="toggle-switch" style={{marginTop:'4px'}}>
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={(e) => handleSettingChange('notifications', e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div className="settings-section">
          <h3 className="section-title"><InfoIcon /> About</h3>
          
          <div className="about-info" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
            <div className="about-item" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span className="about-label" style={{ color: 'var(--text-secondary)' }}>Version:</span>
              <span className="about-value" style={{ fontWeight: 500, color: 'var(--text-primary)' }}>1.0.0</span>
            </div>
            <div className="about-item" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span className="about-label" style={{ color: 'var(--text-secondary)' }}>Platform:</span>
              <span className="about-value" style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                {navigator.platform.includes('Win') ? 'Windows' : 'macOS'}
              </span>
            </div>
            <div className="about-item" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span className="about-label" style={{ color: 'var(--text-secondary)' }}>Package Manager:</span>
              <span className="about-value" style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                {navigator.platform.includes('Win') ? 'Winget' : 'Homebrew'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
