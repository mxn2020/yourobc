// convex/lib/boilerplate/milestones/utils.ts

import { MILESTONE_CONSTANTS, PRIORITY_WEIGHTS } from './constants';
import type { Milestone } from './types';

export function isMilestoneOverdue(milestone: Milestone): boolean {
  if (
    !milestone.dueDate ||
    milestone.status === MILESTONE_CONSTANTS.STATUS.COMPLETED ||
    milestone.status === MILESTONE_CONSTANTS.STATUS.CANCELLED
  ) {
    return false;
  }
  return milestone.dueDate < Date.now();
}

export function isMilestoneDelayed(milestone: Milestone): boolean {
  const now = Date.now();

  // If past due date and not completed
  if (
    milestone.dueDate < now &&
    milestone.status !== MILESTONE_CONSTANTS.STATUS.COMPLETED
  ) {
    return true;
  }

  // If progress is significantly behind schedule
  if (milestone.startDate && milestone.dueDate) {
    const totalDuration = milestone.dueDate - milestone.startDate;
    const elapsed = now - milestone.startDate;
    const expectedProgress = Math.min(100, (elapsed / totalDuration) * 100);

    // If actual progress is more than 20% behind expected
    if (expectedProgress - milestone.progress > 20) {
      return true;
    }
  }

  return false;
}

export function getMilestonePriorityWeight(
  priority: Milestone['priority']
): number {
  return (
    PRIORITY_WEIGHTS[priority] ||
    PRIORITY_WEIGHTS[MILESTONE_CONSTANTS.PRIORITY.MEDIUM]
  );
}

export function validateMilestoneData(data: Partial<Milestone>): string[] {
  const errors: string[] = [];

  if (data.title !== undefined) {
    if (!data.title.trim()) {
      errors.push('Title is required');
    } else if (data.title.length > MILESTONE_CONSTANTS.LIMITS.MAX_TITLE_LENGTH) {
      errors.push(
        `Title must be less than ${MILESTONE_CONSTANTS.LIMITS.MAX_TITLE_LENGTH} characters`
      );
    }
  }

  if (
    data.description &&
    data.description.length > MILESTONE_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH
  ) {
    errors.push(
      `Description must be less than ${MILESTONE_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH} characters`
    );
  }

  if (data.dueDate && data.startDate && data.dueDate < data.startDate) {
    errors.push('Due date cannot be before start date');
  }

  if (data.progress !== undefined && (data.progress < 0 || data.progress > 100)) {
    errors.push('Progress must be between 0 and 100');
  }

  if (
    data.deliverables &&
    data.deliverables.length > MILESTONE_CONSTANTS.LIMITS.MAX_DELIVERABLES
  ) {
    errors.push(
      `Maximum ${MILESTONE_CONSTANTS.LIMITS.MAX_DELIVERABLES} deliverables allowed`
    );
  }

  if (
    data.dependencies &&
    data.dependencies.length > MILESTONE_CONSTANTS.LIMITS.MAX_DEPENDENCIES
  ) {
    errors.push(
      `Maximum ${MILESTONE_CONSTANTS.LIMITS.MAX_DEPENDENCIES} dependencies allowed`
    );
  }

  return errors;
}

export function calculateMilestoneProgress(
  deliverables?: Array<{ completed: boolean }>
): number {
  if (!deliverables || deliverables.length === 0) return 0;
  const completed = deliverables.filter((d) => d.completed).length;
  return Math.round((completed / deliverables.length) * 100);
}