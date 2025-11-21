// convex/lib/system/system/appThemeSettings/utils.ts
// Validation functions and utility helpers for appThemeSettings module

import { APP_THEME_SETTINGS_CONSTANTS } from './constants';

export function validateAppThemeSettingData(data: any): string[] {
  const errors: string[] = [];

  if (data.name !== undefined) {
    const trimmed = data.name.trim();
    if (!trimmed) {
      errors.push('Name is required');
    } else if (trimmed.length < APP_THEME_SETTINGS_CONSTANTS.LIMITS.MIN_NAME_LENGTH) {
      errors.push(`Name must be at least ${APP_THEME_SETTINGS_CONSTANTS.LIMITS.MIN_NAME_LENGTH} characters`);
    } else if (trimmed.length > APP_THEME_SETTINGS_CONSTANTS.LIMITS.MAX_NAME_LENGTH) {
      errors.push(`Name cannot exceed ${APP_THEME_SETTINGS_CONSTANTS.LIMITS.MAX_NAME_LENGTH} characters`);
    }
  }

  return errors;
}
