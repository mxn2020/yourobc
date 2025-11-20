// convex/lib/yourobc/supporting/inquiry_sources/utils.ts
// convex/yourobc/supporting/inquirySources/utils.ts
import { INQUIRY_SOURCE_CONSTANTS } from './constants';
import type { CreateInquirySourceData } from './types';

export function validateInquirySourceData(data: Partial<CreateInquirySourceData>): string[] {
  const errors: string[] = [];

  if (data.name !== undefined) {
    if (!data.name.trim()) {
      errors.push('Name is required');
    } else if (data.name.length > INQUIRY_SOURCE_CONSTANTS.LIMITS.MAX_NAME_LENGTH) {
      errors.push(`Name must be less than ${INQUIRY_SOURCE_CONSTANTS.LIMITS.MAX_NAME_LENGTH} characters`);
    }
  }

  if (data.code && data.code.length > INQUIRY_SOURCE_CONSTANTS.LIMITS.MAX_CODE_LENGTH) {
    errors.push(`Code must be less than ${INQUIRY_SOURCE_CONSTANTS.LIMITS.MAX_CODE_LENGTH} characters`);
  }

  if (data.description && data.description.length > INQUIRY_SOURCE_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH) {
    errors.push(`Description must be less than ${INQUIRY_SOURCE_CONSTANTS.LIMITS.MAX_DESCRIPTION_LENGTH} characters`);
  }

  return errors;
}

export function generateSourceCode(name: string): string {
  return name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 8)
    .padEnd(3, 'X');
}

