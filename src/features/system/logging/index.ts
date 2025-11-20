// src/features/system/logging/index.ts
// Logging Feature - Public API

// Export singleton logger and helper
export { logger, createFeatureLogger } from './services/LoggingService'

// Export all types
export * from './types'

// Export config for advanced usage
export * from './config/logging-config'

// Export React components
export {
  SentryErrorBoundary,
  withErrorBoundary,
  SentryReactErrorBoundary,
  useShowErrorDialog,
  type SentryErrorBoundaryProps,
  type ErrorFallbackProps,
} from './components/SentryErrorBoundary'

export {
  SentryProfiler,
  withProfiler,
  SentryReactProfiler,
  useRenderTracking,
  useInteractionTracking,
  useMetricTracking,
  type SentryProfilerProps,
} from './components/SentryProfiler'

// Export performance tracking hooks
export {
  useTransaction,
  useApiTracking,
  useQueryTracking,
  useOperationTracking,
  useSpanTracking,
  useMeasureOperation,
  type UseTransactionOptions,
  type UseApiTrackingOptions,
} from './hooks/usePerformanceTracking'

// Export auth integration
export {
  initializeAuthLogging,
  setUserContext,
  clearUserContext,
  trackAuthError,
  trackAuthSuccess,
} from './integrations/auth-logger-integration'
