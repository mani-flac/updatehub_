import React, { useState } from 'react'
import { useUpdates, useUpdater } from './hooks/useApps.js'

// --- SVG Icons ---
const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
);

const UpdateAllIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v18"/><path d="m5 10 7-7 7 7"/></svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
);

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);

const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
);

const AlertIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
);

const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
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

export default function UpdatePanel() {
  const { updates, loading, refetch, uninstallApp } = useUpdates()
  const { updateApp, updateAll, updating, progress } = useUpdater()
  const [updatingAll, setUpdatingAll] = useState(false)
  const [uninstalling, setUninstalling] = useState(new Set())

  const handleUninstall = async (appId, appName) => {
    if (window.confirm(`Are you sure you want to completely uninstall ${appName}?`)) {
      setUninstalling(prev => new Set(prev).add(appId))
      try {
        await uninstallApp(appId, appName)
      } finally {
        setUninstalling(prev => {
          const next = new Set(prev)
          next.delete(appId)
          return next
        })
      }
    }
  }

  const handleUpdateAll = async () => {
    setUpdatingAll(true)
    try {
      await updateAll()
      await refetch()
    } catch (err) {
      console.error('Failed to update all apps:', err)
    } finally {
      setUpdatingAll(false)
    }
  }

  const handleUpdateApp = async (appId) => {
    try {
      await updateApp(appId)
      await refetch()
    } catch (err) {
      console.error('Failed to update app:', err)
    }
  }

  const getUpdateStatus = (appId) => {
    const prog = progress[appId]
    if (prog?.status === 'updating') return 'updating'
    if (prog?.status === 'success') return 'success'
    if (prog?.status === 'failed') return 'failed'
    return updating.has(appId) ? 'updating' : 'pending'
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Available Updates</div>
          <div className="page-subtitle">
            {loading ? 'Checking for updates...' : `${updates.length} updates available`}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary" onClick={refetch} disabled={loading}>
            {loading ? <span className="spinner" /> : <RefreshIcon />} Refresh
          </button>
          {updates.length > 0 && (
            <button 
              className="btn btn-primary" 
              onClick={handleUpdateAll}
              disabled={updatingAll || loading}
            >
              {updatingAll ? <span className="spinner" /> : <UpdateAllIcon />} Update All
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="empty-state">
          <div className="spinner" style={{width:40,height:40}} />
          <div className="empty-state-text" style={{marginTop:'20px'}}>Checking for available updates...</div>
        </div>
      ) : updates.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon" style={{color: 'var(--success)', opacity: 1}}><CheckCircleIcon /></div>
          <div className="empty-state-text">All applications are up to date!</div>
          <div className="empty-state-subtext">Your system is fully protected and optimized.</div>
        </div>
      ) : (
        <div className="update-list">
          {updates.map(update => {
            const status = getUpdateStatus(update.id)
            const IconComp = AppIcons[update.name] || AppIcons['Default'];
            return (
              <div className="update-card" key={update.id}>
                <div className="update-header">
                  <div className="app-info" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div className="app-icon" style={{margin: 0}}><IconComp /></div>
                    <div>
                      <div className="app-name">{update.name}</div>
                      <div className="app-source" style={{color: 'var(--text-muted)'}}>{update.source}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className={`btn ${
                        status === 'updating' ? 'btn-secondary' : 
                        status === 'success' ? 'btn-success' : 
                        status === 'failed' ? 'btn-danger' : 'btn-primary'
                      }`}
                      onClick={() => handleUpdateApp(update.id)}
                      disabled={status === 'updating' || status === 'success' || uninstalling.has(update.id)}
                    >
                      {status === 'updating' && <span className="spinner" />}
                      {status === 'success' && <><CheckIcon /> Updated</>}
                      {status === 'failed' && <><XIcon /> Failed</>}
                      {status === 'pending' && 'Update'}
                    </button>
                    <button 
                      className="btn btn-secondary" 
                      style={{padding: '8px 12px'}}
                      onClick={() => handleUninstall(update.id, update.name)}
                      disabled={status === 'updating' || uninstalling.has(update.id)}
                      title="Uninstall App"
                    >
                      {uninstalling.has(update.id) ? <span className="spinner" style={{width:14, height:14}} /> : <TrashIcon />}
                    </button>
                  </div>
                </div>
                
                <div className="update-versions" style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--glass-bg)', padding: '12px', borderRadius: '8px' }}>
                  <div className="version-info">
                    <span className="version-label">Current:</span>
                    <span className="version-current">{update.currentVersion}</span>
                  </div>
                  <div className="version-arrow"><ArrowRightIcon /></div>
                  <div className="version-info">
                    <span className="version-label">Latest:</span>
                    <span className="version-latest">{update.newVersion}</span>
                  </div>
                </div>

                {status === 'updating' && (
                  <div className="update-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{width: `${progress[update.id]?.percentage || 0}%`}}
                      ></div>
                    </div>
                    <div className="progress-text">
                      <span>{progress[update.id]?.message || 'Updating...'}</span>
                      <span className="progress-percentage">{progress[update.id]?.percentage || 0}%</span>
                    </div>
                  </div>
                )}

                {status === 'failed' && progress[update.id]?.error && (
                  <div className="update-error" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)', marginTop: '12px' }}>
                    <div className="error-icon"><AlertIcon /></div>
                    <div className="error-text">{progress[update.id].error}</div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
