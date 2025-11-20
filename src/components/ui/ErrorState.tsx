// src/components/ui/ErrorState.tsx

import { FC } from 'react'
import { AlertCircle, RefreshCw, WifiOff, AlertTriangle, ShieldAlert } from 'lucide-react'
import { Button } from './Button'
import { Card, CardContent } from './Card'
import { Alert, AlertDescription, AlertTitle } from './Alert'
import { useTranslation } from '@/features/boilerplate/i18n'

export type ErrorType = 'auth' | 'permission' | 'network' | 'validation' | 'not_found' | 'unknown'

export interface ParsedError {
  type?: ErrorType
  message: string
  code?: string
  permission?: string
  module?: string
  action?: string
  details?: string
}

export interface ErrorStateProps {
  /**
   * Parsed error object from parseConvexError()
   */
  error: ParsedError

  /**
   * Callback for retry button
   */
  onRetry?: () => void

  /**
   * Custom action button
   */
  customAction?: {
    label: string
    onClick: () => void
  }

  /**
   * Show detailed error information
   */
  showDetails?: boolean

  /**
   * Compact mode (smaller, less padding)
   */
  compact?: boolean
}

/**
 * Generic Error State Component
 *
 * Displays different error states with appropriate icons, messages, and actions.
 * Handles permission, network, validation, and unknown errors.
 */
export const ErrorState: FC<ErrorStateProps> = ({
  error,
  onRetry,
  customAction,
  showDetails = false,
  compact = false,
}) => {
  const { t } = useTranslation('ui');

  // Determine error type from error object
  const errorType = error.type || (error.code === 'PERMISSION_DENIED' ? 'permission' : 'unknown')

  // Get appropriate icon based on error type
  const getIcon = () => {
    switch (errorType) {
      case 'auth':
        return <ShieldAlert className="w-12 h-12 text-purple-600" />
      case 'permission':
        return <ShieldAlert className="w-12 h-12 text-red-600" />
      case 'network':
        return <WifiOff className="w-12 h-12 text-orange-600" />
      case 'validation':
        return <AlertTriangle className="w-12 h-12 text-yellow-600" />
      case 'not_found':
        return <AlertCircle className="w-12 h-12 text-blue-600" />
      default:
        return <AlertCircle className="w-12 h-12 text-gray-600" />
    }
  }

  // Get appropriate title based on error type
  const getTitle = () => {
    switch (errorType) {
      case 'auth':
        return t('errorState.titles.sessionExpired')
      case 'permission':
        return t('errorState.titles.accessDenied')
      case 'network':
        return t('errorState.titles.connectionError')
      case 'validation':
        return t('errorState.titles.invalidData')
      case 'not_found':
        return t('errorState.titles.notFound')
      default:
        return t('errorState.titles.somethingWentWrong')
    }
  }

  // Get background color for icon
  const getIconBgColor = () => {
    switch (errorType) {
      case 'auth':
        return 'bg-purple-100'
      case 'permission':
        return 'bg-red-100'
      case 'network':
        return 'bg-orange-100'
      case 'validation':
        return 'bg-yellow-100'
      case 'not_found':
        return 'bg-blue-100'
      default:
        return 'bg-gray-100'
    }
  }

  const containerClass = compact
    ? 'flex items-center justify-center p-4'
    : 'flex items-center justify-center min-h-[400px] p-6'

  return (
    <div className={containerClass}>
      <Card className="max-w-md w-full">
        <CardContent className={compact ? 'pt-4' : 'pt-6'}>
          <div className="text-center space-y-4">
            {/* Icon */}
            <div className="flex justify-center">
              <div className={`rounded-full ${getIconBgColor()} p-3`}>
                {getIcon()}
              </div>
            </div>

            {/* Title & Message */}
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                {getTitle()}
              </h2>
              <p className="text-gray-600">
                {error.message}
              </p>
            </div>

            {/* Actionable Guidance */}
            {error.action && (
              <Alert variant="default" className="text-left">
                <AlertTitle>{t('errorState.whatToDo')}</AlertTitle>
                <AlertDescription>
                  <p className="text-sm text-gray-700">
                    {error.action}
                  </p>
                </AlertDescription>
              </Alert>
            )}

            {/* Technical Details (Optional) */}
            {showDetails && (error.code || error.details) && (
              <details className="text-left">
                <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                  {t('errorState.technicalDetails')}
                </summary>
                <div className="mt-2 p-3 bg-gray-50 rounded border border-gray-200">
                  {error.code && (
                    <p className="text-xs font-mono text-gray-600 mb-1">
                      {t('errorState.errorCode')} <span className="text-red-600">{error.code}</span>
                    </p>
                  )}
                  {error.permission && (
                    <p className="text-xs font-mono text-gray-600 mb-1">
                      {t('errorState.permission')} <span className="text-red-600">{error.permission}</span>
                    </p>
                  )}
                  {error.details && (
                    <p className="text-xs text-gray-600 mt-2">
                      {error.details}
                    </p>
                  )}
                </div>
              </details>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              {onRetry && errorType === 'network' && (
                <Button
                  onClick={onRetry}
                  className="flex-1"
                  variant="primary"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {t('errorState.retry')}
                </Button>
              )}

              {customAction && (
                <Button
                  onClick={customAction.onClick}
                  className="flex-1"
                  variant="primary"
                >
                  {customAction.label}
                </Button>
              )}

              <Button
                onClick={() => window.history.back()}
                variant="outline"
                className="flex-1"
              >
                {t('errorState.goBack')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
