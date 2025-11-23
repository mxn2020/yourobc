// convex/schema/yourobc/supporting/inquiry_sources/inquiry_sources.ts
// Table definitions for inquiry sources module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields } from '@/schema/base';
import { inquirySourcesValidators } from './validators';

/**
 * Inquiry sources table
 * Tracks sources of customer inquiries (website, referral, partner, etc.)
 */
export const inquirySourcesTable = defineTable({
  // Core fields
  name: v.string(),
  code: v.optional(v.string()),
  type: inquirySourcesValidators.inquirySourceType,
  description: v.optional(v.string()),
  isActive: v.boolean(),

  // Audit & Soft Delete
  ...auditFields,
  ...softDeleteFields,
})
  // Standard required indexes
  .index('by_name', ['name'])
  .index('by_type', ['type'])
  .index('by_active', ['isActive'])
  .index('by_deleted_at', ['deletedAt'])
  .index('by_created_at', ['createdAt']);
