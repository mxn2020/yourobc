// convex/lib/system/system/appConfigs/utils.ts
// Validation functions and utility helpers for appConfigs module

import { APP_CONFIGS_CONSTANTS } from './constants';
import type { CreateAppConfigData, UpdateAppConfigData } from './types';

/**
 * Validate appConfig data for creation/update
 */
export function validateAppConfigData(
  data: Partial<CreateAppConfigData | UpdateAppConfigData>
): string[] {
  const errors: string[] = [];

  // Validate name (main display field)
  if (data.name !== undefined) {
    const trimmed = data.name.trim();

    if (!trimmed) {
      errors.push('Name is required');
    } else if (trimmed.length < APP_CONFIGS_CONSTANTS.LIMITS.MIN_NAME_LENGTH) {
      errors.push(`Name must be at least ${APP_CONFIGS_CONSTANTS.LIMITS.MIN_NAME_LENGTH} characters`);
    } else if (trimmed.length > APP_CONFIGS_CONSTANTS.LIMITS.MAX_NAME_LENGTH) {
      errors.push(`Name cannot exceed ${APP_CONFIGS_CONSTANTS.LIMITS.MAX_NAME_LENGTH} characters`);
    } else if (!APP_CONFIGS_CONSTANTS.VALIDATION.NAME_PATTERN.test(trimmed)) {
      errors.push('Name contains invalid characters');
    }
  }

  // Validate feature
  if ('feature' in data && data.feature !== undefined) {
    const trimmed = data.feature.trim();

    if (!trimmed) {
      errors.push('Feature is required');
    } else if (trimmed.length > APP_CONFIGS_CONSTANTS.LIMITS.MAX_FEATURE_LENGTH) {
      errors.push(`Feature cannot exceed ${APP_CONFIGS_CONSTANTS.LIMITS.MAX_FEATURE_LENGTH} characters`);
    } else if (!APP_CONFIGS_CONSTANTS.VALIDATION.FEATURE_PATTERN.test(trimmed)) {
      errors.push('Feature contains invalid characters (use alphanumeric, dash, underscore only)');
    }
  }

  // Validate key
  if ('key' in data && data.key !== undefined) {
    const trimmed = data.key.trim();

    if (!trimmed) {
      errors.push('Key is required');
    } else if (trimmed.length > APP_CONFIGS_CONSTANTS.LIMITS.MAX_KEY_LENGTH) {
      errors.push(`Key cannot exceed ${APP_CONFIGS_CONSTANTS.LIMITS.MAX_KEY_LENGTH} characters`);
    } else if (!APP_CONFIGS_CONSTANTS.VALIDATION.KEY_PATTERN.test(trimmed)) {
      errors.push('Key contains invalid characters (use alphanumeric, dash, underscore, dot only)');
    }
  }

  // Validate description
  if (data.description !== undefined && data.description.trim()) {
    const trimmed = data.description.trim();
    if (trimmed.length > APP_CONFIGS_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH) {
      errors.push(`Description cannot exceed ${APP_CONFIGS_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH} characters`);
    }
  }

  // Validate value type matches actual value
  if ('value' in data && 'valueType' in data && data.value !== undefined && data.valueType !== undefined) {
    const actualType = Array.isArray(data.value) ? 'array' : typeof data.value;
    if (actualType !== data.valueType && !(actualType === 'object' && data.valueType === 'object')) {
      errors.push(`Value type mismatch: expected ${data.valueType}, got ${actualType}`);
    }
  }

  return errors;
}

/**
 * Format appConfig display name
 */
export function formatAppConfigDisplayName(config: { name: string; feature: string }): string {
  return `${config.feature}: ${config.name}`;
}

/**
 * Generate config name from feature and key
 */
export function generateConfigName(feature: string, key: string): string {
  return `${feature}.${key}`;
}

/**
 * Check if config is editable by non-admins
 */
export function isAppConfigEditable(config: { isEditable: boolean; scope: string }): boolean {
  return config.isEditable && config.scope !== 'global';
}

/**
 * Validate config value against validation rules
 */
export function validateConfigValue(value: any, rules?: {
  min?: number;
  max?: number;
  pattern?: string;
  enum?: any[];
  required?: boolean;
}): string[] {
  const errors: string[] = [];

  if (!rules) return errors;

  // Required check
  if (rules.required && (value === undefined || value === null || value === '')) {
    errors.push('Value is required');
    return errors;
  }

  // Skip other validations if value is empty and not required
  if (value === undefined || value === null || value === '') {
    return errors;
  }

  // Numeric validations
  if (typeof value === 'number') {
    if (rules.min !== undefined && value < rules.min) {
      errors.push(`Value must be at least ${rules.min}`);
    }
    if (rules.max !== undefined && value > rules.max) {
      errors.push(`Value cannot exceed ${rules.max}`);
    }
  }

  // String validations
  if (typeof value === 'string') {
    if (rules.pattern) {
      const regex = new RegExp(rules.pattern);
      if (!regex.test(value)) {
        errors.push(`Value does not match required pattern`);
      }
    }
  }

  // Enum validation
  if (rules.enum && rules.enum.length > 0) {
    if (!rules.enum.includes(value)) {
      errors.push(`Value must be one of: ${rules.enum.join(', ')}`);
    }
  }

  return errors;
}
