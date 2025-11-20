// src/features/audit-logs/index.ts - Audit Logs Feature Package

// === Pages ===
export { AuditLogsPage } from './pages/AuditLogsPage'
export { AuditLogDetailPage } from './pages/AuditLogDetailPage'
export { MyAuditLogsPage } from './pages/MyAuditLogsPage'

// === Components ===
export { AuditLogTableComponent } from './components/AuditLogTable'
export { AuditLogCard } from './components/AuditLogCard'
export { AuditLogList } from './components/AuditLogList'
export { AuditLogGrid } from './components/AuditLogGrid'
export { AuditLogFiltersComponent } from './components/AuditLogFilters'
export { AuditLogStatsComponent } from './components/AuditLogStats'

// === Services ===
export { auditLogsService } from './services/AuditLogsService'
export { auditLogsAdminService } from './services/AuditLogsAdminService'

// === Hooks ===
// User-level hooks
export {
  useMyAuditLogs,
  useEntityAuditTrail,
  useUserAuditLogs,
  useMyAuditLogStats,
} from './hooks/useAuditLogs'

// Admin-level hooks
export {
  useAdminAuditLogs,
  useAdminUserAuditLogs,
  useAdminAuditLogStats,
  useAdminRecentActivity,
  useAuditLogManagement,
} from './hooks/useAdminAuditLogs'

// === Types ===
export type {
  // Core types
  AuditLogEntry,
  AuditLogFilters,
  AuditLogResponse,
  AuditLogStats,
  CreateAuditLogData,
  AuditLogListOptions,
  AuditOperation,
  AuditAction,
  AuditEntityType,
  AuditSeverity,
  AuditMetadata,
  
  // Component types
  AuditLogTableProps,
  AuditLogFiltersProps,
  AuditLogStatsProps,
  AuditLogDetailProps,
  AuditLogExportProps,
  
  // Service types
  AuditLogServiceConfig,
  AuditLogExportOptions,
  ExportResult,
  AuditTrail,
  AuditActionConfig,
  
  // Utility types
  AuditLogError,
  AuditLogEventHandler,
  AuditLogMiddleware,
  AuditLogPlugin,
  AuditLogSubscriptionOptions,
} from './types/audit-logs.types'

// === Constants ===
export {
  AUDIT_LOG_CONSTANTS,
  DEFAULT_AUDIT_LOG_CONFIG,
  AUDIT_LOG_PERMISSIONS
} from './types/audit-logs.constants'

// === Helpers ===
export { AuditLogHelpers } from './utils/audit-logs.helpers'

// === Query Keys ===
export { auditLogsQueryKeys } from './types/audit-logs.types'

// === Utility Functions ===
export {
  // Re-export key utility functions from service for external use
} from './services/AuditLogsService'

// === Context Providers (for future use) ===
// export { AuditLogsProvider, useAuditLogsContext } from './contexts/AuditLogsContext'

// === Higher Order Components ===
// export { withAuditLogging } from './components/withAuditLogging'