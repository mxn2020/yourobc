// src/features/boilerplate/[module_name]/utils/{entity}Helpers.ts

import { [MODULE]_CONSTANTS } from "../constants";
import type { [Entity], Create[Entity]Data, Update[Entity]Data } from "../types";

// ==========================================
// VALIDATION HELPERS
// ==========================================

/**
 * Validate {entity} data
 * Returns array of error messages
 */
export function validate[Entity]Data(
  data: Partial<Create[Entity]Data | Update[Entity]Data>
): string[] {
  const errors: string[] = [];

  // Title validation
  if (data.title !== undefined) {
    if (!data.title || !data.title.trim()) {
      errors.push("Title is required");
    } else if (data.title.length > [MODULE]_CONSTANTS.LIMITS.MAX_TITLE_LENGTH) {
      errors.push(
        `Title too long (max ${[MODULE]_CONSTANTS.LIMITS.MAX_TITLE_LENGTH} characters)`
      );
    } else if (data.title.length < [MODULE]_CONSTANTS.LIMITS.MIN_TITLE_LENGTH) {
      errors.push(
        `Title too short (min ${[MODULE]_CONSTANTS.LIMITS.MIN_TITLE_LENGTH} character)`
      );
    }
  }

  // Description validation
  if (data.description !== undefined && data.description.length > [MODULE]_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH) {
    errors.push(
      `Description too long (max ${[MODULE]_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH} characters)`
    );
  }

  // Category validation
  if (data.category !== undefined && data.category.length > [MODULE]_CONSTANTS.LIMITS.MAX_CATEGORY_LENGTH) {
    errors.push(
      `Category too long (max ${[MODULE]_CONSTANTS.LIMITS.MAX_CATEGORY_LENGTH} characters)`
    );
  }

  // Tags validation
  if (data.tags !== undefined) {
    if (data.tags.length > [MODULE]_CONSTANTS.LIMITS.MAX_TAGS) {
      errors.push(`Too many tags (max ${[MODULE]_CONSTANTS.LIMITS.MAX_TAGS})`);
    }

    const invalidTags = data.tags.filter(
      (tag) => tag.length > [MODULE]_CONSTANTS.LIMITS.MAX_TAG_LENGTH
    );
    if (invalidTags.length > 0) {
      errors.push(
        `Tag too long (max ${[MODULE]_CONSTANTS.LIMITS.MAX_TAG_LENGTH} characters): ${invalidTags.join(", ")}`
      );
    }
  }

  // Date validation
  if (data.startDate && data.dueDate && data.startDate > data.dueDate) {
    errors.push("Start date cannot be after due date");
  }

  // Status validation
  if (data.status && !Object.values([MODULE]_CONSTANTS.STATUS).includes(data.status as any)) {
    errors.push("Invalid status");
  }

  // Priority validation
  if (data.priority && !Object.values([MODULE]_CONSTANTS.PRIORITY).includes(data.priority as any)) {
    errors.push("Invalid priority");
  }

  // Visibility validation
  if (data.visibility && !Object.values([MODULE]_CONSTANTS.VISIBILITY).includes(data.visibility as any)) {
    errors.push("Invalid visibility");
  }

  return errors;
}

// ==========================================
// DATE HELPERS
// ==========================================

/**
 * Check if {entity} is overdue
 */
export function is[Entity]Overdue({entity}: { dueDate?: number; status: string }): boolean {
  if (!{entity}.dueDate) return false;
  if ({entity}.status === [MODULE]_CONSTANTS.STATUS.COMPLETED) return false;
  if ({entity}.status === [MODULE]_CONSTANTS.STATUS.ARCHIVED) return false;

  return {entity}.dueDate < Date.now();
}

/**
 * Get days until due date
 * Returns negative number if overdue
 */
export function getDaysUntilDue(dueDate: number): number {
  const now = Date.now();
  const diff = dueDate - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Check if {entity} is due soon (within threshold)
 */
export function is[Entity]DueSoon({entity}: { dueDate?: number; status: string }): boolean {
  if (!{entity}.dueDate) return false;
  if ({entity}.status === [MODULE]_CONSTANTS.STATUS.COMPLETED) return false;
  if ({entity}.status === [MODULE]_CONSTANTS.STATUS.ARCHIVED) return false;

  const daysUntil = getDaysUntilDue({entity}.dueDate);
  return daysUntil >= 0 && daysUntil <= [MODULE]_CONSTANTS.DATE_RANGES.DUE_SOON_THRESHOLD;
}

/**
 * Check if {entity} is at risk (due within at-risk threshold)
 */
export function is[Entity]AtRisk({entity}: { dueDate?: number; status: string; progress?: number }): boolean {
  if (!{entity}.dueDate) return false;
  if ({entity}.status === [MODULE]_CONSTANTS.STATUS.COMPLETED) return false;
  if ({entity}.status === [MODULE]_CONSTANTS.STATUS.ARCHIVED) return false;

  const daysUntil = getDaysUntilDue({entity}.dueDate);
  const expectedProgress = {entity}.progress || 0;

  // At risk if due within threshold and progress is low
  return (
    daysUntil >= 0 &&
    daysUntil <= [MODULE]_CONSTANTS.DATE_RANGES.AT_RISK_THRESHOLD &&
    expectedProgress < 50
  );
}

// ==========================================
// HEALTH CALCULATION
// ==========================================

/**
 * Calculate {entity} health based on various factors
 */
export function calculate[Entity]Health({entity}: {
  status: string;
  progress?: number;
  dueDate?: number;
}): string {
  if ({entity}.status === [MODULE]_CONSTANTS.STATUS.COMPLETED) {
    return [MODULE]_CONSTANTS.HEALTH.EXCELLENT;
  }

  if ({entity}.status === [MODULE]_CONSTANTS.STATUS.ARCHIVED) {
    return [MODULE]_CONSTANTS.HEALTH.GOOD;
  }

  if ({entity}.status === [MODULE]_CONSTANTS.STATUS.ON_HOLD) {
    return [MODULE]_CONSTANTS.HEALTH.AT_RISK;
  }

  const progress = {entity}.progress || 0;

  // Check if overdue
  if ({entity}.dueDate && {entity}.dueDate < Date.now()) {
    return [MODULE]_CONSTANTS.HEALTH.CRITICAL;
  }

  // Check progress-based health
  if (progress >= 80) return [MODULE]_CONSTANTS.HEALTH.EXCELLENT;
  if (progress >= 60) return [MODULE]_CONSTANTS.HEALTH.GOOD;
  if (progress >= 40) return [MODULE]_CONSTANTS.HEALTH.AT_RISK;
  return [MODULE]_CONSTANTS.HEALTH.CRITICAL;
}

// ==========================================
// FORMATTING HELPERS
// ==========================================

/**
 * Format {entity} name for display
 */
export function format[Entity]Name({entity}: { title: string }): string {
  return {entity}.title.trim();
}

/**
 * Format {entity} description (truncate if needed)
 */
export function format[Entity]Description(description: string, maxLength: number = 100): string {
  if (description.length <= maxLength) return description;
  return description.slice(0, maxLength).trim() + "...";
}

/**
 * Get status display color
 */
export function get[Entity]StatusColor(status: string): string {
  switch (status) {
    case [MODULE]_CONSTANTS.STATUS.ACTIVE:
      return "green";
    case [MODULE]_CONSTANTS.STATUS.COMPLETED:
      return "blue";
    case [MODULE]_CONSTANTS.STATUS.ON_HOLD:
      return "yellow";
    case [MODULE]_CONSTANTS.STATUS.ARCHIVED:
      return "gray";
    case [MODULE]_CONSTANTS.STATUS.CANCELLED:
      return "red";
    default:
      return "gray";
  }
}

/**
 * Get priority display color
 */
export function get[Entity]PriorityColor(priority: string): string {
  switch (priority) {
    case [MODULE]_CONSTANTS.PRIORITY.URGENT:
      return "red";
    case [MODULE]_CONSTANTS.PRIORITY.HIGH:
      return "orange";
    case [MODULE]_CONSTANTS.PRIORITY.MEDIUM:
      return "blue";
    case [MODULE]_CONSTANTS.PRIORITY.LOW:
      return "gray";
    default:
      return "gray";
  }
}

/**
 * Get health display color
 */
export function getHealthColor(health: string): string {
  switch (health) {
    case [MODULE]_CONSTANTS.HEALTH.EXCELLENT:
      return "green";
    case [MODULE]_CONSTANTS.HEALTH.GOOD:
      return "blue";
    case [MODULE]_CONSTANTS.HEALTH.AT_RISK:
      return "yellow";
    case [MODULE]_CONSTANTS.HEALTH.CRITICAL:
      return "red";
    default:
      return "gray";
  }
}

// ==========================================
// FILTER HELPERS
// ==========================================

/**
 * Filter [entities] by search term
 */
export function filter[Entities]BySearch([entities]: [Entity][], searchTerm: string): [Entity][] {
  if (!searchTerm.trim()) return [entities];

  const search = searchTerm.toLowerCase();
  return [entities].filter(
    ({entity}) =>
      {entity}.title.toLowerCase().includes(search) ||
      {entity}.description?.toLowerCase().includes(search) ||
      {entity}.tags?.some((tag) => tag.toLowerCase().includes(search)) ||
      {entity}.category?.toLowerCase().includes(search)
  );
}

/**
 * Sort [entities] by field
 */
export function sort[Entities]([entities]: [Entity][], sortBy: string, sortOrder: "asc" | "desc" = "asc"): [Entity][] {
  const sorted = [...[entities]].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortBy) {
      case "title":
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case "createdAt":
        aValue = a.createdAt;
        bValue = b.createdAt;
        break;
      case "updatedAt":
        aValue = a.updatedAt;
        bValue = b.updatedAt;
        break;
      case "dueDate":
        aValue = a.dueDate || Infinity;
        bValue = b.dueDate || Infinity;
        break;
      case "priority":
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        aValue = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 4;
        bValue = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 4;
        break;
      case "status":
        aValue = a.status;
        bValue = b.status;
        break;
      default:
        return 0;
    }

    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  return sorted;
}

// ==========================================
// STATISTICS HELPERS
// ==========================================

/**
 * Calculate completion percentage
 */
export function calculateCompletionRate([entities]: [Entity][]): number {
  if ([entities].length === 0) return 0;

  const completed = [entities].filter(
    ({entity}) => {entity}.status === [MODULE]_CONSTANTS.STATUS.COMPLETED
  ).length;

  return Math.round((completed / [entities].length) * 100);
}

/**
 * Count [entities] by status
 */
export function count[Entities]ByStatus([entities]: [Entity][]): Record<string, number> {
  return [entities].reduce((acc, {entity}) => {
    acc[{entity}.status] = (acc[{entity}.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

/**
 * Count [entities] by priority
 */
export function count[Entities]ByPriority([entities]: [Entity][]): Record<string, number> {
  return [entities].reduce((acc, {entity}) => {
    acc[{entity}.priority] = (acc[{entity}.priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}
