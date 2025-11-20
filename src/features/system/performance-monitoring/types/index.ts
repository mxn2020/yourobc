/**
 * Performance monitoring types
 */

export interface CacheMetrics {
  /** Total number of cache requests */
  totalRequests: number
  /** Number of cache hits */
  hits: number
  /** Number of cache misses */
  misses: number
  /** Cache hit rate percentage (0-100) */
  hitRate: number
  /** Average time to retrieve from cache (ms) */
  avgHitTime: number
  /** Average time to fetch on miss (ms) */
  avgMissTime: number
  /** Cache size in bytes */
  cacheSize?: number
  /** Number of cache evictions */
  evictions?: number
}

export interface QueryMetrics {
  /** Query identifier */
  queryKey: string
  /** Total number of executions */
  executions: number
  /** Average execution time (ms) */
  avgDuration: number
  /** Minimum execution time (ms) */
  minDuration: number
  /** Maximum execution time (ms) */
  maxDuration: number
  /** Number of errors */
  errors: number
  /** Last execution timestamp */
  lastExecuted: number
  /** Whether this query uses SSR cache */
  cached: boolean
}

export interface PageLoadMetrics {
  /** Page route */
  route: string
  /** Time to first byte (ms) */
  ttfb: number
  /** First contentful paint (ms) */
  fcp: number
  /** Largest contentful paint (ms) */
  lcp: number
  /** Time to interactive (ms) */
  tti: number
  /** Total page load time (ms) */
  loadTime: number
  /** Whether the page was server-side rendered */
  ssr: boolean
  /** Timestamp of the measurement */
  timestamp: number
}

export interface ErrorMetrics {
  /** Error type/category */
  type: string
  /** Error message */
  message: string
  /** Stack trace */
  stack?: string
  /** Number of occurrences */
  count: number
  /** First seen timestamp */
  firstSeen: number
  /** Last seen timestamp */
  lastSeen: number
  /** Affected users count */
  affectedUsers: number
}

export interface PerformanceMetrics {
  /** SSR cache metrics */
  cache: CacheMetrics
  /** Query performance metrics */
  queries: QueryMetrics[]
  /** Page load metrics */
  pageLoads: PageLoadMetrics[]
  /** Error metrics */
  errors: ErrorMetrics[]
  /** Overall performance score (0-100) */
  score: number
  /** Time range of the metrics */
  timeRange: {
    start: number
    end: number
  }
}

export interface PerformanceConfig {
  /** Enable cache tracking */
  enableCacheTracking?: boolean
  /** Enable query tracking */
  enableQueryTracking?: boolean
  /** Enable page load tracking */
  enablePageLoadTracking?: boolean
  /** Enable error tracking */
  enableErrorTracking?: boolean
  /** Sample rate (0-1) for tracking */
  sampleRate?: number
  /** Maximum number of metrics to store */
  maxMetrics?: number
}

export interface CacheHitEvent {
  queryKey: string
  duration: number
  timestamp: number
  cacheType: 'ssr' | 'client' | 'memory'
}

export interface CacheMissEvent {
  queryKey: string
  duration: number
  timestamp: number
  cacheType: 'ssr' | 'client' | 'memory'
  fetchDuration: number
}
