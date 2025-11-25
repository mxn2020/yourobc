// convex/schema/system/supporting/inquirySources.ts
/**
 * Inquiry Sources Table Schema
 *
 * Tracks sources of customer inquiries (website, referral, partner, etc.).
 * Used for marketing analytics and lead tracking.
 *
 * @module convex/schema/system/supporting/inquirySources
 */

import { defineTable } from 'convex/server'
import { v } from 'convex/values'
import { supportingValidators, supportingFields } from '../validators'
import { auditFields, softDeleteFields } from '@/schema/base';

/**
 * Inquiry sources table
 * Tracks sources of customer inquiries (website, referral, partner, etc.)
 */
export const inquirySourcesTable = defineTable({
  // Required fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'),

  // Core fields
  name: v.string(),
  code: v.optional(v.string()),
  type: supportingValidators.inquirySourceType,
  description: v.optional(v.string()),
  isActive: v.boolean(),

  // Audit & Soft Delete
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_public_id', ['publicId'])
  .index('by_owner_id', ['ownerId'])
  .index('by_name', ['name'])
  .index('by_type', ['type'])
  .index('by_active', ['isActive'])
  .index('by_deleted_at', ['deletedAt'])
  .index('by_created_at', ['createdAt'])
