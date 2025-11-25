// convex/schema/yourobc/dashboard/dashboardAlertAcknowledgments.ts
// Table definitions for dashboard module

import { defineTable } from 'convex/server';

import { auditFields, softDeleteFields } from '@/schema/base';
import { dashboardFields } from './validators';

export const dashboardAlertAcknowledgmentsTable = defineTable({
  // Core fields
  ...dashboardFields.alertAcknowledgment.fields,

  // Audit fields
  ...auditFields,
  ...softDeleteFields,
})
  // Primary lookup by publicId
  .index('by_publicId', ['publicId'])

  // Lookup by owner
  .index('by_ownerId', ['ownerId'])

  // Lookup by user
  .index('by_userId', ['userId'])

  // Lookup by user and alert (for checking if a specific alert has been acknowledged)
  .index('by_userId_and_alertId', ['userId', 'alertId'])

  // Lookup by alert (for finding all users who acknowledged a specific alert)
  .index('by_alertId', ['alertId'])

  // Soft delete queries
  .index('by_deletedAt', ['deletedAt'])

  // Active records by user
  .index('by_userId_and_deletedAt', ['userId', 'deletedAt'])

  // Active records by owner
  .index('by_ownerId_and_deletedAt', ['ownerId', 'deletedAt']);
