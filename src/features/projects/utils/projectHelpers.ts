// src/features/projects/utils/projectHelpers.ts

import type { CreateProjectData, UpdateProjectData } from '../types'

/**
 * Pure utility functions for project calculations and validations
 * These can be imported by any layer (components, pages, hooks, services)
 * since they have no side effects and don't perform data fetching
 */

/**
 * Calculate project health based on status, progress, and due date
 */
export function calculateProjectHealth(project: {
  status: string
  progress: { percentage: number }
  dueDate?: number
}): {
  health: 'excellent' | 'good' | 'warning' | 'critical'
  score: number
  rawScore: number
} {
  // Start with baseline "good" score
  let score = 70

  // Status penalties
  if (project.status === 'cancelled') score -= 40
  if (project.status === 'on_hold') score -= 11

  // Progress modifiers
  const progress = project.progress.percentage
  if (progress < 25) score -= 20
  else if (progress < 50) score -= 10
  else if (progress >= 90) score += 35

  // Due date modifiers (only for non-completed projects)
  if (project.dueDate && project.status !== 'completed') {
    const now = Date.now()
    const daysUntilDue = (project.dueDate - now) / (1000 * 60 * 60 * 24)

    if (daysUntilDue < 0) score -= 20 // Overdue
    else if (daysUntilDue < 3) score -= 15 // Due very soon
    else if (daysUntilDue < 7) score -= 5 // Due soon
    else if (daysUntilDue > 60) score += 15 // Plenty of time
  }

  // Store raw score before clamping
  const rawScore = score

  // Clamp score to valid range
  score = Math.max(0, Math.min(100, score))

  // Determine health level
  let health: 'excellent' | 'good' | 'warning' | 'critical'
  if (score >= 80) health = 'excellent'
  else if (score >= 60) health = 'good'
  else if (score >= 40) health = 'warning'
  else health = 'critical'

  return { health, score, rawScore }
}

/**
 * Validate project data for create/update operations
 */
export function validateProjectData(
  data: Partial<CreateProjectData | UpdateProjectData>
): string[] {
  const errors: string[] = []

  if (data.title !== undefined && !data.title?.trim()) {
    errors.push('Project title is required')
  }

  if (data.title && data.title.length > 100) {
    errors.push('Project title must be less than 100 characters')
  }

  if (data.description && data.description.length > 2000) {
    errors.push('Project description must be less than 2000 characters')
  }

  if (data.startDate && data.dueDate && data.startDate > data.dueDate) {
    errors.push('Start date cannot be after due date')
  }

  if (data.tags && data.tags.length > 10) {
    errors.push('Maximum 10 tags allowed')
  }

  if (data.extendedMetadata) {
    if (
      data.extendedMetadata.estimatedHours !== undefined &&
      data.extendedMetadata.estimatedHours < 0
    ) {
      errors.push('Estimated hours cannot be negative')
    }
    if (data.extendedMetadata.budget !== undefined && data.extendedMetadata.budget < 0) {
      errors.push('Budget cannot be negative')
    }
  }

  return errors
}

/**
 * Check if a project is overdue
 */
export function isProjectOverdue(project: { dueDate?: number; status: string }): boolean {
  return !!(
    project.dueDate &&
    project.dueDate < Date.now() &&
    project.status !== 'completed'
  )
}

/**
 * Get the number of days until the due date
 */
export function getDaysUntilDue(dueDate: number): number {
  return Math.ceil((dueDate - Date.now()) / (1000 * 60 * 60 * 24))
}

/**
 * Get the color for a project status
 */
export function getProjectStatusColor(status: string): string {
  const colors: Record<string, string> = {
    active: 'green',
    completed: 'blue',
    on_hold: 'yellow',
    cancelled: 'red',
  }
  return colors[status] || 'gray'
}

/**
 * Get the color for a project priority
 */
export function getProjectPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    low: 'gray',
    medium: 'blue',
    high: 'orange',
    urgent: 'red',
    critical: 'red',
  }
  return colors[priority] || 'gray'
}
