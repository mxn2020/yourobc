/**
 * Error Boundary with Performance Monitoring
 *
 * Catches React errors and tracks them in the performance monitor
 */

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { PerformanceMonitor } from '../services/PerformanceMonitor'
import { Card, Button } from '@/components/ui'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Track error in performance monitor
    PerformanceMonitor.trackError(error, 'react')

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)

    // Update state with error info
    this.setState({
      errorInfo,
    })

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by ErrorBoundary:', error, errorInfo)
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <Card className="p-8 m-4">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
            <p className="text-gray-600 mb-6">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <Button onClick={this.handleReset}>Try Again</Button>

            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm font-semibold text-gray-700 mb-2">
                  Error Details (Development Only)
                </summary>
                <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto">
                  {this.state.error?.stack}
                  {'\n\n'}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </Card>
      )
    }

    return this.props.children
  }
}
