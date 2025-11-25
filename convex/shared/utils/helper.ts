// convex/shared/utils/helper.ts
// Shared utility helper functions

/**
 * Safely trim a string value
 * Returns undefined for null/undefined values
 * Returns original value if not a string
 * Returns trimmed string otherwise
 */
export function trimString(value: string | null | undefined): string | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }
  if (typeof value !== 'string') {
    return value as any;
  }
  return value.trim();
}
