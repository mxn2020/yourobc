// convex/schema/system/email/templates/templates.ts
// Table definitions for email templates module

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields } from '@/schema/base';
import { emailTemplatesValidators } from './validators';

export const emailTemplatesTable = defineTable({
  // Required: Main display field
  name: v.string(),

  // Required: Core fields
  publicId: v.string(),
  ownerId: v.id('userProfiles'),

  // Module-specific fields
  slug: v.string(), // Unique identifier like 'welcome-email', 'password-reset'
  description: v.optional(v.string()),
  status: emailTemplatesValidators.status,

  // Template content
  subject: v.string(), // Can include variables like {{userName}}
  htmlTemplate: v.string(), // HTML version
  textTemplate: v.optional(v.string()), // Plain text version

  // React Email component path (if using React Email)
  reactComponentPath: v.optional(v.string()),

  // Template variables
  variables: v.array(v.object({
    name: v.string(),
    type: emailTemplatesValidators.variableType,
    required: v.boolean(),
    defaultValue: v.optional(v.string()),
    description: v.optional(v.string()),
  })),

  // Preview data for testing
  previewData: v.optional(v.any()),

  // Status and categorization
  isActive: v.boolean(),
  category: v.optional(v.string()), // e.g., 'auth', 'crm', 'notifications'

  // Settings (flexible configuration)
  settings: v.optional(v.object({
    allowHtmlOnly: v.optional(v.boolean()),
    requireApproval: v.optional(v.boolean()),
  })),

  // Usage stats
  timesUsed: v.optional(v.number()),
  lastUsedAt: v.optional(v.number()),

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
  .index('by_slug', ['slug'])
  .index('by_category', ['category'])
  .index('by_active', ['isActive'])
  .index('by_status', ['status'])
  .index('by_created_at', ['createdAt'])
  .index('by_last_activity', ['lastActivityAt'])
  .index('by_owner_and_status', ['ownerId', 'status']);
