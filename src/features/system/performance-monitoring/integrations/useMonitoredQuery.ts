/**
 * React Query wrapper with performance monitoring
 *
 * Tracks cache hits, misses, and query performance
 */

import { useQuery, type UseQueryOptions, type UseQueryResult } from '@tanstack/react-query'
import { PerformanceMonitor } from '../services/PerformanceMonitor'
import { useEffect, useRef } from 'react'

export function useMonitoredQuery<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends readonly unknown[] = readonly unknown[]
>(
  options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>
): UseQueryResult<TData, TError> {
  const startTimeRef = useRef<number>(0)
  const queryKey = JSON.stringify(options.queryKey)

  // Start timing before query
  useEffect(() => {
    startTimeRef.current = performance.now()
  }, [queryKey])

  const result = useQuery(options)

  // Track query performance
  useEffect(() => {
    if (result.isSuccess || result.isError) {
      const duration = performance.now() - startTimeRef.current

      // Track query execution
      PerformanceMonitor.trackQuery(
        queryKey,
        duration,
        result.error instanceof Error ? result.error : undefined,
        result.isFetched && !result.isFetchedAfterMount // Was cached
      )

      // Track cache hit/miss
      if (result.isFetched && !result.isFetchedAfterMount) {
        // Cache hit (data was already in cache)
        PerformanceMonitor.trackCacheHit({
          queryKey,
          duration,
          timestamp: Date.now(),
          cacheType: 'client',
        })
      } else if (result.isFetchedAfterMount) {
        // Cache miss (data was fetched)
        PerformanceMonitor.trackCacheMiss({
          queryKey,
          duration: 0, // Time to check cache
          timestamp: Date.now(),
          cacheType: 'client',
          fetchDuration: duration,
        })
      }
    }
  }, [result.isSuccess, result.isError, queryKey, result.error, result.isFetched, result.isFetchedAfterMount])

  // Track errors
  useEffect(() => {
    if (result.error instanceof Error) {
      PerformanceMonitor.trackError(result.error, 'query')
    }
  }, [result.error])

  return result
}
