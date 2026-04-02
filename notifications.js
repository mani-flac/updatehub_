import { Notification } from 'electron'

// ── Notification Manager ───────────────────────────────────────

class NotificationManager {
  constructor() {
    this.isEnabled = true
    this.lastNotification = {}
    this.cooldownPeriod = 5 * 60 * 1000 // 5 minutes cooldown
  }

  // Check if notifications are supported
  static isSupported() {
    return Notification.isSupported()
  }

  // Enable/disable notifications
  setEnabled(enabled) {
    this.isEnabled = enabled
  }

  // Check if we should show notification (cooldown)
  shouldShowNotification(type) {
    if (!this.isEnabled) return false
    
    const now = Date.now()
    const lastTime = this.lastNotification[type] || 0
    
    if (now - lastTime < this.cooldownPeriod) {
      return false
    }
    
    this.lastNotification[type] = now
    return true
  }

  // Show update available notification
  showUpdateAvailable(updates) {
    if (!this.shouldShowNotification('updates_available')) return

    const notification = new Notification({
      title: 'Updates Available',
      body: `${updates.length} application${updates.length > 1 ? 's' : ''} ready to update`,
      icon: this.getAppIcon(),
      urgency: 'normal',
      actions: [
        {
          type: 'button',
          text: 'View Updates'
        }
      ]
    })

    notification.on('click', () => {
      // Focus the app and navigate to updates
      this.focusApp('updates')
    })

    notification.on('action', (_, actionIndex) => {
      if (actionIndex === 0) {
        this.focusApp('updates')
      }
    })

    notification.show()
  }

  // Show update completed notification
  showUpdateCompleted(appName, success = true) {
    if (!this.shouldShowNotification('update_completed')) return

    const notification = new Notification({
      title: success ? 'Update Completed' : 'Update Failed',
      body: `${appName} ${success ? 'updated successfully' : 'failed to update'}`,
      icon: this.getAppIcon(),
      urgency: success ? 'normal' : 'critical'
    })

    notification.on('click', () => {
      this.focusApp('history')
    })

    notification.show()
  }

  // Show bulk update notification
  showBulkUpdateCompleted(results) {
    if (!this.shouldShowNotification('bulk_update_completed')) return

    const successful = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length

    let body = ''
    if (successful > 0 && failed === 0) {
      body = `${successful} application${successful > 1 ? 's' : ''} updated successfully`
    } else if (successful === 0 && failed > 0) {
      body = `${failed} application${failed > 1 ? 's' : ''} failed to update`
    } else {
      body = `${successful} updated, ${failed} failed`
    }

    const notification = new Notification({
      title: 'Bulk Update Complete',
      body,
      icon: this.getAppIcon(),
      urgency: failed > 0 ? 'critical' : 'normal'
    })

    notification.on('click', () => {
      this.focusApp('history')
    })

    notification.show()
  }

  // Show scheduled scan notification
  showScheduledScanResults(updatesFound) {
    if (!this.shouldShowNotification('scheduled_scan')) return

    if (updatesFound.length === 0) {
      const notification = new Notification({
        title: 'Scan Complete',
        body: 'All applications are up to date',
        icon: this.getAppIcon(),
        urgency: 'low'
      })
      notification.show()
    } else {
      this.showUpdateAvailable(updatesFound)
    }
  }

  // Show error notification
  showError(message, context = '') {
    const notification = new Notification({
      title: 'UpdateHub Error',
      body: context ? `${context}: ${message}` : message,
      icon: this.getAppIcon(),
      urgency: 'critical'
    })

    notification.show()
  }

  // Focus the application window
  focusApp(tab = 'dashboard') {
    // This will be implemented in main.js
    if (global.mainWindow) {
      global.mainWindow.focus()
      global.mainWindow.webContents.send('app:navigate', tab)
    }
  }

  // Get app icon (placeholder for now)
  getAppIcon() {
    // TODO: Return actual app icon path
    return null
  }

  // Show welcome notification
  showWelcome() {
    if (!this.shouldShowNotification('welcome')) return

    const notification = new Notification({
      title: 'Welcome to UpdateHub!',
      body: 'Your application update manager is ready to keep your software up to date.',
      icon: this.getAppIcon(),
      urgency: 'low'
    })

    notification.on('click', () => {
      this.focusApp('dashboard')
    })

    notification.show()
  }

  // Show periodic reminder
  showPeriodicReminder() {
    if (!this.shouldShowNotification('reminder')) return

    const notification = new Notification({
      title: 'UpdateHub Reminder',
      body: 'Check for available updates to keep your applications secure and up to date.',
      icon: this.getAppIcon(),
      urgency: 'low',
      actions: [
        {
          type: 'button',
          text: 'Check Now'
        }
      ]
    })

    notification.on('click', () => {
      this.focusApp('updates')
    })

    notification.on('action', (_, actionIndex) => {
      if (actionIndex === 0) {
        this.focusApp('updates')
      }
    })

    notification.show()
  }
}

// Export singleton instance
export const notificationManager = new NotificationManager()

// ── Notification Triggers ─────────────────────────────────────

export async function triggerUpdateAvailableNotification(updates) {
  if (updates.length > 0) {
    notificationManager.showUpdateAvailable(updates)
  }
}

export async function triggerUpdateCompletedNotification(appName, success) {
  notificationManager.showUpdateCompleted(appName, success)
}

export async function triggerBulkUpdateNotification(results) {
  notificationManager.showBulkUpdateCompleted(results)
}

export async function triggerScheduledScanNotification(updates) {
  notificationManager.showScheduledScanResults(updates)
}

export async function triggerErrorNotification(message, context) {
  notificationManager.showError(message, context)
}

export async function triggerWelcomeNotification() {
  notificationManager.showWelcome()
}

export async function triggerPeriodicReminder() {
  notificationManager.showPeriodicReminder()
}
