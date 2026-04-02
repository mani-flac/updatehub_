import { app, BrowserWindow, ipcMain, nativeTheme, Tray, Menu } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import { setupAgentHandlers } from './agent.js'
import { notificationManager } from './notifications.js'
import { scheduler, setupScheduledTasks } from './scheduler.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

// Global references
let mainWindow = null
let tray = null

// Store main window globally for notifications
global.mainWindow = null

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 720,
    minWidth: 800,
    minHeight: 600,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'hidden',
    frame: false,
    backgroundColor: '#0f0f0f',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    icon: path.join(__dirname, 'assets/icon.png'),
  })

  // Set global reference
  mainWindow = win
  global.mainWindow = win

  if (isDev) {
    win.loadURL('http://localhost:5173')
    win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(__dirname, '../../dist/index.html'))
  }

  // Window controls via IPC
  ipcMain.on('window:minimize', () => win.minimize())
  ipcMain.on('window:maximize', () => {
    win.isMaximized() ? win.unmaximize() : win.maximize()
  })
  ipcMain.on('window:close', () => {
    if (!app.isPackaged) {
      win.close()
    } else {
      // In production, hide to tray instead of closing
      win.hide()
    }
  })

  // Handle navigation from notifications
  ipcMain.on('app:navigate', (event, tab) => {
    win.webContents.send('app:navigate', tab)
    win.show()
    win.focus()
  })

  // Handle window close event
  win.on('close', (event) => {
    if (!app.isPackaged) {
      // Allow close in development
      return
    }
    
    // Prevent close and hide to tray in production
    event.preventDefault()
    win.hide()
  })

  return win
}

// Create system tray
function createTray() {
  if (!app.isPackaged) return // Only in production

  tray = new Tray(path.join(__dirname, 'assets/icon.png'))
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show UpdateHub',
      click: () => {
        mainWindow.show()
        mainWindow.focus()
      }
    },
    { type: 'separator' },
    {
      label: 'Check for Updates',
      click: async () => {
        try {
          const updates = await mainWindow.webContents.executeJavaScript('window.electron.agent.checkUpdates()')
          if (updates.length > 0) {
            notificationManager.showUpdateAvailable(updates)
          }
        } catch (error) {
          console.error('Failed to check updates:', error)
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Exit',
      click: () => {
        app.quit()
      }
    }
  ])

  tray.setToolTip('UpdateHub - Keep your apps updated')
  tray.setContextMenu(contextMenu)

  // Double click to show window
  tray.on('double-click', () => {
    mainWindow.show()
    mainWindow.focus()
  })
}

app.whenReady().then(async () => {
  console.log('Starting UpdateHub...')

  createWindow()
  setupAgentHandlers()

  // Create tray in production
  if (app.isPackaged) {
    createTray()
  }

  // Setup scheduled tasks
  setupScheduledTasks(null, notificationManager)
  scheduler.start()

  // Show welcome notification on first run
  if (app.isPackaged) {
    setTimeout(() => {
      notificationManager.showWelcome()
    }, 2000)
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
