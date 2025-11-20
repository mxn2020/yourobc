/**
 * Performance Monitor Service
 *
 * Tracks SSR cache hits/misses, query performance, and page load metrics
 */

import type {
  CacheMetrics,
  QueryMetrics,
  PageLoadMetrics,
  ErrorMetrics,
  PerformanceMetrics,
  PerformanceConfig,
  CacheHitEvent,
  CacheMissEvent,
} from '../types'

class PerformanceMonitorService {
  private cacheHits: CacheHitEvent[] = []
  private cacheMisses: CacheMissEvent[] = []
  private queryMetricsMap: Map<string, QueryMetrics> = new Map()
  private pageLoadMetrics: PageLoadMetrics[] = []
  private errorMetrics: Map<string, ErrorMetrics> = new Map()
  private config: PerformanceConfig = {
    enableCacheTracking: true,
    enableQueryTracking: true,
    enablePageLoadTracking: true,
    enableErrorTracking: true,
    sampleRate: 1,
    maxMetrics: 1000,
  }

  constructor(config?: Partial<PerformanceConfig>) {
    if (config) {
      this.config = { ...this.config, ...config }
    }

    // Initialize Web Vitals tracking if in browser
    if (typeof window !== 'undefined' && this.config.enablePageLoadTracking) {
      this.initializeWebVitals()
    }
  }

  /**
   * Configure the performance monitor
   */
  configure(config: Partial<PerformanceConfig>) {
    this.config = { ...this.config, ...config }
  }

  /**
   * Track a cache hit event
   */
  trackCacheHit(event: CacheHitEvent) {
    if (!this.config.enableCacheTracking || !this.shouldSample()) {
      return
    }

    this.cacheHits.push(event)
    this.trimMetrics(this.cacheHits)
  }

  /**
   * Track a cache miss event
   */
  trackCacheMiss(event: CacheMissEvent) {
    if (!this.config.enableCacheTracking || !this.shouldSample()) {
      return
    }

    this.cacheMisses.push(event)
    this.trimMetrics(this.cacheMisses)
  }

  /**
   * Track a query execution
   */
  trackQuery(queryKey: string, duration: number, error?: Error, cached = false) {
    if (!this.config.enableQueryTracking || !this.shouldSample()) {
      return
    }

    const existing = this.queryMetricsMap.get(queryKey)

    if (existing) {
      existing.executions++
      existing.avgDuration =
        (existing.avgDuration * (existing.executions - 1) + duration) / existing.executions
      existing.minDuration = Math.min(existing.minDuration, duration)
      existing.maxDuration = Math.max(existing.maxDuration, duration)
      existing.lastExecuted = Date.now()
      if (error) {
        existing.errors++
      }
    } else {
      this.queryMetricsMap.set(queryKey, {
        queryKey,
        executions: 1,
        avgDuration: duration,
        minDuration: duration,
        maxDuration: duration,
        errors: error ? 1 : 0,
        lastExecuted: Date.now(),
        cached,
      })
    }

    // Trim if needed
    if (this.queryMetricsMap.size > (this.config.maxMetrics || 1000)) {
      const oldest = Array.from(this.queryMetricsMap.entries()).sort(
        (a, b) => a[1].lastExecuted - b[1].lastExecuted
      )[0]
      if (oldest) {
        this.queryMetricsMap.delete(oldest[0])
      }
    }
  }

  /**
   * Track a page load event
   */
  trackPageLoad(metrics: PageLoadMetrics) {
    if (!this.config.enablePageLoadTracking || !this.shouldSample()) {
      return
    }

    this.pageLoadMetrics.push(metrics)
    this.trimMetrics(this.pageLoadMetrics)
  }

  /**
   * Track an error
   */
  trackError(error: Error, type = 'runtime') {
    if (!this.config.enableErrorTracking || !this.shouldSample()) {
      return
    }

    const key = `${type}:${error.message}`
    const existing = this.errorMetrics.get(key)
    const now = Date.now()

    if (existing) {
      existing.count++
      existing.lastSeen = now
      existing.affectedUsers++ // In real implementation, track unique users
    } else {
      this.errorMetrics.set(key, {
        type,
        message: error.message,
        stack: error.stack,
        count: 1,
        firstSeen: now,
        lastSeen: now,
        affectedUsers: 1,
      })
    }
  }

  /**
   * Get cache metrics
   */
  getCacheMetrics(timeRange?: { start: number; end: number }): CacheMetrics {
    const filteredHits = timeRange
      ? this.cacheHits.filter((h) => h.timestamp >= timeRange.start && h.timestamp <= timeRange.end)
      : this.cacheHits

    const filteredMisses = timeRange
      ? this.cacheMisses.filter(
          (m) => m.timestamp >= timeRange.start && m.timestamp <= timeRange.end
        )
      : this.cacheMisses

    const totalRequests = filteredHits.length + filteredMisses.length
    const hits = filteredHits.length
    const misses = filteredMisses.length

    const avgHitTime =
      filteredHits.reduce((sum, h) => sum + h.duration, 0) / (hits || 1)
    const avgMissTime =
      filteredMisses.reduce((sum, m) => sum + m.fetchDuration, 0) / (misses || 1)

    return {
      totalRequests,
      hits,
      misses,
      hitRate: totalRequests > 0 ? (hits / totalRequests) * 100 : 0,
      avgHitTime,
      avgMissTime,
    }
  }

  /**
   * Get query metrics
   */
  getQueryMetrics(): QueryMetrics[] {
    return Array.from(this.queryMetricsMap.values()).sort(
      (a, b) => b.executions - a.executions
    )
  }

  /**
   * Get page load metrics
   */
  getPageLoadMetrics(timeRange?: { start: number; end: number }): PageLoadMetrics[] {
    const filtered = timeRange
      ? this.pageLoadMetrics.filter(
          (m) => m.timestamp >= timeRange.start && m.timestamp <= timeRange.end
        )
      : this.pageLoadMetrics

    return filtered.sort((a, b) => b.timestamp - a.timestamp)
  }

  /**
   * Get error metrics
   */
  getErrorMetrics(): ErrorMetrics[] {
    return Array.from(this.errorMetrics.values()).sort((a, b) => b.count - a.count)
  }

  /**
   * Get all performance metrics
   */
  getMetrics(timeRange?: { start: number; end: number }): PerformanceMetrics {
    const cache = this.getCacheMetrics(timeRange)
    const queries = this.getQueryMetrics()
    const pageLoads = this.getPageLoadMetrics(timeRange)
    const errors = this.getErrorMetrics()

    // Calculate overall performance score
    const cacheScore = cache.hitRate
    const queryScore = this.calculateQueryScore(queries)
    const pageLoadScore = this.calculatePageLoadScore(pageLoads)
    const errorScore = this.calculateErrorScore(errors)

    const score = Math.round((cacheScore + queryScore + pageLoadScore + errorScore) / 4)

    return {
      cache,
      queries,
      pageLoads,
      errors,
      score,
      timeRange: timeRange || {
        start: Date.now() - 24 * 60 * 60 * 1000,
        end: Date.now(),
      },
    }
  }

  /**
   * Clear all metrics
   */
  clear() {
    this.cacheHits = []
    this.cacheMisses = []
    this.queryMetricsMap.clear()
    this.pageLoadMetrics = []
    this.errorMetrics.clear()
  }

  /**
   * Export metrics as JSON
   */
  exportMetrics(): string {
    return JSON.stringify(this.getMetrics(), null, 2)
  }

  // Private methods

  private shouldSample(): boolean {
    return Math.random() < (this.config.sampleRate || 1)
  }

  private trimMetrics<T>(array: T[]) {
    const max = this.config.maxMetrics || 1000
    if (array.length > max) {
      array.splice(0, array.length - max)
    }
  }

  private calculateQueryScore(queries: QueryMetrics[]): number {
    if (queries.length === 0) return 100

    const avgDuration = queries.reduce((sum, q) => sum + q.avgDuration, 0) / queries.length
    const errorRate =
      queries.reduce((sum, q) => sum + q.errors, 0) /
      queries.reduce((sum, q) => sum + q.executions, 0)

    // Good: < 100ms, OK: < 500ms, Bad: > 1000ms
    let durationScore = 100
    if (avgDuration > 1000) durationScore = 50
    else if (avgDuration > 500) durationScore = 75
    else if (avgDuration > 100) durationScore = 90

    const errorPenalty = Math.min(errorRate * 1000, 50) // Max 50 point penalty

    return Math.max(0, durationScore - errorPenalty)
  }

  private calculatePageLoadScore(pageLoads: PageLoadMetrics[]): number {
    if (pageLoads.length === 0) return 100

    const avgLCP = pageLoads.reduce((sum, p) => sum + p.lcp, 0) / pageLoads.length

    // Good: < 2.5s, OK: < 4s, Bad: > 4s (Core Web Vitals)
    if (avgLCP < 2500) return 100
    if (avgLCP < 4000) return 75
    return 50
  }

  private calculateErrorScore(errors: ErrorMetrics[]): number {
    if (errors.length === 0) return 100

    const totalErrors = errors.reduce((sum, e) => e.count, 0)

    // Penalize based on error count
    if (totalErrors < 10) return 95
    if (totalErrors < 50) return 80
    if (totalErrors < 100) return 60
    return 40
  }

  private initializeWebVitals() {
    // Track Core Web Vitals using Performance Observer API
    if ('PerformanceObserver' in window) {
      try {
        // LCP - Largest Contentful Paint
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1] as any

          this.trackPageLoad({
            route: window.location.pathname,
            ttfb: 0, // Will be set separately
            fcp: 0, // Will be set separately
            lcp: lastEntry.renderTime || lastEntry.loadTime,
            tti: 0, // Will be set separately
            loadTime: performance.now(),
            ssr: document.documentElement.hasAttribute('data-ssr'),
            timestamp: Date.now(),
          })
        })
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
      } catch (e) {
        // Performance Observer not supported
      }
    }
  }
}

// Singleton instance
export const PerformanceMonitor = new PerformanceMonitorService()
