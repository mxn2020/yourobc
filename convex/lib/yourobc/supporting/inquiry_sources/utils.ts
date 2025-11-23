// convex/lib/yourobc/supporting/inquiry_sources/utils.ts
// Validation + helpers for inquiry sources module

import { INQUIRY_SOURCES_CONSTANTS } from './constants';
import type { CreateInquirySourceData, UpdateInquirySourceData } from './types';

/**
 * Trim all string fields in inquiry source data
 * Generic typing ensures type safety without `any`
 */
export function trimInquirySourceData<
  T extends Partial<CreateInquirySourceData | UpdateInquirySourceData>
>(data: T): T {
  // Clone to avoid mutating caller data
  const trimmed: T = { ...data };

  if (typeof trimmed.name === "string") {
    trimmed.name = trimmed.name.trim() as T["name"];
  }

  if (typeof trimmed.code === "string") {
    trimmed.code = trimmed.code.trim() as T["code"];
  }

  if (typeof trimmed.description === "string") {
    trimmed.description = trimmed.description.trim() as T["description"];
  }

  return trimmed;
}

/**
 * Validate inquiry source data
 * Returns array of error messages
 */
export function validateInquirySourceData(
  data: Partial<CreateInquirySourceData | UpdateInquirySourceData>
): string[] {
  const errors: string[] = [];

  // Validate name
  if (data.name !== undefined) {
    if (typeof data.name !== "string") {
      errors.push("Name must be a string");
    } else {
      const name = data.name.trim();
      if (!name) {
        errors.push("Inquiry source name is required");
      }
    }
  }

  // Validate code
  if (data.code !== undefined && data.code) {
    if (typeof data.code !== "string") {
      errors.push("Code must be a string");
    } else {
      if (!INQUIRY_SOURCES_CONSTANTS.VALIDATION.CODE_PATTERN.test(data.code)) {
        errors.push(
          "Inquiry source code must contain only uppercase letters, numbers, and underscores"
        );
      }
    }
  }

  // Validate description
  if (data.description !== undefined && typeof data.description !== "string") {
    errors.push("Description must be a string");
  }

  return errors;
}

/**
 * Generate source code from name
 */
export function generateInquirySourceCode(name: string): string {
  return name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 20);
}
