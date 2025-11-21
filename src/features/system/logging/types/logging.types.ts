// src/features/boilerplate/logging/types/logging.types.ts

import { Id } from "@/generated/dataModel"
import type * as Sentry from '@sentry/react'

/**
 * Primitive types for type-safe logging
 */
export type Primitive = string | number | boolean | null | undefined

/**
 * JSON-compatible value types
 */
export type JSONValue =
  | Primitive
  | { [key: string]: JSONValue }
  | JSONValue[]

/**
 * Log severity levels
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}

/**
 * Breadcrumb severity levels (Sentry-compatible)
 */
export enum BreadcrumbLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  FATAL = 'fatal',
}

/**
 * Breadcrumb categories for better organization
 */
export enum BreadcrumbCategory {
  NAVIGATION = 'navigation',
  USER_ACTION = 'user',
  NETWORK = 'network',
  AUTH = 'auth',
  STATE_CHANGE = 'state',
  DATABASE = 'database',
  CUSTOM = 'custom',
}

/**
 * Transaction status types
 */
export enum TransactionStatus {
  OK = 'ok',
  CANCELLED = 'cancelled',
  UNKNOWN = 'unknown',
  UNKNOWN_ERROR = 'unknown_error',
  INVALID_ARGUMENT = 'invalid_argument',
  DEADLINE_EXCEEDED = 'deadline_exceeded',
  NOT_FOUND = 'not_found',
  ALREADY_EXISTS = 'already_exists',
  PERMISSION_DENIED = 'permission_denied',
  RESOURCE_EXHAUSTED = 'resource_exhausted',
  FAILED_PRECONDITION = 'failed_precondition',
  ABORTED = 'aborted',
  OUT_OF_RANGE = 'out_of_range',
  UNIMPLEMENTED = 'unimplemented',
  INTERNAL_ERROR = 'internal_error',
  UNAVAILABLE = 'unavailable',
  DATA_LOSS = 'data_loss',
  UNAUTHENTICATED = 'unauthenticated',
}

/**
 * Base context information for logging
 * All properties are explicitly defined for type safety
 */
export interface BaseLogContext {
  userId?: Id<"userProfiles">
  sessionId?: string
  feature?: string
  action?: string
  errorCode?: string
  errorType?: string
  permission?: string
  module?: string
  timestamp?: number
}

/**
 * Extended log context with additional structured data
 * Uses explicit types instead of 'any' for type safety
 * Includes index signature for compatibility with external logging providers (e.g., Sentry)
 */
export interface ExtendedLogContext extends BaseLogContext {
  /**
   * Tags for grouping and filtering (string values only)
   */
  tags?: Record<string, string>

  /**
   * Extra structured data (primitives and arrays only for JSON compatibility)
   */
  extra?: Record<string, Primitive | Primitive[]>

  /**
   * Index signature for Sentry compatibility
   * Allows Sentry to accept our context objects as extras
   */
  [key: string]: any
}

/**
 * Main log context type used throughout the application
 */
export type LogContext = ExtendedLogContext

/**
 * Breadcrumb for tracking user journey and debugging
 */
export interface Breadcrumb {
  message: string
  level?: BreadcrumbLevel
  category?: BreadcrumbCategory
  timestamp?: number
  data?: Record<string, Primitive>
}

/**
 * User context for tracking user information
 */
export interface UserContext {
  id: Id<"userProfiles">
  email?: string
  username?: string
  role?: string
  segment?: string
  ipAddress?: string
  subscription?: 'free' | 'pro' | 'enterprise' | string
  customData?: Record<string, Primitive>
}

/**
 * Structured log entry
 */
export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: Date
  context?: LogContext
  error?: Error
  stack?: string
}

/**
 * Performance transaction for monitoring
 */
export interface Transaction {
  readonly name: string
  readonly op: string
  readonly startTime: number
  setTag(key: string, value: string): void
  setData(key: string, value: JSONValue): void
  setStatus(status: TransactionStatus): void
  setHttpStatus(httpStatus: number): void
  finish(): void
}

/**
 * Performance span for detailed monitoring
 */
export interface Span {
  readonly description: string
  readonly op: string
  readonly startTime: number
  setTag(key: string, value: string): void
  setData(key: string, value: JSONValue): void
  setStatus(status: TransactionStatus): void
  finish(): void
}

/**
 * Logger provider interface
 * Implement this interface to create custom logging providers
 */
export interface LoggerProvider {
  /**
   * Provider name for identification
   */
  readonly name: string

  /**
   * Initialize the logger provider
   */
  initialize(): Promise<void> | void

  /**
   * Log a debug message
   */
  debug(message: string, context?: LogContext): void

  /**
   * Log an info message
   */
  info(message: string, context?: LogContext): void

  /**
   * Log a warning message
   */
  warn(message: string, context?: LogContext, error?: Error): void

  /**
   * Log an error message
   */
  error(message: string, context?: LogContext, error?: Error): void

  /**
   * Log a fatal error message
   */
  fatal(message: string, context?: LogContext, error?: Error): void

  /**
   * Add breadcrumb for debugging
   */
  addBreadcrumb(breadcrumb: Breadcrumb): void

  /**
   * Set user context with typed user data
   */
  setUser(user: UserContext): void

  /**
   * Clear user context
   */
  clearUser(): void

  /**
   * Capture exception with enhanced context
   */
  captureException(error: Error, context?: LogContext): void

  /**
   * Flush pending logs
   */
  flush(): Promise<void> | void

  /**
   * Set a tag for grouping/filtering
   */
  setTag(key: string, value: string): void

  /**
   * Set custom context
   */
  setContext(name: string, context: Record<string, JSONValue>): void

  /**
   * Set fingerprint for error grouping
   */
  setFingerprint(fingerprint: string[]): void

  /**
   * Start a performance transaction
   */
  startTransaction(name: string, op: string): Transaction

  /**
   * Start a performance span (child of transaction)
   */
  startSpan(transaction: Transaction, description: string, op: string): Span

  /**
   * Finish a transaction
   */
  finishTransaction(transaction: Transaction): void

  /**
   * Finish a span
   */
  finishSpan(span: Span): void
}

/**
 * Sentry-specific configuration
 */
export interface SentryConfig {
  dsn: string
  environment: string
  release?: string
  dist?: string

  /**
   * Sample rate for performance monitoring (0.0 to 1.0)
   */
  tracesSampleRate?: number

  /**
   * Sample rate for session replay on regular sessions (0.0 to 1.0)
   */
  replaysSessionSampleRate?: number

  /**
   * Sample rate for session replay on error sessions (0.0 to 1.0)
   */
  replaysOnErrorSampleRate?: number

  /**
   * Enable React profiler for component performance
   */
  profilesSampleRate?: number

  /**
   * Session replay configuration
   */
  replay?: {
    maskAllText?: boolean
    blockAllMedia?: boolean
    maskAllInputs?: boolean
    networkDetailAllowUrls?: string[]
    networkCaptureBodies?: boolean
  }

  /**
   * Callback to filter/modify events before sending
   */
  beforeSend?: (event: Sentry.Event, hint: Sentry.EventHint) => Sentry.Event | null

  /**
   * Callback to filter/modify breadcrumbs before adding
   */
  beforeBreadcrumb?: (breadcrumb: Sentry.Breadcrumb, hint?: Sentry.BreadcrumbHint) => Sentry.Breadcrumb | null

  /**
   * Error messages to ignore (regex patterns)
   */
  ignoreErrors?: (string | RegExp)[]

  /**
   * URLs allowed to report errors from
   */
  allowUrls?: (string | RegExp)[]

  /**
   * URLs to deny error reporting from
   */
  denyUrls?: (string | RegExp)[]

  /**
   * Enable debug mode
   */
  debug?: boolean

  /**
   * Maximum breadcrumbs to keep
   */
  maxBreadcrumbs?: number

  /**
   * Attach stack traces to messages
   */
  attachStacktrace?: boolean

  /**
   * Send default PII (Personally Identifiable Information)
   */
  sendDefaultPii?: boolean

  /**
   * Enable automatic session tracking
   */
  autoSessionTracking?: boolean
}

/**
 * Custom provider configuration
 */
export interface CustomProviderConfig {
  providerPath: string
  config?: Record<string, JSONValue>
}

/**
 * Logger configuration
 */
export interface LoggerConfig {
  /**
   * Provider to use
   */
  provider: 'console' | 'sentry' | 'custom'

  /**
   * Enable/disable logging globally
   */
  enabled: boolean

  /**
   * Minimum log level to capture
   */
  minLevel?: LogLevel

  /**
   * Sentry configuration (when provider is 'sentry')
   */
  sentry?: SentryConfig

  /**
   * Custom provider configuration (when provider is 'custom')
   */
  custom?: CustomProviderConfig
}

/**
 * Feature-specific logging configuration
 */
export interface FeatureLoggingConfig {
  [featureName: string]: boolean | {
    enabled: boolean
    minLevel?: LogLevel
  }
}

/**
 * Type guard to check if value is a Primitive
 */
export function isPrimitive(value: unknown): value is Primitive {
  return (
    value === null ||
    value === undefined ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  )
}

/**
 * Type guard to check if value is JSONValue
 */
export function isJSONValue(value: unknown): value is JSONValue {
  if (isPrimitive(value)) {
    return true
  }

  if (Array.isArray(value)) {
    return value.every(isJSONValue)
  }

  if (typeof value === 'object' && value !== null) {
    return Object.values(value).every(isJSONValue)
  }

  return false
}

/**
 * Type guard to check if error is Error instance
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error
}

/**
 * Convert LogLevel to Sentry severity
 */
export function logLevelToSentrySeverity(level: LogLevel): Sentry.SeverityLevel {
  const mapping: Record<LogLevel, Sentry.SeverityLevel> = {
    [LogLevel.DEBUG]: 'debug',
    [LogLevel.INFO]: 'info',
    [LogLevel.WARN]: 'warning',
    [LogLevel.ERROR]: 'error',
    [LogLevel.FATAL]: 'fatal',
  }
  return mapping[level]
}

/**
 * Convert BreadcrumbLevel to Sentry severity
 */
export function breadcrumbLevelToSentrySeverity(level: BreadcrumbLevel): Sentry.SeverityLevel {
  const mapping: Record<BreadcrumbLevel, Sentry.SeverityLevel> = {
    [BreadcrumbLevel.DEBUG]: 'debug',
    [BreadcrumbLevel.INFO]: 'info',
    [BreadcrumbLevel.WARNING]: 'warning',
    [BreadcrumbLevel.ERROR]: 'error',
    [BreadcrumbLevel.FATAL]: 'fatal',
  }
  return mapping[level]
}

/**
 * Convert HTTP status code to TransactionStatus
 */
export function httpStatusToTransactionStatus(statusCode: number): TransactionStatus {
  if (statusCode >= 200 && statusCode < 300) {
    return TransactionStatus.OK
  } else if (statusCode === 400) {
    return TransactionStatus.INVALID_ARGUMENT
  } else if (statusCode === 401) {
    return TransactionStatus.UNAUTHENTICATED
  } else if (statusCode === 403) {
    return TransactionStatus.PERMISSION_DENIED
  } else if (statusCode === 404) {
    return TransactionStatus.NOT_FOUND
  } else if (statusCode === 409) {
    return TransactionStatus.ALREADY_EXISTS
  } else if (statusCode === 429) {
    return TransactionStatus.RESOURCE_EXHAUSTED
  } else if (statusCode === 499) {
    return TransactionStatus.CANCELLED
  } else if (statusCode >= 500 && statusCode < 600) {
    return TransactionStatus.INTERNAL_ERROR
  } else if (statusCode === 501) {
    return TransactionStatus.UNIMPLEMENTED
  } else if (statusCode === 503) {
    return TransactionStatus.UNAVAILABLE
  } else if (statusCode === 504) {
    return TransactionStatus.DEADLINE_EXCEEDED
  }

  return TransactionStatus.UNKNOWN_ERROR
}
