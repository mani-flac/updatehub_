// ── Task Scheduler ───────────────────────────────────────────

class TaskScheduler {
  constructor() {
    this.tasks = new Map()
    this.isRunning = false
  }

  // Add a recurring task
  addRecurringTask(name, callback, intervalMs, options = {}) {
    this.removeTask(name) // Remove existing task if any

    const task = {
      name,
      callback,
      intervalMs,
      options: {
        immediate: false,
        maxRetries: 3,
        retryDelay: 5000,
        ...options
      },
      timer: null,
      retryCount: 0,
      lastRun: null,
      nextRun: null
    }

    this.tasks.set(name, task)
    
    if (task.options.immediate) {
      this.runTask(name)
    } else {
      this.scheduleNextRun(name)
    }

    console.log(`Task '${name}' scheduled with interval ${intervalMs}ms`)
  }

  // Remove a task
  removeTask(name) {
    const task = this.tasks.get(name)
    if (task && task.timer) {
      clearTimeout(task.timer)
    }
    this.tasks.delete(name)
    console.log(`Task '${name}' removed`)
  }

  // Schedule next run for a task
  scheduleNextRun(name) {
    const task = this.tasks.get(name)
    if (!task) return

    // Ensure timeout doesn't exceed 32-bit integer limit
    const maxTimeout = 2147483647 // ~24.8 days
    let delay = task.intervalMs
    
    if (delay > maxTimeout) {
      delay = maxTimeout
    }

    task.nextRun = Date.now() + delay
    task.timer = setTimeout(() => {
      this.runTask(name)
    }, delay)
  }

  // Run a specific task
  async runTask(name) {
    const task = this.tasks.get(name)
    if (!task) return

    task.lastRun = Date.now()
    task.retryCount = 0

    try {
      console.log(`Running task: ${name}`)
      await task.callback()
      console.log(`Task '${name}' completed successfully`)
    } catch (error) {
      console.error(`Task '${name}' failed:`, error)
      
      // Retry logic
      if (task.retryCount < task.options.maxRetries) {
        task.retryCount++
        console.log(`Retrying task '${name}' (${task.retryCount}/${task.options.maxRetries})`)
        
        setTimeout(() => {
          this.runTask(name)
        }, task.options.retryDelay)
      } else {
        console.error(`Task '${name}' failed after ${task.options.maxRetries} retries`)
      }
    }

    // Schedule next run if not a one-time task
    if (task.intervalMs > 0) {
      this.scheduleNextRun(name)
    }
  }

  // Get task status
  getTaskStatus(name) {
    const task = this.tasks.get(name)
    if (!task) return null

    return {
      name: task.name,
      lastRun: task.lastRun,
      nextRun: task.nextRun,
      retryCount: task.retryCount,
      intervalMs: task.intervalMs
    }
  }

  // Get all tasks status
  getAllTasksStatus() {
    const status = {}
    for (const [name, task] of this.tasks) {
      status[name] = this.getTaskStatus(name)
    }
    return status
  }

  // Start all tasks
  start() {
    if (this.isRunning) return
    
    this.isRunning = true
    console.log('Task scheduler started')
    
    for (const [name, task] of this.tasks) {
      if (task.options.immediate) {
        this.runTask(name)
      } else {
        this.scheduleNextRun(name)
      }
    }
  }

  // Stop all tasks
  stop() {
    if (!this.isRunning) return
    
    for (const [name, task] of this.tasks) {
      if (task.timer) {
        clearTimeout(task.timer)
      }
    }
    
    this.isRunning = false
    console.log('Task scheduler stopped')
  }

  // Pause a specific task
  pauseTask(name) {
    const task = this.tasks.get(name)
    if (task && task.timer) {
      clearTimeout(task.timer)
      task.timer = null
      console.log(`Task '${name}' paused`)
    }
  }

  // Resume a paused task
  resumeTask(name) {
    const task = this.tasks.get(name)
    if (task && !task.timer) {
      const timeUntilNext = task.nextRun - Date.now()
      if (timeUntilNext > 0) {
        task.timer = setTimeout(() => {
          this.runTask(name)
        }, timeUntilNext)
      } else {
        this.runTask(name)
      }
      console.log(`Task '${name}' resumed`)
    }
  }
}

// Create singleton instance
export const scheduler = new TaskScheduler()

// ── Predefined Tasks ─────────────────────────────────────────

export function setupScheduledTasks(agent, notificationManager) {
  // Hourly update check
  scheduler.addRecurringTask(
    'hourly-update-check',
    async () => {
      try {
        const updates = await agent.checkUpdates()
        await notificationManager.triggerScheduledScanNotification(updates)
      } catch (error) {
        console.error('Scheduled update check failed:', error)
      }
    },
    60 * 60 * 1000, // 1 hour
    {
      immediate: false,
      maxRetries: 2
    }
  )

  // Daily app scan
  scheduler.addRecurringTask(
    'daily-app-scan',
    async () => {
      try {
        await agent.scanInstalledApps()
      } catch (error) {
        console.error('Scheduled app scan failed:', error)
      }
    },
    24 * 60 * 60 * 1000, // 24 hours
    {
      immediate: false,
      maxRetries: 2
    }
  )

  // Weekly reminder
  scheduler.addRecurringTask(
    'weekly-reminder',
    async () => {
      try {
        await notificationManager.triggerPeriodicReminder()
      } catch (error) {
        console.error('Weekly reminder failed:', error)
      }
    },
    7 * 24 * 60 * 60 * 1000, // 7 days
    {
      immediate: false,
      maxRetries: 1
    }
  )

  // Database cleanup (weekly instead of monthly for demo)
  scheduler.addRecurringTask(
    'weekly-cleanup',
    async () => {
      try {
        // Clean up old update history (older than 30 days)
        const cutoffTime = Date.now() - (30 * 24 * 60 * 60 * 1000)
        // This would be implemented in database.js
        console.log('Running weekly cleanup')
      } catch (error) {
        console.error('Weekly cleanup failed:', error)
      }
    },
    7 * 24 * 60 * 60 * 1000, // 7 days
    {
      immediate: false,
      maxRetries: 1
    }
  )
}

// ── Settings Integration ─────────────────────────────────────

export function updateScheduleFromSettings(settings) {
  // Update intervals based on user settings
  const intervals = {
    hourly: 60 * 60 * 1000,
    daily: 24 * 60 * 60 * 1000,
    weekly: 7 * 24 * 60 * 60 * 1000,
    monthly: 30 * 24 * 60 * 60 * 1000
  }

  // Update scan interval
  const scanTask = scheduler.tasks.get('daily-app-scan')
  if (scanTask && intervals[settings.scanInterval]) {
    scanTask.intervalMs = intervals[settings.scanInterval]
    scheduler.pauseTask('daily-app-scan')
    scheduler.resumeTask('daily-app-scan')
  }

  // Enable/disable notifications
  if (notificationManager) {
    notificationManager.setEnabled(settings.notifications)
  }
}
