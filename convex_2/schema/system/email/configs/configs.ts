// convex/schema/system/email/configs/configs.ts
// Table definitions for email configs module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields } from '@/schema/base';
import { emailConfigsValidators } from './validators';

export const emailConfigsTable = defineTable({
  // Required: Main display field
  name: v.string(),

  // Required: Core fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'),

  // Module-specific fields
  provider: emailConfigsValidators.provider,
  isActive: v.boolean(), // Only one config can be active at a time
  status: emailConfigsValidators.status,

  // Provider-specific configuration (encrypted sensitive data)
  config: v.object({
    apiKey: v.optional(v.string()), // For most providers
    apiSecret: v.optional(v.string()), // For providers needing secret
    domain: v.optional(v.string()), // For Mailgun, SES
    region: v.optional(v.string()), // For AWS SES
    fromEmail: v.string(), // Default sender email
    fromName: v.string(), // Default sender name
    replyToEmail: v.optional(v.string()),

    // Additional provider-specific settings
    additionalSettings: v.optional(v.any()),
  }),

  // Connection status
  isVerified: v.boolean(), // Has the connection been tested
  lastTestAt: v.optional(v.number()),
  lastTestStatus: v.optional(emailConfigsValidators.testStatus),
  lastTestError: v.optional(v.string()),

  // Settings (flexible configuration)
  settings: v.optional(v.object({
    enableLogging: v.optional(v.boolean()),
    rateLimitPerHour: v.optional(v.number()),
    maxRetries: v.optional(v.number()),
  })),

  // Activity tracking
  lastActivityAt: v.number(),

  // Audit fields
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_name', ['name'])
  .index('by_owner', ['ownerId'])
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_provider', ['provider'])
  .index('by_active', ['isActive'])
  .index('by_status', ['status'])
  .index('by_created_at', ['createdAt'])
  .index('by_last_activity', ['lastActivityAt'])
  .index('by_owner_and_status', ['ownerId', 'status']);
