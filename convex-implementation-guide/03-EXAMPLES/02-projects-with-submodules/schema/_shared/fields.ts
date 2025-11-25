// convex/schema/software/freelancer_dashboard/projects/_shared/fields.ts
// Shared complex field definitions

import { v } from 'convex/values';
import { baseValidators } from '@/schema/base.validators';

/**
 * Additional shared fields that are more complex
 */
export const sharedComplexFields = {
  /**
   * Attachment metadata
   */
  attachment: v.object({
    fileId: v.string(),
    fileName: v.string(),
    fileSize: v.number(),
    mimeType: v.string(),
    uploadedAt: v.number(),
    uploadedBy: v.id('userProfiles'),
  }),

  /**
   * Comment structure (used across all entities)
   */
  comment: v.object({
    userId: v.id('userProfiles'),
    content: v.string(),
    createdAt: v.number(),
    edited: v.optional(v.boolean()),
  }),
} as const;
