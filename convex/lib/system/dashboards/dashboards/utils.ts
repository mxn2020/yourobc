// convex/lib/system/dashboards/dashboards/utils.ts
// Validation functions and utility helpers for dashboards module

import { DASHBOARDS_CONSTANTS } from './constants';
import type { CreateDashboardData, UpdateDashboardData, Dashboard } from './types';

// ============================================
// Dashboard Validation
// ============================================

/**
 * Validate create dashboard data
 */
export function validateCreateDashboardData(data: Partial<CreateDashboardData>): string[] {
  const errors: string[] = [];

  // Required fields
  if (!data.name || !data.name.trim()) {
    errors.push('Dashboard name is required');
  } else if (data.name.length > DASHBOARDS_CONSTANTS.LIMITS.MAX_NAME_LENGTH) {
    errors.push(
      `Dashboard name must be ${DASHBOARDS_CONSTANTS.LIMITS.MAX_NAME_LENGTH} characters or less`
    );
  } else if (data.name.trim().length < DASHBOARDS_CONSTANTS.VALIDATION.NAME_MIN_LENGTH) {
    errors.push(
      `Dashboard name must be at least ${DASHBOARDS_CONSTANTS.VALIDATION.NAME_MIN_LENGTH} character`
    );
  }

  // Optional fields validation
  if (
    data.description &&
    data.description.length > DASHBOARDS_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH
  ) {
    errors.push(
      `Description must be ${DASHBOARDS_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH} characters or less`
    );
  }

  // Tags validation
  if (data.tags) {
    if (data.tags.length > DASHBOARDS_CONSTANTS.LIMITS.MAX_TAGS) {
      errors.push(`Maximum ${DASHBOARDS_CONSTANTS.LIMITS.MAX_TAGS} tags allowed`);
    }

    // Check individual tag lengths
    for (const tag of data.tags) {
      if (tag.length > DASHBOARDS_CONSTANTS.LIMITS.MAX_TAG_LENGTH) {
        errors.push(
          `Tag "${tag}" exceeds maximum length of ${DASHBOARDS_CONSTANTS.LIMITS.MAX_TAG_LENGTH} characters`
        );
      }
      if (!tag.trim()) {
        errors.push('Tags cannot be empty');
      }
    }
  }

  // Widgets validation
  if (data.widgets && data.widgets.length > DASHBOARDS_CONSTANTS.LIMITS.MAX_WIDGETS) {
    errors.push(`Maximum ${DASHBOARDS_CONSTANTS.LIMITS.MAX_WIDGETS} widgets allowed`);
  }

  return errors;
}

/**
 * Validate update dashboard data
 */
export function validateUpdateDashboardData(data: Partial<UpdateDashboardData>): string[] {
  const errors: string[] = [];

  if (data.name !== undefined) {
    if (!data.name.trim()) {
      errors.push('Dashboard name cannot be empty');
    } else if (data.name.length > DASHBOARDS_CONSTANTS.LIMITS.MAX_NAME_LENGTH) {
      errors.push(
        `Dashboard name must be ${DASHBOARDS_CONSTANTS.LIMITS.MAX_NAME_LENGTH} characters or less`
      );
    }
  }

  if (
    data.description !== undefined &&
    data.description &&
    data.description.length > DASHBOARDS_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH
  ) {
    errors.push(
      `Description must be ${DASHBOARDS_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH} characters or less`
    );
  }

  if (data.tags) {
    if (data.tags.length > DASHBOARDS_CONSTANTS.LIMITS.MAX_TAGS) {
      errors.push(`Maximum ${DASHBOARDS_CONSTANTS.LIMITS.MAX_TAGS} tags allowed`);
    }

    for (const tag of data.tags) {
      if (tag.length > DASHBOARDS_CONSTANTS.LIMITS.MAX_TAG_LENGTH) {
        errors.push(
          `Tag "${tag}" exceeds maximum length of ${DASHBOARDS_CONSTANTS.LIMITS.MAX_TAG_LENGTH} characters`
        );
      }
      if (!tag.trim()) {
        errors.push('Tags cannot be empty');
      }
    }
  }

  if (data.widgets && data.widgets.length > DASHBOARDS_CONSTANTS.LIMITS.MAX_WIDGETS) {
    errors.push(`Maximum ${DASHBOARDS_CONSTANTS.LIMITS.MAX_WIDGETS} widgets allowed`);
  }

  return errors;
}

// ============================================
// Validation Helpers (consolidated)
// ============================================

/**
 * Validate dashboard data for creation/update
 */
export function validateDashboardData(
  data: Partial<CreateDashboardData | UpdateDashboardData>
): string[] {
  const errors: string[] = [];

  // Validate name
  if (data.name !== undefined) {
    const trimmed = data.name.trim();

    if (!trimmed) {
      errors.push('Dashboard name is required');
    } else if (trimmed.length < DASHBOARDS_CONSTANTS.LIMITS.MIN_NAME_LENGTH) {
      errors.push(
        `Dashboard name must be at least ${DASHBOARDS_CONSTANTS.LIMITS.MIN_NAME_LENGTH} character`
      );
    } else if (trimmed.length > DASHBOARDS_CONSTANTS.LIMITS.MAX_NAME_LENGTH) {
      errors.push(
        `Dashboard name cannot exceed ${DASHBOARDS_CONSTANTS.LIMITS.MAX_NAME_LENGTH} characters`
      );
    }
  }

  // Validate description
  if (data.description !== undefined && data.description.trim()) {
    const trimmed = data.description.trim();
    if (trimmed.length > DASHBOARDS_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH) {
      errors.push(
        `Description cannot exceed ${DASHBOARDS_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH} characters`
      );
    }
  }

  // Validate tags
  if ('tags' in data && data.tags) {
    if (data.tags.length > DASHBOARDS_CONSTANTS.LIMITS.MAX_TAGS) {
      errors.push(`Cannot exceed ${DASHBOARDS_CONSTANTS.LIMITS.MAX_TAGS} tags`);
    }

    const emptyTags = data.tags.filter((tag) => !tag.trim());
    if (emptyTags.length > 0) {
      errors.push('Tags cannot be empty');
    }

    for (const tag of data.tags) {
      if (tag.length > DASHBOARDS_CONSTANTS.LIMITS.MAX_TAG_LENGTH) {
        errors.push(
          `Tag "${tag}" exceeds maximum length of ${DASHBOARDS_CONSTANTS.LIMITS.MAX_TAG_LENGTH} characters`
        );
      }
    }
  }

  // Validate widgets
  if ('widgets' in data && data.widgets) {
    if (data.widgets.length > DASHBOARDS_CONSTANTS.LIMITS.MAX_WIDGETS) {
      errors.push(`Cannot exceed ${DASHBOARDS_CONSTANTS.LIMITS.MAX_WIDGETS} widgets`);
    }
  }

  return errors;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Check if dashboard is editable
 */
export function isDashboardEditable(dashboard: {
  deletedAt?: number;
  isDefault: boolean;
}): boolean {
  if (dashboard.deletedAt) return false;
  return true;
}

/**
 * Format dashboard display name
 */
export function formatDashboardDisplayName(dashboard: {
  name: string;
  isDefault?: boolean;
  isPublic?: boolean;
}): string {
  let displayName = dashboard.name;
  if (dashboard.isDefault) displayName += ' [Default]';
  if (dashboard.isPublic) displayName += ' [Public]';
  return displayName;
}
