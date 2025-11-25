// convex/lib/software/freelancer_dashboard/projects/utils.ts
// Validation and helper functions

import { PROJECTS_CONSTANTS } from './constants';
import type { CreateProjectData, UpdateProjectData } from './types';

/**
 * Trim all string fields in project data
 */
export function trimProjectData<
  T extends Partial<CreateProjectData | UpdateProjectData>
>(data: T): T {
  const trimmed: T = { ...data };

  if (typeof trimmed.name === "string") {
    trimmed.name = trimmed.name.trim() as T["name"];
  }

  if (typeof trimmed.description === "string") {
    trimmed.description = trimmed.description.trim() as T["description"];
  }

  if (Array.isArray(trimmed.tags)) {
    const nextTags = trimmed.tags
      .filter((t): t is string => typeof t === "string")
      .map(t => t.trim())
      .filter(Boolean);
    trimmed.tags = nextTags as T["tags"];
  }

  return trimmed;
}

/**
 * Validate project data
 * Returns array of error messages
 */
export function validateProjectData(
  data: Partial<CreateProjectData | UpdateProjectData>
): string[] {
  const errors: string[] = [];

  // Validate name
  if (data.name !== undefined) {
    if (typeof data.name !== "string") {
      errors.push("Name must be a string");
    } else {
      const name = data.name.trim();

      if (!name) {
        errors.push("Name is required");
      }

      if (name.length < PROJECTS_CONSTANTS.LIMITS.MIN_NAME_LENGTH) {
        errors.push(
          `Name must be at least ${PROJECTS_CONSTANTS.LIMITS.MIN_NAME_LENGTH} characters`
        );
      }

      if (name.length > PROJECTS_CONSTANTS.LIMITS.MAX_NAME_LENGTH) {
        errors.push(
          `Name cannot exceed ${PROJECTS_CONSTANTS.LIMITS.MAX_NAME_LENGTH} characters`
        );
      }
    }
  }

  // Validate description
  if (data.description !== undefined) {
    if (typeof data.description !== "string") {
      errors.push("Description must be a string");
    } else {
      const desc = data.description.trim();
      if (desc && desc.length > PROJECTS_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH) {
        errors.push(
          `Description cannot exceed ${PROJECTS_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH} characters`
        );
      }
    }
  }

  // Validate tags
  if (data.tags !== undefined) {
    if (!Array.isArray(data.tags)) {
      errors.push("Tags must be an array");
    } else {
      if (data.tags.length > PROJECTS_CONSTANTS.LIMITS.MAX_TAGS) {
        errors.push(
          `Cannot exceed ${PROJECTS_CONSTANTS.LIMITS.MAX_TAGS} tags`
        );
      }

      if (data.tags.some(t => typeof t !== "string" || !t.trim())) {
        errors.push("Tags cannot be empty");
      }
    }
  }

  // Validate budget
  if (data.budget !== undefined) {
    if (typeof data.budget.amount !== "number") {
      errors.push("Budget amount must be a number");
    } else {
      if (data.budget.amount < PROJECTS_CONSTANTS.LIMITS.MIN_BUDGET) {
        errors.push("Budget cannot be negative");
      }
      if (data.budget.amount > PROJECTS_CONSTANTS.LIMITS.MAX_BUDGET) {
        errors.push(
          `Budget cannot exceed ${PROJECTS_CONSTANTS.LIMITS.MAX_BUDGET}`
        );
      }
    }
  }

  // Validate dates
  if (data.startDate !== undefined && data.deadline !== undefined) {
    if (data.startDate > data.deadline) {
      errors.push("Start date cannot be after deadline");
    }
  }

  return errors;
}
