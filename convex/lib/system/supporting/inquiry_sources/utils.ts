// convex/lib/system/supporting/inquiry_sources/utils.ts
// Validation and helpers for system inquiry sources

import { SYSTEM_INQUIRY_SOURCES_CONSTANTS } from './constants';
import type {
  CreateSystemInquirySourceData,
  UpdateSystemInquirySourceData,
} from './types';

export function trimSystemInquirySourceData<
  T extends Partial<CreateSystemInquirySourceData | UpdateSystemInquirySourceData>
>(data: T): T {
  const trimmed: T = { ...data };

  if (typeof trimmed.name === 'string') {
    trimmed.name = trimmed.name.trim() as T['name'];
  }
  if (typeof trimmed.code === 'string') {
    trimmed.code = trimmed.code.trim().toUpperCase() as T['code'];
  }
  if (typeof trimmed.description === 'string') {
    trimmed.description = trimmed.description.trim() as T['description'];
  }

  return trimmed;
}

export function validateSystemInquirySourceData(
  data: Partial<CreateSystemInquirySourceData | UpdateSystemInquirySourceData>
): string[] {
  const errors: string[] = [];

  if (data.name !== undefined) {
    if (!data.name.trim()) {
      errors.push('Name is required');
    }
  }

  if (data.code !== undefined) {
    if (!SYSTEM_INQUIRY_SOURCES_CONSTANTS.VALIDATION.CODE_PATTERN.test(data.code)) {
      errors.push('Code must be uppercase letters/numbers/underscores');
    }
  }

  return errors;
}
