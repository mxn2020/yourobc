// src/features/yourobc/tasks/types/index.ts

import type { Doc, Id } from '@/convex/_generated/dataModel'
import { TaskPriority, TaskStatus, TaskType } from '@/convex/lib/yourobc/tasks'

// Re-export types from Convex
export type Task = Doc<'yourobcTasks'>
export type TaskId = Id<'yourobcTasks'>

export type {
  TaskType,
  TaskStatus,
  TaskPriority,
  CreateTaskData,
  UpdateTaskData,
  CompleteTaskData,
  TaskTemplate,
  TaskFilters,
  TaskListOptions,
  TaskStats,
} from '@/convex/lib/yourobc/tasks/types'

// UI-specific types
export interface TaskListItem extends Task {
  type?: Task['taskType'] // Alias for UI compatibility
  shipment?: {
    _id: Id<'yourobcShipments'>
    shipmentNumber: string
    serviceType: 'OBC' | 'NFO'
    customer?: {
      companyName: string
    }
  }
  assignedUser?: {
    _id: Id<'userProfiles'>
    name?: string
    email: string
  }
  isOverdue?: boolean
  dueIn?: string // Relative time string like "in 2 hours" or "3 days ago"
}

export interface TaskFormData {
  shipmentId?: Id<'yourobcShipments'>
  title: string
  description?: string
  taskType?: TaskType
  priority: TaskPriority
  assignedTo?: Id<'userProfiles'>
  dueDate?: number
}

export interface TaskInsights {
  isOverdue: boolean
  isDueSoon: boolean
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical'
  daysUntilDue?: number
  canBeCompleted: boolean
  canBeStarted: boolean
  canBeCancelled: boolean
  canBeEdited: boolean
}

export interface TaskCardProps {
  task: TaskListItem
  onClick?: (task: TaskListItem) => void
  showShipment?: boolean
  showAssignee?: boolean
  compact?: boolean
  showActions?: boolean
}

export interface TaskDelegationProps {
  task: Task
  onAssign: (userId: Id<'userProfiles'>) => Promise<void>
  onClose: () => void
}

export interface NextTaskDisplayProps {
  shipmentId: Id<'yourobcShipments'>
  compact?: boolean
}

// Constants
export const TASK_PRIORITY_LABELS = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
} as const

export const TASK_PRIORITY_COLORS = {
  low: '#6b7280',
  medium: '#3b82f6',
  high: '#f59e0b',
  critical: '#ef4444',
} as const

export const TASK_STATUS_LABELS = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
} as const

export const TASK_STATUS_COLORS = {
  pending: '#6b7280',
  in_progress: '#3b82f6',
  completed: '#10b981',
  cancelled: '#ef4444',
} as const

export const TASK_TYPE_LABELS = {
  manual: 'Manual',
  automatic: 'Auto-generated',
} as const

// Task Management Constants
export const TASK_CONSTANTS = {
  DEFAULT_VALUES: {
    PRIORITY: 'medium' as const,
    TYPE: 'manual' as const,
    STATUS: 'pending' as const,
  },
  VALIDATION: {
    MIN_TITLE_LENGTH: 3,
    MAX_TITLE_LENGTH: 200,
    MAX_DESCRIPTION_LENGTH: 1000,
  },
  DUE_SOON_HOURS: 24, // Consider task "due soon" if within 24 hours
} as const
