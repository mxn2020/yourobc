// filepath: src/features/system/admin/hooks/useAnalyticsAudit.ts
import { useState, useCallback, useMemo } from 'react'
import { auditAnalyticsService } from '../services/AuditAnalyticsService'
import type {
  AuditLogFilters,
  UserAnalytics,
  AdminStats
} from '../types/admin.types'
import { UserProfile } from '../../auth/types/auth.types'

/**
 * Analytics and audit hook - handles admin audit logs, analytics, and reporting
 */
export function useAnalyticsAudit() {
  const [auditFilters, setAuditFilters] = useState<AuditLogFilters>({
    limit: 50,
    offset: 0,
  })

  // === Queries ===
  const { data: auditLogs, isPending: isLoadingAudit, error: auditError } =
    auditAnalyticsService.useAuditLogs(auditFilters)

  const { data: auditStats, isPending: isLoadingAuditStats } =
    auditAnalyticsService.useAuditLogStats()

  const { data: userProfileStats, isPending: isLoadingProfileStats } =
    auditAnalyticsService.useUserProfileStats()

  // === Analytics Generation ===
  const generateUserAnalytics = useCallback((users: UserProfile[]): UserAnalytics => {
    return auditAnalyticsService.generateUserAnalytics(users)
  }, [])

  const formatAdminStats = useCallback((rawStats: any): AdminStats => {
    return auditAnalyticsService.formatAdminStats(rawStats)
  }, [])

  const formatStatsForDisplay = useCallback((stats: AdminStats) => {
    return auditAnalyticsService.formatStatsForDisplay(stats)
  }, [])

  // === Audit Log Management ===
  const updateAuditFilters = useCallback((newFilters: Partial<AuditLogFilters>) => {
    setAuditFilters(prev => ({ ...prev, ...newFilters, offset: 0 }))
  }, [])

  const resetAuditFilters = useCallback(() => {
    setAuditFilters({ limit: 50, offset: 0 })
  }, [])

  const nextAuditPage = useCallback(() => {
    setAuditFilters(prev => ({
      ...prev,
      offset: (prev.offset || 0) + (prev.limit || 50)
    }))
  }, [])

  const previousAuditPage = useCallback(() => {
    setAuditFilters(prev => ({
      ...prev,
      offset: Math.max(0, (prev.offset || 0) - (prev.limit || 50))
    }))
  }, [])

  // === Data Processing ===
  const processedAuditLogs = useMemo(() => {
    if (!auditLogs?.logs) return []
    return auditLogs.logs.map(log => ({
      ...log,
      formattedTime: auditAnalyticsService.formatRelativeTime(log.createdAt),
      actionIcon: auditAnalyticsService.getActionIcon(log.action),
      actionColor: auditAnalyticsService.getActionColor(log.action),
    }))
  }, [auditLogs])

  const auditLogsByDate = useMemo(() => {
    if (!auditLogs?.logs) return {}
    return auditAnalyticsService.groupAuditLogsByDate(auditLogs.logs)
  }, [auditLogs])

  const auditLogsByUser = useMemo(() => {
    if (!auditLogs?.logs) return {}
    return auditAnalyticsService.groupAuditLogsByUser(auditLogs.logs)
  }, [auditLogs])

  const auditSummary = useMemo(() => {
    if (!auditLogs?.logs) return null
    return auditAnalyticsService.getAuditLogSummary(auditLogs.logs)
  }, [auditLogs])

  // === Export Functions ===
  const exportAuditLogs = useCallback((format: 'csv' | 'json' = 'csv') => {
    if (!auditLogs?.logs) return ''
    return auditAnalyticsService.exportAuditLogs(auditLogs.logs, format)
  }, [auditLogs])

  const exportUserAnalytics = useCallback((analytics: UserAnalytics, format: 'csv' | 'json' = 'json') => {
    return auditAnalyticsService.exportUserAnalytics(analytics, format)
  }, [])

  const downloadExport = useCallback((data: string, filename: string, format: 'csv' | 'json') => {
    const mimeType = format === 'csv' ? 'text/csv' : 'application/json'
    const blob = new Blob([data], { type: mimeType })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}.${format}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [])

  // === Pagination ===
  const currentAuditPage = useMemo(() => {
    const limit = auditFilters.limit || 50
    return Math.floor((auditFilters.offset || 0) / limit)
  }, [auditFilters])

  const hasNextAuditPage = useMemo(() => {
    return auditLogs?.hasMore || false
  }, [auditLogs])

  const hasPreviousAuditPage = useMemo(() => {
    return (auditFilters.offset || 0) > 0
  }, [auditFilters.offset])

  // === Computed Analytics ===
  const dashboardStats = useMemo(() => {
    if (!userProfileStats) return null
    
    const formatted = formatAdminStats(userProfileStats)
    return formatStatsForDisplay(formatted)
  }, [userProfileStats, formatAdminStats, formatStatsForDisplay])

  // === Loading States ===
  const isLoading = useMemo(() => {
    return isLoadingAudit || isLoadingAuditStats || isLoadingProfileStats
  }, [isLoadingAudit, isLoadingAuditStats, isLoadingProfileStats])

  return {
    // === Audit Logs ===
    auditLogs: processedAuditLogs,
    auditTotal: auditLogs?.total || 0,
    auditStats,
    auditSummary,
    auditLogsByDate,
    auditLogsByUser,
    isLoadingAudit,
    auditError,

    // === Analytics ===
    userProfileStats,
    dashboardStats,
    isLoadingProfileStats,

    // === Loading States ===
    isLoading,
    isLoadingAuditStats,

    // === Audit Filters and Pagination ===
    auditFilters,
    updateAuditFilters,
    resetAuditFilters,
    currentAuditPage,
    nextAuditPage,
    previousAuditPage,
    hasNextAuditPage,
    hasPreviousAuditPage,

    // === Analytics Generation ===
    generateUserAnalytics,
    formatAdminStats,
    formatStatsForDisplay,

    // === Export Functions ===
    exportAuditLogs,
    exportUserAnalytics,
    downloadExport,

    // === Utilities ===
    formatNumber: auditAnalyticsService.formatNumber,
    formatCurrency: auditAnalyticsService.formatCurrency,
    formatPercentage: auditAnalyticsService.formatPercentage,
    formatRelativeTime: auditAnalyticsService.formatRelativeTime,
    getActionIcon: auditAnalyticsService.getActionIcon,
    getActionColor: auditAnalyticsService.getActionColor,
    filterAuditLogs: auditAnalyticsService.filterAuditLogs,
    groupAuditLogsByDate: auditAnalyticsService.groupAuditLogsByDate,
    groupAuditLogsByUser: auditAnalyticsService.groupAuditLogsByUser,
    getAuditLogSummary: auditAnalyticsService.getAuditLogSummary,
  }
}