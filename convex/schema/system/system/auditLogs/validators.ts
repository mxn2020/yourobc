// convex/schema/boilerplate/system/auditLogs/validators.ts
// Grouped validators for auditLogs module

import { v } from 'convex/values';
import { metadataSchema } from '../../../base';
import { entityTypes } from '@/lib/system/audit_logs/entityTypes';

export const auditLogsValidators = {
  // Action types - common audit actions
  action: v.string(),

  // Entity type validator
  entityType: entityTypes.all,

  // Optional entity identification
  entityId: v.optional(v.string()),
  entityTitle: v.optional(v.string()),

  // User information
  userId: v.id('userProfiles'),
  userName: v.string(),

  // Description of the action
  description: v.string(),

  // Standard metadata
  metadata: metadataSchema,
} as const;
