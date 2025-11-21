// convex/lib/system/system/appSettings/utils.ts
// Validation functions and utility helpers for appSettings module

import { APP_SETTINGS_CONSTANTS } from './constants';
import type { CreateAppSettingData, UpdateAppSettingData } from './types';

/**
 * Validate appSetting data for creation/update
 */
export function validateAppSettingData(
  data: Partial<CreateAppSettingData | UpdateAppSettingData>
): string[] {
  const errors: string[] = [];

  // Validate name
  if (data.name !== undefined) {
    const trimmed = data.name.trim();
    if (!trimmed) {
      errors.push('Name is required');
    } else if (trimmed.length < APP_SETTINGS_CONSTANTS.LIMITS.MIN_NAME_LENGTH) {
      errors.push(`Name must be at least ${APP_SETTINGS_CONSTANTS.LIMITS.MIN_NAME_LENGTH} characters`);
    } else if (trimmed.length > APP_SETTINGS_CONSTANTS.LIMITS.MAX_NAME_LENGTH) {
      errors.push(`Name cannot exceed ${APP_SETTINGS_CONSTANTS.LIMITS.MAX_NAME_LENGTH} characters`);
    } else if (!APP_SETTINGS_CONSTANTS.VALIDATION.NAME_PATTERN.test(trimmed)) {
      errors.push('Name contains invalid characters');
    }
  }

  // Validate key
  if ('key' in data && data.key !== undefined) {
    const trimmed = data.key.trim();
    if (!trimmed) {
      errors.push('Key is required');
    } else if (trimmed.length > APP_SETTINGS_CONSTANTS.LIMITS.MAX_KEY_LENGTH) {
      errors.push(`Key cannot exceed ${APP_SETTINGS_CONSTANTS.LIMITS.MAX_KEY_LENGTH} characters`);
    } else if (!APP_SETTINGS_CONSTANTS.VALIDATION.KEY_PATTERN.test(trimmed)) {
      errors.push('Key contains invalid characters');
    }
  }

  // Validate description
  if (data.description !== undefined && data.description.trim()) {
    const trimmed = data.description.trim();
    if (trimmed.length > APP_SETTINGS_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH) {
      errors.push(`Description cannot exceed ${APP_SETTINGS_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH} characters`);
    }
  }

  return errors;
}

/**
 * Format appSetting display name
 */
export function formatAppSettingDisplayName(setting: { name: string; category: string }): string {
  return `${setting.category}: ${setting.name}`;
}
