// convex/lib/yourobc/shared/index.ts
// convex/yourobc/shared/index.ts

/**
 * Shared utilities for YourOBC modules
 * This file exports all common utilities to avoid duplication
 */

// Re-export all validation utilities
export * from './validation';

// Re-export all formatting utilities
export * from './formatting';

// Re-export all generator utilities
export * from './generators';

// Re-export all calculation utilities
export * from './calculations';

// Re-export all constants
export * from './constants';

// Re-export all types
export * from './types';

// Re-export all utilities
export * from './utils';

// Additional shared utilities
export const isImageFile = (mimeType: string): boolean => {
  return mimeType.startsWith('image/');
};

export const isPdfFile = (mimeType: string): boolean => {
  return mimeType === 'application/pdf';
};

export const validateAirportCode = (code: string): boolean => {
  return /^[A-Z]{3}$/.test(code);
};

export const normalizeAirportCode = (code: string): string => {
  return code.toUpperCase().trim();
};

export const getCountryFromCode = (countryCode: string): string => {
  // This would typically use a country code library
  // For now, return the code itself
  return countryCode.toUpperCase();
};

// Color and label helper functions
export { getPriorityColor, getPriorityLabel, getServiceTypeLabel } from './utils';
