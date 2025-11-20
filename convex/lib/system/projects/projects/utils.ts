// convex/lib/system/projects/projects/utils.ts
// Validation functions and utility helpers for projects module

import { PROJECTS_CONSTANTS, PRIORITY_WEIGHTS } from './constants';
import type { Project, CreateProjectData, UpdateProjectData } from './types';

/**
 * Validate project data for creation/update
 */
export function validateProjectData(
  data: Partial<CreateProjectData | UpdateProjectData>
): string[] {
  const errors: string[] = [];

  // Validate title
  if (data.title !== undefined) {
    const trimmed = data.title.trim();

    if (!trimmed) {
      errors.push('Title is required');
    } else if (trimmed.length < PROJECTS_CONSTANTS.LIMITS.MIN_TITLE_LENGTH) {
      errors.push(`Title must be at least ${PROJECTS_CONSTANTS.LIMITS.MIN_TITLE_LENGTH} character`);
    } else if (trimmed.length > PROJECTS_CONSTANTS.LIMITS.MAX_TITLE_LENGTH) {
      errors.push(`Title cannot exceed ${PROJECTS_CONSTANTS.LIMITS.MAX_TITLE_LENGTH} characters`);
    }
  }

  // Validate description
  if (data.description !== undefined && data.description.trim()) {
    const trimmed = data.description.trim();
    if (trimmed.length > PROJECTS_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH) {
      errors.push(`Description cannot exceed ${PROJECTS_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH} characters`);
    }
  }

  // Validate tags
  if ('tags' in data && data.tags) {
    if (data.tags.length > PROJECTS_CONSTANTS.LIMITS.MAX_TAGS) {
      errors.push(`Cannot exceed ${PROJECTS_CONSTANTS.LIMITS.MAX_TAGS} tags`);
    }

    const emptyTags = data.tags.filter((tag) => !tag.trim());
    if (emptyTags.length > 0) {
      errors.push('Tags cannot be empty');
    }
  }

  // Validate dates
  if ('dueDate' in data && 'startDate' in data && data.dueDate && data.startDate) {
    if (data.dueDate < data.startDate) {
      errors.push('Due date cannot be before start date');
    }
  }

  // Validate extended metadata if provided
  if ('extendedMetadata' in data && data.extendedMetadata) {
    const { estimatedHours, actualHours, budget, actualCost } = data.extendedMetadata;

    if (estimatedHours !== undefined && estimatedHours < 0) {
      errors.push('Estimated hours cannot be negative');
    }

    if (actualHours !== undefined && actualHours < 0) {
      errors.push('Actual hours cannot be negative');
    }

    if (budget !== undefined && budget < 0) {
      errors.push('Budget cannot be negative');
    }

    if (actualCost !== undefined && actualCost < 0) {
      errors.push('Actual cost cannot be negative');
    }
  }

  return errors;
}

/**
 * Calculate progress percentage
 */
export function calculateProgress(completedTasks: number, totalTasks: number): number {
  if (totalTasks === 0) return 0;
  return Math.round((completedTasks / totalTasks) * 100);
}

/**
 * Check if project is overdue
 */
export function isProjectOverdue(project: Project): boolean {
  if (!project.dueDate || project.status === PROJECTS_CONSTANTS.STATUS.COMPLETED) {
    return false;
  }
  return project.dueDate < Date.now();
}

/**
 * Check if project is at risk
 */
export function isProjectAtRisk(project: Project): boolean {
  if (!project.dueDate || project.status === PROJECTS_CONSTANTS.STATUS.COMPLETED) {
    return false;
  }

  const now = Date.now();
  const sevenDaysFromNow = now + 7 * 24 * 60 * 60 * 1000;

  // Project is at risk if due within 7 days and not overdue
  return project.dueDate > now && project.dueDate <= sevenDaysFromNow;
}

/**
 * Get priority weight for sorting
 */
export function getProjectPriorityWeight(priority: Project['priority']): number {
  return PRIORITY_WEIGHTS[priority] || PRIORITY_WEIGHTS[PROJECTS_CONSTANTS.PRIORITY.MEDIUM];
}

/**
 * Get status color
 */
export function getProjectStatusColor(status: Project['status']): string {
  const colors = {
    active: '#3b82f6',
    archived: '#6b7280',
    completed: '#10b981',
    on_hold: '#f59e0b',
    cancelled: '#ef4444',
  };
  return colors[status] || colors.active;
}

/**
 * Get priority color
 */
export function getProjectPriorityColor(priority: Project['priority']): string {
  const colors = {
    low: '#6b7280',
    medium: '#3b82f6',
    high: '#f59e0b',
    urgent: '#ef4444',
    critical: '#dc2626',
  };
  return colors[priority] || colors.medium;
}

/**
 * Calculate project health
 */
export function calculateProjectHealth(project: Project): 'healthy' | 'at_risk' | 'critical' {
  // Project is critical if overdue
  if (isProjectOverdue(project)) {
    return 'critical';
  }

  // Project is at risk if due soon
  if (isProjectAtRisk(project)) {
    return 'at_risk';
  }

  // Check progress vs time elapsed
  if (project.startDate && project.dueDate) {
    const now = Date.now();
    const totalDuration = project.dueDate - project.startDate;
    const elapsed = now - project.startDate;
    const expectedProgress = Math.min(100, (elapsed / totalDuration) * 100);

    // If progress is more than 20% behind schedule
    if (expectedProgress - project.progress.percentage > 20) {
      return 'at_risk';
    }
  }

  return 'healthy';
}

/**
 * Format project progress
 */
export function formatProjectProgress(project: Project): string {
  const { completedTasks, totalTasks, percentage } = project.progress;
  return `${completedTasks}/${totalTasks} tasks (${percentage}%)`;
}

/**
 * Get time remaining until due date
 */
export function getProjectTimeRemaining(project: Project): number | null {
  if (!project.dueDate) return null;
  return project.dueDate - Date.now();
}

/**
 * Format time remaining
 */
export function formatTimeRemaining(milliseconds: number): string {
  if (milliseconds < 0) return 'Overdue';

  const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
  const hours = Math.floor((milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) {
    return `${days} day${days === 1 ? '' : 's'} remaining`;
  }
  if (hours > 0) {
    return `${hours} hour${hours === 1 ? '' : 's'} remaining`;
  }
  return 'Less than 1 hour remaining';
}

/**
 * Check if project should be auto-archived
 */
export function shouldAutoArchive(project: Project): boolean {
  if (!project.settings?.autoArchive) return false;
  if (project.status !== PROJECTS_CONSTANTS.STATUS.COMPLETED) return false;

  // Auto-archive completed projects after 30 days
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  return project.completedAt ? project.completedAt < thirtyDaysAgo : false;
}

/**
 * Get project age
 */
export function getProjectAge(project: Project): number {
  return Date.now() - project.createdAt;
}

/**
 * Format project age
 */
export function formatProjectAge(milliseconds: number): string {
  const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) {
    return `${years} year${years === 1 ? '' : 's'} old`;
  }
  if (months > 0) {
    return `${months} month${months === 1 ? '' : 's'} old`;
  }
  if (days > 0) {
    return `${days} day${days === 1 ? '' : 's'} old`;
  }
  return 'Less than 1 day old';
}

/**
 * Compare projects by priority
 */
export function compareProjectPriority(a: Project, b: Project): number {
  const aWeight = getProjectPriorityWeight(a.priority);
  const bWeight = getProjectPriorityWeight(b.priority);
  return bWeight - aWeight; // Higher priority first
}

/**
 * Compare projects by due date
 */
export function compareProjectDueDate(a: Project, b: Project): number {
  if (!a.dueDate && !b.dueDate) return 0;
  if (!a.dueDate) return 1;
  if (!b.dueDate) return -1;
  return a.dueDate - b.dueDate; // Earlier date first
}

/**
 * Compare projects by progress
 */
export function compareProjectProgress(a: Project, b: Project): number {
  return b.progress.percentage - a.progress.percentage; // Higher progress first
}

/**
 * Check if project is editable
 */
export function isProjectEditable(project: Project): boolean {
  if (project.deletedAt) return false;
  return project.status !== PROJECTS_CONSTANTS.STATUS.COMPLETED &&
         project.status !== PROJECTS_CONSTANTS.STATUS.ARCHIVED;
}
