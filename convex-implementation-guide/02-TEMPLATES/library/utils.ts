// convex/lib/{category}/{entity}/{module}/utils.ts
// Validation and helper functions for {module} module

import { {MODULE}_CONSTANTS } from './constants';
import type { Create{Module}Data, Update{Module}Data } from './types';

/**
 * Trim all string fields in module data
 * Generic typing ensures type safety without 'any'
 *
 * @param data - Module data to trim
 * @returns Trimmed data with same type
 */
export function trim{Module}Data<
  T extends Partial<Create{Module}Data | Update{Module}Data>
>(data: T): T {
  const trimmed: T = { ...data };

  // Trim string fields
  if (typeof trimmed.{displayField} === "string") {
    trimmed.{displayField} = trimmed.{displayField}.trim() as T["name"];
  }

  if (typeof trimmed.description === "string") {
    trimmed.description = trimmed.description.trim() as T["description"];
  }

  // Trim array of strings
  if (Array.isArray(trimmed.tags)) {
    const nextTags = trimmed.tags
      .filter((t): t is string => typeof t === "string")
      .map(t => t.trim())
      .filter(Boolean);

    trimmed.tags = nextTags as T["tags"];
  }

  // Add more field trimming as needed...

  return trimmed;
}

/**
 * Validate module data
 * Returns array of error messages
 *
 * @param data - Data to validate
 * @returns Array of validation error messages (empty if valid)
 */
export function validate{Module}Data(
  data: Partial<Create{Module}Data | Update{Module}Data>
): string[] {
  const errors: string[] = [];

  // Validate name
  if (data.{displayField} !== undefined) {
    if (typeof data.{displayField} !== "string") {
      errors.push("Name must be a string");
    } else {
      const name = data.{displayField}.trim();

      if (!name) {
        errors.push("Name is required");
      }

      if (name.length < {MODULE}_CONSTANTS.LIMITS.MIN_NAME_LENGTH) {
        errors.push(
          `Name must be at least ${{MODULE}_CONSTANTS.LIMITS.MIN_NAME_LENGTH} characters`
        );
      }

      if (name.length > {MODULE}_CONSTANTS.LIMITS.MAX_NAME_LENGTH) {
        errors.push(
          `Name cannot exceed ${{MODULE}_CONSTANTS.LIMITS.MAX_NAME_LENGTH} characters`
        );
      }
    }
  }

  // Validate description
  if (data.description !== undefined) {
    if (typeof data.description !== "string") {
      errors.push("Description must be a string");
    } else {
      const desc = data.description.trim();
      if (desc && desc.length > {MODULE}_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH) {
        errors.push(
          `Description cannot exceed ${{MODULE}_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH} characters`
        );
      }
    }
  }

  // Validate tags
  if (data.tags !== undefined) {
    if (!Array.isArray(data.tags)) {
      errors.push("Tags must be an array");
    } else {
      if (data.tags.length > {MODULE}_CONSTANTS.LIMITS.MAX_TAGS) {
        errors.push(
          `Cannot exceed ${{MODULE}_CONSTANTS.LIMITS.MAX_TAGS} tags`
        );
      }

      if (data.tags.some(t => typeof t !== "string" || !t.trim())) {
        errors.push("Tags cannot be empty");
      }
    }
  }

  // Add more validations as needed...

  return errors;
}

/**
 * Build searchable text for full-text search
 * Only include if table has searchIndex defined
 *
 * @param data - Module data
 * @returns Lowercase searchable text string
 */
export function buildSearchableText(
  data: Partial<Create{Module}Data | Update{Module}Data>
): string {
  const parts: string[] = [];

  if (data.{displayField}) parts.push(data.{displayField});
  if (data.description) parts.push(data.description);
  if (data.tags && Array.isArray(data.tags)) parts.push(...data.tags);

  // Add more searchable fields as needed...

  return parts.join(' ').toLowerCase().trim();
}

/**
 * IMPLEMENTATION CHECKLIST
 *
 * When creating utils.ts:
 * [ ] Implement trim{Module}Data with generic typing
 * [ ] Implement validate{Module}Data returning string[]
 * [ ] Implement buildSearchableText (if using search)
 * [ ] Use constants for validation limits
 * [ ] Add field-specific validations
 * [ ] Keep functions pure and reusable
 *
 * DO:
 * [ ] Use generic typing (no 'any')
 * [ ] Return validation errors as array
 * [ ] Trim before validation
 * [ ] Use constants for limits
 * [ ] Keep functions focused
 *
 * DON'T:
 * [ ] Use 'any' type
 * [ ] Throw errors (return error arrays)
 * [ ] Mix business logic with validation
 * [ ] Skip trimming step
 * [ ] Hard-code validation limits
 */
