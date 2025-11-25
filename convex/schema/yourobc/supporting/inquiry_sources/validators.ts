// convex/schema/yourobc/supporting/inquiry_sources/validators.ts
// Grouped validators for inquiry sources module

import { v } from 'convex/values';
import { baseValidators } from '@/schema/base.validators';

/**
 * Simple union validators for inquiry sources
 * Used for status fields, enums, and simple type constraints
 */
export const inquirySourcesValidators = {
    sourceType: v.union(
    v.literal('website'),
    v.literal('email'),
    v.literal('phone'),
    v.literal('referral'),
    v.literal('social_media'),
    v.literal('advertisement'),
    v.literal('other')
  ),
} as const;
