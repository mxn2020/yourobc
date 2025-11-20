// src/features/boilerplate/logging/providers/sentry/SentryLogger.ts

import * as Sentry from '@sentry/react'
import {
  LoggerProvider,
  LogLevel,
  LogContext,
  Breadcrumb,
  UserContext,
  Transaction,
  Span,
  TransactionStatus,
  JSONValue,
  logLevelToSentrySeverity,
  breadcrumbLevelToSentrySeverity,
  httpStatusToTransactionStatus,
} from '../../types/logging.types'
import { loggerConfig } from '../../config/logging-config'

/**
 * Sentry v10 transaction wrapper
 * In v10, transactions are managed through the startSpan API
 */
class SentryTransactionWrapper implements Transaction {
  private span: Sentry.Span | null = null
  private _name: string
  private _op: string
  private _startTime: number

  constructor(name: string, op: string, span: Sentry.Span | null) {
    this._name = name
    this._op = op
    this._startTime = Date.now()
    this.span = span
  }

  get name(): string {
    return this._name
  }

  get op(): string {
    return this._op
  }

  get startTime(): number {
    return this._startTime
  }

  setTag(key: string, value: string): void {
    if (this.span) {
      this.span.setAttribute(key, value)
    }
  }

  setData(key: string, value: JSONValue): void {
    if (this.span) {
      this.span.setAttribute(key, value as string | number | boolean)
    }
  }

  setStatus(status: TransactionStatus): void {
    if (this.span) {
      // Sentry v10 uses string literals for status
      const statusMap: Record<string, string> = {
        [TransactionStatus.OK]: 'ok',
        [TransactionStatus.CANCELLED]: 'cancelled',
        [TransactionStatus.UNKNOWN]: 'unknown_error',
        [TransactionStatus.UNKNOWN_ERROR]: 'unknown_error',
        [TransactionStatus.INVALID_ARGUMENT]: 'invalid_argument',
        [TransactionStatus.DEADLINE_EXCEEDED]: 'deadline_exceeded',
        [TransactionStatus.NOT_FOUND]: 'not_found',
        [TransactionStatus.ALREADY_EXISTS]: 'already_exists',
        [TransactionStatus.PERMISSION_DENIED]: 'permission_denied',
        [TransactionStatus.RESOURCE_EXHAUSTED]: 'resource_exhausted',
        [TransactionStatus.FAILED_PRECONDITION]: 'failed_precondition',
        [TransactionStatus.ABORTED]: 'aborted',
        [TransactionStatus.OUT_OF_RANGE]: 'out_of_range',
        [TransactionStatus.UNIMPLEMENTED]: 'unimplemented',
        [TransactionStatus.INTERNAL_ERROR]: 'internal_error',
        [TransactionStatus.UNAVAILABLE]: 'unavailable',
        [TransactionStatus.DATA_LOSS]: 'data_loss',
        [TransactionStatus.UNAUTHENTICATED]: 'unauthenticated',
      }
      this.span.setStatus({ code: 2, message: statusMap[status] || 'unknown_error' })
    }
  }

  setHttpStatus(httpStatus: number): void {
    if (this.span) {
      this.span.setAttribute('http.status_code', httpStatus)
      this.setStatus(httpStatusToTransactionStatus(httpStatus))
    }
  }

  finish(): void {
    if (this.span) {
      this.span.end()
    }
  }
}

/**
 * Sentry v10 span wrapper
 */
class SentrySpanWrapper implements Span {
  private span: Sentry.Span | null = null
  private _description: string
  private _op: string
  private _startTime: number

  constructor(description: string, op: string, span: Sentry.Span | null) {
    this._description = description
    this._op = op
    this._startTime = Date.now()
    this.span = span
  }

  get description(): string {
    return this._description
  }

  get op(): string {
    return this._op
  }

  get startTime(): number {
    return this._startTime
  }

  setTag(key: string, value: string): void {
    if (this.span) {
      this.span.setAttribute(key, value)
    }
  }

  setData(key: string, value: JSONValue): void {
    if (this.span) {
      this.span.setAttribute(key, value as string | number | boolean)
    }
  }

  setStatus(status: TransactionStatus): void {
    if (this.span) {
      const statusMap: Record<string, string> = {
        [TransactionStatus.OK]: 'ok',
        [TransactionStatus.CANCELLED]: 'cancelled',
        [TransactionStatus.UNKNOWN]: 'unknown_error',
        [TransactionStatus.UNKNOWN_ERROR]: 'unknown_error',
        [TransactionStatus.INVALID_ARGUMENT]: 'invalid_argument',
        [TransactionStatus.DEADLINE_EXCEEDED]: 'deadline_exceeded',
        [TransactionStatus.NOT_FOUND]: 'not_found',
        [TransactionStatus.ALREADY_EXISTS]: 'already_exists',
        [TransactionStatus.PERMISSION_DENIED]: 'permission_denied',
        [TransactionStatus.RESOURCE_EXHAUSTED]: 'resource_exhausted',
        [TransactionStatus.FAILED_PRECONDITION]: 'failed_precondition',
        [TransactionStatus.ABORTED]: 'aborted',
        [TransactionStatus.OUT_OF_RANGE]: 'out_of_range',
        [TransactionStatus.UNIMPLEMENTED]: 'unimplemented',
        [TransactionStatus.INTERNAL_ERROR]: 'internal_error',
        [TransactionStatus.UNAVAILABLE]: 'unavailable',
        [TransactionStatus.DATA_LOSS]: 'data_loss',
        [TransactionStatus.UNAUTHENTICATED]: 'unauthenticated',
      }
      this.span.setStatus({ code: 2, message: statusMap[status] || 'unknown_error' })
    }
  }

  finish(): void {
    if (this.span) {
      this.span.end()
    }
  }
}

/**
 * Sentry Logger Provider
 * Production-ready Sentry v10 integration with full error tracking,
 * performance monitoring, session replay, and React profiling
 */
export class SentryLogger implements LoggerProvider {
  readonly name = 'sentry'
  private initialized = false
  private activeTransactions = new Map<string, SentryTransactionWrapper>()

  async initialize(): Promise<void> {
    if (this.initialized) {
      return
    }

    const config = loggerConfig.sentry

    if (!config?.dsn) {
      console.warn(
        '⚠️ SentryLogger: No DSN provided. Set VITE_SENTRY_DSN environment variable.'
      )
      return
    }

    try {
      const integrations: any[] = []

      // Browser tracing for performance monitoring
      if (config.tracesSampleRate && config.tracesSampleRate > 0) {
        integrations.push(
          Sentry.browserTracingIntegration({
            enableInp: true,
          })
        )
      }

      // Session replay
      if (
        (config.replaysSessionSampleRate && config.replaysSessionSampleRate > 0) ||
        (config.replaysOnErrorSampleRate && config.replaysOnErrorSampleRate > 0)
      ) {
        integrations.push(
          Sentry.replayIntegration({
            maskAllText: config.replay?.maskAllText ?? false,
            blockAllMedia: config.replay?.blockAllMedia ?? false,
            maskAllInputs: config.replay?.maskAllInputs ?? true,
            networkDetailAllowUrls: config.replay?.networkDetailAllowUrls ?? [
              typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
            ],
            networkCaptureBodies: config.replay?.networkCaptureBodies ?? true,
          })
        )
      }

      Sentry.init({
        dsn: config.dsn,
        environment: config.environment,
        release: config.release,
        dist: config.dist,

        // Integrations
        integrations,

        // Performance monitoring
        tracesSampleRate: config.tracesSampleRate ?? 1.0,
        profilesSampleRate: config.profilesSampleRate ?? 0.0,

        // Session replay
        replaysSessionSampleRate: config.replaysSessionSampleRate ?? 0.1,
        replaysOnErrorSampleRate: config.replaysOnErrorSampleRate ?? 1.0,

        // Error filtering
        ignoreErrors: config.ignoreErrors,
        allowUrls: config.allowUrls,
        denyUrls: config.denyUrls,

        // Configuration
        debug: config.debug ?? false,
        maxBreadcrumbs: config.maxBreadcrumbs ?? 100,
        attachStacktrace: config.attachStacktrace ?? true,
        sendDefaultPii: config.sendDefaultPii ?? false,
        // Note: autoSessionTracking removed in Sentry v10

        // Hooks
        beforeSend: config.beforeSend as any,
        beforeBreadcrumb: config.beforeBreadcrumb,

        // Transport options
        transport: Sentry.makeFetchTransport,
        stackParser: Sentry.defaultStackParser,
      })

      this.initialized = true
      console.log('🚀 SentryLogger initialized', {
        environment: config.environment,
        release: config.release,
        tracesSampleRate: config.tracesSampleRate,
        replaysSessionSampleRate: config.replaysSessionSampleRate,
      })
    } catch (error) {
      console.error('❌ Failed to initialize SentryLogger:', error)
      throw error
    }
  }

  debug(message: string, context?: LogContext): void {
    // Sentry doesn't capture debug logs by default
    // Use console for debug in development
    if (import.meta.env.DEV) {
      console.debug(message, context)
    }
  }

  info(message: string, context?: LogContext): void {
    Sentry.captureMessage(message, {
      level: 'info',
      extra: context,
      tags: context?.tags,
    })
  }

  warn(message: string, context?: LogContext, error?: Error): void {
    if (error) {
      Sentry.captureException(error, {
        level: 'warning',
        extra: context,
        tags: context?.tags,
      })
    } else {
      Sentry.captureMessage(message, {
        level: 'warning',
        extra: context,
        tags: context?.tags,
      })
    }
  }

  error(message: string, context?: LogContext, error?: Error): void {
    if (error) {
      Sentry.captureException(error, {
        level: 'error',
        extra: context,
        tags: context?.tags,
      })
    } else {
      Sentry.captureMessage(message, {
        level: 'error',
        extra: context,
        tags: context?.tags,
      })
    }
  }

  fatal(message: string, context?: LogContext, error?: Error): void {
    if (error) {
      Sentry.captureException(error, {
        level: 'fatal',
        extra: context,
        tags: context?.tags,
      })
    } else {
      Sentry.captureMessage(message, {
        level: 'fatal',
        extra: context,
        tags: context?.tags,
      })
    }

    // For fatal errors, flush immediately
    void this.flush()
  }

  addBreadcrumb(breadcrumb: Breadcrumb): void {
    Sentry.addBreadcrumb({
      message: breadcrumb.message,
      level: breadcrumb.level
        ? breadcrumbLevelToSentrySeverity(breadcrumb.level)
        : 'info',
      category: breadcrumb.category,
      timestamp: breadcrumb.timestamp ? breadcrumb.timestamp / 1000 : undefined,
      data: breadcrumb.data as Record<string, unknown>,
    })
  }

  setUser(user: UserContext): void {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      segment: user.segment,
      ip_address: user.ipAddress,
      subscription: user.subscription,
      ...user.customData,
    })
  }

  clearUser(): void {
    Sentry.setUser(null)
  }

  captureException(error: Error, context?: LogContext): void {
    Sentry.captureException(error, {
      extra: context,
      tags: context?.tags,
    })
  }

  async flush(): Promise<void> {
    try {
      await Sentry.flush(2000)
    } catch (error) {
      console.error('Failed to flush Sentry events:', error)
    }
  }

  setTag(key: string, value: string): void {
    Sentry.setTag(key, value)
  }

  setContext(name: string, context: Record<string, JSONValue>): void {
    Sentry.setContext(name, context as Record<string, unknown>)
  }

  setFingerprint(fingerprint: string[]): void {
    Sentry.getCurrentScope().setFingerprint(fingerprint)
  }

  startTransaction(name: string, op: string): Transaction {
    // Sentry v10: Use startSpan with isTransaction flag
    let wrapper: SentryTransactionWrapper | null = null

    Sentry.startSpan(
      {
        name,
        op,
        forceTransaction: true,
      },
      (span) => {
        wrapper = new SentryTransactionWrapper(name, op, span)
        this.activeTransactions.set(name, wrapper)
      }
    )

    // Return the wrapper (it will be created synchronously in the callback)
    return wrapper || new SentryTransactionWrapper(name, op, null)
  }

  startSpan(transaction: Transaction, description: string, op: string): Span {
    // Sentry v10: Create a child span
    let spanWrapper: SentrySpanWrapper | null = null

    Sentry.startSpan(
      {
        name: description,
        op,
      },
      (span) => {
        spanWrapper = new SentrySpanWrapper(description, op, span)
      }
    )

    return spanWrapper || new SentrySpanWrapper(description, op, null)
  }

  finishTransaction(transaction: Transaction): void {
    transaction.finish()
    this.activeTransactions.delete(transaction.name)
  }

  finishSpan(span: Span): void {
    span.finish()
  }
}
