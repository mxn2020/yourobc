// convex/lib/software/yourobc/tasks/types.ts
/**
 * Tasks Library Types
 *
 * TypeScript types and interfaces for tasks business logic.
 * Extends schema types with additional runtime and API types.
 *
 * @module convex/lib/software/yourobc/tasks/types
 */

import { Doc, Id } from '../../../../_generated/dataModel'

// ============================================================================
// Document Types
// ============================================================================

/**
 * Task document type
 */
export type Task = Doc<'yourobcTasks'>

/**
 * Task ID type
 */
export type TaskId = Id<'yourobcTasks'>

// ============================================================================
// Create/Update Types
// ============================================================================

/**
 * Fields required to create a new task
 */
export interface CreateTaskInput {
  title: string
  description?: string
  shipmentId: string
  type?: 'manual' | 'automatic'
  status?: 'pending' | 'in_progress' | 'completed' | 'archived'
  priority?: 'low' | 'medium' | 'high' | 'critical'
  visibility?: 'public' | 'private' | 'shared' | 'organization'
  assignedTo?: string
  dueDate?: number
  tags?: string[]
  category?: string
  metadata?: any
}

/**
 * Fields that can be updated on an existing task
 */
export interface UpdateTaskInput {
  title?: string
  description?: string
  type?: 'manual' | 'automatic'
  status?: 'pending' | 'in_progress' | 'completed' | 'archived'
  priority?: 'low' | 'medium' | 'high' | 'critical'
  visibility?: 'public' | 'private' | 'shared' | 'organization'
  assignedTo?: string
  dueDate?: number
  startedAt?: number
  completedAt?: number
  completedBy?: string
  completionNotes?: string
  cancelledAt?: number
  cancelledBy?: string
  cancellationReason?: string
  tags?: string[]
  category?: string
  metadata?: any
}

// ============================================================================
// Query Types
// ============================================================================

/**
 * Filter options for task queries
 */
export interface TaskFilters {
  shipmentId?: string
  status?: 'pending' | 'in_progress' | 'completed' | 'archived'
  priority?: 'low' | 'medium' | 'high' | 'critical'
  type?: 'manual' | 'automatic'
  assignedTo?: string
  ownerId?: string
  category?: string
  tags?: string[]
  includeDeleted?: boolean
  dueBefore?: number
  dueAfter?: number
  isOverdue?: boolean
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  limit?: number
  cursor?: string
}

/**
 * Search options for tasks
 */
export interface SearchTasksOptions extends TaskFilters {
  searchTerm?: string
  sortBy?: 'createdAt' | 'updatedAt' | 'dueDate' | 'priority' | 'status' | 'title'
  sortOrder?: 'asc' | 'desc'
  pagination?: PaginationOptions
}

// ============================================================================
// Assignment Types
// ============================================================================

/**
 * Task assignment data
 */
export interface TaskAssignment {
  taskId: string
  assignedTo: string
  assignedBy: string
  assignedAt: number
  notes?: string
}

/**
 * Task reassignment data
 */
export interface TaskReassignment {
  taskId: string
  previousAssignee?: string
  newAssignee: string
  reassignedBy: string
  reason?: string
}

// ============================================================================
// Completion Types
// ============================================================================

/**
 * Task completion data
 */
export interface TaskCompletion {
  taskId: string
  completedBy: string
  completedAt: number
  completionNotes?: string
}

/**
 * Task cancellation data
 */
export interface TaskCancellation {
  taskId: string
  cancelledBy: string
  cancelledAt: number
  cancellationReason?: string
}

// ============================================================================
// Statistics Types
// ============================================================================

/**
 * Task statistics for a user or shipment
 */
export interface TaskStats {
  total: number
  pending: number
  inProgress: number
  completed: number
  archived: number
  overdue: number
  byPriority: {
    low: number
    medium: number
    high: number
    critical: number
  }
}

/**
 * Task performance metrics
 */
export interface TaskPerformanceMetrics {
  averageCompletionTime: number
  completionRate: number
  overdueRate: number
  totalCompleted: number
  totalCancelled: number
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
  task?: Task
  action: 'read' | 'create' | 'update' | 'delete' | 'assign' | 'complete'
}

// ============================================================================
// Validation Types
// ============================================================================

/**
 * Task validation result
 */
export interface TaskValidationResult {
  valid: boolean
  errors: string[]
}

/**
 * Status transition validation
 */
export interface StatusTransitionValidation {
  valid: boolean
  currentStatus: string
  newStatus: string
  reason?: string
}
