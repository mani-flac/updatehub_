import React, { useState, useEffect, Suspense, lazy } from 'react'
import './styles/globals.css'
import logoIcon from './assets/icon.png'

// --- Lazy Load Components for Performance (<300MB RAM) ---
const Dashboard = lazy(() => import('./Dashboard'));
const UpdatePanel = lazy(() => import('./UpdatePanel'));
const History = lazy(() => import('./History'));
const Settings = lazy(() => import('./Settings'));
const InstallPanel = lazy(() => import('./InstallPanel'));

// Loading Fallback
const PageLoader = () => (
  <div className="empty-state" style={{ height: '70vh' }}>
    <div className="spinner" style={{ width: 48, height: 48 }} />
    <div className="empty-state-text" style={{ marginTop: '24px' }}>Loading update portal...</div>
  </div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [theme, setTheme] = useState(localStorage.getItem('updatehub_theme') || 'dark')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('updatehub_theme', theme)
  }, [theme])

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />
      case 'updates':
        return <UpdatePanel />
      case 'history':
        return <History />
      case 'settings':
        return <Settings theme={theme} setTheme={setTheme} />
      case 'install':
        return <InstallPanel />
      default:
        return <Dashboard />
    }
  }

  // Icons used directly from SVG strings matching outline style
  const DashboardIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
  );

  const UpdatesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
  );

  const HistoryIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/></svg>
  );

  const SettingsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
  );

  const InstallIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
  );

  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  return (
    <div className="app">
      {/* Title Bar */}
      <div className="titlebar" style={{ flexDirection: isMac ? 'row-reverse' : 'row' }}>
        <div className="titlebar-drag"></div>
        <div className="titlebar-controls" style={{ flexDirection: isMac ? 'row-reverse' : 'row' }}>
          <button className="titlebar-btn minimize" onClick={() => window.electron?.window?.minimize()}>
            <span>−</span>
          </button>
          <button className="titlebar-btn maximize" onClick={() => window.electron?.window?.maximize()}>
            <span>□</span>
          </button>
          <button className="titlebar-btn close" onClick={() => window.electron?.window?.close()}>
            <span>×</span>
          </button>
        </div>
      </div>

      <div className="app-content">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="sidebar-header">
            <div className="logo">
              <img src={logoIcon} alt="Logo" className="logo-icon" />
              <div className="logo-info">
                <span className="logo-text">UpdateHub</span>
              </div>
            </div>
          </div>
          
          <nav className="sidebar-nav">
            <button className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
              <span className="nav-icon"><DashboardIcon /></span>
              <span className="nav-text">Dashboard</span>
            </button>
            <button className={`nav-item ${activeTab === 'install' ? 'active' : ''}`} onClick={() => setActiveTab('install')}>
              <span className="nav-icon"><InstallIcon /></span>
              <span className="nav-text">Install</span>
            </button>
            <button className={`nav-item ${activeTab === 'updates' ? 'active' : ''}`} onClick={() => setActiveTab('updates')}>
              <span className="nav-icon"><UpdatesIcon /></span>
              <span className="nav-text">Updates</span>
            </button>
            <button className={`nav-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
              <span className="nav-icon"><HistoryIcon /></span>
              <span className="nav-text">History</span>
            </button>
            <button className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
              <span className="nav-icon"><SettingsIcon /></span>
              <span className="nav-text">Settings</span>
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <main className="main-content">
          <Suspense fallback={<PageLoader />}>
            {renderContent()}
          </Suspense>
        </main>
      </div>
    </div>
  )
}
