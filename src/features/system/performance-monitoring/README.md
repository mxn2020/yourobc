# Performance Monitoring Addon

A comprehensive performance monitoring solution for tracking SSR cache hit rates, query performance, page load metrics, and error tracking.

## Features

- **SSR Cache Tracking**: Monitor cache hit/miss rates for server-side rendered queries
- **Query Performance**: Track execution times, error rates, and optimization opportunities
- **Page Load Metrics**: Core Web Vitals (LCP, FCP, TTI, TTFB)
- **Error Tracking**: Centralized error monitoring with occurrence tracking
- **Real-time Dashboard**: Visual dashboard for monitoring performance metrics
- **Export Functionality**: Export metrics as JSON for analysis

## Installation

The performance monitoring addon is already integrated into the boilerplate. No additional installation required.

## Quick Start

### 1. Basic Usage

```typescript
import { PerformanceMonitor } from '@/features/boilerplate/performance-monitoring'

// Track a cache hit
PerformanceMonitor.trackCacheHit({
  queryKey: 'projects:list',
  duration: 45,
  timestamp: Date.now(),
  cacheType: 'ssr',
})

// Track a query execution
PerformanceMonitor.trackQuery(
  'projects:list',
  120, // duration in ms
  undefined, // error (if any)
  true // was cached
)

// Track an error
try {
  // some code
} catch (error) {
  PerformanceMonitor.trackError(error, 'custom-category')
}
```

### 2. React Hook

```typescript
import { usePerformanceMetrics } from '@/features/boilerplate/performance-monitoring'

function MyComponent() {
  const { metrics, isLoading, refresh } = usePerformanceMetrics({
    timeRange: 24 * 60 * 60 * 1000, // Last 24 hours
    autoRefresh: true,
    pollingInterval: 5000,
  })

  if (isLoading) return <div>Loading...</div>

  return (
    <div>
      <h2>Cache Hit Rate: {metrics.cache.hitRate.toFixed(1)}%</h2>
      <h2>Performance Score: {metrics.score}</h2>
    </div>
  )
}
```

### 3. Dashboard Component

```typescript
import { PerformanceDashboard } from '@/features/boilerplate/performance-monitoring'

function PerformancePage() {
  return (
    <div className="container mx-auto p-6">
      <PerformanceDashboard
        timeRange={24 * 60 * 60 * 1000}
        autoRefresh={true}
      />
    </div>
  )
}
```

### 4. Error Boundary

```typescript
import { ErrorBoundary } from '@/features/boilerplate/performance-monitoring/components/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <YourApp />
    </ErrorBoundary>
  )
}
```

## Integration with React Query

### Monitored Query Hook

Use `useMonitoredQuery` instead of `useQuery` to automatically track performance:

```typescript
import { useMonitoredQuery } from '@/features/boilerplate/performance-monitoring/integrations/useMonitoredQuery'

function useProjects() {
  return useMonitoredQuery({
    queryKey: ['projects', 'list'],
    queryFn: fetchProjects,
    staleTime: 30000,
  })
}
```

### Setup Global Monitoring

In your app initialization:

```typescript
import { setupPerformanceMonitoring } from '@/features/boilerplate/projects/integrations/performance-monitoring'
import { queryClient } from '@/lib/queryClient'

setupPerformanceMonitoring(queryClient)
```

## SSR Cache Tracking

### Track SSR Prefetch

```typescript
import { trackSSRPrefetch } from '@/features/boilerplate/projects/integrations/performance-monitoring'

// In your route loader
export const loader = async (context) => {
  await trackSSRPrefetch('projects:list', async () => {
    const data = await fetchProjects()
    context.queryClient.setQueryData(['projects', 'list'], data)
    return data
  })
}
```

### Manual Cache Tracking

```typescript
import { trackProjectQueryCache } from '@/features/boilerplate/projects/integrations/performance-monitoring'

// Track a cache hit
trackProjectQueryCache('projects:list', true, 25)

// Track a cache miss
trackProjectQueryCache('projects:list', false, 150)
```

## Configuration

Configure the performance monitor globally:

```typescript
import { PerformanceMonitor } from '@/features/boilerplate/performance-monitoring'

PerformanceMonitor.configure({
  enableCacheTracking: true,
  enableQueryTracking: true,
  enablePageLoadTracking: true,
  enableErrorTracking: true,
  sampleRate: 1, // 100% sampling (use 0.1 for 10% in production)
  maxMetrics: 1000,
})
```

## API Reference

### PerformanceMonitor

#### Methods

- `trackCacheHit(event: CacheHitEvent)` - Track a cache hit
- `trackCacheMiss(event: CacheMissEvent)` - Track a cache miss
- `trackQuery(queryKey, duration, error?, cached?)` - Track a query execution
- `trackPageLoad(metrics: PageLoadMetrics)` - Track page load performance
- `trackError(error: Error, type?)` - Track an error
- `getMetrics(timeRange?)` - Get all performance metrics
- `getCacheMetrics(timeRange?)` - Get cache-specific metrics
- `getQueryMetrics()` - Get query performance metrics
- `clear()` - Clear all metrics
- `exportMetrics()` - Export metrics as JSON string

### usePerformanceMetrics Hook

#### Options

```typescript
interface UsePerformanceMetricsOptions {
  timeRange?: number // Time range in milliseconds (default: 24 hours)
  pollingInterval?: number // Polling interval in ms (default: 5000)
  autoRefresh?: boolean // Enable auto-refresh (default: true)
}
```

#### Returns

```typescript
interface UsePerformanceMetricsResult {
  metrics: PerformanceMetrics | null
  isLoading: boolean
  error: Error | null
  refresh: () => void
  clearMetrics: () => void
  exportMetrics: () => string
}
```

## Metrics Types

### CacheMetrics

```typescript
interface CacheMetrics {
  totalRequests: number
  hits: number
  misses: number
  hitRate: number // Percentage (0-100)
  avgHitTime: number // Milliseconds
  avgMissTime: number // Milliseconds
}
```

### QueryMetrics

```typescript
interface QueryMetrics {
  queryKey: string
  executions: number
  avgDuration: number // Milliseconds
  minDuration: number
  maxDuration: number
  errors: number
  lastExecuted: number // Timestamp
  cached: boolean
}
```

### PerformanceMetrics

```typescript
interface PerformanceMetrics {
  cache: CacheMetrics
  queries: QueryMetrics[]
  pageLoads: PageLoadMetrics[]
  errors: ErrorMetrics[]
  score: number // Overall score (0-100)
  timeRange: { start: number; end: number }
}
```

## Best Practices

1. **Use Sampling in Production**: Set `sampleRate: 0.1` to reduce overhead
2. **Monitor SSR Cache**: Track all SSR prefetch operations for optimization
3. **Set Alerts**: Monitor performance score and cache hit rate thresholds
4. **Export Regularly**: Export metrics for long-term analysis
5. **Error Tracking**: Use ErrorBoundary to catch React errors automatically
6. **Query Monitoring**: Use `useMonitoredQuery` for critical queries

## Performance Impact

The performance monitor is designed to have minimal impact:

- Uses sampling to reduce overhead (configurable)
- Stores metrics in memory (bounded by `maxMetrics`)
- Asynchronous tracking operations
- No external dependencies

## Integration with Projects Feature

The projects feature demonstrates full integration:

1. SSR cache tracking in route loaders
2. Query performance monitoring via `useMonitoredQuery`
3. Error boundary for component errors
4. Global React Query integration for automatic tracking

See `src/features/boilerplate/projects/integrations/performance-monitoring.ts` for implementation details.

## Troubleshooting

### No metrics appearing

- Check that monitoring is enabled in configuration
- Verify `sampleRate` is greater than 0
- Ensure you're calling tracking methods correctly

### High memory usage

- Reduce `maxMetrics` configuration value
- Increase sampling rate (lower `sampleRate`)
- Clear metrics more frequently

### Inaccurate cache hit rates

- Verify SSR prefetch is being tracked
- Check that cache tracking is enabled
- Ensure query keys are consistent

## Future Enhancements

- [ ] Backend integration for persistent storage
- [ ] Real-time alerts and notifications
- [ ] Comparison with historical data
- [ ] Integration with APM tools (DataDog, New Relic)
- [ ] Custom metric types
- [ ] Performance budgets and thresholds
