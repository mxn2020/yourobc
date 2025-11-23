// convex/schema/yourobc/customers/validators.ts
// Grouped validators for customers module

import { v } from 'convex/values';
import { userProfileIdSchema } from '@/schema/base';

export const customersValidators = {
  status: v.union(
    v.literal('active'),
    v.literal('inactive'),
    v.literal('blacklisted')
  ),
} as const;

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

  dunningMethod: v.union(
    v.literal('email'),
    v.literal('phone'),
    v.literal('letter'),
    v.literal('legal')
  ),

  contactType: v.union(
    v.literal('email'),
    v.literal('phone'),
    v.literal('meeting'),
    v.literal('video_call'),
    v.literal('chat'),
    v.literal('other')
  ),

  contactDirection: v.union(v.literal('inbound'), v.literal('outbound')),

  contactOutcome: v.union(
    v.literal('successful'),
    v.literal('pending'),
    v.literal('no_response'),
    v.literal('escalated'),
    v.literal('resolved')
  ),

  contactCategory: v.union(
    v.literal('general'),
    v.literal('support'),
    v.literal('sales'),
    v.literal('billing'),
    v.literal('complaint')
  ),

  contactPriority: v.union(
    v.literal('low'),
    v.literal('normal'),
    v.literal('high'),
    v.literal('urgent')
  ),
} as const;

export const customersFields = {
  customerStats: v.object({
    totalQuotes: v.number(),
    acceptedQuotes: v.number(),
    totalRevenue: v.number(),
    lastQuoteDate: v.optional(v.number()),
    lastShipmentDate: v.optional(v.number()),
  }),
};

export const customerMarginsFields = {
  pricingRule: v.object({
    id: v.string(),
    condition: v.string(),
    marginAdjustment: v.number(),
    description: v.optional(v.string()),
  }),

  volumeTier: v.object({
    id: v.string(),
    minVolume: v.number(),
    maxVolume: v.optional(v.number()),
    marginPercentage: v.number(),
    description: v.optional(v.string()),
  }),

  changeHistoryEntry: v.object({
    id: v.string(),
    timestamp: v.number(),
    changedBy: userProfileIdSchema,
    oldMargin: v.number(),
    newMargin: v.number(),
    reason: v.string(),
  }),

  marginsByServiceEntry: v.object({
    serviceType: customerMarginsValidators.serviceType,
    revenue: v.number(),
    margin: v.number(),
    shipmentCount: v.number(),
    averageMargin: v.number(),
    averageMarginPercentage: v.number(),
  }),

  topRoute: v.object({
    origin: v.string(),
    destination: v.string(),
    count: v.number(),
    revenue: v.number(),
    averageMargin: v.number(),
    averageMarginPercentage: v.number(),
  }),
};

