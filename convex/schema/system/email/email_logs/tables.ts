// convex/schema/system/email/logs.ts
// Table definitions for email logs

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields } from '@/schema/base';
import { emailValidators, emailFields } from './validators';

// Email logs (track all sent emails for debugging and auditing)
export const emailLogsTable = defineTable({
  // Required: Main display field
  subject: v.string(),

  // Required: Core fields
  publicId: v.string(),
  userId: v.id('userProfiles'), // The user associated with this email log (for filtering)

  // Provider info
  provider: emailValidators.provider,

  // Email details
  to: v.array(v.string()), // Recipient emails
  from: v.string(),
  replyTo: v.optional(v.string()),

  // Content (store first 500 chars for debugging)
  htmlPreview: v.optional(v.string()),
  textPreview: v.optional(v.string()),

  // Template info (if using templates)
  templateId: v.optional(v.id('emailTemplates')),
  templateData: v.optional(v.any()),

  // Status tracking
  deliveryStatus: emailValidators.deliveryStatus,
  messageId: v.optional(v.string()), // Provider's message ID
  error: v.optional(v.string()),

  // Provider response
  providerResponse: v.optional(v.any()),

  // Metadata (typed operational tracking)
  metadata: v.optional(emailFields.logMetadata),
  sentAt: v.optional(v.number()),
  deliveredAt: v.optional(v.number()),
  failedAt: v.optional(v.number()),

  // Context
  triggeredBy: v.optional(v.id('userProfiles')), // User who triggered the email
  context: v.optional(v.string()), // e.g., 'user_signup', 'password_reset', 'yourobc_quote'

  // Audit fields
  ...auditFields,
  ...softDeleteFields,
})
  // Required indexes
  .index('by_public_id', ['publicId'])
  .index('by_subject', ['subject'])
  .index('by_user_id', ['userId'])
  .index('by_deleted_at', ['deletedAt'])

  // Module-specific indexes
  .index('by_provider', ['provider'])
  .index('by_delivery_status', ['deliveryStatus'])
  .index('by_context', ['context'])
  .index('by_created_at', ['createdAt'])
  .index('by_last_activity_at', ['lastActivityAt'])
  .index('by_message_id', ['messageId'])
  .index('by_triggered_by', ['triggeredBy']);
