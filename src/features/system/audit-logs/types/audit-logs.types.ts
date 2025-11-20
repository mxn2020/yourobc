// src/features/audit-logs/types/audit-logs.types.ts
import type { Doc, Id } from "@/convex/_generated/dataModel"
import { LucideIcon } from 'lucide-react'

export type AuditLog = Doc<"auditLogs">
export type AuditLogId = Id<"auditLogs">

// === Audit Log Types ===
// Use Convex's Doc type directly to ensure compatibility with database schema
export type AuditLogEntry = Doc<"auditLogs">

export interface AuditMetadata {
  source?: string
  operation?: AuditOperation
  oldValues?: Record<string, unknown>
  newValues?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
  sessionId?: string
  requestId?: string
  traceId?: string
  [key: string]: unknown
}

// === Processed Audit Log Entry (with computed properties) ===
export interface ProcessedAuditLogEntry extends AuditLogEntry {
  formattedTime: string
  actionIcon: LucideIcon
  actionColor: string
  actionConfig: AuditActionConfig
}

export type AuditOperation = 'create' | 'update' | 'delete' | 'view' | 'export' | 'security' 

// === Audit Actions ===
export type AuditAction = 
  // User actions
  | 'user.created'
  | 'user.updated'
  | 'user.deleted'
  | 'user.activated'
  | 'user.deactivated'
  | 'user.role_changed'
  | 'user.banned'
  | 'user.unbanned'
  | 'user.password_reset'
  | 'user.login'
  | 'user.logout'
  | 'user.profile_created'
  | 'user.profile_updated'
  | 'user.impersonated'
  | 'user.sessions_revoked'
  
  // Project actions
  | 'project.created'
  | 'project.updated'
  | 'project.deleted'
  | 'project.hard_deleted'
  | 'project.shared'
  | 'project.archived'
  | 'project.restored'
  | 'project.viewed'
  | 'project.progress.updated'
  | 'project.collaborator.added'
  | 'project.collaborator.removed'
  | 'project.collaborator.role_updated'
  
  // System actions
  | 'settings.updated'
  | 'settings.reset'
  | 'system.maintenance'
  | 'system.backup'
  | 'system.restore'
  
  // AI actions
  | 'ai.request'
  | 'ai.test'
  | 'ai.settings_updated'
  
  // Security actions
  | 'security.login_failed'
  | 'security.account_locked'
  | 'security.permission_denied'
  | 'security.suspicious_activity'
  
  // Data actions
  | 'data.exported'
  | 'data.imported'
  | 'data.backup_created'
  | 'data.backup_restored'
  
  // Admin actions
  | 'admin.bulk_action'
  | 'admin.impersonation_started'
  | 'admin.impersonation_ended'
  | 'audit.viewed'
  | 'audit.exported'

// === Entity Types ===
// Full entity type union - Now managed via configuration system
//
// TO CUSTOMIZE ENTITY TYPES:
// - DO NOT modify this file
// - Instead, edit: convex/config/app/entities.config.ts
// - Add your app/addon entities there
//
// Import from config for single source of truth
import type { EntityType } from '@/config';
export type AuditEntityType = EntityType;

// === Audit Severity Levels ===
export type AuditSeverity = 'info' | 'warning' | 'error' | 'critical'

// === Audit Log Filters ===
// Pure filter criteria only (no pagination/sorting)
export interface AuditLogFilters {
  userId?: Id<"userProfiles">
  userName?: string
  action?: string | string[] // Accept any string since Convex stores as string
  entityType?: AuditEntityType | AuditEntityType[]
  entityId?: string
  severity?: AuditSeverity | AuditSeverity[]
  dateFrom?: number
  dateTo?: number
  search?: string
  ipAddress?: string
  sessionId?: string
}

// === Audit Log List Options ===
export interface AuditLogListOptions {
  limit?: number
  offset?: number
  filters?: AuditLogFilters
  sortBy?: 'createdAt' | 'action' | 'entityType' | 'userName'
  sortOrder?: 'asc' | 'desc'
}

// === Audit Log Statistics ===

// Base statistics shared by both personal and admin stats
export interface BaseAuditLogStats {
  totalLogs: number
  logsLast24h: number
  logsLastWeek: number
  logsLastMonth: number
  topActions: Record<string, number>
  topEntityTypes: Record<string, number>
  timeWindow?: 'day' | 'week' | 'month' | 'all'
}

// Personal audit log statistics (user-level)
// Returned by getMyAuditLogStats - shows stats for current user only
export interface MyAuditLogStats extends BaseAuditLogStats {
  // Personal stats don't include uniqueUsers (always 1 for single user)
  // or dataLimited (personal queries are never limited)
}

// Admin audit log statistics (system-wide)
// Returned by adminGetAuditLogStats - shows stats across all users
export interface AdminAuditLogStats extends BaseAuditLogStats {
  uniqueUsers: number
  dataLimited?: boolean // Indicates if results are capped at max query limit
  severityBreakdown?: Record<AuditSeverity, number> // Optional enhanced stats
  activityByHour?: Array<{
    hour: number
    count: number
  }> // Optional enhanced stats
  activityByDay?: Array<{
    date: string
    count: number
  }> // Optional enhanced stats
}

// Legacy type for backward compatibility - defaults to admin stats
export type AuditLogStats = AdminAuditLogStats

// === Audit Log Response Types ===
export interface AuditLogResponse {
  logs: AuditLogEntry[]
  total: number
  hasMore: boolean
  filters?: AuditLogFilters
}

export interface AuditLogSearchResponse {
  logs: AuditLogEntry[]
  total: number
  searchTerm: string
  categories?: string[]
}

// === Component Types ===
export interface AuditLogTableProps {
  logs: AuditLogEntry[]
  loading?: boolean
  onRowClick?: (log: AuditLogEntry) => void
  showUser?: boolean
  showEntity?: boolean
  showMetadata?: boolean
  compact?: boolean
}

export interface AuditLogFiltersProps {
  filters: AuditLogFilters
  onFiltersChange: (filters: Partial<AuditLogFilters>) => void
  onReset: () => void
  loading?: boolean
}

export interface AuditLogStatsProps {
  stats: AuditLogStats
  loading?: boolean
}

export interface AuditLogDetailProps {
  log: AuditLogEntry
  onClose: () => void
}

export interface AuditLogExportProps {
  onExport: (format: 'csv' | 'json', filters?: AuditLogFilters) => void
  loading?: boolean
}

// === Service Types ===
export interface CreateAuditLogData {
  action: AuditAction
  entityType: AuditEntityType
  entityId?: string
  entityTitle?: string
  description: string
  metadata?: AuditMetadata
}

export interface AuditLogServiceConfig {
  retentionDays?: number
  maxLogsPerQuery?: number
  enableRealTimeUpdates?: boolean
  autoCapture?: {
    userActions?: boolean
    systemActions?: boolean
    apiRequests?: boolean
  }
}

// === Audit Trail Types ===
export interface AuditTrail {
  entityId: string
  entityType: AuditEntityType
  logs: AuditLogEntry[]
  totalChanges: number
  firstActivity: number
  lastActivity: number
  contributors: Array<{
    userId: Id<"userProfiles">
    userName: string
    actionCount: number
  }>
}

// === Export Types ===
export interface AuditLogExportOptions {
  format: 'csv' | 'json' | 'pdf'
  filters?: AuditLogFilters
  includeMetadata?: boolean
  includeUserDetails?: boolean
  dateFormat?: string
  filename?: string
}

export interface ExportResult {
  success: boolean
  filename: string
  downloadUrl?: string
  error?: string
}

// === Real-time Types ===
export interface AuditLogSubscriptionOptions {
  filters?: Pick<AuditLogFilters, 'userId' | 'action' | 'entityType' | 'severity'>
  onNewLog?: (log: AuditLogEntry) => void
  onError?: (error: Error) => void
}

// === Action Configuration ===
export interface AuditActionConfig {
  action: AuditAction
  label: string
  description: string
  severity: AuditSeverity
  icon: LucideIcon
  color: string
  category: 'user' | 'project' | 'system' | 'security' | 'data' | 'admin'
  autoCapture: boolean
  includeMetadata: boolean
  retentionDays?: number
}

// === Query Keys ===
export const auditLogsQueryKeys = {
  auditLogs: {
    all: () => ['auditLogs'] as const,
    lists: () => ['auditLogs', 'list'] as const,
    list: (filters?: AuditLogFilters) => ['auditLogs', 'list', filters] as const,
    details: () => ['auditLogs', 'detail'] as const,
    detail: (id: string) => ['auditLogs', 'detail', id] as const,
    stats: () => ['auditLogs', 'stats'] as const,
    trail: (entityType: AuditEntityType, entityId: string) => 
      ['auditLogs', 'trail', entityType, entityId] as const,
    search: (term: string, filters?: Partial<AuditLogFilters>) => 
      ['auditLogs', 'search', term, filters] as const,
  },
} as const

// === Error Types ===
export interface AuditLogError {
  code: 'AUDIT_LOG_NOT_FOUND' | 'AUDIT_LOG_ACCESS_DENIED' | 'AUDIT_LOG_INVALID_FILTER' | 'AUDIT_LOG_EXPORT_FAILED'
  message: string
  details?: Record<string, any>
}

// === Utility Types ===
export type AuditLogEventHandler = (log: CreateAuditLogData) => void | Promise<void>

export interface AuditLogMiddleware {
  name: string
  priority: number
  handler: AuditLogEventHandler
  conditions?: (log: CreateAuditLogData) => boolean
}

export interface AuditLogPlugin {
  name: string
  version: string
  initialize: (config: AuditLogServiceConfig) => void
  middleware?: AuditLogMiddleware[]
}