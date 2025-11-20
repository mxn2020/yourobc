// convex/lib/software/yourobc/employeeSessions/types.ts
/**
 * Employee Sessions Library Types
 *
 * TypeScript types and interfaces for employee sessions business logic.
 * Extends schema types with additional runtime and API types.
 * Includes types for both sessions and work hours summary.
 *
 * @module convex/lib/software/yourobc/employeeSessions/types
 */

import { Doc, Id } from '../../../../_generated/dataModel'

// ============================================================================
// Document Types
// ============================================================================

/**
 * Employee Session document type
 */
export type EmployeeSession = Doc<'yourobcEmployeeSessions'>

/**
 * Employee Session ID type
 */
export type EmployeeSessionId = Id<'yourobcEmployeeSessions'>

/**
 * Work Hours Summary document type
 */
export type WorkHoursSummary = Doc<'yourobcWorkHoursSummary'>

/**
 * Work Hours Summary ID type
 */
export type WorkHoursSummaryId = Id<'yourobcWorkHoursSummary'>

// ============================================================================
// Break Types
// ============================================================================

/**
 * Break entry in a session
 */
export interface BreakEntry {
  startTime: number
  endTime?: number
  type: 'lunch' | 'coffee' | 'personal' | 'meeting'
  duration?: number
}

/**
 * Device information
 */
export interface DeviceInfo {
  userAgent?: string
  platform?: string
  browser?: string
}

// ============================================================================
// Create/Update Types - Employee Sessions
// ============================================================================

/**
 * Fields required to create a new employee session
 */
export interface CreateSessionInput {
  employeeId: string
  userProfileId: string
  authUserId: string
  loginTime: number
  sessionType?: 'manual' | 'automatic'
  device?: DeviceInfo
  ipAddress?: string
  tags?: string[]
  category?: string
  metadata?: any
}

/**
 * Fields that can be updated on an existing session
 */
export interface UpdateSessionInput {
  logoutTime?: number
  duration?: number
  lastActivity?: number
  isActive?: boolean
  inactivityStartTime?: number
  sessionType?: 'manual' | 'automatic'
  device?: DeviceInfo
  ipAddress?: string
  breaks?: BreakEntry[]
  tags?: string[]
  category?: string
  metadata?: any
}

// ============================================================================
// Create/Update Types - Work Hours Summary
// ============================================================================

/**
 * Fields required to create a new work hours summary
 */
export interface CreateWorkHoursSummaryInput {
  employeeId: string
  year: number
  month: number
  day?: number
  totalMinutes: number
  totalHours: number
  breakMinutes: number
  netMinutes: number
  netHours: number
  sessionCount: number
  regularHours: number
  overtimeHours: number
  expectedHours: number
  tags?: string[]
  category?: string
  metadata?: any
}

/**
 * Fields that can be updated on an existing work hours summary
 */
export interface UpdateWorkHoursSummaryInput {
  totalMinutes?: number
  totalHours?: number
  breakMinutes?: number
  netMinutes?: number
  netHours?: number
  sessionCount?: number
  regularHours?: number
  overtimeHours?: number
  expectedHours?: number
  tags?: string[]
  category?: string
  metadata?: any
}

// ============================================================================
// Query Types
// ============================================================================

/**
 * Filter options for session queries
 */
export interface SessionFilters {
  employeeId?: string
  userProfileId?: string
  authUserId?: string
  isActive?: boolean
  sessionType?: 'manual' | 'automatic'
  ownerId?: string
  includeDeleted?: boolean
  loginAfter?: number
  loginBefore?: number
  logoutAfter?: number
  logoutBefore?: number
}

/**
 * Filter options for work hours summary queries
 */
export interface WorkHoursSummaryFilters {
  employeeId?: string
  year?: number
  month?: number
  day?: number
  ownerId?: string
  includeDeleted?: boolean
  periodType?: 'daily' | 'monthly'
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  limit?: number
  cursor?: string
}

/**
 * Search options for sessions
 */
export interface SearchSessionsOptions extends SessionFilters {
  searchTerm?: string
  sortBy?: 'loginTime' | 'logoutTime' | 'duration' | 'lastActivity'
  sortOrder?: 'asc' | 'desc'
  pagination?: PaginationOptions
}

/**
 * Search options for work hours summaries
 */
export interface SearchWorkHoursSummaryOptions extends WorkHoursSummaryFilters {
  sortBy?: 'year' | 'month' | 'day' | 'totalHours' | 'overtimeHours'
  sortOrder?: 'asc' | 'desc'
  pagination?: PaginationOptions
}

// ============================================================================
// Session Management Types
// ============================================================================

/**
 * Session login data
 */
export interface SessionLogin {
  employeeId: string
  userProfileId: string
  authUserId: string
  loginTime: number
  sessionType: 'manual' | 'automatic'
  device?: DeviceInfo
  ipAddress?: string
}

/**
 * Session logout data
 */
export interface SessionLogout {
  sessionId: string
  logoutTime: number
  duration: number
}

/**
 * Activity update data
 */
export interface ActivityUpdate {
  sessionId: string
  lastActivity: number
  isActive: boolean
  inactivityStartTime?: number
}

/**
 * Break start data
 */
export interface BreakStart {
  sessionId: string
  startTime: number
  type: 'lunch' | 'coffee' | 'personal' | 'meeting'
}

/**
 * Break end data
 */
export interface BreakEnd {
  sessionId: string
  breakIndex: number
  endTime: number
  duration: number
}

// ============================================================================
// Statistics Types
// ============================================================================

/**
 * Session statistics for an employee
 */
export interface SessionStats {
  total: number
  active: number
  inactive: number
  totalDuration: number
  averageDuration: number
  totalBreakTime: number
  averageBreakTime: number
  longestSession: number
  shortestSession: number
}

/**
 * Work hours statistics for an employee
 */
export interface WorkHoursStats {
  totalHours: number
  totalBreakHours: number
  netHours: number
  overtimeHours: number
  averageDailyHours: number
  sessionsCount: number
  daysWorked: number
}

/**
 * Time period for reporting
 */
export interface TimePeriod {
  year: number
  month?: number
  day?: number
}

/**
 * Work hours report data
 */
export interface WorkHoursReport {
  period: TimePeriod
  employee: {
    id: string
    name: string
  }
  summary: WorkHoursSummary
  sessions: EmployeeSession[]
  stats: WorkHoursStats
}

// ============================================================================
// Permission Types
// ============================================================================

/**
 * Permission check result
 */
export interface PermissionCheckResult {
  allowed: boolean
  reason?: string
}

/**
 * Permission context for authorization checks
 */
export interface PermissionContext {
  userId: string
  session?: EmployeeSession
  workHoursSummary?: WorkHoursSummary
  action: 'read' | 'create' | 'update' | 'delete' | 'login' | 'logout'
}

// ============================================================================
// Validation Types
// ============================================================================

/**
 * Session validation result
 */
export interface SessionValidationResult {
  valid: boolean
  errors: string[]
}

/**
 * Work hours summary validation result
 */
export interface WorkHoursSummaryValidationResult {
  valid: boolean
  errors: string[]
}

/**
 * Duration calculation result
 */
export interface DurationCalculation {
  totalMinutes: number
  totalHours: number
  breakMinutes: number
  netMinutes: number
  netHours: number
}
