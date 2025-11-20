// convex/lib/system/app_configs/utils.ts
// Utility functions for appConfigs module

import { APP_CONFIGS_CONSTANTS } from './constants';

/**
 * Validate config value based on type
 */
export function validateConfigValue(
  value: any,
  valueType: string
): { valid: boolean; error?: string } {
  switch (valueType) {
    case APP_CONFIGS_CONSTANTS.VALUE_TYPES.STRING:
      if (typeof value !== 'string') {
        return { valid: false, error: 'Value must be a string' };
      }
      break;
    case APP_CONFIGS_CONSTANTS.VALUE_TYPES.NUMBER:
      if (typeof value !== 'number') {
        return { valid: false, error: 'Value must be a number' };
      }
      break;
    case APP_CONFIGS_CONSTANTS.VALUE_TYPES.BOOLEAN:
      if (typeof value !== 'boolean') {
        return { valid: false, error: 'Value must be a boolean' };
      }
      break;
    case APP_CONFIGS_CONSTANTS.VALUE_TYPES.OBJECT:
      if (typeof value !== 'object' || Array.isArray(value) || value === null) {
        return { valid: false, error: 'Value must be an object' };
      }
      break;
    case APP_CONFIGS_CONSTANTS.VALUE_TYPES.ARRAY:
      if (!Array.isArray(value)) {
        return { valid: false, error: 'Value must be an array' };
      }
      break;
    default:
      return { valid: false, error: 'Invalid value type' };
  }

  return { valid: true };
}

/**
 * Validate config value against validation rules
 */
export function validateAgainstRules(
  value: any,
  rules?: {
    min?: number;
    max?: number;
    pattern?: string;
    enum?: any[];
    required?: boolean;
  }
): { valid: boolean; error?: string } {
  if (!rules) return { valid: true };

  // Required check
  if (rules.required && (value === undefined || value === null || value === '')) {
    return { valid: false, error: 'Value is required' };
  }

  // Min/max for numbers
  if (typeof value === 'number') {
    if (rules.min !== undefined && value < rules.min) {
      return { valid: false, error: `Value must be at least ${rules.min}` };
    }
    if (rules.max !== undefined && value > rules.max) {
      return { valid: false, error: `Value must be at most ${rules.max}` };
    }
  }

  // Pattern for strings
  if (typeof value === 'string' && rules.pattern) {
    const regex = new RegExp(rules.pattern);
    if (!regex.test(value)) {
      return { valid: false, error: 'Value does not match required pattern' };
    }
  }

  // Enum check
  if (rules.enum && rules.enum.length > 0) {
    if (!rules.enum.includes(value)) {
      return { valid: false, error: 'Value must be one of the allowed values' };
    }
  }

  return { valid: true };
}

/**
 * Check if value differs from default
 */
export function isValueOverridden(value: any, defaultValue: any): boolean {
  return JSON.stringify(value) !== JSON.stringify(defaultValue);
}
