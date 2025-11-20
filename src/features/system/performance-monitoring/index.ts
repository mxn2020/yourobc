/**
 * Performance Monitoring Addon
 *
 * Tracks SSR cache hit rates, query performance, and page load times
 */

export { PerformanceMonitor } from './services/PerformanceMonitor'
export { usePerformanceMetrics } from './hooks/usePerformanceMetrics'
export { PerformanceDashboard } from './components/PerformanceDashboard'
export type { PerformanceMetrics, CacheMetrics, QueryMetrics } from './types'
