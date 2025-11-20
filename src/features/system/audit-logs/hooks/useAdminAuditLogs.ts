// src/features/boilerplate/audit-logs/hooks/useAdminAuditLogs.ts
import { useState, useCallback, useMemo } from 'react'
import { useAuthenticatedUser } from '@/features/boilerplate/auth'
import { auditLogsAdminService } from '../services/AuditLogsAdminService'
import { auditLogsService } from '../services/AuditLogsService'
import type {
  AuditLogEntry,
  AuditLogFilters,
  AuditLogResponse,
  AuditLogStats,
  CreateAuditLogData,
  AuditLogListOptions,
  AuditLogExportOptions,
  ExportResult,
  ProcessedAuditLogEntry
} from '../types/audit-logs.types'
import { Id } from '@/convex/_generated/dataModel'
import { EntityType } from '@/config'

/**
 * ADMIN-ONLY: Main audit logs management hook for admins
 * Provides full access to all audit logs across all users
 *
 * IMPORTANT: This hook will throw an error if the current user is not an admin/superadmin
 */
export function useAdminAuditLogs(initialOptions?: AuditLogListOptions) {
  const authUser = useAuthenticatedUser()

  // Strict admin check - throw error if not admin
  if (!authUser || (authUser?.role !== 'admin' && authUser?.role !== 'superadmin')) {
    throw new Error('Admin or superadmin access required for audit log management')
  }

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
  } = auditLogsAdminService.useAdminAuditLogs(options)

  const {
    data: auditStats,
    isPending: isLoadingStats
  } = auditLogsAdminService.useAdminAuditLogStats()

  // === Mutations ===
  const bulkCreateMutation = auditLogsAdminService.useBulkCreateAuditLogs()
  const cleanupMutation = auditLogsAdminService.useCleanupOldAuditLogs()

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

  const filterByAction = useCallback((action: string | string[]) => {
    updateFilters({ action })
  }, [updateFilters])

  const filterByEntity = useCallback((entityType: EntityType | EntityType[], entityId?: string) => {
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

  // === Admin Actions ===
  const bulkCreateAuditLogs = useCallback(async (logsData: CreateAuditLogData[]) => {
    // Validate all logs
    for (const logData of logsData) {
      const validation = auditLogsService.validateAuditLogData(logData)
      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
      }
    }

    return await auditLogsAdminService.bulkCreateAuditLogs(bulkCreateMutation, logsData)
  }, [bulkCreateMutation])

  const cleanupOldLogs = useCallback(async () => {
    return await auditLogsAdminService.cleanupOldAuditLogs(cleanupMutation)
  }, [cleanupMutation])

  // === Export Functions ===
  const exportLogs = useCallback((exportOptions: AuditLogExportOptions): ExportResult => {
    return auditLogsAdminService.exportAuditLogs(logs, exportOptions)
  }, [logs])

  const exportFilteredLogs = useCallback((exportFilters: AuditLogFilters, exportOptions: Omit<AuditLogExportOptions, 'filters'>): ExportResult => {
    const filteredLogs = auditLogsService.filterAuditLogs(logs, exportFilters)
    return auditLogsAdminService.exportAuditLogs(filteredLogs, { ...exportOptions, filters: exportFilters })
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
    bulkCreateMutation.isPending ||
    cleanupMutation.isPending
  , [bulkCreateMutation.isPending, cleanupMutation.isPending])

  return {
    // === Data ===
    logs: processedLogs,
    total,
    hasMore,
    auditStats,
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

    // === Admin Actions ===
    bulkCreateAuditLogs,
    cleanupOldLogs,

    // === Export Functions ===
    exportLogs,
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
      bulkCreate: bulkCreateMutation,
      cleanup: cleanupMutation,
    }
  }
}

/**
 * ADMIN-ONLY: Hook for viewing a specific user's audit logs
 */
export function useAdminUserAuditLogs(targetUserId: Id<"userProfiles">, limit: number = 100) {
  const authUser = useAuthenticatedUser()

  // Strict admin check
  if (!authUser || (authUser?.role !== 'admin' && authUser?.role !== 'superadmin')) {
    throw new Error('Admin access required to view user audit logs')
  }

  const {
    data: logs = [],
    isPending: isLoading,
    error
  } = auditLogsAdminService.useAdminUserAuditLogs(targetUserId, limit)

  const processedLogs = useMemo((): ProcessedAuditLogEntry[] => {
    return logs.map(log => ({
      ...log,
      formattedTime: auditLogsService.formatRelativeTime(log.createdAt),
      actionIcon: auditLogsService.getActionIcon(log.action),
      actionColor: auditLogsService.getActionColor(log.action),
      actionConfig: auditLogsService.getActionConfig(log.action)
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
    userId: targetUserId,
  }
}

/**
 * ADMIN-ONLY: Hook for system-wide audit log statistics
 */
export function useAdminAuditLogStats(timeWindow?: 'day' | 'week' | 'month' | 'all') {
  const authUser = useAuthenticatedUser()

  // Strict admin check
  if (!authUser || (authUser?.role !== 'admin' && authUser?.role !== 'superadmin')) {
    throw new Error('Admin access required to view audit log statistics')
  }

  const {
    data: stats,
    isPending: isLoading,
    error
  } = auditLogsAdminService.useAdminAuditLogStats(timeWindow)

  return {
    stats,
    isLoading,
    error,
  }
}

/**
 * ADMIN-ONLY: Hook for recent activity across all users
 */
export function useAdminRecentActivity(limit: number = 100) {
  const authUser = useAuthenticatedUser()

  // Strict admin check
  if (!authUser || (authUser?.role !== 'admin' && authUser?.role !== 'superadmin')) {
    throw new Error('Admin access required to view recent activity')
  }

  const {
    data: logs = [],
    isPending: isLoading,
    error
  } = auditLogsAdminService.useAdminRecentActivity(limit)

  const processedLogs = useMemo((): ProcessedAuditLogEntry[] => {
    return logs.map(log => ({
      ...log,
      formattedTime: auditLogsService.formatRelativeTime(log.createdAt),
      actionIcon: auditLogsService.getActionIcon(log.action),
      actionColor: auditLogsService.getActionColor(log.action),
      actionConfig: auditLogsService.getActionConfig(log.action)
    }))
  }, [logs])

  return {
    logs: processedLogs,
    isLoading,
    error,
  }
}

/**
 * ADMIN-ONLY: Component-specific hook for audit log management UI
 */
export function useAuditLogManagement() {
  const authUser = useAuthenticatedUser()

  // Strict admin check
  if (!authUser || (authUser?.role !== 'admin' && authUser?.role !== 'superadmin')) {
    throw new Error('Admin or superadmin access required for audit log management')
  }

  const {
    logs,
    total,
    auditStats,
    isLoading,
    isUpdating,
    options,
    filters,
    updateOptions,
    updateFilters,
    resetFilters,
    searchLogs,
    exportLogs,
    cleanupOldLogs,
    nextPage,
    previousPage,
    hasNextPage,
    hasPreviousPage,
    currentPage,
    error
  } = useAdminAuditLogs()

  const [selectedLogs, setSelectedLogs] = useState<Set<string>>(new Set())
  const [showExportModal, setShowExportModal] = useState(false)
  const [showCleanupModal, setShowCleanupModal] = useState(false)

  // === Selection Management ===
  const toggleLogSelection = useCallback((logId: string) => {
    setSelectedLogs(prev => {
      const newSet = new Set(prev)
      if (newSet.has(logId)) {
        newSet.delete(logId)
      } else {
        newSet.add(logId)
      }
      return newSet
    })
  }, [])

  const selectAllLogs = useCallback(() => {
    setSelectedLogs(new Set(logs.map(log => log._id)))
  }, [logs])

  const clearSelection = useCallback(() => {
    setSelectedLogs(new Set())
  }, [])

  const selectedLogsList = useMemo(() => {
    return logs.filter(log => selectedLogs.has(log._id))
  }, [logs, selectedLogs])

  // === Export Management ===
  const handleExport = useCallback((format: 'csv' | 'json', includeSelected: boolean = false) => {
    const logsToExport = includeSelected && selectedLogs.size > 0 ? selectedLogsList : logs

    const result = auditLogsAdminService.exportAuditLogs(logsToExport, {
      format,
      filters: options.filters,
      includeMetadata: true,
      includeUserDetails: true,
    })

    if (result.success) {
      setShowExportModal(false)
      clearSelection()
    }

    return result
  }, [logs, selectedLogsList, selectedLogs.size, options.filters, clearSelection])

  // === Cleanup Management ===
  const handleCleanup = useCallback(async () => {
    if (!window.confirm('Are you sure you want to cleanup old audit logs? This action cannot be undone.')) {
      return
    }

    try {
      const deletedCount = await cleanupOldLogs()
      setShowCleanupModal(false)
      return { success: true, deletedCount }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Cleanup failed'
      }
    }
  }, [cleanupOldLogs])

  return {
    // === Data ===
    logs,
    total,
    auditStats,

    // === Loading States ===
    isLoading,
    isUpdating,
    error,

    // === Options and Filters ===
    options,
    filters,
    updateOptions,
    updateFilters,
    resetFilters,
    searchLogs,
    currentPage,
    nextPage,
    previousPage,
    hasNextPage,
    hasPreviousPage,

    // === Selection Management ===
    selectedLogs,
    selectedLogsList,
    toggleLogSelection,
    selectAllLogs,
    clearSelection,

    // === Modal Management ===
    showExportModal,
    setShowExportModal,
    showCleanupModal,
    setShowCleanupModal,

    // === Actions ===
    handleExport,
    handleCleanup,
    exportLogs,

    // === Utilities ===
    hasSelection: selectedLogs.size > 0,
    selectionCount: selectedLogs.size,
  }
}
