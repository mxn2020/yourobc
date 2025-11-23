// convex/schema/system/email/validators.ts
// Consolidated validators for all email module components

import { v } from 'convex/values';

// ============================================================================
// Email Validators
// ============================================================================

export const emailValidators = {
  provider: v.union(
    v.literal('resend'),
    v.literal('sendgrid'),
    v.literal('ses'),
    v.literal('postmark'),
    v.literal('mailgun')
  ),

  testStatus: v.union(
    v.literal('success'),
    v.literal('failed')
  ),

  status: v.union(
    v.literal('active'),
    v.literal('inactive'),
    v.literal('archived')
  ),

  deliveryStatus: v.union(
    v.literal('pending'),
    v.literal('sent'),
    v.literal('delivered'),
    v.literal('failed'),
    v.literal('bounced')
  ),

  variableType: v.union(
    v.literal('string'),
    v.literal('number'),
    v.literal('boolean'),
    v.literal('date')
  ),
} as const;

// ============================================================================
// Email Fields (Complex Object Validators)
// ============================================================================

export const emailFields = {
  // Email content preview (for logs and debugging)
  contentPreview: v.object({
    htmlPreview: v.optional(v.string()),
    textPreview: v.optional(v.string()),
  }),

  // Template variable definition
  templateVariable: v.object({
    name: v.string(),
    type: emailValidators.variableType,
    required: v.boolean(),
    defaultValue: v.optional(v.string()),
    description: v.optional(v.string()),
  }),

  // Provider configuration object
  providerConfig: v.object({
    apiKey: v.optional(v.string()),
    apiSecret: v.optional(v.string()),
    domain: v.optional(v.string()),
    region: v.optional(v.string()),
    fromEmail: v.string(),
    fromName: v.string(),
    replyToEmail: v.optional(v.string()),
    additionalSettings: v.optional(v.any()),
  }),

  // Email template settings
  templateSettings: v.object({
    allowHtmlOnly: v.optional(v.boolean()),
    requireApproval: v.optional(v.boolean()),
  }),

  // Email config settings
  configSettings: v.object({
    enableLogging: v.optional(v.boolean()),
    rateLimitPerHour: v.optional(v.number()),
    maxRetries: v.optional(v.number()),
  }),

  // Email logs metadata (for operational tracking)
  logMetadata: v.object({
    source: v.optional(v.union(
      v.literal('system'),
      v.literal('user'),
      v.literal('webhook')
    )),
    operation: v.optional(v.string()),
    providerLatencyMs: v.optional(v.number()),
    retryCount: v.optional(v.number()),
    webhookId: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  }),

  // Email template metadata (for template versioning/testing)
  templateMetadata: v.object({
    version: v.optional(v.string()),
    author: v.optional(v.string()),
    lastTestedAt: v.optional(v.number()),
    testResults: v.optional(v.array(v.object({
      date: v.number(),
      success: v.boolean(),
      notes: v.optional(v.string()),
    }))),
    deprecationDate: v.optional(v.number()),
  }),

  // Email config metadata (for provider-specific settings)
  configMetadata: v.object({
    setupCompletedAt: v.optional(v.number()),
    setupCompletedBy: v.optional(v.string()),
    lastRotatedAt: v.optional(v.number()),
    rotationSchedule: v.optional(v.string()),
    complianceNotes: v.optional(v.string()),
  }),
} as const;

