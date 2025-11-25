import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields } from '@/schema/base';
import { inquirySourcesValidators } from './validators';

export const inquirySourcesTable = defineTable({
  name: v.string(),
  publicId: v.string(),
  ownerId: v.id('userProfiles'),
  type: inquirySourcesValidators.sourceType,
  description: v.optional(v.string()),
  isActive: v.optional(v.boolean()),
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_public_id', ['publicId'])
  .index('by_name', ['name'])
  .index('by_type', ['type'])
  .index('by_created_at', ['createdAt']);
