// convex/lib/boilerplate/app_theme_settings/utils.ts
// Utility functions for appThemeSettings module

import { APP_THEME_SETTINGS_CONSTANTS } from './constants';

/**
 * Validate theme setting key
 */
export function isValidThemeKey(key: string): boolean {
  return key.length > 0 && key.length <= 100;
}

/**
 * Validate theme setting category
 */
export function isValidThemeCategory(category: string): boolean {
  const validCategories = Object.values(APP_THEME_SETTINGS_CONSTANTS.CATEGORIES);
  return validCategories.includes(category as any);
}

/**
 * Validate theme setting value
 */
export function validateThemeValue(value: any): { valid: boolean; error?: string } {
  if (value === undefined || value === null) {
    return { valid: false, error: 'Value cannot be null or undefined' };
  }

  return { valid: true };
}
