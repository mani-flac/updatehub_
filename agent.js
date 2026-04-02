import { ipcMain, BrowserWindow, app } from 'electron'
import { exec } from 'child_process'
import { promisify } from 'util'
import os from 'os'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  compareVersions,
  isNewer,
  formatVersion,
  isSignificantUpdate,
  parseVersion
} from './versionUtils.js'
import { notificationManager } from './notifications.js'

const execAsync = promisify(exec)
const platform = os.platform() // 'win32' | 'darwin' | 'linux'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const LOG_FILE = path.join(app.getPath('userData'), 'updatehub.log')
const HISTORY_FILE = path.join(app.getPath('userData'), 'history.json')

const logger = {
  log: (msg) => {
    const entry = `[${new Date().toISOString()}] LOG: ${msg}\n`
    fs.appendFileSync(LOG_FILE, entry)
    console.log(entry)
  },
  error: (msg, err) => {
    const entry = `[${new Date().toISOString()}] ERROR: ${msg} ${err?.message || err}\n`
    fs.appendFileSync(LOG_FILE, entry)
    console.error(entry)
  }
}

// Input sanitization to prevent command injection
const sanitize = (val) => {
  if (typeof val !== 'string') return ''
  // Allow characters typical for app IDs and names, but block shell meta-characters like &, |, ;, $
  // Allowing: A-Z, 0-9, dots, dashes, underscores, spaces, plus, parentheses, colons
  return val.replace(/[^a-zA-Z0-9.\-_ +():]/g, '')
}

// ── Persistent Storage Functions ─────────────────────────────────

function loadHistory() {
  try {
    if (fs.existsSync(HISTORY_FILE)) {
      const data = fs.readFileSync(HISTORY_FILE, 'utf8')
      return JSON.parse(data)
    }
  } catch (err) {
    logger.error('Failed to load history:', err)
  }
  return []
}

function saveHistory(history) {
  try {
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf8')
  } catch (err) {
    logger.error('Failed to save history:', err)
  }
}

// In-memory storage (Phase 3: SQLite integration planned)
let updateHistory = loadHistory()
let appCache = []

// ── In-Memory Storage Functions ─────────────────────────────────

function addUpdateHistory(record) {
  updateHistory.unshift({
    ...record,
    timestamp: Date.now(),
    id: updateHistory.length + 1
  })
  
  // Keep only last 100 records
  if (updateHistory.length > 100) {
    updateHistory = updateHistory.slice(0, 100)
  }

  saveHistory(updateHistory)
}

function getUpdateHistory(limit = 50) {
  return updateHistory.slice(0, limit)
}

function clearUpdateHistory() {
  updateHistory = []
  saveHistory(updateHistory)
  return true
}

function getUpdateStats() {
  const totalUpdates = updateHistory.length
  const successfulUpdates = updateHistory.filter(h => h.status === 'success').length
  const failedUpdates = updateHistory.filter(h => h.status === 'failed').length
  const avgDuration = updateHistory.length > 0 
    ? updateHistory.reduce((sum, h) => sum + (h.duration || 0), 0) / updateHistory.length 
    : 0
  const lastUpdate = updateHistory.length > 0 ? updateHistory[0].timestamp : null

  return {
    totalUpdates,
    successfulUpdates,
    failedUpdates,
    cancelledUpdates: 0,
    avgDuration,
    lastUpdate
  }
}

function getUpdateHistoryForApp(appId) {
  return updateHistory.filter(h => h.appId === appId)
}

function updateAppCache(apps) {
  appCache = apps
  return true
}

// ── App Scanner ─────────────────────────────────────────────

async function scanInstalledApps() {
  let apps = []
  
  if (platform === 'win32') {
    apps = await scanWindows()
  } else if (platform === 'darwin') {
    apps = await scanMacOS()
  }

  // Cache the results
  if (apps.length > 0) {
    try {
      updateAppCache(apps)
    } catch (error) {
      console.error('Failed to cache apps:', error)
    }
  }

  return apps
}

async function scanWindows() {
  try {
    const { stdout } = await execAsync('winget list --accept-source-agreements', {
      timeout: 30000
    })
    return parseWingetList(stdout)
  } catch (err) {
    console.error('winget scan failed:', err.message)
    return getMockApps() // fallback for dev
  }
}

async function scanMacOS() {
  try {
    const { stdout } = await execAsync('brew list --versions', { timeout: 30000 })
    return parseBrewList(stdout)
  } catch (err) {
    console.error('brew scan failed:', err.message)
    return getMockApps()
  }
}

// ── Remote Search ───────────────────────────────────────────

async function searchRemoteApps(query) {
  const safeQuery = sanitize(query)
  if (!safeQuery || safeQuery.length < 2) return []

  try {
    if (platform === 'win32') {
      const { stdout } = await execAsync(`winget search "${safeQuery}" --accept-source-agreements`, { timeout: 30000 })
      return parseWingetSearch(stdout)
    } else {
      const { stdout } = await execAsync(`brew search "${safeQuery}"`, { timeout: 30000 })
      return parseBrewSearch(stdout)
    }
  } catch (err) {
    console.error('Remote search failed:', err)
    return []
  }
}

// ── Update Checker ───────────────────────────────────────────

async function checkUpdates() {
  if (platform === 'win32') {
    try {
      const { stdout } = await execAsync('winget upgrade --accept-source-agreements', { timeout: 60000 })
      return parseWingetUpgrades(stdout)
    } catch {
      return getMockUpdates()
    }
  } else if (platform === 'darwin') {
    try {
      const { stdout } = await execAsync('brew outdated --verbose', { timeout: 30000 })
      return parseBrewOutdated(stdout)
    } catch {
      return getMockUpdates()
    }
  }
  return getMockUpdates()
}

// Enhanced version checking with comparison
async function checkUpdatesEnhanced() {
  const currentApps = await scanInstalledApps()
  const availableUpdates = await checkUpdates()
  
  // Enhance update information with version comparison
  return availableUpdates.map(update => {
    const currentApp = currentApps.find(app => app.id === update.id)
    
    return {
      ...update,
      // Add version comparison metadata
      isSignificant: currentApp ? isSignificantUpdate(currentApp.version, update.newVersion) : false,
      formattedVersions: {
        current: formatVersion(update.currentVersion, { short: true }),
        latest: formatVersion(update.newVersion, { short: true })
      },
      // Add update urgency based on version difference
      urgency: getUpdateUrgency(update.currentVersion, update.newVersion)
    }
  })
}

// Determine update urgency based on version difference
function getUpdateUrgency(currentVersion, newVersion) {
  const comparison = compareVersions(currentVersion, newVersion)
  
  if (comparison >= 0) return 'none' // No update needed
  
  const current = parseVersion(currentVersion)
  const latest = parseVersion(newVersion)
  
  const majorDiff = latest.major - current.major
  const minorDiff = latest.minor - current.minor
  
  if (majorDiff > 0) return 'critical'  // Major version jump
  if (minorDiff > 2) return 'high'     // Multiple minor versions
  if (minorDiff > 0) return 'medium'   // Minor version bump
  return 'low'                         // Patch update
}

// ── Updater ──────────────────────────────────────────────────

async function updateApp(appId, win) {
  const startTime = Date.now()
  const safeId = sanitize(appId)
  
  let updateRecord = {
    appId: safeId,
    appName: safeId,
    source: 'unknown',
    fromVersion: null,
    toVersion: null,
    status: 'success',
    errorMessage: null,
    duration: 0
  }

  try {
    // Get current app info before update
    const apps = await scanInstalledApps()
    const currentApp = apps.find(app => app.id === appId)
    if (currentApp) {
      updateRecord.appName = currentApp.name
      updateRecord.fromVersion = currentApp.version
      updateRecord.source = currentApp.source
    }

    let cmd = platform === 'win32'
      ? `winget upgrade --id "${safeId}" --accept-source-agreements --accept-package-agreements`
      : `brew upgrade "${safeId}"`

    win?.webContents.send('update:progress', { 
      appId: safeId, 
      status: 'updating', 
      message: `Updating ${updateRecord.appName}...`,
      percentage: 0
    })

    // Simulate progress updates (in real implementation, this would come from package manager output)
    let currentProgress = 0
    const progressInterval = setInterval(() => {
      if (currentProgress < 90) {
        currentProgress = Math.min(currentProgress + 10, 90)
        win?.webContents.send('update:progress', { 
          appId, 
          status: 'updating', 
          message: `Installing updates for ${updateRecord.appName}...`,
          percentage: currentProgress
        })
      }
    }, 500)

    const { stdout } = await execAsync(cmd, { 
      timeout: 120000,
      maxBuffer: 1024 * 1024 // Increase buffer size for larger outputs
    })

    // Get new version after update
    const updatedApps = await scanInstalledApps()
    const updatedApp = updatedApps.find(app => app.id === appId)
    if (updatedApp) {
      updateRecord.toVersion = updatedApp.version
    }

    // Clear progress interval
    clearInterval(progressInterval)

    // Send final progress
    win?.webContents.send('update:progress', { 
      appId, 
      status: 'success', 
      message: 'Finalizing installation...',
      percentage: 95
    })

    await new Promise(resolve => setTimeout(resolve, 500)) // Brief pause for UI

    win?.webContents.send('update:complete', { 
      appId, 
      status: 'success',
      appName: updateRecord.appName,
      fromVersion: updateRecord.fromVersion,
      toVersion: updateRecord.toVersion,
      duration: updateRecord.duration
    })

    updateRecord.status = 'success'
    updateRecord.duration = Date.now() - startTime

    return { success: true, output: stdout }
  } catch (err) {
    updateRecord.status = 'failed'
    updateRecord.errorMessage = err.message
    updateRecord.duration = Date.now() - startTime
    logger.error(`Update failed for ${safeId}:`, err)

    win?.webContents.send('update:complete', { 
      appId: safeId, 
      status: 'failed', 
      error: err.message,
      appName: updateRecord.appName,
      duration: updateRecord.duration
    })

    return { success: false, error: err.message }
  } finally {
    // Save to history
    try {
      await addUpdateHistory(updateRecord)
      
      // Trigger notification
      if (updateRecord.status === 'success') {
        notificationManager.showUpdateCompleted(updateRecord.appName, true)
      } else {
        notificationManager.showUpdateCompleted(updateRecord.appName, false)
      }
    } catch (historyError) {
      console.error('Failed to save update history:', historyError)
    }
  }
}

async function uninstallApp(appId, appName) {
  const startTime = Date.now()
  const safeId = sanitize(appId)
  
  let uninstallRecord = {
    appId: safeId,
    appName: appName || safeId,
    source: platform === 'win32' ? 'winget' : 'homebrew',
    fromVersion: null,
    toVersion: 'Uninstalled',
    status: 'success',
    errorMessage: null,
    duration: 0
  }

  try {
    let cmd = platform === 'win32'
      ? `winget uninstall --id "${safeId}" --accept-source-agreements`
      : `brew uninstall "${safeId}"`

    logger.log(`Executing uninstall: ${cmd}`)

    const { stdout } = await execAsync(cmd, { 
      timeout: 120000,
      maxBuffer: 1024 * 1024
    })

    uninstallRecord.status = 'success'
    uninstallRecord.duration = Date.now() - startTime

    return { success: true, output: stdout }
  } catch (err) {
    uninstallRecord.status = 'failed'
    uninstallRecord.errorMessage = err.message
    uninstallRecord.duration = Date.now() - startTime

    return { success: false, error: err.message }
  } finally {
    try {
      await addUpdateHistory(uninstallRecord)
    } catch (historyError) {
      console.error('Failed to save uninstall history:', historyError)
    }
  }
}

async function installApp(appId, appName, win) {
  const startTime = Date.now()
  const safeId = sanitize(appId)
  
  let installRecord = {
    appId: safeId,
    appName: appName || safeId,
    source: platform === 'win32' ? 'winget' : 'homebrew',
    fromVersion: 'New Installation',
    toVersion: 'Latest',
    status: 'success',
    errorMessage: null,
    duration: 0
  }

  try {
    win?.webContents.send('update:progress', { 
      appId: safeId, 
      status: 'updating', 
      message: `Installing ${installRecord.appName}...`,
      percentage: 10
    })

    let cmd = platform === 'win32'
      ? `winget install --id "${safeId}" --accept-source-agreements --accept-package-agreements`
      : `brew install "${safeId}"`

    const { stdout } = await execAsync(cmd, { timeout: 300000, maxBuffer: 1024 * 1024 })

    installRecord.status = 'success'
    installRecord.duration = Date.now() - startTime

    win?.webContents.send('update:complete', { 
      appId: safeId, 
      status: 'success',
      appName: installRecord.appName,
      duration: installRecord.duration
    })

    return { success: true, output: stdout }
  } catch (err) {
    installRecord.status = 'failed'
    installRecord.errorMessage = err.message
    installRecord.duration = Date.now() - startTime

    win?.webContents.send('update:complete', { 
      appId: safeId, 
      status: 'failed', 
      error: err.message,
      appName: installRecord.appName
    })

    return { success: false, error: err.message }
  } finally {
    try {
      await addUpdateHistory(installRecord)
    } catch (historyError) {
      console.error('Failed to save install history:', historyError)
    }
  }
}

// ── Parsers ──────────────────────────────────────────────────

function parseWingetList(output) {
  const lines = output.split('\n').slice(2) // skip header
  return lines
    .filter(l => l.trim() && !l.startsWith('-'))
    .map(line => {
      const parts = line.trim().split(/\s{2,}/)
      return {
        id: parts[1] || parts[0],
        name: parts[0],
        version: parts[2] || 'unknown',
        source: 'winget',
      }
    })
    .filter(a => a.name)
}

function parseBrewList(output) {
  return output.trim().split('\n').map(line => {
    const [name, ...vParts] = line.split(' ')
    return { id: name, name, version: vParts.join(' '), source: 'homebrew' }
  }).filter(a => a.name)
}

function parseWingetUpgrades(output) {
  const lines = output.split('\n').slice(2)
  return lines
    .filter(l => l.trim() && !l.startsWith('-') && !l.includes('upgrades available'))
    .map(line => {
      const parts = line.trim().split(/\s{2,}/)
      return {
        id: parts[1] || parts[0],
        name: parts[0],
        currentVersion: parts[2],
        newVersion: parts[3],
        source: 'winget',
      }
    })
    .filter(a => a.name && a.newVersion)
}

function parseBrewOutdated(output) {
  return output.trim().split('\n').map(line => {
    const match = line.match(/^(\S+) \((.+)\) < (.+)$/)
    if (!match) return null
    return { id: match[1], name: match[1], currentVersion: match[2], newVersion: match[3], source: 'homebrew' }
  }).filter(Boolean)
}

function parseWingetSearch(output) {
  const lines = output.split('\n').slice(2)
  return lines
    .filter(l => l.trim() && !l.startsWith('-'))
    .map(line => {
      const parts = line.trim().split(/\s{2,}/)
      return {
        id: parts[1],
        name: parts[0],
        version: parts[2],
        source: 'winget'
      }
    })
    .filter(a => a.id && a.name)
}

function parseBrewSearch(output) {
  return output.trim().split('\n')
    .filter(line => line.trim() && !line.includes('==>'))
    .flatMap(line => line.trim().split(/\s+/))
    .map(name => ({
      id: name,
      name: name,
      version: 'latest',
      source: 'homebrew'
    }))
}

// ── Mock Data (for dev / unsupported platforms) ──────────────

function getMockApps() {
  return [
    { id: 'Google.Chrome', name: 'Google Chrome', version: '120.0.6099.130', source: 'winget' },
    { id: 'Microsoft.VSCode', name: 'Visual Studio Code', version: '1.85.1', source: 'winget' },
    { id: 'Spotify.Spotify', name: 'Spotify', version: '1.2.25.1011', source: 'winget' },
    { id: 'Discord.Discord', name: 'Discord', version: '1.0.9029', source: 'winget' },
    { id: 'Figma.Figma', name: 'Figma', version: '116.14.8', source: 'winget' },
    { id: 'Node.js', name: 'Node.js', version: '20.10.0', source: 'winget' },
    { id: 'Git.Git', name: 'Git', version: '2.43.0', source: 'winget' },
    { id: 'Notion.Notion', name: 'Notion', version: '3.1.0', source: 'winget' },
  ]
}

function getMockUpdates() {
  return [
    { id: 'Google.Chrome', name: 'Google Chrome', currentVersion: '120.0.6099.130', newVersion: '121.0.6167.85', source: 'winget' },
    { id: 'Microsoft.VSCode', name: 'Visual Studio Code', currentVersion: '1.85.1', newVersion: '1.86.0', source: 'winget' },
    { id: 'Discord.Discord', name: 'Discord', currentVersion: '1.0.9029', newVersion: '1.0.9031', source: 'winget' },
  ]
}

// ── IPC Registration ─────────────────────────────────────────

function setupAgentHandlers() {
  ipcMain.handle('agent:scan',          () => scanInstalledApps())
  ipcMain.handle('agent:checkUpdates',  () => checkUpdatesEnhanced())
  ipcMain.handle('agent:uninstallApp',  (event, appId, appName) => uninstallApp(appId, appName))
  ipcMain.handle('agent:searchRemote', (event, query) => searchRemoteApps(query))
  ipcMain.handle('agent:installApp', (event, appId, appName) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    return installApp(appId, appName, win)
  })
  ipcMain.handle('agent:updateApp',     (event, appId) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    return updateApp(appId, win)
  })
  ipcMain.handle('agent:updateAll', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    const updates = await checkUpdates()
    const results = []
    for (const app of updates) {
      const result = await updateApp(app.id, win)
      results.push({ ...app, ...result })
    }
    
    // Trigger bulk update notification
    notificationManager.showBulkUpdateCompleted(results)
    
    return results
  })
  ipcMain.handle('agent:history', async () => {
    return await getUpdateHistory()
  })
  ipcMain.handle('agent:history:clear', async () => {
    return await clearUpdateHistory()
  })
  ipcMain.handle('agent:history:app', async (event, appId) => {
    return await getUpdateHistoryForApp(appId)
  })
  ipcMain.handle('agent:stats', async () => {
    return await getUpdateStats()
  })
}

export { setupAgentHandlers }
