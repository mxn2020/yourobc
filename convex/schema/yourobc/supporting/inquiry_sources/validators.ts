// convex/schema/yourobc/supporting/inquiry_sources/validators.ts
// Grouped validators for inquiry sources module

import { v } from 'convex/values';
import { baseValidators } from '@/schema/base.validators';

/**
 * Simple union validators for inquiry sources
 * Used for status fields, enums, and simple type constraints
 */
export const inquirySourcesValidators = {
  inquirySourceType: baseValidators.inquirySourceType,
} as const;
