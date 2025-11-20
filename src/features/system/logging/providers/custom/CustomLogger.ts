// src/core/logging/providers/custom/CustomLogger.ts

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
  breadcrumbLevelToSentrySeverity,
} from '../../types/logging.types'
import { Id } from "@/convex/_generated/dataModel";

/**
 * Custom Transaction wrapper
 */
class CustomTransactionWrapper implements Transaction {
  private _name: string
  private _op: string
  private _startTime: number
  private _tags: Map<string, string> = new Map()
  private _data: Map<string, JSONValue> = new Map()
  private _status: TransactionStatus = TransactionStatus.OK
  private _finished: boolean = false

  constructor(name: string, op: string) {
    this._name = name
    this._op = op
    this._startTime = Date.now()
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
    this._tags.set(key, value)
  }

  setData(key: string, value: JSONValue): void {
    this._data.set(key, value)
  }

  setStatus(status: TransactionStatus): void {
    this._status = status
  }

  setHttpStatus(httpStatus: number): void {
    this._data.set('http.status_code', httpStatus)
  }

  finish(): void {
    if (this._finished) return
    this._finished = true

    const duration = Date.now() - this._startTime
    console.debug(`Transaction ${this._name} finished in ${duration}ms`, {
      op: this._op,
      status: this._status,
      tags: Object.fromEntries(this._tags),
      data: Object.fromEntries(this._data),
    })
  }
}

/**
 * Custom Span wrapper
 */
class CustomSpanWrapper implements Span {
  private _description: string
  private _op: string
  private _startTime: number
  private _tags: Map<string, string> = new Map()
  private _data: Map<string, JSONValue> = new Map()
  private _status: TransactionStatus = TransactionStatus.OK
  private _finished: boolean = false

  constructor(description: string, op: string) {
    this._description = description
    this._op = op
    this._startTime = Date.now()
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
    this._tags.set(key, value)
  }

  setData(key: string, value: JSONValue): void {
    this._data.set(key, value)
  }

  setStatus(status: TransactionStatus): void {
    this._status = status
  }

  finish(): void {
    if (this._finished) return
    this._finished = true

    const duration = Date.now() - this._startTime
    console.debug(`Span ${this._description} finished in ${duration}ms`, {
      op: this._op,
      status: this._status,
      tags: Object.fromEntries(this._tags),
      data: Object.fromEntries(this._data),
    })
  }
}

/**
 * Custom Logger Provider (TEMPLATE)
 *
 * Use this template to create your own logging provider.
 * Examples:
 * - Send logs to your own API endpoint
 * - Store logs in Convex database
 * - Send logs to CloudWatch, Datadog, etc.
 *
 * To use:
 * 1. Copy this file and rename it
 * 2. Implement the LoggerProvider interface
 * 3. Update config.ts to use your custom provider
 */
export class CustomLogger implements LoggerProvider {
  readonly name = 'custom'
  private apiEndpoint?: string
  private breadcrumbs: Breadcrumb[] = []
  private userContext: UserContext | null = null
  private globalTags: Map<string, string> = new Map()
  private globalContext: Map<string, Record<string, JSONValue>> = new Map()
  private fingerprint: string[] = []
  private activeTransactions: Map<string, CustomTransactionWrapper> = new Map()

  constructor(apiEndpoint?: string) {
    this.apiEndpoint = apiEndpoint || import.meta.env.VITE_LOGGING_ENDPOINT
  }

  async initialize(): Promise<void> {
    console.log('🚀 CustomLogger initialized')
    // TODO: Add your initialization logic here
    // Examples:
    // - Verify API endpoint is reachable
    // - Setup batch queue for logs
    // - Configure retry logic
  }

  private async sendLog(level: LogLevel, message: string, context?: LogContext, error?: Error): Promise<void> {
    // TODO: Implement your logging logic here
    // Example: Send to API endpoint
    /*
    if (!this.apiEndpoint) return

    try {
      await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level,
          message,
          context,
          error: error ? {
            message: error.message,
            stack: error.stack,
          } : undefined,
          timestamp: new Date().toISOString(),
          user: this.userContext,
          breadcrumbs: this.breadcrumbs,
          tags: Object.fromEntries(this.globalTags),
          fingerprint: this.fingerprint,
        }),
      })
    } catch (err) {
      // Fallback to console if API fails
      console.error('Failed to send log:', err)
    }
    */
  }

  debug(message: string, context?: LogContext): void {
    console.debug(message, context)
    this.sendLog(LogLevel.DEBUG, message, context)
  }

  info(message: string, context?: LogContext): void {
    console.info(message, context)
    this.sendLog(LogLevel.INFO, message, context)
  }

  warn(message: string, context?: LogContext, error?: Error): void {
    console.warn(message, context, error)
    this.sendLog(LogLevel.WARN, message, context, error)
  }

  error(message: string, context?: LogContext, error?: Error): void {
    console.error(message, context, error)
    this.sendLog(LogLevel.ERROR, message, context, error)
  }

  fatal(message: string, context?: LogContext, error?: Error): void {
    console.error('FATAL:', message, context, error)
    this.sendLog(LogLevel.FATAL, message, context, error)
  }

  addBreadcrumb(breadcrumb: Breadcrumb): void {
    this.breadcrumbs.push({
      ...breadcrumb,
      timestamp: breadcrumb.timestamp || Date.now(),
    })

    // Keep only last 100 breadcrumbs
    if (this.breadcrumbs.length > 100) {
      this.breadcrumbs = this.breadcrumbs.slice(-100)
    }

    console.debug('Breadcrumb:', breadcrumb)
  }

  setUser(user: UserContext): void {
    this.userContext = user
    console.debug('User set:', user)
  }

  clearUser(): void {
    this.userContext = null
    console.debug('User cleared')
  }

  captureException(error: Error, context?: LogContext): void {
    this.error(`Exception: ${error.message}`, context, error)
  }

  async flush(): Promise<void> {
    // TODO: Implement flush logic (if using batching)
    console.debug('Flushing logs...')
  }

  setTag(key: string, value: string): void {
    this.globalTags.set(key, value)
    console.debug(`Tag set: ${key} = ${value}`)
  }

  setContext(name: string, context: Record<string, JSONValue>): void {
    this.globalContext.set(name, context)
    console.debug(`Context set: ${name}`, context)
  }

  setFingerprint(fingerprint: string[]): void {
    this.fingerprint = fingerprint
    console.debug('Fingerprint set:', fingerprint)
  }

  startTransaction(name: string, op: string): Transaction {
    const transaction = new CustomTransactionWrapper(name, op)
    this.activeTransactions.set(name, transaction)
    console.debug(`Transaction started: ${name} (${op})`)
    return transaction
  }

  startSpan(transaction: Transaction, description: string, op: string): Span {
    const span = new CustomSpanWrapper(description, op)
    console.debug(`Span started: ${description} (${op}) under transaction ${transaction.name}`)
    return span
  }

  finishTransaction(transaction: Transaction): void {
    transaction.finish()
    this.activeTransactions.delete(transaction.name)
  }

  finishSpan(span: Span): void {
    span.finish()
  }
}

/*
 * EXAMPLE IMPLEMENTATION - Convex Database Logger:
 *
 * import { useMutation } from 'convex/react'
 * import { api } from '../../../../convex/_generated/api'
 *
 * export class ConvexLogger implements LoggerProvider {
 *   name = 'convex'
 *   private logMutation: any
 *
 *   constructor() {
 *     // Note: This needs to be used within a React component context
 *     // or you'll need to handle Convex client differently
 *   }
 *
 *   async initialize(): Promise<void> {
 *     console.log('🚀 ConvexLogger initialized')
 *   }
 *
 *   error(message: string, context?: LogContext, error?: Error): void {
 *     // Store in Convex database
 *     this.logMutation({
 *       level: 'error',
 *       message,
 *       context,
 *       errorMessage: error?.message,
 *       errorStack: error?.stack,
 *       timestamp: Date.now(),
 *     })
 *   }
 *   // ... implement other methods
 * }
 */
