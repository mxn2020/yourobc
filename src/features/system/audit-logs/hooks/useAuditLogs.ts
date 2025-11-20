// src/features/audit-logs/hooks/useAuditLogs.ts
import { useState, useCallback, useMemo } from 'react'
import { useAuthenticatedUser } from '@/features/system/auth'
import { auditLogsService } from '../services/AuditLogsService'
import type {
  AuditLogEntry,
  AuditLogFilters,
  AuditLogResponse,
  AuditLogStats,
  CreateAuditLogData,
  AuditLogListOptions,
  AuditLogExportOptions,
  AuditTrail,
  AuditAction,
  AuditEntityType,
  ExportResult,
  ProcessedAuditLogEntry
} from '../types/audit-logs.types'
import { Id } from '@/convex/_generated/dataModel'

/**
 * Layer 2: Business Logic Hook - USER LEVEL
 * Main audit logs hook for regular users viewing their own logs
 *
 * IMPORTANT: This hook is for regular users. For admin operations, use useAdminAuditLogs from useAdminAuditLogs.ts
 */
export function useMyAuditLogs(initialOptions?: AuditLogListOptions) {
  const authUser = useAuthenticatedUser()

  const [options, setOptions] = useState<AuditLogListOptions>(initialOptions || {
    limit: 50,
    offset: 0,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    filters: {}
  })

  // === Data Queries ===
  const {
    data: auditLogsResponse,
    isPending: isLoadingLogs,
    error: logsError
  } = auditLogsService.useMyAuditLogs(options)

  const {
    data: auditStats,
    isPending: isLoadingStats
  } = auditLogsService.useMyAuditLogStats()

  // === Mutations ===
  const createLogMutation = auditLogsService.useCreateAuditLog()

  // === Filter Management ===
  const updateFilters = useCallback((newFilters: Partial<AuditLogFilters>) => {
    setOptions(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        ...newFilters
      },
      offset: 0 // Reset to first page when filters change
    }))
  }, [])

  const updateOptions = useCallback((newOptions: Partial<AuditLogListOptions>) => {
    setOptions(prev => ({ ...prev, ...newOptions }))
  }, [])

  const resetFilters = useCallback(() => {
    setOptions({
      limit: 50,
      offset: 0,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      filters: {}
    })
  }, [])

  const searchLogs = useCallback((searchTerm: string) => {
    updateFilters({ search: searchTerm })
  }, [updateFilters])

  const filterByAction = useCallback((action: AuditAction | AuditAction[]) => {
    updateFilters({ action })
  }, [updateFilters])

  const filterByEntity = useCallback((entityType: AuditEntityType, entityId?: string) => {
    updateFilters({ entityType, entityId })
  }, [updateFilters])

  const filterByUser = useCallback((userId: Id<"userProfiles">, userName?: string) => {
    updateFilters({ userId, userName })
  }, [updateFilters])

  const filterByDateRange = useCallback((dateFrom: number, dateTo: number) => {
    updateFilters({ dateFrom, dateTo })
  }, [updateFilters])

  // === Pagination ===
  const nextPage = useCallback(() => {
    setOptions(prev => ({
      ...prev,
      offset: (prev.offset || 0) + (prev.limit || 50)
    }))
  }, [])

  const previousPage = useCallback(() => {
    setOptions(prev => ({
      ...prev,
      offset: Math.max(0, (prev.offset || 0) - (prev.limit || 50))
    }))
  }, [])

  const setPage = useCallback((page: number) => {
    const limit = options.limit || 50
    setOptions(prev => ({ ...prev, offset: page * limit }))
  }, [options.limit])

  // === Computed Values ===
  const logs = useMemo(() => auditLogsResponse?.logs || [], [auditLogsResponse])
  const total = useMemo(() => auditLogsResponse?.total || 0, [auditLogsResponse])
  const hasMore = useMemo(() => auditLogsResponse?.hasMore || false, [auditLogsResponse])

  const currentPage = useMemo(() => {
    const limit = options.limit || 50
    return Math.floor((options.offset || 0) / limit)
  }, [options])

  const hasNextPage = useMemo(() => hasMore, [hasMore])
  const hasPreviousPage = useMemo(() => (options.offset || 0) > 0, [options.offset])

  // === Data Processing ===
  const processedLogs = useMemo((): ProcessedAuditLogEntry[] => {
    return logs.map(log => ({
      ...log,
      formattedTime: auditLogsService.formatRelativeTime(log.createdAt),
      actionIcon: auditLogsService.getActionIcon(log.action),
      actionColor: auditLogsService.getActionColor(log.action),
      actionConfig: auditLogsService.getActionConfig(log.action)
    }))
  }, [logs])

  const logsByDate = useMemo(() => {
    return auditLogsService.groupAuditLogsByDate(logs)
  }, [logs])

  const logsByUser = useMemo(() => {
    return auditLogsService.groupAuditLogsByUser(logs)
  }, [logs])

  const logsByEntity = useMemo(() => {
    return auditLogsService.groupAuditLogsByEntity(logs)
  }, [logs])

  // === User Actions ===
  const createAuditLog = useCallback(async (logData: CreateAuditLogData) => {
    const validation = auditLogsService.validateAuditLogData(logData)
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
    }

    return await auditLogsService.createAuditLog(createLogMutation, logData)
  }, [createLogMutation])

  // === Export Functions ===
  const exportMyLogs = useCallback((exportOptions: AuditLogExportOptions): ExportResult => {
    return auditLogsService.exportMyAuditLogs(logs, exportOptions)
  }, [logs])

  const exportFilteredLogs = useCallback((exportFilters: AuditLogFilters, exportOptions: Omit<AuditLogExportOptions, 'filters'>): ExportResult => {
    const filteredLogs = auditLogsService.filterAuditLogs(logs, exportFilters)
    return auditLogsService.exportMyAuditLogs(filteredLogs, { ...exportOptions, filters: exportFilters })
  }, [logs])

  // === Analysis Functions ===
  const analyzePatterns = useCallback(() => {
    return auditLogsService.analyzeAuditLogPatterns(logs)
  }, [logs])

  const searchLogsLocal = useCallback((searchTerm: string) => {
    return auditLogsService.searchAuditLogs(logs, searchTerm)
  }, [logs])

  // === Loading States ===
  const isLoading = useMemo(() => isLoadingLogs || isLoadingStats, [isLoadingLogs, isLoadingStats])

  const isUpdating = useMemo(() =>
    createLogMutation.isPending
  , [createLogMutation.isPending])

  return {
    // === Data ===
    logs: processedLogs,
    total,
    hasMore,
    myStats: auditStats,
    logsByDate,
    logsByUser,
    logsByEntity,

    // === Loading States ===
    isLoading,
    isUpdating,
    isLoadingLogs,
    isLoadingStats,
    error: logsError,

    // === Options and Filters ===
    options,
    filters: options.filters || {},
    updateOptions,
    updateFilters,
    resetFilters,
    searchLogs,
    filterByAction,
    filterByEntity,
    filterByUser,
    filterByDateRange,
    currentPage,
    nextPage,
    previousPage,
    setPage,
    hasNextPage,
    hasPreviousPage,

    // === User Actions ===
    createAuditLog,

    // === Export Functions ===
    exportMyLogs,
    exportFilteredLogs,

    // === Analysis Functions ===
    analyzePatterns,
    searchLogsLocal,

    // === Utilities ===
    formatRelativeTime: auditLogsService.formatRelativeTime,
    getActionIcon: auditLogsService.getActionIcon,
    getActionColor: auditLogsService.getActionColor,
    getActionConfig: auditLogsService.getActionConfig,
    validateLogData: auditLogsService.validateAuditLogData,

    // === Raw Mutations (for advanced usage) ===
    mutations: {
      createLog: createLogMutation,
    }
  }
}

// === Specialized Hooks ===

/**
 * Hook for entity-specific audit trails
 */
export function useEntityAuditTrail(entityType: AuditEntityType, entityId: string) {
  const authUser = useAuthenticatedUser()

  const {
    data: logs = [],
    isPending: isLoading,
    error
  } = auditLogsService.useEntityAuditLogs(entityType, entityId, 100)

  const auditTrail = useMemo(() => {
    return auditLogsService.generateAuditTrail(logs, entityType, entityId)
  }, [logs, entityType, entityId])

  const processedLogs = useMemo((): Array<AuditLogEntry & { formattedTime: string; actionIcon: typeof import('lucide-react').Activity; actionColor: string }> => {
    return logs.map(log => ({
      ...log,
      formattedTime: auditLogsService.formatRelativeTime(log.createdAt),
      actionIcon: auditLogsService.getActionIcon(log.action),
      actionColor: auditLogsService.getActionColor(log.action),
    }))
  }, [logs])

  return {
    logs: processedLogs,
    auditTrail,
    isLoading,
    error,
    entityType,
    entityId,
  }
}

/**
 * Hook for current user's own audit logs (simple version)
 */
export function useUserAuditLogs(limit: number = 100) {
  const authUser = useAuthenticatedUser()

  const {
    data: logs = [],
    isPending: isLoading,
    error
  } = auditLogsService.useUserAuditLogs(limit)

  const processedLogs = useMemo((): Array<AuditLogEntry & { formattedTime: string; actionIcon: typeof import('lucide-react').Activity; actionColor: string }> => {
    return logs.map(log => ({
      ...log,
      formattedTime: auditLogsService.formatRelativeTime(log.createdAt),
      actionIcon: auditLogsService.getActionIcon(log.action),
      actionColor: auditLogsService.getActionColor(log.action),
    }))
  }, [logs])

  const userActivity = useMemo(() => {
    return auditLogsService.analyzeAuditLogPatterns(logs)
  }, [logs])

  return {
    logs: processedLogs,
    userActivity,
    isLoading,
    error,
    userId: authUser?.id,
  }
}

/**
 * Hook for current user's audit log statistics
 */
export function useMyAuditLogStats(timeWindow?: 'day' | 'week' | 'month' | 'all') {
  const authUser = useAuthenticatedUser()

  const {
    data: stats,
    isPending: isLoading,
    error
  } = auditLogsService.useMyAuditLogStats(timeWindow)

  return {
    stats,
    isLoading,
    error,
  }
}