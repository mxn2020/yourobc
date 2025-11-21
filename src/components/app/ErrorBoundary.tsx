// components/App/ErrorBoundary.tsx

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Button, Card, Alert, AlertTitle, AlertDescription } from '@/components/ui'
import { AlertCircle } from 'lucide-react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ProjectErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Project error boundary caught an error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Card className="max-w-md w-full">
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Something went wrong</AlertTitle>
              <AlertDescription>
                An unexpected error occurred while loading the project. Please refresh the page or try again later.
              </AlertDescription>
            </Alert>
            <div className="flex space-x-3 px-6 pb-6">
              <Button
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </Button>
              <Button
                variant="ghost"
                onClick={() => this.setState({ hasError: false, error: undefined })}
              >
                Try Again
              </Button>
            </div>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}