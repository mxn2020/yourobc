// src/features/audit-logs/services/AuditLogsService.ts
import { useQuery, useMutation } from '@tanstack/react-query'
import { convexQuery, useConvexMutation } from '@convex-dev/react-query'
import { api } from '@/convex/_generated/api'
import type {
  AuditLogEntry,
  AuditLogFilters,
  AuditLogResponse,
  AuditLogStats,
  MyAuditLogStats,
  CreateAuditLogData,
  AuditLogListOptions,
  AuditLogExportOptions,
  AuditTrail,
  AuditAction,
  AuditEntityType,
  AuditSeverity,
  AuditActionConfig,
  ExportResult
} from '../types/audit-logs.types'
import {
  Activity,
  User,
  Settings,
  Shield,
  Database,
  FileText,
  AlertTriangle,
  Info,
  AlertCircle,
  XCircle,
  Brain,
  FolderOpen,
  Eye,
  Download,
  Upload
} from 'lucide-react'
import { EntityType } from '@/config'
import { Id } from '@/convex/_generated/dataModel'

/**
 * Audit Logs Service - Layer 1: Data Operations
 * Handles USER-LEVEL audit log data fetching, mutations, and business operations
 *
 * IMPORTANT: This service is for regular users viewing their own audit logs
 * For admin operations, use AuditLogsAdminService.ts instead
 */
class AuditLogsService {

  // === User Query Hooks ===

  /**
   * Get current user's own audit logs
   */
  useMyAuditLogs(options: AuditLogListOptions) {
    // Convert frontend options format to match Convex query expectations
    const convexOptions = {
      limit: options.limit,
      offset: options.offset,
      sortBy: options.sortBy,
      sortOrder: options.sortOrder,
      filters: options.filters ? {
        action: Array.isArray(options.filters.action) ? options.filters.action[0] : options.filters.action,
        entityType: Array.isArray(options.filters.entityType) ? options.filters.entityType[0] : options.filters.entityType,
        entityId: options.filters.entityId,
        dateFrom: options.filters.dateFrom,
        dateTo: options.filters.dateTo,
        search: options.filters.search,
      } : undefined
    }

    return useQuery({
      ...convexQuery(api.lib.system.audit_logs.queries.getAuditLogs, {
        options: convexOptions,
      }),
      staleTime: 30000, // 30 seconds
    })
  }

  /**
   * Get current user's own audit log statistics
   * Returns personal stats (no uniqueUsers field)
   */
  useMyAuditLogStats(timeWindow?: 'day' | 'week' | 'month' | 'all'): ReturnType<typeof useQuery<MyAuditLogStats>> {
    return useQuery({
      ...convexQuery(api.lib.system.audit_logs.queries.getMyAuditLogStats, {
        timeWindow,
      }),
      staleTime: 60000, // 1 minute
    })
  }

  /**
   * Get audit logs for a specific entity (any authenticated user can view)
   */
  useEntityAuditLogs(entityType: AuditEntityType, entityId: string, limit?: number) {
    return useQuery({
      ...convexQuery(api.lib.system.audit_logs.queries.getEntityAuditLogs, {
        entityType,
        entityId,
        limit,
      }),
      enabled: !!entityType && !!entityId,
      staleTime: 60000,
    })
  }

  /**
   * Get current user's own audit logs (alias for consistency)
   */
  useUserAuditLogs(limit?: number) {
    return useQuery({
      ...convexQuery(api.lib.system.audit_logs.queries.getUserAuditLogs, {
        limit,
      }),
      staleTime: 60000,
    })
  }

  // === User Mutation Hooks ===

  /**
   * Create an audit log entry (any authenticated user)
   */
  useCreateAuditLog() {
    return useMutation({
      mutationFn: useConvexMutation(api.lib.system.audit_logs.mutations.createAuditLog),
    })
  }

  // === User Business Operations ===

  async createAuditLog(
    mutation: ReturnType<typeof this.useCreateAuditLog>,
    logData: CreateAuditLogData
  ): Promise<string> {
    try {
      return await mutation.mutateAsync({
        ...logData,
      })
    } catch (error) {
      throw new Error(`Failed to create audit log: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // === Data Processing Utilities ===
  filterAuditLogs(logs: AuditLogEntry[], filters: AuditLogFilters): AuditLogEntry[] {
    return logs.filter(log => {
      // User filter
      if (filters.userId && log.userId !== filters.userId) return false
      if (filters.userName && !log.userName.toLowerCase().includes(filters.userName.toLowerCase())) return false

      // Action filter
      if (filters.action) {
        const actions = Array.isArray(filters.action) ? filters.action : [filters.action]
        if (!actions.includes(log.action)) return false
      }

      // Entity type filter
      if (filters.entityType) {
        const entityTypes = Array.isArray(filters.entityType) ? filters.entityType : [filters.entityType]
        if (!entityTypes.includes(log.entityType as EntityType)) return false
      }

      // Entity ID filter
      if (filters.entityId && log.entityId !== filters.entityId) return false

      // Date range filters
      if (filters.dateFrom && log.createdAt < filters.dateFrom) return false
      if (filters.dateTo && log.createdAt > filters.dateTo) return false

      // IP address filter
      if (filters.ipAddress) {
        const metadata = log.metadata as Record<string, unknown> | undefined
        if (metadata && typeof metadata === 'object' && 'ipAddress' in metadata) {
          if (metadata.ipAddress !== filters.ipAddress) return false
        } else {
          return false
        }
      }

      // Session ID filter
      if (filters.sessionId) {
        const metadata = log.metadata as Record<string, unknown> | undefined
        if (metadata && typeof metadata === 'object' && 'sessionId' in metadata) {
          if (metadata.sessionId !== filters.sessionId) return false
        } else {
          return false
        }
      }

      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        const searchableText = [
          log.description,
          log.userName,
          log.entityTitle,
          log.action,
          log.entityType,
        ].join(' ').toLowerCase()

        if (!searchableText.includes(searchTerm)) return false
      }

      return true
    })
  }

  sortAuditLogs(logs: AuditLogEntry[], sortBy: string = 'createdAt', sortOrder: 'asc' | 'desc' = 'desc'): AuditLogEntry[] {
    return [...logs].sort((a, b) => {
      let aValue: number | string
      let bValue: number | string

      switch (sortBy) {
        case 'createdAt':
          aValue = a.createdAt
          bValue = b.createdAt
          break
        case 'action':
          aValue = a.action
          bValue = b.action
          break
        case 'entityType':
          aValue = a.entityType
          bValue = b.entityType
          break
        case 'userName':
          aValue = a.userName
          bValue = b.userName
          break
        default:
          aValue = a.createdAt
          bValue = b.createdAt
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue)
        return sortOrder === 'asc' ? comparison : -comparison
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })
  }

  groupAuditLogsByDate(logs: AuditLogEntry[]): Record<string, AuditLogEntry[]> {
    return logs.reduce((acc, log) => {
      const date = new Date(log.createdAt).toISOString().split('T')[0]
      if (!acc[date]) acc[date] = []
      acc[date].push(log)
      return acc
    }, {} as Record<string, AuditLogEntry[]>)
  }

  groupAuditLogsByUser(logs: AuditLogEntry[]): Record<string, AuditLogEntry[]> {
    return logs.reduce((acc, log) => {
      if (!acc[log.userId]) acc[log.userId] = []
      acc[log.userId].push(log)
      return acc
    }, {} as Record<string, AuditLogEntry[]>)
  }

  groupAuditLogsByEntity(logs: AuditLogEntry[]): Record<string, AuditLogEntry[]> {
    return logs.reduce((acc, log) => {
      const key = `${log.entityType}:${log.entityId || 'unknown'}`
      if (!acc[key]) acc[key] = []
      acc[key].push(log)
      return acc
    }, {} as Record<string, AuditLogEntry[]>)
  }

  generateAuditTrail(logs: AuditLogEntry[], entityType: AuditEntityType, entityId: string): AuditTrail {
    const entityLogs = logs.filter(log =>
      log.entityType === entityType && log.entityId === entityId
    ).sort((a, b) => b.createdAt - a.createdAt)

    const contributors = entityLogs.reduce((acc, log) => {
      const existing = acc.find(c => c.userId === log.userId)
      if (existing) {
        existing.actionCount++
      } else {
        acc.push({
          userId: log.userId,
          userName: log.userName,
          actionCount: 1
        })
      }
      return acc
    }, [] as AuditTrail['contributors'])

    return {
      entityId,
      entityType,
      logs: entityLogs,
      totalChanges: entityLogs.length,
      firstActivity: entityLogs.length > 0 ? entityLogs[entityLogs.length - 1].createdAt : 0,
      lastActivity: entityLogs.length > 0 ? entityLogs[0].createdAt : 0,
      contributors: contributors.sort((a, b) => b.actionCount - a.actionCount)
    }
  }

  // === User Export Functions ===

  /**
   * Export user's own audit logs
   */
  exportMyAuditLogs(logs: AuditLogEntry[], options: AuditLogExportOptions): ExportResult {
    try {
      const filename = options.filename || `my-audit-logs-${new Date().toISOString().split('T')[0]}`

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

    const dateFormat = options.dateFormat || 'YYYY-MM-DD HH:mm:ss'

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

  // === Utility Functions ===
  formatRelativeTime(timestamp: number): string {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 30) return `${days}d ago`
    return new Date(timestamp).toLocaleDateString()
  }

  getActionIcon(action: string): typeof Activity {
    const iconMap: Record<string, typeof Activity> = {
      // User actions
      'user': User,
      'login': User,
      'logout': User,
      'created': User,
      'updated': User,
      'deleted': User,
      'role': Shield,
      'banned': Shield,
      'impersonated': User,

      // System actions
      'settings': Settings,
      'system': Settings,
      'maintenance': Settings,

      // Project actions
      'project': FolderOpen,

      // Security actions
      'security': Shield,
      'permission': Shield,

      // Data actions
      'data': Database,
      'exported': Download,
      'imported': Upload,

      // AI actions
      'ai': Brain,

      // Default
      'default': Activity
    }

    // Find the best match for the action
    const actionKey = Object.keys(iconMap).find(key => action.includes(key)) || 'default'
    return iconMap[actionKey]
  }

  getActionColor(action: string): string {
    if (action.includes('created') || action.includes('activated')) return 'text-green-600'
    if (action.includes('deleted') || action.includes('banned')) return 'text-red-600'
    if (action.includes('updated') || action.includes('role')) return 'text-blue-600'
    if (action.includes('security') || action.includes('failed')) return 'text-orange-600'
    if (action.includes('system') || action.includes('maintenance')) return 'text-purple-600'
    return 'text-gray-600'
  }

  getSeverityIcon(severity: AuditSeverity): typeof Info {
    switch (severity) {
      case 'info':
        return Info
      case 'warning':
        return AlertTriangle
      case 'error':
        return AlertCircle
      case 'critical':
        return XCircle
      default:
        return Info
    }
  }

  getSeverityColor(severity: AuditSeverity): string {
    switch (severity) {
      case 'info':
        return 'text-blue-600 bg-blue-50'
      case 'warning':
        return 'text-yellow-600 bg-yellow-50'
      case 'error':
        return 'text-red-600 bg-red-50'
      case 'critical':
        return 'text-red-800 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  // === Action Configurations ===
  getActionConfig(action: string): AuditActionConfig {
    const configs: Partial<Record<string, AuditActionConfig>> = {
      'user.created': {
        action: 'user.created',
        label: 'User Created',
        description: 'A new user account was created',
        severity: 'info',
        icon: User,
        color: 'green',
        category: 'user',
        autoCapture: true,
        includeMetadata: true,
      },
      'user.role_changed': {
        action: 'user.role_changed',
        label: 'Role Changed',
        description: 'User role was modified',
        severity: 'warning',
        icon: Shield,
        color: 'blue',
        category: 'user',
        autoCapture: true,
        includeMetadata: true,
      },
      'user.banned': {
        action: 'user.banned',
        label: 'User Banned',
        description: 'User account was banned',
        severity: 'error',
        icon: Shield,
        color: 'red',
        category: 'security',
        autoCapture: true,
        includeMetadata: true,
      },
      'settings.updated': {
        action: 'settings.updated',
        label: 'Settings Updated',
        description: 'System settings were modified',
        severity: 'info',
        icon: Settings,
        color: 'gray',
        category: 'system',
        autoCapture: true,
        includeMetadata: true,
      },
    }

    return configs[action] || {
      action: action as AuditAction,
      label: action.replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      description: `Action: ${action}`,
      severity: 'info',
      icon: Activity,
      color: 'gray',
      category: 'system',
      autoCapture: false,
      includeMetadata: false,
    }
  }

  // === Validation ===
  validateAuditLogData(data: CreateAuditLogData): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!data.action) errors.push('Action is required')
    if (!data.entityType) errors.push('Entity type is required')
    if (!data.description) errors.push('Description is required')
    if (data.description && data.description.length > 1000) {
      errors.push('Description must be less than 1000 characters')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  // === Search and Analysis ===
  searchAuditLogs(logs: AuditLogEntry[], searchTerm: string): AuditLogEntry[] {
    if (!searchTerm.trim()) return logs

    const term = searchTerm.toLowerCase()
    return logs.filter(log => {
      const searchableText = [
        log.description,
        log.userName,
        log.entityTitle,
        log.action,
        log.entityType,
        log.metadata?.ipAddress,
        log.metadata?.userAgent,
      ].join(' ').toLowerCase()

      return searchableText.includes(term)
    })
  }

  analyzeAuditLogPatterns(logs: AuditLogEntry[]): {
    mostActiveUsers: Array<{ userId: Id<"userProfiles">; userName: string; count: number }>
    mostCommonActions: Array<{ action: string; count: number }>
    activityByHour: Array<{ hour: number; count: number }>
    suspiciousActivity: AuditLogEntry[]
  } {
    // Most active users
    const userActivity = logs.reduce((acc, log) => {
      const key = `${log.userId}:${log.userName}`
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const mostActiveUsers = Object.entries(userActivity)
      .map(([key, count]) => {
        const [userId, userName] = key.split(':')
        return {
          userId: userId as Id<"userProfiles">,
          userName,
          count
        }
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Most common actions
    const actionCounts = logs.reduce((acc, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const mostCommonActions = Object.entries(actionCounts)
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Activity by hour
    const hourlyActivity = logs.reduce((acc, log) => {
      const hour = new Date(log.createdAt).getHours()
      acc[hour] = (acc[hour] || 0) + 1
      return acc
    }, {} as Record<number, number>)

    const activityByHour = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      count: hourlyActivity[hour] || 0
    }))

    // Suspicious activity (basic detection)
    const suspiciousActivity = logs.filter(log => {
      // High number of failed login attempts
      if (log.action === 'security.login_failed') return true

      // Permission denied events
      if (log.action === 'security.permission_denied') return true

      // Multiple role changes in short time
      if (log.action === 'user.role_changed') return true

      return false
    })

    return {
      mostActiveUsers,
      mostCommonActions,
      activityByHour,
      suspiciousActivity
    }
  }
}

export const auditLogsService = new AuditLogsService()