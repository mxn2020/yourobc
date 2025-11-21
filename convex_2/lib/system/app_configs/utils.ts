// convex/lib/system/app_configs/utils.ts
// Utility functions for appConfigs module

import { APP_CONFIGS_CONSTANTS } from './constants';
import type {
  CreateAppConfigData,
  UpdateAppConfigData,
  ConfigValidationRules,
} from './types';

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validate app config data for creation/update
 */
export function validateAppConfigData(
  data: Partial<CreateAppConfigData | UpdateAppConfigData>
): string[] {
  const errors: string[] = [];

  // Validate feature
  if ('feature' in data && data.feature !== undefined) {
    const trimmed = data.feature.trim();
    if (!trimmed) {
      errors.push('Feature is required');
    } else if (trimmed.length < APP_CONFIGS_CONSTANTS.LIMITS.MIN_FEATURE_LENGTH) {
      errors.push(
        `Feature must be at least ${APP_CONFIGS_CONSTANTS.LIMITS.MIN_FEATURE_LENGTH} characters`
      );
    } else if (trimmed.length > APP_CONFIGS_CONSTANTS.LIMITS.MAX_FEATURE_LENGTH) {
      errors.push(
        `Feature must be at most ${APP_CONFIGS_CONSTANTS.LIMITS.MAX_FEATURE_LENGTH} characters`
      );
    } else if (!APP_CONFIGS_CONSTANTS.VALIDATION.FEATURE_PATTERN.test(trimmed)) {
      errors.push('Feature contains invalid characters');
    }
  }

  // Validate featureKey
  if ('featureKey' in data && data.featureKey !== undefined) {
    const trimmed = data.featureKey.trim();
    if (!trimmed) {
      errors.push('Feature key is required');
    } else if (trimmed.length < APP_CONFIGS_CONSTANTS.LIMITS.MIN_FEATURE_KEY_LENGTH) {
      errors.push(
        `Feature key must be at least ${APP_CONFIGS_CONSTANTS.LIMITS.MIN_FEATURE_KEY_LENGTH} characters`
      );
    } else if (trimmed.length > APP_CONFIGS_CONSTANTS.LIMITS.MAX_FEATURE_KEY_LENGTH) {
      errors.push(
        `Feature key must be at most ${APP_CONFIGS_CONSTANTS.LIMITS.MAX_FEATURE_KEY_LENGTH} characters`
      );
    } else if (!APP_CONFIGS_CONSTANTS.VALIDATION.FEATURE_KEY_PATTERN.test(trimmed)) {
      errors.push('Feature key contains invalid characters');
    }
  }

  // Validate key
  if ('key' in data && data.key !== undefined) {
    const trimmed = data.key.trim();
    if (!trimmed) {
      errors.push('Key is required');
    } else if (trimmed.length < APP_CONFIGS_CONSTANTS.LIMITS.MIN_KEY_LENGTH) {
      errors.push(
        `Key must be at least ${APP_CONFIGS_CONSTANTS.LIMITS.MIN_KEY_LENGTH} characters`
      );
    } else if (trimmed.length > APP_CONFIGS_CONSTANTS.LIMITS.MAX_KEY_LENGTH) {
      errors.push(
        `Key must be at most ${APP_CONFIGS_CONSTANTS.LIMITS.MAX_KEY_LENGTH} characters`
      );
    } else if (!APP_CONFIGS_CONSTANTS.VALIDATION.KEY_PATTERN.test(trimmed)) {
      errors.push('Key contains invalid characters (use only alphanumeric, dots, underscores, hyphens)');
    }
  }

  // Validate description
  if ('description' in data && data.description !== undefined && data.description !== null) {
    if (data.description.length > APP_CONFIGS_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH) {
      errors.push(
        `Description must be at most ${APP_CONFIGS_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH} characters`
      );
    }
  }

  // Validate value based on valueType
  if ('value' in data && 'valueType' in data && data.valueType !== undefined) {
    const valueErrors = validateValueByType(data.value, data.valueType as string);
    errors.push(...valueErrors);
  }

  // Validate against validation rules
  if ('value' in data && 'validationRules' in data && data.validationRules !== undefined) {
    const ruleErrors = validateAgainstRules(data.value, data.validationRules);
    errors.push(...ruleErrors);
  }

  return errors;
}

/**
 * Validate config value based on type
 */
export function validateValueByType(value: any, valueType: string): string[] {
  const errors: string[] = [];

  switch (valueType) {
    case APP_CONFIGS_CONSTANTS.VALUE_TYPES.STRING:
      if (typeof value !== 'string') {
        errors.push('Value must be a string');
      } else if (value.length > APP_CONFIGS_CONSTANTS.LIMITS.MAX_STRING_VALUE_LENGTH) {
        errors.push(
          `String value must be at most ${APP_CONFIGS_CONSTANTS.LIMITS.MAX_STRING_VALUE_LENGTH} characters`
        );
      }
      break;

    case APP_CONFIGS_CONSTANTS.VALUE_TYPES.NUMBER:
      if (typeof value !== 'number') {
        errors.push('Value must be a number');
      } else if (isNaN(value)) {
        errors.push('Value must be a valid number');
      } else if (value < APP_CONFIGS_CONSTANTS.LIMITS.MIN_NUMBER_VALUE) {
        errors.push(`Number must be at least ${APP_CONFIGS_CONSTANTS.LIMITS.MIN_NUMBER_VALUE}`);
      } else if (value > APP_CONFIGS_CONSTANTS.LIMITS.MAX_NUMBER_VALUE) {
        errors.push(`Number must be at most ${APP_CONFIGS_CONSTANTS.LIMITS.MAX_NUMBER_VALUE}`);
      }
      break;

    case APP_CONFIGS_CONSTANTS.VALUE_TYPES.BOOLEAN:
      if (typeof value !== 'boolean') {
        errors.push('Value must be a boolean');
      }
      break;

    case APP_CONFIGS_CONSTANTS.VALUE_TYPES.OBJECT:
      if (typeof value !== 'object' || Array.isArray(value) || value === null) {
        errors.push('Value must be an object');
      } else {
        const depth = getObjectDepth(value);
        if (depth > APP_CONFIGS_CONSTANTS.LIMITS.MAX_OBJECT_DEPTH) {
          errors.push(
            `Object nesting depth must be at most ${APP_CONFIGS_CONSTANTS.LIMITS.MAX_OBJECT_DEPTH}`
          );
        }
      }
      break;

    case APP_CONFIGS_CONSTANTS.VALUE_TYPES.ARRAY:
      if (!Array.isArray(value)) {
        errors.push('Value must be an array');
      } else if (value.length > APP_CONFIGS_CONSTANTS.LIMITS.MAX_ARRAY_LENGTH) {
        errors.push(`Array length must be at most ${APP_CONFIGS_CONSTANTS.LIMITS.MAX_ARRAY_LENGTH}`);
      }
      break;

    default:
      errors.push('Invalid value type');
  }

  return errors;
}

/**
 * Validate config value against validation rules
 */
export function validateAgainstRules(value: any, rules?: ConfigValidationRules): string[] {
  const errors: string[] = [];

  if (!rules) return errors;

  // Required check
  if (rules.required && (value === undefined || value === null || value === '')) {
    errors.push('Value is required');
    return errors; // Early return if required check fails
  }

  // Skip further validation if value is empty and not required
  if (value === undefined || value === null) {
    return errors;
  }

  // Min/max for numbers
  if (typeof value === 'number') {
    if (rules.min !== undefined && value < rules.min) {
      errors.push(`Value must be at least ${rules.min}`);
    }
    if (rules.max !== undefined && value > rules.max) {
      errors.push(`Value must be at most ${rules.max}`);
    }
  }

  // Min/max for strings (length)
  if (typeof value === 'string') {
    if (rules.min !== undefined && value.length < rules.min) {
      errors.push(`Value length must be at least ${rules.min} characters`);
    }
    if (rules.max !== undefined && value.length > rules.max) {
      errors.push(`Value length must be at most ${rules.max} characters`);
    }
  }

  // Pattern for strings
  if (typeof value === 'string' && rules.pattern) {
    try {
      const regex = new RegExp(rules.pattern);
      if (!regex.test(value)) {
        errors.push('Value does not match required pattern');
      }
    } catch (e) {
      errors.push('Invalid validation pattern');
    }
  }

  // Allowed values check
  if (rules.allowedValues && rules.allowedValues.length > 0) {
    if (!rules.allowedValues.includes(value)) {
      errors.push(`Value must be one of: ${rules.allowedValues.join(', ')}`);
    }
  }

  return errors;
}

// ============================================================================
// Helper Utilities
// ============================================================================

/**
 * Check if value differs from default
 */
export function isValueOverridden(value: any, defaultValue: any): boolean {
  return JSON.stringify(value) !== JSON.stringify(defaultValue);
}

/**
 * Get the maximum nesting depth of an object
 */
export function getObjectDepth(obj: any): number {
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    return 0;
  }

  let maxDepth = 0;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const depth = getObjectDepth(obj[key]);
      maxDepth = Math.max(maxDepth, depth);
    }
  }

  return maxDepth + 1;
}

/**
 * Format config key for display
 */
export function formatConfigKey(feature: string, featureKey: string, key: string): string {
  return `${feature}.${featureKey}.${key}`;
}

/**
 * Check if config is editable
 */
export function isConfigEditable(config: { isEditable?: boolean; scope: string }): boolean {
  // Global scope configs might have stricter edit rules
  if (config.scope === APP_CONFIGS_CONSTANTS.SCOPES.GLOBAL && !config.isEditable) {
    return false;
  }

  return config.isEditable !== false;
}

/**
 * Get config display name
 */
export function getConfigDisplayName(config: {
  key: string;
  description?: string;
  feature: string;
}): string {
  return config.description || config.key || 'Unnamed Config';
}
