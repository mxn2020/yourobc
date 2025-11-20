// src/features/system/logging/integrations/auth-logger-integration.ts

import { logger } from '../services/LoggingService'
import { UserContext, BreadcrumbCategory, BreadcrumbLevel } from '../types/logging.types'
import { Id } from '@/convex/_generated/dataModel'

/**
 * Initialize auth logging integration
 *
 * NOTE: Better-Auth v1 doesn't provide global session change listeners.
 * Session tracking must be done manually in React components using:
 * - trackAuthSuccess() for successful auth actions (login, signup, etc.)
 * - trackAuthError() for auth failures
 * - setUserContext() to manually set user context after authentication
 * - clearUserContext() to clear user context on logout
 *
 * This function only logs that the integration is ready.
 */
export function initializeAuthLogging(): () => void {
  logger.info('Auth logging integration initialized (manual tracking mode)', {
    feature: 'logging',
    action: 'init_auth_integration',
    extra: {
      mode: 'manual',
      note: 'Use trackAuthSuccess/Error and setUserContext/clearUserContext for session tracking'
    }
  })

  // Return cleanup function
  return () => {
    logger.info('Auth logging integration cleaned up', {
      feature: 'logging',
      action: 'cleanup_auth_integration',
    })
  }
}

/**
 * Manually set user context (useful for testing or special cases)
 */
export function setUserContext(
  userId: Id<"userProfiles">,
  email?: string,
  additionalData?: Partial<Omit<UserContext, 'id' | 'email'>>
): void {
  const userContext: UserContext = {
    id: userId,
    email,
    ...additionalData,
  }

  logger.setUser(userContext)

  logger.addBreadcrumb({
    message: 'User context manually set',
    level: BreadcrumbLevel.DEBUG,
    category: BreadcrumbCategory.AUTH,
    data: {
      userId,
      email,
    },
  })
}

/**
 * Manually clear user context
 */
export function clearUserContext(): void {
  logger.clearUser()

  logger.addBreadcrumb({
    message: 'User context manually cleared',
    level: BreadcrumbLevel.DEBUG,
    category: BreadcrumbCategory.AUTH,
  })
}

/**
 * Track auth error
 */
export function trackAuthError(
  error: Error,
  context?: {
    action?: 'login' | 'logout' | 'signup' | 'password_reset' | 'email_verification'
    email?: string
    provider?: string
  }
): void {
  logger.error(`Auth error: ${error.message}`, {
    errorType: error.name,
    errorCode: 'AUTH_ERROR',
    feature: 'auth',
    action: context?.action || 'unknown',
    extra: {
      provider: context?.provider,
      email: context?.email,
    },
    tags: {
      auth_action: context?.action || 'unknown',
      auth_provider: context?.provider || 'unknown',
    },
  }, error)

  logger.addBreadcrumb({
    message: `Auth error: ${context?.action || 'unknown'}`,
    level: BreadcrumbLevel.ERROR,
    category: BreadcrumbCategory.AUTH,
    data: {
      action: context?.action,
      provider: context?.provider,
      errorMessage: error.message,
    },
  })
}

/**
 * Track successful auth action
 */
export function trackAuthSuccess(
  action: 'login' | 'logout' | 'signup' | 'password_reset' | 'email_verification',
  metadata?: {
    email?: string
    provider?: string
    userId?: string
  }
): void {
  logger.info(`Auth success: ${action}`, {
    feature: 'auth',
    action,
    extra: metadata,
    tags: {
      auth_action: action,
      auth_provider: metadata?.provider || 'unknown',
    },
  })

  logger.addBreadcrumb({
    message: `Auth success: ${action}`,
    level: BreadcrumbLevel.INFO,
    category: BreadcrumbCategory.AUTH,
    data: {
      action,
      ...metadata,
    },
  })
}
