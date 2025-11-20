/**
 * React hook for accessing performance metrics
 */

import { useState, useEffect, useCallback } from 'react'
import { PerformanceMonitor } from '../services/PerformanceMonitor'
import type { PerformanceMetrics } from '../types'

export interface UsePerformanceMetricsOptions {
  /** Time range for metrics in milliseconds */
  timeRange?: number
  /** Polling interval in milliseconds */
  pollingInterval?: number
  /** Enable auto-refresh */
  autoRefresh?: boolean
}

export function usePerformanceMetrics(options: UsePerformanceMetricsOptions = {}) {
  const { timeRange = 24 * 60 * 60 * 1000, pollingInterval = 5000, autoRefresh = true } = options

  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchMetrics = useCallback(() => {
    try {
      const end = Date.now()
      const start = end - timeRange

      const data = PerformanceMonitor.getMetrics({ start, end })
      setMetrics(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch metrics'))
    } finally {
      setIsLoading(false)
    }
  }, [timeRange])

  useEffect(() => {
    fetchMetrics()

    if (autoRefresh) {
      const interval = setInterval(fetchMetrics, pollingInterval)
      return () => clearInterval(interval)
    }
  }, [fetchMetrics, autoRefresh, pollingInterval])

  const clearMetrics = useCallback(() => {
    PerformanceMonitor.clear()
    fetchMetrics()
  }, [fetchMetrics])

  const exportMetrics = useCallback(() => {
    return PerformanceMonitor.exportMetrics()
  }, [])

  return {
    metrics,
    isLoading,
    error,
    refresh: fetchMetrics,
    clearMetrics,
    exportMetrics,
  }
}
