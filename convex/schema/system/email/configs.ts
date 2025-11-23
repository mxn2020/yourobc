// convex/schema/system/email/configs.ts
// Table definitions for email configs

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields } from '@/schema/base';
import { emailValidators, emailFields } from './validators';

export const emailConfigsTable = defineTable({
  // Required: Main display field
  name: v.string(),

  // Required: Core fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'),

  // Module-specific fields
  provider: emailValidators.provider,
  isActive: v.boolean(), // Only one config can be active at a time
  status: emailValidators.status,

  // Provider-specific configuration (encrypted sensitive data)
  config: emailFields.providerConfig,

  // Connection status
  isVerified: v.boolean(), // Has the connection been tested
  lastTestAt: v.optional(v.number()),
  lastTestStatus: v.optional(emailValidators.testStatus),
  lastTestError: v.optional(v.string()),

  // Settings (flexible configuration)
  settings: v.optional(emailFields.configSettings),

  // Metadata (typed provider-specific settings)
  metadata: v.optional(emailFields.configMetadata),

  // Audit fields
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_name', ['name'])
  .index('by_owner_id', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_provider', ['provider'])
  .index('by_active', ['isActive'])
  .index('by_status', ['status'])
  .index('by_created_at', ['createdAt'])
  .index('by_last_activity', ['lastActivityAt'])
  .index('by_owner_and_status', ['ownerId', 'status']);
