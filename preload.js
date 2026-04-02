const { contextBridge, ipcRenderer } = require('electron')

// Expose a safe API to the renderer process
contextBridge.exposeInMainWorld('electron', {
  // Window controls
  window: {
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close: () => ipcRenderer.send('window:close'),
  },
  
  // Agent methods
  agent: {
    scan: () => ipcRenderer.invoke('agent:scan'),
    checkUpdates: () => ipcRenderer.invoke('agent:checkUpdates'),
    updateApp: (appId) => ipcRenderer.invoke('agent:updateApp', appId),
    uninstallApp: (appId, appName) => ipcRenderer.invoke('agent:uninstallApp', appId, appName),
    searchRemote: (query) => ipcRenderer.invoke('agent:searchRemote', query),
    installApp: (appId, appName) => ipcRenderer.invoke('agent:installApp', appId, appName),
    history: () => ipcRenderer.invoke('agent:history'),
    clearHistory: () => ipcRenderer.invoke('agent:history:clear'),
    getAppHistory: (appId) => ipcRenderer.invoke('agent:history:app', appId),
    getStats: () => ipcRenderer.invoke('agent:stats'),
  },
  
  // Update event listeners
  onUpdateProgress: (callback) => {
    ipcRenderer.on('update:progress', (event, data) => callback(data))
  },
  
  onUpdateComplete: (callback) => {
    ipcRenderer.on('update:complete', (event, data) => callback(data))
  },
  
  removeUpdateListeners: () => {
    ipcRenderer.removeAllListeners('update:progress')
    ipcRenderer.removeAllListeners('update:complete')
  },
})

// Development helpers
if (process.env.NODE_ENV === 'development') {
  contextBridge.exposeInMainWorld('dev', {
    openDevTools: () => ipcRenderer.send('dev:openDevTools'),
    reload: () => ipcRenderer.send('dev:reload'),
  })
}
