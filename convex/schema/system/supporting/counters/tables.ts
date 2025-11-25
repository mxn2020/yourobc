// convex/schema/system/supporting/counters/tables.ts
// Table definitions for counters

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields } from '@/schema/base';
import { countersValidators } from './validators';

export const countersTable = defineTable({
  // Required: Main display field
  name: v.string(),

  // Required: Core fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'),

  // Counter specifics
  type: countersValidators.counterType,
  prefix: v.optional(v.string()),
  suffix: v.optional(v.string()),
  currentValue: v.number(),
  step: v.optional(v.number()),
  minValue: v.optional(v.number()),
  maxValue: v.optional(v.number()),

  // Formatting
  padLength: v.optional(v.number()),
  format: v.optional(v.string()),

  // Audit fields
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_public_id', ['publicId'])
  .index('by_name', ['name'])
  .index('by_type', ['type'])
  .index('by_created_at', ['createdAt']);
