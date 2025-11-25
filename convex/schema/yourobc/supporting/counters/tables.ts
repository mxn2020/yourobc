// convex/schema/yourobc/supporting/counters/counters.ts
import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields } from '@/schema/base';
import { countersValidators } from './validators';

export const countersTable = defineTable({
  type: countersValidators.counterType,
  prefix: v.string(),
  year: v.number(),
  lastNumber: v.number(),
  ...auditFields,
  ...softDeleteFields,
})
  .index('by_type_year', ['type', 'year'])
  .index('by_deleted_at', ['deletedAt'])
  .index('by_created_at', ['createdAt']);
