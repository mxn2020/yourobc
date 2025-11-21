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

  variableType: v.union(
    v.literal('string'),
    v.literal('number'),
    v.literal('boolean'),
    v.literal('date')
  ),
} as const;

