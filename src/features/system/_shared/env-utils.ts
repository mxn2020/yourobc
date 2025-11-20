// src/features/system/_shared/env-utils.ts
/**
 * Environment Utilities
 *
 * Safe environment variable access that works in both:
 * - Browser/Vite (import.meta.env)
 * - Node.js/Convex (process.env)
 */

/**
 * Get environment variable value
 * Note: In Convex environment, this uses process.env
 * For Vite/browser access, use import.meta.env directly in your components
 */
export function getEnv(key: string): string | undefined {
  // Use process.env for server-side (Convex/Node.js)
  // This is safe because Convex runs in Node.js environment
  // @ts-ignore - process is available in Node.js/Convex environment
  if (typeof process !== 'undefined' && process?.env) {
    // @ts-ignore - process is available in Node.js/Convex environment
    return process.env[key];
  }

  return undefined;
}

/**
 * Get environment variable with default value
 */
export function getEnvWithDefault(key: string, defaultValue: string): string {
  return getEnv(key) ?? defaultValue;
}

/**
 * Check if environment variable equals a value (case-insensitive)
 */
export function envEquals(key: string, value: string): boolean {
  const envValue = getEnv(key);
  if (!envValue) return false;
  return envValue.toLowerCase() === value.toLowerCase();
}

/**
 * Check if environment variable is "true"
 */
export function envIsTrue(key: string): boolean {
  return envEquals(key, 'true');
}

/**
 * Check if environment variable is NOT "false"
 * (treats undefined/missing as true)
 */
export function envIsNotFalse(key: string): boolean {
  const value = getEnv(key);
  if (value === undefined) return true;
  return value.toLowerCase() !== 'false';
}

/**
 * Get environment variable as number
 */
export function getEnvAsNumber(key: string, defaultValue: number): number {
  const value = getEnv(key);
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Get environment variable as float
 */
export function getEnvAsFloat(key: string, defaultValue: number): number {
  const value = getEnv(key);
  if (!value) return defaultValue;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
}
