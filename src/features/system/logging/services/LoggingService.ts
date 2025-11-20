// src/features/boilerplate/logging/services/LoggingService.ts

import {
  LoggerProvider,
  LogLevel,
  LogContext,
  Breadcrumb,
  UserContext,
  Transaction,
  Span,
  JSONValue,
} from '../types/logging.types'
import { loggerConfig, featureLogging } from '../config/logging-config'
import { ConsoleLogger } from '../providers/console/ConsoleLogger'
import { SentryLogger } from '../providers/sentry/SentryLogger'
import { CustomLogger } from '../providers/custom/CustomLogger'

/**
 * Centralized Logging Service
 *
 * This service acts as a facade for different logging providers.
 * It provides a unified interface for logging throughout the application.
 *
 * Usage:
 * ```typescript
 * import { logger } from '@/features/boilerplate/logging'
 *
 * // Simple logging
 * logger.info('User logged in')
 * logger.error('Failed to fetch data', { userId: '123' }, error)
 *
 * // With context
 * logger.error('Payment failed', {
 *   feature: 'payments',
 *   action: 'create_checkout',
 *   userId: user.id,
 *   amount: 1000,
 * }, error)
 *
 * // Add breadcrumbs for debugging
 * logger.addBreadcrumb('User clicked submit button')
 *
 * // Set user context
 * logger.setUser(user.id, { email: user.email })
 * ```
 */
class LoggingService {
  private provider: LoggerProvider | null = null
  private initialized = false

  /**
   * Initialize the logging service
   * Call this once at app startup
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      console.warn('LoggingService already initialized')
      return
    }

    if (!loggerConfig.enabled) {
      console.log('Logging is disabled')
      return
    }

    try {
      // Select provider based on configuration
      switch (loggerConfig.provider) {
        case 'console':
          this.provider = new ConsoleLogger()
          break
        case 'sentry':
          this.provider = new SentryLogger()
          break
        case 'custom':
          this.provider = new CustomLogger()
          break
        default:
          console.error(`Unknown logger provider: ${loggerConfig.provider}`)
          this.provider = new ConsoleLogger()
      }

      if (this.provider) {
        await this.provider.initialize()
        this.initialized = true
        console.log(`✅ LoggingService initialized with provider: ${this.provider.name}`)
      }
    } catch (error) {
      console.error('Failed to initialize LoggingService:', error)
      // Fallback to console logger
      this.provider = new ConsoleLogger()
      await this.provider.initialize()
      this.initialized = true
    }
  }

  /**
   * Check if a log should be captured based on minimum level
   */
  private shouldLog(level: LogLevel): boolean {
    if (!loggerConfig.enabled || !this.provider) return false

    if (!loggerConfig.minLevel) return true

    const levelOrder = {
      [LogLevel.DEBUG]: 0,
      [LogLevel.INFO]: 1,
      [LogLevel.WARN]: 2,
      [LogLevel.ERROR]: 3,
      [LogLevel.FATAL]: 4,
    }

    return levelOrder[level] >= levelOrder[loggerConfig.minLevel]
  }

  /**
   * Check if logging is enabled for a specific feature
   */
  private isFeatureEnabled(feature?: string): boolean {
    if (!feature) return true
    const featureConfig = featureLogging[feature as keyof typeof featureLogging]
    // Handle both boolean and object configs
    if (typeof featureConfig === 'boolean') {
      return featureConfig
    } else if (typeof featureConfig === 'object' && featureConfig !== null) {
      return featureConfig.enabled ?? true
    }
    return true
  }

  /**
   * Log a debug message
   */
  debug(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return
    if (!this.isFeatureEnabled(context?.feature)) return
    this.provider?.debug(message, context)
  }

  /**
   * Log an info message
   */
  info(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.INFO)) return
    if (!this.isFeatureEnabled(context?.feature)) return
    this.provider?.info(message, context)
  }

  /**
   * Log a warning message
   */
  warn(message: string, context?: LogContext, error?: Error): void {
    if (!this.shouldLog(LogLevel.WARN)) return
    if (!this.isFeatureEnabled(context?.feature)) return
    this.provider?.warn(message, context, error)
  }

  /**
   * Log an error message
   */
  error(message: string, context?: LogContext, error?: Error): void {
    if (!this.shouldLog(LogLevel.ERROR)) return
    if (!this.isFeatureEnabled(context?.feature)) return
    this.provider?.error(message, context, error)
  }

  /**
   * Log a fatal error message
   */
  fatal(message: string, context?: LogContext, error?: Error): void {
    if (!this.shouldLog(LogLevel.FATAL)) return
    if (!this.isFeatureEnabled(context?.feature)) return
    this.provider?.fatal(message, context, error)
  }

  /**
   * Add a breadcrumb for debugging (type-safe)
   */
  addBreadcrumb(breadcrumb: Breadcrumb): void {
    if (!loggerConfig.enabled || !this.provider) return
    this.provider.addBreadcrumb(breadcrumb)
  }

  /**
   * Set user context for all logs (type-safe)
   */
  setUser(user: UserContext): void {
    if (!loggerConfig.enabled || !this.provider) return
    this.provider.setUser(user)
  }

  /**
   * Clear user context
   */
  clearUser(): void {
    if (!loggerConfig.enabled || !this.provider) return
    this.provider.clearUser()
  }

  /**
   * Capture an exception with enhanced context
   */
  captureException(error: Error, context?: LogContext): void {
    if (!loggerConfig.enabled || !this.provider) return
    if (!this.isFeatureEnabled(context?.feature)) return
    this.provider.captureException(error, context)
  }

  /**
   * Flush pending logs
   * Useful before page unload or app termination
   */
  async flush(): Promise<void> {
    if (!this.provider) return
    await this.provider.flush()
  }

  /**
   * Set a tag for grouping/filtering
   */
  setTag(key: string, value: string): void {
    if (!loggerConfig.enabled || !this.provider) return
    this.provider.setTag(key, value)
  }

  /**
   * Set custom context
   */
  setContext(name: string, context: Record<string, JSONValue>): void {
    if (!loggerConfig.enabled || !this.provider) return
    this.provider.setContext(name, context)
  }

  /**
   * Set fingerprint for error grouping
   */
  setFingerprint(fingerprint: string[]): void {
    if (!loggerConfig.enabled || !this.provider) return
    this.provider.setFingerprint(fingerprint)
  }

  /**
   * Start a performance transaction
   */
  startTransaction(name: string, op: string): Transaction {
    if (!this.provider) {
      throw new Error('Logger not initialized')
    }
    return this.provider.startTransaction(name, op)
  }

  /**
   * Start a performance span (child of transaction)
   */
  startSpan(transaction: Transaction, description: string, op: string): Span {
    if (!this.provider) {
      throw new Error('Logger not initialized')
    }
    return this.provider.startSpan(transaction, description, op)
  }

  /**
   * Finish a transaction
   */
  finishTransaction(transaction: Transaction): void {
    if (!this.provider) return
    this.provider.finishTransaction(transaction)
  }

  /**
   * Finish a span
   */
  finishSpan(span: Span): void {
    if (!this.provider) return
    this.provider.finishSpan(span)
  }

  /**
   * Get current provider name
   */
  getProviderName(): string {
    return this.provider?.name || 'none'
  }

  /**
   * Check if service is initialized
   */
  isInitialized(): boolean {
    return this.initialized
  }
}

// Export singleton instance
export const logger = new LoggingService()

// Auto-initialize in browser environment
if (typeof window !== 'undefined') {
  logger.initialize().catch(console.error)

  // Auto-initialize auth logging integration if enabled
  if (loggerConfig.enabled && loggerConfig.provider !== 'console') {
    // Dynamically import to avoid circular dependencies
    import('../integrations/auth-logger-integration')
      .then(({ initializeAuthLogging }) => {
        initializeAuthLogging()
      })
      .catch((error) => {
        console.error('Failed to initialize auth logging integration:', error)
      })
  }
}

/**
 * Convenience method to create feature-specific logger
 * Automatically adds feature context to all logs
 */
export function createFeatureLogger(featureName: string) {
  return {
    debug: (message: string, context?: LogContext) =>
      logger.debug(message, { ...context, feature: featureName }),
    info: (message: string, context?: LogContext) =>
      logger.info(message, { ...context, feature: featureName }),
    warn: (message: string, context?: LogContext, error?: Error) =>
      logger.warn(message, { ...context, feature: featureName }, error),
    error: (message: string, context?: LogContext, error?: Error) =>
      logger.error(message, { ...context, feature: featureName }, error),
    fatal: (message: string, context?: LogContext, error?: Error) =>
      logger.fatal(message, { ...context, feature: featureName }, error),
    addBreadcrumb: (breadcrumb: Breadcrumb) =>
      logger.addBreadcrumb({ ...breadcrumb, message: `[${featureName}] ${breadcrumb.message}` }),
    captureException: (error: Error, context?: LogContext) =>
      logger.captureException(error, { ...context, feature: featureName }),
  }
}
