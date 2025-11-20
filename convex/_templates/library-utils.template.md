// convex/lib/boilerplate/[module_name]/utils.ts

import { [MODULE]_CONSTANTS, PRIORITY_WEIGHTS } from './constants';
import type { [Entity], [Entity]Status, [Entity]Priority } from './types';

/**
 * ═══════════════════════════════════════════════════════════════════════
 * VALIDATORS NOTE
 * ═══════════════════════════════════════════════════════════════════════
 *
 * For type-safe validation of status/priority/visibility values:
 * - Import types from './types' (which uses Infer from validators)
 * - Use [Entity]Status, [Entity]Priority, etc. for type annotations
 * - Validation logic should reference CONSTANTS for allowed values
 *
 * EXAMPLE:
 * function isValidStatus(status: string): status is [Entity]Status {
 *   return Object.values([MODULE]_CONSTANTS.STATUS).includes(status);
 * }
 *
 * ═══════════════════════════════════════════════════════════════════════
 */

// ============================================================================
// Progress & Status Functions
// ============================================================================

export function calculateProgress(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

export function is[Entity]Overdue({entity}: [Entity]): boolean {
  if (!{entity}.dueDate || {entity}.status === [MODULE]_CONSTANTS.STATUS.COMPLETED) {
    return false;
  }
  return {entity}.dueDate < Date.now();
}

export function is[Entity]AtRisk({entity}: [Entity]): boolean {
  if (!{entity}.dueDate || {entity}.status === [MODULE]_CONSTANTS.STATUS.COMPLETED) {
    return false;
  }

  const now = Date.now();
  const sevenDaysFromNow = now + 7 * 24 * 60 * 60 * 1000;

  // [Entity] is at risk if due within 7 days and not overdue
  return {entity}.dueDate > now && {entity}.dueDate <= sevenDaysFromNow;
}

// ============================================================================
// Priority & Sorting Functions
// ============================================================================

export function get[Entity]PriorityWeight(priority: [Entity]['priority']): number {
  return PRIORITY_WEIGHTS[priority] || PRIORITY_WEIGHTS[[MODULE]_CONSTANTS.PRIORITY.MEDIUM];
}

export function compare[Entity]Priority(a: [Entity], b: [Entity]): number {
  const aWeight = get[Entity]PriorityWeight(a.priority);
  const bWeight = get[Entity]PriorityWeight(b.priority);
  return bWeight - aWeight; // Higher priority first
}

export function compare[Entity]DueDate(a: [Entity], b: [Entity]): number {
  if (!a.dueDate && !b.dueDate) return 0;
  if (!a.dueDate) return 1;
  if (!b.dueDate) return -1;
  return a.dueDate - b.dueDate; // Earlier date first
}

export function compare[Entity]Progress(a: [Entity], b: [Entity]): number {
  // Customize based on your progress field structure
  return 0; // Replace with actual comparison
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * ═══════════════════════════════════════════════════════════════════════
 * MAIN DISPLAY FIELD - REQUIRED FOR ALL TABLES
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Every table MUST have a main display field validated for empty strings (.trim()),
 * marked as required, and indexed in schema.
 *
 * Field conventions: `name` for users/products/categories/organizations/teams/locations/tags,
 * `title` for posts/projects/tasks/invoices/proposals/documents/events,
 * `displayName` for ambiguous cases or composite entities.
 *
 * ═══════════════════════════════════════════════════════════════════════
 */

export function validate[Entity]Data(data: Partial<[Entity]>): string[] {
  const errors: string[] = [];

  // Main display field (name/title/displayName)
  if (data.name !== undefined) {
    if (!data.name.trim()) {
      errors.push('Name is required and cannot be empty');
    } else if (data.name.length > [MODULE]_CONSTANTS.LIMITS.MAX_NAME_LENGTH) {
      errors.push(`Name must be less than ${[MODULE]_CONSTANTS.LIMITS.MAX_NAME_LENGTH} characters`);
    }
  }

  // Use 'title' for posts/projects/tasks:
  // if (data.title !== undefined) {
  //   if (!data.title.trim()) {
  //     errors.push('Title is required and cannot be empty');
  //   } else if (data.title.length > [MODULE]_CONSTANTS.LIMITS.MAX_TITLE_LENGTH) {
  //     errors.push(`Title must be less than ${[MODULE]_CONSTANTS.LIMITS.MAX_TITLE_LENGTH} characters`);
  //   }
  // }

  // Use 'displayName' for ambiguous cases:
  // if (data.displayName !== undefined) {
  //   if (!data.displayName.trim()) {
  //     errors.push('Display name is required and cannot be empty');
  //   } else if (data.displayName.length > [MODULE]_CONSTANTS.LIMITS.MAX_DISPLAY_NAME_LENGTH) {
  //     errors.push(`Display name must be less than ${[MODULE]_CONSTANTS.LIMITS.MAX_DISPLAY_NAME_LENGTH} characters`);
  //   }
  // }

  // ┌─────────────────────────────────────────────────────────────────┐
  // │ Optional field validations                                       │
  // └─────────────────────────────────────────────────────────────────┘

  // Optional: Description validation
  if (data.description && data.description.length > [MODULE]_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH) {
    errors.push(`Description must be less than ${[MODULE]_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH} characters`);
  }

  if (data.tags && data.tags.length > [MODULE]_CONSTANTS.LIMITS.MAX_TAGS) {
    errors.push(`Maximum ${[MODULE]_CONSTANTS.LIMITS.MAX_TAGS} tags allowed`);
  }

  if (data.dueDate && data.startDate && data.dueDate < data.startDate) {
    errors.push('Due date cannot be before start date');
  }

  // Add entity-specific validations here

  return errors;
}

// ============================================================================
// Color/Display Helper Functions
// ============================================================================

export function get[Entity]StatusColor(status: [Entity]['status']): string {
  const colors = {
    active: '#3b82f6',
    archived: '#6b7280',
    completed: '#10b981',
    on_hold: '#f59e0b',
    cancelled: '#ef4444',
  };
  return colors[status] || colors.active;
}

export function get[Entity]PriorityColor(priority: [Entity]['priority']): string {
  const colors = {
    low: '#6b7280',
    medium: '#3b82f6',
    high: '#f59e0b',
    urgent: '#ef4444',
    critical: '#dc2626',
  };
  return colors[priority] || colors.medium;
}

// ============================================================================
// Health & Status Calculation
// ============================================================================

export function calculate[Entity]Health({entity}: [Entity]): 'healthy' | 'at_risk' | 'critical' {
  // [Entity] is critical if overdue
  if (is[Entity]Overdue({entity})) {
    return 'critical';
  }

  // [Entity] is at risk if due soon
  if (is[Entity]AtRisk({entity})) {
    return 'at_risk';
  }

  // Add additional health checks based on your entity's needs

  return 'healthy';
}

// ============================================================================
// Formatting Functions
// ============================================================================

export function format[Entity]Progress({entity}: [Entity]): string {
  // Customize based on your progress field structure
  return `In progress`;
}

export function get[Entity]TimeRemaining({entity}: [Entity]): number | null {
  if (!{entity}.dueDate) return null;
  return {entity}.dueDate - Date.now();
}

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

export function get[Entity]Age({entity}: [Entity]): number {
  return Date.now() - {entity}.createdAt;
}

export function format[Entity]Age(milliseconds: number): string {
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

// ============================================================================
// Auto-archive Functions (optional)
// ============================================================================

export function shouldAutoArchive({entity}: [Entity]): boolean {
  if (!{entity}.settings?.autoArchive) return false;
  if ({entity}.status !== [MODULE]_CONSTANTS.STATUS.COMPLETED) return false;

  // Auto-archive completed {entity}s after 30 days
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  return {entity}.completedAt ? {entity}.completedAt < thirtyDaysAgo : false;
}
