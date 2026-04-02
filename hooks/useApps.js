import { useState, useEffect } from 'react'

export function useApps() {
  const [apps, setApps] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchApps = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await window.electron?.agent?.scan?.()
      setApps(result || [])
    } catch (err) {
      setError(err.message)
      console.error('Failed to fetch apps:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApps()
  }, [])

  const uninstallApp = async (appId, appName) => {
    try {
      const result = await window.electron?.agent?.uninstallApp?.(appId, appName)
      if (result?.success) {
        await fetchApps()
      }
      return result
    } catch (err) {
      console.error('Uninstall failed:', err)
      throw err
    }
  }

  return { apps, loading, error, refetch: fetchApps, uninstallApp }
}

export function useUpdates() {
  const [updates, setUpdates] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchUpdates = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await window.electron?.agent?.checkUpdates?.()
      setUpdates(result || [])
    } catch (err) {
      setError(err.message)
      console.error('Failed to fetch updates:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUpdates()
  }, [])

  const uninstallApp = async (appId, appName) => {
    try {
      const result = await window.electron?.agent?.uninstallApp?.(appId, appName)
      if (result?.success) {
        await fetchUpdates()
      }
      return result
    } catch (err) {
      console.error('Uninstall failed:', err)
      throw err
    }
  }

  return { updates, loading, error, refetch: fetchUpdates, uninstallApp }
}

export function useUpdater() {
  const [updating, setUpdating] = useState(new Set())
  const [progress, setProgress] = useState({})

  const updateApp = async (appId) => {
    if (updating.has(appId)) return
    
    setUpdating(prev => new Set(prev).add(appId))
    try {
      const result = await window.electron?.agent?.updateApp?.(appId)
      return result
    } catch (err) {
      console.error('Update failed:', err)
      throw err
    } finally {
      setUpdating(prev => {
        const next = new Set(prev)
        next.delete(appId)
        return next
      })
    }
  }

  const updateAll = async () => {
    try {
      const result = await window.electron?.agent?.updateAll?.()
      return result
    } catch (err) {
      console.error('Update all failed:', err)
      throw err
    }
  }

  useEffect(() => {
    const handleProgress = (data) => {
      setProgress(prev => ({ 
        ...prev, 
        [data.appId]: {
          ...data,
          percentage: data.percentage || 0,
          message: data.message || 'Updating...'
        }
      }))
    }

    const handleComplete = (data) => {
      setProgress(prev => ({ 
        ...prev, 
        [data.appId]: {
          ...data,
          percentage: 100,
          message: data.status === 'success' ? 'Completed' : 'Failed'
        }
      }))
    }

    if (window.electron?.onUpdateProgress) {
      window.electron.onUpdateProgress(handleProgress)
      window.electron.onUpdateComplete(handleComplete)
    }

    return () => {
      if (window.electron?.removeUpdateListeners) {
        window.electron.removeUpdateListeners()
      }
    }
  }, [])

  return { updateApp, updateAll, updating, progress }
}

export function useRemoteSearch() {
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState(null)

  const search = async (query) => {
    if (!query || query.length < 2) {
      setResults([])
      return
    }
    setSearching(true)
    setError(null)
    try {
      const result = await window.electron?.agent?.searchRemote?.(query)
      setResults(result || [])
    } catch (err) {
      setError(err.message)
      console.error('Remote search failed:', err)
    } finally {
      setSearching(false)
    }
  }

  return { results, searching, error, search }
}

export function useInstaller() {
  const [installing, setInstalling] = useState(new Set())

  const installApp = async (appId, appName) => {
    if (installing.has(appId)) return
    
    setInstalling(prev => new Set(prev).add(appId))
    try {
      const result = await window.electron?.agent?.installApp?.(appId, appName)
      return result
    } catch (err) {
      console.error('Installation failed:', err)
      throw err
    } finally {
      setInstalling(prev => {
        const next = new Set(prev)
        next.delete(appId)
        return next
      })
    }
  }

  return { installApp, installing }
}
