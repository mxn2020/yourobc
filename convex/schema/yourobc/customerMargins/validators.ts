// convex/schema/yourobc/customerMargins/validators.ts
// Grouped validators for customerMargins module

import { v } from 'convex/values';

export const customerMarginsValidators = {
  status: v.union(
    v.literal('draft'),
    v.literal('active'),
    v.literal('pending_approval'),
    v.literal('expired'),
    v.literal('archived')
  ),

  serviceType: v.union(
    v.literal('standard'),
    v.literal('express'),
    v.literal('overnight'),
    v.literal('international'),
    v.literal('freight'),
    v.literal('custom')
  ),

  marginType: v.union(
    v.literal('percentage'),
    v.literal('fixed'),
    v.literal('tiered'),
    v.literal('volume_based')
  ),

  approvalStatus: v.union(
    v.literal('pending'),
    v.literal('approved'),
    v.literal('rejected'),
    v.literal('revision_requested')
  ),
} as const;
