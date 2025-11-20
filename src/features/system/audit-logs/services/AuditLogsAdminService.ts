// src/features/system/audit-logs/services/AuditLogsAdminService.ts
import { useQuery, useMutation } from '@tanstack/react-query'
import { convexQuery, useConvexMutation } from '@convex-dev/react-query'
import { api } from '@/convex/_generated/api'
import type {
  AuditLogEntry,
  AuditLogFilters,
  AuditLogResponse,
  AuditLogStats,
  AdminAuditLogStats,
  CreateAuditLogData,
  AuditLogListOptions,
  AuditLogExportOptions,
  ExportResult
} from '../types/audit-logs.types'
import { Id } from '@/convex/_generated/dataModel'

/**
 * Audit Logs Admin Service - Layer 1: Data Operations
 * Handles all ADMIN-ONLY audit log data fetching and mutations
 *
 * IMPORTANT: This service should only be used in admin contexts
 * Regular users should use AuditLogsService.ts instead
 */
class AuditLogsAdminService {

  // ==========================================
  // QUERY OPTION FACTORIES
  // These methods return query options that can be used in both loaders and hooks
  // ensuring consistent query keys for SSR cache hits
  // ==========================================

  getAdminAuditLogsQueryOptions(options: AuditLogListOptions) {
    // Convert frontend options format to match Convex query expectations
    const convexOptions = {
      limit: options.limit,
      offset: options.offset,
      sortBy: options.sortBy,
      sortOrder: options.sortOrder,
      filters: options.filters ? {
        userId: options.filters.userId,
        action: Array.isArray(options.filters.action) ? options.filters.action[0] : options.filters.action,
        entityType: Array.isArray(options.filters.entityType) ? options.filters.entityType[0] : options.filters.entityType,
        entityId: options.filters.entityId,
        dateFrom: options.filters.dateFrom,
        dateTo: options.filters.dateTo,
        search: options.filters.search,
        userName: options.filters.userName,
        ipAddress: options.filters.ipAddress,
        sessionId: options.filters.sessionId,
      } : undefined
    };

    return convexQuery(api.lib.system.audit_logs.admin_queries.adminGetAuditLogs, {
      options: convexOptions,
    });
  }

  getAdminAuditLogStatsQueryOptions(timeWindow?: 'day' | 'week' | 'month' | 'all') {
    return convexQuery(api.lib.system.audit_logs.admin_queries.adminGetAuditLogStats, {
      timeWindow,
    });
  }

  getAdminUserAuditLogsQueryOptions(targetUserId: Id<"userProfiles">, limit?: number) {
    return convexQuery(api.lib.system.audit_logs.admin_queries.adminGetUserAuditLogs, {
      targetUserId,
      limit,
    });
  }

  getAdminRecentActivityQueryOptions(limit?: number) {
    return convexQuery(api.lib.system.audit_logs.admin_queries.adminGetRecentActivity, {
      limit,
    });
  }

  // === Admin Query Hooks ===

  /**
   * Get all audit logs with advanced filtering (admin-only)
   * Allows filtering by any user, viewing all logs, etc.
   */
  useAdminAuditLogs(options: AuditLogListOptions) {
    // Convert frontend options format to match Convex query expectations
    const convexOptions = {
      limit: options.limit,
      offset: options.offset,
      sortBy: options.sortBy,
      sortOrder: options.sortOrder,
      filters: options.filters ? {
        userId: options.filters.userId,
        action: Array.isArray(options.filters.action) ? options.filters.action[0] : options.filters.action,
        entityType: Array.isArray(options.filters.entityType) ? options.filters.entityType[0] : options.filters.entityType,
        entityId: options.filters.entityId,
        dateFrom: options.filters.dateFrom,
        dateTo: options.filters.dateTo,
        search: options.filters.search,
        userName: options.filters.userName,
        ipAddress: options.filters.ipAddress,
        sessionId: options.filters.sessionId,
      } : undefined
    }

    return useQuery({
      ...convexQuery(api.lib.system.audit_logs.admin_queries.adminGetAuditLogs, {
        options: convexOptions,
      }),
      staleTime: 30000, // 30 seconds
    })
  }

  /**
   * Get system-wide audit log statistics (admin-only)
   * Returns admin stats (includes uniqueUsers and dataLimited)
   */
  useAdminAuditLogStats(timeWindow?: 'day' | 'week' | 'month' | 'all'): ReturnType<typeof useQuery<AdminAuditLogStats>> {
    return useQuery({
      ...convexQuery(api.lib.system.audit_logs.admin_queries.adminGetAuditLogStats, {
        timeWindow,
      }),
      staleTime: 60000, // 1 minute
    })
  }

  /**
   * Get audit logs for a specific user (admin-only)
   */
  useAdminUserAuditLogs(targetUserId: Id<"userProfiles">, limit?: number) {
    return useQuery({
      ...convexQuery(api.lib.system.audit_logs.admin_queries.adminGetUserAuditLogs, {
        targetUserId,
        limit,
      }),
      enabled: !!targetUserId,
      staleTime: 60000,
    })
  }

  /**
   * Get recent activity across all users (admin-only)
   */
  useAdminRecentActivity(limit?: number) {
    return useQuery({
      ...convexQuery(api.lib.system.audit_logs.admin_queries.adminGetRecentActivity, {
        limit,
      }),
      staleTime: 30000,
    })
  }

  // === Admin Mutation Hooks ===

  /**
   * Cleanup old audit logs (admin-only)
   */
  useCleanupOldAuditLogs() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.system.audit_logs.mutations.cleanupOldAuditLogs),
    })
  }

  /**
   * Bulk create audit logs (admin-only)
   */
  useBulkCreateAuditLogs() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.system.audit_logs.mutations.bulkCreateAuditLogs),
    })
  }

  // === Admin Business Operations ===

  async bulkCreateAuditLogs(
    mutation: ReturnType<typeof this.useBulkCreateAuditLogs>,
    logs: CreateAuditLogData[]
  ): Promise<{ created: number; logIds: string[] }> {
    try {
      return await mutation.mutateAsync({
        logs,
      })
    } catch (error) {
      throw new Error(`Failed to create bulk audit logs: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async cleanupOldAuditLogs(
    mutation: ReturnType<typeof this.useCleanupOldAuditLogs>
  ): Promise<number> {
    try {
      return await mutation.mutateAsync({})
    } catch (error) {
      throw new Error(`Failed to cleanup old audit logs: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // === Admin Export Functions ===

  /**
   * Export audit logs (admin-only, can export all logs)
   */
  exportAuditLogs(logs: AuditLogEntry[], options: AuditLogExportOptions): ExportResult {
    try {
      const filename = options.filename || `audit-logs-admin-${new Date().toISOString().split('T')[0]}`

      switch (options.format) {
        case 'csv':
          return this.exportAuditLogsAsCSV(logs, filename, options)
        case 'json':
          return this.exportAuditLogsAsJSON(logs, filename, options)
        case 'pdf':
          return this.exportAuditLogsAsPDF(logs, filename, options)
        default:
          throw new Error(`Unsupported export format: ${options.format}`)
      }
    } catch (error) {
      return {
        success: false,
        filename: '',
        error: error instanceof Error ? error.message : 'Export failed'
      }
    }
  }

  private exportAuditLogsAsCSV(logs: AuditLogEntry[], filename: string, options: AuditLogExportOptions): ExportResult {
    const headers = [
      'Timestamp',
      'User',
      'Action',
      'Entity Type',
      'Entity ID',
      'Entity Title',
      'Description'
    ]

    if (options.includeUserDetails) {
      headers.push('User ID')
    }

    if (options.includeMetadata) {
      headers.push('IP Address', 'User Agent', 'Session ID')
    }

    const rows = logs.map(log => {
      const row = [
        new Date(log.createdAt).toISOString(),
        log.userName,
        log.action,
        log.entityType,
        log.entityId || '',
        log.entityTitle || '',
        log.description
      ]

      if (options.includeUserDetails) {
        row.push(log.userId)
      }

      if (options.includeMetadata) {
        const metadata = log.metadata as Record<string, unknown> | undefined
        const ipAddress = metadata && 'ipAddress' in metadata ? String(metadata.ipAddress || '') : ''
        const userAgent = metadata && 'userAgent' in metadata ? String(metadata.userAgent || '') : ''
        const sessionId = metadata && 'sessionId' in metadata ? String(metadata.sessionId || '') : ''
        row.push(ipAddress, userAgent, sessionId)
      }

      return row
    })

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    this.downloadFile(csvContent, `${filename}.csv`, 'text/csv')

    return {
      success: true,
      filename: `${filename}.csv`
    }
  }

  private exportAuditLogsAsJSON(logs: AuditLogEntry[], filename: string, options: AuditLogExportOptions): ExportResult {
    const exportData = {
      metadata: {
        exportedAt: new Date().toISOString(),
        exportedBy: 'admin',
        totalRecords: logs.length,
        filters: options.filters,
        includeMetadata: options.includeMetadata,
        includeUserDetails: options.includeUserDetails,
      },
      logs: logs.map(log => ({
        timestamp: new Date(log.createdAt).toISOString(),
        user: options.includeUserDetails ? {
          id: log.userId,
          name: log.userName
        } : log.userName,
        action: log.action,
        entity: {
          type: log.entityType,
          id: log.entityId,
          title: log.entityTitle
        },
        description: log.description,
        ...(options.includeMetadata && log.metadata && {
          metadata: log.metadata
        })
      }))
    }

    const jsonContent = JSON.stringify(exportData, null, 2)
    this.downloadFile(jsonContent, `${filename}.json`, 'application/json')

    return {
      success: true,
      filename: `${filename}.json`
    }
  }

  private exportAuditLogsAsPDF(logs: AuditLogEntry[], filename: string, options: AuditLogExportOptions): ExportResult {
    // For PDF export, we would typically use a library like jsPDF or similar
    // For now, we'll return an error indicating it's not implemented
    return {
      success: false,
      filename: '',
      error: 'PDF export not implemented yet'
    }
  }

  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
}

export const auditLogsAdminService = new AuditLogsAdminService()
