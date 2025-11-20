// src/features/system/logging/hooks/usePerformanceTracking.ts

import { useEffect, useRef, useCallback } from 'react'
import { logger } from '../services/LoggingService'
import { Transaction, Span, TransactionStatus, httpStatusToTransactionStatus } from '../types/logging.types'
import { BreadcrumbCategory, BreadcrumbLevel } from '../types/logging.types'

/**
 * Options for useTransaction hook
 */
export interface UseTransactionOptions {
  /**
   * Transaction name (e.g., "Page Load", "API Call")
   */
  name: string

  /**
   * Operation type (e.g., "pageload", "navigation", "http.client")
   */
  op: string

  /**
   * Tags to add to the transaction
   */
  tags?: Record<string, string>

  /**
   * Whether to start the transaction immediately (default: true)
   */
  startImmediately?: boolean

  /**
   * Whether to auto-finish on unmount (default: true)
   */
  finishOnUnmount?: boolean
}

/**
 * Hook to track a transaction (page load, route navigation, etc.)
 *
 * @example
 * ```tsx
 * function Dashboard() {
 *   const { transaction, finish } = useTransaction({
 *     name: 'Dashboard Load',
 *     op: 'pageload',
 *     tags: { route: '/dashboard' }
 *   })
 *
 *   useEffect(() => {
 *     // Do some work
 *     fetchData().then(() => {
 *       transaction?.setTag('dataLoaded', 'true')
 *       finish('ok')
 *     })
 *   }, [])
 * }
 * ```
 */
export function useTransaction(options: UseTransactionOptions) {
  const {
    name,
    op,
    tags,
    startImmediately = true,
    finishOnUnmount = true,
  } = options

  const transactionRef = useRef<Transaction | null>(null)
  const finishedRef = useRef(false)

  // Start transaction
  const start = useCallback(() => {
    if (transactionRef.current) {
      return transactionRef.current
    }

    const transaction = logger.startTransaction(name, op)

    if (tags) {
      Object.entries(tags).forEach(([key, value]) => {
        transaction.setTag(key, value)
      })
    }

    transactionRef.current = transaction
    finishedRef.current = false

    logger.addBreadcrumb({
      message: `Transaction started: ${name}`,
      level: BreadcrumbLevel.DEBUG,
      category: BreadcrumbCategory.CUSTOM,
      data: { op, ...tags },
    })

    return transaction
  }, [name, op, tags])

  // Finish transaction
  const finish = useCallback((status: TransactionStatus = TransactionStatus.OK) => {
    if (!transactionRef.current || finishedRef.current) {
      return
    }

    transactionRef.current.setStatus(status)
    logger.finishTransaction(transactionRef.current)
    finishedRef.current = true

    logger.addBreadcrumb({
      message: `Transaction finished: ${name}`,
      level: BreadcrumbLevel.DEBUG,
      category: BreadcrumbCategory.CUSTOM,
      data: { status },
    })

    transactionRef.current = null
  }, [name])

  // Set HTTP status and derive transaction status
  const setHttpStatus = useCallback((httpStatus: number) => {
    if (!transactionRef.current) {
      return
    }

    transactionRef.current.setHttpStatus(httpStatus)
  }, [])

  // Set tag
  const setTag = useCallback((key: string, value: string) => {
    if (!transactionRef.current) {
      return
    }

    transactionRef.current.setTag(key, value)
  }, [])

  // Set data
  const setData = useCallback((key: string, value: unknown) => {
    if (!transactionRef.current) {
      return
    }

    transactionRef.current.setData(key, value as never)
  }, [])

  // Start immediately if requested
  useEffect(() => {
    if (startImmediately) {
      start()
    }
  }, [startImmediately, start])

  // Auto-finish on unmount
  useEffect(() => {
    return () => {
      if (finishOnUnmount && transactionRef.current && !finishedRef.current) {
        finish(TransactionStatus.CANCELLED)
      }
    }
  }, [finishOnUnmount, finish])

  return {
    transaction: transactionRef.current,
    start,
    finish,
    setHttpStatus,
    setTag,
    setData,
  }
}

/**
 * Options for useApiTracking hook
 */
export interface UseApiTrackingOptions {
  /**
   * Base name for the API transaction (default: "API Call")
   */
  transactionName?: string

  /**
   * Additional tags
   */
  tags?: Record<string, string>
}

/**
 * Hook to track API call performance
 *
 * @example
 * ```tsx
 * function useUsers() {
 *   const { trackApiCall } = useApiTracking()
 *
 *   const fetchUsers = async () => {
 *     return trackApiCall(
 *       'GET /api/users',
 *       async () => {
 *         const response = await fetch('/api/users')
 *         return response.json()
 *       },
 *       { endpoint: '/api/users', method: 'GET' }
 *     )
 *   }
 * }
 * ```
 */
export function useApiTracking(options: UseApiTrackingOptions = {}) {
  const { transactionName = 'API Call', tags = {} } = options

  const trackApiCall = useCallback(
    async <T,>(
      callName: string,
      apiCall: () => Promise<T>,
      metadata?: Record<string, string>
    ): Promise<T> => {
      const transaction = logger.startTransaction(`${transactionName}: ${callName}`, 'http.client')

      // Add tags
      Object.entries({ ...tags, ...metadata }).forEach(([key, value]) => {
        transaction.setTag(key, value)
      })

      logger.addBreadcrumb({
        message: `API call started: ${callName}`,
        level: BreadcrumbLevel.INFO,
        category: BreadcrumbCategory.NETWORK,
        data: metadata,
      })

      try {
        const result = await apiCall()

        transaction.setStatus(TransactionStatus.OK)
        transaction.setHttpStatus(200) // Assume success

        logger.addBreadcrumb({
          message: `API call succeeded: ${callName}`,
          level: BreadcrumbLevel.INFO,
          category: BreadcrumbCategory.NETWORK,
        })

        return result
      } catch (error) {
        const httpStatus = error instanceof Error && 'status' in error
          ? (error as { status: number }).status
          : 500

        transaction.setHttpStatus(httpStatus)

        logger.error(`API call failed: ${callName}`, {
          errorType: error instanceof Error ? error.name : 'Unknown',
          errorCode: 'API_ERROR',
          extra: {
            callName,
            httpStatus,
            ...metadata,
          },
          tags: {
            api_call: callName,
            ...tags,
            ...metadata,
          },
        }, error instanceof Error ? error : new Error(String(error)))

        throw error
      } finally {
        logger.finishTransaction(transaction)
      }
    },
    [transactionName, tags]
  )

  return { trackApiCall }
}

/**
 * Hook to track database query performance
 *
 * @example
 * ```tsx
 * function useProjects() {
 *   const { trackQuery } = useQueryTracking()
 *
 *   const getProjects = async () => {
 *     return trackQuery(
 *       'projects.list',
 *       async () => {
 *         const result = await db.projects.list()
 *         return result
 *       },
 *       { table: 'projects', operation: 'list' }
 *     )
 *   }
 * }
 * ```
 */
export function useQueryTracking() {
  const trackQuery = useCallback(
    async <T,>(
      queryName: string,
      query: () => Promise<T>,
      metadata?: Record<string, string>
    ): Promise<T> => {
      const transaction = logger.startTransaction(`Query: ${queryName}`, 'db.query')

      if (metadata) {
        Object.entries(metadata).forEach(([key, value]) => {
          transaction.setTag(key, value)
        })
      }

      logger.addBreadcrumb({
        message: `Query started: ${queryName}`,
        level: BreadcrumbLevel.DEBUG,
        category: BreadcrumbCategory.DATABASE,
        data: metadata,
      })

      try {
        const result = await query()
        transaction.setStatus(TransactionStatus.OK)

        logger.addBreadcrumb({
          message: `Query succeeded: ${queryName}`,
          level: BreadcrumbLevel.DEBUG,
          category: BreadcrumbCategory.DATABASE,
        })

        return result
      } catch (error) {
        transaction.setStatus(TransactionStatus.INTERNAL_ERROR)

        logger.error(`Query failed: ${queryName}`, {
          errorType: error instanceof Error ? error.name : 'Unknown',
          errorCode: 'QUERY_ERROR',
          extra: {
            queryName,
            ...metadata,
          },
          tags: {
            query: queryName,
            ...metadata,
          },
        }, error instanceof Error ? error : new Error(String(error)))

        throw error
      } finally {
        logger.finishTransaction(transaction)
      }
    },
    []
  )

  return { trackQuery }
}

/**
 * Hook to track custom operation performance
 *
 * @example
 * ```tsx
 * function ImageProcessor() {
 *   const { trackOperation } = useOperationTracking()
 *
 *   const processImage = async (image: File) => {
 *     return trackOperation(
 *       'Image Processing',
 *       async () => {
 *         // Process image
 *         return processedImage
 *       },
 *       {
 *         operation: 'image.process',
 *         tags: { format: image.type },
 *       }
 *     )
 *   }
 * }
 * ```
 */
export function useOperationTracking() {
  const trackOperation = useCallback(
    async <T,>(
      operationName: string,
      operation: () => Promise<T>,
      options?: {
        op?: string
        tags?: Record<string, string>
        data?: Record<string, unknown>
      }
    ): Promise<T> => {
      const transaction = logger.startTransaction(
        operationName,
        options?.op || 'custom.operation'
      )

      if (options?.tags) {
        Object.entries(options.tags).forEach(([key, value]) => {
          transaction.setTag(key, value)
        })
      }

      if (options?.data) {
        Object.entries(options.data).forEach(([key, value]) => {
          transaction.setData(key, value as never)
        })
      }

      logger.addBreadcrumb({
        message: `Operation started: ${operationName}`,
        level: BreadcrumbLevel.DEBUG,
        category: BreadcrumbCategory.CUSTOM,
        data: options?.tags,
      })

      try {
        const result = await operation()
        transaction.setStatus(TransactionStatus.OK)

        logger.addBreadcrumb({
          message: `Operation succeeded: ${operationName}`,
          level: BreadcrumbLevel.DEBUG,
          category: BreadcrumbCategory.CUSTOM,
        })

        return result
      } catch (error) {
        transaction.setStatus(TransactionStatus.INTERNAL_ERROR)

        logger.error(`Operation failed: ${operationName}`, {
          errorType: error instanceof Error ? error.name : 'Unknown',
          errorCode: 'OPERATION_ERROR',
          extra: {
            operationName,
            ...options?.tags,
          },
          tags: {
            operation: operationName,
            ...options?.tags,
          },
        }, error instanceof Error ? error : new Error(String(error)))

        throw error
      } finally {
        logger.finishTransaction(transaction)
      }
    },
    []
  )

  return { trackOperation }
}

/**
 * Hook to track span within a transaction
 *
 * @example
 * ```tsx
 * function DataProcessor() {
 *   const { transaction } = useTransaction({ name: 'Process Data', op: 'custom' })
 *   const { startSpan, finishSpan } = useSpanTracking(transaction!)
 *
 *   useEffect(() => {
 *     if (transaction) {
 *       const span = startSpan('Fetch Data', 'http')
 *       fetchData().then(() => {
 *         finishSpan(span, 'ok')
 *       })
 *     }
 *   }, [transaction])
 * }
 * ```
 */
export function useSpanTracking(transaction: Transaction | null) {
  const startSpan = useCallback(
    (description: string, op: string): Span | null => {
      if (!transaction) {
        return null
      }

      return logger.startSpan(transaction, description, op)
    },
    [transaction]
  )

  const finishSpan = useCallback(
    (span: Span | null, status: TransactionStatus = TransactionStatus.OK) => {
      if (!span) {
        return
      }

      span.setStatus(status)
      logger.finishSpan(span)
    },
    []
  )

  return { startSpan, finishSpan }
}

/**
 * Hook to measure and track a synchronous operation
 *
 * @example
 * ```tsx
 * function HeavyComputation() {
 *   const measureOperation = useMeasureOperation()
 *
 *   const compute = () => {
 *     measureOperation('Heavy Calculation', () => {
 *       // Expensive synchronous operation
 *       return result
 *     }, { algorithm: 'quicksort' })
 *   }
 * }
 * ```
 */
export function useMeasureOperation() {
  return useCallback(
    <T,>(
      operationName: string,
      operation: () => T,
      metadata?: Record<string, string>
    ): T => {
      const startTime = performance.now()

      logger.addBreadcrumb({
        message: `Sync operation started: ${operationName}`,
        level: BreadcrumbLevel.DEBUG,
        category: BreadcrumbCategory.CUSTOM,
        data: metadata,
      })

      try {
        const result = operation()
        const duration = performance.now() - startTime

        logger.info(`Operation completed: ${operationName}`, {
          action: 'measure_operation',
          extra: {
            duration: duration.toFixed(2),
            ...metadata,
          },
          tags: {
            operation: operationName,
            ...metadata,
          },
        })

        return result
      } catch (error) {
        const duration = performance.now() - startTime

        logger.error(`Operation failed: ${operationName}`, {
          errorType: error instanceof Error ? error.name : 'Unknown',
          errorCode: 'SYNC_OPERATION_ERROR',
          extra: {
            duration: duration.toFixed(2),
            ...metadata,
          },
          tags: {
            operation: operationName,
            ...metadata,
          },
        }, error instanceof Error ? error : new Error(String(error)))

        throw error
      }
    },
    []
  )
}
