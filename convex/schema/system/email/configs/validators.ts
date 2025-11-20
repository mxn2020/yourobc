// convex/schema/boilerplate/email/configs/validators.ts
// Grouped validators for email configs module

import { v } from 'convex/values';

export const emailConfigsValidators = {
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
} as const;
