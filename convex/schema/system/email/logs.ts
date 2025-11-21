// convex/schema/system/email/logs.ts
// Table definitions for email logs

import { defineTable } from 'convex/server';
import { v } from 'convex/values';
import { auditFields, softDeleteFields } from '@/schema/base';
import { emailValidators } from './validators';

// Email logs (track all sent emails for debugging and auditing)
export const emailLogsTable = defineTable({
  id: v.string(),
  provider: emailValidators.provider,

  // Email details
  to: v.array(v.string()), // Recipient emails
  from: v.string(),
  replyTo: v.optional(v.string()),
  subject: v.string(),

  // Content (store first 500 chars for debugging)
  htmlPreview: v.optional(v.string()),
  textPreview: v.optional(v.string()),

  // Template info (if using templates)
  templateId: v.optional(v.string()),
  templateData: v.optional(v.any()),

  // Status tracking
  status: emailValidators.status,
  messageId: v.optional(v.string()), // Provider's message ID
  error: v.optional(v.string()),

  // Provider response
  providerResponse: v.optional(v.any()),

  // Metadata
  sentAt: v.optional(v.number()),
  deliveredAt: v.optional(v.number()),
  failedAt: v.optional(v.number()),

  // Context
  triggeredBy: v.optional(v.string()), // userId or system
  context: v.optional(v.string()), // e.g., 'user_signup', 'password_reset', 'yourobc_quote'

  // Audit fields
  ...auditFields,
  ...softDeleteFields,
})
  .index('id', ['id'])
  .index('provider', ['provider'])
  .index('status', ['status'])
  .index('to', ['to'])
  .index('context', ['context'])
  .index('created', ['createdAt'])
  .index('lastActivity', ['lastActivityAt'])
  .index('messageId', ['messageId'])
