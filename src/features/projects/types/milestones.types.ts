// src/features/projects/types/milestones.types.ts

import type { Id } from '@/convex/_generated/dataModel'

/**
 * Milestone status types
 */
export type MilestoneStatus =
  | 'upcoming'
  | 'in_progress'
  | 'completed'
  | 'delayed'
  | 'cancelled'

/**
 * Priority types
 */
export type Priority =
  | 'low'
  | 'medium'
  | 'high'
  | 'urgent'
  | 'critical'

/**
 * Risk level types for milestone metadata
 */
export type RiskLevel =
  | 'low'
  | 'medium'
  | 'high'
  | 'critical'

/**
 * Deliverable structure
 */
export interface Deliverable {
  title: string
  completed: boolean
  completedAt?: number
}

/**
 * Milestone metadata
 */
export interface MilestoneMetadata {
  budget?: number
  actualCost?: number
  riskLevel?: RiskLevel
  attachments?: string[]
  notes?: string
}

/**
 * Data structure for creating a new milestone
 */
export interface CreateMilestoneData {
  title: string
  description?: string
  priority?: Priority
  projectId: Id<"projects">
  startDate: number
  dueDate: number
  assignedTo?: Id<"userProfiles">
  order?: number
  color?: string
  dependencies?: Id<"projectMilestones">[]
  deliverables?: Deliverable[]
  metadata?: MilestoneMetadata
}

/**
 * Data structure for updating an existing milestone
 */
export interface UpdateMilestoneData {
  title?: string
  description?: string
  status?: MilestoneStatus
  priority?: Priority
  startDate?: number
  dueDate?: number
  progress?: number
  assignedTo?: Id<"userProfiles">
  order?: number
  color?: string
  dependencies?: Id<"projectMilestones">[]
  deliverables?: Deliverable[]
  tasksTotal?: number
  tasksCompleted?: number
  metadata?: MilestoneMetadata
}
