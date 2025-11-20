// src/features/boilerplate/logging/components/SentryProfiler.tsx

import React, { ReactNode, Profiler as ReactProfiler, ProfilerOnRenderCallback } from 'react'
import * as Sentry from '@sentry/react'
import { logger } from '../services/LoggingService'
import { BreadcrumbCategory, BreadcrumbLevel } from '../types/logging.types'

/**
 * Props for SentryProfiler component
 */
export interface SentryProfilerProps {
  /**
   * Unique identifier for this profiler (used in Sentry transaction names)
   */
  name: string

  /**
   * Children to profile
   */
  children: ReactNode

  /**
   * Whether to include the profiler in development mode (default: true)
   */
  includeInDev?: boolean

  /**
   * Whether to log slow renders (default: true)
   */
  logSlowRenders?: boolean

  /**
   * Threshold in ms to consider a render slow (default: 100)
   */
  slowRenderThreshold?: number

  /**
   * Whether to add breadcrumbs for renders (default: false)
   */
  addBreadcrumbs?: boolean

  /**
   * Custom callback when render completes
   */
  onRender?: ProfilerOnRenderCallback

  /**
   * Additional tags to add to the transaction
   */
  tags?: Record<string, string>
}

/**
 * SentryProfiler Component
 *
 * Wraps React.Profiler with Sentry integration to track component
 * render performance and send data to Sentry.
 *
 * @example
 * ```tsx
 * <SentryProfiler
 *   name="Dashboard"
 *   logSlowRenders={true}
 *   slowRenderThreshold={200}
 * >
 *   <DashboardContent />
 * </SentryProfiler>
 * ```
 */
export const SentryProfiler: React.FC<SentryProfilerProps> = ({
  name,
  children,
  includeInDev = true,
  logSlowRenders = true,
  slowRenderThreshold = 100,
  addBreadcrumbs = false,
  onRender,
  tags,
}) => {
  // Skip profiling in development if not explicitly included
  if (import.meta.env.DEV && !includeInDev) {
    return <>{children}</>
  }

  const handleRender: ProfilerOnRenderCallback = (
    id,
    phase,
    actualDuration,
    baseDuration,
    startTime,
    commitTime
  ) => {
    // Add breadcrumb if enabled
    if (addBreadcrumbs) {
      logger.addBreadcrumb({
        message: `${name} ${phase}`,
        level: BreadcrumbLevel.DEBUG,
        category: BreadcrumbCategory.CUSTOM,
        data: {
          actualDuration: actualDuration.toFixed(2),
          baseDuration: baseDuration.toFixed(2),
          phase,
        },
      })
    }

    // Log slow renders
    if (logSlowRenders && actualDuration > slowRenderThreshold) {
      logger.warn(`Slow render detected: ${name}`, {
        feature: 'performance',
        action: 'slow_render',
        extra: {
          component: name,
          phase,
          actualDuration: actualDuration.toFixed(2),
          baseDuration: baseDuration.toFixed(2),
          threshold: slowRenderThreshold,
        },
        tags: {
          component: name,
          phase,
          ...tags,
        },
      })
    }

    // Send metrics to Sentry v10 (distribution metric)
    Sentry.metrics.distribution(
      'component.render.duration',
      actualDuration,
      {
        unit: 'millisecond',
      }
    )

    // Add tags separately (Sentry v10 doesn't accept tags in metric options)
    if (tags) {
      Object.entries(tags).forEach(([key, value]) => {
        Sentry.setTag(key, value)
      })
    }
    Sentry.setTag('component', name)
    Sentry.setTag('phase', phase)

    // Call custom callback if provided
    if (onRender) {
      onRender(id, phase, actualDuration, baseDuration, startTime, commitTime)
    }
  }

  return (
    <ReactProfiler id={name} onRender={handleRender}>
      {children}
    </ReactProfiler>
  )
}

/**
 * HOC to wrap a component with SentryProfiler
 *
 * @example
 * ```tsx
 * const ProfiledDashboard = withProfiler(Dashboard, {
 *   name: 'Dashboard',
 *   logSlowRenders: true,
 * })
 * ```
 */
export function withProfiler<P extends object>(
  Component: React.ComponentType<P>,
  profilerProps: Omit<SentryProfilerProps, 'children'>
): React.FC<P> {
  const WrappedComponent: React.FC<P> = (props) => (
    <SentryProfiler {...profilerProps}>
      <Component {...props} />
    </SentryProfiler>
  )

  WrappedComponent.displayName = `withProfiler(${Component.displayName || Component.name || 'Component'})`

  return WrappedComponent
}

/**
 * Hook to manually track component render metrics
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const trackRender = useRenderTracking('MyComponent')
 *
 *   useEffect(() => {
 *     const startTime = performance.now()
 *     // ... do expensive work
 *     trackRender(performance.now() - startTime)
 *   }, [])
 * }
 * ```
 */
export function useRenderTracking(componentName: string) {
  return React.useCallback(
    (duration: number, metadata?: Record<string, string | number>) => {
      // Sentry v10: metrics API without tags in options
      Sentry.metrics.distribution('component.operation.duration', duration, {
        unit: 'millisecond',
      })

      // Set tags separately
      Sentry.setTag('component', componentName)
      if (metadata) {
        Object.entries(metadata).forEach(([key, value]) => {
          Sentry.setTag(key, String(value))
        })
      }

      logger.addBreadcrumb({
        message: `${componentName} operation completed`,
        level: BreadcrumbLevel.DEBUG,
        category: BreadcrumbCategory.CUSTOM,
        data: {
          duration: duration.toFixed(2),
          ...metadata,
        },
      })
    },
    [componentName]
  )
}

/**
 * Hook to track interactions (clicks, form submits, etc.)
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const trackInteraction = useInteractionTracking()
 *
 *   const handleClick = () => {
 *     trackInteraction('button_click', { buttonId: 'submit' })
 *     // ... handle click
 *   }
 * }
 * ```
 */
export function useInteractionTracking() {
  return React.useCallback(
    (interactionName: string, metadata?: Record<string, string | number>) => {
      // Sentry v10: Use count() instead of increment()
      Sentry.metrics.count('user.interaction', 1)

      // Set tags separately
      Sentry.setTag('interaction', interactionName)
      if (metadata) {
        Object.entries(metadata).forEach(([key, value]) => {
          Sentry.setTag(key, String(value))
        })
      }

      logger.addBreadcrumb({
        message: `User interaction: ${interactionName}`,
        level: BreadcrumbLevel.INFO,
        category: BreadcrumbCategory.USER_ACTION,
        data: metadata,
      })
    },
    []
  )
}

/**
 * Hook to track custom metrics
 *
 * @example
 * ```tsx
 * function DataLoader() {
 *   const trackMetric = useMetricTracking()
 *
 *   useEffect(() => {
 *     fetchData().then(data => {
 *       trackMetric('data.items.count', data.length, { dataType: 'users' })
 *     })
 *   }, [])
 * }
 * ```
 */
export function useMetricTracking() {
  return React.useCallback(
    (
      metricName: string,
      value: number,
      metadata?: Record<string, string | number>,
      unit?: 'millisecond' | 'second' | 'byte' | 'none'
    ) => {
      // Sentry v10: gauge() without tags in options
      Sentry.metrics.gauge(metricName, value, {
        unit: unit || 'none',
      })

      // Set tags separately
      if (metadata) {
        Object.entries(metadata).forEach(([key, value]) => {
          Sentry.setTag(key, String(value))
        })
      }
    },
    []
  )
}

/**
 * Export Sentry's built-in Profiler as an alternative
 */
export const SentryReactProfiler = Sentry.Profiler
