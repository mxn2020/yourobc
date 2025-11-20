// src/features/system/logging/components/SentryErrorBoundary.tsx

import React, { Component, ReactNode, ErrorInfo } from 'react'
import * as Sentry from '@sentry/react'
import { logger } from '../services/LoggingService'
import { BreadcrumbCategory, BreadcrumbLevel } from '../types/logging.types'

/**
 * Props for the error fallback component
 */
export interface ErrorFallbackProps {
  error: Error
  errorInfo: ErrorInfo
  resetError: () => void
}

/**
 * Props for SentryErrorBoundary
 */
export interface SentryErrorBoundaryProps {
  /**
   * Child components to render
   */
  children: ReactNode

  /**
   * Custom fallback component to render when an error occurs
   */
  fallback?: React.ComponentType<ErrorFallbackProps>

  /**
   * Callback when an error is caught
   */
  onError?: (error: Error, errorInfo: ErrorInfo) => void

  /**
   * Show Sentry user feedback dialog
   */
  showDialog?: boolean

  /**
   * Dialog options
   */
  dialogOptions?: Sentry.ReportDialogOptions

  /**
   * Additional context to send with error
   */
  errorContext?: Record<string, string | number | boolean>

  /**
   * Identifier for this boundary (helps with debugging)
   */
  boundaryName?: string
}

/**
 * State for SentryErrorBoundary
 */
interface SentryErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  eventId: string | null
}

/**
 * Default fallback component
 */
const DefaultFallback: React.FC<ErrorFallbackProps> = ({ error, errorInfo, resetError }) => {
  return (
    <div
      style={{
        padding: '2rem',
        maxWidth: '600px',
        margin: '2rem auto',
        borderRadius: '8px',
        backgroundColor: '#fee',
        border: '1px solid #fcc',
      }}
    >
      <h2 style={{ color: '#c00', marginTop: 0 }}>Something went wrong</h2>
      <p style={{ color: '#666' }}>
        We apologize for the inconvenience. An error has occurred and our team has been notified.
      </p>

      <details style={{ marginTop: '1rem', cursor: 'pointer' }}>
        <summary style={{ fontWeight: 'bold', color: '#333' }}>Error details</summary>
        <pre
          style={{
            marginTop: '1rem',
            padding: '1rem',
            backgroundColor: '#fff',
            borderRadius: '4px',
            overflow: 'auto',
            fontSize: '0.875rem',
            color: '#c00',
          }}
        >
          {error.toString()}
          {'\n\n'}
          {errorInfo.componentStack}
        </pre>
      </details>

      <button
        onClick={resetError}
        style={{
          marginTop: '1rem',
          padding: '0.5rem 1rem',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '1rem',
        }}
      >
        Try again
      </button>
    </div>
  )
}

/**
 * Sentry Error Boundary Component
 *
 * React error boundary that integrates with Sentry for error tracking.
 * Catches errors in child component tree and reports them to Sentry.
 *
 * @example
 * ```tsx
 * <SentryErrorBoundary
 *   boundaryName="MainApp"
 *   showDialog={true}
 *   fallback={CustomErrorFallback}
 * >
 *   <App />
 * </SentryErrorBoundary>
 * ```
 */
export class SentryErrorBoundary extends Component<
  SentryErrorBoundaryProps,
  SentryErrorBoundaryState
> {
  constructor(props: SentryErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<SentryErrorBoundaryState> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { boundaryName, errorContext, onError, showDialog, dialogOptions } = this.props

    // Add breadcrumb for error boundary catch
    logger.addBreadcrumb({
      message: `Error caught by ${boundaryName || 'ErrorBoundary'}`,
      level: BreadcrumbLevel.ERROR,
      category: BreadcrumbCategory.CUSTOM,
      data: {
        errorMessage: error.message,
        errorName: error.name,
        componentStack: errorInfo.componentStack?.substring(0, 200),
      },
    })

    // Capture exception with Sentry
    const eventId = Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
          errorBoundary: boundaryName || 'ErrorBoundary',
        },
      },
      tags: {
        errorBoundary: boundaryName || 'unknown',
      },
      extra: {
        ...errorContext,
        errorInfo,
      },
    })

    // Update state with eventId
    this.setState({
      errorInfo,
      eventId,
    })

    // Show user feedback dialog if requested
    if (showDialog && eventId) {
      Sentry.showReportDialog({
        eventId,
        ...dialogOptions,
      })
    }

    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo)
    }

    // Log to our logging service
    logger.error(
      `Error in ${boundaryName || 'ErrorBoundary'}: ${error.message}`,
      {
        errorType: error.name,
        errorCode: 'ERROR_BOUNDARY',
        module: boundaryName,
        extra: {
          componentStack: errorInfo.componentStack,
          eventId,
        },
      },
      error
    )
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
    })

    logger.addBreadcrumb({
      message: `Error boundary reset by user`,
      level: BreadcrumbLevel.INFO,
      category: BreadcrumbCategory.USER_ACTION,
    })
  }

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state
    const { children, fallback: FallbackComponent } = this.props

    if (hasError && error && errorInfo) {
      const Fallback = FallbackComponent || DefaultFallback

      return (
        <Fallback error={error} errorInfo={errorInfo} resetError={this.resetError} />
      )
    }

    return children
  }
}

/**
 * HOC to wrap a component with SentryErrorBoundary
 *
 * @example
 * ```tsx
 * const ProtectedApp = withErrorBoundary(App, {
 *   boundaryName: 'App',
 *   showDialog: true,
 * })
 * ```
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  boundaryProps?: Omit<SentryErrorBoundaryProps, 'children'>
): React.FC<P> {
  const WrappedComponent: React.FC<P> = (props) => (
    <SentryErrorBoundary {...boundaryProps}>
      <Component {...props} />
    </SentryErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name || 'Component'})`

  return WrappedComponent
}

/**
 * Export Sentry's built-in error boundary as an alternative
 * This is the official Sentry component with additional features
 */
export const SentryReactErrorBoundary = Sentry.ErrorBoundary

/**
 * Hook to manually show error dialog
 *
 * @example
 * ```tsx
 * const showErrorDialog = useShowErrorDialog()
 *
 * try {
 *   // some code
 * } catch (error) {
 *   const eventId = Sentry.captureException(error)
 *   showErrorDialog(eventId)
 * }
 * ```
 */
export function useShowErrorDialog() {
  return React.useCallback((eventId: string, options?: Sentry.ReportDialogOptions) => {
    Sentry.showReportDialog({
      eventId,
      ...options,
    })
  }, [])
}
