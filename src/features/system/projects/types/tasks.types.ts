// src/features/boilerplate/projects/types/tasks.types.ts

import type { Id } from '@/convex/_generated/dataModel'

/**
 * Task status types
 * Note: Must match schema exactly (uses underscores, not hyphens)
 */
export type TaskStatus =
  | 'todo'
  | 'in_progress'
  | 'in_review'
  | 'completed'
  | 'blocked'
  | 'cancelled'

/**
 * Priority types
 */
export type Priority =
  | 'low'
  | 'medium'
  | 'high'
  | 'urgent'

/**
 * Task metadata structure
 */
export interface TaskMetadata {
  attachments?: string[]
  externalLinks?: string[]
  customFields?: Record<string, unknown>
}

/**
 * Data structure for creating a new task
 */
export interface CreateTaskData {
  title: string
  description?: string
  priority?: Priority
  projectId?: Id<"projects">
  assignedTo?: Id<"userProfiles">
  tags?: string[]
  startDate?: number
  dueDate?: number
  estimatedHours?: number
  order?: number
  dependsOn?: Id<"projectTasks">[]
  metadata?: TaskMetadata
}

/**
 * Data structure for updating an existing task
 */
export interface UpdateTaskData {
  title?: string
  description?: string
  status?: TaskStatus
  priority?: Priority
  assignedTo?: Id<"userProfiles">
  tags?: string[]
  startDate?: number
  dueDate?: number
  estimatedHours?: number
  actualHours?: number
  order?: number
  blockedBy?: Id<"projectTasks">[]
  dependsOn?: Id<"projectTasks">[]
  metadata?: TaskMetadata
}
