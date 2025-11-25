// convex/lib/system/app_theme_settings/utils.ts
// Utility functions for appThemeSettings module

import { APP_THEME_SETTINGS_CONSTANTS } from './constants';
import type {
  CreateAppThemeSettingData,
  UpdateAppThemeSettingData,
  AppThemeSetting,
  AppThemeSettingsByCategory,
} from './types';

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validate app theme setting data for creation/update
 */
export function validateAppThemeSettingData(
  data: Partial<CreateAppThemeSettingData | UpdateAppThemeSettingData>
): string[] {
  const errors: string[] = [];

  // Validate key
  if ('key' in data && data.key !== undefined) {
    const keyErrors = validateThemeKey(data.key);
    errors.push(...keyErrors);
  }

  // Validate category
  if ('category' in data && data.category !== undefined) {
    const categoryErrors = validateThemeCategory(data.category);
    errors.push(...categoryErrors);
  }

  // Validate value
  if ('value' in data) {
    const valueErrors = validateThemeValue(data.value);
    errors.push(...valueErrors);
  }

  // Validate description
  if ('description' in data && data.description !== undefined && data.description !== null) {
    if (data.description.length > APP_THEME_SETTINGS_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH) {
      errors.push(
        `Description must be at most ${APP_THEME_SETTINGS_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH} characters`
      );
    }
  }

  return errors;
}

/**
 * Validate theme setting key
 */
export function validateThemeKey(key: string): string[] {
  const errors: string[] = [];

  const trimmed = key.trim();

  if (!trimmed) {
    errors.push('Key is required');
    return errors;
  }

  if (trimmed.length < APP_THEME_SETTINGS_CONSTANTS.LIMITS.MIN_KEY_LENGTH) {
    errors.push(
      `Key must be at least ${APP_THEME_SETTINGS_CONSTANTS.LIMITS.MIN_KEY_LENGTH} characters`
    );
  }

  if (trimmed.length > APP_THEME_SETTINGS_CONSTANTS.LIMITS.MAX_KEY_LENGTH) {
    errors.push(
      `Key must be at most ${APP_THEME_SETTINGS_CONSTANTS.LIMITS.MAX_KEY_LENGTH} characters`
    );
  }

  if (!APP_THEME_SETTINGS_CONSTANTS.VALIDATION.KEY_PATTERN.test(trimmed)) {
    errors.push(
      'Key must start with a letter and contain only alphanumeric characters, dots, underscores, or hyphens'
    );
  }

  return errors;
}

/**
 * Validate theme setting category
 */
export function validateThemeCategory(category: string): string[] {
  const errors: string[] = [];

  const trimmed = category.trim();

  if (!trimmed) {
    errors.push('Category is required');
    return errors;
  }

  if (trimmed.length < APP_THEME_SETTINGS_CONSTANTS.LIMITS.MIN_CATEGORY_LENGTH) {
    errors.push(
      `Category must be at least ${APP_THEME_SETTINGS_CONSTANTS.LIMITS.MIN_CATEGORY_LENGTH} characters`
    );
  }

  if (trimmed.length > APP_THEME_SETTINGS_CONSTANTS.LIMITS.MAX_CATEGORY_LENGTH) {
    errors.push(
      `Category must be at most ${APP_THEME_SETTINGS_CONSTANTS.LIMITS.MAX_CATEGORY_LENGTH} characters`
    );
  }

  if (!APP_THEME_SETTINGS_CONSTANTS.VALIDATION.CATEGORY_PATTERN.test(trimmed)) {
    errors.push(
      'Category must be lowercase and contain only alphanumeric characters, underscores, or hyphens'
    );
  }

  return errors;
}

/**
 * Validate theme setting value
 */
export function validateThemeValue(value: any): string[] {
  const errors: string[] = [];

  if (value === undefined || value === null) {
    errors.push('Value cannot be null or undefined');
    return errors;
  }

  // Check value size (if it's a stringifiable object/array)
  try {
    const stringified = JSON.stringify(value);
    if (stringified.length > APP_THEME_SETTINGS_CONSTANTS.LIMITS.MAX_VALUE_SIZE) {
      errors.push(
        `Value size must be at most ${APP_THEME_SETTINGS_CONSTANTS.LIMITS.MAX_VALUE_SIZE} bytes when serialized`
      );
    }
  } catch (e) {
    errors.push('Value must be JSON serializable');
  }

  return errors;
}

// ============================================================================
// Helper Utilities
// ============================================================================

/**
 * Check if a theme setting is editable
 */
export function isSettingEditable(setting: AppThemeSetting): boolean {
  return setting.isEditable !== false;
}

/**
 * Format setting display name
 */
export function formatSettingDisplayName(setting: AppThemeSetting): string {
  if (setting.description) {
    return setting.description;
  }

  // Convert camelCase or snake_case to Title Case
  return setting.key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase())
    .trim();
}

/**
 * Group settings by category
 */
export function groupSettingsByCategory(settings: AppThemeSetting[]): AppThemeSettingsByCategory {
  const grouped: AppThemeSettingsByCategory = {};

  for (const setting of settings) {
    if (!grouped[setting.category]) {
      grouped[setting.category] = [];
    }
    grouped[setting.category].push(setting);
  }

  // Sort settings within each category by key
  for (const category in grouped) {
    grouped[category].sort((a, b) => a.key.localeCompare(b.key));
  }

  return grouped;
}

/**
 * Get category display name
 */
export function getCategoryDisplayName(category: string): string {
  // Convert category to Title Case
  return category
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

/**
 * Check if a color value is valid hex
 */
export function isValidHexColor(value: string): boolean {
  return APP_THEME_SETTINGS_CONSTANTS.VALIDATION.COLOR_HEX_PATTERN.test(value);
}

/**
 * Check if a value is a valid URL
 */
export function isValidUrl(value: string): boolean {
  return APP_THEME_SETTINGS_CONSTANTS.VALIDATION.URL_PATTERN.test(value);
}

/**
 * Filter settings by search query
 */
export function filterSettingsBySearch(
  settings: AppThemeSetting[],
  searchQuery: string
): AppThemeSetting[] {
  const query = searchQuery.toLowerCase();
  return settings.filter(
    (setting) =>
      setting.key.toLowerCase().includes(query) ||
      setting.category.toLowerCase().includes(query) ||
      (setting.description && setting.description.toLowerCase().includes(query))
  );
}
