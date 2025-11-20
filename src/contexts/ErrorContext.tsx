// src/contexts/ErrorContext.tsx

import React, { createContext, useContext, useCallback, useState, useEffect } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { parseConvexError, ParsedError } from '../utils/errorHandling'
import { logger, createFeatureLogger } from '@/features/system/logging'
import { BreadcrumbCategory, BreadcrumbLevel } from '@/features/system/logging/types/logging.types'
import { defaultLocale } from '@/features/system/i18n'
import { useToast } from '@/features/system/notifications'

const errorLogger = createFeatureLogger('errors')

/**
 * Error Context for global error handling
 *
 * This context provides:
 * - Automatic toast notifications for errors
 * - Error logging to the logging service
 * - Authentication error handling with redirect
 * - Permission error handling with modal
 */

interface ErrorContextType {
  /**
   * Handle an error globally
   * - Shows toast notification
   * - Logs to logging service
   * - Handles auth redirects
   * - Opens permission modal if needed
   */
  handleError: (error: any, context?: { feature?: string; action?: string }) => ParsedError

  /**
   * Last error that occurred
   */
  lastError: ParsedError | null

  /**
   * Clear the last error
   */
  clearError: () => void

  /**
   * Permission error state (for modal)
   */
  permissionError: ParsedError | null

  /**
   * Close permission modal
   */
  closePermissionModal: () => void
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined)

/**
 * Error Provider Component
 * Wrap your app with this to enable global error handling
 */
export function ErrorProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const params = useParams({ strict: false });
  const locale = (params as any).locale;
  const currentLocale = locale || defaultLocale;
  const toast = useToast()
  const [lastError, setLastError] = useState<ParsedError | null>(null)
  const [permissionError, setPermissionError] = useState<ParsedError | null>(null)

  /**
   * Handle error globally
   */
  const handleError = useCallback(
    (error: any, context?: { feature?: string; action?: string }) => {
      // Parse the error
      const parsedError = parseConvexError(error)

      // Store as last error
      setLastError(parsedError)

      // Log to logging service
      errorLogger.error(parsedError.message, {
        ...context,
        errorCode: parsedError.code,
        errorType: parsedError.type,
        permission: parsedError.permission,
        module: parsedError.module,
      }, error)

      // Add breadcrumb for debugging (type-safe)
      errorLogger.addBreadcrumb({
        message: `Error occurred: ${parsedError.message}`,
        level: BreadcrumbLevel.ERROR,
        category: BreadcrumbCategory.CUSTOM,
        data: {
          code: parsedError.code,
          type: parsedError.type,
          feature: context?.feature,
          action: context?.action,
        },
      })

      // Handle authentication errors - redirect to login
      if (parsedError.shouldRedirectToLogin) {
        toast.error(parsedError.message, '🔒 Authentication Required')

        // Save current path for redirect after login
        const currentPath = window.location.pathname + window.location.search
        if (currentPath !== '/auth/login') {
          sessionStorage.setItem('redirectAfterLogin', currentPath)
        }

        // Redirect to login after short delay
        setTimeout(() => {
          navigate({
            to: '/{-$locale}/auth/login',
            params: { locale: currentLocale === defaultLocale ? undefined : currentLocale },
            search: { redirect: undefined, email: undefined }
          })
        }, 1500)

        return parsedError
      }

      // Handle permission errors - show modal
      if (parsedError.type === 'permission') {
        setPermissionError(parsedError)
        toast.error(parsedError.message, '🚫 Permission Denied')
        return parsedError
      }

      // Handle validation errors
      if (parsedError.type === 'validation') {
        toast.warning(parsedError.message, '⚠️ Validation Error')
        return parsedError
      }

      // Handle not found errors
      if (parsedError.type === 'not_found') {
        toast.error(parsedError.message, '🔍 Not Found')
        return parsedError
      }

      // Handle network errors
      if (parsedError.type === 'network') {
        toast.error(parsedError.message, '📡 Network Error')
        return parsedError
      }

      // Generic error
      toast.error(parsedError.message, '❌ Error')

      return parsedError
    },
    [navigate]
  )

  /**
   * Clear last error
   */
  const clearError = useCallback(() => {
    setLastError(null)
  }, [])

  /**
   * Close permission modal
   */
  const closePermissionModal = useCallback(() => {
    setPermissionError(null)
  }, [])

  const value: ErrorContextType = {
    handleError,
    lastError,
    clearError,
    permissionError,
    closePermissionModal,
  }

  return <ErrorContext.Provider value={value}>{children}</ErrorContext.Provider>
}

/**
 * Hook to use error context
 *
 * @example
 * ```tsx
 * const { handleError } = useErrorContext()
 *
 * try {
 *   await createProject(data)
 *   toast.success('Project created!')
 * } catch (error) {
 *   handleError(error, { feature: 'projects', action: 'create' })
 * }
 * ```
 */
export function useErrorContext() {
  const context = useContext(ErrorContext)
  if (context === undefined) {
    throw new Error('useErrorContext must be used within an ErrorProvider')
  }
  return context
}

/**
 * Hook to automatically handle query/mutation errors
 * Use this with React Query's onError callback
 *
 * @example
 * ```tsx
 * const { mutate } = useMutation({
 *   mutationFn: createProject,
 *   onError: useErrorHandler('projects', 'create'),
 *   onSuccess: () => toast.success('Project created!'),
 * })
 * ```
 */
export function useErrorHandler(feature: string, action?: string) {
  const { handleError } = useErrorContext()

  return useCallback(
    (error: any) => {
      handleError(error, { feature, action })
    },
    [handleError, feature, action]
  )
}
