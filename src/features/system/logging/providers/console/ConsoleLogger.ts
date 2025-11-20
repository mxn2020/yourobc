// src/features/boilerplate/logging/providers/console/ConsoleLogger.ts

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
} from '../../types/logging.types'

/**
 * Internal breadcrumb storage type
 */
interface StoredBreadcrumb {
  message: string
  timestamp: Date
  level?: string
  category?: string
  data?: Record<string, unknown>
}

/**
 * Internal transaction implementation for console logging
 */
class ConsoleTransaction implements Transaction {
  readonly name: string
  readonly op: string
  readonly startTime: number
  private tags: Map<string, string> = new Map()
  private data: Map<string, JSONValue> = new Map()
  private status: TransactionStatus = TransactionStatus.OK
  private httpStatus?: number

  constructor(name: string, op: string) {
    this.name = name
    this.op = op
    this.startTime = Date.now()
  }

  setTag(key: string, value: string): void {
    this.tags.set(key, value)
  }

  setData(key: string, value: JSONValue): void {
    this.data.set(key, value)
  }

  setStatus(status: TransactionStatus): void {
    this.status = status
  }

  setHttpStatus(httpStatus: number): void {
    this.httpStatus = httpStatus
  }

  finish(): void {
    const duration = Date.now() - this.startTime
    const tagsObj = Object.fromEntries(this.tags)
    const dataObj = Object.fromEntries(this.data)

    console.groupCollapsed(
      `⚡ Transaction: ${this.name} | ${this.op} | ${duration}ms | ${this.status}`
    )
    console.log('Duration:', `${duration}ms`)
    console.log('Operation:', this.op)
    console.log('Status:', this.status)
    if (this.httpStatus) {
      console.log('HTTP Status:', this.httpStatus)
    }
    if (this.tags.size > 0) {
      console.log('Tags:', tagsObj)
    }
    if (this.data.size > 0) {
      console.log('Data:', dataObj)
    }
    console.groupEnd()
  }
}

/**
 * Internal span implementation for console logging
 */
class ConsoleSpan implements Span {
  readonly description: string
  readonly op: string
  readonly startTime: number
  private tags: Map<string, string> = new Map()
  private data: Map<string, JSONValue> = new Map()
  private status: TransactionStatus = TransactionStatus.OK

  constructor(description: string, op: string) {
    this.description = description
    this.op = op
    this.startTime = Date.now()
  }

  setTag(key: string, value: string): void {
    this.tags.set(key, value)
  }

  setData(key: string, value: JSONValue): void {
    this.data.set(key, value)
  }

  setStatus(status: TransactionStatus): void {
    this.status = status
  }

  finish(): void {
    const duration = Date.now() - this.startTime
    const tagsObj = Object.fromEntries(this.tags)
    const dataObj = Object.fromEntries(this.data)

    console.log(
      `  ↳ Span: ${this.description} | ${this.op} | ${duration}ms | ${this.status}`,
      this.tags.size > 0 || this.data.size > 0
        ? { tags: tagsObj, data: dataObj }
        : ''
    )
  }
}

/**
 * Console Logger Provider
 * Default logging implementation that outputs to browser console
 * with enhanced formatting and structure
 */
export class ConsoleLogger implements LoggerProvider {
  readonly name = 'console'
  private breadcrumbs: StoredBreadcrumb[] = []
  private userContext?: UserContext
  private activeTransactions: Map<string, ConsoleTransaction> = new Map()

  async initialize(): Promise<void> {
    console.log('🚀 ConsoleLogger initialized')
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString()
    const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : ''
    const userStr = this.userContext ? ` | User: ${this.userContext.id}` : ''
    return `[${timestamp}] [${level.toUpperCase()}]${userStr} ${message}${contextStr}`
  }

  private getConsoleMethod(level: LogLevel): typeof console.log {
    switch (level) {
      case LogLevel.DEBUG:
        return console.debug
      case LogLevel.INFO:
        return console.info
      case LogLevel.WARN:
        return console.warn
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        return console.error
      default:
        return console.log
    }
  }

  debug(message: string, context?: LogContext): void {
    const formatted = this.formatMessage(LogLevel.DEBUG, message, context)
    this.getConsoleMethod(LogLevel.DEBUG)(formatted)
  }

  info(message: string, context?: LogContext): void {
    const formatted = this.formatMessage(LogLevel.INFO, message, context)
    this.getConsoleMethod(LogLevel.INFO)(formatted)
  }

  warn(message: string, context?: LogContext, error?: Error): void {
    const formatted = this.formatMessage(LogLevel.WARN, message, context)
    this.getConsoleMethod(LogLevel.WARN)(formatted)
    if (error) {
      console.warn('Error details:', error)
      if (error.stack) console.warn('Stack trace:', error.stack)
    }
  }

  error(message: string, context?: LogContext, error?: Error): void {
    const formatted = this.formatMessage(LogLevel.ERROR, message, context)
    this.getConsoleMethod(LogLevel.ERROR)(formatted)
    if (error) {
      console.error('Error details:', error)
      if (error.stack) console.error('Stack trace:', error.stack)
    }

    // Log recent breadcrumbs for debugging
    if (this.breadcrumbs.length > 0) {
      console.group('📍 Recent breadcrumbs:')
      this.breadcrumbs.slice(-5).forEach(breadcrumb => {
        console.log(
          `[${breadcrumb.timestamp.toISOString()}] [${breadcrumb.level || 'info'}] [${breadcrumb.category || 'custom'}] ${breadcrumb.message}`,
          breadcrumb.data || ''
        )
      })
      console.groupEnd()
    }
  }

  fatal(message: string, context?: LogContext, error?: Error): void {
    const formatted = this.formatMessage(LogLevel.FATAL, message, context)
    console.error('💀 FATAL:', formatted)
    if (error) {
      console.error('Error details:', error)
      if (error.stack) console.error('Stack trace:', error.stack)
    }

    // Log all breadcrumbs for fatal errors
    if (this.breadcrumbs.length > 0) {
      console.group('📍 All breadcrumbs:')
      this.breadcrumbs.forEach(breadcrumb => {
        console.log(
          `[${breadcrumb.timestamp.toISOString()}] [${breadcrumb.level || 'info'}] [${breadcrumb.category || 'custom'}] ${breadcrumb.message}`,
          breadcrumb.data || ''
        )
      })
      console.groupEnd()
    }
  }

  addBreadcrumb(breadcrumb: Breadcrumb): void {
    this.breadcrumbs.push({
      message: breadcrumb.message,
      timestamp: breadcrumb.timestamp ? new Date(breadcrumb.timestamp) : new Date(),
      level: breadcrumb.level,
      category: breadcrumb.category,
      data: breadcrumb.data,
    })

    // Keep only last 100 breadcrumbs
    if (this.breadcrumbs.length > 100) {
      this.breadcrumbs.shift()
    }
  }

  setUser(user: UserContext): void {
    this.userContext = user
    console.debug(`👤 User context set: ${user.id}`, {
      email: user.email,
      username: user.username,
      role: user.role,
      segment: user.segment,
      subscription: user.subscription,
    })
  }

  clearUser(): void {
    this.userContext = undefined
    console.debug('👤 User context cleared')
  }

  captureException(error: Error, context?: LogContext): void {
    this.error(`Exception captured: ${error.message}`, context, error)
  }

  flush(): void {
    // No-op for console logger (console is synchronous)
  }

  setTag(key: string, value: string): void {
    console.debug(`🏷️  Tag set: ${key} = ${value}`)
  }

  setContext(name: string, context: Record<string, JSONValue>): void {
    console.debug(`📦 Context set: ${name}`, context)
  }

  setFingerprint(fingerprint: string[]): void {
    console.debug(`🔍 Fingerprint set:`, fingerprint)
  }

  startTransaction(name: string, op: string): Transaction {
    const transaction = new ConsoleTransaction(name, op)
    this.activeTransactions.set(name, transaction)
    console.log(`⚡ Transaction started: ${name} | ${op}`)
    return transaction
  }

  startSpan(transaction: Transaction, description: string, op: string): Span {
    const span = new ConsoleSpan(description, op)
    console.log(`  ↳ Span started: ${description} | ${op}`)
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
