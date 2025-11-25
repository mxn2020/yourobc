/**
 * Performance Monitoring Integration for Projects Feature
 *
 * This file demonstrates how to integrate performance monitoring
 * into the projects feature to track SSR cache hit rates and query performance
 */

import { PerformanceMonitor } from '@/features/boilerplate/performance-monitoring'
import type { QueryClient } from '@tanstack/react-query'

/**
 * Track SSR cache hits/misses for project queries
 */
export function trackProjectQueryCache(
  queryKey: string,
  wasHit: boolean,
  duration: number
) {
  if (wasHit) {
    PerformanceMonitor.trackCacheHit({
      queryKey,
      duration,
      timestamp: Date.now(),
      cacheType: 'ssr',
    })
  } else {
    PerformanceMonitor.trackCacheMiss({
      queryKey,
      duration: 0,
      timestamp: Date.now(),
      cacheType: 'ssr',
      fetchDuration: duration,
    })
  }
}

/**
 * Initialize performance monitoring for React Query
 */
export function setupPerformanceMonitoring(queryClient: QueryClient) {
  // Add global query cache listeners
  queryClient.getQueryCache().subscribe((event) => {
    if (event.type === 'updated' && event.query.state.data) {
      const queryKey = JSON.stringify(event.query.queryKey)
      const duration = event.query.state.dataUpdatedAt - (event.query.state.dataUpdatedAt - 100) // Approximate

      // Check if this was a cache hit or miss
      const wasHit = event.query.state.isFetching === false

      PerformanceMonitor.trackQuery(
        queryKey,
        duration,
        event.query.state.error instanceof Error ? event.query.state.error : undefined,
        wasHit
      )

      // Track cache metrics
      trackProjectQueryCache(queryKey, wasHit, duration)
    }

    if (event.type === 'updated' && event.query.state.error) {
      const error = event.query.state.error
      if (error instanceof Error) {
        PerformanceMonitor.trackError(error, 'query')
      }
    }
  })

  // Track mutation errors
  queryClient.getMutationCache().subscribe((event) => {
    if (event.type === 'updated' && event.mutation.state.error) {
      const error = event.mutation.state.error
      if (error instanceof Error) {
        PerformanceMonitor.trackError(error, 'mutation')
      }
    }
  })
}

/**
 * Example: Track SSR prefetch performance
 */
export async function trackSSRPrefetch<T>(
  queryKey: string,
  prefetchFn: () => Promise<T>
): Promise<T> {
  const startTime = performance.now()

  try {
    const result = await prefetchFn()
    const duration = performance.now() - startTime

    // This was a prefetch, so it's a cache miss but we're populating the cache
    PerformanceMonitor.trackCacheMiss({
      queryKey,
      duration: 0,
      timestamp: Date.now(),
      cacheType: 'ssr',
      fetchDuration: duration,
    })

    return result
  } catch (error) {
    if (error instanceof Error) {
      PerformanceMonitor.trackError(error, 'ssr-prefetch')
    }
    throw error
  }
}
