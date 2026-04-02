import React, { useState, useEffect } from 'react'
import { useRemoteSearch, useInstaller, useUpdater } from './hooks/useApps.js'

// --- SVG Icons ---
const SearchIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
);

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
);

const GlobeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
);

const AppIcons = {
  'Default': () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
};

export default function InstallPanel() {
  const { results, searching, search } = useRemoteSearch()
  const { installApp, installing } = useInstaller()
  const { progress } = useUpdater()
  const [query, setQuery] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) search(query)
    }, 600)
    return () => clearTimeout(timer)
  }, [query])

  const handleInstall = async (app) => {
    try {
      await installApp(app.id, app.name)
    } catch (err) {
      console.error('Installation failed:', err)
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Install New Apps</div>
          <div className="page-subtitle">Browse cloud repositories (Winget / Homebrew)</div>
        </div>
      </div>

      <div className="glass-panel" style={{ marginBottom: '24px' }}>
        <div className="search-wrapper" style={{ width: '100%', maxWidth: 'none' }}>
          <SearchIcon className="search-icon" />
          <input
            className="search-input"
            placeholder="Type app name to discovery (e.g. VLC, Slack, Zoom)..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ width: '100%', paddingLeft: '48px', height: '48px', fontSize: '16px' }}
          />
        </div>
      </div>

      <div className="glass-panel">
        <h3 style={{ marginBottom: '20px', fontSize: '15px' }}>Search Results</h3>

        {searching ? (
          <div className="empty-state">
            <div className="spinner" style={{ width: 40, height: 40 }} />
            <div className="empty-state-text" style={{ marginTop: '20px' }}>Searching global repositories...</div>
          </div>
        ) : results.length > 0 ? (
          <div className="app-list">
            {results.map(app => {
              const IconComp = AppIcons['Default'];
              const isBusy = installing.has(app.id);
              const appProgress = progress[app.id];

              return (
                <div className="app-row" key={app.id} style={{ height: 'auto', padding: '16px' }}>
                  <div className="app-icon"><IconComp /></div>
                  <div className="app-info">
                    <div className="app-name">{app.name}</div>
                    <div className="app-source" style={{ fontWeight: 600, color: 'var(--primary)' }}>ID: {app.id}</div>
                  </div>
                  
                  <div style={{ flex: 1, padding: '0 20px' }}>
                    {isBusy && appProgress && (
                      <div className="update-progress" style={{ margin: 0 }}>
                        <div className="progress-bar" style={{ height: '4px' }}>
                          <div className="progress-fill" style={{ width: `${appProgress.percentage}%` }}></div>
                        </div>
                        <div className="progress-text" style={{ fontSize: '11px', marginTop: '4px' }}>
                          {appProgress.message}
                        </div>
                      </div>
                    )}
                  </div>

                  <button 
                    className={`btn ${appProgress?.status === 'success' ? 'btn-success' : 'btn-primary'}`}
                    onClick={() => handleInstall(app)}
                    disabled={isBusy || appProgress?.status === 'success'}
                    style={{ minWidth: '100px' }}
                  >
                    {isBusy ? <span className="spinner" style={{ width: 14, height: 14 }} /> : 
                     appProgress?.status === 'success' ? <><CheckIcon /> Installed</> : 
                     <><DownloadIcon /> Install</>}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon"><GlobeIcon /></div>
            <div className="empty-state-text">Ready to Discovery</div>
            <div className="empty-state-subtext">Type above to search millions of packages globally</div>
          </div>
        )}
      </div>
    </div>
  )
}
