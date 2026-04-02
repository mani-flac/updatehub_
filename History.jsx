import React, { useState, useEffect } from 'react'

// --- SVG Icons ---
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
);

const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
);

const XCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
);

const StopCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><rect x="9" y="9" width="6" height="6"/></svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);

const HistoryEmptyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>
);

const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
);

export default function History() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const [historyData, statsData] = await Promise.all([
          window.electron?.agent?.history?.(),
          window.electron?.agent?.getStats?.()
        ])
        setHistory(historyData || [])
        setStats(statsData)
      } catch (err) {
        console.error('Failed to load history:', err)
        setHistory([])
      } finally {
        setLoading(false)
      }
    }

    loadHistory()
  }, [])

  const handleClearHistory = async () => {
    if (confirm('Are you sure you want to clear all update history?')) {
      try {
        await window.electron?.agent?.clearHistory?.()
        setHistory([])
        setStats(null)
      } catch (err) {
        console.error('Failed to clear history:', err)
      }
    }
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircleIcon />
      case 'failed': return <XCircleIcon />
      case 'cancelled': return <StopCircleIcon />
      default: return <ClockIcon />
    }
  }

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <div>
            <div className="page-title">Update History</div>
            <div className="page-subtitle">Loading history...</div>
          </div>
        </div>
        <div className="empty-state">
          <div className="spinner" style={{width:40,height:40}} />
          <div className="empty-state-text" style={{marginTop:'20px'}}>Loading update history...</div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Update History</div>
          <div className="page-subtitle">
            {history.length} update records
          </div>
        </div>
        <button 
          className="btn btn-secondary" 
          onClick={handleClearHistory}
          disabled={history.length === 0}
        >
          <TrashIcon /> Clear History
        </button>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="stat-grid" style={{marginBottom: '32px'}}>
          <div className="stat-card">
            <div className="stat-label">Total Updates</div>
            <div className="stat-value accent">{stats.totalUpdates}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Successful</div>
            <div className="stat-value green">{stats.successfulUpdates}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Failed</div>
            <div className="stat-value amber">{stats.failedUpdates}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Avg Duration</div>
            <div className="stat-value">{Math.round(stats.avgDuration / 1000)}s</div>
          </div>
        </div>
      )}

      {history.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><HistoryEmptyIcon /></div>
          <div className="empty-state-text">No update history available yet</div>
          <div className="empty-state-subtext">Update history will appear here after you update applications</div>
        </div>
      ) : (
        <div className="glass-panel" style={{padding: '0', overflow: 'hidden'}}>
          <div className="history-list" style={{gap: 0}}>
            {history.map((item, index) => (
              <div 
                className="history-item" 
                key={index} 
                style={{
                  borderBottom: index < history.length - 1 ? '1px solid var(--glass-border)' : 'none',
                  borderRadius: 0,
                  boxShadow: 'none',
                  background: 'transparent'
                }}
              >
                <div className={`history-icon ${item.status === 'failed' ? 'error' : ''}`}>
                  {getStatusIcon(item.status)}
                </div>
                <div className="history-content">
                  <div className="history-header">
                    <div className="history-app">{item.appName}</div>
                    <div className="history-time">{formatDate(item.timestamp)}</div>
                  </div>
                  <div className="history-details" style={{color: 'var(--text-muted)'}}>
                    <div className="version-change" style={{background: 'var(--glass-bg)', padding: '6px 10px', borderRadius: '6px'}}>
                      <span className="version-from">{item.fromVersion || 'Unknown'}</span>
                      <span className="version-arrow" style={{color: 'var(--text-muted)'}}><ArrowRightIcon /></span>
                      <span className="version-to">{item.toVersion || 'Unknown'}</span>
                    </div>
                    <div className="history-duration">
                      {item.duration ? `${(item.duration / 1000).toFixed(1)}s` : ''}
                    </div>
                  </div>
                  {item.errorMessage && (
                    <div className="history-error">
                      <div className="error-text">{item.errorMessage}</div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
