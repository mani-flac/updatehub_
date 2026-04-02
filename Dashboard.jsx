import React, { useState } from 'react'
import { useApps } from './hooks/useApps.js'
import { useUpdates } from './hooks/useApps.js'

// --- SVG Icons ---
const SearchIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
);

const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
);

const AppIcons = {
  'Google Chrome': () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="21.17" x2="12" y1="8" y2="8"/><line x1="3.95" x2="8.54" y1="6.06" y2="14"/><line x1="10.88" x2="15.46" y1="21.94" y2="14"/></svg>,
  'Visual Studio Code': () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
  'Spotify': () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18c-4.51 2-5-4-5-4 6-4 6-2 6-2"/><path d="M14 22c-7-3-10-8-10-8 6-6 10-2 10-2"/><path d="M22 22c-10-5-18-12-18-12 14-8 18 1 18 1"/></svg>,
  'Discord': () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  'Figma': () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5z"/><path d="M12 2h3.5a3.5 3.5 0 1 1 0 7H12V2z"/><path d="M12 12.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 1 1-7 0z"/><path d="M5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 1 1-7 0z"/><path d="M5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5z"/></svg>,
  'Git': () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>,
  'Notion': () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>,
  'Slack': () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/></svg>,
  'Node.js': () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>,
  'Default': () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
};

const OSWindows = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="8" height="8"/><rect x="13" y="3" width="8" height="8"/><rect x="3" y="13" width="8" height="8"/><rect x="13" y="13" width="8" height="8"/></svg>;
const OSMac = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z"/><path d="M10 2c1 .5 2 2 2 5v.5c-1-.5-2-2-2-5V2Z"/></svg>;

const GhostIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 10h.01"/><path d="M15 10h.01"/><path d="M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z"/></svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
);

export default function Dashboard() {
  const { apps, loading: appsLoading, refetch, uninstallApp } = useApps()
  const { updates } = useUpdates()
  const [search, setSearch] = useState('')
  const [uninstalling, setUninstalling] = useState(new Set())

  const handleUninstall = async (app) => {
    if (window.confirm(`Are you sure you want to completely uninstall ${app.name}?`)) {
      setUninstalling(prev => new Set(prev).add(app.id))
      try {
        await uninstallApp(app.id, app.name)
      } finally {
        setUninstalling(prev => {
          const next = new Set(prev)
          next.delete(app.id)
          return next
        })
      }
    }
  }

  const filtered = apps.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">All Applications</div>
          <div className="page-subtitle">
            {appsLoading ? 'Scanning your system...' : `${apps.length} apps detected`}
          </div>
        </div>
        <button className="btn btn-secondary" onClick={refetch} disabled={appsLoading}>
          {appsLoading ? <span className="spinner" /> : <RefreshIcon />} Rescan
        </button>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Total apps</div>
          <div className="stat-value accent">{apps.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Updates available</div>
          <div className="stat-value amber">{updates.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Up to date</div>
          <div className="stat-value green">{apps.length - updates.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Platform</div>
          <div className="stat-value" style={{fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '4px'}}>
            {navigator.platform.includes('Win') ? <><OSWindows /> Windows</> : <><OSMac /> macOS</>}
          </div>
        </div>
      </div>

      <div className="glass-panel">
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'20px'}}>
          <span style={{fontWeight:600, fontSize:'15px', color:'var(--text-primary)'}}>Installed software</span>
          <div className="search-wrapper">
             <SearchIcon className="search-icon" />
            <input
              className="search-input"
              placeholder="Search apps..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {appsLoading ? (
          <div className="empty-state">
            <div className="spinner" style={{width:40,height:40}} />
            <div className="empty-state-text" style={{marginTop:'20px'}}>Scanning installed applications...</div>
          </div>
        ) : (
          <div className="app-list">
            {filtered.map(app => {
              const IconComp = AppIcons[app.name] || AppIcons['Default'];
              return (
                <div className="app-row" key={app.id}>
                  <div className="app-icon"><IconComp /></div>
                  <div className="app-info">
                    <div className="app-name">{app.name}</div>
                    <div className="app-source">{app.source}</div>
                  </div>
                  <div className="app-version">
                    {app.version}
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                    {updates.find(u => u.id === app.id) ? (
                      <span className="badge badge-update">Update available</span>
                    ) : (
                      <span className="badge badge-ok">Up to date</span>
                    )}
                    <button 
                      className="btn btn-secondary" 
                      style={{padding: '6px 10px', minWidth: '36px'}}
                      onClick={() => handleUninstall(app)}
                      disabled={uninstalling.has(app.id)}
                      title="Uninstall App"
                    >
                      {uninstalling.has(app.id) ? <span className="spinner" style={{width:14, height:14}} /> : <TrashIcon />}
                    </button>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="empty-state">
                <div className="empty-state-icon"><GhostIcon /></div>
                <div className="empty-state-text">No apps match "{search}"</div>
                <div className="empty-state-subtext">Try refining your search terms</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
